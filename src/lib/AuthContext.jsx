import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { supabase, authConfigurationError } from '@/api/supabaseClient';
import { getCurrentUser, signOut, navigateToLogin } from './auth-service';
import { queryClientInstance } from './query-client';
const AuthContext = createContext(null);
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(Boolean(supabase));
  const [authError, setAuthError] = useState(null);
  const [isPasswordRecovery, setIsPasswordRecovery] = useState(false);
  const generation = useRef(0);
  const currentId = useRef(null);
  const checkUserAuth = useCallback(async () => {
    const run = ++generation.current;
    try {
      const next = await getCurrentUser();
      if (run !== generation.current) return null;
      if (currentId.current !== next.id) queryClientInstance.clear();
      currentId.current = next.id;
      setUser(next);
      setAuthError(null);
      return next;
    } catch {
      if (run !== generation.current) return null;
      currentId.current = null;
      queryClientInstance.clear();
      setUser(null);
      return null;
    } finally {
      if (run === generation.current) setIsLoadingAuth(false);
    }
  }, []);
  useEffect(() => {
    if (!supabase) return;
    let active = true;
    // Never await Supabase methods inside its auth event callback.
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') setIsPasswordRecovery(true);
      if (event === 'SIGNED_OUT') {
        ++generation.current;
        currentId.current = null;
        setUser(null);
        setIsLoadingAuth(false);
        setIsPasswordRecovery(false);
        queryClientInstance.clear();
      } else {
        setIsLoadingAuth(true);
        setTimeout(() => { if (active) void checkUserAuth(); }, 0);
      }
    });
    void checkUserAuth();
    return () => { active = false; ++generation.current; subscription.unsubscribe(); };
  }, [checkUserAuth]);
  const logout = useCallback(async (shouldRedirect = true) => {
    try {
      await signOut();
      ++generation.current;
      setUser(null);
      queryClientInstance.clear();
      if (shouldRedirect) window.location.assign('/admin/login');
    } catch (error) {
      setAuthError({ type: 'sign_out_failed', message: error.message });
      throw error;
    }
  }, []);
  return <AuthContext.Provider value={{
    user, isAuthenticated: Boolean(user), isLoadingAuth, authChecked: !isLoadingAuth,
    isLoadingPublicSettings: false, appPublicSettings: null, authError, authConfigurationError,
    isPasswordRecovery, setIsPasswordRecovery, logout, navigateToLogin, checkUserAuth, checkAppState: checkUserAuth,
  }}>{children}</AuthContext.Provider>;
}
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}
