import logging
import time
from collections import defaultdict
from datetime import datetime, timedelta

from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request

logger = logging.getLogger("api.request")


class RateLimiter:
    """Sliding-window rate limiter, adapted from utils/rate_limiter.py for the new
    settings source (rag/settings.py instead of the legacy config.py)."""

    def __init__(self, max_requests: int, window_seconds: int = 60):
        self.max_requests = max_requests
        self.window_seconds = window_seconds
        self._requests: dict[str, list[datetime]] = defaultdict(list)

    def is_allowed(self, client_id: str) -> bool:
        now = datetime.utcnow()
        window_start = now - timedelta(seconds=self.window_seconds)
        recent = [t for t in self._requests[client_id] if t > window_start]
        if len(recent) >= self.max_requests:
            self._requests[client_id] = recent
            return False
        recent.append(now)
        self._requests[client_id] = recent
        return True


class RequestLoggingMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        start = time.perf_counter()
        response = await call_next(request)
        duration_ms = (time.perf_counter() - start) * 1000
        logger.info(
            "%s %s -> %d (%.1fms)",
            request.method,
            request.url.path,
            response.status_code,
            duration_ms,
        )
        return response
