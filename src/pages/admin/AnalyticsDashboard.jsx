import { useState, useEffect, useCallback } from 'react';
import { base44 } from '@/api/base44Client';
import AdminLayout from '@/components/admin/AdminLayout';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Users, Eye, TrendingUp, Clock, RefreshCw, Wifi, Globe, BarChart2 } from 'lucide-react';

const PROPERTY_ID = '365718361';
const COLORS = ['#B87333', '#D4A574', '#8B5E2F', '#F0C080', '#6B4423'];

function formatDuration(seconds) {
  const s = Math.round(parseFloat(seconds));
  if (s < 60) return `${s}s`;
  return `${Math.floor(s / 60)}m ${s % 60}s`;
}

function formatDate(dateStr) {
  return `${dateStr.slice(6, 8)}/${dateStr.slice(4, 6)}`;
}

function KpiCard({ icon: Icon, label, value, sub, color }) {
  const c = color || '#B87333';
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 flex items-start gap-4">
      <div className="w-11 h-11 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: c + '18' }}>
        <Icon className="w-5 h-5" style={{ color: c }} />
      </div>
      <div>
        <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">{label}</p>
        <p className="text-2xl font-bold text-gray-900 mt-0.5">{value}</p>
        {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

export default function AnalyticsDashboard() {
  const [report, setReport] = useState(null);
  const [topPages, setTopPages] = useState(null);
  const [sources, setSources] = useState(null);
  const [realtime, setRealtime] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState(null);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    const [r, p, s, rt] = await Promise.all([
      base44.functions.invoke('getAnalyticsData', { action: 'report', propertyId: PROPERTY_ID }),
      base44.functions.invoke('getAnalyticsData', { action: 'top_pages', propertyId: PROPERTY_ID }),
      base44.functions.invoke('getAnalyticsData', { action: 'sources', propertyId: PROPERTY_ID }),
      base44.functions.invoke('getAnalyticsData', { action: 'realtime', propertyId: PROPERTY_ID }),
    ]);
    setReport(r.data);
    setTopPages(p.data);
    setSources(s.data);
    setRealtime(rt.data);
    setLastRefresh(new Date());
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchAll();
    const interval = setInterval(async () => {
      const rt = await base44.functions.invoke('getAnalyticsData', { action: 'realtime', propertyId: PROPERTY_ID });
      setRealtime(rt.data);
    }, 30000);
    return () => clearInterval(interval);
  }, [fetchAll]);

  const chartData = report?.rows?.map(row => ({
    date: formatDate(row.dimensionValues[0].value),
    sessions: parseInt(row.metricValues[0].value),
    users: parseInt(row.metricValues[1].value),
    pageviews: parseInt(row.metricValues[2].value),
  })) || [];

  const totals = report?.rows?.reduce((acc, row) => ({
    sessions: acc.sessions + parseInt(row.metricValues[0].value),
    users: acc.users + parseInt(row.metricValues[1].value),
    pageviews: acc.pageviews + parseInt(row.metricValues[2].value),
    bounceSum: acc.bounceSum + parseFloat(row.metricValues[3].value),
    durationSum: acc.durationSum + parseFloat(row.metricValues[4].value),
    count: acc.count + 1,
  }), { sessions: 0, users: 0, pageviews: 0, bounceSum: 0, durationSum: 0, count: 0 }) || {};

  const avgBounce = totals.count ? Math.round((totals.bounceSum / totals.count) * 100) : 0;
  const avgDuration = totals.count ? formatDuration(totals.durationSum / totals.count) : '--';

  const sourcesData = sources?.rows?.map(row => ({
    name: row.dimensionValues[0].value,
    value: parseInt(row.metricValues[0].value),
  })) || [];

  const pagesData = topPages?.rows?.map(row => ({
    path: row.dimensionValues[0].value,
    views: parseInt(row.metricValues[0].value),
    users: parseInt(row.metricValues[1].value),
  })) || [];

  const activeUsers = realtime?.rows?.reduce((sum, row) => sum + parseInt(row.metricValues[0].value), 0) || 0;
  const realtimeByPage = realtime?.rows?.reduce((acc, row) => {
    const page = row.dimensionValues[1].value;
    acc[page] = (acc[page] || 0) + parseInt(row.metricValues[0].value);
    return acc;
  }, {}) || {};

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 font-heading">Website Analytics</h1>
            <p className="text-sm text-gray-500 mt-0.5">creativebooks.co.za — last 30 days</p>
          </div>
          <div className="flex items-center gap-3">
            {lastRefresh && (
              <span className="text-xs text-gray-400">Updated {lastRefresh.toLocaleTimeString('en-ZA', { hour: '2-digit', minute: '2-digit' })}</span>
            )}
            <button
              onClick={fetchAll}
              disabled={loading}
              className="flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </div>

        {/* Live Users Banner */}
        <div className="bg-gradient-to-r from-[#0f4c2a] to-[#1a7a42] rounded-xl p-4 flex flex-wrap items-center gap-4 text-white">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-green-400 animate-pulse" />
            <Wifi className="w-5 h-5 text-green-300" />
            <span className="text-sm font-medium">Live Right Now</span>
          </div>
          <div className="text-3xl font-bold">{activeUsers}</div>
          <div className="text-sm text-green-200">active visitor{activeUsers !== 1 ? 's' : ''} on site</div>
          {Object.keys(realtimeByPage).length > 0 && (
            <div className="ml-auto flex gap-2 flex-wrap">
              {Object.entries(realtimeByPage).slice(0, 4).map(([page, count]) => (
                <span key={page} className="text-xs bg-white/10 rounded-full px-3 py-1">
                  {page === '(not set)' ? 'Unknown' : page} {count}
                </span>
              ))}
            </div>
          )}
        </div>

        {loading && !report && (
          <div className="flex items-center justify-center h-48">
            <div className="w-8 h-8 border-4 border-gray-200 border-t-[#B87333] rounded-full animate-spin" />
          </div>
        )}

        {report && (
          <>
            {/* KPI Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <KpiCard icon={Users} label="Total Users" value={totals.users?.toLocaleString() || '--'} sub="30-day unique visitors" />
              <KpiCard icon={TrendingUp} label="Sessions" value={totals.sessions?.toLocaleString() || '--'} sub="30-day sessions" color="#2563eb" />
              <KpiCard icon={Eye} label="Page Views" value={totals.pageviews?.toLocaleString() || '--'} sub="30-day total views" color="#7c3aed" />
              <KpiCard icon={Clock} label="Avg. Session" value={avgDuration} sub={`${avgBounce}% bounce rate`} color="#059669" />
            </div>

            {/* Trend Chart */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
              <div className="flex items-center gap-2 mb-4">
                <BarChart2 className="w-4 h-4 text-[#B87333]" />
                <h2 className="text-sm font-semibold text-gray-800">Sessions &amp; Users — Last 30 Days</h2>
              </div>
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={chartData} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
                  <defs>
                    <linearGradient id="gSessions" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#B87333" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#B87333" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="gUsers" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2563eb" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#9ca3af' }} tickLine={false} axisLine={false} interval={4} />
                  <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #e5e7eb', fontSize: 12 }} />
                  <Area type="monotone" dataKey="sessions" stroke="#B87333" strokeWidth={2} fill="url(#gSessions)" name="Sessions" />
                  <Area type="monotone" dataKey="users" stroke="#2563eb" strokeWidth={2} fill="url(#gUsers)" name="Users" />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Bottom Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Traffic Sources */}
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                <div className="flex items-center gap-2 mb-4">
                  <Globe className="w-4 h-4 text-[#B87333]" />
                  <h2 className="text-sm font-semibold text-gray-800">Traffic Sources</h2>
                </div>
                <div className="flex items-center gap-4">
                  <PieChart width={160} height={160}>
                    <Pie data={sourcesData} cx={75} cy={75} innerRadius={45} outerRadius={72} dataKey="value" paddingAngle={2}>
                      {sourcesData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                    <Tooltip formatter={(v) => [v, 'Sessions']} contentStyle={{ borderRadius: 8, fontSize: 12 }} />
                  </PieChart>
                  <div className="flex-1 space-y-2">
                    {sourcesData.map((s, i) => {
                      const total = sourcesData.reduce((a, b) => a + b.value, 0);
                      const pct = total ? Math.round((s.value / total) * 100) : 0;
                      return (
                        <div key={s.name} className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: COLORS[i % COLORS.length] }} />
                          <span className="text-xs text-gray-700 flex-1 truncate">{s.name}</span>
                          <span className="text-xs font-semibold text-gray-900">{s.value}</span>
                          <span className="text-xs text-gray-400 w-8 text-right">{pct}%</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Top Pages */}
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                <div className="flex items-center gap-2 mb-4">
                  <Eye className="w-4 h-4 text-[#B87333]" />
                  <h2 className="text-sm font-semibold text-gray-800">Top Pages (30 days)</h2>
                </div>
                <div className="space-y-2.5">
                  {pagesData.map((p, i) => {
                    const maxViews = pagesData[0]?.views || 1;
                    const pct = Math.round((p.views / maxViews) * 100);
                    return (
                      <div key={p.path}>
                        <div className="flex items-center justify-between mb-0.5">
                          <span className="text-xs text-gray-700 truncate max-w-[60%]" title={p.path}>
                            <span className="text-gray-400 mr-1">{i + 1}.</span>
                            {p.path === '/' ? 'Home' : p.path}
                          </span>
                          <div className="flex gap-3 text-xs">
                            <span className="text-gray-900 font-semibold">{p.views.toLocaleString()}</span>
                            <span className="text-gray-400">{p.users} users</span>
                          </div>
                        </div>
                        <div className="h-1 bg-gray-100 rounded-full overflow-hidden">
                          <div className="h-full rounded-full bg-[#B87333]" style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </AdminLayout>
  );
}