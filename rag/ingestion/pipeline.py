import hashlib
import logging
from pathlib import Path
from typing import Any

from rag.embeddings import embed_texts
from rag.ingestion.chunking import chunk_documents
from rag.ingestion.loaders import iter_source_files, load_file_guarded
from rag.settings import get_settings
from rag.vectorstore import get_collection

logger = logging.getLogger(__name__)

_PRIMITIVE_TYPES = (str, int, float, bool)


def _file_hash(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def _sanitize_metadata(meta: dict[str, Any]) -> dict[str, Any]:
    """Chroma metadata values must be str/int/float/bool — coerce anything else."""
    clean: dict[str, Any] = {}
    for key, value in meta.items():
        if value is None:
            clean[key] = ""
        elif isinstance(value, _PRIMITIVE_TYPES):
            clean[key] = value
        else:
            clean[key] = str(value)
    return clean


def run_ingestion() -> dict[str, int]:
    """Incremental ingest: skip unchanged files (by content hash), re-embed changed/new
    ones, and remove chunks for files that no longer exist on disk."""
    settings = get_settings()
    data_root = Path(settings.data_dir).resolve()
    collection = get_collection()

    files = iter_source_files(settings.data_dir)
    current_sources: set[str] = set()
    stats = {
        "files_scanned": len(files),
        "files_unchanged": 0,
        "files_reindexed": 0,
        "files_failed": 0,
        "chunks_added": 0,
        "sources_removed": 0,
    }

    for i, file_path in enumerate(files, start=1):
        source = str(file_path.relative_to(data_root)).replace("\\", "/")
        current_sources.add(source)
        if i == 1 or i % 25 == 0 or i == len(files):
            logger.info("Processing file %d/%d: %s", i, len(files), source)
        content_hash = _file_hash(file_path)

        existing = collection.get(where={"source": source}, limit=1, include=["metadatas"])
        existing_hash = existing["metadatas"][0].get("content_hash") if existing["ids"] else None

        if existing_hash == content_hash:
            stats["files_unchanged"] += 1
            continue

        # New or changed file: drop its old chunks (if any), then re-embed from scratch.
        collection.delete(where={"source": source})

        raw_docs = load_file_guarded(file_path, data_root)
        chunks = chunk_documents(raw_docs) if raw_docs else []
        if not chunks:
            logger.warning("No extractable text in %s, skipping", source)
            stats["files_failed"] += 1
            continue

        texts = [c.text for c in chunks]
        embeddings = embed_texts(texts)
        ids = [f"{source}::{i}" for i in range(len(chunks))]
        metadatas = [_sanitize_metadata({**c.metadata, "content_hash": content_hash}) for c in chunks]

        collection.add(ids=ids, embeddings=embeddings, documents=texts, metadatas=metadatas)
        stats["files_reindexed"] += 1
        stats["chunks_added"] += len(chunks)

    # Drop chunks belonging to files that were deleted/moved since the last run.
    all_meta = collection.get(include=["metadatas"])
    stale_sources = {
        m.get("source") for m in all_meta["metadatas"] if m.get("source") not in current_sources
    }
    for stale_source in stale_sources:
        if not stale_source:
            continue
        collection.delete(where={"source": stale_source})
        stats["sources_removed"] += 1

    stats["total_chunks"] = collection.count()
    logger.info("Ingestion complete: %s", stats)
    return stats
