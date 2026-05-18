import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, Inbox, Target, Users, Settings, 
  BookOpen, BarChart2, Search, X, ChevronRight, Columns, FileText, Mail
} from 'lucide-react';
import { base44 } from '@/api/base44Client';

const NAV_ITEMS = [
  { label: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
  { label: 'Submissions', path: '/admin/submissions', icon: Inbox },
  { label: 'Leads', path: '/admin/leads', icon: Target },
  { label: 'Pipeline', path: '/admin/pipeline', icon: Columns },
  { label: 'Quotes', path: '/admin/quotes', icon: FileText },
  { label: 'Contacts', path: '/admin/contacts', icon: Users },
  { label: 'Email Templates', path: '/admin/email-templates', icon: Mail },
  { label: 'Services', path: '/admin/services', icon: BookOpen },
  { label: 'SEO Analytics', path: '/admin/seo', icon: BarChart2 },
  { label: 'Search Console', path: '/admin/search-console', icon: Search },
  { label: 'Settings', path: '/admin/settings', icon: Settings },
];

export default function AdminSidebar({ open, onClose }) {
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
    <div className="flex flex-col h-full bg-white border-r border-black/8 w-64">
      {/* Logo */}
      <div className="px-6 py-5 border-b border-black/8">
        <Link to="/admin/dashboard" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-[#B87333] rounded-lg flex items-center justify-center">
            <BookOpen className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="text-sm font-bold text-[#1A1208]">Creative Books</p>
            <p className="text-xs text-black/40">Admin Portal</p>
          </div>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {NAV_ITEMS.map(({ label, path, icon: Icon }) => {
          const active = location.pathname === path || location.pathname.startsWith(path + '/');
          const badge = label === 'Submissions' ? unreadCount : label === 'Leads' ? openLeadCount : 0;
          return (
            <Link
              key={path}
              to={path}
              onClick={onClose}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                active
                  ? 'bg-[#B87333] text-white'
                  : 'text-[#2B2B2B]/70 hover:bg-[#f5f5f5] hover:text-[#1A1208]'
              }`}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              <span className="flex-1">{label}</span>
              {badge > 0 && (
                <span className={`text-xs font-bold px-1.5 py-0.5 rounded-full ${
                  active ? 'bg-white/20 text-white' : label === 'Submissions' ? 'bg-red-100 text-red-600' : 'bg-amber-100 text-amber-700'
                }`}>
                  {badge}
                </span>
              )}
              {active && !badge && <ChevronRight className="w-3 h-3 opacity-60" />}
            </Link>
          );
        })}
      </nav>

      {/* User */}
      {user && (
        <div className="px-4 py-4 border-t border-black/8">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[#B87333] flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
              {(user.full_name || user.email || '?')[0].toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-[#1A1208] truncate">{user.full_name || 'Admin'}</p>
              <p className="text-xs text-black/40 truncate">{user.email}</p>
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