# Google Cloud Run image for the FastAPI backend.
# `gcloud run deploy --source .` builds this directly (Cloud Build resolves the repo's
# Git LFS blobs, i.e. chroma_store/, into the build context before this runs — no
# manual `git lfs pull` step needed, same as it would be on any other git-based build).

FROM python:3.11-slim

# hnswlib (a chromadb dependency) can fall back to compiling from source on some
# platforms if no prebuilt wheel matches; gcc keeps that path working either way.
RUN apt-get update && apt-get install -y --no-install-recommends gcc && \
    rm -rf /var/lib/apt/lists/*

# Spaces run containers as a non-root user (uid 1000) by convention.
RUN useradd -m -u 1000 user
USER user
ENV PATH="/home/user/.local/bin:$PATH" HOME=/home/user
WORKDIR /home/user/app

COPY --chown=user requirements.txt .
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

COPY --chown=user . .

# Pre-download the embedding + reranker models while the build still has network
# access — rag/embeddings.py and rag/retrieval/rerank.py force HF_HUB_OFFLINE=1 at
# runtime, so both models must already be cached under $HOME before the app starts.
RUN python scripts/download_models.py

# Cloud Run injects PORT at runtime (defaults to 8080) and expects the container to
# listen on it — shell form (not exec-array form) so $PORT actually expands.
ENV PORT=8080
EXPOSE 8080

CMD exec gunicorn api.main:app -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:$PORT --workers 1 --timeout 180
