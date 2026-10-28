import { useQuery } from '@tanstack/react-query';
import { platform } from '@/api/platformClient';
import { FileText, Receipt, FolderKanban, MessageSquare, Target, Star, Clock, CheckSquare, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';

const fmt = (n) => `R ${Number(n || 0).toLocaleString('en-ZA')}`;

const GRADE_COLORS = {
  Qualified: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
  Hot: 'bg-red-500/20 text-red-300 border-red-500/30',
  Warm: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
  Cold: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
};

export default function Contact360Widget({ contactId }) {
  const { data: quotes = [] } = useQuery({
    queryKey: ['contact-quotes', contactId],
    queryFn: () => platform.entities.Quote.filter({ contact_id: contactId }),
  });
  const { data: invoices = [] } = useQuery({
    queryKey: ['contact-invoices', contactId],
    queryFn: () => platform.entities.Invoice.filter({ contact_id: contactId }),
  });
  const { data: projects = [] } = useQuery({
    queryKey: ['contact-projects', contactId],
    queryFn: () => platform.entities.Project.filter({ contact_id: contactId }),
  });
  const { data: tasks = [] } = useQuery({
    queryKey: ['contact-tasks', contactId],
    queryFn: () => platform.entities.Task.filter({ contact_id: contactId }),
  });
  const { data: scores = [] } = useQuery({
    queryKey: ['lead-score', contactId],
    queryFn: () => platform.entities.LeadScore.filter({ contact_id: contactId }),
  });

  const score = scores[0];
  const totalPaid = invoices.filter(i => i.status === 'Paid').reduce((s, i) => s + (i.total || 0), 0);
  const outstanding = invoices.filter(i => ['Sent', 'Partially Paid', 'Overdue'].includes(i.status)).reduce((s, i) => s + (i.balance_due || 0), 0);
  const openTasks = tasks.filter(t => !['Done', 'Cancelled'].includes(t.status)).length;

  const stats = [
    { label: 'Quotes', value: quotes.length, icon: FileText, color: 'text-blue-300' },
    { label: 'Invoices', value: invoices.length, icon: Receipt, color: 'text-amber-300' },
    { label: 'Projects', value: projects.length, icon: FolderKanban, color: 'text-purple-300' },
    { label: 'Open Tasks', value: openTasks, icon: CheckSquare, color: openTasks > 0 ? 'text-orange-300' : 'text-emerald-300' },
  ];

  return (
    <div className="space-y-4">
      {/* Lead Score */}
      {score && (
        <div className="bg-white rounded-2xl border border-black/8 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xs font-bold text-black/40 uppercase tracking-wide flex items-center gap-1.5">
              <Star className="w-3.5 h-3.5 text-amber-500" /> Lead Score
            </h2>
            <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${GRADE_COLORS[score.grade] || GRADE_COLORS.Cold}`}>
              {score.grade}
            </span>
          </div>
          <div className="flex items-end gap-3 mb-2">
            <span className="text-4xl font-bold text-[#1A1208]">{score.score}</span>
            <span className="text-sm text-black/40 mb-1">/100</span>
          </div>
          <div className="h-2.5 rounded-full overflow-hidden bg-black/5 mb-3">
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{
                width: `${score.score}%`,
                background: score.score >= 75 ? 'linear-gradient(90deg,#10b981,#34d399)'
                  : score.score >= 55 ? 'linear-gradient(90deg,#ef4444,#f87171)'
                  : score.score >= 30 ? 'linear-gradient(90deg,#f59e0b,#fbbf24)'
                  : 'linear-gradient(90deg,#3b82f6,#60a5fa)',
              }}
            />
          </div>
          {score.score_breakdown && (
            <div className="grid grid-cols-3 gap-1.5 text-center">
              {Object.entries(score.score_breakdown).map(([k, v]) => (
                <div key={k} className="rounded-lg p-1.5" style={{ background: 'rgba(0,0,0,0.03)' }}>
                  <p className="text-xs font-bold text-black/70">{v}</p>
                  <p className="text-[9px] text-black/35 capitalize">{k.replace(/_/g, ' ')}</p>
                </div>
              ))}
            </div>
          )}
          {score.last_calculated_at && (
            <p className="text-[10px] text-black/25 mt-2 flex items-center gap-1">
              <Clock className="w-3 h-3" /> Updated {new Date(score.last_calculated_at).toLocaleDateString('en-ZA')}
            </p>
          )}
        </div>
      )}

      {/* Stats strip */}
      <div className="grid grid-cols-2 gap-3">
        {stats.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-white rounded-2xl border border-black/8 p-4 shadow-sm flex items-center gap-3">
            <Icon className={`w-5 h-5 ${color} shrink-0`} />
            <div>
              <p className="text-xl font-bold text-[#1A1208]">{value}</p>
              <p className="text-xs text-black/40">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Financial summary */}
      <div className="bg-white rounded-2xl border border-black/8 p-5 shadow-sm">
        <h2 className="text-xs font-bold text-black/40 uppercase tracking-wide mb-3 flex items-center gap-1.5">
          <TrendingUp className="w-3.5 h-3.5 text-emerald-500" /> Financials
        </h2>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-black/50">Total Paid</span>
            <span className="font-bold text-emerald-600">{fmt(totalPaid)}</span>
          </div>
          {outstanding > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-black/50">Outstanding</span>
              <span className="font-bold text-orange-500">{fmt(outstanding)}</span>
            </div>
          )}
          <div className="flex justify-between text-sm">
            <span className="text-black/50">Total Quotes</span>
            <span className="font-bold text-blue-600">{fmt(quotes.reduce((s, q) => s + (q.total || 0), 0))}</span>
          </div>
        </div>
      </div>

      {/* Recent quotes */}
      {quotes.length > 0 && (
        <div className="bg-white rounded-2xl border border-black/8 p-5 shadow-sm">
          <h2 className="text-xs font-bold text-black/40 uppercase tracking-wide mb-3">Recent Quotes</h2>
          <div className="space-y-2">
            {quotes.slice(0, 4).map(q => (
              <div key={q.id} className="flex items-center justify-between py-1.5 border-b border-black/5 last:border-0">
                <div>
                  <p className="text-xs font-semibold text-[#1A1208]">{q.quote_number}</p>
                  <p className="text-[10px] text-black/40">{q.service_category || q.project_type || '—'}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold text-[#B87333]">{fmt(q.total)}</p>
                  <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded-full ${
                    q.status === 'Accepted' ? 'bg-emerald-100 text-emerald-700' :
                    q.status === 'Sent' ? 'bg-blue-100 text-blue-700' :
                    'bg-gray-100 text-gray-600'
                  }`}>{q.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}