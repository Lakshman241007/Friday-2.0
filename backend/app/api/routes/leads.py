from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.api.routes.users import get_current_user
from app.models.lead import Lead
from app.models.user import User
from app.schemas.lead import LeadCreate, LeadResponse

router = APIRouter(prefix="/leads", tags=["Leads"])


@router.post(
    "",
    response_model=LeadResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_lead(
    request: LeadCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Create a new lead under the authenticated user."""

    lead = Lead(
        name=request.name,
        email=request.email,
        phone=request.phone,
        company=request.company,
        source=request.source,
        created_by=current_user.id,
    )

    db.add(lead)
    db.commit()
    db.refresh(lead)

    return lead


@router.get("", response_model=list[LeadResponse])
def get_leads(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Return the leads created by the authenticated user."""

    return (
        db.query(Lead)
        .filter(Lead.created_by == current_user.id)
        .all()
    )


@router.get("/{lead_id}", response_model=LeadResponse)
def get_lead(
    lead_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Return one lead belonging to the authenticated user."""

    lead = (
        db.query(Lead)
        .filter(
            Lead.id == lead_id,
            Lead.created_by == current_user.id,
        )
        .first()
    )

    if lead is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Lead not found",
        )

    return lead