import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { supabase } from '@/api/supabaseClient';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [session, setSession] = useState(null);
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [authError, setAuthError] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);

  const loadProfile = useCallback(async (userId) => {
    if (!userId) {
      setProfile(null);
      return null;
    }

    const { data, error } = await supabase
      .from('profiles')
      .select('id, email, full_name, role, created_at, updated_at')
      .eq('id', userId)
      .single();

    if (error) {
      throw error;
    }

    setProfile(data);
    return data;
  }, []);

  const checkUserAuth = useCallback(async () => {
    setIsLoadingAuth(true);
    setAuthError(null);

    try {
      const {
        data: { user: currentUser },
        error,
      } = await supabase.auth.getUser();

      if (error) {
        throw error;
      }

      setUser(currentUser ?? null);

      if (currentUser) {
        await loadProfile(currentUser.id);
      } else {
        setProfile(null);
      }

      return currentUser ?? null;
    } catch (error) {
      console.error('Supabase auth check failed:', error);
      setUser(null);
      setProfile(null);
      setAuthError({
        type: 'auth_error',
        message: error.message || 'Unable to verify authentication.',
      });
      return null;
    } finally {
      setIsLoadingAuth(false);
      setAuthChecked(true);
    }
  }, [loadProfile]);

  useEffect(() => {
    let mounted = true;

    const initialiseAuth = async () => {
      try {
        const {
          data: { session: currentSession },
          error,
        } = await supabase.auth.getSession();

        if (error) {
          throw error;
        }

        if (!mounted) return;

        setSession(currentSession ?? null);
        setUser(currentSession?.user ?? null);

        if (currentSession?.user) {
          await loadProfile(currentSession.user.id);
        } else {
          setProfile(null);
        }
      } catch (error) {
        if (!mounted) return;

        console.error('Supabase auth initialisation failed:', error);
        setAuthError({
          type: 'auth_error',
          message: error.message || 'Unable to initialise authentication.',
        });
      } finally {
        if (mounted) {
          setIsLoadingAuth(false);
          setAuthChecked(true);
        }
      }
    };

    initialiseAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession ?? null);
      setUser(nextSession?.user ?? null);
      setAuthError(null);

      window.setTimeout(async () => {
        try {
          if (nextSession?.user) {
            await loadProfile(nextSession.user.id);
          } else {
            setProfile(null);
          }
        } catch (error) {
          console.error('Failed to load Supabase profile:', error);
          setProfile(null);
          setAuthError({
            type: 'profile_error',
            message: error.message || 'Unable to load the user profile.',
          });
        }
      }, 0);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [loadProfile]);

  const logout = useCallback(async (shouldRedirect = true) => {
    const { error } = await supabase.auth.signOut();

    if (error) {
      throw error;
    }

    setSession(null);
    setUser(null);
    setProfile(null);

    if (shouldRedirect) {
      window.location.assign('/admin/login');
    }
  }, []);

  const navigateToLogin = useCallback(() => {
    window.location.assign('/admin/login');
  }, []);

  const value = useMemo(
    () => ({
      session,
      user,
      profile,
      role: profile?.role ?? null,
      isAuthenticated: Boolean(user),
      isLoadingAuth,
      isLoadingPublicSettings: false,
      authError,
      appPublicSettings: null,
      authChecked,
      logout,
      navigateToLogin,
      checkUserAuth,
      checkAppState: checkUserAuth,
    }),
    [
      session,
      user,
      profile,
      isLoadingAuth,
      authError,
      authChecked,
      logout,
      navigateToLogin,
      checkUserAuth,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
};
