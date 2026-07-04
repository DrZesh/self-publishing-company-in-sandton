import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, X, Bell, Search, LogOut } from 'lucide-react';
import { supabase } from '@/api/supabaseClient';
import AdminSidebar from './AdminSidebar';
import CommandPalette from './CommandPalette';
import { getTheme, CURRENT_THEME_KEY } from '@/lib/adminTheme';

export default function AdminLayout({ children }) {
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
  const lastSeenRef = useRef(new Set());
  const navigate = useNavigate();

  useEffect(() => {
    const onStorage = (event) => {
      if (event.key === CURRENT_THEME_KEY) setTheme(getTheme(event.newValue || 'brand'));
    };
    window.addEventListener('storage', onStorage);
    const poll = setInterval(() => {
      const stored = localStorage.getItem(CURRENT_THEME_KEY) || 'brand';
      setTheme(current => current.id !== stored ? getTheme(stored) : current);
    }, 500);
    return () => {
      window.removeEventListener('storage', onStorage);
      clearInterval(poll);
    };
  }, []);

  useEffect(() => {
    const handler = (event) => {
      if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
        event.preventDefault();
        setCmdOpen(open => !open);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  useEffect(() => {
    if (typeof Notification !== 'undefined' && Notification.permission === 'default') {
      Notification.requestPermission().catch(() => {});
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    supabase
      .from('submissions')
      .select('id')
      .eq('status', 'new')
      .then(({ data, error }) => {
        if (cancelled || error) return;
        (data || []).forEach(submission => lastSeenRef.current.add(submission.id));
        setUnreadCount((data || []).length);
      });

    const channel = supabase
      .channel('admin-layout-new-submissions')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'submissions' },
        payload => {
          const submission = payload.new;
          if (submission?.status !== 'new' || lastSeenRef.current.has(submission.id)) return;

          lastSeenRef.current.add(submission.id);
          setUnreadCount(previous => previous + 1);

          if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
            new Notification('New Submission | Creative Books SA', {
              body: `${submission.full_name || 'Someone'} submitted an enquiry${
                submission.service_interest?.length ? ` about ${submission.service_interest[0]}` : ''
              }`,
              icon: '/favicon.ico',
              tag: submission.id,
            });
          }
        },
      )
      .subscribe();

    return () => {
      cancelled = true;
      supabase.removeChannel(channel);
    };
  }, []);

  const handleLogout = async () => {
    localStorage.removeItem('adminRememberMe');
    localStorage.removeItem('adminEmail');
    await supabase.auth.signOut();
    navigate('/admin/login', { replace: true });
  };

  const currentTime = new Date().toLocaleTimeString('en-ZA', {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className="flex h-screen" style={{ background: theme.bg, '--admin-accent': theme.accent }}>
      <AdminSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col overflow-hidden">
        <div
          className="h-14 border-b flex items-center justify-between px-6"
          style={{ background: '#ffffff', borderColor: '#e5e7eb' }}
        >
          <div className="flex items-center gap-4 flex-1">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-2 hover:bg-[#f0f0f0] rounded-lg"
            >
              {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

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

          <div className="flex items-center gap-4">
            <span className="text-sm text-[#2B2B2B]/60 hidden sm:inline">{currentTime}</span>

            <button
              onClick={() => {
                setUnreadCount(0);
                navigate('/admin/submissions');
              }}
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

            <button
              onClick={handleLogout}
              className="p-2 hover:bg-[#f0f0f0] rounded-lg text-[#2B2B2B]"
              title="Logout"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-auto">
          <div className="p-6 lg:p-7 h-full">{children}</div>
        </div>
      </div>

      <CommandPalette open={cmdOpen} onClose={() => setCmdOpen(false)} />
    </div>
  );
}
