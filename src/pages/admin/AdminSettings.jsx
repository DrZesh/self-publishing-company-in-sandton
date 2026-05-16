import React from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { Link } from 'react-router-dom';
import { BarChart2, Mail, Globe, Shield, ExternalLink } from 'lucide-react';

function Section({ title, sub, children }) {
  return (
    <div className="bg-white rounded-2xl border border-black/8 shadow-sm p-6 mb-6">
      <h2 className="text-base font-bold text-[#1A1208] mb-1">{title}</h2>
      {sub && <p className="text-xs text-black/40 mb-5">{sub}</p>}
      {children}
    </div>
  );
}

function Row({ label, sub, children }) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-black/5 last:border-0">
      <div>
        <p className="text-sm font-medium text-[#1A1208]">{label}</p>
        {sub && <p className="text-xs text-black/40 mt-0.5">{sub}</p>}
      </div>
      <div className="ml-4 shrink-0">{children}</div>
    </div>
  );
}

export default function AdminSettings() {
  return (
    <AdminLayout>
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#1A1208]">Settings</h1>
          <p className="text-sm text-black/50 mt-1">Admin panel configuration and integrations</p>
        </div>

        <Section title="Integrations" sub="Connected external services powering your admin panel">
          <Row label="Google Search Console" sub="sc-domain:creativebooks.co.za — connected">
            <Link to="/admin/seo" className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg text-xs font-semibold hover:bg-emerald-100">
              <BarChart2 className="w-3.5 h-3.5" /> View Dashboard
            </Link>
          </Row>
          <Row label="Resend Email" sub="Transactional emails (form notifications, estimates)">
            <span className="px-3 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg text-xs font-semibold">Connected</span>
          </Row>
          <Row label="Google Reviews" sub="Fetches live reviews from Google Places">
            <span className="px-3 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg text-xs font-semibold">Connected</span>
          </Row>
        </Section>

        <Section title="Admin Pages" sub="Direct links to all admin sections">
          {[
            { label: 'Dashboard', path: '/admin/dashboard', sub: 'Business overview and KPIs' },
            { label: 'Inbox', path: '/admin/submissions', sub: 'All form submissions' },
            { label: 'Leads', path: '/admin/leads', sub: 'Sales pipeline management' },
            { label: 'Contacts', path: '/admin/contacts', sub: 'Author & client CRM' },
            { label: 'SEO Analytics', path: '/admin/seo', sub: 'Google Search Console' },
            { label: 'Search Console Tools', path: '/admin/search-console', sub: 'Full GSC toolkit' },
          ].map(item => (
            <Row key={item.path} label={item.label} sub={item.sub}>
              <Link to={item.path} className="flex items-center gap-1 text-xs text-[#B87333] hover:underline">
                Open <ExternalLink className="w-3 h-3" />
              </Link>
            </Row>
          ))}
        </Section>

        <Section title="Security & Access" sub="Admin portal access control">
          <Row label="Admin Access" sub="Only users with role='admin' can access this portal">
            <span className="px-3 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg text-xs font-semibold flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5" /> Protected
            </span>
          </Row>
          <Row label="Session" sub="Admin sessions are secured via Base44 auth">
            <span className="text-xs text-black/40">Always-on</span>
          </Row>
        </Section>

        <Section title="About" sub="Creative Books SA Admin Portal">
          <div className="space-y-2 text-sm text-black/60">
            <p>Built on Base44 · Tailwind CSS · React · Google Search Console API</p>
            <p>Dashboard data refreshes automatically every 60 seconds.</p>
            <p>GSC data has a 2–3 day reporting lag (Google's own delay).</p>
          </div>
        </Section>
      </div>
    </AdminLayout>
  );
}