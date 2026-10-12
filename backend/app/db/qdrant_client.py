import logging
import numpy as np

# NumPy 2.0 compatibility for older TensorFlow/Transformers packages
if not hasattr(np, "complex_"):
    np.complex_ = np.complex128
if not hasattr(np, "float_"):
    np.float_ = np.float64

from qdrant_client import QdrantClient
from qdrant_client.http import models
from backend.app.core.config import settings

logger = logging.getLogger("procureos.qdrant")


class LightweightEmbedder:
    """Lightweight fallback vector embedder producing 384-dimensional vectors."""

    def encode(self, text: str) -> np.ndarray:
        vec = np.zeros(384, dtype=np.float32)
        words = text.lower().split()

        for i, word in enumerate(words):
            idx = abs(hash(word)) % 384
            vec[idx] += 1.0 / (i + 1)

        norm = np.linalg.norm(vec)
        if norm > 0:
            vec /= norm

        return vec


_embedding_model = None


def get_embedding_model():
    global _embedding_model

    if _embedding_model is None:
        _embedding_model = LightweightEmbedder()

    return _embedding_model


def get_qdrant_client() -> QdrantClient:
    """Create a Qdrant client supporting local and authenticated cloud instances."""
    return QdrantClient(
        url=settings.QDRANT_URL,
        api_key=settings.QDRANT_API_KEY or None,
        timeout=10.0,
    )


def init_qdrant_collections():
    """Initialize required vector collections when Qdrant is available."""
    client = None

    try:
        client = get_qdrant_client()
        collection_name = "historical_vendor_quotes"

        collections = client.get_collections().collections
        exists = any(
            collection.name == collection_name
            for collection in collections
        )

        if not exists:
            logger.info("Creating Qdrant collection: %s", collection_name)

            client.create_collection(
                collection_name=collection_name,
                vectors_config=models.VectorParams(
                    size=384,
                    distance=models.Distance.COSINE,
                ),
            )

            logger.info(
                "Qdrant collection '%s' created successfully.",
                collection_name,
            )
        else:
            logger.info(
                "Qdrant collection '%s' already exists.",
                collection_name,
            )

    except Exception as exc:
        logger.warning(
            "Qdrant initialization skipped or failed: %s",
            exc,
        )

    finally:
        if client is not None:
            client.close()
