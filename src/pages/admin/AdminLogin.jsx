import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import PageMeta from '../../components/shared/PageMeta';
import { requireSupabase } from '@/api/supabaseClient';
import { useAuth } from '@/lib/AuthContext';
import { safeReturnTo } from '@/lib/auth-policy';

export default function AdminLogin() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { user, isLoadingAuth, authConfigurationError, isPasswordRecovery, setIsPasswordRecovery, checkUserAuth, logout } = useAuth();
  const [mode, setMode] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const recovering = isPasswordRecovery || params.get('recovery') === '1';
  const returnTo = safeReturnTo(params.get('next'));

  useEffect(() => {
    if (!isLoadingAuth && user?.role === 'admin' && !recovering) navigate(returnTo, { replace: true });
  }, [user, isLoadingAuth, recovering, returnTo, navigate]);

  async function submit(event) {
    event.preventDefault();
    setError(''); setMessage(''); setBusy(true);
    try {
      const client = requireSupabase();
      if (recovering && user) {
        if (password !== confirmation) throw new Error('The passwords do not match.');
        const { error } = await client.auth.updateUser({ password });
        if (error) throw error;
        setPassword(''); setConfirmation(''); setIsPasswordRecovery(false);
        await logout(false);
        navigate('/admin/login', { replace: true });
        setMessage('Password updated. Sign in with your new password.');
      } else if (mode === 'reset' || recovering) {
        const { error } = await client.auth.resetPasswordForEmail(email.trim(), { redirectTo: window.location.origin + '/admin/login?recovery=1' });
        if (error) throw error;
        setMessage('If an account exists for this email, a password reset link will arrive shortly.');
      } else if (mode === 'signup') {
        const { error } = await client.auth.signUp({ email: email.trim(), password, options: { emailRedirectTo: window.location.origin + '/admin/login' } });
        if (error) throw error;
        setMessage('Check your email to confirm your account. An administrator must grant access before you can use the admin portal.');
        setPassword('');
      } else {
        const { error } = await client.auth.signInWithPassword({ email: email.trim(), password });
        if (error) throw error;
        setPassword('');
        const current = await checkUserAuth();
        if (!current) throw new Error('Could not verify your session. Please try again.');
        if (current.role !== 'admin') setError('Your account does not have admin access. Contact Creative Books SA.');
      }
    } catch (err) { setError(err.message || 'Sign-in failed. Please try again.'); }
    finally { setBusy(false); }
  }
  const updatePassword = recovering && user;
  const needsPassword = updatePassword || (!recovering && mode !== 'reset');
  const title = updatePassword ? 'Choose a new password' : recovering || mode === 'reset' ? 'Reset your password' : mode === 'signup' ? 'Create your account' : 'Sign in to your account';
  return <div className="min-h-screen flex items-center justify-center bg-[#f8f9fc] p-4">
    <PageMeta title="Admin Login" noindex={true} />
    <div className="w-full max-w-md">
      <div className="text-center mb-8"><h1 className="text-2xl font-bold text-[#0B1220]">Creative Books SA</h1><p className="text-sm text-slate-500 mt-2">Admin Portal</p></div>
      <div className="rounded-2xl p-8 bg-white border shadow-sm">
        <h2 className="text-xl font-bold mb-6">{title}</h2>
        {authConfigurationError && <p role="alert" className="mb-4 text-red-700">{authConfigurationError}</p>}
        {error && <p role="alert" className="mb-4 p-3 bg-red-50 text-red-700 rounded">{error}</p>}
        {message && <p role="status" className="mb-4 p-3 bg-green-50 text-green-800 rounded">{message}</p>}
        {isLoadingAuth ? <p role="status">Checking your session...</p> : <>
          {user && !recovering ? <div className="space-y-4"><p>Signed in as {user.email}. {user.role !== 'admin' && 'This account does not have admin access.'}</p><button onClick={() => logout().catch(err => setError(err.message))} className="text-[#876833] underline">Sign out</button></div> :
          <form onSubmit={submit} className="space-y-4">
            {!updatePassword && <div><label htmlFor="auth-email" className="block text-sm font-medium mb-2">Email address</label><input id="auth-email" type="email" autoComplete="email" required value={email} onChange={e => setEmail(e.target.value)} disabled={busy} className="w-full border rounded-lg p-3" /></div>}
            {needsPassword && <div><label htmlFor="auth-password" className="block text-sm font-medium mb-2">{updatePassword ? 'New password' : 'Password'}</label><input id="auth-password" type="password" autoComplete={updatePassword || mode === 'signup' ? 'new-password' : 'current-password'} minLength={updatePassword || mode === 'signup' ? 12 : undefined} required value={password} onChange={e => setPassword(e.target.value)} disabled={busy} className="w-full border rounded-lg p-3" /></div>}
            {updatePassword && <div><label htmlFor="auth-confirmation" className="block text-sm font-medium mb-2">Confirm password</label><input id="auth-confirmation" type="password" autoComplete="new-password" minLength={12} required value={confirmation} onChange={e => setConfirmation(e.target.value)} disabled={busy} className="w-full border rounded-lg p-3" /></div>}
            <button disabled={busy || Boolean(authConfigurationError)} className="w-full py-3 bg-[#B8955B] text-white rounded-lg disabled:opacity-50">{busy ? 'Please wait...' : updatePassword ? 'Update password' : recovering || mode === 'reset' ? 'Send reset link' : mode === 'signup' ? 'Create account' : 'Sign in'}</button>
          </form>}
          {!recovering && !user && <div className="mt-5 flex flex-wrap gap-4 text-sm"><button disabled={busy} onClick={() => { setMode(mode === 'reset' ? 'login' : 'reset'); setError(''); setMessage(''); }} className="text-[#876833] underline">{mode === 'reset' ? 'Back to sign-in' : 'Forgot password?'}</button><button disabled={busy} onClick={() => { setMode(mode === 'signup' ? 'login' : 'signup'); setError(''); setMessage(''); }} className="text-[#876833] underline">{mode === 'signup' ? 'Already have an account?' : 'Create account'}</button></div>}
        </>}
      </div>
      <p className="text-center mt-6 text-xs text-slate-500"><a href="/">Return to the website</a></p>
    </div>
  </div>;
}
