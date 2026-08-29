"""Text embedding module using SentenceTransformers with in-memory caching and fallback."""

import logging
import json
from typing import Optional
import numpy as np

logger = logging.getLogger(__name__)

_MODEL = None
_EMBEDDING_CACHE: dict[str, list[float]] = {}


def get_model():
    """Lazy load SentenceTransformer model singleton."""
    global _MODEL
    if _MODEL is None:
        try:
            from sentence_transformers import SentenceTransformer
            from app.config import settings
            logger.info(f"Loading embedding model: {settings.EMBEDDING_MODEL_NAME}")
            _MODEL = SentenceTransformer(settings.EMBEDDING_MODEL_NAME)
            logger.info("Embedding model loaded successfully.")
        except Exception as e:
            logger.warning(f"Could not load SentenceTransformer ({e}). Falling back to statistical embedding.")
            _MODEL = False
    return _MODEL


def _fallback_embed(text: str, dim: int = 384) -> list[float]:
    """
    Deterministic fallback embedding for offline or edge cases.
    Produces a normalized vector using character and word hash distributions.
    """
    if not text:
        return [0.0] * dim
    
    vec = np.zeros(dim, dtype=np.float32)
    words = text.lower().split()
    for w in words:
        h = hash(w) % dim
        vec[h] += 1.0
        # Add character bi-grams
        for i in range(len(w) - 1):
            bg_hash = hash(w[i:i+2]) % dim
            vec[bg_hash] += 0.5
            
    norm = np.linalg.norm(vec)
    if norm > 1e-6:
        vec = vec / norm
    return vec.tolist()


def embed_text(text: Optional[str]) -> list[float]:
    """
    Generate normalized 384-d embedding vector for a given text.
    Uses in-memory cache to avoid redundant computation.
    """
    if not text or not text.strip():
        return [0.0] * 384
        
    cleaned_text = text.strip()
    if cleaned_text in _EMBEDDING_CACHE:
        return _EMBEDDING_CACHE[cleaned_text]
        
    model = get_model()
    if model and model is not False:
        try:
            vec = model.encode(cleaned_text, normalize_embeddings=True)
            result = vec.tolist()
            _EMBEDDING_CACHE[cleaned_text] = result
            return result
        except Exception as e:
            logger.error(f"Error encoding with SentenceTransformer: {e}")
            
    # Fallback
    result = _fallback_embed(cleaned_text, dim=384)
    _EMBEDDING_CACHE[cleaned_text] = result
    return result


def embed_batch(texts: list[str]) -> list[list[float]]:
    """Generate embeddings for a list of texts in batch."""
    return [embed_text(t) for t in texts]


def serialize_embedding(vec: list[float]) -> str:
    """Serialize embedding vector to JSON string for DB storage."""
    return json.dumps(vec)


def deserialize_embedding(json_str: Optional[str]) -> Optional[list[float]]:
    """Deserialize JSON string back into embedding vector."""
    if not json_str:
        return None
    try:
        return json.loads(json_str)
    except Exception:
        return None
