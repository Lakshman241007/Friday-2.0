"""
FRIDAY Transcription Provider Abstraction Layer
Provides a vendor-neutral interface for speech-to-text and diarization.
Supports timestamped segments required by downstream sentiment, objection,
keyword, and outcome verification pipelines.
"""

from abc import ABC, abstractmethod
from dataclasses import dataclass, field
from typing import Any, Dict, List, Optional, Union
import io


@dataclass
class TranscriptSegment:
    """Timestamped segment of transcribed audio with speaker diarization."""
    start: float  # Start offset in seconds
    end: float    # End offset in seconds
    text: str     # Transcribed text for this segment
    speaker: Optional[str] = None  # Speaker label, e.g. "Agent", "Customer", "Speaker 0"
    confidence: Optional[float] = None  # Model confidence score (0.0 to 1.0)
    words: Optional[List[Dict[str, Any]]] = None  # Optional word-level timestamps

    def to_dict(self) -> Dict[str, Any]:
        result: Dict[str, Any] = {
            "start": round(self.start, 2),
            "end": round(self.end, 2),
            "text": self.text,
        }
        if self.speaker:
            result["speaker"] = self.speaker
        if self.confidence is not None:
            result["confidence"] = round(self.confidence, 4)
        if self.words:
            result["words"] = self.words
        return result


@dataclass
class AudioInput:
    """Encapsulates raw audio payload or reference."""
    data: Optional[bytes] = None
    file_path: Optional[str] = None
    url: Optional[str] = None
    mime_type: str = "audio/wav"
    sample_rate: Optional[int] = None
    channels: Optional[int] = None

    def has_content(self) -> bool:
        return bool(self.data or self.file_path or self.url)


@dataclass
class TranscriptionResult:
    """Standardized response from audio transcription."""
    text: str
    language: str
    duration: float  # In seconds
    segments: List[TranscriptSegment] = field(default_factory=list)
    model: str = "unknown"
    provider: str = "unknown"
    confidence: Optional[float] = None
    latency_ms: Optional[float] = None
    raw_response: Optional[Dict[str, Any]] = None

    def to_dict(self) -> Dict[str, Any]:
        return {
            "text": self.text,
            "language": self.language,
            "duration": round(self.duration, 2),
            "segments": [seg.to_dict() for seg in self.segments],
            "model": self.model,
            "provider": self.provider,
            "confidence": round(self.confidence, 4) if self.confidence is not None else None,
            "latency_ms": self.latency_ms,
        }


class BaseTranscriptionProvider(ABC):
    """
    Abstract Base Class for Speech-to-Text Transcription Providers.
    Converts audio streams or files into timestamped transcripts.
    """

    def __init__(self, provider_name: str, default_model: str) -> None:
        self.provider_name = provider_name
        self.default_model = default_model

    def _normalize_audio_input(
        self,
        audio: Union[AudioInput, bytes, str, io.IOBase],
        mime_type: str = "audio/wav",
    ) -> AudioInput:
        """Standardizes varied audio argument types into an AudioInput container."""
        if isinstance(audio, AudioInput):
            return audio
        if isinstance(audio, bytes):
            return AudioInput(data=audio, mime_type=mime_type)
        if isinstance(audio, str):
            if audio.startswith("http://") or audio.startswith("https://"):
                return AudioInput(url=audio, mime_type=mime_type)
            return AudioInput(file_path=audio, mime_type=mime_type)
        if isinstance(audio, io.IOBase):
            audio.seek(0)
            data = audio.read()
            if isinstance(data, str):
                data = data.encode("utf-8")
            return AudioInput(data=data, mime_type=mime_type)
        raise ValueError(f"Unsupported audio input type: {type(audio)}")

    @abstractmethod
    async def transcribe(
        self,
        audio: Union[AudioInput, bytes, str, io.IOBase],
        language: Optional[str] = None,
        diarization: bool = True,
        prompt: Optional[str] = None,
        **kwargs: Any,
    ) -> TranscriptionResult:
        """
        Asynchronously transcribes audio into text with timestamped segments.

        Args:
            audio: Audio bytes, file path, URL, or AudioInput instance.
            language: Expected language code (e.g. "en", "es") or None for auto-detect.
            diarization: Whether to identify distinct speakers per segment.
            prompt: Optional guiding context prompt or vocabulary hints.
            **kwargs: Additional provider-specific parameters.

        Returns:
            TranscriptionResult with combined text and timestamped segments.

        Raises:
            AIProviderError or derived subclasses upon failure.
        """
        pass

    @abstractmethod
    async def health_check(self) -> bool:
        """
        Verifies provider availability and valid configuration.

        Returns:
            True if healthy and reachable, False otherwise.
        """
        pass
