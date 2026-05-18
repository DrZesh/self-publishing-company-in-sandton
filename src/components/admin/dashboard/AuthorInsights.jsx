import React from 'react';
import { Link } from 'react-router-dom';
import { Users, AlertTriangle } from 'lucide-react';

const STAGE_LABELS = {
  subscriber: 'Subscribers',
  lead: 'Leads',
  customer: 'Customers',
  repeat_customer: 'Repeat',
  past_customer: 'Past',
};

const STAGE_COLORS = {
  subscriber: 'bg-blue-100 text-blue-700',
  lead: 'bg-amber-100 text-amber-700',
  customer: 'bg-emerald-100 text-emerald-700',
  repeat_customer: 'bg-[#B87333]/10 text-[#B87333]',
  past_customer: 'bg-black/5 text-black/50',
};

export default function AuthorInsights({ metrics, loading }) {
  if (loading) {
    return <div className="h-48 bg-gray-100 rounded-xl animate-pulse mb-6" />;
  }

  const stages = metrics?.contactsByStage || {};
  const total = metrics?.totalContacts || 0;

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-base font-semibold text-gray-900">Your Authors</h2>
          <p className="text-xs text-gray-400">Customer relationships at a glance</p>
        </div>
        <Link to="/admin/submissions" className="text-xs text-[#B87333] hover:underline">View contacts →</Link>
      </div>

      {total === 0 ? (
        <div className="py-8 text-center">
          <div className="text-3xl mb-2">👤</div>
          <p className="text-sm text-gray-400">Your author database is empty.</p>
          <p className="text-xs text-gray-300 mt-1">Contacts are auto-created from form submissions, or you can add them manually.</p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-[#B87333]/10 flex items-center justify-center">
              <Users className="w-6 h-6 text-[#B87333]" />
            </div>
            <div>
              <div className="text-3xl font-bold text-gray-900">{total}</div>
              <div className="text-xs text-gray-400">Total contacts in CRM</div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {Object.entries(STAGE_LABELS).map(([key, label]) => (
              <span key={key} className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${STAGE_COLORS[key]}`}>
                {label} {stages[key] || 0}
              </span>
            ))}
          </div>

          {(metrics?.atRiskContacts || 0) > 0 && (
            <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-100 rounded-xl">
              <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
              <span className="text-xs text-amber-700">
                <strong>{metrics.atRiskContacts} past customers</strong> not contacted in 6+ months. Worth re-engaging.
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}