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
        await supabase.auth.signOut();
        window.location.href = 'index.html';
    } catch (error) {
        console.error('Logout error:', error);
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
