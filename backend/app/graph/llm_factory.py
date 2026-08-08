import logging
from langchain_core.language_models import BaseChatModel
from backend.app.core.config import settings

logger = logging.getLogger("procureagent.llm")

def get_free_llm() -> BaseChatModel:
    """Instantiates a 100% Free Tier LLM (Groq -> Gemini -> Ollama Local Fallback)."""
    
    # Option 1: Groq API Free Tier (llama-3.3-70b-versatile)
    if settings.GROQ_API_KEY and settings.GROQ_API_KEY != "your_groq_api_key_here":
        try:
            from langchain_groq import ChatGroq
            logger.info("Using Groq API Free Tier (llama-3.3-70b-versatile)")
            return ChatGroq(
                groq_api_key=settings.GROQ_API_KEY,
                model_name=settings.DEFAULT_GROQ_MODEL,
                temperature=0.1
            )
        except Exception as e:
            logger.warning(f"Groq API init failed: {e}. Falling back...")

    # Option 2: Google Gemini Free Tier
    if settings.GEMINI_API_KEY and settings.GEMINI_API_KEY != "your_gemini_api_key_here":
        try:
            from langchain_google_genai import ChatGoogleGenerativeAI
            logger.info("Using Google Gemini Free Tier (gemini-1.5-flash)")
            return ChatGoogleGenerativeAI(
                google_api_key=settings.GEMINI_API_KEY,
                model=settings.DEFAULT_GEMINI_MODEL,
                temperature=0.1
            )
        except Exception as e:
            logger.warning(f"Gemini API init failed: {e}. Falling back...")

    # Option 3: Local Ollama (100% Offline Free)
    try:
        from langchain_community.chat_models import ChatOllama
        logger.info(f"Using Local Ollama (100% free offline model: {settings.DEFAULT_OLLAMA_MODEL})")
        return ChatOllama(
            base_url=settings.OLLAMA_BASE_URL,
            model=settings.DEFAULT_OLLAMA_MODEL,
            temperature=0.1
        )
    except Exception as e:
        logger.error(f"Ollama fallback error: {e}")
        # Return fallback lightweight local mock model wrapper if offline
        from langchain_community.chat_models import FakeListChatModel
        return FakeListChatModel(responses=["Automated Agent Response"])
