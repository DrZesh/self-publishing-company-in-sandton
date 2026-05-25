import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, Bell, Search, LogOut } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import AdminSidebar from './AdminSidebar';

export default function AdminLayout({ children }) {
  // Prevent admin pages from being indexed by search engines
  useEffect(() => {
    let meta = document.querySelector('meta[name="robots"]');
    if (!meta) {
      meta = document.createElement('meta');
      meta.name = 'robots';
      document.head.appendChild(meta);
    }
    meta.content = 'noindex, nofollow';
    return () => { meta.content = 'index, follow'; };
  }, []);

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifPermission, setNotifPermission] = useState(typeof Notification !== 'undefined' ? Notification.permission : 'denied');
  const lastSeenRef = useRef(new Set());
  const navigate = useNavigate();

  // Request notification permission on first load
  useEffect(() => {
    if (typeof Notification !== 'undefined' && Notification.permission === 'default') {
      Notification.requestPermission().then(p => setNotifPermission(p));
    }
  }, []);

  // Load initial unread count
  useEffect(() => {
    base44.entities.Submission.filter({ status: 'new' })
      .then(subs => {
        subs.forEach(s => lastSeenRef.current.add(s.id));
        setUnreadCount(subs.length);
      })
      .catch(() => {});
  }, []);

  // Subscribe to new submissions in real-time
  useEffect(() => {
    const unsubscribe = base44.entities.Submission.subscribe((event) => {
      if (event.type === 'create') {
        if (!lastSeenRef.current.has(event.id)) {
          lastSeenRef.current.add(event.id);
          setUnreadCount(prev => prev + 1);
          // Browser push notification
          if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
            const sub = event.data;
            new Notification('New Submission — Creative Books SA', {
              body: `${sub?.full_name || 'Someone'} submitted an enquiry${
                sub?.service_interest?.length ? ` about ${sub.service_interest[0]}` : ''
              }`,
              icon: '/favicon.ico',
              tag: event.id,
            });
          }
        }
      }
    });
    return unsubscribe;
  }, []);

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
            <button
              onClick={() => { setUnreadCount(0); navigate('/admin/submissions'); }}
              className="relative p-2 hover:bg-[#f0f0f0] rounded-lg"
              title="View submissions"
            >
              <Bell className="w-5 h-5 text-[#2B2B2B]" />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-red-500 text-white rounded-full text-[10px] font-bold flex items-center justify-center px-1">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
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