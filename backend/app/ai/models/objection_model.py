"""
FRIDAY Objection Analysis Models.
Defines supported objection categories and validated result containers.
"""

from dataclasses import dataclass
from enum import Enum
from typing import Any, Dict, Optional


class ObjectionCategory(str, Enum):
    """Supported sales objection categories."""
    PRICING = "Pricing"
    FEATURES = "Features"
    TIMING = "Timing"
    COMPETITOR = "Competitor"
    TRUST = "Trust"
    IMPLEMENTATION = "Implementation"
    CONTRACT = "Contract"
    NEED = "Need"
    OTHER = "Other"

    @classmethod
    def match(cls, value: Optional[str]) -> "ObjectionCategory":
        """Matches raw text to supported objection categories."""
        if not value:
            return cls.OTHER

        clean = value.strip().lower()
        if clean in ("pricing", "price", "cost", "budget", "expensive"):
            return cls.PRICING
        if clean in ("features", "feature", "capability", "function"):
            return cls.FEATURES
        if clean in ("timing", "busy", "quarter", "later", "timeline"):
            return cls.TIMING
        if clean in ("competitor", "alternative", "already using"):
            return cls.COMPETITOR
        if clean in ("trust", "credibility", "security", "reputation"):
            return cls.TRUST
        if clean in ("implementation", "integration", "onboarding", "migration"):
            return cls.IMPLEMENTATION
        if clean in ("contract", "terms", "commitment", "legal"):
            return cls.CONTRACT
        if clean in ("need", "value", "priority"):
            return cls.NEED

        if "price" in clean or "cost" in clean or "budget" in clean or "expensive" in clean:
            return cls.PRICING
        if "feature" in clean or "capability" in clean or "function" in clean:
            return cls.FEATURES
        if "timing" in clean or "busy" in clean or "quarter" in clean or "later" in clean or "timeline" in clean:
            return cls.TIMING
        if "competitor" in clean or "alternative" in clean or "already using" in clean:
            return cls.COMPETITOR
        if "trust" in clean or "credibility" in clean or "security" in clean or "reputation" in clean:
            return cls.TRUST
        if "implementation" in clean or "integration" in clean or "onboarding" in clean or "migration" in clean:
            return cls.IMPLEMENTATION
        if "contract" in clean or "terms" in clean or "commitment" in clean or "legal" in clean:
            return cls.CONTRACT
        if "need" in clean or "value" in clean or "priority" in clean:
            return cls.NEED
        return cls.OTHER


@dataclass
class ObjectionItem:
    """Individual validated customer objection."""
    category: str
    description: str
    confidence: float
    timestamp: float
    evidence: str

    def to_dict(self) -> Dict[str, Any]:
        return {
            "category": self.category,
            "description": self.description,
            "confidence": round(self.confidence, 4),
            "timestamp": round(self.timestamp, 3),
            "evidence": self.evidence,
        }
