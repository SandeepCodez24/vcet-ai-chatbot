from functools import lru_cache

import chromadb
from chromadb.api.models.Collection import Collection
from chromadb.config import Settings as ChromaSettings

from rag.settings import get_settings


@lru_cache
def get_chroma_client() -> chromadb.ClientAPI:
    settings = get_settings()
    # Telemetry adds a real multi-second startup delay (and can hang entirely on a
    # restricted network) and serves no purpose for this deployment — disable it.
    return chromadb.PersistentClient(
        path=settings.chroma_dir,
        settings=ChromaSettings(anonymized_telemetry=False),
    )


@lru_cache
def get_collection() -> Collection:
    settings = get_settings()
    client = get_chroma_client()
    return client.get_or_create_collection(
        name=settings.chroma_collection,
        metadata={"hnsw:space": "cosine"},
    )
