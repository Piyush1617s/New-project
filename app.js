// State Management
const state = {
    tasks: [],
    events: [],
    subjects: [],
    settings: {
        darkMode: true,
        pomodoroDuration: 25,
        firstDayOfWeek: 0
    },
    currentDate: new Date(),
    timer: {
        timeLeft: 25 * 60,
        isRunning: false,
        interval: null
    }
};

// Initialize state from localStorage with error handling
try {
    const savedTasks = localStorage.getItem('tasks');
    const savedEvents = localStorage.getItem('events');
    const savedSubjects = localStorage.getItem('subjects');
    const savedSettings = localStorage.getItem('settings');

    if (savedTasks) state.tasks = JSON.parse(savedTasks);
    if (savedEvents) state.events = JSON.parse(savedEvents);
    if (savedSubjects) state.subjects = JSON.parse(savedSubjects);
    if (savedSettings) state.settings = JSON.parse(savedSettings);
} catch (error) {
    console.error('Error loading saved data:', error);
    localStorage.clear();
}

// DOM Elements
const elements = {
    navButtons: document.querySelectorAll('.nav-btn'),
    sections: document.querySelectorAll('.section'),
    taskForm: document.getElementById('task-form'),
    taskList: document.getElementById('task-list'),
    pomodoroDisplay: document.querySelector('.timer-display'),
    startTimer: document.getElementById('start-timer'),
    resetTimer: document.getElementById('reset-timer'),
    modeButtons: document.querySelectorAll('.mode-btn'),
    calendarDays: document.getElementById('calendar-days'),
    currentMonth: document.getElementById('current-month'),
    prevMonth: document.getElementById('prev-month'),
    nextMonth: document.getElementById('next-month'),
    dayTasks: document.getElementById('day-tasks'),
    eventForm: document.getElementById('event-form'),
    eventList: document.getElementById('event-list'),
    subjectForm: document.getElementById('subject-form'),
    subjectList: document.getElementById('subject-list'),
    settingsToggle: document.getElementById('settings-toggle'),
    settingsContent: document.getElementById('settings-content'),
    themeToggle: document.getElementById('theme-toggle'),
    pomodoroDuration: document.getElementById('pomodoro-duration'),
    firstDay: document.getElementById('first-day'),
    subjectCompletion: document.getElementById('subject-preparation'),
    percentageDisplay: document.querySelector('.percentage-display')
};

// Feature Switcher
elements.navButtons.forEach(button => {
    button.addEventListener('click', () => {
        const sectionId = button.dataset.section;
        elements.navButtons.forEach(btn => btn.classList.remove('active'));
        elements.sections.forEach(section => section.classList.remove('active'));
        button.classList.add('active');
        document.getElementById(sectionId).classList.add('active');
    });
});

// Task Management
function addTask(task) {
    state.tasks.push({
        ...task,
        id: Date.now().toString(),
        completed: false
    });
    saveTasks();
    renderTasks();
}

function deleteTask(taskId) {
    state.tasks = state.tasks.filter(task => task.id !== taskId);
    saveTasks();
    renderTasks();
}

function toggleTaskComplete(taskId) {
    const task = state.tasks.find(task => task.id === taskId);
    if (task) {
        task.completed = !task.completed;
        saveTasks();
        renderTasks();
    }
}

function saveTasks() {
    localStorage.setItem('tasks', JSON.stringify(state.tasks));
}

function renderTasks() {
    const taskList = document.getElementById('task-list');
    if (!taskList) return;

    taskList.innerHTML = state.tasks.map(task => `
        <div class="task-item ${task.completed ? 'completed' : ''}">
            <input type="checkbox" ${task.completed ? 'checked' : ''} 
                   onchange="toggleTaskComplete('${task.id}')">
            <div>
                <h3>${task.name}</h3>
                <div class="badges">
                    <span class="badge">${task.priority}</span>
                    <span class="badge">${task.urgency}</span>
                </div>
                <p>Due: ${formatDate(new Date(task.dueDate + 'T' + task.dueTime))}</p>
            </div>
            <button onclick="deleteTask('${task.id}')" class="btn-secondary">
                <i class="fas fa-trash"></i>
            </button>
        </div>
    `).join('');
}

elements.taskForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const task = {
        id: Date.now().toString(),
        name: document.getElementById('task-name').value,
        category: document.getElementById('task-category').value,
        dueDate: document.getElementById('task-date').value,
        dueTime: document.getElementById('task-time').value,
        priority: document.getElementById('task-priority').value,
        urgency: document.getElementById('task-urgency').value,
        completed: false
    };
    addTask(task);
    e.target.reset();
});

// Pomodoro Timer
function updateTimerDisplay() {
    const minutes = Math.floor(state.timer.timeLeft / 60);
    const seconds = state.timer.timeLeft % 60;
    elements.pomodoroDisplay.textContent = 
        `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    // Update page title with timer
    if (state.timer.isRunning) {
        document.title = `(${elements.pomodoroDisplay.textContent}) Study Planner`;
    } else {
        document.title = 'Study Planner';
    }
}

function playNotificationSound() {
    try {
        const audio = new Audio('resources/notification.mp3');
        audio.play().catch(error => {
            console.error('Error playing notification sound:', error);
        });
    } catch (error) {
        console.error('Error creating audio element:', error);
    }
}

function startTimer() {
    if (!state.timer.isRunning) {
        state.timer.isRunning = true;
        elements.startTimer.textContent = 'Pause';
        state.timer.interval = setInterval(() => {
            if (state.timer.timeLeft > 0) {
                state.timer.timeLeft--;
                updateTimerDisplay();
            } else {
                clearInterval(state.timer.interval);
                state.timer.isRunning = false;
                elements.startTimer.textContent = 'Start';
                playNotificationSound();
            }
        }, 1000);
    } else {
        clearInterval(state.timer.interval);
        state.timer.isRunning = false;
        elements.startTimer.textContent = 'Start';
    }
}

function resetTimer() {
    clearInterval(state.timer.interval);
    state.timer.isRunning = false;
    state.timer.timeLeft = state.settings.pomodoroDuration * 60;
    elements.startTimer.textContent = 'Start';
    updateTimerDisplay();
}

elements.startTimer.addEventListener('click', startTimer);
elements.resetTimer.addEventListener('click', resetTimer);

elements.modeButtons.forEach(button => {
    button.addEventListener('click', () => {
        elements.modeButtons.forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');
        state.timer.timeLeft = parseInt(button.dataset.time) * 60;
        updateTimerDisplay();
    });
});

// Calendar functionality
const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

/**
 * Gets the number of days in a given month
 */
function getDaysInMonth(year, month) {
    return new Date(year, month + 1, 0).getDate();
}

/**
 * Gets the first day of the month (0-6 for Sunday-Saturday)
 */
function getFirstDayOfMonth(year, month) {
    return new Date(year, month, 1).getDay();
}

/**
 * Renders the calendar for the current month
 */
function renderCalendar() {
    const year = state.currentDate.getFullYear();
    const month = state.currentDate.getMonth();
    const today = new Date();
    
    // Update month/year display
    elements.currentMonth.textContent = `${MONTHS[month]} ${year}`;
    
    // Calculate calendar grid
    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);
    
    // Get days from previous month to fill first week
    const prevMonth = month === 0 ? 11 : month - 1;
    const prevYear = month === 0 ? year - 1 : year;
    const daysInPrevMonth = getDaysInMonth(prevYear, prevMonth);
    
    // Calculate days to show from previous month
    const prevMonthDays = Array(firstDay).fill('').map((_, i) => ({
        date: daysInPrevMonth - firstDay + i + 1,
        month: prevMonth,
        year: prevYear,
        isOtherMonth: true
    }));
    
    // Current month days
    const currentMonthDays = Array(daysInMonth).fill('').map((_, i) => ({
        date: i + 1,
        month: month,
        year: year,
        isCurrentMonth: true
    }));
    
    // Calculate days needed from next month to complete grid
    const nextMonth = month === 11 ? 0 : month + 1;
    const nextYear = month === 11 ? year + 1 : year;
    const remainingDays = 42 - (prevMonthDays.length + currentMonthDays.length); // 42 = 6 rows × 7 days
    
    const nextMonthDays = Array(remainingDays).fill('').map((_, i) => ({
        date: i + 1,
        month: nextMonth,
        year: nextYear,
        isOtherMonth: true
    }));
    
    // Combine all days
    const allDays = [...prevMonthDays, ...currentMonthDays, ...nextMonthDays];
    
    // Render calendar grid
    elements.calendarDays.innerHTML = allDays.map(dayInfo => {
        const isToday = dayInfo.date === today.getDate() && 
                       dayInfo.month === today.getMonth() && 
                       dayInfo.year === today.getFullYear();
                       
        // Get tasks and events for this day
        const dayTasks = dayInfo.isCurrentMonth ? state.tasks.filter(task => {
            const taskDate = new Date(task.dueDate);
            return taskDate.getDate() === dayInfo.date && 
                   taskDate.getMonth() === dayInfo.month && 
                   taskDate.getFullYear() === dayInfo.year;
        }) : [];
        
        const dayEvents = dayInfo.isCurrentMonth ? state.events.filter(event => {
            const eventDate = new Date(event.date);
            return eventDate.getDate() === dayInfo.date && 
                   eventDate.getMonth() === dayInfo.month && 
                   eventDate.getFullYear() === dayInfo.year;
        }) : [];
        
        const classes = [
            'calendar-day',
            dayInfo.isOtherMonth ? 'other-month' : '',
            dayInfo.isCurrentMonth ? 'current-month' : '',
            isToday ? 'today' : ''
        ].filter(Boolean).join(' ');
        
        return `
            <div class="${classes}" data-date="${dayInfo.year}-${dayInfo.month + 1}-${dayInfo.date}">
                <div class="day-number">${dayInfo.date}</div>
                ${dayInfo.isCurrentMonth ? `
                    <div class="day-items">
                        ${dayTasks.slice(0, 2).map(task => `
                            <div class="day-item-preview task">
                                <span class="item-dot"></span>${task.name}
                            </div>
                        `).join('')}
                        ${dayEvents.slice(0, 2).map(event => `
                            <div class="day-item-preview event">
                                <span class="item-dot"></span>${event.name}
                            </div>
                        `).join('')}
                        ${(dayTasks.length + dayEvents.length > 4) ? 
                            `<div class="day-item-preview more">+${dayTasks.length + dayEvents.length - 4} more</div>` : 
                            ''}
                    </div>
                ` : ''}
            </div>
        `;
    }).join('');
    
    // Load saved notes for this month
    loadMonthNotes(year, month);
    
    // Add click handlers for current month days
    document.querySelectorAll('.calendar-day.current-month').forEach(day => {
        day.addEventListener('click', () => {
            const [year, month, date] = day.dataset.date.split('-').map(Number);
            showDayDetails(new Date(year, month - 1, date));
        });
    });
}

/**
 * Shows the details for a selected day
 */
function showDayDetails(date) {
    const formattedDate = date.toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    });
    
    const dayTasks = state.tasks.filter(task => {
        const taskDate = new Date(task.dueDate);
        return taskDate.getDate() === date.getDate() && 
               taskDate.getMonth() === date.getMonth() && 
               taskDate.getFullYear() === date.getFullYear();
    });
    
    const dayEvents = state.events.filter(event => {
        const eventDate = new Date(event.date);
        return eventDate.getDate() === date.getDate() && 
               eventDate.getMonth() === date.getMonth() && 
               eventDate.getFullYear() === date.getFullYear();
    });
    
    const detailsContainer = document.getElementById('day-details');
    detailsContainer.innerHTML = `
        <h3 class="selected-date">${formattedDate}</h3>
        <div class="day-content">
            <div class="tasks-section">
                <h4><i class="fas fa-tasks"></i> Tasks</h4>
                ${dayTasks.length ? `
                    <div class="day-items">
                        ${dayTasks.map(task => `
                            <div class="day-item task">
                                <div class="time">${task.dueTime}</div>
                                <div class="title">${task.name}</div>
                                <div class="badge">${task.priority}</div>
                            </div>
                        `).join('')}
                    </div>
                ` : '<p class="no-items">No tasks scheduled</p>'}
            </div>
            <div class="events-section">
                <h4><i class="fas fa-star"></i> Events</h4>
                ${dayEvents.length ? `
                    <div class="day-items">
                        ${dayEvents.map(event => `
                            <div class="day-item event">
                                <div class="time">${event.time}</div>
                                <div class="title">${event.name}</div>
                            </div>
                        `).join('')}
                    </div>
                ` : '<p class="no-items">No events scheduled</p>'}
            </div>
        </div>
    `;
    detailsContainer.style.display = 'block';
}

/**
 * Loads notes for the specified month from localStorage
 */
function loadMonthNotes(year, month) {
    const notesKey = `notes-${year}-${month}`;
    const savedNotes = localStorage.getItem(notesKey) || '';
    const monthNotes = document.getElementById('month-notes');
    if (monthNotes) {
        monthNotes.value = savedNotes;
    }
}

/**
 * Saves notes for the current month to localStorage
 */
function saveMonthNotes(notes) {
    const year = state.currentDate.getFullYear();
    const month = state.currentDate.getMonth();
    const notesKey = `notes-${year}-${month}`;
    localStorage.setItem(notesKey, notes);
}

// Event Listeners for Calendar Navigation
document.getElementById('prev-month')?.addEventListener('click', () => {
    state.currentDate.setMonth(state.currentDate.getMonth() - 1);
    renderCalendar();
});

document.getElementById('next-month')?.addEventListener('click', () => {
    state.currentDate.setMonth(state.currentDate.getMonth() + 1);
    renderCalendar();
});

// Event Listener for Notes
document.getElementById('month-notes')?.addEventListener('input', (e) => {
    saveMonthNotes(e.target.value);
});

// Initialize
function initialize() {
    try {
        // Initialize UI elements
        renderTasks();
        renderEvents();
        renderSubjects();
        renderCalendar();
        updateTimerDisplay();
        
        // Apply theme
        applyTheme();
        
        // Set up event listeners
        setupEventListeners();
        
        console.log('Application initialized successfully');
    } catch (error) {
        console.error('Error during initialization:', error);
    }
}

// Start the app
document.addEventListener('DOMContentLoaded', () => {
    initialize();
});

// Event Management
function addEvent(event) {
    state.events.push({
        ...event,
        id: Date.now().toString()
    });
    saveEvents();
    renderEvents();
    renderCalendar();
}

function editEvent(eventId) {
    const event = state.events.find(e => e.id === eventId);
    if (!event) return;

    document.getElementById('event-name').value = event.name;
    document.getElementById('event-date').value = event.date;
    document.getElementById('event-time').value = event.time;
    document.getElementById('event-id').value = eventId;
    document.getElementById('event-submit').textContent = 'Update Event';
}

function updateEvent(eventId, updatedEvent) {
    const index = state.events.findIndex(e => e.id === eventId);
    if (index !== -1) {
        state.events[index] = { ...state.events[index], ...updatedEvent };
        saveEvents();
        renderEvents();
        renderCalendar();
    }
}

function deleteEvent(eventId) {
    state.events = state.events.filter(event => event.id !== eventId);
    saveEvents();
    renderEvents();
    renderCalendar();
}

function saveEvents() {
    localStorage.setItem('events', JSON.stringify(state.events));
}

function renderEvents() {
    const eventList = document.getElementById('event-list');
    if (!eventList) return;

    eventList.innerHTML = state.events
        .sort((a, b) => new Date(a.date + 'T' + a.time) - new Date(b.date + 'T' + b.time))
        .map(event => `
            <div class="event-item">
                <div class="event-info">
                    <h3>${event.name}</h3>
                    <p>${formatDate(new Date(event.date + 'T' + event.time))}</p>
                </div>
                <div class="event-actions">
                    <button onclick="editEvent('${event.id}')" class="btn-secondary">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                    <button onclick="deleteEvent('${event.id}')" class="btn-secondary">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                </div>
            </div>
        `).join('');
}

elements.eventForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const eventId = document.getElementById('event-id').value;
    const event = {
        name: document.getElementById('event-name').value,
        date: document.getElementById('event-date').value,
        time: document.getElementById('event-time').value
    };

    if (eventId) {
        updateEvent(eventId, event);
        document.getElementById('event-id').value = '';
        document.getElementById('event-submit').textContent = 'Add Event';
    } else {
        addEvent(event);
    }
    e.target.reset();
});

// Subject Management
function addSubject(subject) {
    state.subjects.push({
        ...subject,
        id: Date.now().toString(),
        courses: subject.courses.split(',').map(course => course.trim()).filter(Boolean)
    });
    saveSubjects();
    renderSubjects();
}

function editSubject(subjectId) {
    const subject = state.subjects.find(s => s.id === subjectId);
    if (!subject) return;

    document.getElementById('subject-name').value = subject.name;
    document.getElementById('subject-color').value = subject.color;
    document.getElementById('subject-courses').value = subject.courses.join(', ');
    document.getElementById('subject-confidence').value = subject.confidence;
    document.getElementById('subject-preparation').value = subject.preparation;
    document.getElementById('subject-id').value = subjectId;
    document.getElementById('subject-submit').textContent = 'Update Subject';
}

function updateSubject(subjectId, updatedSubject) {
    const index = state.subjects.findIndex(s => s.id === subjectId);
    if (index !== -1) {
        state.subjects[index] = {
            ...state.subjects[index],
            ...updatedSubject,
            courses: updatedSubject.courses.split(',').map(course => course.trim()).filter(Boolean)
        };
        saveSubjects();
        renderSubjects();
    }
}

function deleteSubject(subjectId) {
    state.subjects = state.subjects.filter(subject => subject.id !== subjectId);
    saveSubjects();
    renderSubjects();
}

function saveSubjects() {
    localStorage.setItem('subjects', JSON.stringify(state.subjects));
}

function renderSubjects() {
    const subjectList = document.getElementById('subject-list');
    if (!subjectList) return;

    subjectList.innerHTML = state.subjects.map(subject => `
        <div class="subject-item" style="border-left: 4px solid ${subject.color}">
            <div class="subject-info">
                <h3>${subject.name}</h3>
                <div class="subject-details">
                    <div class="courses">
                        <strong>Courses:</strong> ${subject.courses.join(', ') || 'None'}
                    </div>
                    <div class="confidence-level">
                        <strong>Confidence:</strong> 
                        <span class="badge">${subject.confidence}</span>
                    </div>
                    <div class="preparation-level">
                        <strong>Preparation:</strong>
                        <div class="progress-bar">
                            <div class="progress" style="width: ${subject.preparation}%"></div>
                        </div>
                        <span>${subject.preparation}%</span>
                    </div>
                </div>
            </div>
            <div class="subject-actions">
                <button onclick="editSubject('${subject.id}')" class="btn-secondary">
                    <i class="fas fa-edit"></i> Edit
                </button>
                <button onclick="deleteSubject('${subject.id}')" class="btn-secondary">
                    <i class="fas fa-trash"></i> Delete
                </button>
            </div>
        </div>
    `).join('');
}

elements.subjectForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const subjectId = document.getElementById('subject-id').value;
    const subject = {
        name: document.getElementById('subject-name').value,
        color: document.getElementById('subject-color').value,
        courses: document.getElementById('subject-courses').value,
        confidence: document.getElementById('subject-confidence').value,
        preparation: document.getElementById('subject-preparation').value
    };

    if (subjectId) {
        updateSubject(subjectId, subject);
        document.getElementById('subject-id').value = '';
        document.getElementById('subject-submit').textContent = 'Add Subject';
    } else {
        addSubject(subject);
    }
    e.target.reset();
    document.getElementById('subject-color').value = '#4ECDC4';
});

// Settings
elements.settingsToggle.addEventListener('click', () => {
    elements.settingsContent.classList.toggle('hidden');
});

elements.themeToggle.addEventListener('change', (e) => {
    state.settings.darkMode = e.target.checked;
    saveSettings();
    applyTheme();
});

elements.pomodoroDuration.addEventListener('change', (e) => {
    state.settings.pomodoroDuration = parseInt(e.target.value);
    saveSettings();
    resetTimer();
});

elements.firstDay.addEventListener('change', (e) => {
    state.settings.firstDayOfWeek = parseInt(e.target.value);
    saveSettings();
    renderCalendar();
});

function saveSettings() {
    localStorage.setItem('settings', JSON.stringify(state.settings));
}

function applyTheme() {
    document.body.classList.toggle('light-theme', !state.settings.darkMode);
}

// Add date-fns formatting for better date handling
function formatDate(date) {
    const options = { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    };
    return new Date(date).toLocaleDateString('en-US', options);
}

// Add event listener setup function
function setupEventListeners() {
    // Add all your event listeners here
    elements.taskForm.addEventListener('submit', handleTaskSubmit);
    elements.startTimer.addEventListener('click', startTimer);
    elements.resetTimer.addEventListener('click', resetTimer);
    // ... add other event listeners

    // Subject completion slider
    const slider = document.getElementById('subject-preparation');
    if (slider) {
        // Update percentage display on page load
        document.querySelector('.percentage-display').textContent = `${slider.value}%`;
        // Update when slider moves
        slider.addEventListener('input', updateSliderPercentage);
    }
}

// Add this function to handle slider updates
function updateSliderPercentage(e) {
    const value = e.target.value;
    document.querySelector('.percentage-display').textContent = `${value}%`;
} 