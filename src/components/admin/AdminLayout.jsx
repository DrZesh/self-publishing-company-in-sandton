import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, Bell, Search, LogOut } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import AdminSidebar from './AdminSidebar';
import CommandPalette from './CommandPalette';
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
    <div className="flex h-screen" style={{ background: 'linear-gradient(135deg,#0a0a14 0%,#0d0d1e 25%,#0a0f1a 50%,#10080f 75%,#0a0a14 100%)', '--admin-accent': theme.accent }}>
      {/* Ambient orbs */}
      <div style={{ position:'fixed',top:0,left:'20%',width:600,height:600,borderRadius:'50%',opacity:0.06,filter:'blur(120px)',background:'radial-gradient(circle,#B87333,transparent)',pointerEvents:'none',zIndex:0 }} />
      <div style={{ position:'fixed',top:'30%',right:0,width:500,height:500,borderRadius:'50%',opacity:0.05,filter:'blur(120px)',background:'radial-gradient(circle,#6366f1,transparent)',pointerEvents:'none',zIndex:0 }} />
      <div style={{ position:'fixed',bottom:0,left:0,width:400,height:400,borderRadius:'50%',opacity:0.04,filter:'blur(100px)',background:'radial-gradient(circle,#10b981,transparent)',pointerEvents:'none',zIndex:0 }} />
      {/* Sidebar */}
      <AdminSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden" style={{ position:'relative', zIndex:1 }}>
        {/* Top Bar */}
        <div
          className="h-14 border-b flex items-center justify-between px-6"
          style={{ background: 'rgba(10,10,20,0.85)', backdropFilter:'blur(20px)', borderColor: 'rgba(255,255,255,0.08)' }}
        >
          <div className="flex items-center gap-4 flex-1">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-2 hover:bg-white/10 rounded-lg"
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
              className="hidden sm:flex items-center gap-2 flex-1 max-w-md px-4 py-2 rounded-lg text-sm border transition-colors"
              style={{ background:'rgba(255,255,255,0.05)', borderColor:'rgba(255,255,255,0.1)', color:'rgba(255,255,255,0.4)' }}
            >
              <Search className="w-4 h-4 flex-shrink-0" />
              <span className="flex-1 text-left">Search or jump to...</span>
              <kbd className="hidden md:inline-flex items-center gap-1 text-xs font-mono rounded px-1.5 py-0.5" style={{ color:'rgba(255,255,255,0.25)', background:'rgba(255,255,255,0.07)', border:'1px solid rgba(255,255,255,0.1)' }}>
                <span>⌘</span>K
              </kbd>
            </button>
          </div>

          <div className="flex items-center gap-4">
            {/* Time */}
            <span className="text-sm hidden sm:inline" style={{ color:'rgba(255,255,255,0.35)', fontFamily:'monospace' }}>{currentTime}</span>

            {/* Notifications */}
            <button
              onClick={() => { setUnreadCount(0); navigate('/admin/submissions'); }}
              className="relative p-2 hover:bg-white/10 rounded-lg"
              title="View submissions"
            >
              <Bell className="w-5 h-5" style={{ color:'rgba(255,255,255,0.5)' }} />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-red-500 text-white rounded-full text-[10px] font-bold flex items-center justify-center px-1">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
            </button>

            {/* Logout */}
            <button
              onClick={handleLogout}
              className="p-2 hover:bg-white/10 rounded-lg"
              title="Logout"
            >
              <LogOut className="w-5 h-5" style={{ color:'rgba(255,255,255,0.5)' }} />
            </button>
          </div>
        </div>

        {/* Page Content */}
        <div className="flex-1 overflow-auto admin-dark">
          <div className="p-6 lg:p-7 h-full">
            {children}
          </div>
        </div>
      </div>

      <CommandPalette open={cmdOpen} onClose={() => setCmdOpen(false)} />
    </div>
  );
}