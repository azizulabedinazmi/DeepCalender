// calendar.js
class Calendar {
    constructor() {
        this.currentDate = new Date();
        this.calendarGrid = document.getElementById('calendar-grid');
        this.monthYearDisplay = document.getElementById('month-year');
        this.init();
    }

    init() {
        this.renderCalendar();
        this.addNavigation();
        this.addDayClickHandlers();
    }

    renderCalendar() {
        // Clear existing grid
        this.calendarGrid.innerHTML = '';
        
        // Set month/year display
        this.monthYearDisplay.textContent = this.getFormattedMonthYear();

        // Generate calendar days
        const days = this.getCalendarDays();
        
        days.forEach(day => {
            const dayElement = document.createElement('div');
            dayElement.className = `calendar-day ${day.isCurrentMonth ? '' : 'other-month'} 
                                  ${day.isToday ? 'today' : ''}`;
            dayElement.dataset.date = day.date.toISOString();
            dayElement.innerHTML = `
                <div class="day-number">${day.date.getDate()}</div>
                <div class="events-list"></div>
            `;
            this.calendarGrid.appendChild(dayElement);
        });

        // Load events after rendering
        this.loadEvents();
    }

    getCalendarDays() {
        const year = this.currentDate.getFullYear();
        const month = this.currentDate.getMonth();
        const today = new Date();

        // Get first/last days of current month view
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        
        // Calculate days from previous/next months
        const startDay = new Date(firstDay);
        startDay.setDate(1 - firstDay.getDay());
        
        const endDay = new Date(lastDay);
        endDay.setDate(lastDay.getDate() + (6 - lastDay.getDay()));

        const days = [];
        const currentDate = new Date(startDay);

        while (currentDate <= endDay) {
            days.push({
                date: new Date(currentDate),
                isCurrentMonth: currentDate.getMonth() === month,
                isToday: currentDate.toDateString() === today.toDateString()
            });
            currentDate.setDate(currentDate.getDate() + 1);
        }

        return days;
    }

    getFormattedMonthYear() {
        return this.currentDate.toLocaleDateString('en-US', {
            month: 'long',
            year: 'numeric'
        });
    }

    addNavigation() {
        document.getElementById('prev-month').addEventListener('click', () => {
            this.currentDate.setMonth(this.currentDate.getMonth() - 1);
            this.renderCalendar();
        });

        document.getElementById('next-month').addEventListener('click', () => {
            this.currentDate.setMonth(this.currentDate.getMonth() + 1);
            this.renderCalendar();
        });
    }

    async loadEvents() {
        try {
            const start = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth(), 1);
            const end = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() + 1, 0);
            
            const response = await fetch(`/api/events.php?start=${start.toISOString()}&end=${end.toISOString()}`);
            const events = await response.json();

            events.forEach(event => {
                const eventDate = new Date(event.event_time);
                const dayElement = this.calendarGrid.querySelector(
                    `[data-date^="${eventDate.toISOString().split('T')[0]}"]`
                );
                if (dayElement) {
                    const eventElement = document.createElement('div');
                    eventElement.className = 'event-item';
                    eventElement.dataset.eventId = event.id; // Add event ID to dataset
                    eventElement.textContent = event.title;
                    dayElement.querySelector('.events-list').appendChild(eventElement);
                }
            });
        } catch (error) {
            console.error('Error loading events:', error);
        }
    }

    addDayClickHandlers() {
        this.calendarGrid.addEventListener('click', (e) => {
            const dayElement = e.target.closest('.calendar-day');
            const eventElement = e.target.closest('.event-item');
            
            if (eventElement) {
                const eventId = eventElement.dataset.eventId;
                this.showEventModal(null, eventId);
            } else if (dayElement) {
                const date = new Date(dayElement.dataset.date);
                this.showEventModal(date);
            }
        });
    }

    showEventModal(date, eventId = null) {
        eventModal.open(date, eventId);
    }
}

// Initialize calendar when authenticated
function initializeCalendar() {
    new Calendar();
}
