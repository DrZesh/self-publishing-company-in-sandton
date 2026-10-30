import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { getTheme, CURRENT_THEME_KEY } from '@/lib/adminTheme';
import {
  LayoutDashboard, Inbox, Target, Users, Settings,
  BookOpen, BarChart2, Search, X, ChevronRight,
  Columns, FileText, Mail, PenTool, FolderKanban, Receipt,
  CreditCard, CheckSquare, FolderOpen, FileSignature, CalendarDays,
  BarChart3, Globe, Zap, TrendingUp, BookMarked, UserSquare2,
  Package, MessageSquare, Factory, ChevronDown, DollarSign, RefreshCw, Building2, Megaphone,
  Bell, ClipboardList, Star
} from 'lucide-react';
import { platform } from '@/api/platformClient';
import { getFinanceAccessLevel, canSeeReports, canAccessSettings, getDataScope } from '@/lib/rbac';

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
      { label: 'Clients / Contacts', path: '/admin/contacts', icon: Users },
      { label: 'Pipeline', path: '/admin/pipeline', icon: Columns },
      { label: 'Tasks', path: '/admin/tasks', icon: CheckSquare },
      { label: 'Follow-ups', path: '/admin/follow-ups', icon: Zap },
      { label: 'Lead Scoring', path: '/admin/lead-scoring', icon: Star },
    ],
  },
  {
    key: 'team',
    label: 'Team',
    items: [
      { label: 'User Management', path: '/admin/settings/users', icon: Users },
    ],
  },
  {
    key: 'finance',
    label: 'Finance',
    items: [
      { label: 'Quote to Cash', path: '/admin/billing', icon: DollarSign },
      { label: 'Quotes', path: '/admin/billing/quotes', icon: FileText },
      { label: 'Invoices', path: '/admin/billing/invoices', icon: Receipt },
      { label: 'Payments', path: '/admin/billing/payments', icon: CreditCard },
    ],
  },

  {
    key: 'documents',
    label: 'Document Centre',
    items: [
      { label: 'Doc Library', path: '/admin/documents', icon: FolderOpen },
      { label: 'E-Signatures', path: '/admin/esignatures', icon: FileSignature },
      { label: 'Documents', path: '/admin/contracts', icon: FileText },
      { label: 'Document Builder', path: '/admin/document-builder', icon: PenTool },
      { label: 'Clause Library', path: '/admin/clause-library', icon: BookMarked },
    ],
  },
  {
    key: 'client_service',
    label: 'Client Services',
    items: [
      { label: 'Service Updates', path: '/admin/client-service', icon: RefreshCw },
    ],
  },
  {
    key: 'marketing',
    label: 'Marketing',
    items: [
      { label: 'Campaigns', path: '/admin/marketing', icon: Megaphone },
      { label: 'Bulk Email', path: '/admin/bulk-email', icon: Mail },
      { label: 'WhatsApp Log', path: '/admin/whatsapp-log', icon: MessageSquare },
      { label: 'Notifications', path: '/admin/notifications', icon: Bell },
    ],
  },
  {
    key: 'onboarding',
    label: 'Onboarding',
    items: [
      { label: 'Client Onboarding', path: '/admin/onboarding', icon: ClipboardList },
    ],
  },
  {
    key: 'communication',
    label: 'Message Centre',
    items: [
      { label: 'Message Centre', path: '/admin/message-centre', icon: Mail },
      { label: 'Automation Centre', path: '/admin/automation-centre', icon: Zap },
      { label: 'Email Settings', path: '/admin/email-settings', icon: Mail },
      { label: 'Calendar', path: '/admin/calendar', icon: CalendarDays },
    ],
  },
  {
    key: 'reports',
    label: 'Reports & Analytics',
    items: [
      { label: 'Business Intelligence', path: '/admin/bi', icon: BarChart3 },
      { label: 'Reports', path: '/admin/reports', icon: BarChart3 },
      { label: 'Revenue Forecast', path: '/admin/revenue-forecast', icon: TrendingUp },
      { label: 'GA Analytics', path: '/admin/analytics', icon: TrendingUp },
      { label: 'SEO Analytics', path: '/admin/seo', icon: BarChart2 },
      { label: 'Search Console', path: '/admin/search-console', icon: Search },
    ],
  },
  {
    key: 'appointments',
    label: 'Appointments',
    items: [
      { label: 'Appointments', path: '/admin/appointments', icon: CalendarDays },
      { label: 'Booking Settings', path: '/admin/booking-settings', icon: Settings },
    ],
  },
  {
    key: 'settings',
    label: 'Settings',
    items: [
      { label: 'Company Settings', path: '/admin/company-settings', icon: Building2 },
      { label: 'Settings', path: '/admin/settings', icon: Settings },
      { label: 'Services', path: '/admin/services', icon: BookOpen },
      { label: 'Resource Documents', path: '/admin/resource-documents', icon: FolderOpen },
      { label: 'Client Portal', path: '/admin/client-portal', icon: Globe },
      { label: 'Export Data', path: '/admin/export', icon: DollarSign },
      { label: 'Zoho Books', path: '/admin/zoho-books', icon: RefreshCw },
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
  const chatUnreadCount = 0;

  useEffect(() => {
    const poll = setInterval(() => {
      const stored = localStorage.getItem(CURRENT_THEME_KEY) || 'brand';
      setTheme(t => t.id !== stored ? getTheme(stored) : t);
    }, 500);
    return () => clearInterval(poll);
  }, []);

  // Get user's access levels
  const financeAccess = getFinanceAccessLevel(user);
  const canSeeReportsAccess = canSeeReports(user);
  const canAccessSettingsAccess = canAccessSettings(user);
  const dataScope = getDataScope(user);

  useEffect(() => {
    platform.auth.me().then(setUser).catch(() => {});
    platform.entities.Submission.filter({ status: 'new' }).then(s => setUnreadCount(s.length)).catch(() => {});
    platform.entities.Lead.list('-created_date', 200).then(leads => {
      setOpenLeadCount(leads.filter(l => !['won', 'lost'].includes(l.stage)).length);
    }).catch(() => {});
  }, []);

  const toggleGroup = (key) => {
    setCollapsedGroups(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const isGroupActive = (group) =>
    group.items.some(item => location.pathname === item.path || location.pathname.startsWith(item.path + '/'));

  // Filter nav groups based on user role
  const filteredNavGroups = NAV_GROUPS.filter(group => {
    // Hide Reports & SEO from Standard users
    if (group.key === 'reports' && !canSeeReportsAccess) return false;
    // Hide Settings from Standard users
    if (group.key === 'settings' && !canAccessSettingsAccess) return false;
    // Filter Finance items for Standard users
    if (group.key === 'finance' && financeAccess === 'quotes_invoices_only') {
      group.items = group.items.filter(item => 
        ['Finance Hub', 'Quotes', 'Invoices', 'Payments'].includes(item.label)
      );
    }
    return true;
  });

  const sidebarContent = (
    <div className="flex flex-col h-full w-72" style={{ 
      background: 'rgba(15, 15, 15, 0.75)', 
      backdropFilter: 'blur(24px) saturate(180%)', 
      WebkitBackdropFilter: 'blur(24px) saturate(180%)',
      color: 'white', 
      borderRight: '1px solid rgba(255, 255, 255, 0.12)',
      boxShadow: '4px 0 32px rgba(0, 0, 0, 0.5)'
    }}>
      {/* Logo with Profile Picture */}
      <div className="px-5 py-4 border-b border-white/10">
        <Link to="/admin/dashboard" className="flex items-center gap-3" onClick={onClose}>
          {user?.profile_photo_url ? (
            <img 
              src={user.profile_photo_url} 
              alt={user.full_name || 'Profile'}
              className="w-10 h-10 rounded-2xl object-cover flex-shrink-0 cursor-pointer hover:opacity-90 transition-opacity shadow-lg"
              title="Click to update profile picture"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                document.getElementById('sidebar-profile-upload')?.click();
              }}
            />
          ) : (
            <div 
              className="w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 cursor-pointer hover:opacity-90 transition-opacity shadow-lg" 
              style={{ background: 'linear-gradient(135deg, #B87333 0%, #D4A574 100%)' }}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                document.getElementById('sidebar-profile-upload')?.click();
              }}
              title="Click to upload profile picture"
            >
              <BookOpen className="w-5 h-5 text-white" />
            </div>
          )}
          <div>
            <p className="text-sm font-bold text-white leading-tight">Creative Books SA</p>
            <p className="text-xs text-white/70">Business Portal</p>
          </div>
        </Link>
        <input
          id="sidebar-profile-upload"
          type="file"
          accept="image/*"
          className="hidden"
          onChange={async (e) => {
            const file = e.target.files?.[0];
            if (!file) return;
            if (!file.type.startsWith('image/')) {
              alert('Please select an image file');
              return;
            }
            if (file.size > 5 * 1024 * 1024) {
              alert('Image must be less than 5MB');
              return;
            }
            const reader = new FileReader();
            reader.onload = async (event) => {
              const base64 = event.target?.result;
              if (!base64) return;
              const binaryString = atob(base64.split(',')[1]);
              const bytes = new Uint8Array(binaryString.length);
              for (let i = 0; i < binaryString.length; i++) {
                bytes[i] = binaryString.charCodeAt(i);
              }
              const fileBlob = new Blob([bytes], { type: file.type });
              const uploadFile = new File([fileBlob], file.name, { type: file.type });
              const { file_url } = await platform.integrations.Core.UploadFile({ file: uploadFile });
              await platform.entities.User.update(user.id, { profile_photo_url: file_url });
              setUser({ ...user, profile_photo_url: file_url });
            };
            reader.readAsDataURL(file);
          }}
        />
      </div>



      {/* Nav */}
      <nav className="flex-1 px-2 py-3 overflow-y-auto min-h-0 space-y-1">
        {filteredNavGroups.map(group => {
          const groupActive = isGroupActive(group);
          const collapsed = !group.label ? false : (collapsedGroups[group.key] === undefined ? false : collapsedGroups[group.key]);

          return (
            <div key={group.key}>
              {/* Group header */}
              {group.label && (
                <button
                  onClick={() => toggleGroup(group.key)}
                  className="w-full flex items-center justify-between px-3 py-2 text-left transition-colors rounded-xl hover:bg-white/5"
                >
                  <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: groupActive ? '#F0B873' : 'rgba(255,255,255,0.7)' }}>
                    {group.label}
                  </span>
                  {collapsed
                    ? <ChevronRight className="w-3.5 h-3.5" style={{ color: 'rgba(255,255,255,0.6)' }} />
                    : <ChevronDown className="w-3.5 h-3.5" style={{ color: 'rgba(255,255,255,0.6)' }} />
                  }
                </button>
              )}

              {/* Group items */}
              {!collapsed && (
                <div className="space-y-1">
                  {group.items.map(({ label, path, icon: IconComponent, badge }) => {
                    const active = location.pathname === path || location.pathname.startsWith(path + '/');
                    const badgeCount = badge === 'unread' ? unreadCount : badge === 'leads' ? openLeadCount : badge === 'chat' ? chatUnreadCount : 0;
                    return (
                      <Link
                        key={path}
                        to={path}
                        onClick={onClose}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all"
                        style={active
                          ? { 
                              background: 'rgba(184, 115, 51, 0.25)', 
                              color: '#F0B873',
                              boxShadow: 'inset 0 0 0 1px rgba(184, 115, 51, 0.3)',
                              fontWeight: '600'
                            }
                          : { 
                              color: 'rgba(255, 255, 255, 0.95)',
                              background: 'transparent'
                            }
                        }
                      >
                        <IconComponent className="w-4.5 h-4.5 flex-shrink-0" style={{ opacity: active ? 1 : 0.85 }} />
                        <span className="flex-1 truncate">{label}</span>
                        {badgeCount > 0 && (
                          <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                            active ? 'bg-[#B87333] text-white' : badge === 'unread' ? 'bg-red-500 text-white' : 'bg-amber-500 text-white'
                          }`} style={{ 
                            boxShadow: active ? '0 0 12px rgba(184, 115, 51, 0.5)' : badge === 'unread' ? '0 0 12px rgba(239, 68, 68, 0.5)' : '0 0 12px rgba(245, 158, 11, 0.5)'
                          }}>
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

      {/* User footer with role badge */}
      {user && (
        <div className="px-3 py-3 border-t border-white/10">
          <div className="flex items-center gap-3 p-2 rounded-2xl" style={{ background: 'rgba(255, 255, 255, 0.05)' }}>
            {user.profile_photo_url ? (
              <img 
                src={user.profile_photo_url} 
                alt={user.full_name || 'Profile'}
                className="w-10 h-10 rounded-2xl object-cover flex-shrink-0 cursor-pointer hover:opacity-90 transition-opacity shadow-lg"
                title="Click to update profile picture"
                onClick={() => document.getElementById('sidebar-profile-upload')?.click()}
              />
            ) : (
              <div 
                className="w-10 h-10 rounded-2xl flex items-center justify-center text-white text-sm font-bold flex-shrink-0 cursor-pointer hover:opacity-90 transition-opacity shadow-lg" 
                style={{ background: 'linear-gradient(135deg, #B87333 0%, #D4A574 100%)' }}
                onClick={() => document.getElementById('sidebar-profile-upload')?.click()}
                title="Click to upload profile picture"
              >
                {(user.full_name || user.email || '?')[0].toUpperCase()}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-white truncate">{user.full_name || 'Admin'}</p>
              <p className="text-xs text-white/80 truncate">{user.email}</p>
              <p className="text-xs mt-1.5">
                <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  user.role === 'super_user' ? 'bg-green-500/25 text-green-300' : 
                  user.role === 'admin' ? 'bg-blue-500/25 text-blue-300' : 
                  'bg-white/15 text-white/70'
                }`} style={{ 
                  backdropFilter: 'blur(8px)',
                  WebkitBackdropFilter: 'blur(8px)',
                  border: '1px solid rgba(255, 255, 255, 0.1)'
                }}>
                  {user.role === 'super_user' ? 'Super user' : 
                   user.role === 'admin' ? 'Admin' : 'Standard'}
                </span>
              </p>
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