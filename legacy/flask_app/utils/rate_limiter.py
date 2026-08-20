from collections import defaultdict
from datetime import datetime, timedelta
from typing import Dict
from config import Config

class RateLimiter:
    """Simple rate limiter to prevent API abuse"""
    
    def __init__(self, max_requests=30, window_seconds=60):
        self.max_requests = max_requests
        self.window_seconds = window_seconds
        self.requests: Dict[str, list] = defaultdict(list)
    
    def is_allowed(self, client_id: str) -> bool:
        """Check if request is allowed for client"""
        if not Config.RATE_LIMIT_ENABLED:
            return True
        
        now = datetime.now()
        window_start = now - timedelta(seconds=self.window_seconds)
        
        # Clean old requests
        self.requests[client_id] = [
            req_time for req_time in self.requests[client_id]
            if req_time > window_start
        ]
        
        # Check limit
        if len(self.requests[client_id]) >= self.max_requests:
            return False
        
        # Add current request
        self.requests[client_id].append(now)
        return True
    
    def get_remaining(self, client_id: str) -> int:
        """Get remaining requests for client"""
        now = datetime.now()
        window_start = now - timedelta(seconds=self.window_seconds)
        
        recent_requests = [
            req_time for req_time in self.requests.get(client_id, [])
            if req_time > window_start
        ]
        
        return max(0, self.max_requests - len(recent_requests))

# Global rate limiter instance
rate_limiter = RateLimiter(
    max_requests=Config.MAX_REQUESTS_PER_MINUTE,
    window_seconds=60
)
