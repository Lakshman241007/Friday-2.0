"""
FRIDAY Transcription Background Worker (Phase 8).
Allows asynchronous, non-blocking execution of transcription requests
outside the request-response cycle.
Coordinates with TranscriptionPipeline, supports retryable provider errors,
and enforces idempotency across worker and repository boundaries.
"""

import asyncio
import logging
from typing import Any, Callable, Dict, Optional, Set

from app.ai.pipelines.transcription_pipeline import TranscriptionPipeline
from app.services.transcription import (
    AudioUnavailableError,
    DuplicateTranscriptionError,
    InvalidAudioError,
    InvalidSegmentError,
    InvalidTranscriptError,
    RecordingNotFoundError,
    TranscriptionError,
    TranscriptionOutput,
    TranscriptionStatus,
)
from app.workers.context import ErrorCategory, categorize_error

logger = logging.getLogger("friday.workers.transcription")


class TranscriptionWorker:
    """
    Worker coordinating background transcription jobs.
    Maintains in-memory deduplication/locks to prevent race conditions
    when duplicate worker triggers occur simultaneously.
    Supports bounded retry for retryable provider failures.
    """

    def __init__(
        self,
        pipeline: Optional[TranscriptionPipeline] = None,
        max_concurrent_jobs: int = 5,
        max_retries: int = 3,
        initial_backoff_seconds: float = 0.05,
    ) -> None:
        self.pipeline = pipeline or TranscriptionPipeline()
        self.semaphore = asyncio.Semaphore(max_concurrent_jobs)
        self.max_retries = max_retries
        self.initial_backoff = initial_backoff_seconds
        self._active_jobs: Set[str] = set()
        self._failed_jobs: Dict[str, str] = {}
        self._completed_jobs: Set[str] = set()

    def is_active(self, recording_id: str) -> bool:
        """Returns True if the recording is currently being transcribed."""
        return recording_id in self._active_jobs

    def is_completed(self, recording_id: str) -> bool:
        """Returns True if the recording was completed in this worker lifecycle."""
        return recording_id in self._completed_jobs

    async def _execute_with_retry(
        self,
        coro_fn: Callable[[], Any],
        recording_id: str,
    ) -> TranscriptionOutput:
        """
        Executes pipeline with bounded exponential backoff for retryable errors.
        Permanent errors fail immediately.
        """
        backoff = self.initial_backoff
        for attempt in range(1, self.max_retries + 1):
            try:
                return await coro_fn()
            except Exception as ex:
                err_cat = categorize_error(ex)
                logger.warning(
                    "Transcription error for recording '%s' (attempt %d/%d, category=%s): %s",
                    recording_id,
                    attempt,
                    self.max_retries,
                    err_cat.value,
                    str(ex),
                )
                if err_cat == ErrorCategory.PERMANENT or attempt == self.max_retries:
                    raise ex

                await asyncio.sleep(backoff)
                backoff *= 2.0

    async def process_recording(
        self,
        recording_id: str,
        audio_source: Optional[Any] = None,
        call_id: Optional[str] = None,
        language: Optional[str] = None,
        force: bool = False,
    ) -> Optional[TranscriptionOutput]:
        """
        Processes a recording through the transcription pipeline.
        Enforces idempotency and concurrency limits.
        """
        if not recording_id:
            raise ValueError("recording_id is required for TranscriptionWorker.")

        # Idempotency check 1: already running in worker
        if recording_id in self._active_jobs and not force:
            logger.info("transcription_skipped recording_id=%s (already active in worker)", recording_id)
            return None

        # Idempotency check 2: already completed in worker
        if recording_id in self._completed_jobs and not force:
            logger.info("transcription_skipped recording_id=%s (already completed)", recording_id)
            return None

        async with self.semaphore:
            self._active_jobs.add(recording_id)
            try:
                logger.info("transcription_started recording_id=%s call_id=%s", recording_id, call_id)
                output = await self._execute_with_retry(
                    lambda: self.pipeline.execute(
                        recording_id=recording_id,
                        audio_source=audio_source,
                        call_id=call_id,
                        language=language,
                        force_reprocess=force,
                    ),
                    recording_id=recording_id,
                )
                self._completed_jobs.add(recording_id)
                self._failed_jobs.pop(recording_id, None)
                logger.info("transcription_completed recording_id=%s duration=%.2f", recording_id, output.duration)
                return output
            except DuplicateTranscriptionError as de:
                logger.warning("Duplicate transcription detected in pipeline: %s", str(de))
                self._completed_jobs.add(recording_id)
                return None
            except Exception as e:
                err_msg = str(e)
                self._failed_jobs[recording_id] = err_msg
                logger.error("transcription_failed recording_id=%s error=%s", recording_id, err_msg)
                raise
            finally:
                self._active_jobs.discard(recording_id)

    async def dispatch_background(
        self,
        recording_id: str,
        audio_source: Optional[Any] = None,
        call_id: Optional[str] = None,
        language: Optional[str] = None,
        force: bool = False,
    ) -> asyncio.Task:
        """
        Spawns an asynchronous background task without blocking the caller.
        """
        task = asyncio.create_task(
            self.process_recording(
                recording_id=recording_id,
                audio_source=audio_source,
                call_id=call_id,
                language=language,
                force=force,
            )
        )
        return task
