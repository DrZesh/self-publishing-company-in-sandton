import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, ChevronUp, BarChart2, ExternalLink } from 'lucide-react';
import { platform } from '@/api/platformClient';
import { toast } from 'sonner';
import GscKpiCards from './GscKpiCards';
import GscTrendChart from './GscTrendChart';
import GscQueriesTable from './GscQueriesTable';
import GscPagesTable from './GscPagesTable';
import GscSmartInsights from './GscSmartInsights';
import GscDateRangeSelector from './GscDateRangeSelector';

function aggregateTotals(rows) {
  if (!rows || rows.length === 0) return { totalClicks: 0, totalImpressions: 0, avgCtr: 0, avgPosition: 0 };
  const totalClicks = rows.reduce((s, r) => s + r.clicks, 0);
  const totalImpressions = rows.reduce((s, r) => s + r.impressions, 0);
  const avgCtr = rows.reduce((s, r) => s + r.ctr, 0) / rows.length;
  const avgPosition = rows.reduce((s, r) => s + r.position, 0) / rows.length;
  return { totalClicks, totalImpressions, avgCtr, avgPosition };
}

export default function GscDashboardSection() {
  const [collapsed, setCollapsed] = useState(false);
  const [days, setDays] = useState(28);
  const [compare, setCompare] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [refreshCooldown, setRefreshCooldown] = useState(false);
  const [error, setError] = useState(null);
  const [lastDate, setLastDate] = useState(null);

  const [trendRows, setTrendRows] = useState([]);
  const [queryRows, setQueryRows] = useState([]);
  const [pageRows, setPageRows] = useState([]);
  const [insights, setInsights] = useState(null);
  const [currentTotals, setCurrentTotals] = useState(null);
  const [previousTotals, setPreviousTotals] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchAll = useCallback(async (forceRefresh = false) => {
    setLoading(true);
    setError(null);
    try {
      const [trendRes, queriesRes, pagesRes, insightsRes] = await Promise.all([
        platform.functions.invoke('searchConsoleData', { action: 'performance_compare', days, dimensions: ['date'], rowLimit: 500, forceRefresh }),
        platform.functions.invoke('searchConsoleData', { action: 'top_queries', days, rowLimit: 10, forceRefresh }),
        platform.functions.invoke('searchConsoleData', { action: 'top_pages', days, rowLimit: 10, forceRefresh }),
        platform.functions.invoke('searchConsoleData', { action: 'smart_insights', days, forceRefresh }),
      ]);

      const trendData = trendRes.data;
      setTrendRows(trendData?.current?.rows || []);
      setCurrentTotals(aggregateTotals(trendData?.current?.rows));
      setPreviousTotals(compare ? aggregateTotals(trendData?.previous?.rows) : null);
      setLastDate(trendData?.current?.lastDate);

      setQueryRows(queriesRes.data?.rows || []);
      setPageRows(pagesRes.data?.rows || []);
      setInsights(insightsRes.data);
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

  const totalImpressions = currentTotals?.totalImpressions || 0;
  const notEnoughData = !loading && !error && totalImpressions < 100;

  return (
    <div className="bg-white rounded-2xl border border-black/8 shadow-sm mb-6">
      {/* Section Header */}
      <div className="flex items-center justify-between p-5 border-b border-black/8">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#B87333] flex items-center justify-center">
            <BarChart2 className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-[#1A1208]">Search Console</h2>
            <p className="text-xs text-black/40">Google organic search performance — creativebooks.co.za</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/admin/seo" className="text-xs text-[#B87333] hover:underline flex items-center gap-1">
            Open full dashboard <ExternalLink className="w-3 h-3" />
          </Link>
          <button onClick={() => setCollapsed(!collapsed)} className="text-black/40 hover:text-black/70 transition-colors">
            {collapsed ? <ChevronDown className="w-5 h-5" /> : <ChevronUp className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {!collapsed && (
        <div className="p-5 space-y-6">
          {/* Date range selector */}
          <GscDateRangeSelector
            days={days} onDaysChange={setDays}
            compare={compare} onCompareChange={setCompare}
            onRefresh={handleRefresh} refreshing={refreshing}
            lastDate={lastDate}
          />

          {/* Error */}
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
              ⚠️ Search Console data unavailable: {error}
              <button onClick={() => fetchAll(true)} className="ml-3 underline">Retry</button>
            </div>
          )}

          {/* Loading skeleton */}
          {loading && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-24 bg-black/5 rounded-2xl animate-pulse" />
                ))}
              </div>
              <div className="h-44 bg-black/5 rounded-2xl animate-pulse" />
            </div>
          )}

          {/* Not enough data */}
          {notEnoughData && (
            <div className="py-12 text-center">
              <div className="text-3xl mb-3">📊</div>
              <div className="text-sm font-semibold text-black/50">Not enough data yet</div>
              <div className="text-xs text-black/30 mt-1">SEO data accumulates over time — check back in a few weeks as Google indexes the site.</div>
            </div>
          )}

          {/* Main content */}
          {!loading && !error && !notEnoughData && (
            <>
              {/* KPI cards */}
              <GscKpiCards current={currentTotals} previous={previousTotals} showComparison={compare} />

              {/* Trend chart */}
              <div className="bg-[#faf8f4] rounded-2xl p-4 border border-black/5">
                <div className="text-sm font-semibold text-black/60 mb-3">Traffic Trend</div>
                <GscTrendChart rows={trendRows} compact />
              </div>

              {/* Top queries */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="text-sm font-bold text-[#1A1208]">Top 10 Queries</h3>
                    <p className="text-xs text-black/40">Keywords driving traffic to your site</p>
                  </div>
                  <Link to="/admin/seo" className="text-xs text-[#B87333] hover:underline">View all →</Link>
                </div>
                <GscQueriesTable rows={queryRows} days={days} limit={10} />
              </div>

              {/* Top pages */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="text-sm font-bold text-[#1A1208]">Top 10 Pages</h3>
                    <p className="text-xs text-black/40">Pages receiving organic traffic</p>
                  </div>
                  <Link to="/admin/seo" className="text-xs text-[#B87333] hover:underline">View all →</Link>
                </div>
                <GscPagesTable rows={pageRows} days={days} limit={10} />
              </div>

              {/* Smart insights */}
              {insights && (
                <div>
                  <h3 className="text-sm font-bold text-[#1A1208] mb-3">Smart Insights</h3>
                  <GscSmartInsights insights={insights} />
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}