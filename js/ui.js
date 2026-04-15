/**
 * 🌸 UI MODULE
 * Handles DOM manipulation, rendering, and UI interactions
 */

const UI = {
    // DOM Elements
    tabs: document.querySelectorAll('.nav-tab'),
    tabContents: document.querySelectorAll('.tab-content'),
    
    // Format helpers
    formatDate(dateStr) {
        const [year, month, day] = dateStr.split('-');
        return `${day}/${month}/${year}`;
    },

    getCategoryLabel(cat) {
        const labels = {
            family: '👨‍👩‍👧‍👦 Gia đình',
            friend: '👫 Bạn bè',
            colleague: '💼 Đồng nghiệp',
            other: '⭐ Khác'
        };
        return labels[cat] || 'Khác';
    },

    /**
     * Show a specific tab
     */
    showTab(tabId) {
        // Update tab buttons
        this.tabs.forEach(tab => {
            if (tab.dataset.tab === tabId) {
                tab.classList.add('active');
            } else {
                tab.classList.remove('active');
            }
        });

        // Update content sections
        this.tabContents.forEach(content => {
            if (content.id === `${tabId}Content`) {
                content.classList.add('active');
            } else {
                content.classList.remove('active');
            }
        });

        // Specific logic when entering tabs
        if (tabId === 'dashboard') this.renderDashboard();
        if (tabId === 'events') this.renderEventsList();
        if (tabId === 'reminders') this.renderReminders();
        
        window.scrollTo(0, 0);
    },

    /**
     * Render the main dashboard
     */
    renderDashboard() {
        const today = new Date();
        document.getElementById('todayDate').textContent = `Hôm nay, ${today.getDate()} tháng ${today.getMonth() + 1}`;
        
        // Simple lunar date placeholder (would need a library for real conversion)
        document.getElementById('todayLunar').textContent = 'Chúc bạn một ngày tuyệt vời! ✨';

        let family = 0, friends = 0, holidays = 0, others = 0;
        const upcomingContainer = document.getElementById('upcomingEvents');
        const todayContainer = document.getElementById('todayEvents');
        
        upcomingContainer.innerHTML = '';
        todayContainer.innerHTML = '';

        let hasToday = false;
        let upcomingCount = 0;

        // Process events
        const sortedEvents = [...App.events].sort((a, b) => App.getDaysUntil(a.date) - App.getDaysUntil(b.date));

        sortedEvents.forEach(event => {
            // Stats
            if (event.category === 'family') family++;
            else if (event.category === 'friend') friends++;
            else if (event.type === 'holiday') holidays++;
            else others++;

            const daysUntil = App.getDaysUntil(event.date);
            const cardHtml = this.createEventCard(event, daysUntil);

            if (daysUntil === 0) {
                todayContainer.insertAdjacentHTML('beforeend', cardHtml);
                hasToday = true;
                
                // Fire confetti for today's events if it's the first time seeing dashboard today
                this.celebrate();
            } else if (daysUntil <= 30 && upcomingCount < 5) {
                upcomingContainer.insertAdjacentHTML('beforeend', cardHtml);
                upcomingCount++;
            }
        });

        // Update stats
        this.updateStats();

        // Empty states
        if (!hasToday) {
            todayContainer.innerHTML = `
                <div class="empty-state">
                    <span class="empty-emoji">🌸</span>
                    <p>Hôm nay không có sự kiện nào</p>
                </div>
            `;
        }
        
        if (upcomingCount === 0) {
            upcomingContainer.innerHTML = `
                <div class="empty-state">
                    <span class="empty-emoji">💤</span>
                    <p>Chưa có sự kiện nào sắp tới</p>
                </div>
            `;
        }

        // Setup delete buttons
        this.setupDeleteButtons();
    },

    /**
     * Update stats cards
     */
    updateStats() {
        let family = 0, friends = 0, holidays = 0, others = 0;
        
        App.events.forEach(event => {
            if (event.category === 'family') family++;
            else if (event.category === 'friend') friends++;
            else if (event.type === 'holiday') holidays++;
            else others++;
        });

        const elFamily = document.getElementById('statFamily');
        const elFriends = document.getElementById('statFriends');
        const elHolidays = document.getElementById('statHolidays');
        const elOthers = document.getElementById('statOthers');

        if (elFamily) elFamily.textContent = family;
        if (elFriends) elFriends.textContent = friends;
        if (elHolidays) elHolidays.textContent = holidays;
        if (elOthers) elOthers.textContent = others;
    },

    /**
     * Create HTML for an event card
     */
    createEventCard(event, daysUntil) {
        const ageMsg = App.calculateAge(event) ? ` (Tuổi ${App.calculateAge(event) + (daysUntil===0?0:1)})` : '';
        const isToday = daysUntil === 0;

        return `
            <div class="event-card ${isToday ? 'today-highlight' : ''}" data-id="${event.id}">
                <div class="event-avatar">${event.emoji}</div>
                <div class="event-info">
                    <div class="event-name">${event.name}${ageMsg}</div>
                    <div class="event-detail">${this.formatDate(event.date)} • ${this.getCategoryLabel(event.category)}</div>
                </div>
                <div class="event-date-badge ${isToday ? 'today' : ''}">
                    <span class="days-left">${isToday ? '🎉' : daysUntil}</span>
                    <span class="days-label">${isToday ? 'Hôm nay' : 'Ngày'}</span>
                </div>
                <div class="event-actions">
                    <button class="event-action-btn edit-btn" title="Chỉnh sửa" onclick="UI.openEditModal('${event.id}')">✏️</button>
                    <button class="event-action-btn delete delete-btn" title="Xóa" data-id="${event.id}">✕</button>
                </div>
            </div>
        `;
    },

    /**
     * Render the full events list
     */
    renderEventsList() {
        const container = document.getElementById('eventsList');
        const filter = document.querySelector('.filter-btn.active').dataset.filter;
        const sort = document.getElementById('sortSelect').value;
        const searchTerm = document.getElementById('searchInput').value.toLowerCase();

        let filtered = App.events.filter(event => {
            const matchesSearch = event.name.toLowerCase().includes(searchTerm) || 
                                (event.note && event.note.toLowerCase().includes(searchTerm));
            
            if (!matchesSearch) return false;

            if (filter === 'all') return true;
            if (filter === 'birthday') return event.type === 'birthday';
            if (filter === 'holiday') return event.type === 'holiday';
            return event.category === filter;
        });

        // Sort logic
        if (sort === 'upcoming') {
            filtered.sort((a, b) => App.getDaysUntil(a.date) - App.getDaysUntil(b.date));
        } else if (sort === 'name') {
            filtered.sort((a, b) => a.name.localeCompare(b.name));
        } else if (sort === 'category') {
            filtered.sort((a, b) => a.category.localeCompare(b.category));
        }

        container.innerHTML = '';

        if (filtered.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <span class="empty-emoji">🔍</span>
                    <p>Không tìm thấy sự kiện nào</p>
                </div>
            `;
            return;
        }

        filtered.forEach(event => {
            const cardHtml = this.createEventCard(event, App.getDaysUntil(event.date));
            container.insertAdjacentHTML('beforeend', cardHtml);
        });

        this.setupDeleteButtons();
    },

    /**
     * Render the reminders tab
     */
    renderReminders() {
        const container = document.getElementById('activeReminders');
        const badge = document.getElementById('reminderBadge');
        const notificationCard = document.getElementById('notificationCard');
        
        const reminders = Reminders.getUpcomingReminders();

        // Update badge
        if (reminders.length > 0) {
            badge.style.display = 'flex';
            badge.textContent = reminders.length > 9 ? '9+' : reminders.length;
        } else {
            badge.style.display = 'none';
        }

        // Render list
        container.innerHTML = '';
        if (reminders.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <span class="empty-emoji">✨</span>
                    <p>Chưa có nhắc nhở nào trong thời gian tới</p>
                </div>
            `;
        } else {
            reminders.forEach(r => {
                const isUrgent = r.isUrgent ? 'urgent' : '';
                const isToday = r.isToday ? 'today' : '';
                
                let dayText = `${r.daysUntil} ngày nữa`;
                if (r.daysUntil === 0) dayText = 'Hôm nay!';
                if (r.daysUntil === 1) dayText = 'Ngày mai!';

                container.insertAdjacentHTML('beforeend', `
                    <div class="reminder-card ${isUrgent} ${isToday}">
                        <div class="reminder-emoji">${r.emoji}</div>
                        <div class="reminder-info">
                            <div class="reminder-name">${r.name}</div>
                            <div class="reminder-detail">${this.formatDate(r.date)}</div>
                        </div>
                        <div class="reminder-countdown">
                            <span class="count">${r.isToday ? '🎊' : r.daysUntil}</span>
                            <span class="count-label">${r.isToday ? 'ON' : 'NGÀY'}</span>
                        </div>
                    </div>
                `);
            });
        }

        // Notification UI
        if (Notification.permission === 'granted') {
            notificationCard.innerHTML = `
                <div class="notification-icon" style="animation:none; color:var(--success)">✅</div>
                <h3>Thông báo đã bật</h3>
                <p>Bạn sẽ không bỏ lỡ ngày quan trọng nào!</p>
            `;
        }
    },

    /**
     * Setup delete button listeners
     */
    setupDeleteButtons() {
        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.onclick = (e) => {
                e.stopPropagation();
                if (confirm('Bạn có chắc muốn xóa sự kiện này không? 🥺')) {
                    const id = e.target.dataset.id;
                    App.deleteEvent(id);
                    this.showToast('Đã xóa sự kiện! 🗑️', 'info');
                    
                    // Re-render current view
                    const activeTab = document.querySelector('.nav-tab.active').dataset.tab;
                    if (activeTab === 'dashboard') this.renderDashboard();
                    else if (activeTab === 'events') this.renderEventsList();
                }
            };
        });
    },

    /**
     * Show Toast Notification
     */
    showToast(message, type = 'success') {
        const container = document.getElementById('toastContainer');
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.textContent = message;
        
        container.appendChild(toast);
        
        setTimeout(() => {
            toast.remove();
        }, 3000);
    },

    /**
     * Modal logic
     */
    openEditModal(id) {
        const event = App.getEvent(id);
        if (!event) return;

        document.getElementById('editEventId').value = event.id;
        document.getElementById('editName').value = event.name;
        document.getElementById('editDate').value = event.date;
        document.getElementById('editCategory').value = event.category;
        document.getElementById('editNote').value = event.note || '';

        document.getElementById('editModal').classList.add('active');
    },

    closeModal() {
        document.getElementById('editModal').classList.remove('active');
    },

    /**
     * Confetti animation
     */
    celebrate() {
        // Only run once per session
        if (sessionStorage.getItem('celebrated')) return;
        sessionStorage.setItem('celebrated', 'true');

        const canvas = document.getElementById('confettiCanvas');
        const ctx = canvas.getContext('2d');
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        const pieces = [];
        const colors = ['#ff6b9d', '#38bdf8', '#a78bfa', '#34d399', '#fbbf24'];

        for (let i = 0; i < 100; i++) {
            pieces.push({
                x: Math.random() * canvas.width,
                y: Math.random() * -canvas.height,
                size: Math.random() * 10 + 5,
                color: colors[Math.floor(Math.random() * colors.length)],
                speed: Math.random() * 3 + 2,
                rotation: Math.random() * 360,
                rotationSpeed: (Math.random() - 0.5) * 10
            });
        }

        function animate() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            let active = false;
            
            pieces.forEach(p => {
                p.y += p.speed;
                p.rotation += p.rotationSpeed;
                
                ctx.save();
                ctx.translate(p.x, p.y);
                ctx.rotate(p.rotation * Math.PI / 180);
                ctx.fillStyle = p.color;
                ctx.fillRect(-p.size/2, -p.size/2, p.size, p.size);
                ctx.restore();

                if (p.y < canvas.height) active = true;
            });

            if (active) requestAnimationFrame(animate);
            else ctx.clearRect(0, 0, canvas.width, canvas.height);
        }

        animate();
    }
};

window.UI = UI;
