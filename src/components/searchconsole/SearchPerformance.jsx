import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { TrendingUp, MousePointer, Eye, Percent } from 'lucide-react';

const DAYS_OPTIONS = [7, 28, 90];

function MetricCard({ label, value, IconComp, color }) {
  return (
    <div className="bg-white rounded-2xl p-5 border border-black/8 shadow-sm flex items-center gap-4">
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${color}`}>
        <IconComp className="w-5 h-5 text-white" />
      </div>
      <div>
        <div className="text-xs text-black/40 font-medium uppercase tracking-wide">{label}</div>
        <div className="text-2xl font-bold text-[#1A1208]">{value}</div>
      </div>
    </div>
  );
}

export default function SearchPerformance({ mode }) {
  const [days, setDays] = useState(28);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const dimensions = mode === 'queries' ? ['query'] : ['date'];

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await base44.functions.invoke('searchConsoleData', {
        action: 'performance',
        days,
        dimensions,
        rowLimit: mode === 'queries' ? 25 : 90,
      });
      setData(res.data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [days, mode]);

  const rows = data?.rows || [];
  const totals = rows.reduce(
    (acc, r) => ({ clicks: acc.clicks + r.clicks, impressions: acc.impressions + r.impressions }),
    { clicks: 0, impressions: 0 }
  );
  const avgCtr = rows.length ? (rows.reduce((a, r) => a + r.ctr, 0) / rows.length * 100).toFixed(1) : '—';
  const avgPos = rows.length ? (rows.reduce((a, r) => a + r.position, 0) / rows.length).toFixed(1) : '—';

  return (
    <div>
      {/* Controls */}
      <div className="flex items-center gap-3 mb-6">
        <span className="text-sm text-black/50">Date range:</span>
        {DAYS_OPTIONS.map(d => (
          <button key={d} onClick={() => setDays(d)}
            className={`px-3 py-1 rounded-full text-sm font-medium transition-all ${days === d ? 'bg-[#B87333] text-white' : 'bg-white border border-black/10 text-black/60 hover:border-[#B87333]'}`}>
            {d} days
          </button>
        ))}
        <button onClick={fetchData} className="ml-auto text-xs text-[#B87333] hover:underline">Refresh</button>
      </div>

      {/* Summary cards */}
      {mode !== 'queries' && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <MetricCard label="Total Clicks" value={totals.clicks.toLocaleString()} IconComp={MousePointer} color="bg-[#B87333]" />
          <MetricCard label="Impressions" value={totals.impressions.toLocaleString()} IconComp={Eye} color="bg-blue-500" />
          <MetricCard label="Avg CTR" value={`${avgCtr}%`} IconComp={Percent} color="bg-emerald-500" />
          <MetricCard label="Avg Position" value={avgPos} IconComp={TrendingUp} color="bg-purple-500" />
        </div>
      )}

      {loading && (
        <div className="flex items-center justify-center h-48">
          <div className="w-7 h-7 border-3 border-[#B87333]/20 border-t-[#B87333] rounded-full animate-spin" />
        </div>
      )}

      {error && <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">{error}</div>}

      {!loading && !error && rows.length === 0 && (
        <div className="text-center py-16 text-black/40">No data available for this period.</div>
      )}

      {/* Chart for date-based */}
      {!loading && !error && mode !== 'queries' && rows.length > 0 && (
        <div className="bg-white rounded-2xl border border-black/8 shadow-sm p-6 mb-6">
          <div className="text-sm font-semibold text-black/60 mb-4">Clicks over time</div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={rows.map(r => ({ date: r.keys[0], clicks: r.clicks, impressions: r.impressions }))}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0ebe3" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} tickFormatter={d => d.slice(5)} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="clicks" fill="#B87333" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Table for queries */}
      {!loading && !error && mode === 'queries' && rows.length > 0 && (
        <div className="bg-white rounded-2xl border border-black/8 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-black/8">
            <div className="text-sm font-semibold text-[#1A1208]">Top {rows.length} Search Queries</div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-[#F9F7F2]">
                <tr>
                  {['Query', 'Clicks', 'Impressions', 'CTR', 'Position'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-black/50 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((r, i) => (
                  <tr key={i} className="border-t border-black/5 hover:bg-[#F9F7F2] transition-colors">
                    <td className="px-4 py-3 font-medium text-[#1A1208] max-w-xs truncate">{r.keys[0]}</td>
                    <td className="px-4 py-3 text-[#B87333] font-semibold">{r.clicks.toLocaleString()}</td>
                    <td className="px-4 py-3 text-black/60">{r.impressions.toLocaleString()}</td>
                    <td className="px-4 py-3 text-black/60">{(r.ctr * 100).toFixed(1)}%</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${r.position <= 3 ? 'bg-emerald-100 text-emerald-700' : r.position <= 10 ? 'bg-blue-100 text-blue-700' : 'bg-black/5 text-black/50'}`}>
                        #{r.position.toFixed(0)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}