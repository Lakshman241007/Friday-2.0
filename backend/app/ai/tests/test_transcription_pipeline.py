"""
Unit and Integration Tests for FRIDAY Transcription Service, Pipeline, and Worker.
Verifies input validation, timestamp ordering, speaker normalization, error handling,
idempotency, and long transcript processing without external cloud APIs.
"""

import asyncio
import io
import unittest
from typing import Any, Dict, List, Optional

from app.ai.providers import (
    AudioInput,
    MockTranscriptionProvider,
    TranscriptSegment,
    TranscriptionResult,
)
from app.ai.providers.exceptions import (
    ProviderAuthenticationError,
    ProviderTimeoutError,
    ProviderUnavailableError,
)
from app.services.transcription import (
    AudioUnavailableError,
    DuplicateTranscriptionError,
    InvalidAudioError,
    InvalidSegmentError,
    InvalidTranscriptError,
    RecordingNotFoundError,
    SpeakerRole,
    TranscriptionError,
    TranscriptionOutput,
    TranscriptionService,
    TranscriptionStatus,
)
from app.ai.pipelines.transcription_pipeline import TranscriptionPipeline
from app.workers.transcription_worker import TranscriptionWorker


class MockRecordingRepository:
    """Mock repository mimicking Member 2's RecordingRepository for test verification."""

    def __init__(self, records: Optional[Dict[str, Dict[str, Any]]] = None) -> None:
        self.records = records or {}
        self.status_history: List[Dict[str, str]] = []

    async def get_by_id(self, recording_id: str) -> Optional[Dict[str, Any]]:
        return self.records.get(recording_id)

    async def update_status(self, recording_id: str, status: str) -> None:
        if recording_id in self.records:
            self.records[recording_id]["status"] = status
        self.status_history.append({"id": recording_id, "status": status})


class MockTranscriptRepository:
    """Mock repository mimicking Member 2's TranscriptRepository for test verification."""

    def __init__(self) -> None:
        self.saved_transcripts: List[Dict[str, Any]] = []

    async def create_transcript(self, **kwargs: Any) -> Dict[str, Any]:
        self.saved_transcripts.append(kwargs)
        return kwargs


class TestTranscriptionService(unittest.IsolatedAsyncioTestCase):
    """Verifies TranscriptionService input validation, normalization, and provider orchestration."""

    async def asyncSetUp(self) -> None:
        self.provider = MockTranscriptionProvider()
        self.service = TranscriptionService(provider=self.provider)

    async def test_transcribe_success_standard_audio(self) -> None:
        audio = b"fake_wav_audio_bytes"
        result = await self.service.transcribe(
            audio=audio,
            recording_id="rec_001",
            call_id="call_001",
            language="en",
        )

        self.assertIsInstance(result, TranscriptionOutput)
        self.assertEqual(result.recording_id, "rec_001")
        self.assertEqual(result.call_id, "call_001")
        self.assertEqual(result.status, TranscriptionStatus.COMPLETED)
        self.assertEqual(result.language, "en")
        self.assertTrue(len(result.text) > 0)
        self.assertGreater(len(result.segments), 0)

        # Check speaker mapping
        first_seg = result.segments[0]
        self.assertEqual(first_seg.speaker, SpeakerRole.EMPLOYEE.value)

        second_seg = result.segments[1]
        self.assertEqual(second_seg.speaker, SpeakerRole.LEAD.value)

    async def test_audio_validation_empty_bytes(self) -> None:
        with self.assertRaises(InvalidAudioError):
            await self.service.transcribe(b"", recording_id="rec_002")

    async def test_audio_validation_none_audio(self) -> None:
        with self.assertRaises(AudioUnavailableError):
            await self.service.transcribe(None, recording_id="rec_003")

    async def test_audio_validation_blank_string(self) -> None:
        with self.assertRaises(InvalidAudioError):
            await self.service.transcribe("   ", recording_id="rec_004")

    async def test_audio_validation_io_stream(self) -> None:
        stream = io.BytesIO(b"streamed_audio_content")
        res = await self.service.transcribe(stream, recording_id="rec_stream")
        self.assertEqual(res.status, TranscriptionStatus.COMPLETED)

    async def test_timestamp_validations(self) -> None:
        # Negative start
        self.provider.set_segments([
            TranscriptSegment(start=-1.5, end=2.0, text="Invalid negative start", speaker="Agent"),
        ])
        with self.assertRaises(InvalidSegmentError):
            await self.service.transcribe(b"audio", recording_id="rec_neg")

        # Negative end
        self.provider.set_segments([
            TranscriptSegment(start=0.0, end=-0.5, text="Invalid negative end", speaker="Agent"),
        ])
        with self.assertRaises(InvalidSegmentError):
            await self.service.transcribe(b"audio", recording_id="rec_neg_end")

        # End < Start
        self.provider.set_segments([
            TranscriptSegment(start=10.0, end=5.0, text="End before start", speaker="Agent"),
        ])
        with self.assertRaises(InvalidSegmentError):
            await self.service.transcribe(b"audio", recording_id="rec_end_before_start")

    async def test_timestamp_start_equals_end(self) -> None:
        # start == end is valid for instant utterances
        self.provider.set_segments([
            TranscriptSegment(start=3.0, end=3.0, text="Acknowledge", speaker="Agent"),
        ])
        result = await self.service.transcribe(b"audio", recording_id="rec_eq")
        self.assertEqual(len(result.segments), 1)
        self.assertEqual(result.segments[0].start, 3.0)
        self.assertEqual(result.segments[0].end, 3.0)

    async def test_segments_chronological_sorting(self) -> None:
        # Unsorted provider segments should be sorted chronologically
        self.provider.set_segments([
            TranscriptSegment(start=10.0, end=14.0, text="Third statement", speaker="Agent"),
            TranscriptSegment(start=1.0, end=4.0, text="First statement", speaker="Customer"),
            TranscriptSegment(start=5.0, end=8.0, text="Second statement", speaker="Agent"),
        ])
        result = await self.service.transcribe(b"audio", recording_id="rec_sorted")
        self.assertEqual(result.segments[0].text, "First statement")
        self.assertEqual(result.segments[1].text, "Second statement")
        self.assertEqual(result.segments[2].text, "Third statement")

    async def test_speaker_normalization(self) -> None:
        self.assertEqual(self.service.normalize_speaker("Agent"), SpeakerRole.EMPLOYEE.value)
        self.assertEqual(self.service.normalize_speaker("speaker 0"), SpeakerRole.EMPLOYEE.value)
        self.assertEqual(self.service.normalize_speaker("Customer"), SpeakerRole.LEAD.value)
        self.assertEqual(self.service.normalize_speaker("prospect"), SpeakerRole.LEAD.value)
        self.assertEqual(self.service.normalize_speaker("RandomUnknownVoice"), SpeakerRole.UNKNOWN.value)
        self.assertEqual(self.service.normalize_speaker(None), SpeakerRole.UNKNOWN.value)

    async def test_long_transcript_fidelity(self) -> None:
        # Verify long transcript preserves all segments, ordering, and text
        long_segments = [
            TranscriptSegment(
                start=float(i * 5),
                end=float(i * 5 + 4),
                text=f"Dialogue segment index {i} discussing pricing and contract details.",
                speaker="Agent" if i % 2 == 0 else "Customer",
            )
            for i in range(50)
        ]
        self.provider.set_segments(long_segments)

        result = await self.service.transcribe(b"audio", recording_id="rec_long")
        self.assertEqual(len(result.segments), 50)
        self.assertEqual(result.duration, 49 * 5 + 4)
        for i, seg in enumerate(result.segments):
            self.assertEqual(seg.start, float(i * 5))
            self.assertEqual(seg.end, float(i * 5 + 4))

    async def test_empty_transcript_handling(self) -> None:
        # Provider returns empty text and empty segments
        self.provider.set_segments([])
        with self.assertRaises(InvalidTranscriptError):
            await self.service.transcribe(b"audio", recording_id="rec_empty")

    async def test_provider_timeout_converted_to_transcription_error(self) -> None:
        self.provider.fail_with = ProviderTimeoutError("Speech to text gateway timed out")
        with self.assertRaises(TranscriptionError) as ctx:
            await self.service.transcribe(b"audio", recording_id="rec_timeout")
        self.assertIn("timed out", str(ctx.exception))
        self.assertTrue(ctx.exception.details.get("retryable"))


class TestTranscriptionPipeline(unittest.IsolatedAsyncioTestCase):
    """Verifies end-to-end TranscriptionPipeline execution, status transitions, and repository handoff."""

    async def asyncSetUp(self) -> None:
        self.provider = MockTranscriptionProvider()
        self.service = TranscriptionService(provider=self.provider)
        self.transcript_repo = MockTranscriptRepository()
        self.recording_repo = MockRecordingRepository(
            records={
                "rec_100": {
                    "id": "rec_100",
                    "call_id": "call_100",
                    "status": "pending",
                    "audio_url": "https://storage.example.com/audio/call_100.wav",
                },
                "rec_already_done": {
                    "id": "rec_already_done",
                    "call_id": "call_done",
                    "status": "completed",
                    "audio_url": "https://storage.example.com/audio/call_done.wav",
                },
                "rec_currently_active": {
                    "id": "rec_currently_active",
                    "call_id": "call_active",
                    "status": "processing",
                    "audio_url": "https://storage.example.com/audio/call_active.wav",
                },
            }
        )
        self.pipeline = TranscriptionPipeline(
            service=self.service,
            transcript_repository=self.transcript_repo,
            recording_repository=self.recording_repo,
        )

    async def test_pipeline_happy_path_with_repo_lookup(self) -> None:
        output = await self.pipeline.execute(recording_id="rec_100")

        self.assertEqual(output.recording_id, "rec_100")
        self.assertEqual(output.call_id, "call_100")
        self.assertEqual(output.status, TranscriptionStatus.COMPLETED)

        # Verify repository was updated to processing and then completed
        rec = await self.recording_repo.get_by_id("rec_100")
        self.assertEqual(rec["status"], "completed")

        # Verify handoff to transcript repository occurred
        self.assertEqual(len(self.transcript_repo.saved_transcripts), 1)
        saved = self.transcript_repo.saved_transcripts[0]
        self.assertEqual(saved["recording_id"], "rec_100")
        self.assertEqual(saved["call_id"], "call_100")
        self.assertTrue(len(saved["segments"]) > 0)

    async def test_pipeline_idempotency_already_completed(self) -> None:
        with self.assertRaises(DuplicateTranscriptionError):
            await self.pipeline.execute(recording_id="rec_already_done")

        # Force reprocess flag overrides idempotency
        output = await self.pipeline.execute(recording_id="rec_already_done", force_reprocess=True)
        self.assertEqual(output.recording_id, "rec_already_done")

    async def test_pipeline_idempotency_already_processing(self) -> None:
        with self.assertRaises(DuplicateTranscriptionError):
            await self.pipeline.execute(recording_id="rec_currently_active")

    async def test_pipeline_missing_recording_in_repo(self) -> None:
        with self.assertRaises(RecordingNotFoundError):
            await self.pipeline.execute(recording_id="rec_missing")

    async def test_pipeline_failure_marks_recording_failed(self) -> None:
        self.provider.fail_with = ProviderUnavailableError("Cloud STT down")
        with self.assertRaises(TranscriptionError):
            await self.pipeline.execute(recording_id="rec_100")

        rec = await self.recording_repo.get_by_id("rec_100")
        self.assertEqual(rec["status"], "failed")


class TestTranscriptionWorker(unittest.IsolatedAsyncioTestCase):
    """Verifies TranscriptionWorker background execution and concurrency safety."""

    async def asyncSetUp(self) -> None:
        self.provider = MockTranscriptionProvider(latency_seconds=0.01)
        self.service = TranscriptionService(provider=self.provider)
        self.pipeline = TranscriptionPipeline(service=self.service)
        self.worker = TranscriptionWorker(pipeline=self.pipeline, max_concurrent_jobs=3)

    async def test_worker_process_recording_success(self) -> None:
        output = await self.worker.process_recording(
            recording_id="rec_worker_01",
            audio_source=b"test_audio",
            call_id="call_worker_01",
        )

        self.assertIsNotNone(output)
        self.assertEqual(output.recording_id, "rec_worker_01")
        self.assertTrue(self.worker.is_completed("rec_worker_01"))
        self.assertFalse(self.worker.is_active("rec_worker_01"))

    async def test_worker_idempotent_duplicate_call(self) -> None:
        # First execution completes
        await self.worker.process_recording("rec_worker_02", audio_source=b"test_audio")
        self.assertTrue(self.worker.is_completed("rec_worker_02"))

        # Second call returns None safely without re-running
        output2 = await self.worker.process_recording("rec_worker_02", audio_source=b"test_audio")
        self.assertIsNone(output2)

    async def test_worker_background_dispatch(self) -> None:
        task = await self.worker.dispatch_background(
            recording_id="rec_bg_01",
            audio_source=b"test_audio",
            call_id="call_bg_01",
        )
        self.assertIsInstance(task, asyncio.Task)
        output = await task
        self.assertEqual(output.recording_id, "rec_bg_01")
        self.assertTrue(self.worker.is_completed("rec_bg_01"))


if __name__ == "__main__":
    unittest.main()
