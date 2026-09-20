from datetime import datetime

from pydantic import BaseModel, ConfigDict


class FollowUpCreate(BaseModel):
    lead_id: int
    assigned_to: int
    scheduled_at: datetime
    notes: str | None = None


class FollowUpUpdate(BaseModel):
    scheduled_at: datetime | None = None
    status: str | None = None
    notes: str | None = None


class FollowUpResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    lead_id: int
    assigned_to: int
    scheduled_at: datetime
    status: str
    notes: str | None
    created_at: datetime