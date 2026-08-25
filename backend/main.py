import uvicorn
import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.app.core.config import settings
from backend.app.core.telemetry import setup_telemetry
from backend.app.db.qdrant_client import init_qdrant_collections
from backend.app.api.v1.agents import router as agents_router
from backend.app.api.v1.analytics import router as analytics_router

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("procureos")

# Setup Arize Phoenix OpenTelemetry tracing
setup_telemetry()

# Initialize local Qdrant vector collections
init_qdrant_collections()

app = FastAPI(
    title="ProcureOS: Autonomous Procurement Operating System",
    description="Enterprise Multi-Agent B2B Sourcing, Negotiation, Compliance & ERP Execution Engine",
    version="1.0.0"
)

# Enable CORS for React Frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(agents_router, prefix=settings.API_V1_STR)
app.include_router(analytics_router, prefix=settings.API_V1_STR)

@app.get("/")
async def root():
    return {
        "system": "ProcureOS",
        "tagline": "The Autonomous Procurement Operating System",
        "status": "ONLINE",
        "stack": "100% Zero-Cost (Groq / Ollama / Qdrant / Postgres / Redis / Arize Phoenix)"
    }

if __name__ == "__main__":
    uvicorn.run("backend.main:app", host="127.0.0.1", port=8000, reload=False)
