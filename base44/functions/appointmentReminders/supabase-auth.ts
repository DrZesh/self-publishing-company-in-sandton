// Generated into each function bundle by scripts/sync-auth-helpers.mjs.
// Keep this file free of Base44 auth and browser-supplied role decisions.
export class AuthError extends Error {
  constructor(message: string, public status: number) { super(message); }
}
export type AppUser = { id: string; email?: string; full_name: string; role: 'admin' };
type Environment = { get(name: string): string | undefined };
export async function requireAdmin(req: Request, options: { allowScheduled?: boolean } = {}, env: Environment = Deno.env, fetcher: typeof fetch = fetch): Promise<AppUser> {
  const token = req.headers.get('x-supabase-access-token');
  if (!token && options.allowScheduled) {
    const secret = env.get('AUTH_JOB_SECRET');
    const candidate = req.headers.get('x-auth-job-secret');
    if (secret && candidate && secret.length >= 32 && candidate === secret) return { id: 'scheduled-job', role: 'admin', full_name: 'Scheduled job' };
  }
  if (!token) throw new AuthError('Sign-in required', 401);
  const url = env.get('SUPABASE_URL');
  const key = env.get('SUPABASE_PUBLISHABLE_KEY');
  if (!url || !key) throw new AuthError('Authentication is not configured', 503);
  let response: Response;
  try {
    response = await fetcher(`${url.replace(/\/$/, '')}/auth/v1/user`, {
      headers: { apikey: key, Authorization: `Bearer ${token}` }, signal: AbortSignal.timeout(10000),
    });
  } catch { throw new AuthError('Authentication is temporarily unavailable', 503); }
  if (!response.ok) throw new AuthError('Session is invalid or expired', response.status >= 500 ? 503 : 401);
  const user = await response.json();
  if (!user.id || user.is_anonymous || user.app_metadata?.role !== 'admin') throw new AuthError('Admin access required', 403);
  return { id: user.id, email: user.email, full_name: user.user_metadata?.full_name || user.email || '', role: 'admin' };
}
