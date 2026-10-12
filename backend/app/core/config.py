
import os
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    PROJECT_NAME: str = "ProcureOS"
    API_V1_STR: str = "/api/v1"

    SECRET_KEY: str = "change-this-secret-before-deployment"

    GROQ_API_KEY: str = ""
    DEFAULT_GROQ_MODEL: str = "llama-3.3-70b-versatile"

    GEMINI_API_KEY: str = ""
    DEFAULT_GEMINI_MODEL: str = "gemini-1.5-flash"

    OLLAMA_BASE_URL: str = "http://localhost:11434"
    DEFAULT_OLLAMA_MODEL: str = "llama3.1:8b"

    DATABASE_URL: str = (
        "postgresql+asyncpg://procure_user:procure_password"
        "@localhost:5432/procureagent_db"
    )
    REDIS_URL: str = "redis://localhost:6379/0"

    QDRANT_URL: str = "http://localhost:6333"
    QDRANT_API_KEY: str = ""

    ENABLE_TELEMETRY: bool = False
    PHOENIX_COLLECTOR_ENDPOINT: str = "http://localhost:4317"

    FRONTEND_URL: str = "http://localhost:5173"

    model_config = SettingsConfigDict(
        case_sensitive=True,
        extra="ignore",
    )


settings = Settings()
