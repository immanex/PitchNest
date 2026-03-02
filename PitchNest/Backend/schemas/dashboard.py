from pydantic import BaseModel
from datetime import datetime

class AIRecommendationRead(BaseModel):
    id: str
    category: str
    content: str

    class Config:
        from_attributes = True

class PitchCreate(BaseModel):
    startup_id: str | None = None
    mode: str = "Practice"
    investor_archetype: str | None = None

class PitchRead(BaseModel):
    id: str
    startup_id: str | None
    mode: str
    investor_archetype: str | None
    overall_score: float | None
    communication_score: float | None
    clarity_score: float | None
    market_fit_score: float | None
    verdict: str | None
    feedback_summary: str | None
    created_at: datetime
    
    recommendations: list[AIRecommendationRead] = []

    class Config:
        from_attributes = True

class DashboardSummary(BaseModel):
    total_pitches: int
    average_score: float | None
    recent_pitches: list[PitchRead]
