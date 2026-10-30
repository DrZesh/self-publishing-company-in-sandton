import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { 
  BookOpen, LayoutDashboard, FileText, CreditCard, FolderOpen, 
  Calendar,
  Menu, X,
  Phone, Mail, HelpCircle, ChevronDown
} from 'lucide-react';
import NotificationBell from './NotificationBell';

const NAV_ITEMS = [
  { label: 'Overview', path: 'overview', icon: LayoutDashboard },
  { label: 'Projects', path: 'projects', icon: FolderOpen },
  { label: 'Quotes', path: 'quotes', icon: FileText },
  { label: 'Invoices', path: 'invoices', icon: CreditCard },
  { label: 'Documents', path: 'documents', icon: FolderOpen },
  { label: 'Book an Appointment', path: 'appointments', icon: Calendar },
];

export default function ClientPortalLayout({ children, contact, portalAccess, allowedSections = [], activeTab = 'overview', onTabChange, portalData }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notificationCounts, setNotificationCounts] = useState({
    messages: 0,
    documents: 0,
    contracts: 0,
    invoices: 0,
  });
  const location = useLocation();
  const navigate = useNavigate();
  const { token } = useParams();
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Calculate notification counts from portal data
  useEffect(() => {
    if (portalData) {
      // Unread messages
      const unreadMessages = (portalData.messages || []).filter(m => !m.is_read && m.sender_type !== 'client').length;
      
      // Documents needing attention
      const docsNeedingAction = (portalData.documents || []).filter(d => 
        ['Sent to Client', 'Opened', 'Awaiting Signature', 'Awaiting Approval'].includes(d.status)
      ).length;
      
      // Contracts to sign
      const contractsToSign = (portalData.contracts || []).filter(c => 
        ['Sent for Signature', 'Opened', 'Viewed'].includes(c.status)
      ).length;
      
      // Overdue invoices
      const overdueInvoices = (portalData.invoices || []).filter(inv => {
        const isOverdue = inv.due_date && new Date(inv.due_date) < new Date() && !['Paid', 'Cancelled'].includes(inv.status);
        return isOverdue;
      }).length;

      setNotificationCounts({
        messages: unreadMessages,
        documents: docsNeedingAction,
        contracts: contractsToSign,
        invoices: overdueInvoices,
      });
    }
  }, [portalData]);

  const handleLogout = () => {
    navigate('/');
  };

  const filteredNavItems = NAV_ITEMS.filter(item => {
    if (item.path === 'overview' || item.path === 'profile' || item.path === 'appointments') return true;
    if (item.path === 'projects') return allowedSections.includes('projects');
    if (item.path === 'quotes') return allowedSections.includes('quotes');
    if (item.path === 'invoices') return allowedSections.includes('invoices');
    if (item.path === 'documents') return allowedSections.includes('documents');
    if (item.path === 'payments') return allowedSections.includes('payments');
    return true;
  });

  const getNotificationCount = (path) => {
    if (path === 'documents') return notificationCounts.documents;
    if (path === 'contracts') return notificationCounts.contracts;
    if (path === 'invoices') return notificationCounts.invoices;
    return 0;
  };

  const sidebarContent = (
    <div className="flex flex-col h-full w-64 bg-gradient-to-b from-white via-[#FFFBF8] to-[#FFF9F5] border-r border-[#E5D9C9]" style={{
      boxShadow: '2px 0 16px rgba(0, 0, 0, 0.06)'
    }}>
      {/* Logo */}
      <div className="px-5 py-5 border-b border-[#E5D9C9]">
        <Link to={`/portal/${token}`} className="flex items-center gap-2">
          <div 
            className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" 
            style={{ background: 'linear-gradient(135deg, #B87333 0%, #D4A574 100%)', boxShadow: '0 4px 12px rgba(184, 115, 51, 0.2)' }}
          >
            <BookOpen className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-sm font-bold text-gray-900 leading-tight">Creative Books</p>
            <p className="text-xs text-[#B87333]">Client Portal</p>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto space-y-1">
        {filteredNavItems.map(({ label, path, icon: IconComponent }) => {
          const active = activeTab === path;
          return (
            <button
              key={path}
              type="button"
              onClick={() => {
                if (onTabChange) onTabChange(path);
              }}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                active
                  ? 'bg-gradient-to-r from-[#1A2B4A] to-[#0F1F35] text-white shadow-md'
                  : 'text-gray-700 hover:bg-[#F5EFE8]'
              }`}
            >
              <IconComponent className="w-4 h-4 flex-shrink-0" />
              <span className="flex-1 truncate">{label}</span>
              {getNotificationCount(path) > 0 && (
                <span className="inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full bg-red-500 text-white text-xs font-bold">
                  {getNotificationCount(path)}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Support Card */}
      <div className="px-3 py-4 border-t border-[#E5D9C9]">
        <div className="rounded-lg bg-gradient-to-br from-[#F5EFE8] to-[#EFE5D9] p-4 border border-[#E5D9C9]" style={{
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)'
        }}>
          <div className="flex items-center gap-2 mb-2">
            <HelpCircle className="w-4 h-4 text-[#B87333]" />
            <p className="text-xs font-bold text-gray-900">Need help?</p>
          </div>
          <p className="text-xs text-gray-600 mb-3">We're here to support your publishing journey.</p>
          <a 
            href="mailto:info@creativebooks.co.za"
            className="w-full inline-block text-center px-3 py-2 rounded-lg bg-gradient-to-r from-[#B87333] to-[#D4A574] text-white text-xs font-semibold hover:shadow-lg transition-all hover:scale-105"
          >
            Contact Support
          </a>
          <div className="mt-3 space-y-2 pt-3 border-t border-[#E5D9C9]/50">
            <a href="tel:0105003331" className="flex items-center gap-2 text-xs text-gray-700 hover:text-[#B87333] transition-colors">
              <Phone className="w-3.5 h-3.5" />
              <span>010 500 3331</span>
            </a>
            <a href="mailto:info@creativebooks.co.za" className="flex items-center gap-2 text-xs text-gray-700 hover:text-[#B87333] transition-colors">
              <Mail className="w-3.5 h-3.5" />
              <span className="truncate">info@creativebooks...</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-gradient-to-br from-white via-[#FFFBF8] to-[#FFF9F5]">
      {/* Sidebar */}
      <div className="hidden lg:block flex-shrink-0 relative z-10">{sidebarContent}</div>
      
      {/* Mobile Sidebar */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/30" onClick={() => setSidebarOpen(false)} />
          <div className="absolute left-0 top-0 bottom-0">
            <div className="relative h-full">
              <button onClick={() => setSidebarOpen(false)} className="absolute top-4 right-[-40px] p-2 bg-white rounded-lg z-10">
                <X className="w-4 h-4" />
              </button>
              {sidebarContent}
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden relative z-10">
        {/* Top Bar */}
        <div
          className="h-16 border-b flex items-center justify-between px-6"
          style={{ 
            background: 'rgba(255, 255, 255, 0.8)',
            backdropFilter: 'blur(12px)',
            borderColor: '#E5D9C9'
          }}
        >
          <div className="flex items-center gap-4 flex-1">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              {sidebarOpen ? (
                <X className="w-5 h-5 text-gray-900" />
              ) : (
                <Menu className="w-5 h-5 text-gray-900" />
              )}
            </button>
          </div>

          <div className="flex items-center gap-4">
            <NotificationBell contact={contact} portalAccess={portalAccess} />
            
            <div className="flex items-center gap-3 pl-4 border-l border-[#E5D9C9]">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#B87333] to-[#D4A574] flex items-center justify-center text-white text-xs font-bold">
                {contact?.full_name?.charAt(0)}{contact?.full_name?.split(' ')[1]?.charAt(0) || ''}
              </div>
              <div className="hidden sm:flex items-center gap-2">
                <span className="text-sm font-medium text-gray-900">{contact?.company || contact?.full_name?.split(' ')[0]}</span>
                <ChevronDown className="w-4 h-4 text-gray-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Page Content */}
        <div className="flex-1 overflow-auto">
          <div className="p-6 lg:p-8">
            <div className="max-w-7xl mx-auto">
              {children}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}