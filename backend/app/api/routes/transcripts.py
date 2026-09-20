from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.routes.users import get_current_user
from app.core.database import get_db
from app.models.call import Call
from app.models.transcript import Transcript
from app.models.user import User
from app.schemas.transcript import TranscriptCreate, TranscriptResponse

router = APIRouter(prefix="/transcripts", tags=["Transcripts"])


@router.post(
    "",
    response_model=TranscriptResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_transcript(
    request: TranscriptCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Store a transcript for an authorized call."""

    call = (
        db.query(Call)
        .filter(Call.id == request.call_id, Call.agent_id == current_user.id)
        .first()
    )

    if call is None:
        raise HTTPException(status_code=404, detail="Call not found")

    transcript = Transcript(**request.model_dump())

    db.add(transcript)
    db.commit()
    db.refresh(transcript)

    return transcript


@router.get("", response_model=list[TranscriptResponse])
def get_transcripts(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Return transcripts belonging to the authenticated user's calls."""

    return (
        db.query(Transcript)
        .join(Call, Transcript.call_id == Call.id)
        .filter(Call.agent_id == current_user.id)
        .all()
    )