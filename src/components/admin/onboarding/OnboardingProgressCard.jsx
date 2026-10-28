import { useQuery } from '@tanstack/react-query';
import { platform } from '@/api/platformClient';
import { CheckCircle, Circle, Clock, AlertCircle, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const STEP_ICONS = {
  done: CheckCircle,
  in_progress: Clock,
  pending: Circle,
  skipped: AlertCircle,
};

const STEP_COLORS = {
  done: 'text-emerald-500',
  in_progress: 'text-amber-500',
  pending: 'text-black/20',
  skipped: 'text-gray-300',
};

export default function OnboardingProgressCard({ checklistId, compact = false }) {
  const { data: checklists = [] } = useQuery({
    queryKey: ['onboarding-checklist', checklistId],
    queryFn: () => checklistId
      ? platform.entities.OnboardingChecklist.filter({ id: checklistId })
      : platform.entities.OnboardingChecklist.filter({ status: 'Active' }),
  });

  const items = checklistId ? checklists : checklists.slice(0, compact ? 3 : 10);

  if (items.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-black/8 p-5 shadow-sm text-center py-8">
        <p className="text-sm text-black/30">No active onboarding checklists</p>
        <Link to="/admin/onboarding" className="text-xs text-[#B87333] hover:underline mt-1 block">
          Manage Onboarding →
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {items.map(checklist => {
        const steps = checklist.steps || [];
        const done = steps.filter(s => s.status === 'done').length;
        const total = steps.length;
        const pct = total > 0 ? Math.round((done / total) * 100) : 0;

        return (
          <div key={checklist.id} className="bg-white rounded-2xl border border-black/8 p-5 shadow-sm">
            <div className="flex items-start justify-between mb-3">
              <div>
                <p className="text-sm font-bold text-[#1A1208]">{checklist.client_name}</p>
                {checklist.book_title && <p className="text-xs text-black/40 mt-0.5">📖 {checklist.book_title}</p>}
              </div>
              <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                checklist.status === 'Active' ? 'bg-blue-100 text-blue-700'
                : checklist.status === 'Completed' ? 'bg-emerald-100 text-emerald-700'
                : 'bg-gray-100 text-gray-600'
              }`}>
                {checklist.status}
              </span>
            </div>

            {/* Progress bar */}
            <div className="mb-3">
              <div className="flex justify-between text-xs text-black/40 mb-1">
                <span>{done}/{total} steps complete</span>
                <span className="font-bold">{pct}%</span>
              </div>
              <div className="h-2 rounded-full bg-black/5 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{
                    width: `${pct}%`,
                    background: pct === 100 ? '#10b981' : pct >= 60 ? '#f59e0b' : '#3b82f6',
                  }}
                />
              </div>
            </div>

            {/* Steps */}
            {!compact && (
              <div className="space-y-1.5">
                {steps.map(step => {
                  const Icon = STEP_ICONS[step.status] || Circle;
                  return (
                    <div key={step.key} className="flex items-center gap-2.5">
                      <Icon className={`w-4 h-4 flex-shrink-0 ${STEP_COLORS[step.status] || 'text-black/20'}`} />
                      <span className={`text-xs ${step.status === 'done' ? 'text-black/40 line-through' : 'text-black/70'}`}>
                        {step.label}
                      </span>
                      {step.status === 'done' && step.completed_at && (
                        <span className="text-[10px] text-black/25 ml-auto">
                          {new Date(step.completed_at).toLocaleDateString('en-ZA')}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            <Link to="/admin/onboarding" className="mt-3 flex items-center gap-1 text-xs text-[#B87333] hover:underline">
              Manage <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
        );
      })}
    </div>
  );
}