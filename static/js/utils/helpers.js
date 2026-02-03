/**
 * ===========================
 * DOM Utility Helpers
 * VCET AI Chatbot
 * ===========================
 * 
 * Common DOM manipulation and utility functions.
 * 
 * @module utils/helpers
 * @author VCET AI Team
 * @version 1.0.0
 */

/**
 * Safely selects a DOM element
 * @param {string} selector - CSS selector
 * @param {Element} [context=document] - Context element
 * @returns {Element|null} Found element or null
 */
function $(selector, context = document) {
    return context.querySelector(selector);
}

/**
 * Selects all matching DOM elements
 * @param {string} selector - CSS selector
 * @param {Element} [context=document] - Context element
 * @returns {NodeList} List of found elements
 */
function $$(selector, context = document) {
    return context.querySelectorAll(selector);
}

/**
 * Creates a DOM element with attributes
 * @param {string} tag - HTML tag name
 * @param {Object} [attrs={}] - Attributes to set
 * @param {string|Element|Array} [children] - Child content
 * @returns {Element} Created element
 */
function createElement(tag, attrs = {}, children = null) {
    const element = document.createElement(tag);

    Object.entries(attrs).forEach(([key, value]) => {
        if (key === 'className') {
            element.className = value;
        } else if (key === 'dataset') {
            Object.entries(value).forEach(([dataKey, dataValue]) => {
                element.dataset[dataKey] = dataValue;
            });
        } else if (key.startsWith('on') && typeof value === 'function') {
            element.addEventListener(key.slice(2).toLowerCase(), value);
        } else {
            element.setAttribute(key, value);
        }
    });

    if (children) {
        if (typeof children === 'string') {
            element.textContent = children;
        } else if (children instanceof Element) {
            element.appendChild(children);
        } else if (Array.isArray(children)) {
            children.forEach(child => {
                if (typeof child === 'string') {
                    element.appendChild(document.createTextNode(child));
                } else if (child instanceof Element) {
                    element.appendChild(child);
                }
            });
        }
    }

    return element;
}

/**
 * Escapes HTML special characters
 * @param {string} text - Text to escape
 * @returns {string} Escaped text
 */
function escapeHTML(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

/**
 * Copies text to clipboard
 * @param {string} text - Text to copy
 * @returns {Promise<boolean>} True if successful
 */
async function copyToClipboard(text) {
    try {
        if (navigator.clipboard && navigator.clipboard.writeText) {
            await navigator.clipboard.writeText(text);
            return true;
        }

        // Fallback for older browsers
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        const success = document.execCommand('copy');
        document.body.removeChild(textarea);
        return success;
    } catch (error) {
        console.error('Copy to clipboard failed:', error);
        return false;
    }
}

/**
 * Debounces a function call
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @returns {Function} Debounced function
 */
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func.apply(this, args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * Throttles a function call
 * @param {Function} func - Function to throttle
 * @param {number} limit - Limit time in milliseconds
 * @returns {Function} Throttled function
 */
function throttle(func, limit) {
    let inThrottle;
    return function executedFunction(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

/**
 * Formats a date to a readable string
 * @param {Date|string} date - Date to format
 * @param {Object} [options] - Intl.DateTimeFormat options
 * @returns {string} Formatted date string
 */
function formatDate(date, options = {}) {
    const d = date instanceof Date ? date : new Date(date);
    const defaultOptions = {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    };
    return d.toLocaleDateString('en-US', { ...defaultOptions, ...options });
}

/**
 * Formats time to HH:MM format
 * @param {Date|string} [date=new Date()] - Date to format
 * @returns {string} Formatted time string
 */
function formatTime(date = new Date()) {
    const d = date instanceof Date ? date : new Date(date);
    return d.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
    });
}

/**
 * Generates a unique ID
 * @param {string} [prefix='id'] - Prefix for the ID
 * @returns {string} Unique ID
 */
function generateId(prefix = 'id') {
    return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Sleeps for specified milliseconds
 * @param {number} ms - Milliseconds to sleep
 * @returns {Promise<void>} Promise that resolves after delay
 */
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Checks if device is mobile
 * @returns {boolean} True if mobile device
 */
function isMobile() {
    return window.innerWidth <= 768 ||
        /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

/**
 * Checks if device supports touch
 * @returns {boolean} True if touch is supported
 */
function isTouchDevice() {
    return 'ontouchstart' in window ||
        navigator.maxTouchPoints > 0 ||
        navigator.msMaxTouchPoints > 0;
}

/**
 * Gets element's offset position
 * @param {Element} element - DOM element
 * @returns {Object} Object with top, left, width, height
 */
function getOffset(element) {
    const rect = element.getBoundingClientRect();
    return {
        top: rect.top + window.scrollY,
        left: rect.left + window.scrollX,
        width: rect.width,
        height: rect.height
    };
}

/**
 * Adds class to element with optional delay
 * @param {Element} element - DOM element
 * @param {string} className - Class to add
 * @param {number} [delay=0] - Delay in milliseconds
 */
function addClass(element, className, delay = 0) {
    if (delay > 0) {
        setTimeout(() => element.classList.add(className), delay);
    } else {
        element.classList.add(className);
    }
}

/**
 * Removes class from element with optional delay
 * @param {Element} element - DOM element
 * @param {string} className - Class to remove
 * @param {number} [delay=0] - Delay in milliseconds
 */
function removeClass(element, className, delay = 0) {
    if (delay > 0) {
        setTimeout(() => element.classList.remove(className), delay);
    } else {
        element.classList.remove(className);
    }
}

/**
 * Toggles class on element
 * @param {Element} element - DOM element
 * @param {string} className - Class to toggle
 * @param {boolean} [force] - Force add/remove
 */
function toggleClass(element, className, force) {
    element.classList.toggle(className, force);
}

/**
 * Triggers haptic feedback if available
 * @param {number} [duration=50] - Vibration duration in ms
 */
function hapticFeedback(duration = 50) {
    if (navigator.vibrate) {
        navigator.vibrate(duration);
    }
}

/**
 * Scrolls element into view smoothly
 * @param {Element} element - Element to scroll to
 * @param {Object} [options] - ScrollIntoView options
 */
function scrollIntoView(element, options = {}) {
    const defaultOptions = {
        behavior: 'smooth',
        block: 'center'
    };
    element.scrollIntoView({ ...defaultOptions, ...options });
}

/**
 * Validates email format
 * @param {string} email - Email to validate
 * @returns {boolean} True if valid email format
 */
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

/**
 * Truncates text to specified length
 * @param {string} text - Text to truncate
 * @param {number} maxLength - Maximum length
 * @param {string} [suffix='...'] - Suffix to add
 * @returns {string} Truncated text
 */
function truncateText(text, maxLength, suffix = '...') {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength - suffix.length) + suffix;
}

// Export to global scope
window.$ = $;
window.$$ = $$;
window.createElement = createElement;
window.escapeHTML = escapeHTML;
window.copyToClipboard = copyToClipboard;
window.debounce = debounce;
window.throttle = throttle;
window.formatDate = formatDate;
window.formatTime = formatTime;
window.generateId = generateId;
window.sleep = sleep;
window.isMobile = isMobile;
window.isTouchDevice = isTouchDevice;
window.getOffset = getOffset;
window.addClass = addClass;
window.removeClass = removeClass;
window.toggleClass = toggleClass;
window.hapticFeedback = hapticFeedback;
window.scrollIntoView = scrollIntoView;
window.isValidEmail = isValidEmail;
window.truncateText = truncateText;
