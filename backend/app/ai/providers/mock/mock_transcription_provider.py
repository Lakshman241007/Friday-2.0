"""
FRIDAY Mock Transcription Provider
Deterministic speech-to-text provider generating timestamped diarized segments
without external cloud API requirements.
"""

import asyncio
import io
from typing import Any, List, Optional, Union

from ..transcription_provider import (
    AudioInput,
    BaseTranscriptionProvider,
    TranscriptSegment,
    TranscriptionResult,
)


class MockTranscriptionProvider(BaseTranscriptionProvider):
    """
    In-memory transcription provider for testing pipeline workflows.
    Produces deterministic timestamped segments with speaker turns.
    """

    DEFAULT_SEGMENTS = [
        TranscriptSegment(
            start=0.0,
            end=3.5,
            text="Hello, thank you for calling FRIDAY Solutions. My name is Alex, how can I help you today?",
            speaker="Agent",
            confidence=0.98,
        ),
        TranscriptSegment(
            start=3.8,
            end=8.2,
            text="Hi Alex, I'm reaching out because our sales team is growing and our current dialer is too slow.",
            speaker="Customer",
            confidence=0.95,
        ),
        TranscriptSegment(
            start=8.5,
            end=14.0,
            text="I completely understand. FRIDAY provides autonomous dialing and real-time conversation analysis.",
            speaker="Agent",
            confidence=0.97,
        ),
        TranscriptSegment(
            start=14.5,
            end=19.8,
            text="That sounds interesting, but we're quite concerned about integration complexity and pricing.",
            speaker="Customer",
            confidence=0.93,
        ),
        TranscriptSegment(
            start=20.2,
            end=25.0,
            text="We offer one-click CRM synchronization and a 14-day zero-risk trial. Can we schedule a quick demo?",
            speaker="Agent",
            confidence=0.96,
        ),
        TranscriptSegment(
            start=25.4,
            end=29.0,
            text="Yes, Tuesday at 2 PM works well for our VP of Sales.",
            speaker="Customer",
            confidence=0.99,
        ),
    ]

    def __init__(
        self,
        default_model: str = "mock-stt-v1",
        default_language: str = "en",
        custom_segments: Optional[List[TranscriptSegment]] = None,
        latency_seconds: float = 0.0,
        fail_with: Optional[Exception] = None,
    ) -> None:
        super().__init__(provider_name="mock_transcription", default_model=default_model)
        self.default_language = default_language
        self.segments = custom_segments if custom_segments is not None else list(self.DEFAULT_SEGMENTS)
        self.latency_seconds = latency_seconds
        self.fail_with = fail_with
        self.call_count: int = 0

    def set_segments(self, segments: List[TranscriptSegment]) -> None:
        self.segments = segments

    async def transcribe(
        self,
        audio: Union[AudioInput, bytes, str, io.IOBase],
        language: Optional[str] = None,
        diarization: bool = True,
        prompt: Optional[str] = None,
        **kwargs: Any,
    ) -> TranscriptionResult:
        self.call_count += 1

        if self.latency_seconds > 0:
            await asyncio.sleep(self.latency_seconds)

        if self.fail_with:
            raise self.fail_with

        norm_audio = self._normalize_audio_input(audio)

        # Build full text from segments
        effective_segments = [
            TranscriptSegment(
                start=seg.start,
                end=seg.end,
                text=seg.text,
                speaker=seg.speaker if diarization else None,
                confidence=seg.confidence,
                words=seg.words,
            )
            for seg in self.segments
        ]

        full_text = " ".join(seg.text for seg in effective_segments)
        duration = effective_segments[-1].end if effective_segments else 0.0

        return TranscriptionResult(
            text=full_text,
            language=language or self.default_language,
            duration=duration,
            segments=effective_segments,
            model=self.default_model,
            provider=self.provider_name,
            confidence=0.96,
            latency_ms=round(self.latency_seconds * 1000, 2),
        )

    async def health_check(self) -> bool:
        return self.fail_with is None
