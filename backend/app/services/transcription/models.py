"""
FRIDAY Transcription Output and Segment Models.
Provides standard processing schemas for transcription results.
"""

from dataclasses import dataclass, field
from enum import Enum
from typing import Any, Dict, List, Optional


class TranscriptionStatus(str, Enum):
    """Lifecycle statuses of transcription processing."""
    PENDING = "pending"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"


class SpeakerRole(str, Enum):
    """Standardized speaker labels."""
    EMPLOYEE = "employee"
    LEAD = "lead"
    UNKNOWN = "unknown"


@dataclass
class NormalizedTranscriptSegment:
    """A chronologically verified, normalized transcript segment."""
    start: float  # Seconds from call start (>= 0.0)
    end: float    # Seconds from call start (>= start)
    text: str     # Clean, faithful segment text
    speaker: str = SpeakerRole.UNKNOWN.value  # "employee", "lead", or "unknown"
    confidence: Optional[float] = None        # Normalized confidence score (0.0 - 1.0)
    words: Optional[List[Dict[str, Any]]] = None

    def to_dict(self) -> Dict[str, Any]:
        result: Dict[str, Any] = {
            "start": round(self.start, 3),
            "end": round(self.end, 3),
            "text": self.text,
            "speaker": self.speaker,
        }
        if self.confidence is not None:
            result["confidence"] = round(self.confidence, 4)
        if self.words:
            result["words"] = self.words
        return result


@dataclass
class TranscriptionOutput:
    """Structured result produced by the transcription pipeline."""
    recording_id: str
    call_id: Optional[str] = None
    language: str = "en"
    duration: float = 0.0
    text: str = ""
    segments: List[NormalizedTranscriptSegment] = field(default_factory=list)
    status: TranscriptionStatus = TranscriptionStatus.COMPLETED
    model: str = "unknown"
    provider: str = "unknown"
    confidence: Optional[float] = None
    latency_ms: Optional[float] = None
    error_message: Optional[str] = None

    def to_dict(self) -> Dict[str, Any]:
        return {
            "recording_id": self.recording_id,
            "call_id": self.call_id,
            "language": self.language,
            "duration": round(self.duration, 3),
            "text": self.text,
            "segments": [seg.to_dict() for seg in self.segments],
            "status": self.status.value,
            "model": self.model,
            "provider": self.provider,
            "confidence": round(self.confidence, 4) if self.confidence is not None else None,
            "latency_ms": self.latency_ms,
            "error_message": self.error_message,
        }
