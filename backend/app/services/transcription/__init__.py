"""
FRIDAY Transcription Service Package
"""

from .exceptions import (
    AudioUnavailableError,
    DuplicateTranscriptionError,
    InvalidAudioError,
    InvalidSegmentError,
    InvalidTranscriptError,
    RecordingNotFoundError,
    TranscriptionError,
)
from .models import (
    NormalizedTranscriptSegment,
    SpeakerRole,
    TranscriptionOutput,
    TranscriptionStatus,
)
from .transcription_service import TranscriptionService

__all__ = [
    "AudioUnavailableError",
    "DuplicateTranscriptionError",
    "InvalidAudioError",
    "InvalidSegmentError",
    "InvalidTranscriptError",
    "NormalizedTranscriptSegment",
    "RecordingNotFoundError",
    "SpeakerRole",
    "TranscriptionError",
    "TranscriptionOutput",
    "TranscriptionService",
    "TranscriptionStatus",
]
