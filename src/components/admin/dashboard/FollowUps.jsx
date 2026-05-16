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
    return <div className="h-48 bg-black/5 rounded-2xl animate-pulse mb-6" />;
  }

  return (
    <div className="bg-white rounded-2xl border border-black/8 shadow-sm p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-base font-bold text-[#1A1208]">Suggested Follow-Ups</h2>
          <p className="text-xs text-black/40">Contacts needing your attention</p>
        </div>
        <Link to="/admin/submissions" className="flex items-center gap-1 text-xs text-[#B87333] hover:underline">
          <PlusCircle className="w-3.5 h-3.5" /> View inbox
        </Link>
      </div>

      {!followUps?.length ? (
        <div className="py-8 text-center">
          <div className="text-2xl mb-2">✓</div>
          <p className="text-sm font-semibold text-emerald-600">All caught up!</p>
          <p className="text-xs text-black/40 mt-1">No urgent follow-ups needed right now.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {followUps.map((f, i) => (
            <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-amber-50 border border-amber-100">
              <AlertCircle className="w-4 h-4 text-amber-500 shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-[#1A1208] truncate">{f.contact}</p>
                <p className="text-xs text-black/50">{f.reason} · {f.daysAgo}d ago</p>
              </div>
              <a
                href={`mailto:${f.email}`}
                className="flex items-center gap-1 px-3 py-1.5 bg-[#B87333] text-white text-xs rounded-lg hover:bg-[#a06428] transition-colors shrink-0"
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