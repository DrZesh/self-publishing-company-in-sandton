import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, Bell, Search, LogOut } from 'lucide-react';
import AdminSidebar from './AdminSidebar';

export default function AdminLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('adminRememberMe');
    localStorage.removeItem('adminEmail');
    navigate('/admin/login');
  };

  const currentTime = new Date().toLocaleTimeString('en-ZA', {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className="flex h-screen" style={{ background: '#F4F6F8' }}>
      {/* Sidebar */}
      <AdminSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <div
          className="h-14 border-b flex items-center justify-between px-6"
          style={{ background: '#ffffff', borderColor: '#e5e7eb' }}
        >
          <div className="flex items-center gap-4 flex-1">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-2 hover:bg-[#f0f0f0] rounded-lg"
            >
              {sidebarOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>

            {/* Search */}
            <div className="hidden sm:flex items-center flex-1 max-w-md">
              <Search className="w-4 h-4 text-[#2B2B2B]/40 absolute ml-3" />
              <input
                type="text"
                placeholder="Search submissions, leads, contacts..."
                className="w-full pl-9 pr-4 py-2 bg-[#f5f5f5] rounded-lg text-sm border border-[#ddd]/30 focus:outline-none focus:border-[#B8955B]"
              />
              <span className="text-xs text-[#2B2B2B]/40 ml-2 hidden md:inline">Cmd+K</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Time */}
            <span className="text-sm text-[#2B2B2B]/60 hidden sm:inline">{currentTime}</span>

            {/* Notifications */}
            <button className="relative p-2 hover:bg-[#f0f0f0] rounded-lg">
              <Bell className="w-5 h-5 text-[#2B2B2B]" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
            </button>

            {/* Logout */}
            <button
              onClick={handleLogout}
              className="p-2 hover:bg-[#f0f0f0] rounded-lg text-[#2B2B2B]"
              title="Logout"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Page Content */}
        <div className="flex-1 overflow-auto">
          <div className="p-6 lg:p-7 h-full">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}