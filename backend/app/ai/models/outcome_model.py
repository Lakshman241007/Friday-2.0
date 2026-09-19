"""
FRIDAY AI Outcome Domain Models.
Defines OutcomeResult container and re-exports OutcomeCategory.
"""

from dataclasses import dataclass, field
from datetime import datetime, timezone
from typing import Any, Dict, Optional

from app.models.outcome import OutcomeCategory


@dataclass
class OutcomeResult:
    """
    Validated outcome analysis result produced by Phase 5 AI Outcome Engine.
    Represents the business classification of a completed call.
    """
    call_id: Optional[str]
    transcript_id: Optional[str]
    outcome: str
    confidence: float
    evidence: str
    next_action: Optional[str] = None
    model: str = "unknown"
    provider: str = "unknown"
    analyzed_at: str = field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

    def to_dict(self) -> Dict[str, Any]:
        """Converts OutcomeResult into a JSON-serializable dictionary."""
        return {
            "call_id": self.call_id,
            "transcript_id": self.transcript_id,
            "outcome": self.outcome,
            "confidence": round(self.confidence, 4),
            "evidence": self.evidence,
            "next_action": self.next_action,
            "model": self.model,
            "provider": self.provider,
            "analyzed_at": self.analyzed_at,
        }
