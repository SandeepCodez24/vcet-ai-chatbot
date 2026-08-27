import os
from functools import lru_cache

# huggingface_hub checks for model updates over the network on every load by default,
# even when the model is already fully cached locally — on this environment that
# handshake stalls indefinitely instead of failing fast. The model files are already
# on disk (see rag/settings.py EMBEDDING_MODEL), so force pure offline/cache-only
# loading. Must be set before sentence_transformers/huggingface_hub is imported.
os.environ.setdefault("HF_HUB_OFFLINE", "1")
os.environ.setdefault("TRANSFORMERS_OFFLINE", "1")

from sentence_transformers import SentenceTransformer  # noqa: E402

from rag.settings import get_settings  # noqa: E402


@lru_cache
def get_embedding_model() -> SentenceTransformer:
    """Single shared embedding model instance, used at both ingestion and query time."""
    settings = get_settings()
    return SentenceTransformer(settings.embedding_model)


def embed_texts(texts: list[str]) -> list[list[float]]:
    model = get_embedding_model()
    return model.encode(texts, show_progress_bar=False, normalize_embeddings=True).tolist()


def embed_query(text: str) -> list[float]:
    return embed_texts([text])[0]
