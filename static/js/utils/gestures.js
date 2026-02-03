/**
 * ===========================
 * Touch Gesture Utilities
 * VCET AI Chatbot
 * ===========================
 * 
 * Provides touch gesture handling for mobile devices:
 * - Swipe gestures (left, right, up, down)
 * - Pull-to-refresh
 * - Long-press context menu
 * - Double-tap actions
 * - Pinch-to-zoom
 */

// ===========================
// Gesture Configuration
// ===========================
const GESTURE_CONFIG = {
    swipe: {
        threshold: 50,          // Minimum distance for swipe
        velocityThreshold: 0.3, // Minimum velocity for swipe
        maxTime: 300,           // Maximum time for swipe gesture (ms)
        restraint: 100          // Maximum perpendicular distance
    },
    longPress: {
        duration: 500,          // Time to trigger long press (ms)
        moveTolerance: 10       // Maximum movement allowed during long press
    },
    doubleTap: {
        maxInterval: 300,       // Maximum time between taps (ms)
        maxDistance: 30         // Maximum distance between taps
    },
    pullToRefresh: {
        threshold: 80,          // Minimum pull distance
        maxPull: 150,           // Maximum pull distance
        resistance: 2.5         // Pull resistance factor
    },
    pinch: {
        minScale: 0.5,          // Minimum zoom scale
        maxScale: 3             // Maximum zoom scale
    }
};

// ===========================
// Touch State Tracking
// ===========================
class TouchState {
    constructor() {
        this.reset();
    }

    reset() {
        this.startX = 0;
        this.startY = 0;
        this.startTime = 0;
        this.lastTapTime = 0;
        this.lastTapX = 0;
        this.lastTapY = 0;
        this.longPressTimer = null;
        this.isLongPress = false;
        this.isPinching = false;
        this.initialPinchDistance = 0;
        this.currentScale = 1;
    }
}

// ===========================
// Gesture Manager Class
// ===========================
class GestureManager {
    constructor(element, options = {}) {
        this.element = element;
        this.options = { ...GESTURE_CONFIG, ...options };
        this.state = new TouchState();
        this.callbacks = {
            swipeLeft: [],
            swipeRight: [],
            swipeUp: [],
            swipeDown: [],
            longPress: [],
            doubleTap: [],
            pinchStart: [],
            pinchMove: [],
            pinchEnd: [],
            pullStart: [],
            pullMove: [],
            pullEnd: []
        };

        this.bindEvents();
    }

    // Bind touch events
    bindEvents() {
        this.element.addEventListener('touchstart', this.handleTouchStart.bind(this), { passive: false });
        this.element.addEventListener('touchmove', this.handleTouchMove.bind(this), { passive: false });
        this.element.addEventListener('touchend', this.handleTouchEnd.bind(this), { passive: false });
        this.element.addEventListener('touchcancel', this.handleTouchCancel.bind(this), { passive: true });
    }

    // Register callback
    on(event, callback) {
        if (this.callbacks[event]) {
            this.callbacks[event].push(callback);
        }
        return this;
    }

    // Emit event
    emit(event, data) {
        if (this.callbacks[event]) {
            this.callbacks[event].forEach(callback => callback(data));
        }
    }

    // Handle touch start
    handleTouchStart(e) {
        const touch = e.touches[0];
        this.state.startX = touch.clientX;
        this.state.startY = touch.clientY;
        this.state.startTime = Date.now();
        this.state.isLongPress = false;

        // Handle pinch gesture (two fingers)
        if (e.touches.length === 2) {
            this.state.isPinching = true;
            this.state.initialPinchDistance = this.getPinchDistance(e.touches);
            this.emit('pinchStart', { scale: 1 });
            return;
        }

        // Start long press timer
        this.state.longPressTimer = setTimeout(() => {
            this.state.isLongPress = true;
            this.emit('longPress', {
                x: this.state.startX,
                y: this.state.startY,
                target: e.target
            });

            // Haptic feedback (if supported)
            if (navigator.vibrate) {
                navigator.vibrate(50);
            }
        }, this.options.longPress.duration);
    }

    // Handle touch move
    handleTouchMove(e) {
        const touch = e.touches[0];
        const deltaX = touch.clientX - this.state.startX;
        const deltaY = touch.clientY - this.state.startY;
        const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

        // Cancel long press if moved too much
        if (distance > this.options.longPress.moveTolerance && this.state.longPressTimer) {
            clearTimeout(this.state.longPressTimer);
            this.state.longPressTimer = null;
        }

        // Handle pinch gesture
        if (e.touches.length === 2 && this.state.isPinching) {
            const currentDistance = this.getPinchDistance(e.touches);
            const scale = currentDistance / this.state.initialPinchDistance;
            const clampedScale = Math.max(
                this.options.pinch.minScale,
                Math.min(this.options.pinch.maxScale, scale)
            );
            this.state.currentScale = clampedScale;
            this.emit('pinchMove', { scale: clampedScale });
            e.preventDefault();
            return;
        }

        // Handle pull-to-refresh (only when at top of scroll)
        if (this.element.scrollTop <= 0 && deltaY > 0) {
            const pullDistance = Math.min(
                deltaY / this.options.pullToRefresh.resistance,
                this.options.pullToRefresh.maxPull
            );
            this.emit('pullMove', { distance: pullDistance, progress: pullDistance / this.options.pullToRefresh.threshold });

            if (pullDistance > 20) {
                e.preventDefault();
            }
        }
    }

    // Handle touch end
    handleTouchEnd(e) {
        // Clear long press timer
        if (this.state.longPressTimer) {
            clearTimeout(this.state.longPressTimer);
            this.state.longPressTimer = null;
        }

        // Handle pinch end
        if (this.state.isPinching) {
            this.state.isPinching = false;
            this.emit('pinchEnd', { scale: this.state.currentScale });
            this.state.reset();
            return;
        }

        // Don't process swipe if it was a long press
        if (this.state.isLongPress) {
            this.state.reset();
            return;
        }

        const touch = e.changedTouches[0];
        const deltaX = touch.clientX - this.state.startX;
        const deltaY = touch.clientY - this.state.startY;
        const deltaTime = Date.now() - this.state.startTime;

        // Check for double tap
        const timeSinceLastTap = Date.now() - this.state.lastTapTime;
        const distanceFromLastTap = Math.sqrt(
            Math.pow(touch.clientX - this.state.lastTapX, 2) +
            Math.pow(touch.clientY - this.state.lastTapY, 2)
        );

        if (timeSinceLastTap < this.options.doubleTap.maxInterval &&
            distanceFromLastTap < this.options.doubleTap.maxDistance) {
            this.emit('doubleTap', {
                x: touch.clientX,
                y: touch.clientY,
                target: e.target
            });
            this.state.lastTapTime = 0;
        } else {
            this.state.lastTapTime = Date.now();
            this.state.lastTapX = touch.clientX;
            this.state.lastTapY = touch.clientY;
        }

        // Handle pull-to-refresh release
        if (this.element.scrollTop <= 0 && deltaY > 0) {
            const pullDistance = deltaY / this.options.pullToRefresh.resistance;
            if (pullDistance >= this.options.pullToRefresh.threshold) {
                this.emit('pullEnd', { triggered: true });
            } else {
                this.emit('pullEnd', { triggered: false });
            }
        }

        // Detect swipe gesture
        if (deltaTime <= this.options.swipe.maxTime) {
            const absX = Math.abs(deltaX);
            const absY = Math.abs(deltaY);
            const velocity = Math.max(absX, absY) / deltaTime;

            if (velocity >= this.options.swipe.velocityThreshold) {
                // Horizontal swipe
                if (absX > this.options.swipe.threshold && absY < this.options.swipe.restraint) {
                    if (deltaX > 0) {
                        this.emit('swipeRight', { distance: deltaX, velocity });
                    } else {
                        this.emit('swipeLeft', { distance: Math.abs(deltaX), velocity });
                    }
                }
                // Vertical swipe
                else if (absY > this.options.swipe.threshold && absX < this.options.swipe.restraint) {
                    if (deltaY > 0) {
                        this.emit('swipeDown', { distance: deltaY, velocity });
                    } else {
                        this.emit('swipeUp', { distance: Math.abs(deltaY), velocity });
                    }
                }
            }
        }

        this.state.reset();
    }

    // Handle touch cancel
    handleTouchCancel() {
        if (this.state.longPressTimer) {
            clearTimeout(this.state.longPressTimer);
        }
        this.state.reset();
    }

    // Calculate distance between two touch points
    getPinchDistance(touches) {
        return Math.sqrt(
            Math.pow(touches[0].clientX - touches[1].clientX, 2) +
            Math.pow(touches[0].clientY - touches[1].clientY, 2)
        );
    }

    // Destroy gesture manager
    destroy() {
        this.element.removeEventListener('touchstart', this.handleTouchStart);
        this.element.removeEventListener('touchmove', this.handleTouchMove);
        this.element.removeEventListener('touchend', this.handleTouchEnd);
        this.element.removeEventListener('touchcancel', this.handleTouchCancel);
    }
}

// ===========================
// Sidebar Swipe Controller
// ===========================
class SidebarSwipeController {
    constructor(sidebar, overlay, options = {}) {
        this.sidebar = sidebar;
        this.overlay = overlay;
        this.options = {
            openThreshold: 50,
            closeThreshold: 50,
            edgeWidth: 30,
            animationDuration: 300,
            ...options
        };

        this.isOpen = false;
        this.startX = 0;
        this.currentX = 0;
        this.isDragging = false;

        this.init();
    }

    init() {
        // Listen for edge swipes on document
        document.addEventListener('touchstart', this.handleTouchStart.bind(this), { passive: true });
        document.addEventListener('touchmove', this.handleTouchMove.bind(this), { passive: false });
        document.addEventListener('touchend', this.handleTouchEnd.bind(this), { passive: true });

        // Close on overlay click
        if (this.overlay) {
            this.overlay.addEventListener('click', () => this.close());
        }
    }

    handleTouchStart(e) {
        const touch = e.touches[0];
        this.startX = touch.clientX;

        // Start from left edge (open gesture)
        if (!this.isOpen && touch.clientX <= this.options.edgeWidth) {
            this.isDragging = true;
            this.sidebar.style.transition = 'none';
        }
        // Start from open sidebar (close gesture)
        else if (this.isOpen) {
            this.isDragging = true;
            this.sidebar.style.transition = 'none';
        }
    }

    handleTouchMove(e) {
        if (!this.isDragging) return;

        const touch = e.touches[0];
        this.currentX = touch.clientX;
        const deltaX = this.currentX - this.startX;

        if (!this.isOpen) {
            // Opening: drag from left edge
            const sidebarWidth = this.sidebar.offsetWidth;
            const translateX = Math.max(-sidebarWidth, Math.min(0, -sidebarWidth + deltaX));
            this.sidebar.style.transform = `translateX(${translateX}px)`;

            // Update overlay opacity
            if (this.overlay) {
                const progress = (sidebarWidth + translateX) / sidebarWidth;
                this.overlay.style.opacity = progress * 0.5;
                this.overlay.style.display = progress > 0 ? 'block' : 'none';
            }
        } else {
            // Closing: drag to left
            const sidebarWidth = this.sidebar.offsetWidth;
            const translateX = Math.max(-sidebarWidth, Math.min(0, deltaX));
            this.sidebar.style.transform = `translateX(${translateX}px)`;

            // Update overlay opacity
            if (this.overlay) {
                const progress = 1 + (translateX / sidebarWidth);
                this.overlay.style.opacity = progress * 0.5;
            }
        }

        e.preventDefault();
    }

    handleTouchEnd() {
        if (!this.isDragging) return;

        const deltaX = this.currentX - this.startX;
        const sidebarWidth = this.sidebar.offsetWidth;

        this.sidebar.style.transition = `transform ${this.options.animationDuration}ms ease`;

        if (!this.isOpen) {
            // Check if should open
            if (deltaX > this.options.openThreshold) {
                this.open();
            } else {
                this.close();
            }
        } else {
            // Check if should close
            if (deltaX < -this.options.closeThreshold) {
                this.close();
            } else {
                this.open();
            }
        }

        this.isDragging = false;
    }

    open() {
        this.isOpen = true;
        this.sidebar.style.transform = 'translateX(0)';
        this.sidebar.classList.add('active');

        if (this.overlay) {
            this.overlay.style.display = 'block';
            this.overlay.style.opacity = '0.5';
        }

        document.body.style.overflow = 'hidden';
    }

    close() {
        this.isOpen = false;
        this.sidebar.style.transform = '';
        this.sidebar.classList.remove('active');

        if (this.overlay) {
            this.overlay.style.opacity = '0';
            setTimeout(() => {
                if (!this.isOpen) {
                    this.overlay.style.display = 'none';
                }
            }, this.options.animationDuration);
        }

        document.body.style.overflow = '';
    }

    toggle() {
        if (this.isOpen) {
            this.close();
        } else {
            this.open();
        }
    }
}

// ===========================
// Pull to Refresh Controller
// ===========================
class PullToRefreshController {
    constructor(scrollContainer, options = {}) {
        this.container = scrollContainer;
        this.options = {
            threshold: 80,
            maxPull: 120,
            refreshTimeout: 2000,
            onRefresh: null,
            ...options
        };

        this.indicator = null;
        this.isPulling = false;
        this.isRefreshing = false;
        this.pullDistance = 0;

        this.createIndicator();
        this.init();
    }

    createIndicator() {
        this.indicator = document.createElement('div');
        this.indicator.className = 'pull-refresh-indicator';
        this.indicator.innerHTML = `
            <div class="pull-refresh-content">
                <i class="fas fa-arrow-down pull-arrow"></i>
                <i class="fas fa-spinner fa-spin pull-spinner" style="display: none;"></i>
                <span class="pull-text">Pull to refresh</span>
            </div>
        `;

        // Insert before the container
        if (this.container.parentNode) {
            this.container.parentNode.insertBefore(this.indicator, this.container);
        }
    }

    init() {
        let startY = 0;
        let currentY = 0;

        this.container.addEventListener('touchstart', (e) => {
            if (this.container.scrollTop <= 0 && !this.isRefreshing) {
                startY = e.touches[0].clientY;
                this.isPulling = true;
            }
        }, { passive: true });

        this.container.addEventListener('touchmove', (e) => {
            if (!this.isPulling || this.isRefreshing) return;

            currentY = e.touches[0].clientY;
            const delta = currentY - startY;

            if (delta > 0 && this.container.scrollTop <= 0) {
                e.preventDefault();
                this.pullDistance = Math.min(delta * 0.5, this.options.maxPull);
                this.updateIndicator();
            }
        }, { passive: false });

        this.container.addEventListener('touchend', () => {
            if (!this.isPulling) return;

            if (this.pullDistance >= this.options.threshold && !this.isRefreshing) {
                this.triggerRefresh();
            } else {
                this.reset();
            }

            this.isPulling = false;
        }, { passive: true });
    }

    updateIndicator() {
        const progress = Math.min(this.pullDistance / this.options.threshold, 1);

        this.indicator.style.height = `${this.pullDistance}px`;
        this.indicator.style.opacity = progress;

        const arrow = this.indicator.querySelector('.pull-arrow');
        const text = this.indicator.querySelector('.pull-text');

        if (arrow) {
            arrow.style.transform = `rotate(${progress >= 1 ? 180 : 0}deg)`;
        }

        if (text) {
            text.textContent = progress >= 1 ? 'Release to refresh' : 'Pull to refresh';
        }
    }

    triggerRefresh() {
        this.isRefreshing = true;

        const arrow = this.indicator.querySelector('.pull-arrow');
        const spinner = this.indicator.querySelector('.pull-spinner');
        const text = this.indicator.querySelector('.pull-text');

        if (arrow) arrow.style.display = 'none';
        if (spinner) spinner.style.display = 'inline-block';
        if (text) text.textContent = 'Refreshing...';

        // Haptic feedback
        if (navigator.vibrate) {
            navigator.vibrate(50);
        }

        // Call refresh callback
        if (this.options.onRefresh) {
            Promise.resolve(this.options.onRefresh())
                .finally(() => {
                    setTimeout(() => this.reset(), 500);
                });
        } else {
            setTimeout(() => this.reset(), this.options.refreshTimeout);
        }
    }

    reset() {
        this.pullDistance = 0;
        this.isRefreshing = false;

        this.indicator.style.height = '0';
        this.indicator.style.opacity = '0';

        const arrow = this.indicator.querySelector('.pull-arrow');
        const spinner = this.indicator.querySelector('.pull-spinner');
        const text = this.indicator.querySelector('.pull-text');

        if (arrow) {
            arrow.style.display = 'inline-block';
            arrow.style.transform = 'rotate(0deg)';
        }
        if (spinner) spinner.style.display = 'none';
        if (text) text.textContent = 'Pull to refresh';
    }
}

// ===========================
// Message Context Menu
// ===========================
class MessageContextMenu {
    constructor(options = {}) {
        this.options = {
            onCopy: null,
            onShare: null,
            onDelete: null,
            ...options
        };

        this.menu = null;
        this.activeMessage = null;

        this.createMenu();
        this.init();
    }

    createMenu() {
        this.menu = document.createElement('div');
        this.menu.className = 'context-menu';
        this.menu.innerHTML = `
            <div class="context-menu-items">
                <button class="context-menu-item" data-action="copy">
                    <i class="fas fa-copy"></i>
                    <span>Copy</span>
                </button>
                <button class="context-menu-item" data-action="share">
                    <i class="fas fa-share-alt"></i>
                    <span>Share</span>
                </button>
            </div>
        `;

        document.body.appendChild(this.menu);

        // Handle menu item clicks
        this.menu.querySelectorAll('.context-menu-item').forEach(item => {
            item.addEventListener('click', (e) => {
                const action = e.currentTarget.dataset.action;
                this.handleAction(action);
            });
        });
    }

    init() {
        // Close menu on outside click
        document.addEventListener('click', (e) => {
            if (!this.menu.contains(e.target)) {
                this.hide();
            }
        });

        // Close on scroll
        document.addEventListener('scroll', () => this.hide(), true);
    }

    show(x, y, message) {
        this.activeMessage = message;

        // Position the menu
        const menuRect = this.menu.getBoundingClientRect();
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;

        // Adjust position to stay within viewport
        let posX = x;
        let posY = y;

        if (x + 180 > viewportWidth) {
            posX = viewportWidth - 190;
        }

        if (y + 100 > viewportHeight) {
            posY = viewportHeight - 110;
        }

        this.menu.style.left = `${posX}px`;
        this.menu.style.top = `${posY}px`;
        this.menu.classList.add('active');

        // Haptic feedback
        if (navigator.vibrate) {
            navigator.vibrate(30);
        }
    }

    hide() {
        this.menu.classList.remove('active');
        this.activeMessage = null;
    }

    handleAction(action) {
        if (!this.activeMessage) return;

        switch (action) {
            case 'copy':
                if (this.options.onCopy) {
                    this.options.onCopy(this.activeMessage);
                }
                break;
            case 'share':
                if (this.options.onShare) {
                    this.options.onShare(this.activeMessage);
                }
                break;
        }

        this.hide();
    }
}

// ===========================
// Export for use in main.js
// ===========================
window.GestureManager = GestureManager;
window.SidebarSwipeController = SidebarSwipeController;
window.PullToRefreshController = PullToRefreshController;
window.MessageContextMenu = MessageContextMenu;
window.GESTURE_CONFIG = GESTURE_CONFIG;
