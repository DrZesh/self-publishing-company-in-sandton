import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { getTheme, CURRENT_THEME_KEY } from '@/lib/adminTheme';
import { 
  LayoutDashboard, Inbox, Target, Users, Settings, 
  BookOpen, BarChart2, Search, X, ChevronRight, Columns, FileText, Mail, PenTool,
  FolderKanban, Receipt, CreditCard, CheckSquare, FolderOpen, FileSignature, CalendarDays,
  BarChart3, Globe, Zap, TrendingUp, BookMarked, UserSquare2, Package
} from 'lucide-react';
import { base44 } from '@/api/base44Client';

const BRAND = '#2D6A4F'; // QuickBooks-style deep green mapped to brand

const NAV_ITEMS = [
  { label: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
  { label: 'Submissions', path: '/admin/submissions', icon: Inbox },
  { label: 'Leads', path: '/admin/leads', icon: Target },
  { label: 'Pipeline', path: '/admin/pipeline', icon: Columns },
  { label: 'Quotes', path: '/admin/quotes', icon: FileText },
  { label: 'E-Signatures', path: '/admin/signatures', icon: PenTool },
  { label: 'Signing Workflow', path: '/admin/signing', icon: FileSignature },
  { label: 'Projects', path: '/admin/projects', icon: FolderKanban },
  { label: 'Invoices', path: '/admin/invoices', icon: Receipt },
  { label: 'Payments', path: '/admin/payments', icon: CreditCard },
  { label: 'Tasks', path: '/admin/tasks', icon: CheckSquare },
  { label: 'Documents', path: '/admin/documents', icon: FolderOpen },
  { label: 'Doc Dashboard', path: '/admin/document-dashboard', icon: BarChart3 },
  { label: 'Production Board', path: '/admin/production-board', icon: FolderKanban },
  { label: 'Revenue Forecast', path: '/admin/revenue-forecast', icon: TrendingUp },
  { label: 'Book Library', path: '/admin/books', icon: BookMarked },
  { label: 'Authors', path: '/admin/authors', icon: UserSquare2 },
  { label: 'Collections', path: '/admin/collections', icon: Package },
  { label: 'Contracts', path: '/admin/contracts', icon: FileSignature },
  { label: 'Calendar', path: '/admin/calendar', icon: CalendarDays },
  { label: 'Reports', path: '/admin/reports', icon: BarChart3 },
  { label: 'Client Portal', path: '/admin/client-portal', icon: Globe },
  { label: 'Automations', path: '/admin/automations', icon: Zap },
  { label: 'Contacts', path: '/admin/contacts', icon: Users },
  { label: 'Email Templates', path: '/admin/email-templates', icon: Mail },
  { label: 'Services', path: '/admin/services', icon: BookOpen },
  { label: 'SEO Analytics', path: '/admin/seo', icon: BarChart2 },
  { label: 'Search Console', path: '/admin/search-console', icon: Search },
  { label: 'Settings', path: '/admin/settings', icon: Settings },
];

export default function AdminSidebar({ open, onClose }) {
  const [theme, setTheme] = useState(() => getTheme(localStorage.getItem(CURRENT_THEME_KEY) || 'brand'));
  useEffect(() => {
    const poll = setInterval(() => {
      const stored = localStorage.getItem(CURRENT_THEME_KEY) || 'brand';
      setTheme(t => t.id !== stored ? getTheme(stored) : t);
    }, 500);
    return () => clearInterval(poll);
  }, []);
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [openLeadCount, setOpenLeadCount] = useState(0);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
    base44.entities.Submission.filter({ status: 'new' }).then(s => setUnreadCount(s.length)).catch(() => {});
    base44.entities.Lead.list('-created_date', 200).then(leads => {
      setOpenLeadCount(leads.filter(l => !['won', 'lost'].includes(l.stage)).length);
    }).catch(() => {});
  }, []);

  const sidebarContent = (
    <div className="flex flex-col h-full w-64" style={{ background: theme.sidebar, color: 'white', borderRight: theme.sidebarBorder || 'none' }}>
      {/* Logo */}
      <div className="px-5 py-4 border-b border-white/10">
        <Link to="/admin/dashboard" className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: '#B87333' }}>
            <BookOpen className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-sm font-bold text-white leading-tight">Creative Books</p>
            <p className="text-xs text-white/40">Business Portal</p>
          </div>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-3 space-y-0.5 overflow-y-auto min-h-0">
        {NAV_ITEMS.map(({ label, path, icon: Icon }) => {
          const active = location.pathname === path || location.pathname.startsWith(path + '/');
          const badge = label === 'Submissions' ? unreadCount : label === 'Leads' ? openLeadCount : 0;
          return (
            <Link
              key={path}
              to={path}
              onClick={onClose}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all`}
              style={active
                ? { background: theme.sidebarActiveBg, color: theme.sidebarActiveText }
                : { color: theme.sidebarText }}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              <span className="flex-1">{label}</span>
              {badge > 0 && (
                <span className={`text-xs font-bold px-1.5 py-0.5 rounded-full ${
                  active ? 'bg-white/20 text-white' : label === 'Submissions' ? 'bg-red-400/20 text-red-300' : 'bg-amber-400/20 text-amber-300'
                }`}>
                  {badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* User */}
      {user && (
        <div className="px-4 py-4 border-t border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0" style={{ background: '#B87333' }}>
              {(user.full_name || user.email || '?')[0].toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-white truncate">{user.full_name || 'Admin'}</p>
              <p className="text-xs text-white/40 truncate">{user.email}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <>
      {/* Desktop */}
      <div className="hidden lg:block flex-shrink-0">{sidebarContent}</div>

      {/* Mobile overlay */}
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={onClose} />
          <div className="absolute left-0 top-0 bottom-0">
            <div className="relative h-full">
              <button onClick={onClose} className="absolute top-4 right-[-40px] p-2 bg-white rounded-lg z-10">
                <X className="w-4 h-4" />
              </button>
              {sidebarContent}
            </div>
          </div>
        </div>
      )}
    </>
  );
}