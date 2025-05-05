// js/sharing.js
class EventSharer {
    constructor(eventId) {
        this.eventId = eventId;
        this.modal = new Modal('share-modal');
        this.init();
    }

    async init() {
        this.modal.content.innerHTML = `
            <h3>Share Event</h3>
            <div class="user-search"></div>
            <div class="shared-users"></div>
        `;
        
        this.searchInput = document.createElement('input');
        this.searchInput.placeholder = 'Search users...';
        this.modal.content.querySelector('.user-search').appendChild(this.searchInput);
        
        new MentionHandler(this.searchInput, {
            onSelect: user => this.addSharedUser(user)
        });
        
        await this.loadSharedUsers();
    }

    async loadSharedUsers() {
        const response = await fetch(`/api/events.php?id=${this.eventId}`);
        const { shared_with } = await response.json();
        
        const container = this.modal.content.querySelector('.shared-users');
        container.innerHTML = shared_with.map(userId => `
            <div class="shared-user">
                ${userId} 
                <button class="remove-user" data-id="${userId}">×</button>
            </div>
        `).join('');
    }

    async addSharedUser(user) {
        await fetch(`/api/events.php?action=share`, {
            method: 'POST',
            body: JSON.stringify({
                event_id: this.eventId,
                user_ids: [...currentSharedUsers, user.id]
            })
        });
        await this.loadSharedUsers();
    }
}