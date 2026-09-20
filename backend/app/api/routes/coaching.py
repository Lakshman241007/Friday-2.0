from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.routes.users import get_current_user
from app.core.database import get_db
from app.models.coaching import Coaching
from app.models.user import User
from app.schemas.coaching import CoachingCreate, CoachingResponse

router = APIRouter(prefix="/coaching", tags=["Coaching"])


@router.post("", response_model=CoachingResponse, status_code=status.HTTP_201_CREATED)
def create_coaching(
    request: CoachingCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    target_user = (
        db.query(User)
        .filter(User.id == request.user_id, User.is_active == True)
        .first()
    )

    if not target_user:
        raise HTTPException(status_code=404, detail="User not found")

    coaching = Coaching(
        user_id=request.user_id,
        coach_id=current_user.id,
        feedback=request.feedback,
        improvement_plan=request.improvement_plan,
    )

    db.add(coaching)
    db.commit()
    db.refresh(coaching)

    return coaching


@router.get("", response_model=list[CoachingResponse])
def list_coaching(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return db.query(Coaching).filter(
        Coaching.user_id == current_user.id
    ).all()