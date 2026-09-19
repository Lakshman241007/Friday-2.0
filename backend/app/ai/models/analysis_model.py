"""
FRIDAY AI Analysis Domain Models.
Defines Keyword, Summary, and aggregate AnalysisResult containers.
"""

from dataclasses import dataclass, field
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional

from .intent_model import IntentResult
from .sentiment_model import SentimentResult
from .objection_model import ObjectionItem


@dataclass
class KeywordItem:
    """Extracted meaningful keyword or discussion topic."""
    keyword: str
    relevance: float
    frequency: int
    timestamps: List[float] = field(default_factory=list)

    def to_dict(self) -> Dict[str, Any]:
        return {
            "keyword": self.keyword,
            "relevance": round(self.relevance, 4),
            "frequency": self.frequency,
            "timestamps": [round(ts, 3) for ts in self.timestamps],
        }


@dataclass
class SummaryResult:
    """Structured factual summary of the call conversation."""
    summary: str
    key_points: List[str] = field(default_factory=list)
    customer_needs: List[str] = field(default_factory=list)
    concerns: List[str] = field(default_factory=list)
    next_steps: List[str] = field(default_factory=list)

    def to_dict(self) -> Dict[str, Any]:
        return {
            "summary": self.summary,
            "key_points": self.key_points,
            "customer_needs": self.customer_needs,
            "concerns": self.concerns,
            "next_steps": self.next_steps,
        }


@dataclass
class AnalysisResult:
    """Consolidated in-memory result produced by Phase 3 Analysis Engine."""
    call_id: Optional[str]
    transcript_id: Optional[str]
    intent: IntentResult
    sentiment: SentimentResult
    objections: List[ObjectionItem]
    keywords: List[KeywordItem]
    summary: SummaryResult
    analyzed_at: str = field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    model: str = "unknown"
    provider: str = "unknown"

    def to_dict(self) -> Dict[str, Any]:
        return {
            "call_id": self.call_id,
            "transcript_id": self.transcript_id,
            "intent": self.intent.to_dict(),
            "sentiment": self.sentiment.to_dict(),
            "objections": [obj.to_dict() for obj in self.objections],
            "keywords": [kw.to_dict() for kw in self.keywords],
            "summary": self.summary.to_dict(),
            "analyzed_at": self.analyzed_at,
            "model": self.model,
            "provider": self.provider,
        }
