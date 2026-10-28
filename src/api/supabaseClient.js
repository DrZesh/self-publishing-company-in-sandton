import { createClient } from '@supabase/supabase-js';
const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY;
export const isSupabaseConfigured = Boolean(url && key);
let instance;
export function getSupabase() {
  if (!isSupabaseConfigured) throw new Error('Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY.');
  return instance ||= createClient(url, key);
}
export const supabase = new Proxy({}, { get(_, key) { const value = getSupabase()[key]; return typeof value === 'function' ? value.bind(getSupabase()) : value; } });
