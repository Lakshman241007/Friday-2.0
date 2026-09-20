from datetime import datetime

from pydantic import BaseModel, ConfigDict


class AssignmentCreate(BaseModel):
    lead_id: int
    assigned_to: int


class AssignmentResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    lead_id: int
    assigned_to: int
    assigned_by: int
    status: str
    assigned_at: datetime