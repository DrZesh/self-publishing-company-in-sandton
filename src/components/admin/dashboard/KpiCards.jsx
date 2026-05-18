import React from 'react';
import { Link } from 'react-router-dom';
import { TrendingUp, TrendingDown, DollarSign, BarChart2, UserPlus, Clock } from 'lucide-react';

function Trend({ current, previous }) {
  if (!previous || previous === 0) return null;
  const pct = Math.round(((current - previous) / previous) * 100);
  const up = pct >= 0;
  return (
    <span className={`inline-flex items-center gap-0.5 text-xs font-semibold ${up ? 'text-emerald-600' : 'text-red-500'}`}>
      {up ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
      {up ? '+' : ''}{pct}% vs last month
    </span>
  );
}

function KpiCard({ icon: Icon, color, title, value, sub, trend, linkTo, children }) {
  const inner = (
    <div className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow h-full">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{title}</span>
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${color}`}>
          <Icon className="w-4 h-4 text-white" />
        </div>
      </div>
      <div className="text-2xl font-bold text-gray-900 mb-1">{value}</div>
      {sub && <p className="text-xs text-gray-400 mb-2">{sub}</p>}
      {trend}
      {children}
    </div>
  );
  return linkTo ? <Link to={linkTo}>{inner}</Link> : inner;
}

export default function KpiCards({ metrics, isOwner, loading }) {
  if (loading) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[...Array(4)].map((_, i) => <div key={i} className="h-40 bg-black/5 rounded-2xl animate-pulse" />)}
      </div>
    );
  }

  const revenueTarget = 150000;
  const revenueProgress = Math.min(100, Math.round(((metrics?.revenueThisMonth || 0) / revenueTarget) * 100));
  const conversionRate = metrics?.monthSubmissions > 0
    ? Math.round((metrics?.monthLeads / metrics?.monthSubmissions) * 100)
    : 0;

  const responseColor = !metrics?.avgResponseHours ? 'text-black/40'
    : metrics.avgResponseHours < 2 ? 'text-emerald-600'
    : metrics.avgResponseHours < 8 ? 'text-amber-500'
    : 'text-red-500';

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {/* Revenue — owner only */}
      {isOwner ? (
        <KpiCard
          icon={DollarSign}
          color="bg-[#B87333]"
          title="Revenue This Month"
          value={`R${(metrics?.revenueThisMonth || 0).toLocaleString()}`}
          trend={<Trend current={metrics?.revenueThisMonth || 0} previous={metrics?.revenueLastMonth || 0} />}
          linkTo="/admin/submissions"
        >
          <div className="mt-3">
            <div className="flex justify-between text-xs text-black/40 mb-1">
              <span>Target: R{revenueTarget.toLocaleString()}</span>
              <span>{revenueProgress}%</span>
            </div>
            <div className="h-1.5 bg-black/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-[#B87333] rounded-full transition-all"
                style={{ width: `${revenueProgress}%` }}
              />
            </div>
            {revenueProgress >= 100
              ? <p className="text-xs text-emerald-600 mt-1">🎉 Target hit!</p>
              : <p className="text-xs text-black/40 mt-1">R{(revenueTarget - (metrics?.revenueThisMonth || 0)).toLocaleString()} to target</p>
            }
          </div>
        </KpiCard>
      ) : (
        <KpiCard
          icon={BarChart2}
          color="bg-blue-500"
          title="Active Projects"
          value={metrics?.openLeadsCount ?? 0}
          sub="Currently in delivery"
          linkTo="/admin/submissions"
        />
      )}

      {/* Pipeline value */}
      <KpiCard
        icon={BarChart2}
        color="bg-purple-500"
        title="Open Pipeline"
        value={`R${(metrics?.totalPipelineValue || 0).toLocaleString()}`}
        sub={`${metrics?.openLeadsCount ?? 0} open leads`}
        trend={<Trend current={metrics?.openLeadsCount || 0} previous={Math.max(0, (metrics?.openLeadsCount || 0) - 2)} />}
        linkTo="/admin/submissions"
      />

      {/* New leads */}
      <KpiCard
        icon={UserPlus}
        color="bg-emerald-600"
        title="New Leads This Month"
        value={metrics?.monthLeads ?? 0}
        sub={`Conversion: ${conversionRate}% of submissions`}
        trend={<Trend current={metrics?.monthLeads || 0} previous={metrics?.lastMonthLeads || 0} />}
        linkTo="/admin/submissions"
      />

      {/* Response time */}
      <KpiCard
        icon={Clock}
        color="bg-amber-500"
        title="Avg Response Time"
        value={metrics?.avgResponseHours != null ? `${metrics.avgResponseHours.toFixed(1)}h` : 'N/A'}
        sub="Benchmark: <2 hours"
        linkTo="/admin/submissions"
      >
        {metrics?.avgResponseHours != null && (
          <p className={`text-xs font-semibold mt-1 ${responseColor}`}>
            {metrics.avgResponseHours < 2 ? '✓ Excellent' : metrics.avgResponseHours < 8 ? '⚠ Needs improvement' : '✗ Too slow'}
          </p>
        )}
      </KpiCard>
    </div>
  );
}