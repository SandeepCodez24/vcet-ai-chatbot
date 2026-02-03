/**
 * ===========================
 * API Service
 * VCET AI Chatbot
 * ===========================
 * 
 * Centralized API communication layer.
 * Handles all HTTP requests to the backend.
 * 
 * @module services/api
 * @author VCET AI Team
 * @version 1.0.0
 */

/**
 * API configuration object
 * @constant {Object}
 */
// Determine backend URL
const getBackendUrl = () => {
    // If running on Netlify (vcetai.netlify.app or similar), use Railway backend
    if (window.location.hostname.includes('netlify.app')) {
        return 'https://web-production-cae6c.up.railway.app';
    }

    // If env var is set (e.g. by Vite/Webpack), use it
    // Note: In vanilla JS without build system injection, this check is safe but might be unused
    if (typeof process !== 'undefined' && process.env && process.env.VITE_API_URL) {
        return process.env.VITE_API_URL;
    }

    // Default to current origin (for localhost:5000 or same-domain deployment)
    // If you are running frontend on port 3000 and backend on 5000 locally, use:
    if (window.location.port === '3000' || window.location.port === '5500' || window.location.port === '8080') {
        // Assume backend is on port 5000 locally if we are on dev ports
        return 'http://localhost:5000';
    }

    return window.location.origin;
};

const API_CONFIG = {
    baseUrl: getBackendUrl(),
    timeout: 60000, // Increased timeout for initial cold starts
    retryAttempts: 3,
    retryDelay: 1000
};

/**
 * API endpoints configuration
 * @constant {Object}
 */
const API_ENDPOINTS = {
    query: '/api/query',
    stats: '/api/stats',
    suggestions: '/api/suggestions',
    health: '/api/health',
    clearCache: '/api/clear-cache'
};

/**
 * Storage keys for persistent data
 * @constant {Object}
 */
const STORAGE_KEYS = {
    apiKey: 'vcet_groq_api_key',
    theme: 'theme',
    chatHistory: 'chatHistory'
};

/**
 * API Service class for handling HTTP requests
 * @class
 */
class ApiService {
    /**
     * Creates an instance of ApiService
     */
    constructor() {
        this.baseUrl = API_CONFIG.baseUrl;
        this.timeout = API_CONFIG.timeout;
    }

    /**
     * Gets the stored API key
     * @returns {string|null} The stored API key or null
     */
    getApiKey() {
        return localStorage.getItem(STORAGE_KEYS.apiKey);
    }

    /**
     * Sets the API key in storage
     * @param {string} key - The API key to store
     */
    setApiKey(key) {
        if (key) {
            localStorage.setItem(STORAGE_KEYS.apiKey, key);
        } else {
            localStorage.removeItem(STORAGE_KEYS.apiKey);
        }
    }

    /**
     * Builds request headers
     * @param {Object} [additionalHeaders={}] - Additional headers to include
     * @returns {Object} Headers object
     */
    buildHeaders(additionalHeaders = {}) {
        const headers = {
            'Content-Type': 'application/json',
            ...additionalHeaders
        };

        const apiKey = this.getApiKey();
        if (apiKey) {
            headers['X-Groq-Api-Key'] = apiKey;
        }

        return headers;
    }

    /**
     * Makes an HTTP request with error handling
     * @param {string} endpoint - API endpoint
     * @param {Object} [options={}] - Fetch options
     * @returns {Promise<Object>} Response data
     * @throws {Error} If request fails
     */
    async request(endpoint, options = {}) {
        const url = `${this.baseUrl}${endpoint}`;

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.timeout);

        try {
            const response = await fetch(url, {
                ...options,
                headers: this.buildHeaders(options.headers),
                signal: controller.signal
            });

            clearTimeout(timeoutId);

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                const error = new Error(errorData.message || `HTTP ${response.status}`);
                error.status = response.status;
                error.data = errorData;
                throw error;
            }

            return await response.json();
        } catch (error) {
            clearTimeout(timeoutId);

            if (error.name === 'AbortError') {
                const timeoutError = new Error('Request timeout');
                timeoutError.status = 408;
                throw timeoutError;
            }

            throw error;
        }
    }

    /**
     * Performs a GET request
     * @param {string} endpoint - API endpoint
     * @returns {Promise<Object>} Response data
     */
    async get(endpoint) {
        return this.request(endpoint, { method: 'GET' });
    }

    /**
     * Performs a POST request
     * @param {string} endpoint - API endpoint
     * @param {Object} data - Request body data
     * @returns {Promise<Object>} Response data
     */
    async post(endpoint, data) {
        return this.request(endpoint, {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }

    /**
     * Checks API health status
     * @returns {Promise<Object>} Health check result
     */
    async checkHealth() {
        try {
            const data = await this.get(API_ENDPOINTS.health);
            return {
                success: true,
                ragInitialized: data.rag_initialized,
                status: data.status
            };
        } catch (error) {
            console.error('Health check failed:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Sends a query to the chatbot
     * @param {string} query - User's query
     * @returns {Promise<Object>} Query response
     */
    async sendQuery(query) {
        return this.post(API_ENDPOINTS.query, { query });
    }

    /**
     * Fetches chatbot statistics
     * @returns {Promise<Object>} Statistics data
     */
    async getStats() {
        return this.get(API_ENDPOINTS.stats);
    }

    /**
     * Fetches suggestion prompts
     * @returns {Promise<Object>} Suggestions data
     */
    async getSuggestions() {
        return this.get(API_ENDPOINTS.suggestions);
    }

    /**
     * Clears the response cache
     * @returns {Promise<Object>} Clear cache result
     */
    async clearCache() {
        return this.post(API_ENDPOINTS.clearCache, {});
    }
}

// Export singleton instance
const apiService = new ApiService();

// Make available globally for legacy support
window.ApiService = ApiService;
window.apiService = apiService;
window.API_ENDPOINTS = API_ENDPOINTS;
window.STORAGE_KEYS = STORAGE_KEYS;
