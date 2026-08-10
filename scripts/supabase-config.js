// Supabase Configuration
// This file initializes the Supabase client for the project

const SUPABASE_URL = 'https://foukuigwrnezzcygtwcu.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_jCYsfZd2kNfEBJcsMOTjuA_sgMcXwEr';

// Initialize Supabase client (make sure to include the Supabase JS library in your HTML)
// <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>

let supabase;

if (typeof window !== 'undefined' && window.supabase) {
    supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    console.log('✅ Supabase connected successfully');
} else {
    console.warn('⚠️ Supabase library not loaded. Please include the script tag in your HTML.');
}

// Export for use in other modules (if using ES6 modules)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { supabase, SUPABASE_URL, SUPABASE_ANON_KEY };
}
