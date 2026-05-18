import React from 'react';
import { Link } from 'react-router-dom';
import { Bell, DollarSign, TrendingUp, CheckCircle2, Calculator } from 'lucide-react';

function timeAgo(dateStr) {
  const diff = (Date.now() - new Date(dateStr)) / 1000;
  if (diff < 60) return `${Math.floor(diff)}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

const TYPE_CONFIG = {
  submission: { icon: Bell, bg: 'bg-blue-100', color: 'text-blue-600' },
  won: { icon: CheckCircle2, bg: 'bg-emerald-100', color: 'text-emerald-600' },
  pipeline: { icon: TrendingUp, bg: 'bg-[#B87333]/10', color: 'text-[#B87333]' },
  payment: { icon: DollarSign, bg: 'bg-emerald-100', color: 'text-emerald-600' },
  calculator: { icon: Calculator, bg: 'bg-purple-100', color: 'text-purple-600' },
};

export default function ActivityFeed({ activity, loading }) {
  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <div className="h-5 bg-gray-100 rounded w-32 mb-4 animate-pulse" />
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex gap-3 mb-3">
            <div className="w-8 h-8 bg-gray-100 rounded-lg animate-pulse shrink-0" />
            <div className="flex-1">
              <div className="h-4 bg-gray-100 rounded w-3/4 mb-1 animate-pulse" />
              <div className="h-3 bg-gray-100 rounded w-1/4 animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  const isEmpty = !activity?.length;

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-base font-semibold text-gray-900">Recent Activity</h2>
          <p className="text-xs text-gray-400">What's happening across Creative Books</p>
        </div>
        <Link to="/admin/submissions" className="text-xs font-medium hover:underline" style={{ color: '#B87333' }}>View all →</Link>
      </div>

      {isEmpty ? (
        <div className="py-10 text-center">
          <p className="text-sm text-black/40">No activity recorded yet. Activity appears here as submissions come in and leads move through your pipeline.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {activity.map((item, i) => {
            const cfg = TYPE_CONFIG[item.type] || TYPE_CONFIG.submission;
            const Icon = cfg.icon;
            return (
              <div key={i} className="flex items-start gap-3">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${cfg.bg}`}>
                  <Icon className={`w-4 h-4 ${cfg.color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-800 leading-snug truncate">{item.label}</p>
                  {item.sub && <p className="text-xs text-gray-400">{item.sub}</p>}
                </div>
                <div className="text-xs text-gray-400 shrink-0 whitespace-nowrap">{timeAgo(item.date)}</div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}