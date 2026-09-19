"""
FRIDAY Transcription Service Exceptions.
Self-contained in the AI/transcription ownership area.
"""

from typing import Optional, Any, Dict
from app.ai.providers.exceptions import AIProviderError


class TranscriptionError(Exception):
    """Base exception for transcription domain errors."""

    def __init__(
        self,
        message: str,
        call_id: Optional[str] = None,
        recording_id: Optional[str] = None,
        details: Optional[Dict[str, Any]] = None,
    ) -> None:
        super().__init__(message)
        self.message = message
        self.call_id = call_id
        self.recording_id = recording_id
        self.details = details or {}

    def __str__(self) -> str:
        ctx = []
        if self.recording_id:
            ctx.append(f"recording={self.recording_id}")
        if self.call_id:
            ctx.append(f"call={self.call_id}")
        prefix = f"[{', '.join(ctx)}] " if ctx else ""
        return f"{prefix}{self.message}"


class RecordingNotFoundError(TranscriptionError):
    """Raised when the specified recording cannot be located."""
    pass


class AudioUnavailableError(TranscriptionError):
    """Raised when the audio payload, file path, or stream is missing or inaccessible."""
    pass


class InvalidAudioError(TranscriptionError):
    """Raised when audio format, headers, or duration are invalid."""
    pass


class InvalidSegmentError(TranscriptionError):
    """Raised when transcript segments violate timestamp or structural constraints."""
    pass


class InvalidTranscriptError(TranscriptionError):
    """Raised when transcript content or provider response is malformed or empty."""
    pass


class DuplicateTranscriptionError(TranscriptionError):
    """Raised when attempting to transcribe a recording that is already completed or processing."""
    pass
