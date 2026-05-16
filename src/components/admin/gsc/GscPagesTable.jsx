import React, { useState } from 'react';
import { ChevronDown, ChevronRight, ExternalLink, Download } from 'lucide-react';
import { base44 } from '@/api/base44Client';

function badge(row, prevRow) {
  const url = row.keys[0] || '';
  const badges = [];
  if (prevRow) {
    const pct = prevRow.clicks > 0 ? (row.clicks - prevRow.clicks) / prevRow.clicks : 0;
    if (pct > 0.2) badges.push({ label: '🚀 Growing', cls: 'bg-emerald-100 text-emerald-700' });
    else if (pct < -0.2) badges.push({ label: '📉 Declining', cls: 'bg-red-100 text-red-700' });
  }
  if (row.impressions > 500 && row.clicks < 10) badges.push({ label: '💎 Hidden gem', cls: 'bg-purple-100 text-purple-700' });
  if (row.position >= 11 && row.position <= 20 && row.impressions > 100) badges.push({ label: '🎯 Quick win', cls: 'bg-amber-100 text-amber-700' });
  return badges;
}

function ExpandedPageRow({ page, days }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  React.useEffect(() => {
    setLoading(true);
    base44.functions.invoke('searchConsoleData', { action: 'page_queries', page, days })
      .then(r => setData(r.data?.rows || []))
      .catch(() => setData([]))
      .finally(() => setLoading(false));
  }, [page, days]);

  const shortPage = page.replace('https://www.creativebooks.co.za', '') || '/';

  return (
    <tr><td colSpan={6} className="px-4 py-2 bg-[#fdf9f4] border-b border-black/5">
      <div className="flex items-center gap-3 mb-2">
        <a href={page} target="_blank" rel="noopener noreferrer" className="text-xs text-[#B87333] hover:underline flex items-center gap-1">
          Open page <ExternalLink className="w-3 h-3" />
        </a>
        <a href={`https://search.google.com/search-console/performance/search-analytics?resource_id=https%3A%2F%2Fwww.creativebooks.co.za%2F&page=${encodeURIComponent(shortPage)}`} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-500 hover:underline flex items-center gap-1">
          Open in GSC <ExternalLink className="w-3 h-3" />
        </a>
      </div>
      <div className="text-xs font-semibold text-black/50 mb-2 uppercase tracking-wide">Top queries for this page:</div>
      {loading ? (
        <div className="flex items-center gap-2 text-xs text-black/40"><div className="w-3 h-3 border-2 border-[#B87333]/30 border-t-[#B87333] rounded-full animate-spin" />Loading…</div>
      ) : (data || []).length === 0 ? (
        <div className="text-xs text-black/30 py-1">No query data available</div>
      ) : (
        <div className="space-y-1">
          {data.map((r, i) => (
            <div key={i} className="flex items-center gap-3 text-xs py-0.5">
              <span className="font-medium text-[#1A1208] truncate max-w-xs">{r.keys[0]}</span>
              <span className="text-[#B87333]">{r.clicks} clicks</span>
              <span className="text-black/40">{r.impressions} impr.</span>
              <span className="text-black/40">#{r.position.toFixed(0)}</span>
            </div>
          ))}
        </div>
      )}
    </td></tr>
  );
}

export default function GscPagesTable({ rows = [], prevRows = [], days, limit }) {
  const [expanded, setExpanded] = useState(null);
  const [sortKey, setSortKey] = useState('clicks');
  const [sortDir, setSortDir] = useState('desc');

  const prevMap = new Map((prevRows || []).map(r => [r.keys[0], r]));

  const displayed = (limit ? rows.slice(0, limit) : rows)
    .sort((a, b) => {
      const av = sortKey === 'page' ? a.keys[0] : sortKey === 'ctr' ? a.ctr : a[sortKey];
      const bv = sortKey === 'page' ? b.keys[0] : sortKey === 'ctr' ? b.ctr : b[sortKey];
      return sortDir === 'asc' ? (av > bv ? 1 : -1) : (av < bv ? 1 : -1);
    });

  const exportCsv = () => {
    const header = 'Page,Clicks,Impressions,CTR,Avg Position\n';
    const body = displayed.map(r => `"${r.keys[0]}",${r.clicks},${r.impressions},${(r.ctr * 100).toFixed(2)}%,${r.position.toFixed(1)}`).join('\n');
    const blob = new Blob([header + body], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'gsc-pages.csv'; a.click();
  };

  const toggleSort = (key) => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('desc'); }
  };

  const SortHeader = ({ label, k }) => (
    <th onClick={() => toggleSort(k)} className="px-4 py-3 text-left text-xs font-semibold text-black/50 uppercase tracking-wide cursor-pointer hover:text-[#B87333] select-none">
      {label} {sortKey === k ? (sortDir === 'asc' ? '↑' : '↓') : ''}
    </th>
  );

  return (
    <div>
      {!limit && (
        <div className="flex justify-end mb-3">
          <button onClick={exportCsv} className="flex items-center gap-1.5 px-3 py-1.5 border border-black/10 rounded-lg text-sm text-black/60 hover:border-[#B87333] hover:text-[#B87333] transition-colors">
            <Download className="w-3.5 h-3.5" /> Export CSV
          </button>
        </div>
      )}
      <div className="bg-white rounded-2xl border border-black/8 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[560px]">
            <thead className="bg-[#F9F7F2]">
              <tr>
                <th className="px-4 py-3 w-8" />
                <SortHeader label="Page" k="page" />
                <SortHeader label="Clicks" k="clicks" />
                <SortHeader label="Impressions" k="impressions" />
                <SortHeader label="CTR" k="ctr" />
                <SortHeader label="Position" k="position" />
              </tr>
            </thead>
            <tbody>
              {displayed.length === 0 && (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-black/30 text-sm">No data available</td></tr>
              )}
              {displayed.map((r, i) => {
                const short = r.keys[0]?.replace('https://www.creativebooks.co.za', '') || '/';
                const badges2 = badge(r, prevMap.get(r.keys[0]));
                return (
                  <React.Fragment key={i}>
                    <tr onClick={() => setExpanded(expanded === i ? null : i)}
                      className="border-t border-black/5 hover:bg-[#F9F7F2] transition-colors cursor-pointer">
                      <td className="px-4 py-3 text-black/30">
                        {expanded === i ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                      </td>
                      <td className="px-4 py-3 font-medium text-[#1A1208] max-w-[240px]">
                        <span className="truncate block text-xs" title={r.keys[0]}>{short}</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {badges2.map((b, bi) => <span key={bi} className={`text-xs px-1.5 py-0.5 rounded-full ${b.cls}`}>{b.label}</span>)}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-[#B87333] font-semibold">{r.clicks.toLocaleString()}</td>
                      <td className="px-4 py-3 text-black/60">{r.impressions.toLocaleString()}</td>
                      <td className="px-4 py-3 text-black/60">{(r.ctr * 100).toFixed(1)}%</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${r.position <= 3 ? 'bg-emerald-100 text-emerald-700' : r.position <= 10 ? 'bg-blue-100 text-blue-700' : r.position <= 20 ? 'bg-amber-100 text-amber-700' : 'bg-black/5 text-black/50'}`}>
                          #{r.position.toFixed(0)}
                        </span>
                      </td>
                    </tr>
                    {expanded === i && <ExpandedPageRow page={r.keys[0]} days={days} />}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}