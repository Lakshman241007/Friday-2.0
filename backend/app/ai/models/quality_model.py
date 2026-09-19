"""
FRIDAY AI Quality Domain Models.
Defines QualityResult, QualityDimension, and EvidenceItem for Phase 6 Call Quality Engine.
"""

from dataclasses import dataclass, field
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional


@dataclass
class QualityMetric:
    """Minimal score placeholder reserved for legacy imports."""
    metric: str
    score: float
    feedback: Optional[str] = None

    def to_dict(self) -> Dict[str, Any]:
        return {
            "metric": self.metric,
            "score": round(self.score, 2),
            "feedback": self.feedback,
        }


@dataclass
class EvidenceItem:
    """
    Concise transcript evidence grounding a quality dimension or observation.
    """
    text: str
    timestamp: Optional[float] = None
    speaker: Optional[str] = None

    def to_dict(self) -> Dict[str, Any]:
        return {
            "timestamp": round(self.timestamp, 2) if self.timestamp is not None else None,
            "speaker": self.speaker,
            "text": self.text,
        }


@dataclass
class QualityDimension:
    """
    Evaluation of a specific stage or dimension of the call.
    Applicable can be False (e.g. if no objection occurred or stage not applicable).
    Score is 0-100 if applicable, or None if not applicable.
    """
    applicable: bool = True
    score: Optional[float] = None
    strengths: List[str] = field(default_factory=list)
    weaknesses: List[str] = field(default_factory=list)
    evidence: List[EvidenceItem] = field(default_factory=list)

    def to_dict(self) -> Dict[str, Any]:
        return {
            "applicable": self.applicable,
            "score": round(self.score, 2) if self.score is not None else None,
            "strengths": self.strengths,
            "weaknesses": self.weaknesses,
            "evidence": [e.to_dict() if hasattr(e, "to_dict") else e for e in self.evidence],
        }


@dataclass
class QualityResult:
    """
    Comprehensive Call Quality evaluation produced by Phase 6 CallQualityService.
    Evaluates: Opening, Discovery, Explanation, Objection Handling, Closing.
    Calculates overall_score strictly from applicable dimensions.
    """
    call_id: Optional[str]
    transcript_id: Optional[str]
    overall_score: Optional[float]
    opening: QualityDimension
    discovery: QualityDimension
    explanation: QualityDimension
    objection_handling: QualityDimension
    closing: QualityDimension
    strengths: List[str] = field(default_factory=list)
    weaknesses: List[str] = field(default_factory=list)
    evidence: List[EvidenceItem] = field(default_factory=list)
    model: str = "unknown"
    provider: str = "unknown"
    evaluated_at: str = field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

    def to_dict(self) -> Dict[str, Any]:
        return {
            "call_id": self.call_id,
            "transcript_id": self.transcript_id,
            "overall_score": round(self.overall_score, 2) if self.overall_score is not None else None,
            "opening": self.opening.to_dict() if hasattr(self.opening, "to_dict") else self.opening,
            "discovery": self.discovery.to_dict() if hasattr(self.discovery, "to_dict") else self.discovery,
            "explanation": self.explanation.to_dict() if hasattr(self.explanation, "to_dict") else self.explanation,
            "objection_handling": (
                self.objection_handling.to_dict()
                if hasattr(self.objection_handling, "to_dict")
                else self.objection_handling
            ),
            "closing": self.closing.to_dict() if hasattr(self.closing, "to_dict") else self.closing,
            "strengths": self.strengths,
            "weaknesses": self.weaknesses,
            "evidence": [e.to_dict() if hasattr(e, "to_dict") else e for e in self.evidence],
            "model": self.model,
            "provider": self.provider,
            "evaluated_at": self.evaluated_at,
        }
