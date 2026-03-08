from pydantic_settings import BaseSettings
from pydantic import Field


class Settings(BaseSettings):
    PROJECT_NAME: str = "PitchNest Backend"
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7
    DATABASE_URL: str
    GROQ_API_KEY: str | None = None  # legacy, optional
    GEMINI_API_KEY: str | None = None  # primary for AI features 

    class Config:
        env_file = ".env"


settings = Settings()