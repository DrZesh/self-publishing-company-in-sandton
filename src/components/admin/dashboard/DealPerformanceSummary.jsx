import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { platform } from '@/api/platformClient';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from 'recharts';
import { Trophy, TrendingDown, Ghost, TrendingUp, BarChart3 } from 'lucide-react';

function fmtR(v) {
  if (!v || v === 0) return 'R0';
  if (v >= 1000000) return `R${(v / 1000000).toFixed(1)}M`;
  if (v >= 1000) return `R${Math.round(v / 1000)}k`;
  return `R${Math.round(v).toLocaleString('en-ZA')}`;
}
function fmtRFull(v) {
  if (!v || v === 0) return 'R0';
  return 'R' + Math.round(v).toLocaleString('en-ZA');
}

function StatCard({ icon: Icon, label, count, amount, color, gradient }) {
  return (
    <div className="rounded-2xl border border-white/10 p-4 flex flex-col gap-2 relative overflow-hidden backdrop-blur-xl"
      style={{ background: 'rgba(15,15,25,0.75)', boxShadow: `0 4px 24px rgba(0,0,0,0.4), 0 0 20px ${color}20` }}>
      <div className="absolute -top-4 -right-4 w-16 h-16 rounded-full opacity-20 blur-xl" style={{ background: gradient }} />
      <div className="relative flex items-center gap-2">
        <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: gradient, boxShadow: `0 2px 10px ${color}40` }}>
          <Icon className="w-3.5 h-3.5 text-white" />
        </div>
        <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">{label}</span>
      </div>
      <div className="relative">
        <p className="text-2xl font-black text-white tracking-tight leading-none">{count}</p>
        <p className="text-xs font-semibold mt-1" style={{ color }}>{fmtRFull(amount)}</p>
      </div>
    </div>
  );
}

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-xl border border-white/10 backdrop-blur-xl px-3 py-2.5"
        style={{ background: 'rgba(15,15,25,0.95)' }}>
        <p className="text-xs font-bold text-white/70 mb-1">{label}</p>
        {payload.map((p, i) => (
          <p key={i} className="text-xs font-semibold" style={{ color: p.color }}>
            {p.name}: {fmtRFull(p.value)}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function DealPerformanceSummary() {
  const { data: pipelines = [] } = useQuery({
    queryKey: ['sales-pipelines'],
    queryFn: () => platform.entities.SalesPipeline.list('-created_date', 50),
    staleTime: 30000,
  });

  const { data: allDeals = [], isLoading } = useQuery({
    queryKey: ['deal-performance-all'],
    queryFn: async () => {
      const ps = await platform.entities.SalesPipeline.list('-created_date', 50);
      if (!ps.length) return [];
      const results = await Promise.all(
        ps.map(p => platform.entities.PipelineDeal.filter({ pipeline_id: p.id }, '-updated_date', 500))
      );
      return results.flat();
    },
    staleTime: 15000,
  });

  const stats = useMemo(() => {
    // Collect all won/lost stage keys across all pipelines
    const wonKeys = new Set();
    const lostKeys = new Set();
    const ghostKeys = new Set();

    pipelines.forEach(p => {
      (p.stages || []).forEach(s => {
        if (s.isWon) wonKeys.add(s.key);
        else if (s.isLost) {
          if (/ghost/i.test(s.label || s.key)) ghostKeys.add(s.key);
          else lostKeys.add(s.key);
        } else if (/ghost/i.test(s.label || s.key)) {
          ghostKeys.add(s.key);
        }
      });
    });

    const won = allDeals.filter(d => wonKeys.has(d.stage_key));
    const lost = allDeals.filter(d => lostKeys.has(d.stage_key));
    const ghosted = allDeals.filter(d => ghostKeys.has(d.stage_key));
    const open = allDeals.filter(d => !wonKeys.has(d.stage_key) && !lostKeys.has(d.stage_key) && !ghostKeys.has(d.stage_key));

    const sumVal = arr => arr.reduce((s, d) => s + (Number(d.deal_value) || 0), 0);

    const wonAmt = sumVal(won);
    const lostAmt = sumVal(lost);
    const ghostAmt = sumVal(ghosted);
    const openAmt = sumVal(open);
    const totalAmt = sumVal(allDeals);

    const closedCount = won.length + lost.length + ghosted.length;
    const convRate = closedCount > 0 ? Math.round((won.length / closedCount) * 100) : 0;

    return { won, lost, ghosted, open, wonAmt, lostAmt, ghostAmt, openAmt, totalAmt, convRate, closedCount };
  }, [allDeals, pipelines]);

  const chartData = [
    { name: 'Won', amount: stats.wonAmt, count: stats.won.length, fill: '#10b981' },
    { name: 'Lost', amount: stats.lostAmt, count: stats.lost.length, fill: '#ef4444' },
    ...(stats.ghosted.length > 0 ? [{ name: 'Ghosted', amount: stats.ghostAmt, count: stats.ghosted.length, fill: '#64748b' }] : []),
    { name: 'Open', amount: stats.openAmt, count: stats.open.length, fill: '#6366f1' },
  ];

  return (
    <div className="rounded-2xl border border-white/10 backdrop-blur-xl p-6"
      style={{ background: 'rgba(15,15,25,0.75)', boxShadow: '0 8px 32px rgba(0,0,0,0.4)' }}>

      {/* Header */}
      <div className="flex items-center gap-2 mb-5">
        <div className="w-7 h-7 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg,#B87333,#d4944a)' }}>
          <BarChart3 className="w-4 h-4 text-white" />
        </div>
        <div>
          <h2 className="text-sm font-bold text-white">Deal Performance Summary</h2>
          <p className="text-[10px] text-white/30">All pipelines · South African Rand</p>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <span className="text-xs font-bold px-2.5 py-1 rounded-full border border-emerald-500/30 text-emerald-400"
            style={{ background: 'rgba(16,185,129,0.1)' }}>
            {stats.convRate}% win rate
          </span>
          <span className="text-xs text-white/30">{allDeals.length} total deals</span>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <StatCard icon={Trophy} label="Won" count={stats.won.length} amount={stats.wonAmt}
          color="#10b981" gradient="linear-gradient(135deg,#10b981,#34d399)" />
        <StatCard icon={TrendingDown} label="Lost" count={stats.lost.length} amount={stats.lostAmt}
          color="#ef4444" gradient="linear-gradient(135deg,#ef4444,#f87171)" />
        <StatCard icon={Ghost} label="Ghosted" count={stats.ghosted.length} amount={stats.ghostAmt}
          color="#94a3b8" gradient="linear-gradient(135deg,#64748b,#94a3b8)" />
        <StatCard icon={TrendingUp} label="Open" count={stats.open.length} amount={stats.openAmt}
          color="#6366f1" gradient="linear-gradient(135deg,#6366f1,#818cf8)" />
      </div>

      {/* Bar chart */}
      {isLoading ? (
        <div className="h-48 flex items-center justify-center">
          <div className="w-6 h-6 border-2 border-white/10 border-t-[#B87333] rounded-full animate-spin" />
        </div>
      ) : allDeals.length === 0 ? (
        <div className="h-48 flex items-center justify-center">
          <p className="text-xs text-white/30">No deal data yet</p>
        </div>
      ) : (
        <div className="h-52">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} barCategoryGap="30%" margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
              <XAxis dataKey="name" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11, fontWeight: 600 }} axisLine={false} tickLine={false} />
              <YAxis tickFormatter={v => fmtR(v)} tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10 }} axisLine={false} tickLine={false} width={48} />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.04)' }} />
              <Bar dataKey="amount" name="Deal Value" radius={[6, 6, 0, 0]}>
                {chartData.map((entry, i) => (
                  <Cell key={i} fill={entry.fill} fillOpacity={0.85} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Total row */}
      <div className="mt-4 pt-4 border-t border-white/8 flex items-center justify-between">
        <span className="text-xs text-white/30">Total Pipeline Value</span>
        <span className="font-mono text-base font-black text-white">{fmtRFull(stats.totalAmt)}</span>
      </div>
    </div>
  );
}