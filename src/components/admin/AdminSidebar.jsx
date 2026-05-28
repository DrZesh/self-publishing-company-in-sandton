import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { getTheme, CURRENT_THEME_KEY } from '@/lib/adminTheme';
import {
  LayoutDashboard, Inbox, Target, Users, Settings,
  BookOpen, BarChart2, Search, X, ChevronRight,
  Columns, FileText, Mail, PenTool, FolderKanban, Receipt,
  CreditCard, CheckSquare, FolderOpen, FileSignature, CalendarDays,
  BarChart3, Globe, Zap, TrendingUp, BookMarked, UserSquare2,
  Package, MessageSquare, Factory, ChevronDown
} from 'lucide-react';
import { base44 } from '@/api/base44Client';

const NAV_GROUPS = [
  {
    key: 'main',
    items: [
      { label: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
    ],
  },
  {
    key: 'crm',
    label: 'CRM',
    items: [
      { label: 'Submissions', path: '/admin/submissions', icon: Inbox, badge: 'unread' },
      { label: 'Leads', path: '/admin/leads', icon: Target, badge: 'leads' },
      { label: 'Clients', path: '/admin/contacts', icon: Users },
      { label: 'Pipeline', path: '/admin/pipeline', icon: Columns },
      { label: 'Tasks', path: '/admin/tasks', icon: CheckSquare },
    ],
  },
  {
    key: 'finance',
    label: 'Finance',
    items: [
      { label: 'Quotes', path: '/admin/quotes', icon: FileText },
      { label: 'Invoices', path: '/admin/invoices', icon: Receipt },
      { label: 'Payments', path: '/admin/payments', icon: CreditCard },
    ],
  },
  {
    key: 'projects',
    label: 'Projects',
    items: [
      { label: 'Projects', path: '/admin/projects', icon: FolderKanban },
      { label: 'Production', path: '/admin/production-board', icon: Factory },
      { label: 'Collections', path: '/admin/collections', icon: Package },
      { label: 'Book Library', path: '/admin/books', icon: BookMarked },
      { label: 'Authors', path: '/admin/authors', icon: UserSquare2 },
    ],
  },
  {
    key: 'documents',
    label: 'Documents',
    items: [
      { label: 'Documents', path: '/admin/documents', icon: FolderOpen },
      { label: 'Document Builder', path: '/admin/document-builder', icon: FileText },
      { label: 'Clause Library', path: '/admin/clause-library', icon: BookOpen },
      { label: 'Contracts', path: '/admin/contracts', icon: FileSignature },
      { label: 'E-Signatures', path: '/admin/signatures', icon: PenTool },
    ],
  },
  {
    key: 'communication',
    label: 'Communication',
    items: [
      { label: 'Email Templates', path: '/admin/email-templates', icon: Mail },
      { label: 'Automations', path: '/admin/automations', icon: Zap },
      { label: 'Calendar', path: '/admin/calendar', icon: CalendarDays },
    ],
  },
  {
    key: 'reports',
    label: 'Reports & SEO',
    items: [
      { label: 'Reports', path: '/admin/reports', icon: BarChart3 },
      { label: 'Revenue Forecast', path: '/admin/revenue-forecast', icon: TrendingUp },
      { label: 'SEO Analytics', path: '/admin/seo', icon: BarChart2 },
      { label: 'Search Console', path: '/admin/search-console', icon: Search },
    ],
  },
  {
    key: 'settings',
    label: 'Settings',
    items: [
      { label: 'Settings', path: '/admin/settings', icon: Settings },
      { label: 'Services', path: '/admin/services', icon: BookOpen },
      { label: 'Client Portal', path: '/admin/client-portal', icon: Globe },
    ],
  },
];

export default function AdminSidebar({ open, onClose }) {
  const [theme, setTheme] = useState(() => getTheme(localStorage.getItem(CURRENT_THEME_KEY) || 'brand'));
  const [collapsedGroups, setCollapsedGroups] = useState({});
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [openLeadCount, setOpenLeadCount] = useState(0);

  useEffect(() => {
    const poll = setInterval(() => {
      const stored = localStorage.getItem(CURRENT_THEME_KEY) || 'brand';
      setTheme(t => t.id !== stored ? getTheme(stored) : t);
    }, 500);
    return () => clearInterval(poll);
  }, []);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
    base44.entities.Submission.filter({ status: 'new' }).then(s => setUnreadCount(s.length)).catch(() => {});
    base44.entities.Lead.list('-created_date', 200).then(leads => {
      setOpenLeadCount(leads.filter(l => !['won', 'lost'].includes(l.stage)).length);
    }).catch(() => {});
  }, []);

  const toggleGroup = (key) => {
    setCollapsedGroups(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const isGroupActive = (group) =>
    group.items.some(item => location.pathname === item.path || location.pathname.startsWith(item.path + '/'));

  const sidebarContent = (
    <div className="flex flex-col h-full w-64" style={{ background: theme.sidebar, color: 'white', borderRight: theme.sidebarBorder || 'none' }}>
      {/* Logo */}
      <div className="px-5 py-4 border-b border-white/10">
        <Link to="/admin/dashboard" className="flex items-center gap-3" onClick={onClose}>
          <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: '#B87333' }}>
            <BookOpen className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-sm font-bold text-white leading-tight">Creative Books SA</p>
            <p className="text-xs text-white/40">Business Portal</p>
          </div>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-3 overflow-y-auto min-h-0 space-y-1">
        {NAV_GROUPS.map(group => {
          const groupActive = isGroupActive(group);
          const collapsed = !group.label ? false : (collapsedGroups[group.key] === undefined ? false : collapsedGroups[group.key]);

          return (
            <div key={group.key}>
              {/* Group header */}
              {group.label && (
                <button
                  onClick={() => toggleGroup(group.key)}
                  className="w-full flex items-center justify-between px-3 py-1.5 text-left transition-colors rounded-lg hover:bg-white/5"
                >
                  <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: groupActive ? '#B87333' : 'rgba(255,255,255,0.4)' }}>
                    {group.label}
                  </span>
                  {collapsed
                    ? <ChevronRight className="w-3 h-3" style={{ color: 'rgba(255,255,255,0.3)' }} />
                    : <ChevronDown className="w-3 h-3" style={{ color: 'rgba(255,255,255,0.3)' }} />
                  }
                </button>
              )}

              {/* Group items */}
              {!collapsed && (
                <div className="space-y-0.5">
                  {group.items.map(({ label, path, icon: Icon, badge }) => {
                    const active = location.pathname === path || location.pathname.startsWith(path + '/');
                    const badgeCount = badge === 'unread' ? unreadCount : badge === 'leads' ? openLeadCount : 0;
                    return (
                      <Link
                        key={path}
                        to={path}
                        onClick={onClose}
                        className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all"
                        style={active
                          ? { background: theme.sidebarActiveBg, color: theme.sidebarActiveText }
                          : { color: theme.sidebarText }
                        }
                      >
                        <Icon className="w-4 h-4 flex-shrink-0" />
                        <span className="flex-1 truncate">{label}</span>
                        {badgeCount > 0 && (
                          <span className={`text-xs font-bold px-1.5 py-0.5 rounded-full ${
                            active ? 'bg-white/20 text-white' : badge === 'unread' ? 'bg-red-400/20 text-red-300' : 'bg-amber-400/20 text-amber-300'
                          }`}>
                            {badgeCount > 99 ? '99+' : badgeCount}
                          </span>
                        )}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* User footer */}
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
      <div className="hidden lg:block flex-shrink-0">{sidebarContent}</div>
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