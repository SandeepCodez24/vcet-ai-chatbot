from fastapi import APIRouter

from api.schemas import HealthResponse
from rag.settings import get_settings
from rag.vectorstore import get_collection

router = APIRouter()


@router.get("/health", response_model=HealthResponse)
def health_check() -> HealthResponse:
    settings = get_settings()
    try:
        chunk_count = get_collection().count()
    except Exception:
        chunk_count = 0
    return HealthResponse(
        status="healthy",
        chroma_chunks=chunk_count,
        groq_configured=bool(settings.groq_api_key),
    )
