import React from 'react';
import { Link } from 'react-router-dom';
import { Users, Inbox, Calculator, FolderOpen } from 'lucide-react';

function RightNowCard({ icon: Icon, value, label, sub, pulse, linkTo, color, accent }) {
  const content = (
    <div className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow h-full" style={{ borderLeft: `4px solid ${accent || '#B87333'}` }}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{label}</span>
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${color}`}>
          <Icon className="w-4 h-4 text-white" />
        </div>
      </div>
      <div className="relative inline-flex items-center gap-2">
        <span className="text-3xl font-bold text-gray-900">{value ?? '—'}</span>
        {pulse && value > 0 && (
          <span className="w-2.5 h-2.5 bg-emerald-400 rounded-full animate-ping" />
        )}
      </div>
      {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
    </div>
  );

  if (linkTo) return <Link to={linkTo} className="block">{content}</Link>;
  return content;
}

export default function RightNowStrip({ metrics, loading }) {
  const todayVsYesterday = metrics
    ? metrics.todaySubmissions - metrics.yesterdaySubmissions
    : 0;

  if (loading) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-32 bg-black/5 rounded-2xl animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <RightNowCard
        icon={Inbox}
        value={metrics?.todaySubmissions ?? 0}
        label="Today's Submissions"
        sub={todayVsYesterday >= 0 ? `+${todayVsYesterday} vs yesterday` : `${todayVsYesterday} vs yesterday`}
        color="bg-[#B87333]"
        accent="#B87333"
        linkTo="/admin/submissions"
      />
      <RightNowCard
        icon={Users}
        value={metrics?.newSubmissions ?? 0}
        label="Unread Messages"
        sub="Waiting for response"
        color="bg-red-500"
        accent="#ef4444"
        linkTo="/admin/submissions"
      />
      <RightNowCard
        icon={Calculator}
        value={metrics?.monthSubmissions ?? 0}
        label="Submissions This Month"
        sub={`${metrics?.lastMonthSubmissions ?? 0} last month`}
        color="bg-blue-500"
        accent="#3b82f6"
        linkTo="/admin/submissions"
      />
      <RightNowCard
        icon={FolderOpen}
        value={metrics?.openLeadsCount ?? 0}
        label="Open Leads"
        sub={`R${(metrics?.totalPipelineValue ?? 0).toLocaleString()} pipeline`}
        pulse
        color="bg-emerald-600"
        accent="#059669"
        linkTo="/admin/submissions"
      />
    </div>
  );
}