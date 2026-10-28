import { createClient } from '@supabase/supabase-js';
const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
export const authConfigurationError = !url || !key ? 'Sign-in is not configured. Please contact Creative Books SA.' : null;
// Missing auth configuration must not break the public website.
export const supabase = authConfigurationError ? null : createClient(url, key, {
  auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true, flowType: 'pkce' },
});
export function requireSupabase() {
  if (!supabase) throw new Error(authConfigurationError);
  return supabase;
}
