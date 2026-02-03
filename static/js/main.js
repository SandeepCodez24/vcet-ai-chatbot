// ===========================
// VCET AI Chatbot - Main JavaScript
// ===========================

// Use API configuration from api.js (loaded first)
// API_ENDPOINTS and STORAGE_KEYS are available via window object from api.js
const API_BASE_URL = window.apiService ? window.apiService.baseUrl : window.location.origin;

// Reference API_ENDPOINTS from api.js (avoid redeclaration)
const endpoints = window.API_ENDPOINTS || {
    query: `${API_BASE_URL}/api/query`,
    stats: `${API_BASE_URL}/api/stats`,
    suggestions: `${API_BASE_URL}/api/suggestions`,
    health: `${API_BASE_URL}/api/health`,
    clearCache: `${API_BASE_URL}/api/clear-cache`
};

// Reference STORAGE_KEYS from api.js (avoid redeclaration)
const storageKeys = window.STORAGE_KEYS || {
    apiKey: 'vcet_groq_api_key',
    theme: 'theme',
    chatHistory: 'chatHistory'
};

// DOM Elements
const elements = {
    // Core chat elements
    welcomeScreen: document.getElementById('welcomeScreen'),
    chatMessages: document.getElementById('chatMessages'),
    messageInput: document.getElementById('messageInput'),
    sendBtn: document.getElementById('sendBtn'),
    charCount: document.getElementById('charCount'),
    typingIndicator: document.getElementById('typingIndicator'),
    chatContainer: document.getElementById('chatContainer'),
    suggestionsGrid: document.getElementById('suggestionsGrid'),
    inputWrapper: document.querySelector('.input-wrapper'),
    // Sidebar
    sidebar: document.getElementById('sidebar'),
    toggleSidebar: document.getElementById('toggleSidebar'),
    closeSidebar: document.getElementById('closeSidebar'),
    clearChat: document.getElementById('clearChat'),
    // Header actions
    themeToggle: document.getElementById('themeToggle'),
    statsBtn: document.getElementById('statsBtn'),
    settingsBtn: document.getElementById('settingsBtn'),
    // Stats modal
    statsModal: document.getElementById('statsModal'),
    closeStatsModal: document.getElementById('closeStatsModal'),
    statsContent: document.getElementById('statsContent'),
    // Toast
    toast: document.getElementById('toast'),
    toastMessage: document.getElementById('toastMessage'),
    // Loading overlay
    loadingOverlay: document.getElementById('loadingOverlay'),
    loadingProgressFill: document.getElementById('loadingProgressFill'),
    loadingProgressPercent: document.getElementById('loadingProgressPercent'),
    loadingElapsed: document.getElementById('loadingElapsed'),
    loadingTimeoutWarning: document.getElementById('loadingTimeoutWarning'),
    loadingRetryBtn: document.getElementById('loadingRetryBtn'),
    statusServer: document.getElementById('statusServer'),
    statusModel: document.getElementById('statusModel'),
    statusVectorStore: document.getElementById('statusVectorStore'),
    statusReady: document.getElementById('statusReady'),
    // Settings modal
    settingsModal: document.getElementById('settingsModal'),
    closeSettingsModal: document.getElementById('closeSettingsModal'),
    apiKeyInput: document.getElementById('apiKeyInput'),
    toggleApiKeyVisibility: document.getElementById('toggleApiKeyVisibility'),
    apiKeyValidation: document.getElementById('apiKeyValidation'),
    saveApiKeyBtn: document.getElementById('saveApiKeyBtn'),
    clearApiKeyBtn: document.getElementById('clearApiKeyBtn'),
    apiUsageText: document.getElementById('apiUsageText'),
    apiUsageFill: document.getElementById('apiUsageFill'),
    apiUsageWarning: document.getElementById('apiUsageWarning'),
    // Rate limit popup
    rateLimitPopup: document.getElementById('rateLimitPopup'),
    rateLimitDismissBtn: document.getElementById('rateLimitDismissBtn'),
    rateLimitSettingsBtn: document.getElementById('rateLimitSettingsBtn'),
    rateLimitBanner: document.getElementById('rateLimitBanner'),
    rateLimitBannerBtn: document.getElementById('rateLimitBannerBtn'),
    // Timeout popup
    timeoutPopup: document.getElementById('timeoutPopup'),
    timeoutRetryBtn: document.getElementById('timeoutRetryBtn'),
    timeoutLaterBtn: document.getElementById('timeoutLaterBtn')
};

// State
let chatHistory = [];
let isProcessing = false;
let isRateLimited = false;
let consecutiveFailures = 0;
let loadingStartTime = null;
let loadingInterval = null;
let healthCheckInterval = null;
const theme = localStorage.getItem('theme') || 'light';
const MAX_CONSECUTIVE_FAILURES = 3;
const LOADING_WARNING_TIME = 5 * 60 * 1000; // 5 minutes
const LOADING_TIMEOUT_TIME = 30 * 60 * 1000; // 30 minutes

// ===========================
// Initialization
// ===========================

document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
});

async function initializeApp() {
    // Apply saved theme
    if (theme === 'dark') {
        document.body.classList.add('dark-mode');
        elements.themeToggle.querySelector('i').classList.remove('fa-moon');
        elements.themeToggle.querySelector('i').classList.add('fa-sun');
    }

    // Load saved API key
    loadSavedApiKey();

    // Setup event listeners
    setupEventListeners();

    // Start loading process with overlay
    await startLoadingProcess();

    // Load chat history from localStorage
    loadChatHistory();
}

// ===========================
// Event Listeners
// ===========================

function setupEventListeners() {
    // Send message
    elements.sendBtn.addEventListener('click', sendMessage);
    elements.messageInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });

    // Character count
    elements.messageInput.addEventListener('input', updateCharCount);

    // Sidebar toggle (mobile)
    elements.toggleSidebar.addEventListener('click', () => {
        elements.sidebar.classList.add('active');
    });

    elements.closeSidebar.addEventListener('click', () => {
        elements.sidebar.classList.remove('active');
    });

    // Clear chat
    elements.clearChat.addEventListener('click', clearChat);

    // Theme toggle
    elements.themeToggle.addEventListener('click', toggleTheme);

    // Stats modal
    elements.statsBtn.addEventListener('click', openStatsModal);
    elements.closeStatsModal.addEventListener('click', closeStatsModal);

    // Settings modal
    if (elements.settingsBtn) {
        elements.settingsBtn.addEventListener('click', openSettingsModal);
    }
    if (elements.closeSettingsModal) {
        elements.closeSettingsModal.addEventListener('click', closeSettingsModal);
    }
    if (elements.settingsModal) {
        elements.settingsModal.addEventListener('click', (e) => {
            if (e.target === elements.settingsModal) {
                closeSettingsModal();
            }
        });
    }

    // API key settings
    if (elements.toggleApiKeyVisibility) {
        elements.toggleApiKeyVisibility.addEventListener('click', toggleApiKeyVisibility);
    }
    if (elements.saveApiKeyBtn) {
        elements.saveApiKeyBtn.addEventListener('click', saveApiKey);
    }
    if (elements.clearApiKeyBtn) {
        elements.clearApiKeyBtn.addEventListener('click', clearApiKey);
    }

    // Rate limit popup
    if (elements.rateLimitDismissBtn) {
        elements.rateLimitDismissBtn.addEventListener('click', dismissRateLimitPopup);
    }
    if (elements.rateLimitSettingsBtn) {
        elements.rateLimitSettingsBtn.addEventListener('click', () => {
            dismissRateLimitPopup();
            openSettingsModal();
        });
    }
    if (elements.rateLimitBannerBtn) {
        elements.rateLimitBannerBtn.addEventListener('click', openSettingsModal);
    }

    // Timeout popup
    if (elements.timeoutRetryBtn) {
        elements.timeoutRetryBtn.addEventListener('click', retryLoading);
    }
    if (elements.timeoutLaterBtn) {
        elements.timeoutLaterBtn.addEventListener('click', dismissTimeoutPopup);
    }

    // Loading retry button
    if (elements.loadingRetryBtn) {
        elements.loadingRetryBtn.addEventListener('click', retryLoading);
    }

    // Quick actions
    document.querySelectorAll('.action-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const action = btn.getAttribute('data-action');
            handleQuickAction(action);
        });
    });

    // Close modal on background click
    elements.statsModal.addEventListener('click', (e) => {
        if (e.target === elements.statsModal) {
            closeStatsModal();
        }
    });

    // Auto-resize textarea
    elements.messageInput.addEventListener('input', autoResizeTextarea);
}

// ===========================
// API Functions
// ===========================

async function checkHealth() {
    try {
        const response = await fetch(endpoints.health);
        const data = await response.json();
        console.log('Health check:', data);
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

// ===========================
// Loading Overlay Functions
// ===========================

async function startLoadingProcess() {
    loadingStartTime = Date.now();

    // Start elapsed time counter
    loadingInterval = setInterval(updateLoadingElapsed, 1000);

    // Update status: Connecting to server
    updateLoadingStatus('server', 'active');
    updateLoadingProgress(10);

    try {
        // Step 1: Check server connection
        const healthResult = await checkHealth();

        if (!healthResult.success) {
            updateLoadingStatus('server', 'error');
            showLoadingRetryButton();
            return;
        }

        updateLoadingStatus('server', 'completed');
        updateLoadingProgress(30);

        // Step 2: Check if RAG model is initialized
        updateLoadingStatus('model', 'active');

        // Poll for model initialization
        let attempts = 0;
        const maxAttempts = 60; // 60 attempts * 2 seconds = 2 minutes max for quick check

        while (!healthResult.ragInitialized && attempts < maxAttempts) {
            await sleep(2000);
            const pollResult = await checkHealth();

            if (pollResult.ragInitialized) {
                break;
            }

            attempts++;

            // Check for timeouts
            const elapsed = Date.now() - loadingStartTime;
            if (elapsed >= LOADING_WARNING_TIME) {
                showLoadingWarning();
            }
            if (elapsed >= LOADING_TIMEOUT_TIME) {
                showTimeoutPopup();
                return;
            }

            // Update progress based on attempts
            const progress = Math.min(30 + (attempts / maxAttempts * 40), 70);
            updateLoadingProgress(progress);
        }

        updateLoadingStatus('model', 'completed');
        updateLoadingProgress(70);

        // Step 3: Vector store initialization
        updateLoadingStatus('vectorStore', 'active');
        await sleep(500); // Brief pause for visual feedback
        updateLoadingStatus('vectorStore', 'completed');
        updateLoadingProgress(90);

        // Step 4: Ready
        updateLoadingStatus('ready', 'active');
        await sleep(300);
        updateLoadingStatus('ready', 'completed');
        updateLoadingProgress(100);

        // Load suggestions
        await loadSuggestions();

        // Hide loading overlay
        await sleep(500);
        hideLoadingOverlay();

    } catch (error) {
        console.error('Loading process failed:', error);
        updateLoadingStatus('server', 'error');
        showLoadingRetryButton();
    }
}

function updateLoadingProgress(percent) {
    if (elements.loadingProgressFill) {
        elements.loadingProgressFill.style.width = `${percent}%`;
    }
    if (elements.loadingProgressPercent) {
        elements.loadingProgressPercent.textContent = `${Math.round(percent)}%`;
    }
}

function updateLoadingStatus(step, state) {
    const statusMap = {
        'server': elements.statusServer,
        'model': elements.statusModel,
        'vectorStore': elements.statusVectorStore,
        'ready': elements.statusReady
    };

    const element = statusMap[step];
    if (!element) return;

    // Remove all states
    element.classList.remove('active', 'completed', 'error');

    // Add new state
    element.classList.add(state);

    // Update icon
    const iconEl = element.querySelector('.loading-status-icon i');
    if (iconEl) {
        iconEl.className = 'fas';
        if (state === 'active') {
            iconEl.classList.add('fa-spinner');
        } else if (state === 'completed') {
            iconEl.classList.add('fa-check-circle');
        } else if (state === 'error') {
            iconEl.classList.add('fa-times-circle');
        } else {
            iconEl.classList.add('fa-circle');
        }
    }
}

function updateLoadingElapsed() {
    if (!loadingStartTime) return;

    const elapsed = Math.floor((Date.now() - loadingStartTime) / 1000);

    if (elements.loadingElapsed) {
        if (elapsed < 60) {
            elements.loadingElapsed.textContent = `${elapsed}s`;
        } else {
            const minutes = Math.floor(elapsed / 60);
            const seconds = elapsed % 60;
            elements.loadingElapsed.textContent = `${minutes}m ${seconds}s`;
        }
    }
}

function showLoadingWarning() {
    if (elements.loadingTimeoutWarning) {
        elements.loadingTimeoutWarning.classList.add('visible');
    }
}

function showLoadingRetryButton() {
    if (elements.loadingRetryBtn) {
        elements.loadingRetryBtn.style.display = 'inline-flex';
    }
}

function hideLoadingOverlay() {
    if (loadingInterval) {
        clearInterval(loadingInterval);
        loadingInterval = null;
    }

    if (elements.loadingOverlay) {
        elements.loadingOverlay.classList.add('hidden');
    }
}

function retryLoading() {
    // Hide popups
    dismissTimeoutPopup();

    // Reset loading state
    if (elements.loadingOverlay) {
        elements.loadingOverlay.classList.remove('hidden');
    }
    if (elements.loadingTimeoutWarning) {
        elements.loadingTimeoutWarning.classList.remove('visible');
    }
    if (elements.loadingRetryBtn) {
        elements.loadingRetryBtn.style.display = 'none';
    }

    // Reset all status items
    ['server', 'model', 'vectorStore', 'ready'].forEach(step => {
        updateLoadingStatus(step, '');
    });

    // Restart loading process
    startLoadingProcess();
}

function showTimeoutPopup() {
    if (elements.timeoutPopup) {
        elements.timeoutPopup.classList.add('active');
    }
}

function dismissTimeoutPopup() {
    if (elements.timeoutPopup) {
        elements.timeoutPopup.classList.remove('active');
    }
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// ===========================
// Suggestion Loading
// ===========================

async function loadSuggestions() {
    try {
        const response = await fetch(endpoints.suggestions);
        const data = await response.json();

        if (data.status === 'success') {
            renderSuggestions(data.suggestions);
        }
    } catch (error) {
        console.error('Failed to load suggestions:', error);
        // Show default suggestions
        renderSuggestions([
            "Tell me about Velammal College",
            "What courses are offered?",
            "Tell me about admissions",
            "What about placements?"
        ]);
    }
}

// ===========================
// Query Function with API Key Support
// ===========================

async function sendQuery(query) {
    try {
        // Build headers
        const headers = {
            'Content-Type': 'application/json'
        };

        // Add custom API key if available
        const savedApiKey = localStorage.getItem(storageKeys.apiKey);
        if (savedApiKey) {
            headers['X-Groq-Api-Key'] = savedApiKey;
        }

        const response = await fetch(endpoints.query, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify({ query })
        });

        const data = await response.json();

        // Check for rate limit
        if (response.status === 429) {
            handleRateLimitExceeded();
            throw new Error('Rate limit exceeded');
        }

        if (!response.ok) {
            // Track consecutive failures
            consecutiveFailures++;
            if (consecutiveFailures >= MAX_CONSECUTIVE_FAILURES) {
                handleRateLimitExceeded();
            }
            throw new Error(data.message || 'Failed to get response');
        }

        // Reset failure counter on success
        consecutiveFailures = 0;

        // Update remaining requests if provided
        if (data.remaining_requests !== undefined) {
            updateApiUsageDisplay(data.remaining_requests);
        }

        return data;
    } catch (error) {
        throw error;
    }
}

async function loadStats() {
    try {
        const response = await fetch(endpoints.stats);
        const data = await response.json();

        if (data.status === 'success') {
            renderStats(data.stats);
        }
    } catch (error) {
        console.error('Failed to load stats:', error);
        elements.statsContent.innerHTML = `
            <div style="text-align: center; padding: 2rem; color: var(--danger);">
                <i class="fas fa-exclamation-triangle" style="font-size: 2rem; margin-bottom: 1rem;"></i>
                <p>Failed to load statistics</p>
            </div>
        `;
    }
}

// ===========================
// Message Handling
// ===========================

async function sendMessage() {
    const message = elements.messageInput.value.trim();

    if (!message || isProcessing) return;

    // Check if rate limited
    if (isRateLimited) {
        showToast('Cannot send message - API rate limit exceeded. Please add your API key in Settings.', 'error');
        openSettingsModal();
        return;
    }

    isProcessing = true;
    elements.sendBtn.disabled = true;

    // Hide welcome screen
    if (elements.welcomeScreen) {
        elements.welcomeScreen.style.display = 'none';
        elements.chatMessages.classList.add('active');
    }

    // Add user message to chat
    addMessage(message, 'user');

    // Clear input
    elements.messageInput.value = '';
    updateCharCount();
    autoResizeTextarea();

    // Show typing indicator
    showTypingIndicator();

    try {
        // Send query to API
        const response = await sendQuery(message);

        // Hide typing indicator
        hideTypingIndicator();

        // Add bot response
        addMessage(response.response, 'bot', {
            cached: response.cached,
            responseTime: response.response_time
        });

        // Save to history
        saveChatHistory();

    } catch (error) {
        hideTypingIndicator();
        addMessage('I apologize, but I encountered an error. Please try again.', 'bot', {
            isError: true
        });
        showToast(error.message || 'Failed to get response', 'error');
    } finally {
        isProcessing = false;
        elements.sendBtn.disabled = false;
        elements.messageInput.focus();
    }
}

function addMessage(content, sender, options = {}) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${sender}`;

    const time = new Date().toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
    });

    const avatarIcon = sender === 'user' ? 'fa-user' : 'fa-robot';
    const senderName = sender === 'user' ? 'You' : 'VCET Assistant';

    let badgeHTML = '';
    if (options.cached) {
        badgeHTML = '<span style="font-size: 0.7rem; background: var(--accent); color: white; padding: 0.125rem 0.375rem; border-radius: 0.25rem; margin-left: 0.5rem;">Cached</span>';
    }

    messageDiv.innerHTML = `
        <div class="message-header">
            <div class="message-avatar">
                <i class="fas ${avatarIcon}"></i>
            </div>
            <span class="message-sender">${senderName}</span>
            ${badgeHTML}
            <span class="message-time">${time}</span>
        </div>
        <div class="message-content">${escapeHTML(content)}</div>
    `;

    // Add copy button for bot messages
    if (sender === 'bot') {
        const actionsDiv = document.createElement('div');
        actionsDiv.className = 'message-actions';
        actionsDiv.innerHTML = `
            <button class="message-action-btn copy-btn">
                <i class="fas fa-copy"></i> Copy
            </button>
        `;
        messageDiv.appendChild(actionsDiv);

        // Add copy functionality
        actionsDiv.querySelector('.copy-btn').addEventListener('click', () => {
            copyToClipboard(content);
            showToast('Response copied to clipboard!');
        });
    }

    elements.chatMessages.appendChild(messageDiv);
    scrollToBottom();

    // Add to chat history
    chatHistory.push({
        content,
        sender,
        timestamp: new Date().toISOString(),
        options
    });
}

function handleQuickAction(action) {
    const queries = {
        about: "Tell me about Velammal College of Engineering and Technology",
        courses: "What courses are offered at VCET?",
        admissions: "What is the admission process at VCET?",
        placements: "Tell me about placements at VCET",
        infrastructure: "What infrastructure facilities are available at VCET?",
        contact: "How can I contact VCET?"
    };

    if (queries[action]) {
        elements.messageInput.value = queries[action];
        elements.messageInput.focus();
        updateCharCount();
        elements.sendBtn.disabled = false;

        // Close sidebar on mobile
        if (window.innerWidth <= 768) {
            elements.sidebar.classList.remove('active');
        }
    }
}

// ===========================
// UI Functions
// ===========================

function renderSuggestions(suggestions) {
    elements.suggestionsGrid.innerHTML = '';

    suggestions.slice(0, 6).forEach(suggestion => {
        const chip = document.createElement('button');
        chip.className = 'suggestion-chip';
        chip.textContent = suggestion;
        chip.addEventListener('click', () => {
            elements.messageInput.value = suggestion;
            elements.messageInput.focus();
            updateCharCount();
            elements.sendBtn.disabled = false;
        });
        elements.suggestionsGrid.appendChild(chip);
    });
}

function renderStats(stats) {
    elements.statsContent.innerHTML = `
        <div class="stats-grid">
            <div class="stat-card">
                <div class="stat-value">${stats.total_queries}</div>
                <div class="stat-label">Total Queries</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">${stats.num_document_chunks}</div>
                <div class="stat-label">Document Chunks</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">${stats.cache_hit_rate}%</div>
                <div class="stat-label">Cache Hit Rate</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">${stats.average_response_time}s</div>
                <div class="stat-label">Avg Response Time</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">${stats.cache_size}</div>
                <div class="stat-label">Cache Size</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">${stats.vector_store_loaded ? 'Yes' : 'No'}</div>
                <div class="stat-label">Vector Store Loaded</div>
            </div>
        </div>
        <div style="margin-top: 2rem; padding: 1rem; background: var(--bg-tertiary); border-radius: var(--radius); font-size: 0.875rem;">
            <div style="margin-bottom: 0.5rem;"><strong>Embedding Model:</strong> ${stats.embedding_model}</div>
            <div><strong>LLM Model:</strong> ${stats.llm_model}</div>
        </div>
    `;
}

function showTypingIndicator() {
    elements.typingIndicator.style.display = 'flex';
    scrollToBottom();
}

function hideTypingIndicator() {
    elements.typingIndicator.style.display = 'none';
}

function updateCharCount() {
    const length = elements.messageInput.value.length;
    elements.charCount.textContent = `${length}/1000`;
    elements.sendBtn.disabled = length === 0 || isProcessing;
}

function autoResizeTextarea() {
    elements.messageInput.style.height = 'auto';
    elements.messageInput.style.height = elements.messageInput.scrollHeight + 'px';
}

function scrollToBottom() {
    elements.chatContainer.scrollTo({
        top: elements.chatContainer.scrollHeight,
        behavior: 'smooth'
    });
}

function clearChat() {
    if (confirm('Are you sure you want to clear the chat history?')) {
        elements.chatMessages.innerHTML = '';
        chatHistory = [];
        elements.welcomeScreen.style.display = 'block';
        elements.chatMessages.classList.remove('active');
        localStorage.removeItem('chatHistory');
        showToast('Chat cleared successfully!');

        // Close sidebar on mobile
        if (window.innerWidth <= 768) {
            elements.sidebar.classList.remove('active');
        }
    }
}

function toggleTheme() {
    document.body.classList.toggle('dark-mode');
    const isDark = document.body.classList.contains('dark-mode');

    const icon = elements.themeToggle.querySelector('i');
    if (isDark) {
        icon.classList.remove('fa-moon');
        icon.classList.add('fa-sun');
        localStorage.setItem('theme', 'dark');
    } else {
        icon.classList.remove('fa-sun');
        icon.classList.add('fa-moon');
        localStorage.setItem('theme', 'light');
    }
}

function openStatsModal() {
    elements.statsModal.classList.add('active');
    elements.statsContent.innerHTML = `
        <div class="loading-spinner">
            <i class="fas fa-spinner fa-spin"></i>
            <p>Loading statistics...</p>
        </div>
    `;
    loadStats();
}

function closeStatsModal() {
    elements.statsModal.classList.remove('active');
}

function showToast(message, type = 'success') {
    const icon = elements.toast.querySelector('i');

    if (type === 'error') {
        elements.toast.style.background = 'var(--danger)';
        icon.className = 'fas fa-exclamation-circle';
    } else {
        elements.toast.style.background = 'var(--accent)';
        icon.className = 'fas fa-check-circle';
    }

    elements.toastMessage.textContent = message;
    elements.toast.classList.add('active');

    setTimeout(() => {
        elements.toast.classList.remove('active');
    }, 3000);
}

// ===========================
// Settings Modal Functions
// ===========================

function openSettingsModal() {
    if (elements.settingsModal) {
        elements.settingsModal.classList.add('active');
        // Load saved API key into input
        const savedKey = localStorage.getItem(storageKeys.apiKey);
        if (savedKey && elements.apiKeyInput) {
            elements.apiKeyInput.value = savedKey;
        }
    }
}

function closeSettingsModal() {
    if (elements.settingsModal) {
        elements.settingsModal.classList.remove('active');
    }
}

function toggleApiKeyVisibility() {
    if (!elements.apiKeyInput || !elements.toggleApiKeyVisibility) return;

    const isPassword = elements.apiKeyInput.type === 'password';
    elements.apiKeyInput.type = isPassword ? 'text' : 'password';

    const icon = elements.toggleApiKeyVisibility.querySelector('i');
    if (icon) {
        icon.className = isPassword ? 'fas fa-eye-slash' : 'fas fa-eye';
    }
}

function saveApiKey() {
    if (!elements.apiKeyInput) return;

    const apiKey = elements.apiKeyInput.value.trim();

    if (!apiKey) {
        showApiKeyValidation('invalid', 'Please enter an API key');
        return;
    }

    // Basic validation: Groq API keys start with 'gsk_'
    if (!apiKey.startsWith('gsk_')) {
        showApiKeyValidation('invalid', 'Invalid API key format. Should start with "gsk_"');
        return;
    }

    // Save to localStorage
    try {
        localStorage.setItem(storageKeys.apiKey, apiKey);
        showApiKeyValidation('valid', 'API key saved successfully');
        showToast('API key saved! Rate limit has been reset.', 'success');

        // Reset rate limit state
        resetRateLimitState();

        // Close modal after a brief delay
        setTimeout(() => {
            closeSettingsModal();
        }, 1500);
    } catch (error) {
        console.error('Failed to save API key:', error);
        showApiKeyValidation('invalid', 'Failed to save API key');
    }
}

function clearApiKey() {
    if (confirm('Are you sure you want to clear your API key?')) {
        localStorage.removeItem(storageKeys.apiKey);
        if (elements.apiKeyInput) {
            elements.apiKeyInput.value = '';
        }
        showApiKeyValidation('', '');
        showToast('API key cleared', 'success');
    }
}

function loadSavedApiKey() {
    const savedKey = localStorage.getItem(storageKeys.apiKey);
    if (savedKey && elements.apiKeyInput) {
        elements.apiKeyInput.value = savedKey;
    }
}

function showApiKeyValidation(type, message) {
    if (!elements.apiKeyValidation) return;

    // Remove all classes
    elements.apiKeyValidation.classList.remove('visible', 'valid', 'invalid', 'checking');

    if (type && message) {
        elements.apiKeyValidation.classList.add('visible', type);

        const icon = elements.apiKeyValidation.querySelector('i');
        const text = elements.apiKeyValidation.querySelector('span');

        if (icon) {
            icon.className = 'fas';
            if (type === 'valid') {
                icon.classList.add('fa-check-circle');
            } else if (type === 'invalid') {
                icon.classList.add('fa-times-circle');
            } else if (type === 'checking') {
                icon.classList.add('fa-spinner', 'fa-spin');
            }
        }

        if (text) {
            text.textContent = message;
        }
    }
}

// ===========================
// Rate Limit Functions
// ===========================

function handleRateLimitExceeded() {
    isRateLimited = true;

    // Show rate limit popup
    if (elements.rateLimitPopup) {
        elements.rateLimitPopup.classList.add('active');
    }

    // Show inline banner
    if (elements.rateLimitBanner) {
        elements.rateLimitBanner.classList.add('visible');
    }

    // Disable input
    disableMessageInput();
}

function dismissRateLimitPopup() {
    if (elements.rateLimitPopup) {
        elements.rateLimitPopup.classList.remove('active');
    }
}

function resetRateLimitState() {
    isRateLimited = false;
    consecutiveFailures = 0;

    // Hide popup and banner
    dismissRateLimitPopup();

    if (elements.rateLimitBanner) {
        elements.rateLimitBanner.classList.remove('visible');
    }

    // Enable input
    enableMessageInput();
}

function disableMessageInput() {
    if (elements.inputWrapper) {
        elements.inputWrapper.classList.add('disabled');
    }
    if (elements.messageInput) {
        elements.messageInput.disabled = true;
    }
    if (elements.sendBtn) {
        elements.sendBtn.disabled = true;
    }
}

function enableMessageInput() {
    if (elements.inputWrapper) {
        elements.inputWrapper.classList.remove('disabled');
    }
    if (elements.messageInput) {
        elements.messageInput.disabled = false;
    }
    // Send button state will be updated by updateCharCount
    updateCharCount();
}

function updateApiUsageDisplay(remaining) {
    // Assuming max requests is 30 per minute (from config)
    const maxRequests = 30;
    const used = maxRequests - remaining;
    const percentage = (used / maxRequests) * 100;

    if (elements.apiUsageText) {
        elements.apiUsageText.textContent = `${used} / ${maxRequests} requests`;
    }

    if (elements.apiUsageFill) {
        elements.apiUsageFill.style.width = `${percentage}%`;

        // Update color based on usage
        elements.apiUsageFill.classList.remove('low', 'medium', 'high');
        if (percentage >= 80) {
            elements.apiUsageFill.classList.add('high');
        } else if (percentage >= 50) {
            elements.apiUsageFill.classList.add('medium');
        } else {
            elements.apiUsageFill.classList.add('low');
        }
    }

    // Show warning if usage is high
    if (elements.apiUsageWarning) {
        if (percentage >= 80) {
            elements.apiUsageWarning.classList.add('visible');
        } else {
            elements.apiUsageWarning.classList.remove('visible');
        }
    }
}

// ===========================
// Utility Functions
// ===========================

function escapeHTML(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML.replace(/\n/g, '<br>');
}

function copyToClipboard(text) {
    navigator.clipboard.writeText(text).catch(err => {
        console.error('Failed to copy:', err);
    });
}

function saveChatHistory() {
    try {
        localStorage.setItem('chatHistory', JSON.stringify(chatHistory.slice(-50))); // Keep last 50 messages
    } catch (error) {
        console.error('Failed to save chat history:', error);
    }
}

function loadChatHistory() {
    try {
        const saved = localStorage.getItem('chatHistory');
        if (saved) {
            chatHistory = JSON.parse(saved);

            if (chatHistory.length > 0) {
                elements.welcomeScreen.style.display = 'none';
                elements.chatMessages.classList.add('active');

                chatHistory.forEach(msg => {
                    addMessage(msg.content, msg.sender, msg.options || {});
                });
            }
        }
    } catch (error) {
        console.error('Failed to load chat history:', error);
        localStorage.removeItem('chatHistory');
    }
}

// ===========================
// Keyboard Shortcuts
// ===========================

document.addEventListener('keydown', (e) => {
    // Ctrl/Cmd + K to focus input
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        elements.messageInput.focus();
    }

    // Escape to close modals
    if (e.key === 'Escape') {
        closeStatsModal();
        closeSettingsModal();
        dismissRateLimitPopup();
        dismissTimeoutPopup();
        if (window.innerWidth <= 768) {
            elements.sidebar.classList.remove('active');
            closeSidebarOverlay();
        }
    }
});

// ===========================
// Mobile Gesture Integration
// ===========================

let sidebarSwipeController = null;
let messageContextMenu = null;
let scrollToBottomBtn = null;
let networkStatusIndicator = null;

/**
 * Initialize mobile-specific features
 */
function initMobileFeatures() {
    if (window.innerWidth > 768) return;

    // Create sidebar overlay
    createSidebarOverlay();

    // Initialize sidebar swipe gestures
    initSidebarGestures();

    // Initialize scroll-to-bottom button
    initScrollToBottomButton();

    // Initialize message context menu
    initMessageContextMenu();

    // Initialize network status indicator
    initNetworkStatus();

    // Initialize keyboard detection for input adjustment
    initKeyboardDetection();

    // Add touch feedback to interactive elements
    addTouchFeedback();

    console.log('Mobile features initialized');
}

/**
 * Create sidebar overlay element
 */
function createSidebarOverlay() {
    if (document.getElementById('sidebarOverlay')) return;

    const overlay = document.createElement('div');
    overlay.id = 'sidebarOverlay';
    overlay.className = 'sidebar-overlay';
    document.body.appendChild(overlay);

    overlay.addEventListener('click', () => {
        if (sidebarSwipeController) {
            sidebarSwipeController.close();
        } else {
            elements.sidebar.classList.remove('active');
            closeSidebarOverlay();
        }
    });
}

/**
 * Open sidebar overlay
 */
function openSidebarOverlay() {
    const overlay = document.getElementById('sidebarOverlay');
    if (overlay) {
        overlay.style.display = 'block';
        requestAnimationFrame(() => {
            overlay.classList.add('active');
        });
    }
}

/**
 * Close sidebar overlay
 */
function closeSidebarOverlay() {
    const overlay = document.getElementById('sidebarOverlay');
    if (overlay) {
        overlay.classList.remove('active');
        setTimeout(() => {
            overlay.style.display = 'none';
        }, 300);
    }
}

/**
 * Initialize sidebar swipe gestures
 */
function initSidebarGestures() {
    if (typeof SidebarSwipeController === 'undefined') {
        console.log('SidebarSwipeController not available, using basic toggle');

        // Update existing toggle handlers
        elements.toggleSidebar.addEventListener('click', () => {
            elements.sidebar.classList.add('active');
            openSidebarOverlay();
        });

        elements.closeSidebar.addEventListener('click', () => {
            elements.sidebar.classList.remove('active');
            closeSidebarOverlay();
        });

        return;
    }

    const overlay = document.getElementById('sidebarOverlay');
    sidebarSwipeController = new SidebarSwipeController(elements.sidebar, overlay, {
        openThreshold: 50,
        closeThreshold: 50,
        edgeWidth: 25
    });

    // Update toggle button handler
    elements.toggleSidebar.onclick = () => {
        sidebarSwipeController.toggle();
    };

    elements.closeSidebar.onclick = () => {
        sidebarSwipeController.close();
    };
}

/**
 * Initialize scroll-to-bottom floating button
 */
function initScrollToBottomButton() {
    // Create button
    scrollToBottomBtn = document.createElement('button');
    scrollToBottomBtn.className = 'scroll-to-bottom-btn';
    scrollToBottomBtn.innerHTML = '<i class="fas fa-arrow-down"></i>';
    scrollToBottomBtn.setAttribute('aria-label', 'Scroll to bottom');
    document.body.appendChild(scrollToBottomBtn);

    // Click handler
    scrollToBottomBtn.addEventListener('click', () => {
        scrollToBottom();
        scrollToBottomBtn.classList.remove('visible');
    });

    // Show/hide based on scroll position
    let scrollTimeout;
    elements.chatContainer.addEventListener('scroll', () => {
        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(() => {
            const { scrollHeight, scrollTop, clientHeight } = elements.chatContainer;
            const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;

            if (!isNearBottom && elements.chatMessages.children.length > 0) {
                scrollToBottomBtn.classList.add('visible');
            } else {
                scrollToBottomBtn.classList.remove('visible');
            }
        }, 100);
    });
}

/**
 * Initialize message context menu for long-press
 */
function initMessageContextMenu() {
    if (typeof MessageContextMenu === 'undefined') {
        console.log('MessageContextMenu not available');
        return;
    }

    messageContextMenu = new MessageContextMenu({
        onCopy: (messageElement) => {
            const content = messageElement.querySelector('.message-content')?.textContent || '';
            copyToClipboard(content);
            showToast('Message copied!');
        },
        onShare: async (messageElement) => {
            const content = messageElement.querySelector('.message-content')?.textContent || '';

            if (navigator.share) {
                try {
                    await navigator.share({
                        title: 'VCET AI Assistant',
                        text: content
                    });
                } catch (err) {
                    if (err.name !== 'AbortError') {
                        copyToClipboard(content);
                        showToast('Link copied to clipboard!');
                    }
                }
            } else {
                copyToClipboard(content);
                showToast('Message copied!');
            }
        }
    });

    // Add long-press detection to messages
    elements.chatMessages.addEventListener('touchstart', handleMessageTouchStart, { passive: true });
    elements.chatMessages.addEventListener('touchend', handleMessageTouchEnd, { passive: true });
    elements.chatMessages.addEventListener('touchmove', handleMessageTouchMove, { passive: true });
}

let messageLongPressTimer = null;
let messageTouchStart = { x: 0, y: 0 };
let currentMessageElement = null;

function handleMessageTouchStart(e) {
    const messageContent = e.target.closest('.message-content');
    if (!messageContent) return;

    messageTouchStart = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    currentMessageElement = messageContent.closest('.message');

    messageLongPressTimer = setTimeout(() => {
        if (currentMessageElement && messageContextMenu) {
            messageContent.classList.add('long-press-active');
            messageContextMenu.show(messageTouchStart.x, messageTouchStart.y, currentMessageElement);

            // Haptic feedback
            if (navigator.vibrate) {
                navigator.vibrate(50);
            }
        }
    }, 500);
}

function handleMessageTouchMove(e) {
    if (!messageLongPressTimer) return;

    const dx = e.touches[0].clientX - messageTouchStart.x;
    const dy = e.touches[0].clientY - messageTouchStart.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance > 10) {
        clearTimeout(messageLongPressTimer);
        messageLongPressTimer = null;

        if (currentMessageElement) {
            currentMessageElement.querySelector('.message-content')?.classList.remove('long-press-active');
        }
    }
}

function handleMessageTouchEnd() {
    if (messageLongPressTimer) {
        clearTimeout(messageLongPressTimer);
        messageLongPressTimer = null;
    }

    if (currentMessageElement) {
        currentMessageElement.querySelector('.message-content')?.classList.remove('long-press-active');
    }
    currentMessageElement = null;
}

/**
 * Initialize network status indicator
 */
function initNetworkStatus() {
    // Create indicator
    networkStatusIndicator = document.createElement('div');
    networkStatusIndicator.className = 'network-status';
    networkStatusIndicator.innerHTML = '<i class="fas fa-wifi-slash"></i> You\'re offline';
    document.body.appendChild(networkStatusIndicator);

    // Update status
    function updateNetworkStatus() {
        if (!navigator.onLine) {
            networkStatusIndicator.classList.add('offline');
        } else {
            networkStatusIndicator.classList.remove('offline');
        }
    }

    window.addEventListener('online', () => {
        updateNetworkStatus();
        showToast('Back online!', 'success');
    });

    window.addEventListener('offline', () => {
        updateNetworkStatus();
        showToast('You\'re offline', 'warning');
    });

    updateNetworkStatus();
}

/**
 * Initialize keyboard detection for input adjustment
 */
function initKeyboardDetection() {
    // Use visualViewport API if available
    if (window.visualViewport) {
        let initialViewportHeight = window.visualViewport.height;

        window.visualViewport.addEventListener('resize', () => {
            const currentHeight = window.visualViewport.height;
            const isKeyboardVisible = currentHeight < initialViewportHeight * 0.75;

            if (isKeyboardVisible) {
                document.body.classList.add('keyboard-visible');
                // Scroll to keep input visible
                setTimeout(() => {
                    elements.messageInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }, 100);
            } else {
                document.body.classList.remove('keyboard-visible');
            }
        });
    }

    // Fallback: Focus/blur detection
    elements.messageInput.addEventListener('focus', () => {
        setTimeout(() => {
            elements.messageInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 300);
    });
}

/**
 * Add touch feedback to interactive elements
 */
function addTouchFeedback() {
    const interactiveElements = document.querySelectorAll('.action-btn, .suggestion-chip, .icon-btn, .send-btn');

    interactiveElements.forEach(el => {
        el.addEventListener('touchstart', function () {
            this.style.transform = 'scale(0.95)';
        }, { passive: true });

        el.addEventListener('touchend', function () {
            this.style.transform = '';
        }, { passive: true });

        el.addEventListener('touchcancel', function () {
            this.style.transform = '';
        }, { passive: true });
    });
}

/**
 * Show success animation on element
 */
function showSuccessAnimation(element) {
    element.classList.add('action-success');
    setTimeout(() => element.classList.remove('action-success'), 400);
}

/**
 * Show error animation on element
 */
function showErrorAnimation(element) {
    element.classList.add('action-error');
    setTimeout(() => element.classList.remove('action-error'), 500);
}

// Initialize mobile features when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    // Delayed initialization to ensure all elements are ready
    setTimeout(initMobileFeatures, 100);
});

// Re-initialize on resize (e.g., orientation change)
let resizeTimeout;
window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
        if (window.innerWidth <= 768 && !sidebarSwipeController) {
            initMobileFeatures();
        }
    }, 250);
});

// ===========================
// Console Welcome Message
// ===========================

console.log('%cVCET AI Assistant', 'font-size: 24px; font-weight: bold; color: #1e3a8a;');
console.log('%cPowered by RAG Technology', 'font-size: 14px; color: #3b82f6;');
console.log('Version: 1.0.0');

