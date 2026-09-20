from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.routes.users import get_current_user
from app.core.database import get_db
from app.models.call import Call
from app.models.recording import Recording
from app.models.user import User
from app.schemas.recording import RecordingCreate, RecordingResponse

router = APIRouter(prefix="/recordings", tags=["Recordings"])


@router.post(
    "",
    response_model=RecordingResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_recording(
    request: RecordingCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Store a recording reference for an authorized call."""

    call = (
        db.query(Call)
        .filter(Call.id == request.call_id, Call.agent_id == current_user.id)
        .first()
    )

    if call is None:
        raise HTTPException(status_code=404, detail="Call not found")

    recording = Recording(**request.model_dump())

    db.add(recording)
    db.commit()
    db.refresh(recording)

    return recording


@router.get("", response_model=list[RecordingResponse])
def get_recordings(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Return recordings belonging to the authenticated user's calls."""

    return (
        db.query(Recording)
        .join(Call, Recording.call_id == Call.id)
        .filter(Call.agent_id == current_user.id)
        .all()
    )