import React from 'react';
import { Navigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';

export default function ProtectedAdminRoute({ children }) {
  const { user, profile, isLoadingAuth, authChecked } = useAuth();

  if (isLoadingAuth || !authChecked) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8f9fc]">
        <div className="flex items-center gap-3">
          <Loader2 className="w-6 h-6 animate-spin text-[#B8955B]" />
          <span className="text-[#2B2B2B]">Verifying access...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/admin/login" replace />;
  }

  const hasAdminAccess = ['super_admin', 'admin'].includes(profile?.role);

  if (!hasAdminAccess) {
    return <Navigate to="/admin/login" replace />;
  }

  return children;
}
