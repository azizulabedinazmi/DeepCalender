class EventModal {
    constructor() {
        this.modal = document.getElementById('event-modal');
        this.form = document.getElementById('event-form');
        this.deleteButton = document.getElementById('delete-event');
        this.initEventListeners();
    }

    initEventListeners() {
        // Close modal
        this.modal.querySelector('.close').addEventListener('click', () => this.close());
        document.addEventListener('click', (e) => {
            if (e.target === this.modal) this.close();
        });

        // Form submission
        this.form.addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.handleSubmit();
        });

        // Tag input handling
        document.getElementById('event-tags').addEventListener('input', (e) => {
            this.handleTagInput(e.target.value);
        });
    }

    async open(date, eventId = null) {
        this.currentEventId = eventId;
        this.modal.classList.remove('hidden');
        document.body.classList.add('modal-open');

        // Set initial date/time
        const datetime = date.toISOString().slice(0, 16);
        document.getElementById('event-time').value = datetime;

        if (eventId) {
            await this.loadEventData(eventId);
            this.deleteButton.classList.remove('hidden');
        } else {
            this.form.reset();
            this.deleteButton.classList.add('hidden');
        }
    }

    close() {
        this.modal.classList.add('hidden');
        document.body.classList.remove('modal-open');
    }

    async loadEventData(eventId) {
        try {
            const response = await fetch(`/api/events.php?id=${eventId}`);
            const event = await response.json();
            
            document.getElementById('event-id').value = event.id;
            document.getElementById('event-title').value = event.title;
            document.getElementById('event-time').value = 
                new Date(event.event_time).toISOString().slice(0, 16);
            document.getElementById('event-location').value = event.location;
            document.getElementById('event-description').value = event.description;
            document.getElementById('event-tags').value = 
                event.tags.map(tag => `@${tag.username}`).join(' ');
        } catch (error) {
            console.error('Error loading event:', error);
        }
    }

    async handleSubmit() {
        const eventData = {
            id: document.getElementById('event-id').value || undefined,
            title: document.getElementById('event-title').value,
            event_time: document.getElementById('event-time').value,
            location: document.getElementById('event-location').value,
            description: document.getElementById('event-description').value,
            tags: this.processTags(document.getElementById('event-tags').value)
        };

        try {
            const response = await fetch('/api/events.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(eventData)
            });

            if (response.ok) {
                this.close();
                window.calendar.renderCalendar(); // Refresh calendar
            }
        } catch (error) {
            console.error('Error saving event:', error);
        }
    }

    processTags(tagString) {
        return tagString.split(' ')
            .filter(tag => tag.startsWith('@'))
            .map(tag => tag.slice(1));
    }

    async handleTagInput(value) {
        const lastWord = value.split(' ').pop();
        if (lastWord.startsWith('@')) {
            const searchTerm = lastWord.slice(1);
            const users = await this.searchUsers(searchTerm);
            this.showTagSuggestions(users);
        }
    }

    async searchUsers(searchTerm) {
        try {
            const response = await fetch(`/api/users.php?search=${searchTerm}`);
            return await response.json();
        } catch (error) {
            return [];
        }
    }

    showTagSuggestions(users) {
        // Implementation for showing dropdown suggestions
    }
}

// Initialize modal
const eventModal = new EventModal();