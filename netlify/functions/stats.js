/**
 * ===========================
 * Netlify Function: Stats
 * VCET AI Chatbot
 * ===========================
 * 
 * Returns system statistics and metrics.
 * Note: In serverless mode, stats are simulated/estimated.
 * 
 * @endpoint GET /.netlify/functions/stats
 */

// Simple request counter (resets on cold start)
let requestCount = 0;
const startTime = Date.now();

/**
 * Main handler function
 */
exports.handler = async (event, context) => {
    // CORS headers
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Content-Type': 'application/json'
    };

    // Handle preflight
    if (event.httpMethod === 'OPTIONS') {
        return {
            statusCode: 200,
            headers,
            body: ''
        };
    }

    try {
        requestCount++;
        const uptime = Math.floor((Date.now() - startTime) / 1000);

        const stats = {
            total_queries: requestCount,
            num_document_chunks: 150, // Simulated value
            cache_hit_rate: 35, // Simulated value
            average_response_time: '1.2', // Simulated value
            cache_size: requestCount,
            vector_store_loaded: true,
            embedding_model: process.env.EMBEDDING_MODEL || 'BAAI/bge-base-en-v1.5',
            llm_model: process.env.LLM_MODEL || 'llama-3.3-70b-versatile',
            uptime_seconds: uptime,
            deployment: 'netlify',
            environment: process.env.CONTEXT || 'production'
        };

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
                status: 'success',
                stats: stats
            })
        };

    } catch (error) {
        console.error('Stats function error:', error);

        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({
                status: 'error',
                message: 'Failed to retrieve statistics',
                error: error.message
            })
        };
    }
};
