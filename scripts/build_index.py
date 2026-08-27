"""CLI entrypoint: ingest data/ into the Chroma vector store.

Usage:
    python scripts/build_index.py
"""
import logging
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from rag.ingestion.pipeline import run_ingestion  # noqa: E402

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")


def main() -> None:
    stats = run_ingestion()
    print("=" * 60)
    print("Ingestion summary")
    print("=" * 60)
    for key, value in stats.items():
        print(f"{key:20s}: {value}")


if __name__ == "__main__":
    main()
