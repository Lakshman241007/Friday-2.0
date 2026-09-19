"""
FRIDAY AI Analysis SQLAlchemy Model.
Persists structured call intelligence produced by Phase 3 Analysis Engine.
"""

from datetime import datetime, timezone
import uuid
from typing import Any, Dict, List, Optional

from app.models.base import (
    Base,
    Column,
    DateTime,
    Float,
    ForeignKey,
    Index,
    JSON,
    String,
    Text,
    UniqueConstraint,
)


class AIAnalysis(Base):
    """
    SQLAlchemy Model representing the persisted output of Phase 3 Analysis.
    Linked to a Call and an optional Transcript.
    """
    __tablename__ = "ai_analyses"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    call_id = Column(String(36), ForeignKey("calls.id", ondelete="CASCADE"), nullable=False, index=True)
    transcript_id = Column(String(36), ForeignKey("transcripts.id", ondelete="SET NULL"), nullable=True, index=True)

    # Intent Intelligence
    intent = Column(String(100), nullable=False, default="Other", index=True)
    intent_confidence = Column(Float, nullable=False, default=0.0)
    intent_evidence = Column(Text, nullable=False, default="")

    # Sentiment Intelligence
    sentiment = Column(String(50), nullable=False, default="Neutral", index=True)
    sentiment_confidence = Column(Float, nullable=False, default=0.0)
    sentiment_evidence = Column(Text, nullable=False, default="")

    # Structured Complex AI extractions stored in portable JSON
    objections = Column(JSON, nullable=False, default=list)
    keywords = Column(JSON, nullable=False, default=list)

    # Summary Intelligence
    summary = Column(Text, nullable=False, default="")
    key_points = Column(JSON, nullable=False, default=list)
    customer_needs = Column(JSON, nullable=False, default=list)
    concerns = Column(JSON, nullable=False, default=list)
    next_steps = Column(JSON, nullable=False, default=list)

    # Provenance and Metadata
    model = Column(String(100), nullable=False, default="unknown")
    provider = Column(String(100), nullable=False, default="unknown")
    analyzed_at = Column(DateTime(timezone=True), nullable=False, default=lambda: datetime.now(timezone.utc), index=True)
    created_at = Column(DateTime(timezone=True), nullable=False, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(
        DateTime(timezone=True),
        nullable=False,
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )

    __table_args__ = (
        UniqueConstraint("call_id", name="uq_ai_analyses_call_id"),
        Index("ix_ai_analyses_call_id", "call_id"),
        Index("ix_ai_analyses_transcript_id", "transcript_id"),
        Index("ix_ai_analyses_intent", "intent"),
        Index("ix_ai_analyses_sentiment", "sentiment"),
        Index("ix_ai_analyses_analyzed_at", "analyzed_at"),
    )

    def __init__(self, **kwargs: Any) -> None:
        if "id" not in kwargs:
            kwargs["id"] = str(uuid.uuid4())
        now = datetime.now(timezone.utc)
        if "analyzed_at" not in kwargs:
            kwargs["analyzed_at"] = now
        if "created_at" not in kwargs:
            kwargs["created_at"] = now
        if "updated_at" not in kwargs:
            kwargs["updated_at"] = now
        if "objections" not in kwargs or kwargs["objections"] is None:
            kwargs["objections"] = []
        if "keywords" not in kwargs or kwargs["keywords"] is None:
            kwargs["keywords"] = []
        if "key_points" not in kwargs or kwargs["key_points"] is None:
            kwargs["key_points"] = []
        if "customer_needs" not in kwargs or kwargs["customer_needs"] is None:
            kwargs["customer_needs"] = []
        if "concerns" not in kwargs or kwargs["concerns"] is None:
            kwargs["concerns"] = []
        if "next_steps" not in kwargs or kwargs["next_steps"] is None:
            kwargs["next_steps"] = []
        super().__init__(**kwargs)

    def to_dict(self) -> Dict[str, Any]:
        """Converts model instance to JSON-serializable dictionary."""
        return {
            "id": getattr(self, "id", None),
            "call_id": getattr(self, "call_id", None),
            "transcript_id": getattr(self, "transcript_id", None),
            "intent": {
                "label": getattr(self, "intent", "Other"),
                "confidence": getattr(self, "intent_confidence", 0.0),
                "evidence": getattr(self, "intent_evidence", ""),
            },
            "sentiment": {
                "label": getattr(self, "sentiment", "Neutral"),
                "confidence": getattr(self, "sentiment_confidence", 0.0),
                "evidence": getattr(self, "sentiment_evidence", ""),
            },
            "objections": getattr(self, "objections", []) or [],
            "keywords": getattr(self, "keywords", []) or [],
            "summary": getattr(self, "summary", ""),
            "key_points": getattr(self, "key_points", []) or [],
            "customer_needs": getattr(self, "customer_needs", []) or [],
            "concerns": getattr(self, "concerns", []) or [],
            "next_steps": getattr(self, "next_steps", []) or [],
            "model": getattr(self, "model", "unknown"),
            "provider": getattr(self, "provider", "unknown"),
            "analyzed_at": (
                self.analyzed_at.isoformat()
                if hasattr(self, "analyzed_at") and isinstance(self.analyzed_at, datetime)
                else str(getattr(self, "analyzed_at", ""))
            ),
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
