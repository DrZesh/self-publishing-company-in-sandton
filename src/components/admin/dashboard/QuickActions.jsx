import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserPlus, Users, FileText, Mail, BarChart2, Inbox } from 'lucide-react';

const ACTIONS = [
  { icon: UserPlus, label: 'New Lead', sub: 'Add a lead', to: '/admin/leads', color: 'bg-[#B87333]' },
  { icon: Users, label: 'New Contact', sub: 'Add an author/client', to: '/admin/contacts', color: 'bg-blue-500' },
  { icon: FileText, label: 'Create Quote', sub: 'Build an estimate', to: '/admin/quotes/new', color: 'bg-purple-500' },
  { icon: Mail, label: 'Send Email', sub: 'Email a contact', to: '/admin/contacts', color: 'bg-emerald-600' },
  { icon: BarChart2, label: 'SEO Report', sub: 'Search performance', to: '/admin/seo', color: 'bg-indigo-500' },
  { icon: Inbox, label: 'Submissions', sub: 'View enquiry inbox', to: '/admin/submissions', color: 'bg-amber-500' },
];

export default function QuickActions() {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
      <div className="mb-4">
        <h2 className="text-base font-semibold text-gray-900">Quick Actions</h2>
        <p className="text-xs text-gray-400">Common workflows in one click</p>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {ACTIONS.map((a, i) => {
          const Icon = a.icon;
          const inner = (
            <div className="flex flex-col items-center gap-2 p-4 rounded-lg bg-gray-50 hover:bg-gray-100 border border-gray-200 hover:border-gray-300 transition-all cursor-pointer text-center">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${a.color}`}>
                <Icon className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="text-xs font-semibold text-gray-800">{a.label}</div>
                <div className="text-xs text-gray-400">{a.sub}</div>
              </div>
            </div>
          );
          if (a.href) return <a key={i} href={a.href} target="_blank" rel="noreferrer">{inner}</a>;
          return <Link key={i} to={a.to}>{inner}</Link>;
        })}
      </div>
    </div>
  );
}