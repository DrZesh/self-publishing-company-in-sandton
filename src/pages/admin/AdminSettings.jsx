import React, { useState, useEffect } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { BarChart2, Shield, ExternalLink, Users, Target, FileText, Columns, Mail, BookOpen, Inbox, LayoutDashboard, Search, CheckCircle } from 'lucide-react';
import { ADMIN_THEMES, getTheme, CURRENT_THEME_KEY } from '@/lib/adminTheme';

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
      base44.entities.Contact.list('-created_date', 1).catch(() => []),
      base44.entities.Lead.list('-created_date', 1).catch(() => []),
      base44.entities.Quote.list('-created_date', 1).catch(() => []),
      base44.entities.Submission.filter({ status: 'new' }).catch(() => []),
    ]).then(([contacts, leads, quotes, unread]) => {
      setCounts({
        contacts: contacts.length,
        leads: leads.filter ? leads.length : 0,
        quotes: quotes.length,
        unread: unread.length,
      });
    }).finally(() => setLoadingCounts(false));

    // Get real counts
    Promise.all([
      base44.entities.Contact.list('-created_date', 500),
      base44.entities.Lead.list('-created_date', 500),
      base44.entities.Quote.list('-created_date', 500),
    ]).then(([c, l, q]) => {
      setCounts(prev => ({ ...prev, contacts: c.length, leads: l.length, quotes: q.length }));
    }).catch(() => {});
  }, []);

  const adminPages = [
    { label: 'Dashboard', path: '/admin/dashboard', sub: 'Business overview & KPIs', icon: LayoutDashboard },
    { label: 'Submissions', path: '/admin/submissions', sub: 'Incoming enquiry inbox', icon: Inbox },
    { label: 'Leads', path: '/admin/leads', sub: 'Sales lead management', icon: Target },
    { label: 'Pipeline', path: '/admin/pipeline', sub: '15-stage production kanban', icon: Columns },
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

        {/* Theme Selector */}
        <Section title="Dashboard Theme" sub="Choose a visual style for the entire admin dashboard">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {ADMIN_THEMES.map(t => {
              const isActive = activeTheme === t.id;
              return (
                <button key={t.id} onClick={() => applyTheme(t.id)}
                  className={`relative rounded-xl p-3 border-2 transition-all text-left ${
                    isActive ? 'border-[#B87333] shadow-md' : 'border-gray-200 hover:border-gray-400'
                  }`}>
                  {/* Color swatch */}
                  <div className="w-full h-10 rounded-lg mb-2 overflow-hidden" style={{ background: t.preview }}>
                    <div className="w-1/3 h-full" style={{ background: 'rgba(255,255,255,0.15)' }} />
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm">{t.badge}</span>
                    <span className="text-xs font-semibold text-gray-800 truncate">{t.name}</span>
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
          <p className="text-xs text-black/40 mt-3">Theme applies immediately across the sidebar, backgrounds and accent colours. Refresh if any component doesn't update.</p>
        </Section>

        {/* Data Overview */}
        <Section title="Data Overview" sub="Current counts across your CRM">
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

        {/* Integrations */}
        <Section title="Integrations" sub="Connected external services powering your admin panel">
          <Row label="Google Search Console" sub="sc-domain:creativebooks.co.za — connected">
            <Link to="/admin/seo" className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg text-xs font-semibold hover:bg-emerald-100">
              <BarChart2 className="w-3.5 h-3.5" /> View
            </Link>
          </Row>
          <Row label="Resend Email" sub="Transactional emails — form notifications, estimates, quotes">
            <span className="px-3 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg text-xs font-semibold">Connected</span>
          </Row>
          <Row label="Google Reviews" sub="Live reviews fetched from Google Places API">
            <span className="px-3 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg text-xs font-semibold">Connected</span>
          </Row>
          <Row label="Google API Key" sub="Used for Places, Reviews, and Search Console">
            <span className="px-3 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg text-xs font-semibold">Set ✓</span>
          </Row>
        </Section>

        {/* Admin Pages */}
        <Section title="Admin Pages" sub="Quick links to all sections of the portal">
          {adminPages.map(item => (
            <Row key={item.path} label={item.label} sub={item.sub}>
              <Link to={item.path} className="flex items-center gap-1 text-xs text-[#B87333] hover:underline font-medium">
                Open <ExternalLink className="w-3 h-3" />
              </Link>
            </Row>
          ))}
        </Section>

        {/* Pipeline Stages Reference */}
        <Section title="Pipeline Stages" sub="The 15 production stages used in the Pipeline kanban">
          <div className="flex flex-wrap gap-1.5">
            {['New Enquiry','Information Requested','Quote in Progress','Quote Sent','Payment Pending','Project Started','Editing','Cover Design','Typesetting','Sample Queued','Sample Approved','Mass Production','Completed','Delivered','Lost'].map((stage, i) => (
              <span key={stage} className="inline-flex items-center gap-1 px-2.5 py-1 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-700">
                <span className="text-gray-300 font-mono">{i + 1}.</span> {stage}
              </span>
            ))}
          </div>
        </Section>

        {/* Security */}
        <Section title="Security & Access" sub="Admin portal access control">
          <Row label="Admin Access" sub="Only users with role='admin' can access this portal">
            <span className="px-3 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg text-xs font-semibold flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5" /> Protected
            </span>
          </Row>
          <Row label="Session" sub="Admin sessions secured via Base44 auth">
            <span className="text-xs text-black/40">Always-on</span>
          </Row>
        </Section>

        <Section title="About" sub="Creative Books SA Admin Portal">
          <div className="space-y-1.5 text-sm text-black/60">
            <p>Built on Base44 · React · Tailwind CSS · Google Search Console API</p>
            <p>Dashboard data refreshes every 60 seconds.</p>
            <p>GSC data has a 2–3 day reporting lag (Google's own delay).</p>
          </div>
        </Section>
      </div>
    </AdminLayout>
  );
}