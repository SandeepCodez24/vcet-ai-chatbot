from functools import lru_cache

from fastapi import Header, HTTPException, Request

from api.middleware import RateLimiter
from rag.graph.pipeline import RagPipeline, get_pipeline
from rag.settings import get_settings


def get_rag_pipeline() -> RagPipeline:
    return get_pipeline()


@lru_cache
def _rate_limiter() -> RateLimiter:
    settings = get_settings()
    return RateLimiter(max_requests=settings.max_requests_per_minute, window_seconds=60)


def get_client_api_key(x_groq_api_key: str | None = Header(default=None)) -> str | None:
    return x_groq_api_key


def enforce_rate_limit(request: Request, x_groq_api_key: str | None = Header(default=None)) -> None:
    settings = get_settings()
    if x_groq_api_key:
        return  # BYOK bypasses rate limiting, same behavior as the legacy server.py
    if not settings.rate_limit_enabled:
        return
    client_id = request.client.host if request.client else "unknown"
    if not _rate_limiter().is_allowed(client_id):
        raise HTTPException(
            status_code=429, detail="Rate limit exceeded. Please try again later."
        )


def verify_admin_token(x_admin_token: str | None = Header(default=None)) -> None:
    settings = get_settings()
    if not x_admin_token or x_admin_token != settings.admin_token:
        raise HTTPException(status_code=401, detail="Invalid or missing admin token")
