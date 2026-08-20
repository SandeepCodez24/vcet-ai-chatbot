"""
Optimized server.py for Render's 512MB free tier
- Lazy loads RAG model on first request
- Uses smaller embedding model
- Implements memory-efficient initialization
"""

from flask import Flask, request, jsonify, render_template
from flask_cors import CORS
import os
import time
from datetime import datetime
from config import Config
from utils.logger import setup_logger
from utils.cache import query_cache
from utils.rate_limiter import rate_limiter

# Initialize Flask app
app = Flask(__name__)
app.config.from_object(Config)
app.secret_key = Config.SECRET_KEY

# Setup CORS - Allow Netlify domain
CORS(app, origins=['https://vcetai.netlify.app', 'http://localhost:3000'])

# Setup logger
logger = setup_logger(__name__)

# Global RAG search instance (lazy loaded)
rag_search = None
rag_stats = {
    "total_queries": 0,
    "cache_hits": 0,
    "cache_misses": 0,
    "average_response_time": 0,
    "total_response_time": 0
}

def initialize_rag():
    """Lazy initialize RAG search system (only when needed)"""
    global rag_search
    
    if rag_search is not None:
        return True
        
    try:
        logger.info("Initializing RAG search system...")
        from src.search import RAGSearch
        
        rag_search = RAGSearch(
            embedding_model=Config.EMBEDDING_MODEL,
            llm_model=Config.LLM_MODEL
        )
        logger.info("RAG search system initialized successfully")
        return True
    except Exception as e:
        logger.error(f"Failed to initialize RAG system: {str(e)}")
        return False

# DO NOT initialize on startup - wait for first request
# This prevents OOM on Render during boot

@app.route('/')
def index():
    """Serve main chat interface"""
    return render_template('index.html')

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        "status": "healthy",
        "rag_initialized": rag_search is not None,
        "timestamp": datetime.now().isoformat(),
        "deployment": "render",
        "memory_optimized": True
    }), 200

@app.route('/api/query', methods=['POST'])
def query():
    """Main query endpoint for chatbot"""
    global rag_search
    
    try:
        # Get client ID for rate limiting
        client_id = request.remote_addr
        
        # Check rate limit
        if not rate_limiter.is_allowed(client_id):
            return jsonify({
                "status": "error",
                "message": "Rate limit exceeded. Please try again later.",
                "remaining_requests": 0
            }), 429
        
        # Get query from request
        data = request.get_json()
        if not data or 'query' not in data:
            return jsonify({
                "status": "error",
                "message": "Query parameter is required"
            }), 400
        
        user_query = data.get('query', '').strip()
        
        # Validate query
        if not user_query:
            return jsonify({
                "status": "error",
                "message": "Query cannot be empty"
            }), 400
        
        if len(user_query) > 1000:
            return jsonify({
                "status": "error",
                "message": "Query is too long (max 1000 characters)"
            }), 400
        
        logger.info(f"Received query: {user_query[:100]}...")
        
        # Check cache FIRST (avoid loading model if cached)
        cached_response = query_cache.get(user_query)
        if cached_response:
            logger.info("Cache hit - returning cached response")
            rag_stats["cache_hits"] += 1
            rag_stats["total_queries"] += 1
            
            return jsonify({
                "status": "success",
                "response": cached_response["response"],
                "sources": cached_response.get("sources", []),
                "cached": True,
                "remaining_requests": rate_limiter.get_remaining(client_id)
            }), 200
        
        rag_stats["cache_misses"] += 1
        
        # Lazy load RAG on first real query (not cached)
        if rag_search is None:
            logger.info("First query received - initializing RAG system...")
            if not initialize_rag():
                return jsonify({
                    "status": "error",
                    "message": "RAG system failed to initialize. Please try again later."
                }), 503
        
        # Get top_k from request or use default
        top_k = data.get('top_k', Config.TOP_K_RESULTS)
        
        # Perform RAG search
        start_time = time.time()
        try:
            response = rag_search.search_and_summarize(user_query, top_k=top_k)
            response_time = time.time() - start_time
            
            # Update stats
            rag_stats["total_queries"] += 1
            rag_stats["total_response_time"] += response_time
            rag_stats["average_response_time"] = (
                rag_stats["total_response_time"] / rag_stats["total_queries"]
            )
            
            logger.info(f"Query processed in {response_time:.2f}s")
            
            # Prepare response
            result = {
                "response": response,
                "sources": [],
                "response_time": round(response_time, 2)
            }
            
            # Cache the response
            query_cache.set(user_query, result)
            
            return jsonify({
                "status": "success",
                "response": result["response"],
                "sources": result["sources"],
                "response_time": result["response_time"],
                "cached": False,
                "remaining_requests": rate_limiter.get_remaining(client_id)
            }), 200
            
        except Exception as e:
            logger.error(f"Error processing query: {str(e)}")
            return jsonify({
                "status": "error",
                "message": "Failed to process query. Please try again.",
                "error": str(e) if Config.DEBUG else None
            }), 500
        
    except Exception as e:
        logger.error(f"Unexpected error in query endpoint: {str(e)}")
        return jsonify({
            "status": "error",
            "message": "An unexpected error occurred"
        }), 500

@app.route('/api/stats', methods=['GET'])
def get_stats():
    """Get system statistics"""
    try:
        faiss_path = os.path.join(Config.FAISS_STORE_DIR, "faiss.index")
        meta_path = os.path.join(Config.FAISS_STORE_DIR, "metadata.pkl")
        
        # Get number of documents
        num_chunks = 0
        if rag_search and rag_search.vectorstore.index:
            num_chunks = rag_search.vectorstore.index.ntotal
        
        # Get cache stats
        cache_stats = query_cache.get_stats()
        
        return jsonify({
            "status": "success",
            "stats": {
                "total_queries": rag_stats["total_queries"],
                "cache_hits": rag_stats["cache_hits"],
                "cache_misses": rag_stats["cache_misses"],
                "cache_hit_rate": (
                    round(rag_stats["cache_hits"] / rag_stats["total_queries"] * 100, 2)
                    if rag_stats["total_queries"] > 0 else 0
                ),
                "average_response_time": round(rag_stats["average_response_time"], 2),
                "vector_store_loaded": os.path.exists(faiss_path) and os.path.exists(meta_path),
                "num_document_chunks": num_chunks,
                "embedding_model": Config.EMBEDDING_MODEL,
                "llm_model": Config.LLM_MODEL,
                "cache_size": cache_stats["size"],
                "cache_max_size": cache_stats["max_size"],
                "rag_loaded": rag_search is not None
            }
        }), 200
    except Exception as e:
        logger.error(f"Error getting stats: {str(e)}")
        return jsonify({
            "status": "error",
            "message": "Failed to retrieve statistics"
        }), 500

@app.route('/api/suggestions', methods=['GET'])
def get_suggestions():
    """Get suggested questions"""
    suggestions = [
        "Tell me about Velammal College",
        "What courses are offered at VCET?",
        "What is the admission process?",
        "Tell me about placements at VCET",
        "Who is the principal of VCET?",
        "What are the facilities available?"
    ]
    
    return jsonify({
        "status": "success",
        "suggestions": suggestions
    }), 200

@app.route('/api/clear-cache', methods=['POST'])
def clear_cache():
    """Clear query cache"""
    try:
        query_cache.clear()
        logger.info("Cache cleared")
        return jsonify({
            "status": "success",
            "message": "Cache cleared successfully"
        }), 200
    except Exception as e:
        logger.error(f"Error clearing cache: {str(e)}")
        return jsonify({
            "status": "error",
            "message": "Failed to clear cache"
        }), 500

@app.errorhandler(404)
def not_found(error):
    return jsonify({
        "status": "error",
        "message": "Endpoint not found"
    }), 404

@app.errorhandler(500)
def internal_error(error):
    logger.error(f"Internal server error: {str(error)}")
    return jsonify({
        "status": "error",
        "message": "Internal server error"
    }), 500

if __name__ == '__main__':
    port = int(os.getenv('PORT', 5000))
    logger.info(f"Starting VCET RAG Chatbot on port {port}... (Memory optimized)")
    logger.info("RAG model will lazy-load on first query to save memory")
    app.run(
        host='0.0.0.0',
        port=port,
        debug=Config.DEBUG,
        use_reloader=False
    )
