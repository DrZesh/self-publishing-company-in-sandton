export function toAppUser(user) {
  if (!user) return null;
  return { ...user, full_name: user.user_metadata?.full_name || user.email || '', role: user.app_metadata?.role === 'admin' ? 'admin' : 'user' };
}

export function safeReturnTo(value, fallback = '/admin/dashboard') {
  if (typeof value !== 'string' || !value.startsWith('/') || value.startsWith('//') || /[\\\s]/.test(value)) return fallback;
  if (value.split(/[?#]/)[0] === '/admin/login') return fallback;
  return value;
}
