"""
FRIDAY Transcription Pipeline
Thin orchestration pipeline connecting:
Recording Reference -> Transcription Service -> Transcript Normalization -> Core Repository Handoff.
Does NOT contain LLM prompts, analysis, intent, sentiment, or outcome logic.
"""

from typing import Any, Callable, Dict, Optional, Protocol, Union
import logging

from app.services.transcription import (
    AudioUnavailableError,
    DuplicateTranscriptionError,
    RecordingNotFoundError,
    TranscriptionError,
    TranscriptionOutput,
    TranscriptionService,
    TranscriptionStatus,
)

logger = logging.getLogger("friday.ai.transcription_pipeline")


class TranscriptRepositoryProtocol(Protocol):
    """
    Protocol matching Member 2's transcript repository contract.
    Allows saving transcript results without modifying or bypassing Member 2's files.
    """
    async def save_transcript(
        self,
        recording_id: str,
        call_id: Optional[str],
        text: str,
        segments: list,
        duration: float,
        language: str,
        status: str,
        **kwargs: Any,
    ) -> Any: ...


class RecordingRepositoryProtocol(Protocol):
    """
    Protocol matching Member 2's recording repository contract.
    Used to lookup audio reference and update processing status.
    """
    async def get_by_id(self, recording_id: str) -> Optional[Any]: ...
    async def update_status(self, recording_id: str, status: str) -> Any: ...


class TranscriptionPipeline:
    """
    End-to-end transcription pipeline.
    Coordinates input retrieval, service execution, status progression,
    and handoff to the core transcript repository.
    """

    def __init__(
        self,
        service: Optional[TranscriptionService] = None,
        transcript_repository: Optional[Any] = None,
        recording_repository: Optional[Any] = None,
    ) -> None:
        self.service = service or TranscriptionService()
        self.transcript_repository = transcript_repository
        self.recording_repository = recording_repository

    async def execute(
        self,
        recording_id: str,
        audio_source: Optional[Union[bytes, str, Any]] = None,
        call_id: Optional[str] = None,
        language: Optional[str] = None,
        force_reprocess: bool = False,
        **kwargs: Any,
    ) -> TranscriptionOutput:
        """
        Executes the transcription pipeline for a recording.

        1. Validates recording metadata (if repository provided).
        2. Guards against duplicate processing unless force_reprocess is True.
        3. Updates recording status to processing (if repository provided).
        4. Calls TranscriptionService to execute transcription & normalization.
        5. Hands off structured result to Core Transcript Repository.
        6. Updates recording status to completed (or failed upon error).
        """
        # Step 1: Resolve audio source and recording metadata if repository is provided
        resolved_audio = audio_source
        eff_call_id = call_id

        if self.recording_repository:
            rec = None
            if hasattr(self.recording_repository, "get_by_id"):
                rec = await self.recording_repository.get_by_id(recording_id)
            elif hasattr(self.recording_repository, "get"):
                rec = await self.recording_repository.get(recording_id)

            if rec is None and not resolved_audio:
                raise RecordingNotFoundError(
                    f"Recording '{recording_id}' was not found in the recording repository.",
                    recording_id=recording_id,
                )

            if rec:
                # Check status idempotency
                current_status = getattr(rec, "status", None) or (
                    rec.get("status") if isinstance(rec, dict) else None
                )
                if not force_reprocess:
                    if current_status == "completed":
                        raise DuplicateTranscriptionError(
                            f"Recording '{recording_id}' is already completed.",
                            recording_id=recording_id,
                        )
                    if current_status == "processing":
                        raise DuplicateTranscriptionError(
                            f"Recording '{recording_id}' is currently processing.",
                            recording_id=recording_id,
                        )

                # Extract audio path/url from recording entity if audio_source was not explicitly passed
                if not resolved_audio:
                    resolved_audio = (
                        getattr(rec, "audio_url", None)
                        or getattr(rec, "file_path", None)
                        or getattr(rec, "url", None)
                        or getattr(rec, "path", None)
                    )
                    if isinstance(rec, dict) and not resolved_audio:
                        resolved_audio = (
                            rec.get("audio_url")
                            or rec.get("file_path")
                            or rec.get("url")
                            or rec.get("path")
                        )

                # Extract call_id if available
                if not eff_call_id:
                    eff_call_id = getattr(rec, "call_id", None) or (
                        rec.get("call_id") if isinstance(rec, dict) else None
                    )

        if not resolved_audio:
            raise AudioUnavailableError(
                f"No usable audio URL, file path, or payload for recording '{recording_id}'.",
                recording_id=recording_id,
            )

        # Step 2: Mark recording processing
        await self._safe_update_recording_status(recording_id, "processing")

        # Step 3: Execute Transcription Service
        try:
            output = await self.service.transcribe(
                audio=resolved_audio,
                recording_id=recording_id,
                call_id=eff_call_id,
                language=language,
                **kwargs,
            )
        except Exception as ex:
            await self._safe_update_recording_status(recording_id, "failed")
            logger.error("Transcription pipeline failed for recording %s: %s", recording_id, str(ex))
            raise

        # Step 4: Core Transcript Repository Handoff
        if self.transcript_repository:
            await self._handoff_to_transcript_repo(output)

        # Step 5: Mark recording completed
        await self._safe_update_recording_status(recording_id, "completed")

        return output

    async def _safe_update_recording_status(self, recording_id: str, status: str) -> None:
        """Safely updates recording status in Member 2's repository if available."""
        if not self.recording_repository:
            return
        try:
            if hasattr(self.recording_repository, "update_status"):
                await self.recording_repository.update_status(recording_id, status)
            elif hasattr(self.recording_repository, "update"):
                await self.recording_repository.update(recording_id, {"status": status})
        except Exception as e:
            logger.warning("Could not update recording %s status to %s: %s", recording_id, status, e)

    async def _handoff_to_transcript_repo(self, output: TranscriptionOutput) -> Any:
        """Hands off normalized transcript data to Member 2's transcript repository."""
        repo = self.transcript_repository
        data_dict = output.to_dict()

        if hasattr(repo, "create_transcript"):
            return await repo.create_transcript(**data_dict)
        if hasattr(repo, "save_transcript"):
            return await repo.save_transcript(**data_dict)
        if hasattr(repo, "create"):
            return await repo.create(data_dict)
        if hasattr(repo, "save"):
            return await repo.save(data_dict)

        logger.info("Transcript repository present but lacks standard save method; handoff skipped.")
        return None
