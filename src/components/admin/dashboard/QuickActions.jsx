import React from 'react';
import { Link } from 'react-router-dom';
import { UserPlus, Users, FileText, Mail, BarChart2, Phone } from 'lucide-react';

const ACTIONS = [
  { icon: UserPlus, label: 'Add New Lead', sub: 'Start a deal', to: '/admin/submissions', color: 'bg-[#B87333]' },
  { icon: Users, label: 'Add Contact', sub: 'New author or client', to: '/admin/submissions', color: 'bg-blue-500' },
  { icon: FileText, label: 'Create Quote', sub: 'Build an estimate', to: '/calculator', color: 'bg-purple-500' },
  { icon: Mail, label: 'Send Email', sub: 'Compose message', href: 'mailto:', color: 'bg-emerald-600' },
  { icon: BarChart2, label: 'SEO Report', sub: 'Search performance', to: '/admin/seo', color: 'bg-indigo-500' },
  { icon: Phone, label: 'Log Activity', sub: 'Call, email, meeting', to: '/admin/submissions', color: 'bg-amber-500' },
];

export default function QuickActions() {
  return (
    <div className="bg-white rounded-2xl border border-black/8 shadow-sm p-6 mb-6">
      <div className="mb-4">
        <h2 className="text-base font-bold text-[#1A1208]">Quick Actions</h2>
        <p className="text-xs text-black/40">Common workflows in one click</p>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {ACTIONS.map((a, i) => {
          const Icon = a.icon;
          const inner = (
            <div className="flex flex-col items-center gap-2 p-4 rounded-xl bg-[#F9F7F2] hover:bg-[#f0ece4] border border-black/5 hover:border-[#B87333]/30 transition-all cursor-pointer text-center">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${a.color}`}>
                <Icon className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="text-xs font-bold text-[#1A1208]">{a.label}</div>
                <div className="text-xs text-black/40">{a.sub}</div>
              </div>
            </div>
          );
          if (a.href) return <a key={i} href={a.href}>{inner}</a>;
          return <Link key={i} to={a.to}>{inner}</Link>;
        })}
      </div>
    </div>
  );
}