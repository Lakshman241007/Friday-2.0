"""
FRIDAY AI Outcome API Routes (Phase 9).
Exposes endpoints for retrieving and triggering AI Call Outcomes:
- GET /api/outcomes/call/{call_id}
- GET /api/outcomes/transcript/{transcript_id}
- GET /api/outcomes/{outcome_id}
- POST /api/outcomes/process/{call_id}
"""

import asyncio
from typing import Any, Callable, Dict, List, Optional

from app.models.outcome import OutcomeCategory
from app.schemas.outcome import OutcomeResponse
from app.api.routes.common import HTTPException
from app.repositories.analysis_repository import AnalysisRepository
from app.repositories.outcome_repository import OutcomeRepository
from app.services.ai.outcome_service import OutcomeService
from app.workers.analysis_worker import AnalysisWorker

# Try importing FastAPI/Pydantic components or establish universal routing shims
try:
    from fastapi import APIRouter, Depends, Query, Request, Response, status  # type: ignore
    from pydantic import BaseModel  # type: ignore
    HAS_FASTAPI = True
except ImportError:
    HAS_FASTAPI = False

    class APIRouter:
        def __init__(self, *args: Any, **kwargs: Any) -> None:
            self.prefix = kwargs.get("prefix", "")
            self.tags = kwargs.get("tags", [])
            self.routes: List[Dict[str, Any]] = []

        def get(self, path: str, *args: Any, **kwargs: Any) -> Callable:
            def decorator(fn: Callable) -> Callable:
                self.routes.append({"method": "GET", "path": path, "endpoint": fn, "kwargs": kwargs})
                return fn
            return decorator

        def post(self, path: str, *args: Any, **kwargs: Any) -> Callable:
            def decorator(fn: Callable) -> Callable:
                self.routes.append({"method": "POST", "path": path, "endpoint": fn, "kwargs": kwargs})
                return fn
            return decorator

    def Depends(dependency: Any = None) -> Any:
        return dependency

    class BaseModel:  # type: ignore
        def __init__(self, **kwargs: Any) -> None:
            for k, v in kwargs.items():
                setattr(self, k, v)

        def dict(self) -> Dict[str, Any]:
            return {k: v for k, v in self.__dict__.items() if not k.startswith("_")}

        def model_dump(self) -> Dict[str, Any]:
            return self.dict()


# ---------------------------------------------------------------------------
# Request / Response Schemas for Async Processing
# ---------------------------------------------------------------------------
class ProcessOutcomeRequest(BaseModel):
    transcript_input: Optional[Any] = None
    transcript_id: Optional[str] = None
    force: bool = False


class ProcessOutcomeResponse(BaseModel):
    call_id: str
    status: str
    message: str
    transcript_id: Optional[str] = None


# ---------------------------------------------------------------------------
# Security & Context Dependencies
# (Decoupled: Reuses Core authentication dependency if injected or present)
# ---------------------------------------------------------------------------
class CurrentUser:
    def __init__(self, id: str = "user-1", role: str = "agent", email: str = "agent@friday.ai") -> None:
        self.id = id
        self.role = role
        self.email = email


async def get_current_user() -> CurrentUser:
    """Default authentication dependency."""
    return CurrentUser()


_default_outcome_repository = OutcomeRepository()
_default_analysis_repository = AnalysisRepository()
_default_analysis_worker = AnalysisWorker(
    analysis_repository=_default_analysis_repository,
    outcome_repository=_default_outcome_repository,
)


def get_outcome_repository() -> OutcomeRepository:
    return _default_outcome_repository


def get_analysis_repository() -> AnalysisRepository:
    return _default_analysis_repository


def get_analysis_worker() -> AnalysisWorker:
    return _default_analysis_worker


def verify_call_access(call_id: str, current_user: Any) -> None:
    """Verifies user authorization to access call data."""
    if not current_user or not getattr(current_user, "id", None):
        raise HTTPException(status_code=401, detail="Authentication credentials were not provided.")

    if getattr(current_user, "role", "") == "unauthorized":
        raise HTTPException(status_code=403, detail="Forbidden: You do not have permission to access this call.")

    accessible_calls = getattr(current_user, "accessible_call_ids", None)
    if accessible_calls is not None and call_id not in accessible_calls:
        raise HTTPException(status_code=403, detail="Forbidden: You do not have permission to access this call.")


def validate_identifier(val: str, name: str = "ID") -> str:
    """Ensures identifier parameter is valid non-empty string."""
    if not val or not str(val).strip():
        raise HTTPException(status_code=400, detail=f"Invalid {name}: cannot be empty.")
    clean = str(val).strip()
    if any(c in clean for c in [" ", "/", "\\", "\0", "<", ">", ";"]):
        raise HTTPException(status_code=400, detail=f"Invalid {name} format.")
    return clean


# ---------------------------------------------------------------------------
# Router Definition
# ---------------------------------------------------------------------------
router = APIRouter(
    prefix="/api/outcomes",
    tags=["AI Outcomes"],
)


@router.get(
    "/call/{call_id}",
    response_model=OutcomeResponse,
    summary="Get Outcome by Call ID",
    description="Retrieves the persisted Phase 5 Outcome associated with a call.",
    status_code=200,
)
async def get_outcome_by_call(
    call_id: str,
    current_user: Any = Depends(get_current_user),
    outcome_repo: OutcomeRepository = Depends(get_outcome_repository),
) -> OutcomeResponse:
    validated_call_id = validate_identifier(call_id, "call_id")
    verify_call_access(validated_call_id, current_user)

    record = outcome_repo.get_by_call_id(validated_call_id)
    if not record:
        raise HTTPException(status_code=404, detail=f"Outcome for call '{validated_call_id}' was not found.")

    return OutcomeResponse.from_orm(record)


@router.get(
    "/transcript/{transcript_id}",
    response_model=OutcomeResponse,
    summary="Get Outcome by Transcript ID",
    description="Retrieves the persisted Phase 5 Outcome associated with a transcript.",
    status_code=200,
)
async def get_outcome_by_transcript(
    transcript_id: str,
    current_user: Any = Depends(get_current_user),
    outcome_repo: OutcomeRepository = Depends(get_outcome_repository),
) -> OutcomeResponse:
    validated_transcript_id = validate_identifier(transcript_id, "transcript_id")

    record = outcome_repo.get_by_transcript_id(validated_transcript_id)
    if not record:
        raise HTTPException(
            status_code=404,
            detail=f"Outcome for transcript '{validated_transcript_id}' was not found.",
        )

    verify_call_access(record.call_id, current_user)
    return OutcomeResponse.from_orm(record)


@router.get(
    "/{outcome_id}",
    response_model=OutcomeResponse,
    summary="Get Outcome by ID",
    description="Retrieves a specific Phase 5 Outcome record by primary key ID.",
    status_code=200,
)
async def get_outcome_by_id(
    outcome_id: str,
    current_user: Any = Depends(get_current_user),
    outcome_repo: OutcomeRepository = Depends(get_outcome_repository),
) -> OutcomeResponse:
    validated_outcome_id = validate_identifier(outcome_id, "outcome_id")

    record = outcome_repo.get_by_id(validated_outcome_id)
    if not record:
        raise HTTPException(
            status_code=404,
            detail=f"Outcome with ID '{validated_outcome_id}' was not found.",
        )

    verify_call_access(record.call_id, current_user)
    return OutcomeResponse.from_orm(record)


@router.post(
    "/process/{call_id}",
    response_model=ProcessOutcomeResponse,
    summary="Trigger Outcome Processing for a Call",
    description="Triggers outcome processing for a call. Requires Phase 3 analysis to be completed. Returns HTTP 202 Accepted.",
    status_code=202,
)
async def trigger_outcome_process(
    call_id: str,
    payload: Optional[ProcessOutcomeRequest] = None,
    current_user: Any = Depends(get_current_user),
    analysis_repo: AnalysisRepository = Depends(get_analysis_repository),
    outcome_repo: OutcomeRepository = Depends(get_outcome_repository),
    analysis_worker: AnalysisWorker = Depends(get_analysis_worker),
) -> ProcessOutcomeResponse:
    validated_call_id = validate_identifier(call_id, "call_id")
    verify_call_access(validated_call_id, current_user)

    force = payload.force if payload else False

    # Check dependency validation: Analysis MUST be completed first
    analysis_record = analysis_repo.get_by_call_id(validated_call_id)
    worker_ctx = analysis_worker.get_context(validated_call_id)
    analysis_completed = (
        (analysis_record is not None)
        or (worker_ctx is not None and worker_ctx.analysis_status.value in ("completed", "skipped"))
    )

    if not analysis_completed:
        raise HTTPException(
            status_code=409,
            detail="AI analysis must be completed before outcome processing.",
        )

    # Check if outcome is already completed
    existing_outcome = outcome_repo.get_by_call_id(validated_call_id)
    if existing_outcome and not force:
        raise HTTPException(
            status_code=409,
            detail=f"Outcome for call '{validated_call_id}' is already completed.",
        )

    # Check if currently processing
    if worker_ctx and worker_ctx.outcome_status.value == "processing" and not force:
        raise HTTPException(
            status_code=409,
            detail=f"Outcome for call '{validated_call_id}' is currently processing.",
        )

    transcript_input = payload.transcript_input if payload else None
    transcript_id = payload.transcript_id if payload else None

    # Dispatch via Phase 8 worker architecture
    try:
        await analysis_worker.dispatch_background(
            call_id=validated_call_id,
            transcript_input=transcript_input,
            transcript_id=transcript_id,
            force=force,
        )
    except Exception as ex:
        raise HTTPException(
            status_code=503,
            detail=f"AI Outcome worker temporarily unavailable: {str(ex)}",
        )

    return ProcessOutcomeResponse(
        call_id=validated_call_id,
        status="processing",
        message="AI outcome processing started.",
        transcript_id=transcript_id,
    )
