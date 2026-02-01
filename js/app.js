/**
 * LineLess Main Application
 * Handles screen navigation, user interactions, and state management
 */

class LineLessApp {
    constructor() {
        this.currentScreen = 'welcome-screen';
        this.queueUpdateInterval = null;
        this.locationName = 'Government Hospital – OP Department';
    }

    /**
     * Initialize the application
     */
    init() {
        // Initialize notification manager
        notificationManager.init();

        // Set up event listeners
        this.setupEventListeners();

        // Show welcome screen
        this.showScreen('welcome-screen');

        // Populate department dropdown
        this.populateDepartments();
    }

    /**
     * Set up all event listeners
     */
    setupEventListeners() {
        // Welcome screen
        const takeTokenBtn = document.getElementById('take-token-btn');
        if (takeTokenBtn) {
            takeTokenBtn.addEventListener('click', () => this.showScreen('registration-screen'));
        }

        const howItWorksLink = document.getElementById('how-it-works-link');
        if (howItWorksLink) {
            howItWorksLink.addEventListener('click', () => {
                this.showScreen('help-screen');
            });
        }

        // Registration form
        const registrationForm = document.getElementById('registration-form');
        if (registrationForm) {
            registrationForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleTokenGeneration();
            });
        }

        // Refresh status button
        const refreshStatusBtn = document.getElementById('refresh-status-btn');
        if (refreshStatusBtn) {
            refreshStatusBtn.addEventListener('click', () => {
                this.updateQueueInfo();
                notificationManager.showInfo('Status refreshed!');
            });
        }

        // Help button
        const helpBtn = document.getElementById('help-btn');
        if (helpBtn) {
            helpBtn.addEventListener('click', () => {
                this.showScreen('help-screen');
            });
        }

        // Back links and buttons with data-screen attribute
        const backLinks = document.querySelectorAll('.back-link, [data-screen]');
        backLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                if (link.tagName.toLowerCase() === 'a') {
                    e.preventDefault();
                }
                const target = link.getAttribute('data-screen');
                this.showScreen(target || 'welcome-screen');
            });
        });
    }

    /**
     * Navigate to a specific screen
     */
    showScreen(screenId) {
        // Hide all screens
        const screens = document.querySelectorAll('.screen');
        screens.forEach(screen => screen.classList.remove('active'));

        // Show target screen
        const targetScreen = document.getElementById(screenId);
        if (targetScreen) {
            targetScreen.classList.add('active');
            this.currentScreen = screenId;

            // Screen-specific actions
            if (screenId === 'status-screen') {
                this.startQueueUpdates();
            } else if (screenId === 'queue-screen') {
                this.updateQueueList();
                this.startQueueListUpdates();
            } else {
                this.stopQueueUpdates();
            }
        }
    }

    /**
     * Populate department dropdown
     */
    populateDepartments() {
        const select = document.getElementById('department');
        if (!select) return;

        const departments = queueManager.getDepartments();

        // Clear existing options
        select.innerHTML = '<option value="">Select Department</option>';

        // Add department options
        departments.forEach(dept => {
            const option = document.createElement('option');
            option.value = dept;
            option.textContent = dept;
            select.appendChild(option);
        });
    }

    /**
     * Handle token generation form submission
     */
    handleTokenGeneration() {
        // Get form values
        const name = document.getElementById('name').value.trim();
        const mobile = document.getElementById('mobile').value.trim();
        const department = document.getElementById('department').value;

        // Validation
        if (!name || !mobile || !department) {
            notificationManager.showError('Please fill in all fields');
            return;
        }

        if (mobile.length < 10) {
            notificationManager.showError('Please enter a valid mobile number');
            return;
        }

        // Generate token
        const token = queueManager.generateToken(name, mobile, department);

        // Show success notification
        notificationManager.showTokenGenerated(token.number);

        // Update status screen with token info
        this.updateTokenStatus();

        // Navigate to status screen
        setTimeout(() => {
            this.showScreen('status-screen');
        }, 500);
    }

    /**
     * Update token status display
     */
    updateTokenStatus() {
        const token = queueManager.getCurrentToken();
        if (!token) return;

        // Update token number
        const tokenNumberEl = document.getElementById('token-number');
        if (tokenNumberEl) {
            tokenNumberEl.textContent = token.number;
        }

        // Update department
        const departmentEl = document.getElementById('token-department');
        if (departmentEl) {
            departmentEl.textContent = token.department;
        }

        // Update queue info
        this.updateQueueInfo();
    }

    /**
     * Update queue information (now serving, people ahead, wait time)
     */
    updateQueueInfo() {
        // Now serving
        const nowServingEl = document.getElementById('now-serving');
        if (nowServingEl) {
            nowServingEl.textContent = queueManager.getCurrentServing();
        }

        // People ahead
        const peopleAhead = queueManager.getPeopleAhead();
        const peopleAheadEl = document.getElementById('people-ahead');
        if (peopleAheadEl) {
            peopleAheadEl.textContent = peopleAhead;
        }

        // Wait time
        const waitTime = queueManager.getEstimatedWaitTime();
        const waitTimeEl = document.getElementById('wait-time');
        if (waitTimeEl) {
            waitTimeEl.textContent = waitTime;
        }

        // Progress bar
        const progress = queueManager.getProgressPercentage();
        const progressFill = document.getElementById('progress-fill');
        if (progressFill) {
            progressFill.style.width = `${progress}%`;
        }

        // Status banner
        const statusMessage = queueManager.getStatusMessage();
        const statusBanner = document.getElementById('status-banner');
        if (statusBanner) {
            statusBanner.textContent = statusMessage.text;

            // Update banner class based on status
            statusBanner.className = 'status-banner';
            if (statusMessage.type === 'relax') {
                statusBanner.classList.add('status-banner-success');
            } else if (statusMessage.type === 'soon') {
                statusBanner.classList.add('status-banner-warning');
            } else if (statusMessage.type === 'now' || statusMessage.type === 'missed') {
                statusBanner.classList.add('status-banner-danger');
            }
        }

        // Show notification if status changed
        const queueStatus = queueManager.getQueueStatus();
        if (queueStatus === 'soon' || queueStatus === 'now') {
            notificationManager.showQueueStatus(queueStatus, peopleAhead);
        }
    }

    /**
     * Start automatic queue updates
     */
    startQueueUpdates() {
        // Clear any existing interval
        this.stopQueueUpdates();

        // Update immediately
        this.updateTokenStatus();

        // Set up interval for updates every 5 seconds
        this.queueUpdateInterval = queueManager.startAutoProgress(() => {
            if (this.currentScreen === 'status-screen') {
                this.updateQueueInfo();
            }
        }, 5000);
    }

    /**
     * Stop queue updates
     */
    stopQueueUpdates() {
        if (this.queueUpdateInterval) {
            clearInterval(this.queueUpdateInterval);
            this.queueUpdateInterval = null;
        }
    }

    /**
     * Update queue list display
     */
    updateQueueList() {
        const queueListEl = document.getElementById('queue-list');
        if (!queueListEl) return;

        const queue = queueManager.getQueueList();

        queueListEl.innerHTML = queue.map(item => `
      <li class="queue-item ${item.type === 'current' ? 'queue-item-current' : ''}">
        <span class="queue-item-token">${item.token}</span>
        <span class="queue-item-status">${item.status}</span>
      </li>
    `).join('');
    }

    /**
     * Start queue list updates
     */
    startQueueListUpdates() {
        this.stopQueueUpdates();

        this.queueUpdateInterval = queueManager.startAutoProgress(() => {
            if (this.currentScreen === 'queue-screen') {
                this.updateQueueList();
            }
        }, 5000);
    }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    const app = new LineLessApp();
    app.init();
});
