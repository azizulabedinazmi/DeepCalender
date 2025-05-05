class AdminPanel {
    constructor() {
        this.usersTable = document.getElementById('users-table');
        this.loadUsers();
    }

    async loadUsers() {
        try {
            const response = await fetch('/api/admin.php?action=list_users');
            const users = await response.json();
            
            this.usersTable.innerHTML = users.map(user => `
                <tr>
                    <td>${user.email}</td>
                    <td>${user.role}</td>
                    <td>${new Date(user.created_at).toLocaleDateString()}</td>
                    <td>
                        <button class="delete-user" data-id="${user.id}">Delete</button>
                    </td>
                </tr>
            `).join('');
            
            this.addDeleteHandlers();
        } catch (error) {
            console.error('Error loading users:', error);
        }
    }

    addDeleteHandlers() {
        document.querySelectorAll('.delete-user').forEach(btn => {
            btn.addEventListener('click', async () => {
                if (confirm('Permanently delete this user?')) {
                    await fetch(`/api/admin.php?action=delete_user&id=${btn.dataset.id}`);
                    this.loadUsers();
                }
            });
        });
    }
}

// Initialize if on admin page
if (window.location.pathname.includes('admin.html')) {
    new AdminPanel();
}