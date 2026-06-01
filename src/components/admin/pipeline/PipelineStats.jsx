import { TrendingUp, Trophy, XCircle, FolderPlus, BarChart2 } from 'lucide-react';

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

  const openDeals = deals.filter(d => {
    if (wonStage && d.stage_key === wonStage.key) return false;
    if (lostStage && d.stage_key === lostStage.key) return false;
    return true;
  });

  const wonThisMonth = deals.filter(d =>
    wonStage && d.stage_key === wonStage.key && d.won_at && new Date(d.won_at) >= monthStart
  );

  const lostThisMonth = deals.filter(d =>
    lostStage && d.stage_key === lostStage.key && d.lost_at && new Date(d.lost_at) >= monthStart
  );

  const projectsCreated = deals.filter(d =>
    d.linked_project_id && d.project_created_at && new Date(d.project_created_at) >= monthStart
  );

  const totalValue = openDeals.reduce((sum, d) => sum + (Number(d.deal_value) || 0), 0);

  return (
    <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
      <StatCard icon={BarChart2} label="Open Deals" value={openDeals.length}
        sub={totalValue > 0 ? `R${totalValue.toLocaleString()} total` : null}
        color="bg-gradient-to-br from-blue-500 to-blue-600" />
      <StatCard icon={TrendingUp} label="Active Value" value={`R${(totalValue/1000).toFixed(0)}k`}
        sub="open pipeline" color="bg-gradient-to-br from-violet-500 to-violet-600" />
      <StatCard icon={Trophy} label="Won This Month" value={wonThisMonth.length}
        sub="deals closed" color="bg-gradient-to-br from-emerald-500 to-emerald-600" />
      <StatCard icon={XCircle} label="Lost This Month" value={lostThisMonth.length}
        sub="deals lost" color="bg-gradient-to-br from-red-400 to-red-500" />
      <StatCard icon={FolderPlus} label="Projects Created" value={projectsCreated.length}
        sub="from won deals" color="bg-gradient-to-br from-amber-500 to-amber-600" />
    </div>
  );
}