/**
 * 🌸 AUTH MODULE
 * Handles Firebase Authentication
 */

const Auth = {
    user: null,

    /**
     * Initialize Auth listener
     */
    init() {
        firebase.auth().onAuthStateChanged((user) => {
            if (user) {
                // User is signed in
                this.user = user;
                console.log('User logged in:', user.displayName);
                
                // Hide login overlay
                document.getElementById('loginOverlay').classList.remove('active');
                
                // Switch storage to user's UID and reload
                App.init(); 
                
                // Update UI Profile
                if (window.UI) UI.updateUserProfile(user);
            } else {
                // User is signed out
                this.user = null;
                console.log('User logged out');
                
                // Show login overlay
                document.getElementById('loginOverlay').classList.add('active');
            }
        });

        // Login button listener
        document.getElementById('loginBtn').addEventListener('click', () => {
            this.loginWithGoogle();
        });
    },

    /**
     * Sign in with Google
     */
    loginWithGoogle() {
        const provider = new firebase.auth.GoogleAuthProvider();
        firebase.auth().signInWithPopup(provider)
            .then((result) => {
                UI.showToast(`Chào mừng ${result.user.displayName}! ✨`);
            })
            .catch((error) => {
                console.error('Login Error:', error);
                UI.showToast('Lỗi đăng nhập, vui lòng thử lại 🥺', 'error');
            });
    },

    /**
     * Sign out
     */
    logout() {
        firebase.auth().signOut().then(() => {
            UI.showToast('Đã đăng xuất 👋');
            // Force reload to clear state
            window.location.reload();
        });
    }
};

window.Auth = Auth;
