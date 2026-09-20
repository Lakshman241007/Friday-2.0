from datetime import datetime

from pydantic import BaseModel, ConfigDict


class RecordingCreate(BaseModel):
    call_id: int
    file_url: str
    duration_seconds: int | None = None
    file_format: str | None = None


class RecordingResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    call_id: int
    file_url: str
    duration_seconds: int | None
    file_format: str | None
    created_at: datetime