import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { platform } from '@/api/platformClient';
import { Loader2 } from 'lucide-react';

export default function ProtectedAdminRoute({ children }) {
  const [isAdmin, setIsAdmin] = useState(null);

  useEffect(() => {
    const checkAdmin = async () => {
      try {
        const isAuthenticated = await platform.auth.isAuthenticated();
        if (!isAuthenticated) {
          setIsAdmin(false);
          return;
        }

        const user = await platform.auth.me();
        const allowed = ['admin', 'super_user', 'standard_user'];
        setIsAdmin(user && allowed.includes(user.role));
      } catch (err) {
        console.error('Admin check failed:', err);
        setIsAdmin(false);
      }
    };

    checkAdmin();
  }, []);

  if (isAdmin === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8f9fc]">
        <div className="flex items-center gap-3">
          <Loader2 className="w-6 h-6 animate-spin text-[#B8955B]" />
          <span className="text-[#2B2B2B]">Verifying access...</span>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return <Navigate to="/admin/login" replace />;
  }

  return children;
}