from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    APP_NAME: str = "Auth Profile API"
    API_V1_PREFIX: str = "/api/v1"

    ENV: str = "dev"
    SECRET_KEY: str = "CHANGE_ME_TO_A_LONG_RANDOM_SECRET"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60

    DATABASE_URL: str = "postgresql+psycopg://auth_user:StrongPass123@localhost:5432/auth_db"

    # ✅ Add these
    OPENAI_API_KEY: str = ""
    OPENAI_MODEL: str = "gpt-4o-mini"

    class Config:
        env_file = ".env"

settings = Settings()
