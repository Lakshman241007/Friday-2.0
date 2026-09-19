"""
FRIDAY AI Analysis Repository.
Handles database persistence operations for AI Analysis records.
Contains ZERO LLM calls or AI inference logic.
Supports both active SQLAlchemy Sessions and standalone in-memory testing.
"""

from typing import Any, Dict, List, Optional
import uuid

from app.models.ai_analysis import AIAnalysis
from app.schemas.analysis import AnalysisCreate, AnalysisUpdate


class DuplicateAnalysisError(Exception):
    """Raised when an analysis already exists for a given call."""
    pass


class AnalysisNotFoundError(Exception):
    """Raised when an expected analysis record is not found."""
    pass


class AnalysisRepository:
    """
    Data Access Object for AIAnalysis entities.
    Operates on a SQLAlchemy session (or internal store for decoupled test environments).
    """

    def __init__(self, session: Optional[Any] = None) -> None:
        self.session = session
        # Decoupled in-memory storage fallback for unit testing without db dependencies
        self._memory_store: Dict[str, AIAnalysis] = {}

    def create(self, analysis_in: AnalysisCreate) -> AIAnalysis:
        """
        Persists a new AIAnalysis record.
        Enforces call_id uniqueness.
        """
        existing = self.get_by_call_id(analysis_in.call_id)
        if existing:
            raise DuplicateAnalysisError(f"Analysis already exists for call_id '{analysis_in.call_id}'.")

        data = analysis_in.dict() if hasattr(analysis_in, "dict") else analysis_in.__dict__
        record = AIAnalysis(
            call_id=data["call_id"],
            transcript_id=data.get("transcript_id"),
            intent=data.get("intent", "Other"),
            intent_confidence=data.get("intent_confidence", 0.0),
            intent_evidence=data.get("intent_evidence", ""),
            sentiment=data.get("sentiment", "Neutral"),
            sentiment_confidence=data.get("sentiment_confidence", 0.0),
            sentiment_evidence=data.get("sentiment_evidence", ""),
            objections=data.get("objections", []),
            keywords=data.get("keywords", []),
            summary=data.get("summary", ""),
            key_points=data.get("key_points", []),
            customer_needs=data.get("customer_needs", []),
            concerns=data.get("concerns", []),
            next_steps=data.get("next_steps", []),
            model=data.get("model", "unknown"),
            provider=data.get("provider", "unknown"),
        )

        if self.session is not None and hasattr(self.session, "add"):
            self.session.add(record)
            if hasattr(self.session, "commit"):
                self.session.commit()
            if hasattr(self.session, "refresh"):
                self.session.refresh(record)
            return record

        # In-memory storage path
        self._memory_store[record.id] = record
        return record

    def get_by_id(self, analysis_id: str) -> Optional[AIAnalysis]:
        """Retrieves an AIAnalysis by its primary key ID."""
        if not analysis_id:
            return None

        if self.session is not None and hasattr(self.session, "query"):
            return self.session.query(AIAnalysis).filter(AIAnalysis.id == analysis_id).first()

        return self._memory_store.get(analysis_id)

    def get_by_call_id(self, call_id: str) -> Optional[AIAnalysis]:
        """Retrieves an AIAnalysis by associated call_id."""
        if not call_id:
            return None

        if self.session is not None and hasattr(self.session, "query"):
            return self.session.query(AIAnalysis).filter(AIAnalysis.call_id == call_id).first()

        for rec in self._memory_store.values():
            if getattr(rec, "call_id", None) == call_id:
                return rec
        return None

    def get_by_transcript_id(self, transcript_id: str) -> Optional[AIAnalysis]:
        """Retrieves an AIAnalysis by associated transcript_id."""
        if not transcript_id:
            return None

        if self.session is not None and hasattr(self.session, "query"):
            return self.session.query(AIAnalysis).filter(AIAnalysis.transcript_id == transcript_id).first()

        for rec in self._memory_store.values():
            if getattr(rec, "transcript_id", None) == transcript_id:
                return rec
        return None

    def exists(self, call_id: str) -> bool:
        """Checks if an analysis exists for a given call_id."""
        return self.get_by_call_id(call_id) is not None

    def update(self, analysis_id: str, update_in: AnalysisUpdate) -> AIAnalysis:
        """Updates fields on an existing AIAnalysis record."""
        record = self.get_by_id(analysis_id)
        if not record:
            raise AnalysisNotFoundError(f"AIAnalysis with ID '{analysis_id}' not found.")

        update_data = update_in.dict() if hasattr(update_in, "dict") else update_in.__dict__
        for field_name, val in update_data.items():
            if val is not None and hasattr(record, field_name):
                setattr(record, field_name, val)

        if self.session is not None:
            if hasattr(self.session, "commit"):
                self.session.commit()
            if hasattr(self.session, "refresh"):
                self.session.refresh(record)

        return record

    def delete(self, analysis_id: str) -> bool:
        """Deletes an AIAnalysis record by ID. Returns True if deleted."""
        record = self.get_by_id(analysis_id)
        if not record:
            return False

        if self.session is not None and hasattr(self.session, "delete"):
            self.session.delete(record)
            if hasattr(self.session, "commit"):
                self.session.commit()
            return True

        if analysis_id in self._memory_store:
            del self._memory_store[analysis_id]
            return True
        return False
