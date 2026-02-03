/**
 * ===========================
 * Netlify Function: Query
 * VCET AI Chatbot
 * ===========================
 * 
 * Main query endpoint for processing user questions.
 * Uses Groq API for LLM responses.
 * 
 * @endpoint POST /.netlify/functions/query
 */

const https = require('https');

// Configuration
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_MODEL = process.env.LLM_MODEL || 'llama-3.3-70b-versatile';
const MAX_TOKENS = 1024;
const TEMPERATURE = 0.7;

// Simple in-memory cache (resets on cold start)
const responseCache = new Map();
const CACHE_TTL = 3600000; // 1 hour in milliseconds

/**
 * Makes HTTPS request to Groq API
 * @param {string} apiKey - Groq API key
 * @param {Array} messages - Chat messages
 * @returns {Promise<Object>} API response
 */
function callGroqAPI(apiKey, messages) {
    return new Promise((resolve, reject) => {
        const data = JSON.stringify({
            model: GROQ_MODEL,
            messages: messages,
            max_tokens: MAX_TOKENS,
            temperature: TEMPERATURE
        });

        const options = {
            hostname: 'api.groq.com',
            path: '/openai/v1/chat/completions',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`,
                'Content-Length': data.length
            }
        };

        const req = https.request(options, (res) => {
            let body = '';

            res.on('data', (chunk) => {
                body += chunk;
            });

            res.on('end', () => {
                if (res.statusCode === 200) {
                    try {
                        resolve(JSON.parse(body));
                    } catch (error) {
                        reject(new Error('Failed to parse API response'));
                    }
                } else if (res.statusCode === 429) {
                    reject({ status: 429, message: 'Rate limit exceeded' });
                } else {
                    reject(new Error(`API request failed with status ${res.statusCode}`));
                }
            });
        });

        req.on('error', (error) => {
            reject(error);
        });

        req.write(data);
        req.end();
    });
}

/**
 * Generates cache key from query
 * @param {string} query - User query
 * @returns {string} Cache key
 */
function getCacheKey(query) {
    const normalized = query.toLowerCase().trim();
    return `query_${normalized}`;
}

/**
 * Main handler function
 */
exports.handler = async (event, context) => {
    // CORS headers
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, X-Groq-Api-Key',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
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

    // Only accept POST
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            headers,
            body: JSON.stringify({
                status: 'error',
                message: 'Method not allowed'
            })
        };
    }

    try {
        // Parse request body
        const body = JSON.parse(event.body || '{}');
        const query = body.query;

        if (!query || typeof query !== 'string' || query.trim() === '') {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({
                    status: 'error',
                    message: 'Query is required'
                })
            };
        }

        // Get API key (from custom header or environment)
        const apiKey = event.headers['x-groq-api-key'] || process.env.GROQ_API_KEY;

        if (!apiKey) {
            return {
                statusCode: 401,
                headers,
                body: JSON.stringify({
                    status: 'error',
                    message: 'API key is required. Please add your Groq API key in settings.'
                })
            };
        }

        // Check cache
        const cacheKey = getCacheKey(query);
        const cached = responseCache.get(cacheKey);

        if (cached && (Date.now() - cached.timestamp) < CACHE_TTL) {
            console.log('Cache hit for query:', query.substring(0, 50));
            return {
                statusCode: 200,
                headers,
                body: JSON.stringify({
                    status: 'success',
                    response: cached.response,
                    cached: true,
                    response_time: 0
                })
            };
        }

        // Build messages for Groq
        const messages = [
            {
                role: 'system',
                content: `You are VCET AI Assistant, a helpful chatbot for Velammal College of Engineering and Technology (VCET). 
Provide accurate, friendly, and informative responses about the college, courses, admissions, facilities, and campus life.
Keep responses concise and relevant. If you don't know something, be honest about it.`
            },
            {
                role: 'user',
                content: query
            }
        ];

        // Call Groq API
        const startTime = Date.now();
        const apiResponse = await callGroqAPI(apiKey, messages);
        const responseTime = ((Date.now() - startTime) / 1000).toFixed(2);

        const assistantMessage = apiResponse.choices[0]?.message?.content || 'No response generated';

        // Cache the response
        responseCache.set(cacheKey, {
            response: assistantMessage,
            timestamp: Date.now()
        });

        // Clean up old cache entries (simple LRU)
        if (responseCache.size > 100) {
            const oldestKey = responseCache.keys().next().value;
            responseCache.delete(oldestKey);
        }

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
                status: 'success',
                response: assistantMessage,
                cached: false,
                response_time: parseFloat(responseTime),
                model: GROQ_MODEL
            })
        };

    } catch (error) {
        console.error('Query function error:', error);

        // Handle rate limiting
        if (error.status === 429) {
            return {
                statusCode: 429,
                headers,
                body: JSON.stringify({
                    status: 'error',
                    message: 'Rate limit exceeded. Please try again later or add your own API key.',
                    rate_limited: true
                })
            };
        }

        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({
                status: 'error',
                message: 'An error occurred processing your request',
                error: error.message
            })
        };
    }
};
