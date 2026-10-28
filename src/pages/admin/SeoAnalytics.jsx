import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, BarChart2, Globe, Monitor, Smartphone, Tablet, RefreshCw, ChevronDown } from 'lucide-react';
import { platform } from '@/api/platformClient';
import { toast } from 'sonner';
import AdminLayout from '@/components/admin/AdminLayout';
import GscKpiCards from '@/components/admin/gsc/GscKpiCards';
import GscTrendChart from '@/components/admin/gsc/GscTrendChart';
import GscDateRangeSelector from '@/components/admin/gsc/GscDateRangeSelector';
import GscQueriesTable from '@/components/admin/gsc/GscQueriesTable';
import GscPagesTable from '@/components/admin/gsc/GscPagesTable';
import GscSmartInsights from '@/components/admin/gsc/GscSmartInsights';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';

function aggregateTotals(rows) {
  if (!rows?.length) return { totalClicks: 0, totalImpressions: 0, avgCtr: 0, avgPosition: 0 };
  const totalClicks = rows.reduce((s, r) => s + r.clicks, 0);
  const totalImpressions = rows.reduce((s, r) => s + r.impressions, 0);
  const avgCtr = rows.reduce((s, r) => s + r.ctr, 0) / rows.length;
  const avgPosition = rows.reduce((s, r) => s + r.position, 0) / rows.length;
  return { totalClicks, totalImpressions, avgCtr, avgPosition };
}

const DEVICE_ICONS = { DESKTOP: Monitor, MOBILE: Smartphone, TABLET: Tablet };
const DEVICE_COLORS = ['#B87333', '#93c5fd', '#86efac'];
const COUNTRY_NAMES = {
  'zaf': 'South Africa', 'usa': 'United States', 'gbr': 'United Kingdom',
  'aus': 'Australia', 'nga': 'Nigeria', 'ken': 'Kenya', 'zwe': 'Zimbabwe',
  'ind': 'India', 'can': 'Canada', 'nzl': 'New Zealand', 'deu': 'Germany',
};

export default function SeoAnalytics() {
  const [days, setDays] = useState(28);
  const [compare, setCompare] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [refreshCooldown, setRefreshCooldown] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastDate, setLastDate] = useState(null);

  const [trendRows, setTrendRows] = useState([]);
  const [queryRows, setQueryRows] = useState([]);
  const [pageRows, setPageRows] = useState([]);
  const [prevPageRows, setPrevPageRows] = useState([]);
  const [insights, setInsights] = useState(null);
  const [currentTotals, setCurrentTotals] = useState(null);
  const [previousTotals, setPreviousTotals] = useState(null);
  const [countries, setCountries] = useState([]);
  const [devices, setDevices] = useState([]);
  const [searchAppearance, setSearchAppearance] = useState([]);

  const fetchAll = useCallback(async (forceRefresh = false) => {
    setLoading(true);
    setError(null);
    try {
      const [trendRes, queriesRes, pagesRes, prevPagesRes, insightsRes, countriesRes, devicesRes, appearanceRes] = await Promise.all([
        platform.functions.invoke('searchConsoleData', { action: 'performance_compare', days, dimensions: ['date'], rowLimit: 500, forceRefresh }),
        platform.functions.invoke('searchConsoleData', { action: 'top_queries', days, rowLimit: 100, forceRefresh }),
        platform.functions.invoke('searchConsoleData', { action: 'top_pages', days, rowLimit: 100, forceRefresh }),
        platform.functions.invoke('searchConsoleData', { action: 'top_pages', days: days * 2, rowLimit: 100, forceRefresh }),
        platform.functions.invoke('searchConsoleData', { action: 'smart_insights', days, forceRefresh }),
        platform.functions.invoke('searchConsoleData', { action: 'countries', days, forceRefresh }),
        platform.functions.invoke('searchConsoleData', { action: 'devices', days, forceRefresh }),
        platform.functions.invoke('searchConsoleData', { action: 'search_appearance', days, forceRefresh }),
      ]);

      const td = trendRes.data;
      setTrendRows(td?.current?.rows || []);
      setCurrentTotals(aggregateTotals(td?.current?.rows));
      setPreviousTotals(compare ? aggregateTotals(td?.previous?.rows) : null);
      setLastDate(td?.current?.lastDate);

      setQueryRows(queriesRes.data?.rows || []);
      setPageRows(pagesRes.data?.rows || []);
      setPrevPageRows(prevPagesRes.data?.rows || []);
      setInsights(insightsRes.data);
      setCountries(countriesRes.data?.rows || []);
      setDevices(devicesRes.data?.rows || []);
      setSearchAppearance(appearanceRes.data?.rows || []);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [days, compare]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const handleRefresh = async () => {
    if (refreshCooldown) return;
    setRefreshing(true);
    setRefreshCooldown(true);
    await fetchAll(true);
    setRefreshing(false);
    toast.success('Data refreshed from Google Search Console');
    setTimeout(() => setRefreshCooldown(false), 60000);
  };

  const totalClicks = devices.reduce((s, r) => s + r.clicks, 0);
  const devicePie = devices.map(r => ({
    name: r.keys[0],
    value: r.clicks,
    pct: totalClicks ? Math.round(r.clicks / totalClicks * 100) : 0,
  }));

  return (
    <AdminLayout>
      <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 40%, #0f3460 100%)' }}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#B87333] flex items-center justify-center">
              <BarChart2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">SEO Analytics</h1>
              <p className="text-xs text-white/40">creativebooks.co.za · Google Search Console</p>
            </div>
          </div>
          <button onClick={handleRefresh} disabled={refreshing || refreshCooldown}
            className="flex items-center gap-2 px-3 py-2 border border-white/20 rounded-xl text-xs font-semibold text-white/60 hover:border-[#B87333] hover:text-[#B87333] disabled:opacity-40 transition-all">
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            {refreshing ? 'Refreshing…' : refreshCooldown ? 'Refreshed' : 'Refresh Data'}
          </button>
        </div>

        {error && (
          <div className="p-4 mb-6 rounded-xl text-sm text-red-300" style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)' }}>
            ⚠️ {error} <button onClick={() => fetchAll(true)} className="ml-2 underline">Retry</button>
          </div>
        )}

        {/* Date range */}
        <div className="rounded-2xl p-5 mb-6" style={{ background: 'rgba(255,255,255,0.07)', backdropFilter: 'blur(24px)', border: '1px solid rgba(255,255,255,0.12)' }}>
          <GscDateRangeSelector
            days={days} onDaysChange={setDays}
            compare={compare} onCompareChange={setCompare}
            onRefresh={handleRefresh} refreshing={refreshing}
            lastDate={lastDate}
          />
        </div>

        {/* KPI Cards */}
        {loading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {[...Array(4)].map((_, i) => <div key={i} className="h-28 bg-black/5 rounded-2xl animate-pulse" />)}
          </div>
        ) : (
          <div className="mb-6">
            <GscKpiCards current={currentTotals} previous={previousTotals} showComparison={compare} />
          </div>
        )}

        {/* Trend Chart */}
        <div className="rounded-2xl p-6 mb-6" style={{ background: 'rgba(255,255,255,0.07)', backdropFilter: 'blur(24px)', border: '1px solid rgba(255,255,255,0.12)' }}>
          <h2 className="text-base font-bold text-white mb-4">Traffic Trend</h2>
          {loading ? <div className="h-56 bg-black/5 rounded-xl animate-pulse" /> : <GscTrendChart rows={trendRows} />}
        </div>

        {/* Queries */}
        <div className="rounded-2xl p-6 mb-6" style={{ background: 'rgba(255,255,255,0.07)', backdropFilter: 'blur(24px)', border: '1px solid rgba(255,255,255,0.12)' }}>
          <div className="mb-4">
            <h2 className="text-base font-bold text-white">Search Queries</h2>
            <p className="text-xs text-white/40 mt-0.5">Keywords visitors used to find Creative Books SA on Google</p>
          </div>
          {loading ? <div className="h-48 bg-black/5 rounded-xl animate-pulse" /> : <GscQueriesTable rows={queryRows} days={days} />}
        </div>

        {/* Pages */}
        <div className="rounded-2xl p-6 mb-6" style={{ background: 'rgba(255,255,255,0.07)', backdropFilter: 'blur(24px)', border: '1px solid rgba(255,255,255,0.12)' }}>
          <div className="mb-4">
            <h2 className="text-base font-bold text-white">Top Pages</h2>
            <p className="text-xs text-white/40 mt-0.5">Pages receiving traffic from Google search</p>
          </div>
          {loading ? <div className="h-48 bg-black/5 rounded-xl animate-pulse" /> : <GscPagesTable rows={pageRows} prevRows={prevPageRows} days={days} />}
        </div>

        {/* Countries + Devices */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Countries */}
          <div className="rounded-2xl p-6" style={{ background: 'rgba(255,255,255,0.07)', backdropFilter: 'blur(24px)', border: '1px solid rgba(255,255,255,0.12)' }}>
            <h2 className="text-base font-bold text-white mb-4">Countries</h2>
            {loading ? <div className="h-48 rounded-xl animate-pulse" style={{ background: 'rgba(255,255,255,0.05)' }} /> : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead><tr style={{ background: 'rgba(255,255,255,0.05)' }}>
                    {['Country', 'Clicks', 'Impr.', 'CTR', 'Pos.'].map(h => (
                      <th key={h} className="px-3 py-2 text-left text-xs font-semibold text-white/40 uppercase tracking-wide">{h}</th>
                    ))}
                  </tr></thead>
                  <tbody>
                    {countries.slice(0, 20).map((r, i) => (
                      <tr key={i} className="border-t border-white/5">
                        <td className="px-3 py-2 font-medium text-white">{COUNTRY_NAMES[r.keys[0]] || r.keys[0]?.toUpperCase()}</td>
                        <td className="px-3 py-2 text-[#B87333] font-semibold">{r.clicks}</td>
                        <td className="px-3 py-2 text-white/60">{r.impressions}</td>
                        <td className="px-3 py-2 text-white/60">{(r.ctr * 100).toFixed(1)}%</td>
                        <td className="px-3 py-2 text-white/60">#{r.position.toFixed(0)}</td>
                      </tr>
                    ))}
                    {countries.length === 0 && <tr><td colSpan={5} className="px-3 py-6 text-center text-white/30 text-sm">No country data available</td></tr>}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Devices */}
          <div className="rounded-2xl p-6" style={{ background: 'rgba(255,255,255,0.07)', backdropFilter: 'blur(24px)', border: '1px solid rgba(255,255,255,0.12)' }}>
            <h2 className="text-base font-bold text-white mb-4">Devices</h2>
            {loading ? <div className="h-48 rounded-xl animate-pulse" style={{ background: 'rgba(255,255,255,0.05)' }} /> : devices.length === 0 ? (
              <div className="h-48 flex items-center justify-center text-white/30 text-sm">No device data</div>
            ) : (
              <div className="flex flex-col gap-4">
                <div className="grid grid-cols-1 gap-3">
                  {devices.map((r, i) => {
                    const DevIcon = DEVICE_ICONS[r.keys[0]] || Monitor;
                    return (
                      <div key={i} className="flex items-center gap-3 p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)' }}>
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: DEVICE_COLORS[i] + '20' }}>
                          <DevIcon className="w-4 h-4" style={{ color: DEVICE_COLORS[i] }} />
                        </div>
                        <div className="flex-1">
                          <div className="text-xs font-semibold text-white/70 capitalize">{r.keys[0]?.toLowerCase()}</div>
                          <div className="text-xs text-white/40">{r.clicks} clicks · {(r.ctr * 100).toFixed(1)}% CTR · #{r.position.toFixed(0)}</div>
                        </div>
                        <div className="text-sm font-bold text-white">{totalClicks ? Math.round(r.clicks / totalClicks * 100) : 0}%</div>
                      </div>
                    );
                  })}
                </div>
                {devicePie.length > 0 && (
                  <ResponsiveContainer width="100%" height={140}>
                    <PieChart>
                      <Pie data={devicePie} cx="50%" cy="50%" innerRadius={40} outerRadius={65} dataKey="value" paddingAngle={2}>
                        {devicePie.map((_, i) => <Cell key={i} fill={DEVICE_COLORS[i % DEVICE_COLORS.length]} />)}
                      </Pie>
                      <Tooltip formatter={(v) => [`${v} clicks`, '']} />
                      <Legend wrapperStyle={{ fontSize: 11 }} formatter={v => v.toLowerCase()} />
                    </PieChart>
                  </ResponsiveContainer>
                )}
                {totalClicks > 0 && devices.find(r => r.keys[0] === 'MOBILE')?.clicks / totalClicks > 0.6 && (
                  <div className="text-xs text-amber-300 rounded-lg px-3 py-2" style={{ background: 'rgba(251,191,36,0.15)', border: '1px solid rgba(251,191,36,0.3)' }}>
                    📱 Mobile is {Math.round(devices.find(r => r.keys[0] === 'MOBILE')?.clicks / totalClicks * 100)}% of traffic — mobile UX is critical.
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Search Appearance */}
        {searchAppearance.length > 0 && (
          <div className="rounded-2xl p-6 mb-6" style={{ background: 'rgba(255,255,255,0.07)', backdropFilter: 'blur(24px)', border: '1px solid rgba(255,255,255,0.12)' }}>
            <h2 className="text-base font-bold text-white mb-1">Search Appearance</h2>
            <p className="text-xs text-white/40 mb-4">Rich results, FAQ schema, and other enhanced appearances in Google</p>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr style={{ background: 'rgba(255,255,255,0.05)' }}>
                  {['Appearance Type', 'Clicks', 'Impressions', 'CTR'].map(h => (
                    <th key={h} className="px-4 py-2 text-left text-xs font-semibold text-white/40 uppercase tracking-wide">{h}</th>
                  ))}
                </tr></thead>
                <tbody>
                  {searchAppearance.map((r, i) => (
                    <tr key={i} className="border-t border-white/5">
                      <td className="px-4 py-2 font-medium text-white capitalize">{r.keys[0]?.replace(/_/g, ' ').toLowerCase()}</td>
                      <td className="px-4 py-2 text-[#B87333] font-semibold">{r.clicks}</td>
                      <td className="px-4 py-2 text-white/60">{r.impressions}</td>
                      <td className="px-4 py-2 text-white/60">{(r.ctr * 100).toFixed(1)}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Keyword Opportunities */}
        {!loading && queryRows.length > 0 && (() => {
          const opportunities = queryRows
            .filter(r => r.impressions >= 50 && r.ctr < 0.03 && r.position <= 20)
            .sort((a, b) => b.impressions - a.impressions)
            .slice(0, 8);
          if (!opportunities.length) return null;
          return (
            <div className="rounded-2xl p-6 mb-6" style={{ background: 'rgba(251,191,36,0.08)', backdropFilter: 'blur(24px)', border: '1px solid rgba(251,191,36,0.2)' }}>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-lg">💡</span>
                <h2 className="text-base font-bold text-white">Keyword Opportunities</h2>
              </div>
              <p className="text-xs text-white/40 mb-4">High-impression queries with low CTR — improving titles/meta descriptions here could drive more clicks</p>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead><tr style={{ background: 'rgba(251,191,36,0.08)' }}>
                    {['Query', 'Impressions', 'Clicks', 'CTR', 'Position'].map(h => (
                      <th key={h} className="px-3 py-2 text-left text-xs font-semibold text-white/40 uppercase tracking-wide">{h}</th>
                    ))}
                  </tr></thead>
                  <tbody>
                    {opportunities.map((r, i) => (
                      <tr key={i} className="border-t border-white/5 hover:bg-white/5 transition-colors">
                        <td className="px-3 py-2 font-medium text-white max-w-[240px] truncate">{r.keys[0]}</td>
                        <td className="px-3 py-2 font-semibold text-[#B87333]">{r.impressions.toLocaleString()}</td>
                        <td className="px-3 py-2 text-white/60">{r.clicks}</td>
                        <td className="px-3 py-2">
                          <span className="px-2 py-0.5 bg-red-500/20 text-red-300 rounded text-xs font-semibold">{(r.ctr * 100).toFixed(1)}%</span>
                        </td>
                        <td className="px-3 py-2 text-white/60">#{r.position.toFixed(1)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          );
        })()}

        {/* Smart Insights */}
        <div className="mb-6">
          <h2 className="text-base font-bold text-white mb-4">Smart Insights</h2>
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[...Array(2)].map((_, i) => <div key={i} className="h-48 bg-black/5 rounded-2xl animate-pulse" />)}
            </div>
          ) : (
            <GscSmartInsights insights={insights} />
          )}
        </div>

        {/* Competitor tracking placeholder */}
        <div className="rounded-2xl p-6 mb-6" style={{ background: 'rgba(255,255,255,0.07)', backdropFilter: 'blur(24px)', border: '1px solid rgba(255,255,255,0.12)' }}>
          <div className="flex items-center gap-2 mb-2">
            <h2 className="text-base font-bold text-white">Competitor Tracking</h2>
            <span className="text-xs text-white/40 px-2 py-0.5 rounded-full" style={{ background: 'rgba(255,255,255,0.08)' }}>Coming soon</span>
          </div>
          <p className="text-sm text-white/40">Side-by-side impression/position data for competitor domains will be added in a future update. The GSC API does not provide direct competitor data.</p>
        </div>
      </div>
      </div>
    </AdminLayout>
  );
}