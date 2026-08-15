// Supabase Configuration for Soravin Studio
// Load via ESM from CDN - no build system required

import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

const SUPABASE_URL = 'https://foukuigwrnezzcygtwcu.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_jCYsfZd2kNfEBJcsMOTjuA_sgMcXwEr';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Helper functions for auth
export async function getCurrentUser() {
    try {
        const { data: { session } } = await supabase.auth.getSession();
        return session?.user || null;
    } catch (error) {
        console.error('Error getting current user:', error);
        return null;
    }
}

export async function checkAuth() {
    try {
        const user = await getCurrentUser();
        if (!user) {
            window.location.href = 'login.html';
            return null;
        }
        return user;
    } catch (error) {
        console.error('Auth check error:', error);
        window.location.href = 'login.html';
        return null;
    }
}

export async function logout() {
    try {
        // فقط کلید نشست فعلی را حذف کن - بقیه داده‌ها باقی می‌مانند
        localStorage.removeItem('currentUser');
        await supabase.auth.signOut();
        window.location.href = 'index.html';
    } catch (error) {
        console.error('Logout error:', error);
        // در صورت خطا هم فقط currentUser پاک شود
        localStorage.removeItem('currentUser');
        window.location.href = 'index.html';
    }
}

// Smart CTA button handler
export async function initSmartCTA() {
    try {
        const ctaBtn = document.getElementById('smart-cta-btn');
        if (!ctaBtn) return;
        
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
            ctaBtn.href = 'dashboard.html';
        }
    } catch (error) {
        console.error('Smart CTA error:', error);
        // Keep default href (register.html) on error
    }
}

// Update header auth UI - show user greeting when logged in
export async function updateHeaderAuth() {
    try {
        const { data: { session } } = await supabase.auth.getSession();
        const authLink = document.getElementById('authLink');
        const mobileAuthLink = document.getElementById('mobileAuthLink');
        
        if (session) {
            const fullName = session.user.user_metadata?.full_name || session.user.email.split('@')[0];
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
        }
    } catch (error) {
        console.error('Header auth update error:', error);
    }
}

// Check if user is logged in (for checkout)
export async function isLoggedIn() {
    try {
        const { data: { session } } = await supabase.auth.getSession();
        return !!session;
    } catch (error) {
        console.error('Login check error:', error);
        return false;
    }
}

// Get current user info
export async function getUserInfo() {
    try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
            return {
                id: session.user.id,
                email: session.user.email,
                fullName: session.user.user_metadata?.full_name || session.user.email.split('@')[0],
                avatar: session.user.user_metadata?.avatar_url || null
            };
        }
        return null;
    } catch (error) {
        console.error('Get user info error:', error);
        return null;
    }
}
