/**
 * ===========================
 * Netlify Function: Suggestions
 * VCET AI Chatbot
 * ===========================
 * 
 * Provides suggested questions for users to start conversations.
 * 
 * @endpoint GET /.netlify/functions/suggestions
 */

// Curated list of suggestions
const SUGGESTIONS = [
    "Tell me about Velammal College of Engineering and Technology",
    "What undergraduate programs are offered at VCET?",
    "What is the admission process for VCET?",
    "Tell me about placement opportunities at VCET",
    "What are the infrastructure facilities available?",
    "How can I contact VCET admissions office?",
    "Tell me about the faculty and departments",
    "What extracurricular activities are available?",
    "What is the fee structure for engineering courses?",
    "Tell me about campus life at VCET"
];

/**
 * Shuffles array using Fisher-Yates algorithm
 * @param {Array} array - Array to shuffle
 * @returns {Array} Shuffled array
 */
function shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

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
        // Get count from query parameters (default 6)
        const queryParams = event.queryStringParameters || {};
        const count = Math.min(parseInt(queryParams.count || '6'), SUGGESTIONS.length);

        // Shuffle and select suggestions
        const shuffled = shuffleArray(SUGGESTIONS);
        const selected = shuffled.slice(0, count);

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
                status: 'success',
                suggestions: selected,
                total_available: SUGGESTIONS.length
            })
        };

    } catch (error) {
        console.error('Suggestions function error:', error);

        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({
                status: 'error',
                message: 'Failed to retrieve suggestions',
                error: error.message
            })
        };
    }
};
