import { createClient } from '@supabase/supabase-js';
const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY;
export const isSupabaseConfigured = Boolean(import.meta.env.VITE_COPY_CONNECT_LIVE === 'true' && url && key);
let instance;
export function getSupabase() {
  if (!isSupabaseConfigured) throw new Error('Preview copy: live database access is disabled.');
  return instance ||= createClient(url, key);
}
export const supabase = new Proxy({}, { get(_, key) { const value = getSupabase()[key]; return typeof value === 'function' ? value.bind(getSupabase()) : value; } });
