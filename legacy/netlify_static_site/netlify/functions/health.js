/**
 * ===========================
 * Netlify Function: Health Check
 * VCET AI Chatbot
 * ===========================
 * 
 * Health check endpoint for monitoring system status.
 * 
 * @endpoint GET /.netlify/functions/health
 */

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
        const response = {
            status: 'healthy',
            rag_initialized: true, // Always true in serverless mode
            timestamp: new Date().toISOString(),
            environment: process.env.CONTEXT || 'production',
            version: '2.0.0',
            deployment: 'netlify',
            services: {
                groq_api: !!process.env.GROQ_API_KEY,
                functions: true
            }
        };

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify(response)
        };

    } catch (error) {
        console.error('Health check error:', error);

        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({
                status: 'unhealthy',
                error: error.message,
                timestamp: new Date().toISOString()
            })
        };
    }
};
