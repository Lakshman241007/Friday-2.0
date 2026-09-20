from datetime import datetime

from pydantic import BaseModel, ConfigDict


class CallCreate(BaseModel):
    lead_id: int
    agent_id: int


class CallUpdate(BaseModel):
    status: str | None = None
    outcome: str | None = None
    notes: str | None = None
    started_at: datetime | None = None
    ended_at: datetime | None = None


class CallResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    lead_id: int
    agent_id: int
    status: str
    outcome: str | None
    notes: str | None
    started_at: datetime | None
    ended_at: datetime | None
    created_at: datetime