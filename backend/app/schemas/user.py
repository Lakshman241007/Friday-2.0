from pydantic import BaseModel, EmailStr


class UserProfileResponse(BaseModel):
    id: int
    name: str
    email: EmailStr
    role: str
    is_active: bool