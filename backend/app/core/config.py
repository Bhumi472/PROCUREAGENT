import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "ProcureAgent"
    API_V1_STR: str = "/api/v1"
    SECRET_KEY: str = "procureagent-super-secret-key-change-in-production"
    
    # Free LLM APIs
    GROQ_API_KEY: str = os.getenv("GROQ_API_KEY", "")
    DEFAULT_GROQ_MODEL: str = "llama-3.3-70b-versatile"
    
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    DEFAULT_GEMINI_MODEL: str = "gemini-1.5-flash"
    
    OLLAMA_BASE_URL: str = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434")
    DEFAULT_OLLAMA_MODEL: str = "llama3.1:8b"
    
    # Database Settings
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL",
        "postgresql+asyncpg://procure_user:procure_password@localhost:5432/procureagent_db"
    )
    REDIS_URL: str = os.getenv("REDIS_URL", "redis://localhost:6379/0")
    QDRANT_URL: str = os.getenv("QDRANT_URL", "http://localhost:6333")
    
    # Telemetry
    ENABLE_TELEMETRY: bool = True
    PHOENIX_COLLECTOR_ENDPOINT: str = os.getenv("PHOENIX_COLLECTOR_ENDPOINT", "http://localhost:4317")

    class Config:
        case_sensitive = True

settings = Settings()
