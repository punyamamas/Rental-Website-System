import { createClient } from '@supabase/supabase-js';

// Robust Environment Variable Loader
// Supports: Vite (import.meta.env), Next.js (process.env.NEXT_PUBLIC_), CRA (process.env.REACT_APP_)

const getEnvVar = (key: string) => {
  // 1. Try Vite (Standard for this project structure)
  try {
    // @ts-ignore
    if (typeof import.meta !== 'undefined' && import.meta.env) {
      // @ts-ignore
      const viteVar = import.meta.env[`VITE_${key}`] || import.meta.env[key];
      if (viteVar) return viteVar;
    }
  } catch (e) {
    // Ignore error if import.meta is not available
  }

  // 2. Try Standard Process Env (Fallback for other build tools)
  if (typeof process !== 'undefined' && process.env) {
    // Check various prefixes commonly used by build tools
    return process.env[`VITE_${key}`] ||
           process.env[`NEXT_PUBLIC_${key}`] ||
           process.env[`REACT_APP_${key}`] ||
           process.env[key];
  }

  return '';
};

const supabaseUrl = getEnvVar('SUPABASE_URL');
const supabaseKey = getEnvVar('SUPABASE_ANON_KEY');

// Debug log to help troubleshooting (visible in browser console)
console.log('Supabase Connection Status:', {
  urlConfigured: !!supabaseUrl,
  keyConfigured: !!supabaseKey,
  mode: supabaseUrl && supabaseKey ? 'Online (Cloud DB)' : 'Offline (Local Mock Data)'
});

export const supabase = supabaseUrl && supabaseKey 
  ? createClient(supabaseUrl, supabaseKey) 
  : null;