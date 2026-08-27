from pydantic import BaseModel, Field


class ChatRequest(BaseModel):
    query: str = Field(..., min_length=1, max_length=1000)
    session_id: str | None = None


class Citation(BaseModel):
    type: str
    source: str | None = None
    department: str | None = None
    similarity: float | None = None
    title: str | None = None
    url: str | None = None


class ChatResponse(BaseModel):
    session_id: str
    message_id: str
    answer: str
    citations: list[Citation]
    route: str
    latency_ms: float


class HistoryMessage(BaseModel):
    id: str
    role: str
    content: str


class HistoryResponse(BaseModel):
    session_id: str
    messages: list[HistoryMessage]


class FeedbackRequest(BaseModel):
    message_id: str
    session_id: str
    rating: str = Field(..., pattern="^(up|down)$")
    comment: str | None = None


class HealthResponse(BaseModel):
    status: str
    chroma_chunks: int
    groq_configured: bool


class ReindexResponse(BaseModel):
    files_scanned: int
    files_unchanged: int
    files_reindexed: int
    files_failed: int
    chunks_added: int
    sources_removed: int
    total_chunks: int
