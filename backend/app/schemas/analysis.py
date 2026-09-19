"""
FRIDAY AI Analysis Schemas.
Provides validation and serialization models for AI Analysis data.
Supports both Pydantic v1/v2 environments and custom fallback validations.
"""

from datetime import datetime, timezone
from typing import Any, Dict, List, Optional

try:
    from pydantic import BaseModel, Field, validator  # type: ignore
    HAS_PYDANTIC = True
except ImportError:
    HAS_PYDANTIC = False

    class BaseModel:  # type: ignore
        """Lightweight dataclass-like fallback when pydantic is unavailable."""
        def __init__(self, **kwargs: Any) -> None:
            for k, v in kwargs.items():
                setattr(self, k, v)

        def dict(self) -> Dict[str, Any]:
            return {k: v for k, v in self.__dict__.items() if not k.startswith("_")}

        def model_dump(self) -> Dict[str, Any]:
            return self.dict()

    def Field(*args: Any, **kwargs: Any) -> Any:  # type: ignore
        return kwargs.get("default", None)

    def validator(*args: Any, **kwargs: Any) -> Any:  # type: ignore
        def decorator(f: Any) -> Any:
            return f
        return decorator


def validate_confidence_range(val: Any) -> float:
    """Validates and normalizes confidence to 0.0 - 1.0."""
    try:
        f = float(val)
    except (TypeError, ValueError):
        raise ValueError("Confidence must be a valid float.")
    if f < 0.0 or f > 1.0:
        raise ValueError(f"Confidence score {f} must be between 0.0 and 1.0.")
    return round(f, 4)


class IntentDetail(BaseModel):
    label: str = "Other"
    confidence: float = 0.0
    evidence: str = ""

    def __init__(self, **data: Any) -> None:
        if "confidence" in data:
            data["confidence"] = validate_confidence_range(data["confidence"])
        super().__init__(**data)


class SentimentDetail(BaseModel):
    label: str = "Neutral"
    confidence: float = 0.0
    evidence: str = ""

    def __init__(self, **data: Any) -> None:
        if "confidence" in data:
            data["confidence"] = validate_confidence_range(data["confidence"])
        super().__init__(**data)


class ObjectionSchema(BaseModel):
    category: str
    description: str = ""
    confidence: float = 0.0
    timestamp: float = 0.0
    evidence: str = ""

    def __init__(self, **data: Any) -> None:
        if "category" not in data or not str(data["category"]).strip():
            raise ValueError("Objection must specify a non-empty category.")
        if "confidence" in data:
            data["confidence"] = validate_confidence_range(data["confidence"])
        if "timestamp" in data:
            ts = float(data["timestamp"])
            if ts < 0.0:
                ts = 0.0
            data["timestamp"] = round(ts, 3)
        super().__init__(**data)


class KeywordSchema(BaseModel):
    keyword: str
    relevance: float = 0.0
    frequency: int = 1
    timestamps: List[float] = []

    def __init__(self, **data: Any) -> None:
        if "keyword" not in data or not str(data["keyword"]).strip():
            raise ValueError("Keyword item must specify a non-empty keyword.")
        if "relevance" in data:
            data["relevance"] = validate_confidence_range(data["relevance"])
        if "frequency" in data:
            data["frequency"] = max(1, int(data["frequency"]))
        if "timestamps" in data and isinstance(data["timestamps"], list):
            data["timestamps"] = [round(float(t), 3) for t in data["timestamps"] if float(t) >= 0.0]
        super().__init__(**data)


class AnalysisBase(BaseModel):
    call_id: str
    transcript_id: Optional[str] = None
    intent: IntentDetail
    sentiment: SentimentDetail
    objections: List[ObjectionSchema] = []
    keywords: List[KeywordSchema] = []
    summary: str = ""
    key_points: List[str] = []
    customer_needs: List[str] = []
    concerns: List[str] = []
    next_steps: List[str] = []
    model: str = "unknown"
    provider: str = "unknown"


class AnalysisCreate(BaseModel):
    call_id: str
    transcript_id: Optional[str] = None

    # Intent fields
    intent: str = "Other"
    intent_confidence: float = 0.0
    intent_evidence: str = ""

    # Sentiment fields
    sentiment: str = "Neutral"
    sentiment_confidence: float = 0.0
    sentiment_evidence: str = ""

    # Nested structures
    objections: List[Dict[str, Any]] = []
    keywords: List[Dict[str, Any]] = []

    # Summary fields
    summary: str = ""
    key_points: List[str] = []
    customer_needs: List[str] = []
    concerns: List[str] = []
    next_steps: List[str] = []

    # Provenance
    model: str = "unknown"
    provider: str = "unknown"
    analyzed_at: Optional[datetime] = None

    def __init__(self, **data: Any) -> None:
        if not data.get("call_id"):
            raise ValueError("call_id is required.")
        if "intent_confidence" in data:
            data["intent_confidence"] = validate_confidence_range(data["intent_confidence"])
        if "sentiment_confidence" in data:
            data["sentiment_confidence"] = validate_confidence_range(data["sentiment_confidence"])
        super().__init__(**data)


class AnalysisUpdate(BaseModel):
    """Optional update payload for an existing AI Analysis record."""
    intent: Optional[str] = None
    intent_confidence: Optional[float] = None
    intent_evidence: Optional[str] = None
    sentiment: Optional[str] = None
    sentiment_confidence: Optional[float] = None
    sentiment_evidence: Optional[str] = None
    objections: Optional[List[Dict[str, Any]]] = None
    keywords: Optional[List[Dict[str, Any]]] = None
    summary: Optional[str] = None
    key_points: Optional[List[str]] = None
    customer_needs: Optional[List[str]] = None
    concerns: Optional[List[str]] = None
    next_steps: Optional[List[str]] = None

    def __init__(self, **data: Any) -> None:
        if "intent_confidence" in data and data["intent_confidence"] is not None:
            data["intent_confidence"] = validate_confidence_range(data["intent_confidence"])
        if "sentiment_confidence" in data and data["sentiment_confidence"] is not None:
            data["sentiment_confidence"] = validate_confidence_range(data["sentiment_confidence"])
        super().__init__(**data)


class AnalysisResponse(BaseModel):
    id: str
    call_id: str
    transcript_id: Optional[str] = None
    intent: IntentDetail
    sentiment: SentimentDetail
    objections: List[ObjectionSchema] = []
    keywords: List[KeywordSchema] = []
    summary: str = ""
    key_points: List[str] = []
    customer_needs: List[str] = []
    concerns: List[str] = []
    next_steps: List[str] = []
    model: str = "unknown"
    provider: str = "unknown"
    analyzed_at: str = ""
    created_at: str = ""
    updated_at: str = ""

    @classmethod
    def from_orm(cls, obj: Any) -> "AnalysisResponse":
        """Converts an AIAnalysis SQLAlchemy model instance into an AnalysisResponse schema."""
        d = obj.to_dict() if hasattr(obj, "to_dict") else obj
        intent_info = d.get("intent", {})
        if isinstance(intent_info, dict):
            intent_detail = IntentDetail(
                label=intent_info.get("label", "Other"),
                confidence=intent_info.get("confidence", 0.0),
                evidence=intent_info.get("evidence", ""),
            )
        else:
            intent_detail = IntentDetail(label=str(intent_info))

        sentiment_info = d.get("sentiment", {})
        if isinstance(sentiment_info, dict):
            sentiment_detail = SentimentDetail(
                label=sentiment_info.get("label", "Neutral"),
                confidence=sentiment_info.get("confidence", 0.0),
                evidence=sentiment_info.get("evidence", ""),
            )
        else:
            sentiment_detail = SentimentDetail(label=str(sentiment_info))

        objections = [
            ObjectionSchema(
                category=o.get("category", "Other"),
                description=o.get("description", ""),
                confidence=o.get("confidence", 0.0),
                timestamp=o.get("timestamp", 0.0),
                evidence=o.get("evidence", ""),
            )
            for o in d.get("objections", [])
            if isinstance(o, dict)
        ]

        keywords = [
            KeywordSchema(
                keyword=k.get("keyword", ""),
                relevance=k.get("relevance", 0.0),
                frequency=k.get("frequency", 1),
                timestamps=k.get("timestamps", []),
            )
            for k in d.get("keywords", [])
            if isinstance(k, dict)
        ]

        return cls(
            id=str(d.get("id")),
            call_id=str(d.get("call_id")),
            transcript_id=d.get("transcript_id"),
            intent=intent_detail,
            sentiment=sentiment_detail,
            objections=objections,
            keywords=keywords,
            summary=d.get("summary", ""),
            key_points=d.get("key_points", []) or [],
            customer_needs=d.get("customer_needs", []) or [],
            concerns=d.get("concerns", []) or [],
            next_steps=d.get("next_steps", []) or [],
            model=d.get("model", "unknown"),
            provider=d.get("provider", "unknown"),
            analyzed_at=str(d.get("analyzed_at", "")),
            created_at=str(d.get("created_at", "")),
            updated_at=str(d.get("updated_at", "")),
        )
