import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
export default function ProtectedRoute({ children, fallback, unauthenticatedElement }) {
  const { user, isLoadingAuth, isPasswordRecovery } = useAuth();
  const location = useLocation();
  if (isLoadingAuth) return fallback || <div role="status">Checking authentication...</div>;
  if (!user || isPasswordRecovery) return unauthenticatedElement || <Navigate to={'/admin/login?next=' + encodeURIComponent(location.pathname + location.search)} replace />;
  return children || <Outlet />;
}
