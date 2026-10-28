import React from 'react';
import { Link } from 'react-router-dom';
import { Clock, AlertCircle, PlusCircle, Mail } from 'lucide-react';

function timeAgo(dateStr) {
  const diff = (Date.now() - new Date(dateStr)) / 1000;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

export default function FollowUps({ followUps, loading }) {
  if (loading) {
    return <div className="h-48 rounded-xl animate-pulse mb-6" style={{ background: 'rgba(34, 211, 238, 0.1)', border: '1px solid rgba(34, 211, 238, 0.2)' }} />;
  }

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
          <h2 className="text-base font-bold text-cyan-50">Suggested Follow-Ups</h2>
          <p className="text-xs text-cyan-200/50">Contacts needing your attention</p>
        </div>
        <Link to="/admin/submissions" className="flex items-center gap-1 text-xs font-semibold text-cyan-300 hover:text-cyan-200 transition-colors">
          <PlusCircle className="w-3.5 h-3.5" /> View inbox
        </Link>
      </div>

      {!followUps?.length ? (
        <div className="py-8 text-center">
          <div className="text-3xl mb-2">✓</div>
          <p className="text-sm font-bold text-emerald-400">All caught up!</p>
          <p className="text-xs text-cyan-200/40 mt-1">No urgent follow-ups needed right now.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {followUps.map((f, i) => (
            <div
              key={i}
              className="flex items-center gap-3 p-4 rounded-xl border backdrop-blur-xl transition-all hover:scale-[1.01]"
              style={{
                background: 'rgba(245, 158, 11, 0.1)',
                borderColor: 'rgba(245, 158, 11, 0.3)',
                boxShadow: '0 2px 12px rgba(245, 158, 11, 0.15)'
              }}
            >
              <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: 'rgba(245, 158, 11, 0.2)', boxShadow: '0 2px 8px rgba(245, 158, 11, 0.3)' }}>
                <AlertCircle className="w-4 h-4 text-amber-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-cyan-50 truncate">{f.contact}</p>
                <p className="text-xs text-cyan-200/50">{f.reason} · {f.daysAgo}d ago</p>
              </div>
              <a
                href={`mailto:${f.email}`}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-all"
                style={{
                  background: 'linear-gradient(135deg,#3b82f6,#60a5fa)',
                  color: 'white',
                  boxShadow: '0 2px 8px rgba(59, 130, 246, 0.4)'
                }}
              >
                <Mail className="w-3 h-3" /> Reply
              </a>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}