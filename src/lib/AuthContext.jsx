import React, { createContext, useContext, useEffect, useState } from 'react';
import { platform } from '@/api/platformClient';
import { supabase, isSupabaseConfigured } from '@/api/supabaseClient';
const AuthContext = createContext(null);
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoadingAuth, setLoading] = useState(true);
  const checkUserAuth = async () => {
    try { setUser(await platform.auth.me()); } catch { setUser(null); } finally { setLoading(false); }
  };
  useEffect(() => {
    if (!isSupabaseConfigured) { setLoading(false); return; }
    checkUserAuth();
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => { setTimeout(checkUserAuth, 0); });
    return () => subscription.unsubscribe();
  }, []);
  return <AuthContext.Provider value={{ user, isAuthenticated: Boolean(user), isLoadingAuth, isLoadingPublicSettings: false, authChecked: !isLoadingAuth, authError: null, appPublicSettings: { public_settings: { requires_auth: false } }, checkUserAuth, checkAppState: checkUserAuth, logout: async redirect => { setUser(null); await platform.auth.logout(redirect ? '/' : undefined); }, navigateToLogin: () => platform.auth.redirectToLogin(location.href) }}>{children}</AuthContext.Provider>;
}
export const useAuth = () => useContext(AuthContext);
