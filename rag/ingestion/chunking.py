from dataclasses import dataclass
from typing import Any

from langchain_text_splitters import RecursiveCharacterTextSplitter

from rag.ingestion.loaders import RawDocument
from rag.settings import get_settings


@dataclass
class Chunk:
    text: str
    metadata: dict[str, Any]


def chunk_documents(documents: list[RawDocument]) -> list[Chunk]:
    settings = get_settings()
    splitter = RecursiveCharacterTextSplitter(
        chunk_size=settings.chunk_size,
        chunk_overlap=settings.chunk_overlap,
        length_function=len,
        separators=["\n\n", "\n", ". ", " ", ""],
    )

    chunks: list[Chunk] = []
    for doc in documents:
        pieces = splitter.split_text(doc.text)
        for i, piece in enumerate(pieces):
            chunks.append(Chunk(text=piece, metadata={**doc.metadata, "chunk_index": i}))
    return chunks
