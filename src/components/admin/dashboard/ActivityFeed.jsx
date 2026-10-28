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
  submission: { icon: Bell, bg: 'rgba(59, 130, 246, 0.2)', color: '#60a5fa' },
  won: { icon: CheckCircle2, bg: 'rgba(16, 185, 129, 0.2)', color: '#34d399' },
  pipeline: { icon: TrendingUp, bg: 'rgba(184, 115, 51, 0.2)', color: '#d4a574' },
  payment: { icon: DollarSign, bg: 'rgba(16, 185, 129, 0.2)', color: '#34d399' },
  calculator: { icon: Calculator, bg: 'rgba(139, 92, 246, 0.2)', color: '#a78bfa' },
};

export default function ActivityFeed({ activity, loading }) {
  if (loading) {
    return (
      <div
        className="rounded-2xl border backdrop-blur-xl p-6 mb-6"
        style={{
          background: 'rgba(15, 23, 42, 0.6)',
          borderColor: 'rgba(34, 211, 238, 0.2)',
          boxShadow: '0 4px 24px rgba(0, 0, 0, 0.4)'
        }}
      >
        <div className="h-5 rounded w-32 mb-4 animate-pulse" style={{ background: 'rgba(34, 211, 238, 0.2)' }} />
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex gap-3 mb-3">
            <div className="w-8 h-8 rounded-lg animate-pulse shrink-0" style={{ background: 'rgba(34, 211, 238, 0.1)' }} />
            <div className="flex-1">
              <div className="h-4 rounded w-3/4 mb-1 animate-pulse" style={{ background: 'rgba(34, 211, 238, 0.15)' }} />
              <div className="h-3 rounded w-1/4 animate-pulse" style={{ background: 'rgba(34, 211, 238, 0.1)' }} />
            </div>
          </div>
        ))}
      </div>
    );
  }

  const isEmpty = !activity?.length;

  return (
    <div
      className="rounded-2xl border backdrop-blur-xl p-6 mb-6"
      style={{
        background: 'rgba(15, 23, 42, 0.6)',
        borderColor: 'rgba(34, 211, 238, 0.2)',
        boxShadow: '0 4px 24px rgba(0, 0, 0, 0.4)'
      }}
    >
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-base font-bold text-cyan-50">Recent Activity</h2>
          <p className="text-xs text-cyan-200/50">What's happening across Creative Books</p>
        </div>
        <Link to="/admin/leads" className="text-xs font-semibold text-cyan-300 hover:text-cyan-200 transition-colors">View all →</Link>
      </div>

      {isEmpty ? (
        <div className="py-10 text-center">
          <p className="text-sm text-cyan-200/40">No activity recorded yet. Activity appears here as submissions come in and leads move through your pipeline.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {activity.map((item, i) => {
            const cfg = TYPE_CONFIG[item.type] || TYPE_CONFIG.submission;
            const Icon = cfg.icon;
            return (
              <div key={i} className="flex items-start gap-3 p-3 rounded-xl border transition-all hover:scale-[1.01]" style={{
                background: 'rgba(15, 23, 42, 0.4)',
                borderColor: 'rgba(34, 211, 238, 0.15)'
              }}>
                <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: cfg.bg.replace('bg-', 'rgba(').replace('100', '0.2').replace(/-/g, ','), boxShadow: `0 2px 12px ${cfg.color.replace('text-', '')}40` }}>
                  <Icon className={`w-4 h-4`} style={{ color: cfg.color.replace('text-', '') }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-cyan-50 leading-snug truncate">{item.label}</p>
                  {item.sub && <p className="text-xs text-cyan-200/50">{item.sub}</p>}
                </div>
                <div className="text-xs text-cyan-200/40 shrink-0 whitespace-nowrap font-mono">{timeAgo(item.date)}</div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}