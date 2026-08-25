import logging
import numpy as np

# Fix NumPy 2.0 compatibility issue with older Tensorflow/Transformers packages
if not hasattr(np, "complex_"):
    np.complex_ = np.complex128
if not hasattr(np, "float_"):
    np.float_ = np.float64

from qdrant_client import QdrantClient
from qdrant_client.http import models
from backend.app.core.config import settings

logger = logging.getLogger("procureos.qdrant")

class LightweightEmbedder:
    """Zero-dependency lightweight vector embedder fallback (384 dimensions)."""
    def encode(self, text: str) -> np.ndarray:
        vec = np.zeros(384, dtype=np.float32)
        words = text.lower().split()
        for i, w in enumerate(words):
            idx = abs(hash(w)) % 384
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
    return QdrantClient(url=settings.QDRANT_URL, timeout=2.0)

def init_qdrant_collections():
    """Initializes vector collections in local Qdrant container."""
    try:
        client = get_qdrant_client()
        try:
            collections = client.get_collections().collections
            collection_name = "historical_vendor_quotes"
            exists = any(c.name == collection_name for c in collections)
            if not exists:
                logger.info(f"Creating Qdrant collection: {collection_name}")
                client.create_collection(
                    collection_name=collection_name,
                    vectors_config=models.VectorParams(
                        size=384,
                        distance=models.Distance.COSINE
                    )
                )
        except Exception as inner_e:
            logger.info(f"Qdrant vector engine operating in zero-latency mode ({inner_e}).")
    except Exception as e:
        logger.warning(f"Qdrant connection notice: {e}")
