/**
 * LineLess Notification System
 * Handles displaying contextual notifications to users
 */

class NotificationManager {
    constructor() {
        this.container = null;
        this.activeNotifications = [];
    }

    /**
     * Initialize the notification system
     */
    init() {
        this.container = document.getElementById('notification-container');
        if (!this.container) {
            console.error('Notification container not found');
        }
    }

    /**
     * Show a notification
     * @param {string} message - The message to display
     * @param {string} type - Type: 'success', 'warning', 'danger'
     * @param {number} duration - Auto-dismiss duration in ms (0 = no auto-dismiss)
     */
    show(message, type = 'success', duration = 5000) {
        if (!this.container) {
            this.init();
        }

        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;

        notification.innerHTML = `
      <div class="notification-content">${message}</div>
      <button class="notification-close" aria-label="Close notification">&times;</button>
    `;

        // Add close button handler
        const closeBtn = notification.querySelector('.notification-close');
        closeBtn.addEventListener('click', () => this.dismiss(notification));

        // Add to container
        this.container.appendChild(notification);
        this.activeNotifications.push(notification);

        // Auto-dismiss if duration is set
        if (duration > 0) {
            setTimeout(() => this.dismiss(notification), duration);
        }

        return notification;
    }

    /**
     * Dismiss a notification
     */
    dismiss(notification) {
        if (!notification || !notification.parentElement) return;

        // Fade out animation
        notification.style.opacity = '0';
        notification.style.transform = 'translateY(-20px)';

        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }

            // Remove from active list
            const index = this.activeNotifications.indexOf(notification);
            if (index > -1) {
                this.activeNotifications.splice(index, 1);
            }
        }, 300);
    }

    /**
     * Dismiss all notifications
     */
    dismissAll() {
        this.activeNotifications.forEach(notification => {
            this.dismiss(notification);
        });
    }

    /**
     * Show queue status notification based on position
     */
    showQueueStatus(queueStatus, peopleAhead) {
        this.dismissAll(); // Clear previous notifications

        switch (queueStatus) {
            case 'relax':
                this.show(
                    `You can relax. ${peopleAhead} people ahead of you. We'll notify you when your turn is near.`,
                    'success',
                    0
                );
                break;

            case 'soon':
                this.show(
                    'Only ' + peopleAhead + ' people left before your turn. Please come near the counter.',
                    'warning',
                    0
                );
                break;

            case 'now':
                this.show(
                    'Your token is now being served! Please proceed to the counter immediately.',
                    'danger',
                    0
                );
                break;

            case 'missed':
                this.show(
                    'Your token was missed. Please contact the help desk for assistance.',
                    'danger',
                    0
                );
                break;
        }
    }

    /**
     * Show success message for token generation
     */
    showTokenGenerated(tokenNumber) {
        this.show(
            `✓ Token ${tokenNumber} generated successfully!`,
            'success',
            3000
        );
    }

    /**
     * Show error message
     */
    showError(message) {
        this.show(message, 'danger', 5000);
    }

    /**
     * Show info message
     */
    showInfo(message) {
        this.show(message, 'success', 4000);
    }
}

// Create global instance
const notificationManager = new NotificationManager();
