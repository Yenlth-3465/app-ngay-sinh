/**
 * 🌸 APP MODULE
 * Handles the core business logic and state management
 */

const App = {
    events: [],
    settings: {},

    /**
     * Initialize the app data
     */
    init() {
        this.events = Storage.loadEvents();
        this.settings = Storage.loadSettings();
        this.applyTheme(this.settings.theme);
    },

    /**
     * Add a target event
     * @param {Object} eventData 
     */
    addEvent(eventData) {
        const newEvent = {
            id: Date.now().toString(),
            name: eventData.name,
            date: eventData.date, // YYYY-MM-DD
            type: eventData.type, // birthday, holiday, anniversary, other
            category: eventData.category, // family, friend, colleague, other
            recurring: eventData.recurring || true,
            remindBefore: eventData.remindBefore || [0, 1, 2], // days
            emoji: eventData.emoji || '📅',
            note: eventData.note || '',
            birthYear: eventData.birthYear || null,
            createdAt: new Date().toISOString()
        };

        this.events.push(newEvent);
        Storage.saveEvents(this.events);
        return newEvent;
    },

    /**
     * Update an existing event
     * @param {string} id 
     * @param {Object} updatedData 
     */
    updateEvent(id, updatedData) {
        const index = this.events.findIndex(e => e.id === id);
        if (index !== -1) {
            this.events[index] = { ...this.events[index], ...updatedData };
            Storage.saveEvents(this.events);
            return true;
        }
        return false;
    },

    /**
     * Delete an event
     * @param {string} id 
     */
    deleteEvent(id) {
        this.events = this.events.filter(e => e.id !== id);
        Storage.saveEvents(this.events);
    },

    /**
     * Get event by ID
     * @param {string} id 
     */
    getEvent(id) {
        return this.events.find(e => e.id === id);
    },

    /**
     * Change app theme
     * @param {string} themeName 
     */
    applyTheme(themeName) {
        document.documentElement.setAttribute('data-theme', themeName);
        this.settings.theme = themeName;
        Storage.saveSettings(this.settings);
    },

    /**
     * Helper to calculate age if birthYear is provided
     * @param {Object} event 
     */
    calculateAge(event) {
        if (!event.birthYear) return null;
        const currentYear = new Date().getFullYear();
        return currentYear - parseInt(event.birthYear);
    },

    /**
     * Helper to get next occurrence of a recurring event
     * @param {string} dateStr YYYY-MM-DD
     */
    getNextOccurrence(dateStr) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const [year, month, day] = dateStr.split('-').map(Number);
        const occurrence = new Date(today.getFullYear(), month - 1, day);
        
        if (occurrence < today) {
            occurrence.setFullYear(today.getFullYear() + 1);
        }
        
        return occurrence;
    },

    /**
     * Calculate days until event
     * @param {string} dateStr 
     */
    getDaysUntil(dateStr) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const nextOccurrence = this.getNextOccurrence(dateStr);
        const diffTime = nextOccurrence - today;
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }
};

window.App = App;
