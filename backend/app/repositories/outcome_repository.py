"""
FRIDAY AI Outcome Repository.
Handles database persistence operations for Call Outcome records.
Contains ZERO LLM calls or AI inference logic.
Supports both active SQLAlchemy Sessions and standalone in-memory testing.
"""

from typing import Any, Dict, List, Optional
import uuid

from app.models.outcome import Outcome, OutcomeCategory
from app.schemas.outcome import OutcomeCreate, OutcomeUpdate


class DuplicateOutcomeError(Exception):
    """Raised when an outcome already exists for a given call."""
    pass


class OutcomeNotFoundError(Exception):
    """Raised when an expected outcome record is not found."""
    pass


class OutcomeRepository:
    """
    Data Access Object for Outcome entities.
    Operates on a SQLAlchemy session (or internal store for decoupled test environments).
    """

    def __init__(self, session: Optional[Any] = None) -> None:
        self.session = session
        # Decoupled in-memory storage fallback for unit testing without db dependencies
        self._memory_store: Dict[str, Outcome] = {}

    def create(self, outcome_in: OutcomeCreate) -> Outcome:
        """
        Persists a new Outcome record.
        Enforces call_id uniqueness.
        """
        existing = self.get_by_call_id(outcome_in.call_id)
        if existing:
            raise DuplicateOutcomeError(f"Outcome already exists for call_id '{outcome_in.call_id}'.")

        data = outcome_in.dict() if hasattr(outcome_in, "dict") else outcome_in.__dict__
        record = Outcome(
            call_id=data["call_id"],
            transcript_id=data.get("transcript_id"),
            outcome=data.get("outcome", OutcomeCategory.OTHER.value),
            confidence=data.get("confidence", 0.0),
            evidence=data.get("evidence", ""),
            next_action=data.get("next_action"),
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

    def get_by_id(self, outcome_id: str) -> Optional[Outcome]:
        """Retrieves an Outcome by its primary key ID."""
        if not outcome_id:
            return None

        if self.session is not None and hasattr(self.session, "query"):
            return self.session.query(Outcome).filter(Outcome.id == outcome_id).first()

        return self._memory_store.get(outcome_id)

    def get_by_call_id(self, call_id: str) -> Optional[Outcome]:
        """Retrieves an Outcome by associated call_id."""
        if not call_id:
            return None

        if self.session is not None and hasattr(self.session, "query"):
            return self.session.query(Outcome).filter(Outcome.call_id == call_id).first()

        for rec in self._memory_store.values():
            if getattr(rec, "call_id", None) == call_id:
                return rec
        return None

    def get_by_transcript_id(self, transcript_id: str) -> Optional[Outcome]:
        """Retrieves an Outcome by associated transcript_id."""
        if not transcript_id:
            return None

        if self.session is not None and hasattr(self.session, "query"):
            return self.session.query(Outcome).filter(Outcome.transcript_id == transcript_id).first()

        for rec in self._memory_store.values():
            if getattr(rec, "transcript_id", None) == transcript_id:
                return rec
        return None

    def exists(self, call_id: str) -> bool:
        """Checks if an outcome exists for a given call_id."""
        return self.get_by_call_id(call_id) is not None

    def update(self, outcome_id: str, update_in: OutcomeUpdate) -> Outcome:
        """Updates fields on an existing Outcome record."""
        record = self.get_by_id(outcome_id)
        if not record:
            raise OutcomeNotFoundError(f"Outcome with ID '{outcome_id}' not found.")

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

    def delete(self, outcome_id: str) -> bool:
        """Deletes an Outcome record by ID. Returns True if deleted."""
        record = self.get_by_id(outcome_id)
        if not record:
            return False

        if self.session is not None and hasattr(self.session, "delete"):
            self.session.delete(record)
            if hasattr(self.session, "commit"):
                self.session.commit()
            return True

        if outcome_id in self._memory_store:
            del self._memory_store[outcome_id]
            return True
        return False
