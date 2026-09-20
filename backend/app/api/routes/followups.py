from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.api.routes.users import get_current_user
from app.models.followup import FollowUp
from app.models.lead import Lead
from app.models.user import User
from app.schemas.followup import (
    FollowUpCreate,
    FollowUpResponse,
    FollowUpUpdate,
)

router = APIRouter(prefix="/follow-ups", tags=["Follow-ups"])


@router.post("", response_model=FollowUpResponse, status_code=status.HTTP_201_CREATED)
def create_follow_up(
    request: FollowUpCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    lead = db.query(Lead).filter(Lead.id == request.lead_id).first()
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")

    assigned_user = (
        db.query(User)
        .filter(User.id == request.assigned_to, User.is_active == True)
        .first()
    )
    if not assigned_user:
        raise HTTPException(status_code=404, detail="Assigned user not found")

    follow_up = FollowUp(
        lead_id=request.lead_id,
        assigned_to=request.assigned_to,
        scheduled_at=request.scheduled_at,
        notes=request.notes,
    )

    db.add(follow_up)
    db.commit()
    db.refresh(follow_up)

    return follow_up


@router.get("", response_model=list[FollowUpResponse])
def list_follow_ups(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return (
        db.query(FollowUp)
        .filter(FollowUp.assigned_to == current_user.id)
        .all()
    )


@router.patch("/{follow_up_id}", response_model=FollowUpResponse)
def update_follow_up(
    follow_up_id: int,
    request: FollowUpUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    follow_up = (
        db.query(FollowUp)
        .filter(
            FollowUp.id == follow_up_id,
            FollowUp.assigned_to == current_user.id,
        )
        .first()
    )

    if not follow_up:
        raise HTTPException(status_code=404, detail="Follow-up not found")

    for field, value in request.model_dump(exclude_unset=True).items():
        setattr(follow_up, field, value)

    db.commit()
    db.refresh(follow_up)

    return follow_up