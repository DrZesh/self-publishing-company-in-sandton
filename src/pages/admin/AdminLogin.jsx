import React, { useState, useEffect } from 'react';
import PageMeta from '../../components/shared/PageMeta';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, Loader2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function AdminLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [loginAttempts, setLoginAttempts] = useState(0);
  const [locked, setLocked] = useState(false);

  // Check if user is already authenticated as admin
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const isAuthenticated = await base44.auth.isAuthenticated();
        if (isAuthenticated) {
          const user = await base44.auth.me();
          if (user?.role === 'admin') {
            navigate('/admin/dashboard');
          } else {
            setError('You do not have admin access. Contact your administrator.');
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

    if (locked) {
      setError('Too many login attempts. Please try again in 15 minutes.');
      return;
    }

    if (!email || !password) {
      setError('Please enter both email and password.');
      return;
    }

    setLoading(true);

    try {
      // Use Base44's redirectToLogin for OAuth/SSO authentication
      // For now, we check if user exists and has admin role after they log in
      // Base44 handles the actual authentication
      
      // Redirect to Base44's login page
      // The user will be redirected back here after login via redirectToLogin callback
      await base44.auth.redirectToLogin('/admin/login');
      
      // After redirect back, check role
      const user = await base44.auth.me();
      
      if (user?.role === 'admin') {
        if (rememberMe) {
          localStorage.setItem('adminRememberMe', 'true');
          localStorage.setItem('adminEmail', user.email);
        }
        navigate('/admin/dashboard');
      } else {
        setLoginAttempts(prev => {
          const newAttempts = prev + 1;
          if (newAttempts >= 5) {
            setLocked(true);
            setTimeout(() => setLocked(false), 15 * 60 * 1000);
          }
          return newAttempts;
        });
        setError('You do not have admin access. Contact your administrator.');
      }
    } catch (err) {
      console.error('Login error:', err);
      setLoginAttempts(prev => {
        const newAttempts = prev + 1;
        if (newAttempts >= 5) {
          setLocked(true);
          setTimeout(() => setLocked(false), 15 * 60 * 1000);
        }
        return newAttempts;
      });
      setError('Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (checkingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#f8f9fc] to-[#eef1f7]">
        <div className="flex items-center gap-3">
          <Loader2 className="w-6 h-6 animate-spin text-[#B8955B]" />
          <span className="text-[#2B2B2B]">Checking authentication...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#f8f9fc] to-[#eef1f7] p-4">
      <PageMeta title="Admin Login" noindex={true} />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        {/* Logo */}
        <div className="text-center mb-12">
          <div className="inline-block w-12 h-12 rounded-lg bg-[#B8955B] mb-4" />
          <h1 className="text-2xl font-bold text-[#0B1220]">Creative Books SA</h1>
          <p className="text-sm text-[#2B2B2B]/60 mt-2">Admin Portal</p>
        </div>

        {/* Login Card */}
        <div
          className="rounded-2xl p-8 mb-6"
          style={{
            background: 'rgba(255,255,255,0.85)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255,255,255,0.9)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
          }}
        >
          <h2 className="text-xl font-bold text-[#0B1220] mb-6">Log in to your account</h2>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            {/* Email Field */}
            <div>
              <label className="block text-sm font-medium text-[#0B1220] mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 w-5 h-5 text-[#B8955B]" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-[#ddd] rounded-lg focus:outline-none focus:border-[#B8955B]"
                  placeholder="admin@example.com"
                  disabled={locked}
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-sm font-medium text-[#0B1220] mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 w-5 h-5 text-[#B8955B]" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-2.5 border border-[#ddd] rounded-lg focus:outline-none focus:border-[#B8955B]"
                  placeholder="••••••••"
                  disabled={locked}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-[#2B2B2B]/60"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Remember Me */}
            <div className="flex items-center">
              <input
                type="checkbox"
                id="rememberMe"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                disabled={locked}
                className="w-4 h-4 rounded border-[#ddd]"
              />
              <label htmlFor="rememberMe" className="ml-2 text-sm text-[#2B2B2B]/70">
                Remember me (30 days)
              </label>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={loading || locked}
              className="w-full py-2.5 bg-[#B8955B] text-white font-medium rounded-lg hover:bg-[#a07d4a] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {loading ? 'Logging in...' : 'Log In'}
            </button>
          </form>

          {/* Forgotten Password */}
          <div className="mt-4 text-center">
            <button className="text-sm text-[#B8955B] hover:text-[#a07d4a]">
              Forgotten password?
            </button>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-[#2B2B2B]/50 border-t border-[#ddd]/30 pt-6">
          Creative Books SA — Admin Portal
        </p>
      </motion.div>
    </div>
  );
}