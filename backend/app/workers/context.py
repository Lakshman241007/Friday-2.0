"""
FRIDAY AI Processing Context and Status Types (Phase 8).
Defines internal pipeline states, error categorization, and AIProcessingContext.
Preserves strict decoupling from Member 2's core database models.
"""

from dataclasses import dataclass, field
from datetime import datetime, timezone
from enum import Enum
from typing import Any, Dict, List, Optional

from app.ai.models.analysis_model import AnalysisResult
from app.ai.models.outcome_model import OutcomeResult
from app.ai.models.quality_model import QualityResult
from app.ai.models.recommendation_model import RecommendationResult
from app.ai.providers.exceptions import AIProviderError


class StageStatus(str, Enum):
    PENDING = "pending"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"
    SKIPPED = "skipped"


class ErrorCategory(str, Enum):
    RETRYABLE = "retryable"
    PERMANENT = "permanent"


def categorize_error(exception: Exception) -> ErrorCategory:
    """
    Categorizes errors into retryable (transient network, timeout, rate limit, unavailable)
    or permanent (invalid data, missing entity, unparseable input).
    """
    # Check underlying cause if wrapped
    target = exception
    if getattr(exception, "__cause__", None) is not None:
        target = exception.__cause__

    if isinstance(target, AIProviderError):
        if getattr(target, "retryable", False):
            return ErrorCategory.RETRYABLE
        if target.status_code in (429, 503, 504):
            return ErrorCategory.RETRYABLE
        return ErrorCategory.PERMANENT

    # Check details dictionary if present (e.g. on TranscriptionError)
    details = getattr(exception, "details", {}) or {}
    if details.get("retryable") is True or details.get("status_code") in (429, 503, 504):
        return ErrorCategory.RETRYABLE

    # Standard network/timeout exceptions
    name = type(target).__name__.lower()
    msg = str(target).lower()

    if any(
        kw in name or kw in msg
        for kw in ["timeout", "ratelimit", "rate_limit", "unavailable", "connectionerror", "503", "504", "429"]
    ):
        return ErrorCategory.RETRYABLE

    return ErrorCategory.PERMANENT


@dataclass
class AIProcessingContext:
    """
    In-memory state context tracking stages of the end-to-end AI analysis workflow.
    """
    call_id: Optional[str] = None
    recording_id: Optional[str] = None
    transcript_id: Optional[str] = None

    # Dialogue content
    transcript_text: str = ""
    transcript_payload: Optional[Any] = None

    # Results of each pipeline stage
    analysis_result: Optional[AnalysisResult] = None
    outcome_result: Optional[OutcomeResult] = None
    quality_result: Optional[QualityResult] = None
    recommendation_result: Optional[RecommendationResult] = None

    # Stage statuses
    analysis_status: StageStatus = StageStatus.PENDING
    outcome_status: StageStatus = StageStatus.PENDING
    quality_status: StageStatus = StageStatus.PENDING
    recommendation_status: StageStatus = StageStatus.PENDING

    # Error tracking
    errors: Dict[str, str] = field(default_factory=dict)
    started_at: str = field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    completed_at: Optional[str] = None

    def to_dict(self) -> Dict[str, Any]:
        overall_status = "completed"
        if any(s == StageStatus.FAILED for s in [self.analysis_status, self.outcome_status, self.quality_status, self.recommendation_status]):
            overall_status = "failed"
        elif any(s == StageStatus.PROCESSING for s in [self.analysis_status, self.outcome_status, self.quality_status, self.recommendation_status]):
            overall_status = "processing"
        elif any(s == StageStatus.PENDING for s in [self.analysis_status, self.outcome_status, self.quality_status, self.recommendation_status]):
            overall_status = "in_progress"

        return {
            "call_id": self.call_id,
            "recording_id": self.recording_id,
            "transcript_id": self.transcript_id,
            "status": overall_status,
            "stages": {
                "analysis": self.analysis_status.value,
                "outcome": self.outcome_status.value,
                "quality": self.quality_status.value,
                "recommendations": self.recommendation_status.value,
            },
            "errors": self.errors,
            "started_at": self.started_at,
            "completed_at": self.completed_at,
        }
