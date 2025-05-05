// js/notifications.js
class NotificationService {
    constructor() {
        this.checkPermission();
        this.setupListeners();
    }

    checkPermission() {
        if (Notification.permission === 'granted') {
            this.startPolling();
        } else if (Notification.permission !== 'denied') {
            this.showPermissionBanner();
        }
    }

    showPermissionBanner() {
        const banner = document.createElement('div');
        banner.className = 'notification-banner';
        banner.innerHTML = `
            <p>Get browser notifications for upcoming events?</p>
            <button class="enable">Enable</button>
            <button class="dismiss">No thanks</button>
        `;
        document.body.prepend(banner);
        
        banner.querySelector('.enable').addEventListener('click', () => {
            Notification.requestPermission().then(permission => {
                if (permission === 'granted') this.startPolling();
                banner.remove();
            });
        });
    }

    startPolling() {
        setInterval(() => this.checkNotifications(), 15 * 60 * 1000); // 15 minutes
        this.checkNotifications();
    }

    async checkNotifications() {
        try {
            const response = await fetch('/api/notifications.php');
            const { events } = await response.json();
            
            events.forEach(event => {
                new Notification(`Upcoming: ${event.title}`, {
                    body: `Starts at ${new Date(event.event_time).toLocaleTimeString()}`
                });
            });
        } catch (error) {
            console.error('Notification error:', error);
        }
    }
}

// Initialize
new NotificationService();