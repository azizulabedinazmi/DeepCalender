// DOM Elements
const authContainer = document.getElementById('auth-container');
const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');
const showRegisterBtn = document.getElementById('show-register');
const showLoginBtn = document.getElementById('show-login');
const errorDiv = document.getElementById('auth-error');
const calendarContainer = document.getElementById('calendar-container');

// Auth State Management
let currentUser = null;

// Check existing session on page load
checkAuthStatus();

// Form Visibility Toggles
showRegisterBtn?.addEventListener('click', () => {
    loginForm.classList.add('hidden');
    registerForm.classList.remove('hidden');
});

showLoginBtn?.addEventListener('click', () => {
    registerForm.classList.add('hidden');
    loginForm.classList.remove('hidden');
});

// Login Handler
loginForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = e.target.querySelector('#email').value;
    const password = e.target.querySelector('#password').value;
    
    try {
        const response = await fetch('/api/users.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
            credentials: 'include'
        });

        const data = await response.json();
        
        if (data.status === 'success') {
            currentUser = data.user;
            authContainer.classList.add('hidden');
            calendarContainer.classList.remove('hidden');
            initializeCalendar();
        } else {
            showError(data.message || 'Login failed');
        }
    } catch (error) {
        showError('Network error - please try again');
    }
});

// Registration Handler
registerForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = e.target.querySelector('#register-email').value;
    const password = e.target.querySelector('#register-password').value;

    try {
        const response = await fetch('/api/users.php?action=register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
            credentials: 'include'
        });

        const data = await response.json();
        
        if (data.status === 'success') {
            showError('Registration successful! Please login', 'success');
            registerForm.classList.add('hidden');
            loginForm.classList.remove('hidden');
        } else {
            showError(data.message || 'Registration failed');
        }
    } catch (error) {
        showError('Network error - please try again');
    }
});

// Auth Status Check
async function checkAuthStatus() {
    try {
        const response = await fetch('/api/users.php', {
            method: 'GET',
            credentials: 'include'
        });
        
        const data = await response.json();
        if (data.status === 'success') {
            currentUser = data.user;
            authContainer.classList.add('hidden');
            calendarContainer.classList.remove('hidden');
            initializeCalendar();
        }
    } catch (error) {
        console.error('Auth check failed:', error);
    }
}

// Error Handling
function showError(message, type = 'error') {
    errorDiv.textContent = message;
    errorDiv.classList.remove('hidden', 'success');
    errorDiv.classList.add(type);
    setTimeout(() => errorDiv.classList.add('hidden'), 5000);
}

// Initialize Calendar (placeholder)
function initializeCalendar() {
    console.log('Calendar initialized for:', currentUser.email);
}

// Theme Management
const themeToggle = document.getElementById('theme-toggle');
const body = document.body;

// Initialize theme from localStorage or system preference
function initializeTheme() {
    const savedTheme = localStorage.getItem('theme');
    const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme) {
        body.setAttribute('data-theme', savedTheme);
    } else {
        body.setAttribute('data-theme', systemDark ? 'dark' : 'light');
    }
    updateThemeButton();
}

// Toggle theme
themeToggle.addEventListener('click', () => {
    const currentTheme = body.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    body.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    updateThemeButton();
    
    // Sync with server if logged in
    if (currentUser) {
        syncThemePreference(newTheme);
    }
});

function updateThemeButton() {
    const theme = body.getAttribute('data-theme');
    themeToggle.textContent = theme === 'dark' ? '🌞' : '🌙';
}

async function syncThemePreference(theme) {
    try {
        await fetch('/api/users.php?action=update_preference', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ theme }),
            credentials: 'include'
        });
    } catch (error) {
        console.error('Failed to sync theme preference:', error);
    }
}

// Initialize theme on page load
initializeTheme();

// Browser Notifications
if ('Notification' in window) {
    Notification.requestPermission().then(perm => {
        if (perm === 'granted') {
            checkForNotifications();
            setInterval(checkForNotifications, 60000); // Check every minute
        }
    });
}

async function checkForNotifications() {
    try {
        const response = await fetch('/api/notifications.php');
        const { events, tasks } = await response.json();
        
        events.forEach(event => {
            new Notification('Upcoming Event', {
                body: `${event.title} at ${new Date(event.event_time).toLocaleTimeString()}`
            });
        });

        tasks.forEach(task => {
            new Notification('Pending Task', {
                body: `${task.task} due soon`
            });
        });
    } catch (error) {
        console.error('Notification error:', error);
    }
}

// MentionHandler Implementation
class MentionHandler {
    constructor(inputElement) {
        this.input = inputElement;
        this.suggestionBox = document.createElement('div');
        this.suggestionBox.className = 'mention-suggestions';
        this.input.parentNode.appendChild(this.suggestionBox);
        
        this.input.addEventListener('input', this.handleInput.bind(this));
        this.suggestionBox.addEventListener('click', this.selectMention.bind(this));
    }

    async handleInput(e) {
        const cursorPos = this.input.selectionStart;
        const textBeforeCursor = this.input.value.slice(0, cursorPos);
        const atPosition = textBeforeCursor.lastIndexOf('@');
        
        if (atPosition > -1 && !/\S/.test(textBeforeCursor.slice(atPosition + 1))) {
            const searchTerm = textBeforeCursor.slice(atPosition + 1);
            const users = await this.fetchUsers(searchTerm);
            this.showSuggestions(users, atPosition);
        } else {
            this.hideSuggestions();
        }
    }

    async fetchUsers(searchTerm) {
        const response = await fetch(`/api/users.php?search=${encodeURIComponent(searchTerm)}`);
        return await response.json();
    }

    showSuggestions(users, position) {
        this.suggestionBox.innerHTML = users.map(user => `
            <div class="mention-option" data-id="${user.id}">
                @${user.email.split('@')[0]}
            </div>
        `).join('');
        
        const rect = this.input.getBoundingClientRect();
        this.suggestionBox.style.display = 'block';
        this.suggestionBox.style.top = `${rect.bottom + window.scrollY}px`;
        this.suggestionBox.style.left = `${rect.left + position * 8}px`;
    }

    selectMention(e) {
        if (e.target.classList.contains('mention-option')) {
            const username = e.target.textContent.trim();
            const currentValue = this.input.value;
            const newValue = currentValue.replace(/@[^@]*$/, username + ' ');
            this.input.value = newValue;
            this.hideSuggestions();
        }
    }

    hideSuggestions() {
        this.suggestionBox.style.display = 'none';
    }
}

// Initialize MentionHandler on event description field
new MentionHandler(document.getElementById('event-description'));