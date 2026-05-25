import React from 'react';
import { Link } from 'react-router-dom';
import { TrendingUp, TrendingDown, DollarSign, BarChart2, UserPlus, Clock, FileText, Send, CheckCircle2, XCircle, AlertCircle, Star } from 'lucide-react';

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

function KpiCard({ icon: Icon, color, title, value, sub, trend, linkTo, badge, badgeColor, children }) {
  const inner = (
    <div className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow h-full">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide leading-tight">{title}</span>
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${color}`}>
          <Icon className="w-4 h-4 text-white" />
        </div>
      </div>
      <div className="text-2xl font-bold text-gray-900 mb-1">{value}</div>
      {sub && <p className="text-xs text-gray-400 mb-2">{sub}</p>}
      {badge && <span className={`inline-block text-xs font-semibold px-2 py-0.5 rounded-full mb-1 ${badgeColor || 'bg-gray-100 text-gray-600'}`}>{badge}</span>}
      {trend}
      {children}
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
    <div className="mb-6 space-y-4">
      {/* Row 1 — Revenue & Pipeline */}
      <div>
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Revenue & Pipeline</p>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {isOwner ? (
            <KpiCard
              icon={DollarSign}
              color="bg-[#B87333]"
              title="Revenue This Month"
              value={`R${(metrics?.revenueThisMonth || 0).toLocaleString()}`}
              trend={<Trend current={metrics?.revenueThisMonth || 0} previous={metrics?.revenueLastMonth || 0} />}
              linkTo="/admin/quotes"
            >
              <div className="mt-3">
                <div className="flex justify-between text-xs text-gray-400 mb-1">
                  <span>Target: R{revenueTarget.toLocaleString()}</span>
                  <span>{revenueProgress}%</span>
                </div>
                <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full bg-[#B87333] rounded-full transition-all" style={{ width: `${revenueProgress}%` }} />
                </div>
                {revenueProgress >= 100
                  ? <p className="text-xs text-emerald-600 mt-1">🎉 Target hit!</p>
                  : <p className="text-xs text-gray-400 mt-1">R{(revenueTarget - (metrics?.revenueThisMonth || 0)).toLocaleString()} to target</p>
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
              linkTo="/admin/pipeline"
            />
          )}

          <KpiCard
            icon={BarChart2}
            color="bg-purple-500"
            title="Open Pipeline"
            value={`R${(metrics?.totalPipelineValue || 0).toLocaleString()}`}
            sub={`${metrics?.openLeadsCount ?? 0} open leads`}
            linkTo="/admin/pipeline"
          />

          <KpiCard
            icon={DollarSign}
            color="bg-emerald-600"
            title="Accepted Quote Value"
            value={`R${(metrics?.acceptedQuoteValue || 0).toLocaleString()}`}
            sub={`${metrics?.acceptedQuotes || 0} quotes accepted`}
            linkTo="/admin/quotes"
          />

          <KpiCard
            icon={Star}
            color="bg-amber-500"
            title="Top Requested Service"
            value={topServiceLabel}
            sub="Most requested this month"
            linkTo="/admin/leads"
          />
        </div>
      </div>

      {/* Row 2 — Leads & Enquiries */}
      <div>
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Leads & Enquiries</p>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiCard
            icon={UserPlus}
            color="bg-emerald-600"
            title="New Leads This Month"
            value={metrics?.monthLeads ?? 0}
            sub={`Conversion: ${conversionRate}% of submissions`}
            trend={<Trend current={metrics?.monthLeads || 0} previous={metrics?.lastMonthLeads || 0} />}
            linkTo="/admin/leads"
          />

          <KpiCard
            icon={CheckCircle2}
            color="bg-teal-600"
            title="Converted Leads"
            value={metrics?.convertedLeadsThisMonth ?? 0}
            sub="Won this month"
            badge={metrics?.convertedLeadsThisMonth > 0 ? '🏆 Great work!' : undefined}
            badgeColor="bg-emerald-50 text-emerald-700"
            linkTo="/admin/leads"
          />

          <KpiCard
            icon={XCircle}
            color="bg-red-400"
            title="Lost Leads"
            value={metrics?.lostLeadsThisMonth ?? 0}
            sub="Lost this month"
            linkTo="/admin/leads"
          />

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
      </div>

      {/* Row 3 — Quotes */}
      <div>
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Quotes Funnel</p>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiCard
            icon={FileText}
            color="bg-slate-500"
            title="Pending Quotes"
            value={metrics?.pendingQuotes ?? 0}
            sub="In Draft status"
            linkTo="/admin/quotes"
          />

          <KpiCard
            icon={Send}
            color="bg-blue-500"
            title="Quotes Sent"
            value={metrics?.sentQuotes ?? 0}
            sub="Awaiting client response"
            linkTo="/admin/quotes"
          />

          <KpiCard
            icon={CheckCircle2}
            color="bg-emerald-600"
            title="Quotes Accepted"
            value={metrics?.acceptedQuotes ?? 0}
            sub={`${metrics?.quoteConversionRate ?? 0}% conversion rate`}
            linkTo="/admin/quotes"
          />

          <KpiCard
            icon={AlertCircle}
            color="bg-orange-500"
            title="Expired / Declined"
            value={(metrics?.expiredQuotes || 0) + (metrics?.declinedQuotes || 0)}
            sub={`${metrics?.expiredQuotes || 0} expired · ${metrics?.declinedQuotes || 0} declined`}
            linkTo="/admin/quotes"
          />
        </div>
      </div>
    </div>
  );
}