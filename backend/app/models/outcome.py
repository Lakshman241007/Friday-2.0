"""
FRIDAY AI Outcome SQLAlchemy Model.
Persists call outcome classification, confidence, evidence, and next actions.
"""

from datetime import datetime, timezone
from enum import Enum
import uuid
from typing import Any, Dict, Optional

from app.models.base import (
    Base,
    Column,
    DateTime,
    Float,
    ForeignKey,
    Index,
    String,
    Text,
    UniqueConstraint,
)


class OutcomeCategory(str, Enum):
    """
    Standard FRIDAY call outcome categories.
    Prepares for Phase 5 AI Outcome Detection while supporting existing CRM states.
    """
    INTERESTED = "Interested"
    NOT_INTERESTED = "Not Interested"
    FOLLOW_UP_REQUIRED = "Follow-up Required"
    CONVERTED = "Converted"
    QUALIFIED = "Qualified"
    UNQUALIFIED = "Unqualified"
    CALLBACK_REQUESTED = "Callback Requested"
    NO_ANSWER = "No Answer"
    BUSY = "Busy"
    WRONG_NUMBER = "Wrong Number"
    DISQUALIFIED = "Disqualified"
    OTHER = "Other"

    @classmethod
    def match(cls, value: Optional[str]) -> "OutcomeCategory":
        """Matches free-form text or enum values tolerantly to valid OutcomeCategory."""
        if not value:
            return cls.OTHER

        clean = value.strip().lower().replace("_", " ").replace("-", " ")
        mapping = {
            "interested": cls.INTERESTED,
            "interest": cls.INTERESTED,
            "not interested": cls.NOT_INTERESTED,
            "uninterested": cls.NOT_INTERESTED,
            "no interest": cls.NOT_INTERESTED,
            "follow up required": cls.FOLLOW_UP_REQUIRED,
            "follow up": cls.FOLLOW_UP_REQUIRED,
            "followup": cls.FOLLOW_UP_REQUIRED,
            "converted": cls.CONVERTED,
            "deal closed": cls.CONVERTED,
            "closed won": cls.CONVERTED,
            "qualified": cls.QUALIFIED,
            "sql": cls.QUALIFIED,
            "mql": cls.QUALIFIED,
            "unqualified": cls.UNQUALIFIED,
            "callback requested": cls.CALLBACK_REQUESTED,
            "callback": cls.CALLBACK_REQUESTED,
            "call back": cls.CALLBACK_REQUESTED,
            "no answer": cls.NO_ANSWER,
            "unanswered": cls.NO_ANSWER,
            "busy": cls.BUSY,
            "line busy": cls.BUSY,
            "wrong number": cls.WRONG_NUMBER,
            "disqualified": cls.DISQUALIFIED,
            "other": cls.OTHER,
        }
        return mapping.get(clean, cls.OTHER)


class Outcome(Base):
    """
    SQLAlchemy Model representing the persisted call outcome.
    Stores the AI-interpreted or confirmed classification for a Call.
    """
    __tablename__ = "outcomes"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    call_id = Column(String(36), ForeignKey("calls.id", ondelete="CASCADE"), nullable=False, index=True)
    transcript_id = Column(String(36), ForeignKey("transcripts.id", ondelete="SET NULL"), nullable=True, index=True)

    outcome = Column(String(50), nullable=False, default=OutcomeCategory.OTHER.value, index=True)
    confidence = Column(Float, nullable=False, default=0.0)
    evidence = Column(Text, nullable=False, default="")
    next_action = Column(String(255), nullable=True)

    # Provenance
    model = Column(String(100), nullable=False, default="unknown")
    provider = Column(String(100), nullable=False, default="unknown")

    created_at = Column(DateTime(timezone=True), nullable=False, default=lambda: datetime.now(timezone.utc), index=True)
    updated_at = Column(
        DateTime(timezone=True),
        nullable=False,
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )

    __table_args__ = (
        UniqueConstraint("call_id", name="uq_outcomes_call_id"),
        Index("ix_outcomes_call_id", "call_id"),
        Index("ix_outcomes_transcript_id", "transcript_id"),
        Index("ix_outcomes_outcome", "outcome"),
        Index("ix_outcomes_created_at", "created_at"),
    )

    def __init__(self, **kwargs: Any) -> None:
        if "id" not in kwargs:
            kwargs["id"] = str(uuid.uuid4())
        now = datetime.now(timezone.utc)
        if "created_at" not in kwargs:
            kwargs["created_at"] = now
        if "updated_at" not in kwargs:
            kwargs["updated_at"] = now
        super().__init__(**kwargs)

    def to_dict(self) -> Dict[str, Any]:
        """Converts model instance to JSON-serializable dictionary."""
        return {
            "id": getattr(self, "id", None),
            "call_id": getattr(self, "call_id", None),
            "transcript_id": getattr(self, "transcript_id", None),
            "outcome": getattr(self, "outcome", OutcomeCategory.OTHER.value),
            "confidence": getattr(self, "confidence", 0.0),
            "evidence": getattr(self, "evidence", ""),
            "next_action": getattr(self, "next_action", None),
            "model": getattr(self, "model", "unknown"),
            "provider": getattr(self, "provider", "unknown"),
            "created_at": (
                self.created_at.isoformat()
                if hasattr(self, "created_at") and isinstance(self.created_at, datetime)
                else str(getattr(self, "created_at", ""))
            ),
            "updated_at": (
                self.updated_at.isoformat()
                if hasattr(self, "updated_at") and isinstance(self.updated_at, datetime)
                else str(getattr(self, "updated_at", ""))
            ),
        }
