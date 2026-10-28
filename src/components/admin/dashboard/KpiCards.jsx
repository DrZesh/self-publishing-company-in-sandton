import React from 'react';
import { Link } from 'react-router-dom';
import { TrendingUp, TrendingDown, DollarSign, BarChart2, UserPlus, Clock, FileText, Send, CheckCircle2, XCircle, AlertCircle, Star } from 'lucide-react';
import Live3DKpiCard from './Live3DKpiCard';

function Trend({ current, previous }) {
  if (!previous || previous === 0) return null;
  const pct = Math.round(((current - previous) / previous) * 100);
  const up = pct >= 0;
  return (
    <span className={`inline-flex items-center gap-0.5 text-xs font-semibold ${up ? 'text-emerald-400' : 'text-red-400'}`}>
      {up ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
      {up ? '+' : ''}{pct}%
    </span>
  );
}

function KpiCard({ icon: Icon, gradient, title, value, sub, trend, linkTo, badge, loading }) {
  const inner = (
    <div 
      className="relative rounded-xl border p-5 overflow-hidden backdrop-blur-xl h-full transition-all duration-300 hover:scale-[1.02]"
      style={{
        background: 'rgba(15, 23, 42, 0.6)',
        borderColor: 'rgba(34, 211, 238, 0.2)',
        boxShadow: '0 4px 24px rgba(0, 0, 0, 0.4), inset 0 0 15px rgba(34, 211, 238, 0.1)'
      }}
    >
      <div className="absolute -top-4 -right-4 w-16 h-16 rounded-full opacity-15 blur-xl" style={{ background: gradient }} />
      <div className="relative">
        <div className="flex items-center justify-between mb-3">
          <span className="text-[10px] font-bold text-cyan-200/70 uppercase tracking-widest leading-tight">{title}</span>
          <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: gradient, boxShadow: '0 2px 12px rgba(34, 211, 238, 0.4)' }}>
            <Icon className="w-4 h-4 text-white" />
          </div>
        </div>
        <div className="text-xl font-bold text-cyan-50 mb-1">
          {loading ? <span className="inline-block w-20 h-5 bg-cyan-900/30 rounded animate-pulse" /> : value}
        </div>
        {sub && <p className="text-[10px] text-cyan-200/50 mb-2">{sub}</p>}
        {badge && <span className="inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full mb-1" style={{ background: 'rgba(16, 185, 129, 0.2)', color: '#34d399', border: '1px solid rgba(16, 185, 129, 0.3)' }}>{badge}</span>}
        {trend}
      </div>
    </div>
  );
  return linkTo ? <Link to={linkTo} className="block h-full">{inner}</Link> : inner;
}

export default function KpiCards({ metrics, isOwner, loading }) {
  if (loading) {
    return (
      <div className="space-y-4 mb-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => <div key={i} className="h-36 bg-gray-100 rounded-xl animate-pulse" />)}
        </div>
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

  const topServiceLabel = metrics?.topService
    ? metrics.topService.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
    : 'N/A';

  return (
    <div className="space-y-5">
      {/* Row 1 — Revenue & Pipeline (3D Live KPIs) */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <div className="w-5 h-5 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg,#22d3ee,#06b6d4)', boxShadow: '0 2px 12px rgba(34, 211, 238, 0.5)' }}>
            <DollarSign className="w-3 h-3 text-white" />
          </div>
          <span className="text-xs font-bold text-cyan-200/80 uppercase tracking-widest">Revenue & Pipeline</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {isOwner ? (
            <Live3DKpiCard
              title="Revenue This Month"
              value={`R${(metrics?.revenueThisMonth || 0).toLocaleString()}`}
              subtitle={`${revenueProgress}% of R${revenueTarget.toLocaleString()} target`}
              icon={DollarSign}
              color="#22d3ee"
              loading={loading}
            />
          ) : (
            <Live3DKpiCard
              title="Active Projects"
              value={metrics?.openLeadsCount ?? 0}
              subtitle="Currently in delivery"
              icon={BarChart2}
              color="#3b82f6"
              loading={loading}
            />
          )}

          <Live3DKpiCard
            title="Open Pipeline"
            value={`R${(metrics?.totalPipelineValue || 0).toLocaleString()}`}
            subtitle={`${metrics?.openLeadsCount ?? 0} open leads`}
            icon={BarChart2}
            color="#8b5cf6"
            loading={loading}
          />

          <Live3DKpiCard
            title="Accepted Quote Value"
            value={`R${(metrics?.acceptedQuoteValue || 0).toLocaleString()}`}
            subtitle={`${metrics?.acceptedQuotes || 0} quotes accepted`}
            icon={CheckCircle2}
            color="#10b981"
            loading={loading}
          />

          <Live3DKpiCard
            title="Top Service"
            value={topServiceLabel}
            subtitle="Most requested this month"
            icon={Star}
            color="#f59e0b"
            loading={loading}
          />
        </div>
      </div>

      {/* Row 2 — Leads & Enquiries */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <div className="w-5 h-5 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg,#10b981,#34d399)', boxShadow: '0 2px 12px rgba(16, 185, 129, 0.5)' }}>
            <UserPlus className="w-3 h-3 text-white" />
          </div>
          <span className="text-xs font-bold text-cyan-200/80 uppercase tracking-widest">Leads & Enquiries</span>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiCard
            icon={UserPlus}
            gradient="linear-gradient(135deg,#10b981,#34d399)"
            title="New Leads This Month"
            value={metrics?.monthLeads ?? 0}
            sub={`Conversion: ${conversionRate}% of submissions`}
            trend={<Trend current={metrics?.monthLeads || 0} previous={metrics?.lastMonthLeads || 0} />}
            linkTo="/admin/leads"
          />

          <KpiCard
            icon={CheckCircle2}
            gradient="linear-gradient(135deg,#059669,#34d399)"
            title="Converted Leads"
            value={metrics?.convertedLeadsThisMonth ?? 0}
            sub="Won this month"
            badge={metrics?.convertedLeadsThisMonth > 0 ? '🏆 Great work!' : undefined}
            loading={loading}
          />

          <KpiCard
            icon={XCircle}
            gradient="linear-gradient(135deg,#ef4444,#f87171)"
            title="Lost Leads"
            value={metrics?.lostLeadsThisMonth ?? 0}
            sub="Lost this month"
            loading={loading}
          />

          <KpiCard
            icon={Clock}
            gradient="linear-gradient(135deg,#f59e0b,#fbbf24)"
            title="Avg Response Time"
            value={metrics?.avgResponseHours != null ? `${metrics.avgResponseHours.toFixed(1)}h` : 'N/A'}
            sub="Benchmark: <2 hours"
            loading={loading}
          />
        </div>
      </div>

      {/* Row 3 — Quotes */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <div className="w-5 h-5 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg,#6366f1,#818cf8)', boxShadow: '0 2px 12px rgba(99, 102, 241, 0.5)' }}>
            <FileText className="w-3 h-3 text-white" />
          </div>
          <span className="text-xs font-bold text-cyan-200/80 uppercase tracking-widest">Quotes Funnel</span>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiCard
            icon={FileText}
            gradient="linear-gradient(135deg,#64748b,#94a3b8)"
            title="Pending Quotes"
            value={metrics?.pendingQuotes ?? 0}
            sub="In Draft status"
            loading={loading}
          />

          <KpiCard
            icon={Send}
            gradient="linear-gradient(135deg,#3b82f6,#60a5fa)"
            title="Quotes Sent"
            value={metrics?.sentQuotes ?? 0}
            sub="Awaiting client response"
            loading={loading}
          />

          <KpiCard
            icon={CheckCircle2}
            gradient="linear-gradient(135deg,#10b981,#34d399)"
            title="Quotes Accepted"
            value={metrics?.acceptedQuotes ?? 0}
            sub={`${metrics?.quoteConversionRate ?? 0}% conversion rate`}
            loading={loading}
          />

          <KpiCard
            icon={AlertCircle}
            gradient="linear-gradient(135deg,#f97316,#fb923c)"
            title="Expired / Declined"
            value={(metrics?.expiredQuotes || 0) + (metrics?.declinedQuotes || 0)}
            sub={`${metrics?.expiredQuotes || 0} expired · ${metrics?.declinedQuotes || 0} declined`}
            loading={loading}
          />
        </div>
      </div>
    </div>
  );
}