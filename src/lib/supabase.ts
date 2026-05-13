import { createClient } from '@supabase/supabase-js';

// Supabase URL va Key qadriyatlarini yuklab olamiz.
// .env yoki .env.local faylida belgilash kerak:
// VITE_SUPABASE_URL=your-supabase-url
// VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || process.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase URL or Anon Key is missing. Ensure they are set in your environment variables.');
}

/**
 * Universal Supabase Client
 * 
 * Barcha so'rovlar Row-Level Security (RLS) qoidalaridan o'tadi va bitta
 * mijoz barcha ma'lumotlarni ishonchli yuklab oladi.
 */
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
});
