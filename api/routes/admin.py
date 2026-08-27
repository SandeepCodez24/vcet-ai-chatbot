from fastapi import APIRouter, Depends

from api.deps import verify_admin_token
from api.schemas import ReindexResponse
from rag.ingestion.pipeline import run_ingestion

router = APIRouter()


@router.post(
    "/admin/reindex",
    response_model=ReindexResponse,
    dependencies=[Depends(verify_admin_token)],
)
def reindex() -> ReindexResponse:
    stats = run_ingestion()
    return ReindexResponse(**stats)
