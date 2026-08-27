from rag.memory.db import get_session
from rag.memory.models import ChatSession, Feedback, Message, QueryLog
from rag.settings import get_settings


def _estimate_tokens(text: str) -> int:
    return max(1, len(text) // 4)


def ensure_session(session_id: str) -> None:
    with get_session() as db:
        if db.get(ChatSession, session_id) is None:
            db.add(ChatSession(id=session_id))
            db.commit()


def append_message(session_id: str, role: str, content: str) -> str:
    ensure_session(session_id)
    with get_session() as db:
        msg = Message(session_id=session_id, role=role, content=content)
        db.add(msg)
        db.commit()
        db.refresh(msg)
        return msg.id


def get_history(session_id: str) -> list[dict[str, str]]:
    """Sliding-window (max_history_messages) + token-budget trimmed history: most recent
    turns kept, oldest dropped first — per the memory-scalability fix in
    architecture_analysis.md issue #2."""
    settings = get_settings()
    with get_session() as db:
        rows = (
            db.query(Message)
            .filter(Message.session_id == session_id)
            .order_by(Message.created_at.desc())
            .limit(settings.max_history_messages)
            .all()
        )
        rows_data = [(r.role, r.content) for r in rows]  # detach before session closes

    trimmed: list[dict[str, str]] = []
    budget_used = 0
    for role, content in rows_data:  # rows_data is newest-first; walk newest to oldest
        tokens = _estimate_tokens(content)
        if budget_used + tokens > settings.history_token_budget:
            break
        budget_used += tokens
        trimmed.append({"role": role, "content": content})
    trimmed.reverse()  # chronological order for the prompt
    return trimmed


def get_full_history(session_id: str) -> list[dict[str, str]]:
    """Full chronological transcript with real message ids, for the UI to rehydrate a
    conversation after a reload (unlike get_history(), this isn't windowed/trimmed and
    isn't meant to be fed back into the LLM as-is)."""
    with get_session() as db:
        rows = (
            db.query(Message)
            .filter(Message.session_id == session_id)
            .order_by(Message.created_at.asc())
            .all()
        )
        return [{"id": r.id, "role": r.role, "content": r.content} for r in rows]


def add_feedback(message_id: str, session_id: str, rating: str, comment: str | None = None) -> None:
    with get_session() as db:
        db.add(
            Feedback(message_id=message_id, session_id=session_id, rating=rating, comment=comment)
        )
        db.commit()


def log_query(
    session_id: str,
    query: str,
    route: str,
    latency_ms: float,
    num_internal_docs: int,
    num_web_docs: int,
) -> None:
    with get_session() as db:
        db.add(
            QueryLog(
                session_id=session_id,
                query=query,
                route=route,
                latency_ms=latency_ms,
                num_internal_docs=num_internal_docs,
                num_web_docs=num_web_docs,
            )
        )
        db.commit()
