import os
import logging
import json
from typing import Optional
import numpy as np

# Constrain PyTorch thread pools to prevent memory ballooning on 512MB instances
os.environ["OMP_NUM_THREADS"] = "1"
os.environ["MKL_NUM_THREADS"] = "1"
os.environ["OPENBLAS_NUM_THREADS"] = "1"
os.environ["TOKENIZERS_PARALLELISM"] = "false"

logger = logging.getLogger(__name__)

_MODEL = None
_EMBEDDING_CACHE: dict[str, list[float]] = {}


def get_model():
    """Lazy load SentenceTransformer model singleton with memory optimization."""
    global _MODEL
    if _MODEL is None:
        try:
            import torch
            torch.set_num_threads(1)
            try:
                torch.set_num_interop_threads(1)
            except Exception:
                pass
                
            from sentence_transformers import SentenceTransformer
            from app.config import settings
            logger.info(f"Loading embedding model: {settings.EMBEDDING_MODEL_NAME}")
            _MODEL = SentenceTransformer(settings.EMBEDDING_MODEL_NAME, device="cpu")
            _MODEL.eval()
            logger.info("Embedding model loaded successfully (CPU mode, 1 thread).")
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
            import torch
            with torch.inference_mode():
                vec = model.encode(cleaned_text, normalize_embeddings=True, show_progress_bar=False)
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
    """Generate embeddings for a list of texts efficiently in batch."""
    if not texts:
        return []
    
    # Check cache first
    uncached_indices = []
    uncached_texts = []
    results: list[Optional[list[float]]] = [None] * len(texts)
    
    for i, t in enumerate(texts):
        cleaned = t.strip() if t else ""
        if not cleaned:
            results[i] = [0.0] * 384
        elif cleaned in _EMBEDDING_CACHE:
            results[i] = _EMBEDDING_CACHE[cleaned]
        else:
            uncached_indices.append(i)
            uncached_texts.append(cleaned)
            
    if not uncached_texts:
        return [r for r in results if r is not None]
        
    model = get_model()
    if model and model is not False:
        try:
            import torch
            with torch.inference_mode():
                vecs = model.encode(
                    uncached_texts,
                    batch_size=16,
                    normalize_embeddings=True,
                    show_progress_bar=False,
                )
                for idx, orig_idx in enumerate(uncached_indices):
                    vec_list = vecs[idx].tolist()
                    _EMBEDDING_CACHE[uncached_texts[idx]] = vec_list
                    results[orig_idx] = vec_list
        except Exception as e:
            logger.warning(f"Batch encoding fallback: {e}")
            for idx, orig_idx in enumerate(uncached_indices):
                vec_list = _fallback_embed(uncached_texts[idx], dim=384)
                _EMBEDDING_CACHE[uncached_texts[idx]] = vec_list
                results[orig_idx] = vec_list
    else:
        for idx, orig_idx in enumerate(uncached_indices):
            vec_list = _fallback_embed(uncached_texts[idx], dim=384)
            _EMBEDDING_CACHE[uncached_texts[idx]] = vec_list
            results[orig_idx] = vec_list
            
    return [r if r is not None else [0.0] * 384 for r in results]


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
