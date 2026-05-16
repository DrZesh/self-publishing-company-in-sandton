import React from 'react';
import { Link } from 'react-router-dom';
import { Users, Inbox, Calculator, FolderOpen } from 'lucide-react';

function RightNowCard({ icon: Icon, value, label, sub, pulse, linkTo, color }) {
  const content = (
    <div className="bg-white rounded-2xl border border-black/8 shadow-sm p-5 hover:shadow-md transition-shadow h-full">
      <div className="flex items-center gap-3 mb-3">
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${color}`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
        <span className="text-xs font-semibold text-black/40 uppercase tracking-wide">{label}</span>
      </div>
      <div className="flex items-end gap-2">
        <div className="relative">
          <span className="text-4xl font-bold text-[#1A1208]">{value ?? '—'}</span>
          {pulse && value > 0 && (
            <span className="absolute -top-1 -right-2 w-2.5 h-2.5 bg-emerald-400 rounded-full animate-ping" />
          )}
        </div>
      </div>
      {sub && <p className="text-xs text-black/40 mt-1.5">{sub}</p>}
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
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      <RightNowCard
        icon={Inbox}
        value={metrics?.todaySubmissions ?? 0}
        label="Today's Submissions"
        sub={todayVsYesterday >= 0
          ? `+${todayVsYesterday} vs yesterday`
          : `${todayVsYesterday} vs yesterday`}
        color={todayVsYesterday >= 0 ? 'bg-[#B87333]' : 'bg-amber-500'}
        linkTo="/admin/submissions"
      />
      <RightNowCard
        icon={Users}
        value={metrics?.newSubmissions ?? 0}
        label="Unread Messages"
        sub="Waiting for response"
        color="bg-red-500"
        linkTo="/admin/submissions"
      />
      <RightNowCard
        icon={Calculator}
        value={metrics?.monthSubmissions ?? 0}
        label="Submissions This Month"
        sub={`${metrics?.lastMonthSubmissions ?? 0} last month`}
        color="bg-blue-500"
        linkTo="/admin/submissions"
      />
      <RightNowCard
        icon={FolderOpen}
        value={metrics?.openLeadsCount ?? 0}
        label="Open Leads"
        sub={`R${(metrics?.totalPipelineValue ?? 0).toLocaleString()} pipeline`}
        pulse
        color="bg-emerald-600"
        linkTo="/admin/submissions"
      />
    </div>
  );
}