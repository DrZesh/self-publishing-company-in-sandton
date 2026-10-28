import { requireSupabase } from '@/api/supabaseClient';
import { toAppUser, safeReturnTo } from './auth-policy';
export async function getCurrentUser() {
  const { data, error } = await requireSupabase().auth.getUser();
  if (error) throw error;
  if (!data.user) throw new Error('Please sign in.');
  return toAppUser(data.user);
}
export async function signOut() {
  const { error } = await requireSupabase().auth.signOut();
  if (error) throw error;
}
export function navigateToLogin(returnTo = window.location.pathname + window.location.search) {
  window.location.assign('/admin/login?next=' + encodeURIComponent(safeReturnTo(returnTo)));
}
