/**
 * 🌸 STORAGE MODULE
 * Handles saving and loading data from LocalStorage
 */

const STORAGE_KEYS = {
    EVENTS: 'kawaii_diary_events',
    SETTINGS: 'kawaii_diary_settings',
    LAST_VISIT: 'kawaii_diary_last_visit'
};

const Storage = {
    /**
     * Save events to local storage
     * @param {Array} events 
     */
    saveEvents(events) {
        try {
            localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(events));
            return true;
        } catch (e) {
            console.error('Error saving events:', e);
            return false;
        }
    },

    /**
     * Load events from local storage
     * @returns {Array} List of events
     */
    loadEvents() {
        const events = localStorage.getItem(STORAGE_KEYS.EVENTS);
        return events ? JSON.parse(events) : [];
    },

    /**
     * Save app settings
     * @param {Object} settings 
     */
    saveSettings(settings) {
        localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    },

    /**
     * Load app settings
     * @returns {Object} Settings object
     */
    loadSettings() {
        const settings = localStorage.getItem(STORAGE_KEYS.SETTINGS);
        const defaultSettings = {
            theme: 'sakura',
            defaultReminder: 2,
            notificationsEnabled: false
        };
        return settings ? { ...defaultSettings, ...JSON.parse(settings) } : defaultSettings;
    },

    /**
     * Export data as JSON file
     */
    exportData() {
        const data = {
            events: this.loadEvents(),
            settings: this.loadSettings(),
            exportDate: new Date().toISOString()
        };
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `kawaii_diary_backup_${new Date().toLocaleDateString()}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    },

    /**
     * Clear all data
     */
    clearAll() {
        localStorage.removeItem(STORAGE_KEYS.EVENTS);
        localStorage.removeItem(STORAGE_KEYS.SETTINGS);
    }
};

window.Storage = Storage;
