from datetime import datetime

from pydantic import BaseModel, ConfigDict


class CoachingCreate(BaseModel):
    user_id: int
    feedback: str
    improvement_plan: str | None = None


class CoachingResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: int
    coach_id: int
    feedback: str
    improvement_plan: str | None
    created_at: datetime