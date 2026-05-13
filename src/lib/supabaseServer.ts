import { createClient } from '@supabase/supabase-js';

// Server-side Supabase client (using Service Role Key for elevated privileges if necessary, 
// but sticking to Anon Key for basic usage unless specifically configured).
const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || ''; // Ideally Service Role Key for backend admin ops

export const supabaseServer = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: false,
  }
});
