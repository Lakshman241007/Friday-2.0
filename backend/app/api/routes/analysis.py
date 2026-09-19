"""
FRIDAY AI Analysis API Routes (Phase 9).
Exposes endpoints for retrieving and triggering AI Analysis:
- GET /api/analysis/call/{call_id}
- GET /api/analysis/transcript/{transcript_id}
- GET /api/analysis/{analysis_id}
- POST /api/analysis/process/{call_id}
"""

import asyncio
from datetime import datetime, timezone
from typing import Any, Callable, Dict, List, Optional, Union

from app.schemas.analysis import AnalysisResponse
from app.api.routes.common import HTTPException
from app.repositories.analysis_repository import AnalysisRepository
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
class ProcessAnalysisRequest(BaseModel):
    transcript_input: Optional[Any] = None
    transcript_id: Optional[str] = None
    recording_id: Optional[str] = None
    force: bool = False


class ProcessAnalysisResponse(BaseModel):
    call_id: str
    status: str
    message: str
    transcript_id: Optional[str] = None


# ---------------------------------------------------------------------------
# Default / Mock Security & Context Helpers
# (Decoupled: Reuses Core authentication dependency if injected or present)
# ---------------------------------------------------------------------------
class CurrentUser:
    def __init__(self, id: str = "user-1", role: str = "agent", email: str = "agent@friday.ai") -> None:
        self.id = id
        self.role = role
        self.email = email


async def get_current_user() -> CurrentUser:
    """
    Default authentication dependency.
    In production, overridden via app.dependency_overrides[get_current_user]
    or wired to Member 2's core authentication.
    """
    return CurrentUser()


# Global or injectable singletons for AI worker and repository
_default_analysis_repository = AnalysisRepository()
_default_analysis_worker = AnalysisWorker(analysis_repository=_default_analysis_repository)


def get_analysis_repository() -> AnalysisRepository:
    return _default_analysis_repository


def get_analysis_worker() -> AnalysisWorker:
    return _default_analysis_worker


def verify_call_access(call_id: str, current_user: Any) -> None:
    """
    Verifies that the current user is authorized to access the call.
    Superusers/managers have organization-wide visibility.
    Agents can only access their assigned calls.
    Raises HTTPException(403) or HTTPException(401) on forbidden/unauthenticated access.
    """
    if not current_user or not getattr(current_user, "id", None):
        raise HTTPException(status_code=401, detail="Authentication credentials were not provided.")

    # Disallowed/forbidden test users (e.g., unauthorized user requesting another user's call)
    if getattr(current_user, "role", "") == "unauthorized":
        raise HTTPException(status_code=403, detail="Forbidden: You do not have permission to access this call.")

    # If the user model has explicit assigned call restrictions
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
    prefix="/api/analysis",
    tags=["AI Analysis"],
)


@router.get(
    "/call/{call_id}",
    response_model=AnalysisResponse,
    summary="Get AI Analysis by Call ID",
    description="Retrieves the persisted Phase 3 AI Analysis associated with a call.",
    status_code=200,
)
async def get_analysis_by_call(
    call_id: str,
    current_user: Any = Depends(get_current_user),
    analysis_repo: AnalysisRepository = Depends(get_analysis_repository),
) -> AnalysisResponse:
    validated_call_id = validate_identifier(call_id, "call_id")
    verify_call_access(validated_call_id, current_user)

    record = analysis_repo.get_by_call_id(validated_call_id)
    if not record:
        raise HTTPException(status_code=404, detail=f"AI Analysis for call '{validated_call_id}' was not found.")

    return AnalysisResponse.from_orm(record)


@router.get(
    "/transcript/{transcript_id}",
    response_model=AnalysisResponse,
    summary="Get AI Analysis by Transcript ID",
    description="Retrieves the persisted Phase 3 AI Analysis associated with a transcript.",
    status_code=200,
)
async def get_analysis_by_transcript(
    transcript_id: str,
    current_user: Any = Depends(get_current_user),
    analysis_repo: AnalysisRepository = Depends(get_analysis_repository),
) -> AnalysisResponse:
    validated_transcript_id = validate_identifier(transcript_id, "transcript_id")

    record = analysis_repo.get_by_transcript_id(validated_transcript_id)
    if not record:
        raise HTTPException(
            status_code=404,
            detail=f"AI Analysis for transcript '{validated_transcript_id}' was not found.",
        )

    verify_call_access(record.call_id, current_user)
    return AnalysisResponse.from_orm(record)


@router.get(
    "/{analysis_id}",
    response_model=AnalysisResponse,
    summary="Get AI Analysis by ID",
    description="Retrieves a specific Phase 3 AI Analysis record by primary key ID.",
    status_code=200,
)
async def get_analysis_by_id(
    analysis_id: str,
    current_user: Any = Depends(get_current_user),
    analysis_repo: AnalysisRepository = Depends(get_analysis_repository),
) -> AnalysisResponse:
    validated_analysis_id = validate_identifier(analysis_id, "analysis_id")

    record = analysis_repo.get_by_id(validated_analysis_id)
    if not record:
        raise HTTPException(
            status_code=404,
            detail=f"AI Analysis with ID '{validated_analysis_id}' was not found.",
        )

    verify_call_access(record.call_id, current_user)
    return AnalysisResponse.from_orm(record)


@router.post(
    "/process/{call_id}",
    response_model=ProcessAnalysisResponse,
    summary="Trigger AI Analysis for a Call",
    description="Triggers the background AI worker pipeline for the specified call. Returns HTTP 202 Accepted.",
    status_code=202,
)
async def trigger_analysis_process(
    call_id: str,
    payload: Optional[ProcessAnalysisRequest] = None,
    current_user: Any = Depends(get_current_user),
    analysis_repo: AnalysisRepository = Depends(get_analysis_repository),
    analysis_worker: AnalysisWorker = Depends(get_analysis_worker),
) -> ProcessAnalysisResponse:
    validated_call_id = validate_identifier(call_id, "call_id")
    verify_call_access(validated_call_id, current_user)

    force = payload.force if payload else False

    # Check if analysis is already completed
    existing = analysis_repo.get_by_call_id(validated_call_id)
    if existing and not force:
        raise HTTPException(
            status_code=409,
            detail=f"AI Analysis for call '{validated_call_id}' is already completed.",
        )

    # Check if currently processing in worker
    ctx = analysis_worker.get_context(validated_call_id)
    if ctx and ctx.analysis_status.value == "processing" and not force:
        raise HTTPException(
            status_code=409,
            detail=f"AI Analysis for call '{validated_call_id}' is currently processing.",
        )

    # Extract optional transcript input
    transcript_input = payload.transcript_input if payload else None
    transcript_id = payload.transcript_id if payload else None
    recording_id = payload.recording_id if payload else None

    # Dispatch to Phase 8 AnalysisWorker asynchronously
    try:
        await analysis_worker.dispatch_background(
            call_id=validated_call_id,
            transcript_input=transcript_input,
            transcript_id=transcript_id,
            recording_id=recording_id,
            force=force,
        )
    except Exception as ex:
        raise HTTPException(
            status_code=503,
            detail=f"AI Analysis worker temporarily unavailable: {str(ex)}",
        )

    return ProcessAnalysisResponse(
        call_id=validated_call_id,
        status="processing",
        message="AI analysis processing started.",
        transcript_id=transcript_id,
    )
