from datetime import datetime, timezone

from sqlalchemy import Column, DateTime, ForeignKey, Integer, String

from app.core.database import Base


class Recording(Base):
    """Stores the file reference and metadata for a call recording."""

    __tablename__ = "recordings"

    id = Column(Integer, primary_key=True, index=True)
    call_id = Column(Integer, ForeignKey("calls.id"), nullable=False)

    file_url = Column(String(500), nullable=False)
    duration_seconds = Column(Integer, nullable=True)
    file_format = Column(String(20), nullable=True)

    created_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )