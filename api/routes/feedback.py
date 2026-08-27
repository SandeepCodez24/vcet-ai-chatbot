from fastapi import APIRouter

from api.schemas import FeedbackRequest
from rag.memory.store import add_feedback

router = APIRouter()


@router.post("/feedback")
def submit_feedback(body: FeedbackRequest) -> dict[str, str]:
    add_feedback(body.message_id, body.session_id, body.rating, body.comment)
    return {"status": "ok"}
