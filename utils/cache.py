from functools import lru_cache
import hashlib
import json
from typing import Any, Dict

class QueryCache:
    """Simple in-memory cache for query responses"""
    
    def __init__(self, max_size=100):
        self.cache = {}
        self.max_size = max_size
        self.access_count = {}
    
    def _get_key(self, query: str) -> str:
        """Generate cache key from query"""
        return hashlib.md5(query.lower().strip().encode()).hexdigest()
    
    def get(self, query: str) -> Any:
        """Get cached response"""
        key = self._get_key(query)
        if key in self.cache:
            self.access_count[key] = self.access_count.get(key, 0) + 1
            return self.cache[key]
        return None
    
    def set(self, query: str, response: Any):
        """Cache response"""
        key = self._get_key(query)
        
        # Remove least accessed item if cache is full
        if len(self.cache) >= self.max_size and key not in self.cache:
            least_used = min(self.access_count.items(), key=lambda x: x[1])[0]
            del self.cache[least_used]
            del self.access_count[least_used]
        
        self.cache[key] = response
        self.access_count[key] = 1
    
    def clear(self):
        """Clear cache"""
        self.cache.clear()
        self.access_count.clear()
    
    def get_stats(self) -> Dict[str, Any]:
        """Get cache statistics"""
        return {
            "size": len(self.cache),
            "max_size": self.max_size,
            "total_accesses": sum(self.access_count.values())
        }

# Global cache instance
query_cache = QueryCache(max_size=100)
