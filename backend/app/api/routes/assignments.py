from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.routes.users import get_current_user
from app.core.database import get_db
from app.models.assignment import Assignment
from app.models.lead import Lead
from app.models.user import User
from app.schemas.assignment import (
    AssignmentCreate,
    AssignmentResponse,
)

router = APIRouter(prefix="/assignments", tags=["Assignments"])


@router.post(
    "",
    response_model=AssignmentResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_assignment(
    request: AssignmentCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Assign a lead to an employee."""

    lead = db.query(Lead).filter(Lead.id == request.lead_id).first()

    if lead is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Lead not found",
        )

    employee = (
        db.query(User)
        .filter(
            User.id == request.assigned_to,
            User.is_active.is_(True),
        )
        .first()
    )

    if employee is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Assigned user not found or inactive",
        )

    assignment = Assignment(
        lead_id=request.lead_id,
        assigned_to=request.assigned_to,
        assigned_by=current_user.id,
    )

    db.add(assignment)
    db.commit()
    db.refresh(assignment)

    return assignment


@router.get("", response_model=list[AssignmentResponse])
def get_assignments(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Return assignments created by the authenticated user."""

    return (
        db.query(Assignment)
        .filter(Assignment.assigned_by == current_user.id)
        .all()
    )