class ModernTaskPlanner {
    constructor() {
        this.currentDate = new Date();
        this.currentView = 'daily';
        this.data = this.loadData();
        this.taskCategories = ['personal', 'work', 'study', 'health', 'spiritual', 'family'];
        this.fabOpen = false;
        
        // Essential daily tasks that should be done every day
        this.essentialTasks = [
            { time: '05:30', title: 'Morning meditation & gratitude', category: 'spiritual', section: 'essential', isDefault: true },
            { time: '06:00', title: 'Exercise or physical activity', category: 'health', section: 'essential', isDefault: true },
            { time: '22:00', title: 'Plan tomorrow & reflection', category: 'personal', section: 'essential', isDefault: true },
            { time: '22:30', title: 'Quality sleep preparation', category: 'health', section: 'essential', isDefault: true }
        ];

        // Default morning routine
        this.morningTasks = [
            { time: '06:30', title: 'Healthy breakfast', category: 'health', section: 'morning', isDefault: true },
            { time: '07:00', title: 'Review daily goals', category: 'personal', section: 'morning', isDefault: true },
            { time: '07:30', title: 'Get ready for the day', category: 'personal', section: 'morning', isDefault: true }
        ];

        // Default work tasks
        this.workTasks = [
            { time: '09:00', title: 'Check emails & prioritize tasks', category: 'work', section: 'work', isDefault: true },
            { time: '10:00', title: 'Focus on high-priority project', category: 'work', section: 'work', isDefault: true },
            { time: '13:00', title: 'Lunch break', category: 'personal', section: 'work', isDefault: true },
            { time: '14:00', title: 'Afternoon work block', category: 'work', section: 'work', isDefault: true },
            { time: '17:00', title: 'Wrap up and plan next day', category: 'work', section: 'work', isDefault: true }
        ];

        // Default evening tasks
        this.eveningTasks = [
            { time: '18:00', title: 'Dinner with family', category: 'family', section: 'evening', isDefault: true },
            { time: '19:00', title: 'Personal learning time', category: 'study', section: 'evening', isDefault: true },
            { time: '20:00', title: 'Hobby or relaxation', category: 'personal', section: 'evening', isDefault: true },
            { time: '21:00', title: 'Family time', category: 'family', section: 'evening', isDefault: true }
        ];

        this.initializeDefaultTasks();
        this.init();
    }

    // Data Management
    loadData() {
        const saved = localStorage.getItem('modern-task-planner');
        const defaultData = {
            tasks: {},
            customTasks: [],
            reflections: {},
            stats: { totalCompleted: 0, currentStreak: 0 }
        };
        return saved ? { ...defaultData, ...JSON.parse(saved) } : defaultData;
    }

    saveData() {
        localStorage.setItem('modern-task-planner', JSON.stringify(this.data));
    }

    // Initialize default tasks if not exists
    initializeDefaultTasks() {
        const dateKey = this.getDateKey();
        if (!this.data.tasks[dateKey]) {
            this.data.tasks[dateKey] = {
                essential: [...this.essentialTasks],
                morning: [...this.morningTasks],
                work: [...this.workTasks],
                evening: [...this.eveningTasks],
                custom: []
            };
            this.saveData();
        }
    }

    // Utility Functions
    getDateKey(date = this.currentDate) {
        return date.toISOString().split('T')[0];
    }

    formatDate(date) {
        return date.toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        });
    }

    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    // Sort tasks to show manual tasks first
    sortTasks(tasks) {
        return tasks.sort((a, b) => {
            // Manual tasks (non-default) come first
            if (!a.isDefault && b.isDefault) return -1;
            if (a.isDefault && !b.isDefault) return 1;
            
            // Then sort by time for same type (manual or default)
            const timeA = a.time || '00:00';
            const timeB = b.time || '00:00';
            return timeA.localeCompare(timeB);
        });
    }

    // Initialize the application
    init() {
        this.updateCurrentDate();
        this.setupEventListeners();
        this.renderCurrentView();
        this.updateStats();
    }

    updateCurrentDate() {
        const dateElement = document.getElementById('currentDate');
        if (dateElement) {
            dateElement.textContent = `Today is ${this.formatDate(this.currentDate)}`;
        }
    }

    // Event Listeners
    setupEventListeners() {
        // Navigation tabs
        document.querySelectorAll('.nav-tab').forEach(tab => {
            tab.addEventListener('click', () => this.switchView(tab.dataset.view));
        });

        // Quick add form
        const quickAddForm = document.getElementById('quickAddForm');
        if (quickAddForm) {
            quickAddForm.addEventListener('submit', this.handleQuickAdd.bind(this));
        }

        // Floating Action Button
        const fabMain = document.getElementById('fabMain');
        const fabActions = document.getElementById('fabActions');
        
        if (fabMain) {
            fabMain.addEventListener('click', () => {
                this.fabOpen = !this.fabOpen;
                fabActions.classList.toggle('active', this.fabOpen);
            });
        }

        // FAB Actions
        document.querySelectorAll('.fab-action').forEach(action => {
            action.addEventListener('click', () => {
                const actionType = action.dataset.action;
                this.handleFabAction(actionType);
            });
        });

        // Reflection save
        const saveReflectionBtn = document.getElementById('saveReflection');
        if (saveReflectionBtn) {
            saveReflectionBtn.addEventListener('click', this.saveReflection.bind(this));
        }

        // Month navigation
        const prevMonth = document.getElementById('prevMonth');
        const nextMonth = document.getElementById('nextMonth');
        if (prevMonth) prevMonth.addEventListener('click', () => this.navigateMonth(-1));
        if (nextMonth) nextMonth.addEventListener('click', () => this.navigateMonth(1));
    }

    // Quick Add Task Handler
    handleQuickAdd(e) {
        e.preventDefault();
        
        const taskType = document.getElementById('taskType').value;
        const taskTitle = document.getElementById('taskTitle').value;
        const taskTime = document.getElementById('taskTime').value;
        const taskDescription = document.getElementById('taskDescription').value;

        if (!taskType || !taskTitle) {
            alert('Please fill in task type and title');
            return;
        }

        const newTask = {
            id: this.generateId(),
            title: taskTitle,
            description: taskDescription,
            time: taskTime || '00:00',
            category: taskType,
            section: this.determineSectionForCategory(taskType),
            completed: false,
            createdAt: new Date().toISOString(),
            isDefault: false, // Mark as manual task
            isManual: true // Additional flag for manual tasks
        };

        const dateKey = this.getDateKey();
        if (!this.data.tasks[dateKey]) {
            this.initializeDefaultTasks();
        }

        // Add to appropriate section based on category
        const targetSection = this.determineSectionForCategory(taskType);
        this.data.tasks[dateKey][targetSection].push(newTask);
        this.data.customTasks.push(newTask);
        this.saveData();

        // Clear form
        document.getElementById('quickAddForm').reset();
        
        // Re-render current view
        this.renderCurrentView();
        this.updateStats();
        
        // Show success message
        this.showNotification('Task added to top of the list! 🎉', 'success');
    }

    // Determine which section a task should go to based on category
    determineSectionForCategory(category) {
        switch (category) {
            case 'work':
                return 'work';
            case 'health':
            case 'spiritual':
                return 'essential';
            case 'study':
                return 'evening';
            case 'family':
                return 'evening';
            case 'personal':
            default:
                return 'custom';
        }
    }

    // FAB Actions Handler
    handleFabAction(actionType) {
        switch (actionType) {
            case 'export':
                this.exportData();
                break;
            case 'reset':
                this.resetData();
                break;
            case 'settings':
                this.showSettings();
                break;
        }
        
        // Close FAB menu
        this.fabOpen = false;
        document.getElementById('fabActions').classList.remove('active');
    }

    // View Management
    switchView(viewName) {
        // Update navigation
        document.querySelectorAll('.nav-tab').forEach(tab => {
            tab.classList.remove('active');
        });
        document.querySelector(`[data-view="${viewName}"]`).classList.add('active');

        // Update view containers
        document.querySelectorAll('.view-container').forEach(container => {
            container.classList.remove('active');
        });
        document.getElementById(`${viewName}View`).classList.add('active');

        this.currentView = viewName;
        this.renderCurrentView();
    }

    renderCurrentView() {
        switch (this.currentView) {
            case 'daily':
                this.renderDailyView();
                break;
            case 'weekly':
                this.renderWeeklyView();
                break;
            case 'monthly':
                this.renderMonthlyView();
                break;
            case 'analytics':
                this.renderAnalyticsView();
                break;
        }
    }

    // Daily View Rendering
    renderDailyView() {
        const dateKey = this.getDateKey();
        const dayTasks = this.data.tasks[dateKey] || {};

        // Update daily title
        const dailyTitle = document.getElementById('dailyTitle');
        if (dailyTitle) {
            dailyTitle.textContent = this.formatDate(this.currentDate);
        }

        // Render each section with sorted tasks (manual tasks first)
        this.renderTaskSection('essential', this.sortTasks([...(dayTasks.essential || [])]));
        this.renderTaskSection('morning', this.sortTasks([...(dayTasks.morning || [])]));
        this.renderTaskSection('work', this.sortTasks([...(dayTasks.work || [])]));
        this.renderTaskSection('evening', this.sortTasks([...(dayTasks.evening || [])]));
        this.renderTaskSection('custom', this.sortTasks([...(dayTasks.custom || [])]));

        // Load reflection
        const reflectionTextarea = document.getElementById('dailyReflection');
        if (reflectionTextarea) {
            reflectionTextarea.value = this.data.reflections[dateKey] || '';
        }

        this.updateDailyProgress();
        this.updateSectionBadges();
    }

    renderTaskSection(sectionName, tasks) {
        const container = document.getElementById(`${sectionName}Tasks`);
        if (!container) return;

        container.innerHTML = tasks.map(task => `
            <div class="task-item ${task.completed ? 'completed' : ''} ${task.isManual ? 'manual-task' : 'default-task'}" 
                 data-task-id="${task.id || task.title}"
                 title="${task.isManual ? 'Manual Task - Added by you' : 'Default Task'}">
                <div class="task-checkbox ${task.completed ? 'checked' : ''}" onclick="window.planner.toggleTask('${sectionName}', '${task.id || task.title}')">
                    ${task.completed ? '<i class="fas fa-check"></i>' : ''}
                </div>
                <div class="task-time">${task.time}</div>
                <div class="task-content">
                    <div class="task-title">
                        ${task.isManual ? '<i class="fas fa-user-plus manual-indicator" title="Your custom task"></i> ' : ''}
                        ${task.title}
                    </div>
                    ${task.description ? `<div class="task-description">${task.description}</div>` : ''}
                </div>
                <div class="task-category ${task.category}">${task.category}</div>
                ${task.isManual ? '<div class="task-actions"><button class="btn-delete" onclick="window.planner.deleteTask(\'' + sectionName + '\', \'' + (task.id || task.title) + '\')" title="Delete task"><i class="fas fa-trash"></i></button></div>' : ''}
            </div>
        `).join('');
    }

    // Task Management
    toggleTask(section, taskId) {
        const dateKey = this.getDateKey();
        const dayTasks = this.data.tasks[dateKey];
        
        if (!dayTasks || !dayTasks[section]) return;

        const task = dayTasks[section].find(t => (t.id || t.title) === taskId);
        if (task) {
            task.completed = !task.completed;
            
            // Update stats
            if (task.completed) {
                this.data.stats.totalCompleted++;
            } else {
                this.data.stats.totalCompleted = Math.max(0, this.data.stats.totalCompleted - 1);
            }

            this.saveData();
            this.renderDailyView();
            this.updateStats();
            
            // Show completion animation
            if (task.completed) {
                this.showNotification(task.isManual ? 'Your custom task completed! 🎉' : 'Task completed! 🎉', 'success');
            }
        }
    }

    // Delete Task (only for manual tasks)
    deleteTask(section, taskId) {
        if (!confirm('Are you sure you want to delete this task?')) return;

        const dateKey = this.getDateKey();
        const dayTasks = this.data.tasks[dateKey];
        
        if (!dayTasks || !dayTasks[section]) return;

        const taskIndex = dayTasks[section].findIndex(t => (t.id || t.title) === taskId);
        if (taskIndex !== -1) {
            const task = dayTasks[section][taskIndex];
            
            // Only allow deletion of manual tasks
            if (task.isManual) {
                dayTasks[section].splice(taskIndex, 1);
                
                // Remove from custom tasks array
                const customTaskIndex = this.data.customTasks.findIndex(t => (t.id || t.title) === taskId);
                if (customTaskIndex !== -1) {
                    this.data.customTasks.splice(customTaskIndex, 1);
                }
                
                this.saveData();
                this.renderDailyView();
                this.updateStats();
                this.showNotification('Task deleted successfully!', 'success');
            } else {
                this.showNotification('Cannot delete default tasks!', 'error');
            }
        }
    }

    // Progress Updates
    updateDailyProgress() {
        const dateKey = this.getDateKey();
        const dayTasks = this.data.tasks[dateKey] || {};
        
        let totalTasks = 0;
        let completedTasks = 0;

        Object.values(dayTasks).forEach(sectionTasks => {
            if (Array.isArray(sectionTasks)) {
                totalTasks += sectionTasks.length;
                completedTasks += sectionTasks.filter(t => t.completed).length;
            }
        });

        const percentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
        
        // Update progress ring
        const progressCircle = document.getElementById('progressCircle');
        const progressText = document.getElementById('progressText');
        
        if (progressCircle && progressText) {
            const circumference = 2 * Math.PI * 54; // radius = 54
            const offset = circumference - (percentage / 100) * circumference;
            
            progressCircle.style.strokeDashoffset = offset;
            progressText.textContent = `${percentage}%`;
        }

        // Update task counts
        const completedTasksEl = document.getElementById('completedTasks');
        const totalTasksEl = document.getElementById('totalTasks');
        
        if (completedTasksEl) completedTasksEl.textContent = completedTasks;
        if (totalTasksEl) totalTasksEl.textContent = totalTasks;
    }

    updateSectionBadges() {
        const dateKey = this.getDateKey();
        const dayTasks = this.data.tasks[dateKey] || {};

        ['essential', 'morning', 'work', 'evening', 'custom'].forEach(section => {
            const badge = document.getElementById(`${section}Badge`);
            if (badge && dayTasks[section]) {
                const total = dayTasks[section].length;
                const completed = dayTasks[section].filter(t => t.completed).length;
                const manualCount = dayTasks[section].filter(t => t.isManual).length;
                
                badge.textContent = `${completed}/${total}`;
                
                // Add indicator for manual tasks if any exist
                if (manualCount > 0) {
                    badge.title = `${completed} completed out of ${total} tasks (${manualCount} custom tasks)`;
                }
                
                // Update badge color based on completion
                if (completed === total && total > 0) {
                    badge.style.backgroundColor = 'var(--success-color)';
                } else {
                    badge.style.backgroundColor = 'var(--primary-color)';
                }
            }
        });
    }

    // Stats Updates
    updateStats() {
        // Calculate current streak
        const streak = this.calculateStreak();
        this.data.stats.currentStreak = streak;

        // Update stat displays
        const todayStreakEl = document.getElementById('todayStreak');
        const weekStreakEl = document.getElementById('weekStreak');
        const monthStreakEl = document.getElementById('monthStreak');
        const totalStreakEl = document.getElementById('totalStreak');

        if (todayStreakEl) {
            const today = this.getDayCompletionPercentage();
            todayStreakEl.textContent = `${today}%`;
        }

        if (weekStreakEl) {
            const week = this.getWeekCompletionPercentage();
            weekStreakEl.textContent = `${week}%`;
        }

        if (monthStreakEl) {
            const month = this.getMonthCompletionPercentage();
            monthStreakEl.textContent = `${month}%`;
        }

        if (totalStreakEl) {
            totalStreakEl.textContent = this.data.stats.totalCompleted;
        }

        this.saveData();
    }

    calculateStreak() {
        let streak = 0;
        let date = new Date(this.currentDate);
        
        while (date) {
            const dateKey = this.getDateKey(date);
            const dayTasks = this.data.tasks[dateKey];
            
            if (!dayTasks) break;
            
            let totalTasks = 0;
            let completedTasks = 0;
            
            Object.values(dayTasks).forEach(sectionTasks => {
                if (Array.isArray(sectionTasks)) {
                    totalTasks += sectionTasks.length;
                    completedTasks += sectionTasks.filter(t => t.completed).length;
                }
            });
            
            const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) : 0;
            
            if (completionRate >= 0.8) { // 80% completion considered successful
                streak++;
                date.setDate(date.getDate() - 1);
            } else {
                break;
            }
        }
        
        return streak;
    }

    getDayCompletionPercentage(date = this.currentDate) {
        const dateKey = this.getDateKey(date);
        const dayTasks = this.data.tasks[dateKey] || {};
        
        let totalTasks = 0;
        let completedTasks = 0;

        Object.values(dayTasks).forEach(sectionTasks => {
            if (Array.isArray(sectionTasks)) {
                totalTasks += sectionTasks.length;
                completedTasks += sectionTasks.filter(t => t.completed).length;
            }
        });

        return totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
    }

    getWeekCompletionPercentage() {
        const startOfWeek = new Date(this.currentDate);
        startOfWeek.setDate(this.currentDate.getDate() - this.currentDate.getDay());
        
        let totalPercentage = 0;
        let daysCount = 0;

        for (let i = 0; i < 7; i++) {
            const date = new Date(startOfWeek);
            date.setDate(startOfWeek.getDate() + i);
            
            if (date <= this.currentDate) {
                totalPercentage += this.getDayCompletionPercentage(date);
                daysCount++;
            }
        }

        return daysCount > 0 ? Math.round(totalPercentage / daysCount) : 0;
    }

    getMonthCompletionPercentage() {
        const startOfMonth = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth(), 1);
        const endOfMonth = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() + 1, 0);
        
        let totalPercentage = 0;
        let daysCount = 0;
        
        for (let date = new Date(startOfMonth); date <= Math.min(endOfMonth, this.currentDate); date.setDate(date.getDate() + 1)) {
            totalPercentage += this.getDayCompletionPercentage(new Date(date));
            daysCount++;
        }

        return daysCount > 0 ? Math.round(totalPercentage / daysCount) : 0;
    }

    // Weekly View
    renderWeeklyView() {
        const container = document.getElementById('weeklyGrid');
        if (!container) return;

        const startOfWeek = new Date(this.currentDate);
        startOfWeek.setDate(this.currentDate.getDate() - this.currentDate.getDay());

        const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        let weeklyHtml = '';

        for (let i = 0; i < 7; i++) {
            const date = new Date(startOfWeek);
            date.setDate(startOfWeek.getDate() + i);
            
            const completion = this.getDayCompletionPercentage(date);
            const dateKey = this.getDateKey(date);
            const dayTasks = this.data.tasks[dateKey] || {};
            
            let totalTasks = 0;
            Object.values(dayTasks).forEach(sectionTasks => {
                if (Array.isArray(sectionTasks)) {
                    totalTasks += sectionTasks.length;
                }
            });

            weeklyHtml += `
                <div class="day-card ${completion === 100 ? 'completed' : ''}">
                    <div class="day-card-header">
                        <h3>${dayNames[i]}</h3>
                        <span class="day-date">${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                    </div>
                    <div class="day-progress">
                        <div class="progress-bar" style="width: ${completion}%"></div>
                    </div>
                    <div class="day-stats">
                        <span>${completion}% complete</span>
                        <span>${totalTasks} tasks</span>
                    </div>
                </div>
            `;
        }

        container.innerHTML = weeklyHtml;
    }

    // Monthly View
    renderMonthlyView() {
        this.renderCalendarGrid();
        this.renderMonthlyStats();
    }

    renderCalendarGrid() {
        const container = document.getElementById('calendarGrid');
        if (!container) return;

        const year = this.currentDate.getFullYear();
        const month = this.currentDate.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const daysInMonth = lastDay.getDate();
        const startingDay = firstDay.getDay();

        // Update month title
        const monthTitle = document.getElementById('monthTitle');
        if (monthTitle) {
            monthTitle.textContent = firstDay.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
        }

        let html = '';
        
        // Add day headers
        const dayHeaders = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        dayHeaders.forEach(day => {
            html += `<div class="calendar-day" style="font-weight: 600; background: var(--bg-secondary);">${day}</div>`;
        });

        // Add empty cells for days before month start
        for (let i = 0; i < startingDay; i++) {
            html += '<div class="calendar-day"></div>';
        }

        // Add days of the month
        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(year, month, day);
            const completion = this.getDayCompletionPercentage(date);
            const isToday = this.isSameDay(date, new Date());
            
            let dayClass = 'calendar-day';
            if (isToday) dayClass += ' today';
            else if (completion === 100) dayClass += ' completed';
            else if (completion > 0) dayClass += ' partial';

            html += `<div class="${dayClass}" onclick="window.planner.selectDate('${this.getDateKey(date)}')">${day}</div>`;
        }

        container.innerHTML = html;
    }

    renderMonthlyStats() {
        const container = document.getElementById('monthlyStats');
        if (!container) return;

        const year = this.currentDate.getFullYear();
        const month = this.currentDate.getMonth();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        
        let completedDays = 0;
        let totalCompletion = 0;
        let totalTasks = 0;

        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(year, month, day);
            if (date > new Date()) break; // Don't count future days
            
            const completion = this.getDayCompletionPercentage(date);
            totalCompletion += completion;
            
            if (completion === 100) completedDays++;
            
            const dateKey = this.getDateKey(date);
            const dayTasks = this.data.tasks[dateKey] || {};
            Object.values(dayTasks).forEach(sectionTasks => {
                if (Array.isArray(sectionTasks)) {
                    totalTasks += sectionTasks.length;
                }
            });
        }

        const currentDay = Math.min(new Date().getDate(), daysInMonth);
        const averageCompletion = currentDay > 0 ? Math.round(totalCompletion / currentDay) : 0;

        container.innerHTML = `
            <div class="monthly-card">
                <div class="stat-icon"><i class="fas fa-calendar-check"></i></div>
                <div class="stat-number">${completedDays}</div>
                <div class="stat-label">Perfect Days</div>
            </div>
            <div class="monthly-card">
                <div class="stat-icon"><i class="fas fa-percentage"></i></div>
                <div class="stat-number">${averageCompletion}%</div>
                <div class="stat-label">Average Completion</div>
            </div>
            <div class="monthly-card">
                <div class="stat-icon"><i class="fas fa-tasks"></i></div>
                <div class="stat-number">${totalTasks}</div>
                <div class="stat-label">Total Tasks</div>
            </div>
            <div class="monthly-card">
                <div class="stat-icon"><i class="fas fa-fire"></i></div>
                <div class="stat-number">${this.data.stats.currentStreak}</div>
                <div class="stat-label">Current Streak</div>
            </div>
        `;
    }

    // Analytics View
    renderAnalyticsView() {
        // This would be expanded with actual chart implementations
        console.log('Analytics view rendered - charts would go here');
    }

    // Utility Methods
    isSameDay(date1, date2) {
        return date1.getFullYear() === date2.getFullYear() &&
               date1.getMonth() === date2.getMonth() &&
               date1.getDate() === date2.getDate();
    }

    selectDate(dateString) {
        this.currentDate = new Date(dateString);
        this.initializeDefaultTasks();
        this.switchView('daily');
        this.updateCurrentDate();
    }

    navigateMonth(direction) {
        this.currentDate.setMonth(this.currentDate.getMonth() + direction);
        this.renderMonthlyView();
    }

    // Data Management
    saveReflection() {
        const reflectionTextarea = document.getElementById('dailyReflection');
        const dateKey = this.getDateKey();
        
        if (reflectionTextarea) {
            this.data.reflections[dateKey] = reflectionTextarea.value;
            this.saveData();
            this.showNotification('Reflection saved!', 'success');
        }
    }

    exportData() {
        const dataStr = JSON.stringify(this.data, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(dataBlob);
        link.download = `task-planner-backup-${this.getDateKey()}.json`;
        link.click();
        this.showNotification('Data exported successfully!', 'success');
    }

    resetData() {
        if (confirm('Are you sure you want to reset all data? This cannot be undone.')) {
            localStorage.removeItem('modern-task-planner');
            location.reload();
        }
    }

    showSettings() {
        // This would open a settings modal
        this.showNotification('Settings panel coming soon!', 'info');
    }

    // Notifications
    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 1rem 1.5rem;
            background: var(--bg-primary);
            border: 1px solid var(--border-color);
            border-radius: var(--radius-md);
            box-shadow: var(--shadow-lg);
            z-index: 10000;
            max-width: 300px;
            animation: slideIn 0.3s ease-out;
        `;
        
        // Set colors based on type
        if (type === 'success') {
            notification.style.borderColor = 'var(--success-color)';
            notification.style.background = 'rgba(34, 197, 94, 0.1)';
        } else if (type === 'error') {
            notification.style.borderColor = 'var(--danger-color)';
            notification.style.background = 'rgba(239, 68, 68, 0.1)';
        }
        
        notification.textContent = message;
        document.body.appendChild(notification);
        
        // Remove after 3 seconds
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }
}

// Initialize the planner when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.planner = new ModernTaskPlanner();
    console.log('Modern Task Planner initialized successfully!');
});
