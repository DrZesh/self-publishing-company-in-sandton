import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AlertCircle, ChevronRight, PlusCircle } from 'lucide-react';
import { crmService } from '@/services/crmService';

function destinationFor(followUp) {
  if (followUp.type === 'submission_conversion') {
    return `/admin/submissions?id=${followUp.submission_id}`;
  }

  if (followUp.type === 'lead_followup') {
    return `/admin/leads?contact=${followUp.contact_id}`;
  }

  return '/admin/tasks';
}

export default function FollowUps() {
  const [followUps, setFollowUps] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    crmService
      .getFollowUpReminders()
      .then(result => {
        if (active) setFollowUps(result?.followUps || []);
      })
      .catch(error => {
        console.error('Failed to load suggested follow-ups:', error);
        if (active) setFollowUps([]);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  if (loading) {
    return <div className="h-48 bg-gray-100 rounded-xl animate-pulse mb-6" />;
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-base font-semibold text-gray-900">Suggested Follow-Ups</h2>
          <p className="text-xs text-gray-400">Migrated CRM records needing attention</p>
        </div>
        <Link
          to="/admin/tasks"
          className="flex items-center gap-1 text-xs font-medium hover:underline"
          style={{ color: '#B87333' }}
        >
          <PlusCircle className="w-3.5 h-3.5" /> View tasks
        </Link>
      </div>

      {!followUps.length ? (
        <div className="py-8 text-center">
          <div className="text-2xl mb-2">✓</div>
          <p className="text-sm font-semibold text-emerald-600">All caught up!</p>
          <p className="text-xs text-black/40 mt-1">No urgent follow-ups needed right now.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {followUps.slice(0, 5).map((followUp, index) => {
            const age = followUp.days_overdue || followUp.days_pending || 0;

            return (
              <Link
                key={`${followUp.type}-${followUp.task_id || followUp.lead_id || followUp.submission_id || index}`}
                to={destinationFor(followUp)}
                className="flex items-center gap-3 p-3 rounded-lg bg-amber-50 border border-amber-100 hover:border-amber-200 transition-colors"
              >
                <AlertCircle className="w-4 h-4 text-amber-500 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">{followUp.title}</p>
                  <p className="text-xs text-gray-500 truncate">{followUp.description} · {age}d</p>
                </div>
                <ChevronRight className="w-4 h-4 text-amber-500 shrink-0" />
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
