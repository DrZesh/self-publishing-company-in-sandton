import React, { useState, useEffect } from 'react';
import PageMeta from '../../components/shared/PageMeta';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { platform } from '@/api/platformClient';
import { supabase } from '@/api/supabaseClient';
import { safeRedirect } from '../../../supabase/functions/_shared/policy.js';

const GoogleIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 48 48">
    <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"/>
    <path fill="#FF3D00" d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z"/>
    <path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238C29.211 35.091 26.715 36 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z"/>
    <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303c-.792 2.237-2.231 4.166-4.087 5.571l6.19 5.238C42.022 35.026 44 30.038 44 24c0-1.341-.138-2.65-.389-3.917z"/>
  </svg>
);

const testimonials = [
  {
    avatarSrc: "https://randomuser.me/api/portraits/women/57.jpg",
    name: "Sarah Chen",
    handle: "@sarahdigital",
    text: "Amazing platform! The user experience is seamless and the features are exactly what I needed."
  },
  {
    avatarSrc: "https://randomuser.me/api/portraits/men/64.jpg",
    name: "Marcus Johnson",
    handle: "@marcustech",
    text: "This service has transformed how I work. Clean design, powerful features, and excellent support."
  },
];

export default function AdminLogin() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const isAuthenticated = await platform.auth.isAuthenticated();
        if (isAuthenticated) {
          const user = await platform.auth.me();
          if (['admin', 'super_user', 'standard_user'].includes(user?.role)) {
            navigate(safeRedirect(new URLSearchParams(location.search).get('next') || '/admin/dashboard', location.origin));
          } else {
            navigate('/my-portal');
          }
        }
      } catch (err) {
        console.error('Auth check failed:', err);
      } finally {
        setCheckingAuth(false);
      }
    };
    checkAuth();
  }, [navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const form = new FormData(e.currentTarget);
      const { error: signInError } = await supabase.auth.signInWithPassword({ email: String(form.get('email')), password: String(form.get('password')) });
      if (signInError) throw signInError;
      const user = await platform.auth.me();
      if (['admin', 'super_user', 'standard_user'].includes(user?.role)) {
        if (rememberMe) {
          localStorage.setItem('adminRememberMe', 'true');
          localStorage.setItem('adminEmail', user.email);
        }
        navigate(safeRedirect(new URLSearchParams(location.search).get('next') || '/admin/dashboard', location.origin));
      } else {
        navigate('/my-portal');
      }
    } catch (err) {
      setError(err.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (checkingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col md:flex-row overflow-hidden bg-white">
      <PageMeta title="Admin Login" noindex={true} />

      {/* ── LEFT: Sign-in form ── */}
      <section className="flex-1 flex items-center justify-center p-10 bg-white">
        <div className="w-full max-w-sm space-y-6">

          <div className="space-y-2">
            <h1 className="text-5xl font-semibold text-gray-900 tracking-tight">Welcome</h1>
            <p className="text-gray-500 text-sm">Access your account and continue your journey with us</p>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            {/* Email */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700">Email Address</label>
              <div className="rounded-xl border border-gray-200 bg-gray-50/50 focus-within:border-gray-400 focus-within:bg-white transition-colors">
                <input
                  name="email" required autoComplete="username"
                  type="email"
                  placeholder="Enter your email address"
                  className="w-full bg-transparent text-sm px-4 py-3 rounded-xl focus:outline-none text-gray-900 placeholder:text-gray-400"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700">Password</label>
              <div className="rounded-xl border border-gray-200 bg-gray-50/50 focus-within:border-gray-400 focus-within:bg-white transition-colors">
                <div className="relative">
                  <input
                    name="password" required autoComplete="current-password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    className="w-full bg-transparent text-sm px-4 py-3 pr-12 rounded-xl focus:outline-none text-gray-900 placeholder:text-gray-400"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-3 flex items-center"
                  >
                    {showPassword
                      ? <EyeOff className="w-4 h-4 text-gray-400 hover:text-gray-600 transition-colors" />
                      : <Eye className="w-4 h-4 text-gray-400 hover:text-gray-600 transition-colors" />
                    }
                  </button>
                </div>
              </div>
            </div>

            {/* Remember me + Reset */}
            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-gray-300 accent-gray-900"
                />
                <span className="text-gray-700">Keep me signed in</span>
              </label>
              <button
                type="button"
                onClick={async () => { const email = document.querySelector('input[name=email]').value; if (!email) { setError('Enter your email address first.'); return; } const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: location.origin + '/admin/reset-password' }); setError(error ? error.message : 'Check your email for a password reset link.'); }}
                className="text-violet-500 hover:text-violet-600 transition-colors text-sm"
              >
                Reset password
              </button>
            </div>

            {/* Sign In Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-2xl bg-gray-900 py-3.5 font-medium text-white hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2 text-sm"
            >
              {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Signing in...</> : 'Sign In'}
            </button>
          </form>

          {/* Divider */}
          <div className="relative flex items-center justify-center">
            <span className="w-full border-t border-gray-200"></span>
            <span className="px-4 text-xs text-gray-400 bg-white absolute whitespace-nowrap">Or continue with</span>
          </div>

          {/* Google Button */}
          <button
            onClick={async () => { const { error } = await supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: location.origin + '/admin/login' } }); if (error) setError(error.message); }}
            className="w-full flex items-center justify-center gap-3 border border-gray-200 rounded-2xl py-3.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <GoogleIcon />
            Continue with Google
          </button>

          {/* Create account */}
          <p className="text-center text-sm text-gray-500">
            New to our platform?{' '}
            <a href="mailto:info@creativebooks.co.za" className="text-violet-500 hover:text-violet-600 transition-colors">
              Create Account
            </a>
          </p>
        </div>
      </section>

      {/* ── RIGHT: Hero image + testimonial ── */}
      <section className="hidden md:block flex-1 relative p-4">
        <div
          className="absolute inset-4 rounded-3xl bg-cover bg-center"
          style={{
            backgroundImage: `url(https://images.unsplash.com/photo-1642615835477-d303d7dc9ee9?w=1400&q=80)`,
          }}
        />

        {/* Testimonial card */}
        <div className="absolute bottom-10 left-8">
          <div className="flex items-start gap-3 rounded-2xl bg-white/85 backdrop-blur-xl border border-white/60 p-4 w-64 shadow-lg">
            <img src={testimonials[0].avatarSrc} className="h-10 w-10 object-cover rounded-xl flex-shrink-0" alt={testimonials[0].name} />
            <div className="text-sm leading-snug">
              <p className="font-semibold text-gray-900">{testimonials[0].name}</p>
              <p className="text-gray-400 text-xs">{testimonials[0].handle}</p>
              <p className="mt-1.5 text-gray-700 text-xs">{testimonials[0].text}</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}