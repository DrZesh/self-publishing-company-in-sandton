import { TrendingUp, Trophy, XCircle, FolderPlus, BarChart2, Ghost } from 'lucide-react';

function fmtR(v) {
  if (!v || v === 0) return 'R0';
  if (v >= 1000000) return `R${(v / 1000000).toFixed(1)}M`;
  if (v >= 1000) return `R${Math.round(v / 1000)}k`;
  return `R${Math.round(v).toLocaleString('en-ZA')}`;
}

function StatCard({ icon: Icon, label, value, sub, color }) {
  return (
    <div className="rounded-2xl border border-white/70 p-4 flex items-center gap-4 transition-all hover:shadow-md hover:-translate-y-0.5"
      style={{ background: 'rgba(255,255,255,0.72)', backdropFilter: 'blur(20px)', boxShadow: '0 4px 16px rgba(0,0,0,0.05)' }}>
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${color}`}>
        <Icon className="w-5 h-5 text-white" />
      </div>
      <div className="min-w-0">
        <p className="text-2xl font-black text-slate-800 leading-none">{value}</p>
        <p className="text-xs font-semibold text-slate-500 mt-0.5">{label}</p>
        {sub && <p className="text-[10px] text-slate-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

export default function PipelineStats({ deals, pipeline }) {
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const wonStage = pipeline?.stages?.find(s => s.isWon);
  const lostStage = pipeline?.stages?.find(s => s.isLost);
  const ghostStage = pipeline?.stages?.find(s => /ghost/i.test(s.label || s.key));

  const openDeals = deals.filter(d => {
    if (wonStage && d.stage_key === wonStage.key) return false;
    if (lostStage && d.stage_key === lostStage.key) return false;
    if (ghostStage && d.stage_key === ghostStage.key) return false;
    return true;
  });

  const wonDeals = deals.filter(d => wonStage && d.stage_key === wonStage.key);
  const lostDeals = deals.filter(d => lostStage && d.stage_key === lostStage.key);
  const ghostDeals = ghostStage ? deals.filter(d => d.stage_key === ghostStage.key) : [];

  const wonThisMonth = wonDeals.filter(d => d.won_at && new Date(d.won_at) >= monthStart);
  const lostThisMonth = lostDeals.filter(d => d.lost_at && new Date(d.lost_at) >= monthStart);

  const sumVal = arr => arr.reduce((s, d) => s + (Number(d.deal_value) || 0), 0);
  const totalValue = sumVal(openDeals);
  const wonValue = sumVal(wonDeals);
  const lostValue = sumVal(lostDeals);
  const ghostValue = sumVal(ghostDeals);

  const closedCount = wonDeals.length + lostDeals.length + ghostDeals.length;
  const convRate = closedCount > 0 ? Math.round((wonDeals.length / closedCount) * 100) : 0;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
      <StatCard icon={BarChart2} label="Open Deals" value={openDeals.length}
        sub={totalValue > 0 ? fmtR(totalValue) : 'No value set'}
        color="bg-gradient-to-br from-blue-500 to-blue-600" />
      <StatCard icon={TrendingUp} label="Open Value" value={fmtR(totalValue)}
        sub="active pipeline" color="bg-gradient-to-br from-violet-500 to-violet-600" />
      <StatCard icon={Trophy} label="Won" value={wonDeals.length}
        sub={fmtR(wonValue)} color="bg-gradient-to-br from-emerald-500 to-emerald-600" />
      <StatCard icon={XCircle} label="Lost" value={lostDeals.length}
        sub={fmtR(lostValue)} color="bg-gradient-to-br from-red-400 to-red-500" />
      <StatCard icon={Ghost} label="Ghosted" value={ghostDeals.length}
        sub={ghostDeals.length > 0 ? fmtR(ghostValue) : '—'} color="bg-gradient-to-br from-slate-500 to-slate-600" />
      <StatCard icon={FolderPlus} label="Win Rate" value={`${convRate}%`}
        sub={`${wonDeals.length}w · ${lostDeals.length + ghostDeals.length}l`} color="bg-gradient-to-br from-amber-500 to-amber-600" />
    </div>
  );
}