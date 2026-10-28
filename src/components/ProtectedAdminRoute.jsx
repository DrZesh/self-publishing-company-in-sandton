import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
export default function ProtectedAdminRoute({ children }) {
  const { user, isLoadingAuth, isPasswordRecovery } = useAuth();
  const location = useLocation();
  if (isLoadingAuth) return <div role="status" className="min-h-screen flex items-center justify-center">Verifying access...</div>;
  if (!user || isPasswordRecovery) return <Navigate to={'/admin/login?next=' + encodeURIComponent(location.pathname + location.search)} replace />;
  if (user.role !== 'admin') return <div role="alert" className="min-h-screen flex flex-col items-center justify-center gap-4"><h1>Access denied</h1><p>This account does not have admin access.</p><a href="/admin/login">Return to sign-in</a></div>;
  return children;
}
