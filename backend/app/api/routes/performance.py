from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.routes.users import get_current_user
from app.core.database import get_db
from app.models.performance import Performance
from app.models.user import User
from app.schemas.performance import PerformanceCreate, PerformanceResponse

router = APIRouter(prefix="/performance", tags=["Performance"])


@router.post("", response_model=PerformanceResponse, status_code=status.HTTP_201_CREATED)
def create_performance(
    request: PerformanceCreate,
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

    performance = Performance(**request.model_dump())

    db.add(performance)
    db.commit()
    db.refresh(performance)

    return performance


@router.get("", response_model=list[PerformanceResponse])
def list_performance(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return db.query(Performance).filter(
        Performance.user_id == current_user.id
    ).all()