"""Pre-download the embedding and re-ranker models into the platform build image's
Hugging Face cache.

rag/embeddings.py and rag/retrieval/rerank.py both force HF_HUB_OFFLINE=1 at runtime
(a cached-model network handshake was hanging in this project's dev environment), so
the *first* time either model is needed it must already be on disk — otherwise the
app crashes on the first chat request instead of just being slow. Run this once during
the platform's build step, while the build container still has real network access.

Usage:
    python scripts/download_models.py
"""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from huggingface_hub import snapshot_download  # noqa: E402

from rag.settings import get_settings  # noqa: E402


def main() -> None:
    settings = get_settings()
    for repo_id in (settings.embedding_model, settings.reranker_model):
        print(f"Downloading {repo_id} ...")
        snapshot_download(repo_id=repo_id)
    print("Done.")


if __name__ == "__main__":
    main()
