import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, Bell, Search, LogOut } from 'lucide-react';
import { platform } from '@/api/platformClient';
import AdminSidebar from './AdminSidebar';
import CrmAvailabilityNotice from './CrmAvailabilityNotice';
import CommandPalette from './CommandPalette';
import NotificationBell from './notifications/NotificationBell';
import { getTheme, CURRENT_THEME_KEY } from '@/lib/adminTheme';

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
  const [cmdOpen, setCmdOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [theme, setTheme] = useState(() => getTheme(localStorage.getItem(CURRENT_THEME_KEY) || 'brand'));

  // Listen for theme changes from Settings
  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === CURRENT_THEME_KEY) setTheme(getTheme(e.newValue || 'brand'));
    };
    window.addEventListener('storage', onStorage);
    // Also poll localStorage for same-tab changes
    const poll = setInterval(() => {
      const stored = localStorage.getItem(CURRENT_THEME_KEY) || 'brand';
      setTheme(t => t.id !== stored ? getTheme(stored) : t);
    }, 500);
    return () => { window.removeEventListener('storage', onStorage); clearInterval(poll); };
  }, []);
  const [notifPermission, setNotifPermission] = useState(typeof Notification !== 'undefined' ? Notification.permission : 'denied');
  const lastSeenRef = useRef(new Set());
  const navigate = useNavigate();

  // Global Cmd+K / Ctrl+K handler
  useEffect(() => {
    const handler = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setCmdOpen(o => !o);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  // Request notification permission on first load
  useEffect(() => {
    if (typeof Notification !== 'undefined' && Notification.permission === 'default') {
      Notification.requestPermission().then(p => setNotifPermission(p));
    }
  }, []);

  // Load initial unread count
  useEffect(() => {
    platform.entities.Submission.filter({ status: 'new' })
      .then(subs => {
        subs.forEach(s => lastSeenRef.current.add(s.id));
        setUnreadCount(subs.length);
      })
      .catch(() => {});
  }, []);

  // Subscribe to new submissions in real-time
  useEffect(() => {
    const unsubscribe = platform.entities.Submission.subscribe((event) => {
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
    <div className="flex h-screen" style={{ background: theme.bg, '--admin-accent': theme.accent }}>
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

            {/* Search → opens Command Palette */}
            <button
              onClick={() => setCmdOpen(true)}
              className="hidden sm:flex items-center gap-2 flex-1 max-w-md px-4 py-2 bg-[#f5f5f5] rounded-lg text-sm text-[#2B2B2B]/50 border border-[#ddd]/30 hover:border-[#B8955B]/50 hover:bg-[#f0f0f0] transition-colors"
            >
              <Search className="w-4 h-4 flex-shrink-0" />
              <span className="flex-1 text-left">Search or jump to...</span>
              <kbd className="hidden md:inline-flex items-center gap-1 text-xs font-mono text-[#2B2B2B]/40 bg-white border border-gray-200 rounded px-1.5 py-0.5">
                <span>⌘</span>K
              </kbd>
            </button>
          </div>

          <div className="flex items-center gap-2">
            {/* Time */}
            <span className="text-sm text-[#2B2B2B]/60 hidden sm:inline mr-2">{currentTime}</span>

            {/* Submissions bell (existing) */}
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

            {/* Smart Notification Bell */}
            <div className="[&_button]:text-[#2B2B2B] [&_button:hover]:bg-[#f0f0f0]">
              <NotificationBell />
            </div>

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
            <CrmAvailabilityNotice />
            {children}
          </div>
        </div>
      </div>

      <CommandPalette open={cmdOpen} onClose={() => setCmdOpen(false)} />
    </div>
  );
}