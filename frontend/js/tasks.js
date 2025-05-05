class TaskList {
    constructor() {
        this.selectedDate = new Date();
        this.tasksContainer = document.getElementById('tasks-container');
        this.init();
    }

    init() {
        document.getElementById('new-task-btn').addEventListener('click', () => this.showTaskForm());
        this.tasksContainer.addEventListener('click', this.handleTaskActions.bind(this));
        document.querySelector('.calendar-grid').addEventListener('dateSelected', (e) => {
            this.selectedDate = e.detail.date;
            this.loadTasks();
        });
    }

    async loadTasks() {
        try {
            const dateStr = this.selectedDate.toISOString().split('T')[0];
            const response = await fetch(`/api/tasks.php?date=${dateStr}`);
            const tasks = await response.json();
            
            this.tasksContainer.innerHTML = tasks.map(task => `
                <div class="task-item" data-task-id="${task.id}">
                    <input type="checkbox" ${task.is_completed ? 'checked' : ''}>
                    <span class="task-text ${task.is_completed ? 'completed' : ''}">${task.task}</span>
                    <span class="task-due">${new Date(task.due_date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                    <button class="delete-task">×</button>
                </div>
            `).join('');
        } catch (error) {
            console.error('Error loading tasks:', error);
        }
    }

    handleTaskActions(e) {
        const taskItem = e.target.closest('.task-item');
        if (!taskItem) return;
        
        const taskId = taskItem.dataset.taskId;
        
        if (e.target.matches('input[type="checkbox"]')) {
            this.toggleTask(taskId, e.target.checked);
        }
        
        if (e.target.matches('.delete-task')) {
            this.deleteTask(taskId);
        }
    }

    async toggleTask(taskId, completed) {
        try {
            await fetch(`/api/tasks.php?id=${taskId}`, {
                method: 'PATCH',
                body: JSON.stringify({ is_completed: completed })
            });
            taskItem.querySelector('.task-text').classList.toggle('completed', completed);
        } catch (error) {
            console.error('Error updating task:', error);
        }
    }

    async deleteTask(taskId) {
        try {
            await fetch(`/api/tasks.php?id=${taskId}`, { method: 'DELETE' });
            document.querySelector(`[data-task-id="${taskId}"]`).remove();
        } catch (error) {
            console.error('Error deleting task:', error);
        }
    }

    showTaskForm() {
        // Similar to event modal implementation
    }
}