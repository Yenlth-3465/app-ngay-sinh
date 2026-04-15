/**
 * 🌸 STORAGE MODULE
 * Handles saving and loading data from Firebase Realtime Database
 */

// Firebase Configuration (Captured from user screenshot)
const firebaseConfig = {
  apiKey: "AIzaSyCGLydDw0MBMnYTi8FFEiazP3CK-yJ29N4",
  authDomain: "app-ngay-sinh.firebaseapp.com",
  projectId: "app-ngay-sinh",
  storageBucket: "app-ngay-sinh.firebasestorage.app",
  messagingSenderId: "147783515486",
  appId: "1:147783515486:web:6ee8a191d8cf7f0177e3cf",
  measurementId: "G-YWRPS6FZ6V",
  databaseURL: "https://app-ngay-sinh-default-rtdb.asia-southeast1.firebasedatabase.app" // Giả định server Singapore
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const database = firebase.database();

const STORAGE_KEYS = {
    EVENTS: 'events',
    SETTINGS: 'settings'
};

const Storage = {
    /**
     * Save events to Firebase
     * @param {Array} events 
     */
    saveEvents(events) {
        try {
            database.ref(STORAGE_KEYS.EVENTS).set(events);
            // Vẫn lưu backup ở LocalStorage cho chắc chắn
            localStorage.setItem('kawaii_diary_events', JSON.stringify(events));
            return true;
        } catch (e) {
            console.error('Error saving events to Firebase:', e);
            return false;
        }
    },

    /**
     * Load events from Firebase
     * @param {Function} callback - Hàm xử lý khi có dữ liệu trả về
     */
    loadEvents(callback) {
        // Lắng nghe thay đổi realtime
        database.ref(STORAGE_KEYS.EVENTS).on('value', (snapshot) => {
            const data = snapshot.val();
            const events = data || [];
            if (callback) callback(events);
        });
        
        // Trả về dữ liệu từ local storage ngay lập tức để app ko bị trống trong lúc chờ network
        const localEvents = localStorage.getItem('kawaii_diary_events');
        return localEvents ? JSON.parse(localEvents) : [];
    },

    /**
     * Save app settings to Firebase
     * @param {Object} settings 
     */
    saveSettings(settings) {
        database.ref(STORAGE_KEYS.SETTINGS).set(settings);
    },

    /**
     * Load app settings from Firebase
     * @param {Function} callback 
     */
    loadSettings(callback) {
        database.ref(STORAGE_KEYS.SETTINGS).on('value', (snapshot) => {
            const data = snapshot.val();
            const defaultSettings = {
                theme: 'sakura',
                defaultReminder: 2,
                notificationsEnabled: false
            };
            const settings = data ? { ...defaultSettings, ...data } : defaultSettings;
            if (callback) callback(settings);
        });
        
        const settings = localStorage.getItem('kawaii_diary_settings');
        return settings ? JSON.parse(settings) : { theme: 'sakura', defaultReminder: 2 };
    },

    /**
     * Export data (Giữ nguyên tính năng cũ)
     */
    exportData() {
        const localEvents = localStorage.getItem('kawaii_diary_events');
        const data = {
            events: localEvents ? JSON.parse(localEvents) : [],
            settings: { theme: 'sakura' }, // placeholder
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
        database.ref('/').remove();
        localStorage.clear();
    }
};

window.Storage = Storage;
