/**
 * 🌸 REMINDERS MODULE
 * Handles notifications and reminders logic
 */

const Reminders = {
    /**
     * Check if the browser supports notifications
     */
    supportsNotifications() {
        return 'Notification' in window;
    },

    /**
     * Request notification permission
     * @returns {Promise<boolean>}
     */
    async requestPermission() {
        if (!this.supportsNotifications()) return false;
        
        let permission = Notification.permission;
        if (permission !== 'granted' && permission !== 'denied') {
            permission = await Notification.requestPermission();
        }
        
        const granted = permission === 'granted';
        if (granted && App.settings) {
            App.settings.notificationsEnabled = true;
            Storage.saveSettings(App.settings);
        }
        return granted;
    },

    /**
     * Send a browser notification
     * @param {string} title 
     * @param {string} body 
     * @param {string} emoji 
     */
    sendNotification(title, body, emoji = '🌸') {
        if (!this.supportsNotifications() || Notification.permission !== 'granted') return;

        try {
            new Notification(`${emoji} ${title}`, {
                body: body,
                icon: '/favicon.ico' // Placeholder, could use a real icon
            });
        } catch (e) {
            console.error('Failed to send notification:', e);
        }
    },

    /**
     * Get upcoming reminders (today + next few days)
     * @returns {Array} List of events with reminder info
     */
    getUpcomingReminders() {
        if (!App.events || App.events.length === 0) return [];

        const reminders = [];
        
        App.events.forEach(event => {
            const daysUntil = App.getDaysUntil(event.date);
            
            // Check if user wants a reminder for this specific 'daysUntil'
            // Default to remindBefore array, fallback to settings default, fallback to [0]
            const reminderDays = event.remindBefore || [parseInt(App.settings.defaultReminder || 2), 0];
            
            if (reminderDays.includes(daysUntil)) {
                reminders.push({
                    ...event,
                    daysUntil: daysUntil,
                    isToday: daysUntil === 0,
                    isUrgent: daysUntil <= 1 && daysUntil > 0
                });
            } else if (daysUntil <= Math.max(...reminderDays)) { // Also show if it's within the max reminder window
                 reminders.push({
                    ...event,
                    daysUntil: daysUntil,
                    isToday: daysUntil === 0,
                    isUrgent: daysUntil <= 1 && daysUntil > 0
                });
            }
        });

        // Sort by days until (closest first)
        reminders.sort((a, b) => a.daysUntil - b.daysUntil);
        return reminders;
    },

    /**
     * Process daily notifications
     * Should ideally be called once per day
     */
    processDailyNotifications() {
        if (!App.settings.notificationsEnabled || Notification.permission !== 'granted') return;

        const lastCheck = localStorage.getItem('kawaii_last_notification_check');
        const todayStr = new Date().toISOString().split('T')[0];

        // Only check once per day
        if (lastCheck === todayStr) return;

        const upcoming = this.getUpcomingReminders();
        
        if (upcoming.length > 0) {
            let title = 'Sự kiện sắp tới!';
            let body = `Bạn có ${upcoming.length} sự kiện sắp tới.`;
            
            const todayEvents = upcoming.filter(e => e.isToday);
            if (todayEvents.length > 0) {
                title = 'Sự kiện hôm nay!';
                body = `Hôm nay là: ${todayEvents.map(e => e.name).join(', ')}`;
            } else if (upcoming[0].daysUntil === 1) {
                title = 'Nhắc nhở ngày mai';
                body = `Ngày mai là: ${upcoming[0].name}`;
            }

            this.sendNotification(title, body, upcoming[0].emoji);
        }

        localStorage.setItem('kawaii_last_notification_check', todayStr);
    }
};

window.Reminders = Reminders;
