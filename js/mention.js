// js/mention.js
class MentionHandler {
    constructor(inputElement) {
        this.input = inputElement;
        this.suggestions = document.createElement('div');
        this.suggestions.className = 'mention-suggestions';
        document.body.appendChild(this.suggestions);
        
        this.input.addEventListener('input', this.handleInput.bind(this));
        this.suggestions.addEventListener('click', this.handleSelect.bind(this));
    }

    async handleInput() {
        const text = this.input.value.slice(0, this.input.selectionStart);
        const atPos = text.lastIndexOf('@');
        
        if (atPos > -1) {
            const searchTerm = text.slice(atPos + 1);
            const users = await this.fetchUsers(searchTerm);
            this.showSuggestions(users, atPos);
        } else {
            this.hideSuggestions();
        }
    }

    async fetchUsers(term) {
        const response = await fetch(`/api/users.php?search=${encodeURIComponent(term)}`);
        return await response.json();
    }

    showSuggestions(users, position) {
        this.suggestions.innerHTML = users.map(user => `
            <div class="mention-item" data-id="${user.id}">
                ${user.email}
            </div>
        `).join('');
        
        const rect = this.input.getBoundingClientRect();
        this.suggestions.style.display = 'block';
        this.suggestions.style.top = `${rect.bottom + window.scrollY}px`;
        this.suggestions.style.left = `${rect.left + position * 8}px`;
    }

    handleSelect(e) {
        if (e.target.classList.contains('mention-item')) {
            const username = e.target.textContent.split('@')[0];
            const currentValue = this.input.value;
            const newValue = currentValue.replace(/@[^@]*$/, `@${username} `);
            this.input.value = newValue;
            this.hideSuggestions();
        }
    }

    hideSuggestions() {
        this.suggestions.style.display = 'none';
    }
}