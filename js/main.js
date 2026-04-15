/**
 * 🌸 MAIN MODULE
 * Initialization and event listeners
 */

document.addEventListener('DOMContentLoaded', () => {
    // 1. Initialize Auth first
    Auth.init();

    // 2. Initial Render (Dashboard tab will be shown after login)
    UI.showTab('dashboard');

    // 3. Check Daily Notifications
    Reminders.processDailyNotifications();

    // ==========================================
    // NAVIGATION LISTENERS
    // ==========================================
    document.querySelectorAll('.nav-tab').forEach(tab => {
        tab.addEventListener('click', (e) => {
            UI.showTab(e.currentTarget.dataset.tab);
        });
    });

    // ==========================================
    // FORM LISTENERS (ADD EVENT)
    // ==========================================
    const eventForm = document.getElementById('eventForm');
    
    // Handle Event Type Change (Dynamic Fields)
    document.querySelectorAll('input[name="eventType"]').forEach(radio => {
        radio.addEventListener('change', (e) => {
            const type = e.target.value;
            const categoryGroup = document.getElementById('categoryGroup');
            const birthYearGroup = document.getElementById('birthYearGroup');
            
            if (type === 'birthday') {
                birthYearGroup.style.display = 'block';
                categoryGroup.style.display = 'block';
            } else if (type === 'holiday') {
                birthYearGroup.style.display = 'none';
                categoryGroup.style.display = 'none';
            } else {
                birthYearGroup.style.display = 'none';
                categoryGroup.style.display = 'block';
            }
        });
    });

    // Handle Emoji Selection
    document.querySelectorAll('#emojiPicker .emoji-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('#emojiPicker .emoji-btn').forEach(b => b.classList.remove('selected'));
            e.currentTarget.classList.add('selected');
        });
    });

    // Submit Add Form
    eventForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const type = document.querySelector('input[name="eventType"]:checked').value;
        const name = document.getElementById('eventName').value;
        const date = document.getElementById('eventDate').value;
        const category = document.getElementById('eventCategory').value;
        const birthYear = document.getElementById('birthYear').value;
        const recurring = document.getElementById('eventRecurring').checked;
        const emoji = document.querySelector('#emojiPicker .emoji-btn.selected').dataset.emoji;
        const note = document.getElementById('eventNote').value;
        
        const remindBefore = Array.from(document.querySelectorAll('input[name="reminder"]:checked'))
                                 .map(cb => parseInt(cb.value));

        App.addEvent({
            type, name, date, category, birthYear, recurring, emoji, note, remindBefore
        });

        UI.showToast('✨ Đã thêm sự kiện thành công!');
        eventForm.reset();
        
        // Reset dynamic fields
        document.getElementById('birthYearGroup').style.display = 'block';
        document.getElementById('categoryGroup').style.display = 'block';
        
        // Return to dashboard
        setTimeout(() => {
            UI.showTab('dashboard');
        }, 1000);
    });

    // ==========================================
    // FILTER & SORT LISTENERS
    // ==========================================
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            e.currentTarget.classList.add('active');
            UI.renderEventsList();
        });
    });

    document.getElementById('sortSelect').addEventListener('change', () => UI.renderEventsList());
    
    const searchInput = document.getElementById('searchInput');
    let searchTimeout;
    searchInput.addEventListener('input', () => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => UI.renderEventsList(), 300);
    });

    // ==========================================
    // SETTINGS LISTENERS
    // ==========================================
    // Theme Switch
    document.querySelectorAll('.theme-btn').forEach(btn => {
        if (btn.dataset.theme === App.settings.theme) {
            btn.classList.add('active');
        }
        
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('.theme-btn').forEach(b => b.classList.remove('active'));
            const target = e.currentTarget;
            target.classList.add('active');
            App.applyTheme(target.dataset.theme);
        });
    });

    // Default Reminder
    const defaultReminderSelect = document.getElementById('defaultReminder');
    if (App.settings.defaultReminder) {
        defaultReminderSelect.value = App.settings.defaultReminder;
    }
    defaultReminderSelect.addEventListener('change', (e) => {
        App.settings.defaultReminder = parseInt(e.target.value);
        Storage.saveSettings(App.settings);
    });

    // Notifications
    document.getElementById('enableNotificationBtn')?.addEventListener('click', async () => {
        const granted = await Reminders.requestPermission();
        if (granted) {
            UI.showToast('Đã bật thông báo thành công! 🔔');
            UI.renderReminders();
        } else {
            UI.showToast('Vui lòng cấp quyền thông báo trong trình duyệt.', 'error');
        }
    });

    // Export/Import
    document.getElementById('exportBtn').addEventListener('click', () => {
        Storage.exportData();
        UI.showToast('Đã xuất dữ liệu! 📤');
    });

    document.getElementById('importBtn').addEventListener('click', () => {
        document.getElementById('importFile').click();
    });

    document.getElementById('importFile').addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const data = JSON.parse(event.target.result);
                if (data.events && data.settings) {
                    Storage.saveEvents(data.events);
                    Storage.saveSettings(data.settings);
                    App.init(); // Reload
                    UI.showToast('Đã khôi phục dữ liệu! 📥');
                    UI.showTab('dashboard');
                } else {
                    throw new Error('Invalid format');
                }
            } catch (err) {
                UI.showToast('File dữ liệu không hợp lệ!', 'error');
            }
        };
        reader.readAsText(file);
    });

    // Sample Data
    document.getElementById('sampleDataBtn').addEventListener('click', () => {
        if (confirm('Thêm dữ liệu mẫu sẽ giữ nguyên dữ liệu hiện tại của bạn. Tiếp tục? 🌸')) {
            const currentYear = new Date().getFullYear();
            const currentMonth = String(new Date().getMonth() + 1).padStart(2, '0');
            const currentDay = String(Math.min(new Date().getDate() + 2, 28)).padStart(2, '0');
            
            const samples = [
                {
                    id: 'sample1', name: 'Sinh nhật Mẹ', date: '1970-10-20', type: 'birthday', 
                    category: 'family', recurring: true, emoji: '👩', birthYear: 1970
                },
                {
                    id: 'sample2', name: 'Tết Nguyên Đán', date: `${currentYear}-01-29`, type: 'holiday', 
                    category: 'other', recurring: true, emoji: '🎌'
                },
                {
                    id: 'sample3', name: 'Đám cưới bạn thân', date: `${currentYear}-${currentMonth}-${currentDay}`, type: 'other', 
                    category: 'friend', recurring: false, emoji: '💍'
                }
            ];
            
            samples.forEach(s => App.addEvent(s));
            UI.showToast('Đã thêm dữ liệu mẫu! ✨');
            UI.showTab('dashboard');
        }
    });

    // Clear All
    document.getElementById('clearAllBtn').addEventListener('click', () => {
        if (confirm('⚠️ Nguy hiểm: Bạn có chắc chắn muốn XÓA TOÀN BỘ dữ liệu không?')) {
            if (confirm('Hành động này không thể hoàn tác. Bạn chắc chứ? 🥺')) {
                Storage.clearAll();
                App.events = [];
                UI.showToast('Đã xóa toàn bộ dữ liệu 🗑️', 'info');
                UI.showTab('dashboard');
            }
        }
    });

    // ==========================================
    // MODAL LISTENERS (EDIT)
    // ==========================================
    const modalClose = document.getElementById('modalClose');
    const modalCancel = document.getElementById('modalCancel');
    const editForm = document.getElementById('editForm');

    modalClose.addEventListener('click', UI.closeModal);
    modalCancel.addEventListener('click', UI.closeModal);

    editForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const id = document.getElementById('editEventId').value;
        const name = document.getElementById('editName').value;
        const date = document.getElementById('editDate').value;
        const category = document.getElementById('editCategory').value;
        const note = document.getElementById('editNote').value;

        App.updateEvent(id, { name, date, category, note });
        
        UI.closeModal();
        UI.showToast('Đã cập nhật sự kiện! 💾');
        
        // Re-render current view
        const activeTab = document.querySelector('.nav-tab.active').dataset.tab;
        if (activeTab === 'dashboard') UI.renderDashboard();
        else if (activeTab === 'events') UI.renderEventsList();
    });

    // Logout
    document.getElementById('logoutBtn')?.addEventListener('click', () => {
        if (confirm('Bạn có muốn đăng xuất không? 👋')) {
            Auth.logout();
        }
    });

    // Close modal when clicking outside
    document.getElementById('editModal').addEventListener('click', (e) => {
        if (e.target.id === 'editModal') UI.closeModal();
    });
});
