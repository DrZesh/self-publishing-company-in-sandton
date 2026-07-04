import React, { useState, useEffect } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { BarChart2, Shield, ExternalLink, Users, Target, FileText, Columns, Mail, BookOpen, Inbox, LayoutDashboard, Search, CheckCircle } from 'lucide-react';
import { ADMIN_THEMES, CURRENT_THEME_KEY } from '@/lib/adminTheme';

function Section({ title, sub, children }) {
  return (
    <div className="bg-white rounded-2xl border border-black/8 shadow-sm p-6 mb-5">
      <h2 className="text-base font-bold text-[#1A1208] mb-1">{title}</h2>
      {sub && <p className="text-xs text-black/40 mb-5">{sub}</p>}
      {children}
    </div>
  );
}

function Row({ label, sub, children }) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-black/5 last:border-0">
      <div className="min-w-0 mr-4">
        <p className="text-sm font-medium text-[#1A1208]">{label}</p>
        {sub && <p className="text-xs text-black/40 mt-0.5">{sub}</p>}
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  );
}

export default function AdminSettings() {
  const [counts, setCounts] = useState({});
  const [loadingCounts, setLoadingCounts] = useState(true);
  const [activeTheme, setActiveTheme] = useState(() => localStorage.getItem(CURRENT_THEME_KEY) || 'brand');

  const applyTheme = (id) => {
    localStorage.setItem(CURRENT_THEME_KEY, id);
    setActiveTheme(id);
  };

  useEffect(() => {
    Promise.all([
      base44.entities.Contact.list('-created_date', 500),
      base44.entities.Lead.list('-created_date', 500),
      base44.entities.Quote.list('-created_date', 500),
      base44.entities.Submission.filter({ status: 'new' }),
    ]).then(([contacts, leads, quotes, unread]) => {
      setCounts({
        contacts: contacts.length,
        leads: leads.length,
        quotes: quotes.length,
        unread: unread.length,
      });
    }).catch(() => {
      setCounts({ contacts: 0, leads: 0, quotes: 0, unread: 0 });
    }).finally(() => setLoadingCounts(false));
  }, []);

  const adminPages = [
    { label: 'Dashboard', path: '/admin/dashboard', sub: 'Business overview & KPIs', icon: LayoutDashboard },
    { label: 'Submissions', path: '/admin/submissions', sub: 'Incoming enquiry inbox', icon: Inbox },
    { label: 'Leads', path: '/admin/leads', sub: 'Sales lead management', icon: Target },
    { label: 'Pipeline', path: '/admin/pipeline', sub: 'Production and sales workflow', icon: Columns },
    { label: 'Quotes', path: '/admin/quotes', sub: 'Quote builder & tracking', icon: FileText },
    { label: 'Contacts', path: '/admin/contacts', sub: 'Author & client CRM', icon: Users },
    { label: 'Email Templates', path: '/admin/email-templates', sub: 'Reusable email templates', icon: Mail },
    { label: 'Services & Pricing', path: '/admin/services', sub: 'Pricing entries and service catalogue', icon: BookOpen },
    { label: 'SEO Analytics', path: '/admin/seo', sub: 'Google Search Console overview', icon: BarChart2 },
    { label: 'Search Console Tools', path: '/admin/search-console', sub: 'Full GSC toolkit', icon: Search },
  ];

  return (
    <AdminLayout>
      <div className="max-w-3xl mx-auto px-4 lg:px-6 py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-[#1A1208]">Settings</h1>
          <p className="text-sm text-black/50 mt-0.5">Admin panel configuration, integrations and portal overview</p>
        </div>

        <Section title="Dashboard Theme" sub="Choose a visual style for the entire admin dashboard">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {ADMIN_THEMES.map(theme => {
              const isActive = activeTheme === theme.id;
              return (
                <button
                  key={theme.id}
                  onClick={() => applyTheme(theme.id)}
                  className={`relative rounded-xl p-3 border-2 transition-all text-left ${
                    isActive ? 'border-[#B87333] shadow-md' : 'border-gray-200 hover:border-gray-400'
                  }`}
                >
                  <div className="w-full h-10 rounded-lg mb-2 overflow-hidden" style={{ background: theme.preview }}>
                    <div className="w-1/3 h-full" style={{ background: 'rgba(255,255,255,0.15)' }} />
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm">{theme.badge}</span>
                    <span className="text-xs font-semibold text-gray-800 truncate">{theme.name}</span>
                  </div>
                  {isActive && (
                    <div className="absolute top-2 right-2">
                      <CheckCircle className="w-4 h-4 text-[#B87333]" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
          <p className="text-xs text-black/40 mt-3">Theme applies immediately across the sidebar, backgrounds and accent colours. Refresh if any component does not update.</p>
        </Section>

        <Section title="Data Overview" sub="Current counts across your Supabase CRM">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: 'Contacts', value: counts.contacts, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
              { label: 'Leads', value: counts.leads, icon: Target, color: 'text-amber-600', bg: 'bg-amber-50' },
              { label: 'Quotes', value: counts.quotes, icon: FileText, color: 'text-[#B87333]', bg: 'bg-[#B87333]/10' },
              { label: 'Unread', value: counts.unread, icon: Inbox, color: 'text-red-600', bg: 'bg-red-50' },
            ].map(card => (
              <div key={card.label} className="rounded-xl p-4 bg-gray-50 flex items-center gap-3">
                <div className={`w-9 h-9 rounded-xl ${card.bg} flex items-center justify-center shrink-0`}>
                  <card.icon className={`w-4 h-4 ${card.color}`} />
                </div>
                <div>
                  <p className="text-xs text-black/40">{card.label}</p>
                  <p className="text-xl font-bold text-[#1A1208]">{loadingCounts ? '…' : card.value}</p>
                </div>
              </div>
            ))}
          </div>
        </Section>

        <Section title="Integrations" sub="Connected external services powering your admin panel">
          <Row label="Supabase" sub="Database, authentication, Storage and Edge Functions">
            <span className="px-3 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg text-xs font-semibold">Connected</span>
          </Row>
          <Row label="Google Search Console" sub="sc-domain:creativebooks.co.za">
            <Link to="/admin/seo" className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg text-xs font-semibold hover:bg-emerald-100">
              <BarChart2 className="w-3.5 h-3.5" /> View
            </Link>
          </Row>
          <Row label="Resend Email" sub="Transactional and automated email delivery">
            <span className="px-3 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg text-xs font-semibold">Configured server-side</span>
          </Row>
          <Row label="Google Analytics" sub="GA4 reporting and realtime analytics">
            <Link to="/admin/analytics" className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg text-xs font-semibold hover:bg-emerald-100">
              <BarChart2 className="w-3.5 h-3.5" /> View
            </Link>
          </Row>
        </Section>

        <Section title="Admin Pages" sub="Quick links to key sections of the portal">
          {adminPages.map(item => (
            <Row key={item.path} label={item.label} sub={item.sub}>
              <Link to={item.path} className="flex items-center gap-1 text-xs text-[#B87333] hover:underline font-medium">
                Open <ExternalLink className="w-3 h-3" />
              </Link>
            </Row>
          ))}
        </Section>

        <Section title="Pipeline Stages" sub="Production stages used in the CRM workflow">
          <div className="flex flex-wrap gap-1.5">
            {['New Enquiry','Information Requested','Quote in Progress','Quote Sent','Payment Pending','Project Started','Editing','Cover Design','Typesetting','Sample Queued','Sample Approved','Mass Production','Completed','Delivered','Lost'].map((stage, index) => (
              <span key={stage} className="inline-flex items-center gap-1 px-2.5 py-1 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-700">
                <span className="text-gray-300 font-mono">{index + 1}.</span> {stage}
              </span>
            ))}
          </div>
        </Section>

        <Section title="Security & Access" sub="Admin portal access control">
          <Row label="Admin Access" sub="Protected routes require an authenticated Supabase admin role">
            <span className="px-3 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg text-xs font-semibold flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5" /> Protected
            </span>
          </Row>
          <Row label="Session" sub="Admin sessions are secured through Supabase Auth">
            <span className="text-xs text-black/40">Active while authenticated</span>
          </Row>
        </Section>

        <Section title="About" sub="Creative Books SA Admin Portal">
          <div className="space-y-1.5 text-sm text-black/60">
            <p>React admin application with Supabase data, Auth, Storage and Edge Functions.</p>
            <p>Migrated modules are routed through layered compatibility adapters during cutover.</p>
            <p>Analytics and Search Console data are fetched through authenticated server functions.</p>
          </div>
        </Section>
      </div>
    </AdminLayout>
  );
}
