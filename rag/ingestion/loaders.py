import logging
from concurrent.futures import ThreadPoolExecutor, TimeoutError as FutureTimeoutError
from dataclasses import dataclass, field
from pathlib import Path
from typing import Any

from rag.settings import get_settings

logger = logging.getLogger(__name__)

# Dedicated pool so a timed-out load's thread (which Python cannot forcibly kill) is
# simply abandoned rather than blocking the caller; small size keeps abandoned-thread
# buildup bounded even if many files time out in one run.
_LOAD_EXECUTOR = ThreadPoolExecutor(max_workers=4, thread_name_prefix="doc-loader")

# Folders that must never be treated as content, wherever they appear under data_dir.
SKIP_DIR_NAMES = {"_TO_DELETE_MANUALLY", "_build_tools", "__pycache__", ".git"}

SUPPORTED_EXTENSIONS = {".pdf", ".txt", ".csv", ".xlsx", ".docx", ".json"}


@dataclass
class RawDocument:
    """A single loaded page/section of a source file, before chunking."""

    text: str
    metadata: dict[str, Any] = field(default_factory=dict)


def _is_skipped(path: Path) -> bool:
    return any(part in SKIP_DIR_NAMES for part in path.parts)


def extract_path_metadata(file_path: Path, data_root: Path) -> dict[str, Any]:
    """Derive category/department/doc_type from the RAG-friendly folder structure under data/.

    e.g. data/custom_dataset_build/academics/departments/ece/faculty.txt ->
         {dataset: custom_dataset_build, category: academics, department: ece, doc_type: faculty}
    """
    rel_parts = file_path.relative_to(data_root).parts
    dataset = rel_parts[0] if rel_parts else "unknown"
    category = rel_parts[1] if len(rel_parts) > 1 else "root"
    department = None

    lower_parts = [p.lower() for p in rel_parts]
    for anchor in ("departments", "staff_cvs"):
        if anchor in lower_parts:
            idx = lower_parts.index(anchor)
            if idx + 1 < len(rel_parts) - 1:  # there must still be a filename after it
                department = rel_parts[idx + 1].lower()
            break

    doc_type = file_path.stem.lower()

    return {
        "source": str(file_path.relative_to(data_root)).replace("\\", "/"),
        "dataset": dataset,
        "category": category,
        "department": department or "",
        "doc_type": doc_type,
    }


def iter_source_files(data_dir: str) -> list[Path]:
    data_root = Path(data_dir).resolve()
    files = [
        p
        for p in data_root.rglob("*")
        if p.is_file() and p.suffix.lower() in SUPPORTED_EXTENSIONS and not _is_skipped(p)
    ]
    return sorted(files)


def load_file(file_path: Path, data_root: Path) -> list[RawDocument]:
    """Load one source file into one or more RawDocuments, tagged with path metadata."""
    from langchain_community.document_loaders import (
        CSVLoader,
        Docx2txtLoader,
        JSONLoader,
        PyPDFLoader,
        TextLoader,
    )
    from langchain_community.document_loaders.excel import UnstructuredExcelLoader

    ext = file_path.suffix.lower()
    path_meta = extract_path_metadata(file_path, data_root)

    try:
        if ext == ".pdf":
            loaded = PyPDFLoader(str(file_path)).load()
        elif ext == ".txt":
            loaded = TextLoader(str(file_path), encoding="utf-8").load()
        elif ext == ".csv":
            loaded = CSVLoader(str(file_path)).load()
        elif ext == ".xlsx":
            loaded = UnstructuredExcelLoader(str(file_path)).load()
        elif ext == ".docx":
            loaded = Docx2txtLoader(str(file_path)).load()
        elif ext == ".json":
            loaded = JSONLoader(str(file_path), jq_schema=".", text_content=False).load()
        else:
            return []
    except Exception as exc:  # noqa: BLE001 - a single bad file must not abort ingestion
        logger.warning("Failed to load %s: %s", file_path, exc)
        return []

    docs: list[RawDocument] = []
    for lc_doc in loaded:
        if not lc_doc.page_content or not lc_doc.page_content.strip():
            continue
        # path_meta wins on key collisions (e.g. loader's raw absolute "source") so every
        # chunk carries the clean relative path + department/category tags, not loader noise.
        merged_meta = {**lc_doc.metadata, **path_meta}
        docs.append(RawDocument(text=lc_doc.page_content, metadata=merged_meta))
    return docs


def load_file_guarded(file_path: Path, data_root: Path) -> list[RawDocument]:
    """load_file, but abandoned (not crashed) if it exceeds the configured timeout —
    protects ingestion from a single malformed file or blocked network call (e.g. an
    unstructured/NLTK data fetch) hanging the whole run indefinitely."""
    timeout = get_settings().ingestion_file_timeout_seconds
    future = _LOAD_EXECUTOR.submit(load_file, file_path, data_root)
    try:
        return future.result(timeout=timeout)
    except FutureTimeoutError:
        logger.warning("Timed out loading %s after %ss, skipping", file_path, timeout)
        return []


def load_all_documents(data_dir: str) -> list[RawDocument]:
    data_root = Path(data_dir).resolve()
    files = iter_source_files(data_dir)
    logger.info("Found %d source files under %s", len(files), data_root)

    all_docs: list[RawDocument] = []
    for file_path in files:
        all_docs.extend(load_file_guarded(file_path, data_root))

    logger.info("Loaded %d raw documents from %d files", len(all_docs), len(files))
    return all_docs
