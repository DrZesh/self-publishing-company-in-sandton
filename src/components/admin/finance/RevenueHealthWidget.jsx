import { useQuery } from '@tanstack/react-query';
import { platform } from '@/api/platformClient';
import { Target, DollarSign, AlertTriangle, TrendingUp } from 'lucide-react';

const GLASS = {
  background: 'rgba(0,0,0,0.25)',
  backdropFilter: 'blur(24px)',
  border: '1px solid rgba(255,255,255,0.15)',
};

const MONTHLY_TARGET = 50000;

export default function RevenueHealthWidget() {
  const { data: payments = [] } = useQuery({
    queryKey: ['payments'],
    queryFn: () => platform.entities.Payment.list('-payment_date', 200),
  });
  const { data: invoices = [] } = useQuery({
    queryKey: ['invoices'],
    queryFn: () => platform.entities.Invoice.list('-created_date', 200),
  });
  const { data: quotes = [] } = useQuery({
    queryKey: ['quotes'],
    queryFn: () => platform.entities.Quote.list('-created_date', 100),
  });

  const now = new Date();
  const monthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const lastMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const lastMonthKey = `${lastMonthDate.getFullYear()}-${String(lastMonthDate.getMonth() + 1).padStart(2, '0')}`;

  const thisMonthRevenue = payments
    .filter(p => p.status === 'Confirmed' && (p.payment_date || p.created_date || '').startsWith(monthKey))
    .reduce((s, p) => s + (p.amount || 0), 0);

  const lastMonthRevenue = payments
    .filter(p => p.status === 'Confirmed' && (p.payment_date || p.created_date || '').startsWith(lastMonthKey))
    .reduce((s, p) => s + (p.amount || 0), 0);

  const progressPct = Math.min(Math.round((thisMonthRevenue / MONTHLY_TARGET) * 100), 100);
  const trend = lastMonthRevenue > 0 ? Math.round(((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100) : 0;

  const overdueTotal = invoices
    .filter(i => i.status === 'Overdue')
    .reduce((s, i) => s + (i.balance_due || 0), 0);

  const pipelineValue = quotes
    .filter(q => ['Sent', 'Viewed', 'Opened', 'Delivered'].includes(q.status))
    .reduce((s, q) => s + (q.total || 0), 0);

  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const daysPassed = now.getDate();
  const expectedByNow = Math.round((MONTHLY_TARGET / daysInMonth) * daysPassed);
  const onTrack = thisMonthRevenue >= expectedByNow * 0.8;

  const barColor = progressPct >= 80
    ? 'linear-gradient(90deg,#10b981,#34d399)'
    : progressPct >= 50
    ? 'linear-gradient(90deg,#f59e0b,#fbbf24)'
    : 'linear-gradient(90deg,#ef4444,#f87171)';

  return (
    <div className="rounded-2xl p-5 space-y-5" style={GLASS}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg,#10b981,#059669)' }}>
            <Target className="w-3.5 h-3.5 text-white" />
          </div>
          <h3 className="text-sm font-bold text-white">Revenue Health</h3>
        </div>
        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${onTrack ? 'bg-emerald-500/20 text-emerald-300' : 'bg-red-500/20 text-red-300'}`}>
          {onTrack ? '✓ On Track' : '⚠ Behind Target'}
        </span>
      </div>

      <div>
        <div className="flex justify-between items-end mb-2">
          <div>
            <p className="text-xs text-white/50 uppercase tracking-wide">This Month</p>
            <p className="text-2xl font-bold text-white">R {thisMonthRevenue.toLocaleString('en-ZA')}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-white/40">Target: R {MONTHLY_TARGET.toLocaleString()}</p>
            <p className={`text-sm font-bold ${trend >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              {lastMonthRevenue > 0 ? `${trend >= 0 ? '↑' : '↓'} ${Math.abs(trend)}% vs last month` : 'No prior data'}
            </p>
          </div>
        </div>
        <div className="h-3 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.1)' }}>
          <div className="h-full rounded-full transition-all duration-700" style={{ width: `${progressPct}%`, background: barColor }} />
        </div>
        <div className="flex justify-between mt-1">
          <p className="text-xs text-white/40">{progressPct}% of target</p>
          <p className="text-xs text-white/40">R {Math.max(0, MONTHLY_TARGET - thisMonthRevenue).toLocaleString()} to go</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Last Month', value: `R ${lastMonthRevenue.toLocaleString()}`, color: 'text-blue-300', Icon: DollarSign },
          { label: 'Overdue', value: `R ${overdueTotal.toLocaleString()}`, color: overdueTotal > 0 ? 'text-red-400' : 'text-emerald-300', Icon: AlertTriangle },
          { label: 'Pipeline', value: `R ${pipelineValue.toLocaleString()}`, color: 'text-amber-300', Icon: TrendingUp },
        ].map(({ label, value, color, Icon }) => (
          <div key={label} className="rounded-xl p-3 text-center" style={{ background: 'rgba(255,255,255,0.06)' }}>
            <Icon className={`w-4 h-4 mx-auto mb-1 ${color}`} />
            <p className={`text-sm font-bold ${color}`}>{value}</p>
            <p className="text-[10px] text-white/40 mt-0.5">{label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}