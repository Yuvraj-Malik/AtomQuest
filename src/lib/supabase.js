import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Fallback to placeholder strings to prevent build failures when env variables are not set
export const supabase = createClient(
  supabaseUrl || 'https://placeholder-to-prevent-build-crashes.supabase.co', 
  supabaseAnonKey || 'placeholder-key'
);
