import os
from functools import lru_cache

# See rag/embeddings.py for why this must be set before sentence_transformers/
# huggingface_hub is imported: it prevents a network update-check that can hang
# indefinitely once the model is already cached locally.
os.environ.setdefault("HF_HUB_OFFLINE", "1")
os.environ.setdefault("TRANSFORMERS_OFFLINE", "1")

from huggingface_hub import snapshot_download  # noqa: E402
from sentence_transformers import CrossEncoder  # noqa: E402
from torch import nn  # noqa: E402

from rag.retrieval.internal import InternalResult  # noqa: E402
from rag.settings import get_settings  # noqa: E402


@lru_cache
def get_reranker() -> CrossEncoder:
    settings = get_settings()
    # transformers' AutoTokenizer.from_pretrained does an unconditional online
    # model_info() lookup (a mistral-regex compatibility check) when given a bare repo
    # id, and that lookup isn't gated by HF_HUB_OFFLINE — it raises instead of skipping.
    # Resolving to the already-cached local snapshot dir first makes the path "local",
    # which short-circuits that check, so loading actually works in offline mode.
    local_path = snapshot_download(repo_id=settings.reranker_model, local_files_only=True)
    return CrossEncoder(local_path)


def rerank(query: str, candidates: list[InternalResult], top_k: int) -> list[InternalResult]:
    """Re-score candidates by feeding (query, doc) pairs jointly through a cross-encoder,
    which is far more accurate than cosine similarity between independently-embedded
    vectors, then keep the top_k. Cheap enough to run per-request since candidates is
    only the retrieval candidate pool (tens of chunks), not the whole corpus."""
    if not candidates:
        return []

    model = get_reranker()
    pairs = [(query, c.text) for c in candidates]
    # bge-reranker-base is trained with a binary-relevance (BCE) objective, so a
    # sigmoid maps its raw logits to a 0-1 relevance score, keeping it comparable
    # to the cosine similarities InternalResult.similarity holds elsewhere.
    scores = model.predict(pairs, activation_fn=nn.Sigmoid())

    reranked = sorted(zip(candidates, scores), key=lambda pair: pair[1], reverse=True)
    return [
        InternalResult(text=c.text, metadata=c.metadata, similarity=float(score))
        for c, score in reranked[:top_k]
    ]
