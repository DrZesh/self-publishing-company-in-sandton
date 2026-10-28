import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { platform } from '@/api/platformClient';
import { TrendingUp, MousePointer, Eye, Percent, BarChart2, ExternalLink } from 'lucide-react';

function MiniKpi({ label, value, icon: Icon }) {
  return (
    <div className="bg-[#F9F7F2] rounded-xl p-3 flex items-center gap-3">
      <div className="w-8 h-8 rounded-lg bg-[#B87333] flex items-center justify-center shrink-0">
        <Icon className="w-4 h-4 text-white" />
      </div>
      <div>
        <div className="text-xs text-black/40">{label}</div>
        <div className="text-base font-bold text-[#1A1208]">{value}</div>
      </div>
    </div>
  );
}

export default function SearchConsoleMini() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    platform.functions.invoke('searchConsoleData', { action: 'performance_compare', days: 28, dimensions: ['date'], rowLimit: 30 })
      .then(res => {
        const rows = res.data?.current?.rows || [];
        const totalClicks = rows.reduce((s, r) => s + r.clicks, 0);
        const totalImpressions = rows.reduce((s, r) => s + r.impressions, 0);
        const avgCtr = rows.length ? rows.reduce((s, r) => s + r.ctr, 0) / rows.length : 0;
        const avgPos = rows.length ? rows.reduce((s, r) => s + r.position, 0) / rows.length : 0;
        setData({ totalClicks, totalImpressions, avgCtr, avgPos });
      })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="bg-white rounded-2xl border border-black/8 shadow-sm p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-[#B87333] flex items-center justify-center">
            <BarChart2 className="w-4 h-4 text-white" />
          </div>
          <div>
            <h2 className="text-base font-bold text-[#1A1208]">Search Performance</h2>
            <p className="text-xs text-black/40">Last 28 days — Google Search Console</p>
          </div>
        </div>
        <Link to="/admin/seo" className="flex items-center gap-1 text-xs text-[#B87333] hover:underline">
          Full SEO dashboard <ExternalLink className="w-3 h-3" />
        </Link>
      </div>

      {loading && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[...Array(4)].map((_, i) => <div key={i} className="h-16 bg-black/5 rounded-xl animate-pulse" />)}
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-50 border border-red-100 rounded-xl text-xs text-red-600">
          Search Console not available. <Link to="/admin/seo" className="underline">Configure →</Link>
        </div>
      )}

      {data && !loading && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <MiniKpi label="Total Clicks" value={data.totalClicks.toLocaleString()} icon={MousePointer} />
          <MiniKpi label="Impressions" value={data.totalImpressions.toLocaleString()} icon={Eye} />
          <MiniKpi label="Avg CTR" value={`${(data.avgCtr * 100).toFixed(1)}%`} icon={Percent} />
          <MiniKpi label="Avg Position" value={`#${data.avgPos.toFixed(1)}`} icon={TrendingUp} />
        </div>
      )}
    </div>
  );
}