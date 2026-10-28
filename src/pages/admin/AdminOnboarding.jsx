import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { platform } from '@/api/platformClient';
import AdminLayout from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import {
  ClipboardList, CheckCircle2, Circle, Clock, AlertTriangle,
  ChevronDown, ChevronUp, Loader2, Users, TrendingUp, SkipForward
} from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

const STEP_ICONS = {
  done: <CheckCircle2 className="w-4 h-4 text-green-500" />,
  in_progress: <Clock className="w-4 h-4 text-amber-500" />,
  pending: <Circle className="w-4 h-4 text-gray-300" />,
  skipped: <SkipForward className="w-4 h-4 text-gray-400" />,
};

const STATUS_COLORS = {
  Active: 'bg-blue-50 text-blue-700',
  Completed: 'bg-green-50 text-green-700',
  Stalled: 'bg-amber-50 text-amber-700',
  Cancelled: 'bg-red-50 text-red-600',
};

function ChecklistCard({ checklist, onStepUpdate }) {
  const [expanded, setExpanded] = useState(false);
  const [loading, setLoading] = useState(null);

  const handleStep = async (stepKey, newStatus) => {
    setLoading(stepKey);
    const res = await platform.functions.invoke('onboardingActions', {
      action: 'update_step',
      checklist_id: checklist.id,
      step_key: stepKey,
      status: newStatus,
    });
    setLoading(null);
    if (res.data?.success) {
      toast.success(`Step updated`);
      onStepUpdate();
    }
  };

  const steps = checklist.steps || [];
  const progress = checklist.progress_percent || 0;
  const doneCount = steps.filter(s => ['done', 'skipped'].includes(s.status)).length;

  return (
    <div className={`bg-white rounded-xl border ${checklist.status === 'Completed' ? 'border-green-100' : 'border-gray-100'} overflow-hidden`}>
      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="font-semibold text-gray-900">{checklist.client_name || 'Unknown Client'}</p>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[checklist.status] || 'bg-gray-100 text-gray-600'}`}>
                {checklist.status}
              </span>
            </div>
            {checklist.book_title && <p className="text-xs text-gray-500 mt-0.5">{checklist.book_title}</p>}
            <div className="flex items-center gap-3 mt-2">
              <div className="flex-1 bg-gray-100 rounded-full h-2 max-w-xs">
                <div className="bg-[#B87333] h-2 rounded-full transition-all" style={{ width: `${progress}%` }} />
              </div>
              <span className="text-xs text-gray-500 flex-shrink-0">{doneCount}/{steps.length} steps · {progress}%</span>
            </div>
          </div>
          <button onClick={() => setExpanded(e => !e)} className="p-1.5 hover:bg-gray-50 rounded-lg text-gray-400">
            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {expanded && (
        <div className="border-t border-gray-50 px-4 pb-4 pt-2 space-y-1.5">
          {steps.map(step => (
            <div key={step.key} className="flex items-center gap-3">
              <div className="flex-shrink-0">{STEP_ICONS[step.status] || STEP_ICONS.pending}</div>
              <span className={`flex-1 text-sm ${step.status === 'done' ? 'line-through text-gray-400' : 'text-gray-700'}`}>
                {step.label}
              </span>
              {step.status !== 'done' && (
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleStep(step.key, 'done')}
                    disabled={loading === step.key}
                    className="text-xs px-2 py-0.5 bg-green-50 text-green-700 hover:bg-green-100 rounded-lg transition-colors"
                  >
                    {loading === step.key ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Done'}
                  </button>
                  {step.status !== 'skipped' && (
                    <button
                      onClick={() => handleStep(step.key, 'skipped')}
                      className="text-xs px-2 py-0.5 bg-gray-50 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      Skip
                    </button>
                  )}
                </div>
              )}
              {step.status === 'done' && step.completed_at && (
                <span className="text-xs text-gray-400">{format(new Date(step.completed_at), 'dd MMM')}</span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function AdminOnboarding() {
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState('Active');

  const { data: checklists = [], isLoading } = useQuery({
    queryKey: ['onboarding-checklists'],
    queryFn: async () => {
      const res = await platform.functions.invoke('onboardingActions', { action: 'list_active' });
      return res.data?.checklists || [];
    },
  });

  const filtered = filter === 'All' ? checklists : checklists.filter(c => c.status === filter);

  const total = checklists.length;
  const completed = checklists.filter(c => c.status === 'Completed').length;
  const stalled = checklists.filter(c => c.status === 'Stalled').length;
  const avgProgress = total ? Math.round(checklists.reduce((s, c) => s + (c.progress_percent || 0), 0) / total) : 0;

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <ClipboardList className="w-6 h-6 text-[#B87333]" /> Client Onboarding
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">Track the onboarding progress of every new client from quote to kickoff</p>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { icon: Users, label: 'Total Active', value: total - completed },
            { icon: CheckCircle2, label: 'Completed', value: completed },
            { icon: AlertTriangle, label: 'Stalled', value: stalled },
            { icon: TrendingUp, label: 'Avg Progress', value: `${avgProgress}%` },
          ].map(({ icon: Icon, label, value }) => (
            <div key={label} className="bg-white rounded-xl border border-gray-100 p-4 flex items-center gap-3">
              <div className="w-9 h-9 bg-[#B87333]/10 rounded-xl flex items-center justify-center">
                <Icon className="w-4 h-4 text-[#B87333]" />
              </div>
              <div>
                <p className="text-xl font-bold text-gray-900">{value}</p>
                <p className="text-xs text-gray-500">{label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex gap-2">
          {['Active', 'Completed', 'Stalled', 'All'].map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-3 py-1.5 text-sm rounded-lg font-medium transition-colors ${filter === f ? 'bg-[#B87333] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
              {f}
            </button>
          ))}
        </div>

        {/* Checklists */}
        {isLoading ? (
          <div className="flex justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-[#B87333]" /></div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-200">
            <ClipboardList className="w-12 h-12 mx-auto text-gray-300 mb-3" />
            <p className="font-semibold text-gray-600">No checklists found</p>
            <p className="text-sm text-gray-400 mt-1">Checklists are auto-created when a quote is accepted</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map(c => (
              <ChecklistCard
                key={c.id}
                checklist={c}
                onStepUpdate={() => queryClient.invalidateQueries({ queryKey: ['onboarding-checklists'] })}
              />
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}