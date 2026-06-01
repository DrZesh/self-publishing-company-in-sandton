import { CheckCircle2, Circle, Clock, Mail } from 'lucide-react';
import { WORKFLOWS } from './WORKFLOWS';

export default function ProjectTimeline({ project }) {
  const stages = WORKFLOWS[project.service_type] || [];
  if (!stages.length) return <p className="text-sm text-slate-400 text-center py-6">No workflow defined for this service type.</p>;

  const currentIdx = stages.findIndex(s => s.key === project.current_stage_key);
  const history = project.stage_history || [];

  return (
    <div className="space-y-1">
      {stages.map((stage, idx) => {
        const isPast = idx < currentIdx;
        const isCurrent = idx === currentIdx;
        const isUpcoming = idx > currentIdx;
        const histEntry = history.find(h => h.stage_key === stage.key);

        return (
          <div key={stage.key} className="flex items-start gap-3 group">
            {/* Connector */}
            <div className="flex flex-col items-center flex-shrink-0 w-7">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                isPast ? 'border-emerald-400 bg-emerald-50' :
                isCurrent ? 'border-blue-500 bg-blue-50 shadow-[0_0_12px_rgba(59,130,246,0.3)]' :
                'border-slate-200 bg-white'
              }`}>
                {isPast ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> :
                 isCurrent ? <div className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse" /> :
                 <Circle className="w-3.5 h-3.5 text-slate-300" />}
              </div>
              {idx < stages.length - 1 && (
                <div className={`w-0.5 h-6 transition-colors ${isPast ? 'bg-emerald-300' : 'bg-slate-100'}`} />
              )}
            </div>
            {/* Content */}
            <div className={`flex-1 pb-2 min-w-0 ${isUpcoming ? 'opacity-50' : ''}`}>
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <p className={`text-sm font-semibold leading-tight ${
                  isCurrent ? 'text-blue-700' : isPast ? 'text-emerald-700' : 'text-slate-400'
                }`}>{stage.label}</p>
                {isCurrent && (
                  <span className="text-[9px] font-bold uppercase tracking-wider text-blue-600 bg-blue-100 px-2 py-0.5 rounded-full border border-blue-200">Current</span>
                )}
              </div>
              {histEntry && (
                <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                  <span className="text-[10px] text-slate-400 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {new Date(histEntry.updated_at).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </span>
                  {histEntry.email_sent && (
                    <span className="text-[10px] text-emerald-600 flex items-center gap-1 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100">
                      <Mail className="w-3 h-3" /> Email sent
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}