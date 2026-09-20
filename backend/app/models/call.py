from datetime import datetime, timezone

from sqlalchemy import Column, DateTime, ForeignKey, Integer, String, Text
from app.core.database import Base


class Call(Base):
    """Stores call details and outcomes for a lead."""

    __tablename__ = "calls"

    id = Column(Integer, primary_key=True, index=True)
    lead_id = Column(Integer, ForeignKey("leads.id"), nullable=False)
    agent_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    status = Column(String(30), default="Scheduled", nullable=False)
    outcome = Column(String(100), nullable=True)
    notes = Column(Text, nullable=True)

    started_at = Column(DateTime(timezone=True), nullable=True)
    ended_at = Column(DateTime(timezone=True), nullable=True)

    created_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )