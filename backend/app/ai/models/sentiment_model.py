"""
FRIDAY Sentiment Analysis Models.
Defines supported sentiment categories and validated result containers.
"""

from dataclasses import dataclass
from enum import Enum
from typing import Any, Dict, Optional


class SentimentCategory(str, Enum):
    """Supported customer / lead sentiment classifications."""
    POSITIVE = "Positive"
    NEUTRAL = "Neutral"
    NEGATIVE = "Negative"
    MIXED = "Mixed"

    @classmethod
    def match(cls, value: Optional[str]) -> "SentimentCategory":
        """Matches raw text or enum values tolerantly to supported sentiment categories."""
        if not value:
            return cls.NEUTRAL

        clean = value.strip().lower()
        if "pos" in clean:
            return cls.POSITIVE
        if "neg" in clean:
            return cls.NEGATIVE
        if "mix" in clean:
            return cls.MIXED
        if "neu" in clean:
            return cls.NEUTRAL
        return cls.NEUTRAL


@dataclass
class SentimentResult:
    """Validated sentiment analysis result."""
    sentiment: str
    confidence: float
    evidence: str

    def to_dict(self) -> Dict[str, Any]:
        return {
            "sentiment": self.sentiment,
            "confidence": round(self.confidence, 4),
            "evidence": self.evidence,
        }
