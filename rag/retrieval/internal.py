from dataclasses import dataclass
from typing import Any

from rag.embeddings import embed_query
from rag.settings import get_settings
from rag.vectorstore import get_collection


@dataclass
class InternalResult:
    text: str
    metadata: dict[str, Any]
    similarity: float  # cosine similarity, higher is better (1.0 = identical)


def search_internal(
    query: str,
    top_k: int | None = None,
    where: dict[str, Any] | None = None,
    query_embedding: list[float] | None = None,
) -> list[InternalResult]:
    """query_embedding lets callers search with an embedding derived from something
    other than the raw query text (e.g. a HyDE hypothetical answer) while keeping
    `query` around purely for logging/interface symmetry."""
    settings = get_settings()
    collection = get_collection()
    count = collection.count()
    if count == 0:
        return []

    k = min(top_k or settings.top_k, count)
    embedding = query_embedding if query_embedding is not None else embed_query(query)

    results = collection.query(
        query_embeddings=[embedding],
        n_results=k,
        where=where,
        include=["documents", "metadatas", "distances"],
    )

    docs = results["documents"][0] if results["documents"] else []
    metas = results["metadatas"][0] if results["metadatas"] else []
    dists = results["distances"][0] if results["distances"] else []

    return [
        InternalResult(text=text, metadata=meta, similarity=1.0 - dist)
        for text, meta, dist in zip(docs, metas, dists)
    ]


def merge_results(*result_lists: list[InternalResult]) -> list[InternalResult]:
    """Dedupe candidates pulled from multiple searches (e.g. raw query + HyDE query)
    by (source, chunk_index), keeping the highest similarity seen for each chunk."""
    best: dict[tuple, InternalResult] = {}
    for results in result_lists:
        for r in results:
            key = (r.metadata.get("source"), r.metadata.get("chunk_index"))
            existing = best.get(key)
            if existing is None or r.similarity > existing.similarity:
                best[key] = r
    return sorted(best.values(), key=lambda r: r.similarity, reverse=True)
