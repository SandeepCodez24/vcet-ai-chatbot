/**
 * ===========================
 * Storage Service
 * VCET AI Chatbot
 * ===========================
 * 
 * Centralized storage management for localStorage interactions.
 * Provides type-safe access to persistent data.
 * 
 * @module services/storage
 * @author VCET AI Team
 * @version 1.0.0
 */

/**
 * Storage keys enumeration
 * @constant {Object}
 */
const StorageKeys = {
    API_KEY: 'vcet_groq_api_key',
    THEME: 'theme',
    CHAT_HISTORY: 'chatHistory',
    USER_PREFERENCES: 'vcet_preferences',
    LAST_VISIT: 'vcet_last_visit'
};

/**
 * Storage Service class for managing localStorage
 * @class
 */
class StorageService {
    /**
     * Creates an instance of StorageService
     */
    constructor() {
        this.isAvailable = this.checkAvailability();
    }

    /**
     * Checks if localStorage is available
     * @returns {boolean} True if localStorage is available
     */
    checkAvailability() {
        try {
            const test = '__storage_test__';
            localStorage.setItem(test, test);
            localStorage.removeItem(test);
            return true;
        } catch (e) {
            console.warn('localStorage is not available:', e);
            return false;
        }
    }

    /**
     * Sets an item in localStorage
     * @param {string} key - Storage key
     * @param {*} value - Value to store (will be JSON stringified)
     * @returns {boolean} True if successful
     */
    set(key, value) {
        if (!this.isAvailable) return false;

        try {
            const serialized = JSON.stringify(value);
            localStorage.setItem(key, serialized);
            return true;
        } catch (error) {
            console.error(`Storage set error for key "${key}":`, error);
            return false;
        }
    }

    /**
     * Gets an item from localStorage
     * @param {string} key - Storage key
     * @param {*} [defaultValue=null] - Default value if key doesn't exist
     * @returns {*} Parsed value or default
     */
    get(key, defaultValue = null) {
        if (!this.isAvailable) return defaultValue;

        try {
            const item = localStorage.getItem(key);
            if (item === null) return defaultValue;
            return JSON.parse(item);
        } catch (error) {
            console.error(`Storage get error for key "${key}":`, error);
            return defaultValue;
        }
    }

    /**
     * Gets a raw string from localStorage (no JSON parsing)
     * @param {string} key - Storage key
     * @param {string} [defaultValue=''] - Default value if key doesn't exist
     * @returns {string} Raw value or default
     */
    getRaw(key, defaultValue = '') {
        if (!this.isAvailable) return defaultValue;
        return localStorage.getItem(key) || defaultValue;
    }

    /**
     * Sets a raw string in localStorage (no JSON stringify)
     * @param {string} key - Storage key
     * @param {string} value - Value to store
     * @returns {boolean} True if successful
     */
    setRaw(key, value) {
        if (!this.isAvailable) return false;

        try {
            localStorage.setItem(key, value);
            return true;
        } catch (error) {
            console.error(`Storage setRaw error for key "${key}":`, error);
            return false;
        }
    }

    /**
     * Removes an item from localStorage
     * @param {string} key - Storage key
     * @returns {boolean} True if successful
     */
    remove(key) {
        if (!this.isAvailable) return false;

        try {
            localStorage.removeItem(key);
            return true;
        } catch (error) {
            console.error(`Storage remove error for key "${key}":`, error);
            return false;
        }
    }

    /**
     * Checks if a key exists in localStorage
     * @param {string} key - Storage key
     * @returns {boolean} True if key exists
     */
    has(key) {
        if (!this.isAvailable) return false;
        return localStorage.getItem(key) !== null;
    }

    /**
     * Clears all items from localStorage
     * @returns {boolean} True if successful
     */
    clear() {
        if (!this.isAvailable) return false;

        try {
            localStorage.clear();
            return true;
        } catch (error) {
            console.error('Storage clear error:', error);
            return false;
        }
    }

    /**
     * Gets the current theme
     * @returns {string} Theme name ('light' or 'dark')
     */
    getTheme() {
        return this.getRaw(StorageKeys.THEME, 'light');
    }

    /**
     * Sets the current theme
     * @param {string} theme - Theme name ('light' or 'dark')
     */
    setTheme(theme) {
        this.setRaw(StorageKeys.THEME, theme);
    }

    /**
     * Gets the stored API key
     * @returns {string|null} API key or null
     */
    getApiKey() {
        const key = this.getRaw(StorageKeys.API_KEY);
        return key || null;
    }

    /**
     * Sets the API key
     * @param {string} key - API key to store
     */
    setApiKey(key) {
        if (key) {
            this.setRaw(StorageKeys.API_KEY, key);
        } else {
            this.remove(StorageKeys.API_KEY);
        }
    }

    /**
     * Gets chat history
     * @returns {Array} Chat history array
     */
    getChatHistory() {
        return this.get(StorageKeys.CHAT_HISTORY, []);
    }

    /**
     * Saves chat history
     * @param {Array} history - Chat history array
     */
    saveChatHistory(history) {
        this.set(StorageKeys.CHAT_HISTORY, history);
    }

    /**
     * Clears chat history
     */
    clearChatHistory() {
        this.remove(StorageKeys.CHAT_HISTORY);
    }

    /**
     * Gets user preferences
     * @returns {Object} User preferences object
     */
    getPreferences() {
        return this.get(StorageKeys.USER_PREFERENCES, {
            notifications: true,
            animations: true,
            soundEffects: false
        });
    }

    /**
     * Sets user preferences
     * @param {Object} preferences - User preferences object
     */
    setPreferences(preferences) {
        this.set(StorageKeys.USER_PREFERENCES, preferences);
    }

    /**
     * Updates last visit timestamp
     */
    updateLastVisit() {
        this.set(StorageKeys.LAST_VISIT, new Date().toISOString());
    }

    /**
     * Gets last visit timestamp
     * @returns {Date|null} Last visit date or null
     */
    getLastVisit() {
        const timestamp = this.get(StorageKeys.LAST_VISIT);
        return timestamp ? new Date(timestamp) : null;
    }
}

// Export singleton instance
const storageService = new StorageService();

// Make available globally
window.StorageService = StorageService;
window.storageService = storageService;
window.StorageKeys = StorageKeys;
