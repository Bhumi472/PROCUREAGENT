
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

# Initialize Qdrant vector collections
init_qdrant_collections()


app = FastAPI(
    title="ProcureOS: Autonomous Procurement Operating System",
    description=(
        "Enterprise Multi-Agent B2B Sourcing, Negotiation, "
        "Compliance & ERP Execution Engine"
    ),
    version="1.0.0",
)


# Configure CORS for local development and deployed frontends.
# Set FRONTEND_URL to your frontend URL in the hosting environment.
# Multiple origins can be separated by commas.
allowed_origins = [
    origin.strip().rstrip("/")
    for origin in settings.FRONTEND_URL.split(",")
    if origin.strip()
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Register API routers
app.include_router(
    agents_router,
    prefix=settings.API_V1_STR,
)

app.include_router(
    analytics_router,
    prefix=settings.API_V1_STR,
)


@app.get("/")
async def root():
    return {
        "system": "ProcureOS",
        "tagline": "The Autonomous Procurement Operating System",
        "status": "ONLINE",
        "stack": (
            "Groq / Ollama / Qdrant / PostgreSQL / Redis / Arize Phoenix"
        ),
    }


if __name__ == "__main__":
    uvicorn.run(
        "backend.main:app",
        host="0.0.0.0",
        port=8000,
        reload=False,
    )
