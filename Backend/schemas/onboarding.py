from pydantic import BaseModel, Field
from datetime import datetime

class UserProfileCreate(BaseModel):
    role: str = Field(description="E.g., Founder, Student, Coach")
    ai_preferences: dict | None = None

class UserProfileRead(BaseModel):
    id: str
    user_id: str
    role: str
    ai_preferences: dict | None

    class Config:
        from_attributes = True

class StartupProfileCreate(BaseModel):
    company_name: str
    industry: str | None = None
    stage: str | None = None
    description: str | None = None

class StartupProfileRead(StartupProfileCreate):
    id: str
    founder_id: str
    created_at: datetime

    class Config:
        from_attributes = True
