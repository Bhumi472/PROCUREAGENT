import logging
from backend.app.core.config import settings

logger = logging.getLogger("procureagent.telemetry")

def setup_telemetry():
    """Configures OpenTelemetry instrumentation with local Arize Phoenix tracing."""
    if not settings.ENABLE_TELEMETRY:
        logger.info("Telemetry disabled via config.")
        return

    try:
        from openinference.instrumentation.langchain import LangChainInstrumentor
        LangChainInstrumentor().instrument()
        logger.info(
            "OpenTelemetry Auto-Instrumentation active -> Spans streaming to Arize Phoenix (http://localhost:6006)"
        )
    except Exception as e:
        logger.warning(f"Telemetry setup skipped or failed: {e}")
