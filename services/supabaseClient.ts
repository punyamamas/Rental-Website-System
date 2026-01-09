import { createClient } from '@supabase/supabase-js';

// NOTE: In a real production app, these should be in a .env file.
// For this demo, we check if they exist in the process.env provided by the environment
// or fall back to empty strings which will trigger "Offline/Mock Mode" in the dataService.

const supabaseUrl = (typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_SUPABASE_URL) || process.env?.SUPABASE_URL || '';
const supabaseKey = (typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_SUPABASE_ANON_KEY) || process.env?.SUPABASE_ANON_KEY || '';

export const supabase = supabaseUrl && supabaseKey 
  ? createClient(supabaseUrl, supabaseKey) 
  : null;
