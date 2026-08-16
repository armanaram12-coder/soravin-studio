// Firebase Auth Helper Functions for Soravin Studio
// Load via ESM from CDN - no build system required

import { auth, db, signOut, onAuthStateChanged, doc, getDoc } from './firebase.js';

// Helper function to get current user data from Firestore
async function getUserData(uid) {
    try {
        const userDoc = await getDoc(doc(db, "users", uid));
        if (userDoc.exists()) {
            return userDoc.data();
        }
        return null;
    } catch (error) {
        console.error('خطا در خواندن اطلاعات کاربر:', error);
        return null;
    }
}

// Smart CTA button handler
export async function initSmartCTA() {
    return new Promise((resolve) => {
        onAuthStateChanged(auth, (user) => {
            const ctaBtn = document.getElementById('smart-cta-btn');
            if (!ctaBtn) {
                resolve();
                return;
            }
            
            if (user) {
                ctaBtn.href = 'dashboard.html';
            }
            resolve();
        });
    });
}

// Update header auth UI - show user greeting when logged in
export async function updateHeaderAuth() {
    return new Promise((resolve) => {
        onAuthStateChanged(auth, async (user) => {
            const authLink = document.getElementById('authLink');
            const mobileAuthLink = document.getElementById('mobileAuthLink');
            
            if (user) {
                // Get user data from Firestore
                const userData = await getUserData(user.uid);
                const fullName = userData?.fullName || user.email?.split('@')[0] || 'کاربر';
                const greeting = `سلام ${fullName}`;
                
                if (authLink) {
                    authLink.textContent = greeting;
                    authLink.href = 'dashboard.html';
                    authLink.classList.remove('btn-outline-small');
                    authLink.classList.add('auth-greeting');
                }
                
                if (mobileAuthLink) {
                    mobileAuthLink.textContent = greeting;
                    mobileAuthLink.href = 'dashboard.html';
                    mobileAuthLink.classList.add('auth-greeting');
                }
            } else {
                // User is logged out - reset to default
                if (authLink) {
                    authLink.textContent = 'ورود / ثبت‌نام';
                    authLink.href = 'login.html';
                    authLink.classList.add('btn-outline-small');
                    authLink.classList.remove('auth-greeting');
                }
                
                if (mobileAuthLink) {
                    mobileAuthLink.textContent = 'ورود / ثبت‌نام';
                    mobileAuthLink.href = 'login.html';
                    mobileAuthLink.classList.remove('auth-greeting');
                }
            }
            resolve();
        });
    });
}

// Check if user is logged in (for checkout)
export async function isLoggedIn() {
    return new Promise((resolve) => {
        onAuthStateChanged(auth, (user) => {
            resolve(!!user);
        });
    });
}

// Get current user info
export async function getUserInfo() {
    return new Promise((resolve) => {
        onAuthStateChanged(auth, async (user) => {
            if (user) {
                const userData = await getUserData(user.uid);
                resolve({
                    id: user.uid,
                    email: user.email,
                    fullName: userData?.fullName || user.email?.split('@')[0],
                    avatar: userData?.avatarUrl || null
                });
            } else {
                resolve(null);
            }
        });
    });
}

// Logout function
export async function logout() {
    try {
        localStorage.removeItem('currentUser');
        await signOut(auth);
        window.location.href = 'index.html';
    } catch (error) {
        console.error('خطا در خروج:', error);
        localStorage.removeItem('currentUser');
        window.location.href = 'index.html';
    }
}

// Check auth and redirect if not logged in (for protected pages)
export async function checkAuth() {
    return new Promise((resolve) => {
        onAuthStateChanged(auth, (user) => {
            if (!user) {
                window.location.href = 'login.html';
                resolve(null);
            } else {
                resolve(user);
            }
        });
    });
}
