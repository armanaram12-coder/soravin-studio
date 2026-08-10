// Supabase Configuration for Soravin Studio
// Load via ESM from CDN - no build system required

import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

const SUPABASE_URL = 'https://foukuigwrnezzcygtwcu.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_jCYsfZd2kNfEBJcsMOTjuA_sgMcXwEr';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Helper functions for auth
export async function getCurrentUser() {
    const { data: { session } } = await supabase.auth.getSession();
    return session?.user || null;
}

export async function checkAuth() {
    const user = await getCurrentUser();
    if (!user) {
        window.location.href = 'login.html';
        return null;
    }
    return user;
}

export async function logout() {
    await supabase.auth.signOut();
    window.location.href = 'index.html';
}
