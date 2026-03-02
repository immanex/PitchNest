from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "PitchNest Backend"
    SECRET_KEY: str = "super_secret_temporary_key_for_dev_change_me"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7 
    DATABASE_URL: str = "sqlite+aiosqlite:///./sql_app.db"

settings = Settings()
