"""
FRIDAY AI Recommendation Domain Models (Phase 7).
Defines RecommendationItem, RecommendationResult, RecommendationType, PriorityLevel, and RecommendationSource.
"""

from dataclasses import dataclass, field
from datetime import datetime, timezone
from enum import Enum
from typing import Any, Dict, List, Optional
from app.ai.models.quality_model import EvidenceItem


class RecommendationType(str, Enum):
    FOLLOW_UP = "Follow-up"
    DISCOVERY = "Discovery"
    OBJECTION_HANDLING = "Objection Handling"
    PRODUCT_EXPLANATION = "Product Explanation"
    CLOSING = "Closing"
    COMMUNICATION = "Communication"
    CUSTOMER_ENGAGEMENT = "Customer Engagement"
    SALES_PROCESS = "Sales Process"
    GENERAL_IMPROVEMENT = "General Improvement"


class PriorityLevel(str, Enum):
    HIGH = "high"
    MEDIUM = "medium"
    LOW = "low"


class RecommendationSource(str, Enum):
    ANALYSIS = "analysis"
    OUTCOME = "outcome"
    QUALITY = "quality"
    TRANSCRIPT = "transcript"
    HYBRID = "hybrid"


@dataclass
class RecommendationItem:
    """
    A single evidence-based recommendation for call/sales execution improvement or action.
    """
    type: str  # RecommendationType value
    priority: str  # PriorityLevel value ("high", "medium", "low")
    recommendation: str
    reason: str
    evidence: List[EvidenceItem] = field(default_factory=list)
    source: str = "hybrid"  # RecommendationSource value
    suggested_action: Optional[str] = None

    def to_dict(self) -> Dict[str, Any]:
        return {
            "type": self.type,
            "priority": self.priority,
            "recommendation": self.recommendation,
            "reason": self.reason,
            "evidence": [e.to_dict() if hasattr(e, "to_dict") else e for e in self.evidence],
            "source": self.source,
            "suggested_action": self.suggested_action,
        }


@dataclass
class RecommendationResult:
    """
    Aggregated collection of actionable recommendations for a completed call.
    """
    call_id: Optional[str]
    transcript_id: Optional[str]
    recommendations: List[RecommendationItem] = field(default_factory=list)
    model: str = "unknown"
    provider: str = "unknown"
    generated_at: str = field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

    def to_dict(self) -> Dict[str, Any]:
        return {
            "call_id": self.call_id,
            "transcript_id": self.transcript_id,
            "recommendations": [
                r.to_dict() if hasattr(r, "to_dict") else r for r in self.recommendations
            ],
            "model": self.model,
            "provider": self.provider,
            "generated_at": self.generated_at,
        }
