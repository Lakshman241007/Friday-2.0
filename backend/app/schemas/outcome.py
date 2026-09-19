"""
FRIDAY AI Outcome Schemas.
Provides validation and serialization models for Call Outcomes.
"""

from datetime import datetime
from typing import Any, Dict, Optional

from app.models.outcome import OutcomeCategory
from app.schemas.analysis import validate_confidence_range

try:
    from pydantic import BaseModel, Field  # type: ignore
except ImportError:
    class BaseModel:  # type: ignore
        def __init__(self, **kwargs: Any) -> None:
            for k, v in kwargs.items():
                setattr(self, k, v)

        def dict(self) -> Dict[str, Any]:
            return {k: v for k, v in self.__dict__.items() if not k.startswith("_")}

        def model_dump(self) -> Dict[str, Any]:
            return self.dict()


class OutcomeBase(BaseModel):
    call_id: str
    transcript_id: Optional[str] = None
    outcome: str = OutcomeCategory.OTHER.value
    confidence: float = 0.0
    evidence: str = ""
    next_action: Optional[str] = None


class OutcomeCreate(BaseModel):
    call_id: str
    transcript_id: Optional[str] = None
    outcome: str = OutcomeCategory.OTHER.value
    confidence: float = 0.0
    evidence: str = ""
    next_action: Optional[str] = None
    model: str = "unknown"
    provider: str = "unknown"

    def __init__(self, **data: Any) -> None:
        if not data.get("call_id"):
            raise ValueError("call_id is required for OutcomeCreate.")
        if "confidence" in data:
            data["confidence"] = validate_confidence_range(data["confidence"])
        if "outcome" in data:
            data["outcome"] = OutcomeCategory.match(str(data["outcome"])).value
        super().__init__(**data)


class OutcomeUpdate(BaseModel):
    outcome: Optional[str] = None
    confidence: Optional[float] = None
    evidence: Optional[str] = None
    next_action: Optional[str] = None

    def __init__(self, **data: Any) -> None:
        if "confidence" in data and data["confidence"] is not None:
            data["confidence"] = validate_confidence_range(data["confidence"])
        if "outcome" in data and data["outcome"] is not None:
            data["outcome"] = OutcomeCategory.match(str(data["outcome"])).value
        super().__init__(**data)


class OutcomeResponse(BaseModel):
    id: str
    call_id: str
    transcript_id: Optional[str] = None
    outcome: str
    confidence: float
    evidence: str
    next_action: Optional[str] = None
    model: str = "unknown"
    provider: str = "unknown"
    created_at: str = ""
    updated_at: str = ""

    @classmethod
    def from_orm(cls, obj: Any) -> "OutcomeResponse":
        d = obj.to_dict() if hasattr(obj, "to_dict") else obj
        return cls(
            id=str(d.get("id")),
            call_id=str(d.get("call_id")),
            transcript_id=d.get("transcript_id"),
            outcome=str(d.get("outcome", OutcomeCategory.OTHER.value)),
            confidence=float(d.get("confidence", 0.0)),
            evidence=str(d.get("evidence", "")),
            next_action=d.get("next_action"),
            model=str(d.get("model", "unknown")),
            provider=str(d.get("provider", "unknown")),
            created_at=str(d.get("created_at", "")),
            updated_at=str(d.get("updated_at", "")),
        )
