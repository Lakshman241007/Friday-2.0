from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.routes.users import get_current_user
from app.core.database import get_db
from app.models.call import Call
from app.models.lead import Lead
from app.models.user import User
from app.schemas.call import CallCreate, CallResponse, CallUpdate

router = APIRouter(prefix="/calls", tags=["Calls"])


@router.post(
    "",
    response_model=CallResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_call(
    request: CallCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Create a call record for a lead."""

    lead = db.query(Lead).filter(Lead.id == request.lead_id).first()
    if lead is None:
        raise HTTPException(status_code=404, detail="Lead not found")

    agent = (
        db.query(User)
        .filter(User.id == request.agent_id, User.is_active.is_(True))
        .first()
    )
    if agent is None:
        raise HTTPException(
            status_code=404,
            detail="Agent not found or inactive",
        )

    call = Call(
        lead_id=request.lead_id,
        agent_id=current_user.id,
    )

    db.add(call)
    db.commit()
    db.refresh(call)

    return call


@router.get("", response_model=list[CallResponse])
def get_calls(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Return calls associated with the authenticated user."""

    return db.query(Call).filter(Call.agent_id == current_user.id).all()


@router.patch("/{call_id}", response_model=CallResponse)
def update_call(
    call_id: int,
    request: CallUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Update the status and outcome of a call."""

    call = (
        db.query(Call)
        .filter(Call.id == call_id, Call.agent_id == current_user.id)
        .first()
    )

    if call is None:
        raise HTTPException(status_code=404, detail="Call not found")

    for field, value in request.model_dump(exclude_unset=True).items():
        setattr(call, field, value)

    db.commit()
    db.refresh(call)

    return call