from datetime import datetime

from pydantic import BaseModel, ConfigDict


class TranscriptCreate(BaseModel):
    call_id: int
    text: str


class TranscriptResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    call_id: int
    text: str
    created_at: datetime