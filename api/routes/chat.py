import json
import uuid

from fastapi import APIRouter, Depends
from fastapi.responses import StreamingResponse

from api.deps import enforce_rate_limit, get_client_api_key, get_rag_pipeline
from api.schemas import ChatRequest, ChatResponse, Citation, HistoryMessage, HistoryResponse
from rag.graph.pipeline import RagPipeline
from rag.memory.store import append_message, get_full_history

router = APIRouter()


@router.post("/chat", response_model=ChatResponse, dependencies=[Depends(enforce_rate_limit)])
def chat(
    body: ChatRequest,
    pipeline: RagPipeline = Depends(get_rag_pipeline),
    api_key: str | None = Depends(get_client_api_key),
) -> ChatResponse:
    session_id = body.session_id or str(uuid.uuid4())
    append_message(session_id, "user", body.query)

    result = pipeline.answer(body.query, session_id, api_key=api_key)
    message_id = append_message(session_id, "assistant", result["answer"])

    return ChatResponse(
        session_id=session_id,
        message_id=message_id,
        answer=result["answer"],
        citations=[Citation(**c) for c in result["citations"]],
        route=result["route"],
        latency_ms=result["latency_ms"],
    )


@router.post("/chat/stream", dependencies=[Depends(enforce_rate_limit)])
def chat_stream(
    body: ChatRequest,
    pipeline: RagPipeline = Depends(get_rag_pipeline),
    api_key: str | None = Depends(get_client_api_key),
) -> StreamingResponse:
    session_id = body.session_id or str(uuid.uuid4())
    append_message(session_id, "user", body.query)

    def event_generator():
        full_text: list[str] = []
        for event in pipeline.stream_answer(body.query, session_id, api_key=api_key):
            if event["type"] == "delta":
                full_text.append(event["text"])
                yield f"data: {json.dumps({'type': 'delta', 'text': event['text']})}\n\n"
            else:
                message_id = append_message(session_id, "assistant", "".join(full_text))
                payload = {
                    "type": "done",
                    "session_id": session_id,
                    "message_id": message_id,
                    "citations": event["citations"],
                    "route": event["route"],
                    "latency_ms": event["latency_ms"],
                }
                yield f"data: {json.dumps(payload)}\n\n"

    return StreamingResponse(event_generator(), media_type="text/event-stream")


@router.get("/chat/{session_id}/history", response_model=HistoryResponse)
def chat_history(session_id: str) -> HistoryResponse:
    history = get_full_history(session_id)
    return HistoryResponse(session_id=session_id, messages=[HistoryMessage(**m) for m in history])
