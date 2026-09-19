"""
FRIDAY Intent Analysis Models.
Defines supported intent categories and validated result containers.
"""

from dataclasses import dataclass
from enum import Enum
from typing import Any, Dict, Optional


class IntentCategory(str, Enum):
    """Supported customer / call intent categories."""
    PRODUCT_INQUIRY = "Product Inquiry"
    PRICING_INQUIRY = "Pricing Inquiry"
    PURCHASE_INTENT = "Purchase Intent"
    SUPPORT_REQUEST = "Support Request"
    COMPLAINT = "Complaint"
    RENEWAL = "Renewal"
    CANCELLATION = "Cancellation"
    INFORMATION_REQUEST = "Information Request"
    FOLLOW_UP = "Follow-up"
    OTHER = "Other"

    @classmethod
    def match(cls, value: Optional[str]) -> "IntentCategory":
        """Matches raw text or enum values tolerantly to supported categories."""
        if not value:
            return cls.OTHER

        clean = value.strip().lower().replace("_", " ").replace("-", " ")

        mapping = {
            "product inquiry": cls.PRODUCT_INQUIRY,
            "product": cls.PRODUCT_INQUIRY,
            "features": cls.PRODUCT_INQUIRY,
            "pricing inquiry": cls.PRICING_INQUIRY,
            "pricing": cls.PRICING_INQUIRY,
            "price": cls.PRICING_INQUIRY,
            "cost": cls.PRICING_INQUIRY,
            "purchase intent": cls.PURCHASE_INTENT,
            "purchase": cls.PURCHASE_INTENT,
            "buy": cls.PURCHASE_INTENT,
            "buying": cls.PURCHASE_INTENT,
            "support request": cls.SUPPORT_REQUEST,
            "support": cls.SUPPORT_REQUEST,
            "technical support": cls.SUPPORT_REQUEST,
            "complaint": cls.COMPLAINT,
            "escalation": cls.COMPLAINT,
            "renewal": cls.RENEWAL,
            "renew": cls.RENEWAL,
            "cancellation": cls.CANCELLATION,
            "cancel": cls.CANCELLATION,
            "churn": cls.CANCELLATION,
            "information request": cls.INFORMATION_REQUEST,
            "info": cls.INFORMATION_REQUEST,
            "general inquiry": cls.INFORMATION_REQUEST,
            "follow up": cls.FOLLOW_UP,
            "followup": cls.FOLLOW_UP,
            "callback": cls.FOLLOW_UP,
            "other": cls.OTHER,
        }
        return mapping.get(clean, cls.OTHER)


@dataclass
class IntentResult:
    """Validated intent analysis result."""
    intent: str
    confidence: float
    evidence: str

    def to_dict(self) -> Dict[str, Any]:
        return {
            "intent": self.intent,
            "confidence": round(self.confidence, 4),
            "evidence": self.evidence,
        }
