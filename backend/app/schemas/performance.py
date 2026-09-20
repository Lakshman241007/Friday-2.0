from datetime import datetime

from pydantic import BaseModel, ConfigDict


class PerformanceCreate(BaseModel):
    user_id: int
    calls_handled: int = 0
    successful_calls: int = 0
    conversion_rate: float = 0.0
    performance_score: float = 0.0


class PerformanceResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: int
    calls_handled: int
    successful_calls: int
    conversion_rate: float
    performance_score: float
    recorded_at: datetime