import React, { useState } from 'react';
import { ChevronDown, ChevronRight, ExternalLink, Download } from 'lucide-react';
import { base44 } from '@/api/base44Client';

function ExpandedQueryRow({ query, days }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  React.useEffect(() => {
    setLoading(true);
    base44.functions.invoke('searchConsoleData', { action: 'query_pages', query, days })
      .then(r => setData(r.data?.rows || []))
      .catch(() => setData([]))
      .finally(() => setLoading(false));
  }, [query, days]);

  if (loading) return (
    <tr><td colSpan={5} className="px-4 py-3 bg-[#fdf9f4]">
      <div className="flex items-center gap-2 text-xs text-black/40">
        <div className="w-3 h-3 border-2 border-[#B87333]/30 border-t-[#B87333] rounded-full animate-spin" />
        Loading pages for this query…
      </div>
    </td></tr>
  );

  return (
    <tr><td colSpan={5} className="px-4 py-2 bg-[#fdf9f4] border-b border-black/5">
      <div className="text-xs font-semibold text-black/50 mb-2 uppercase tracking-wide">Pages ranking for this query:</div>
      {(data || []).length === 0 ? (
        <div className="text-xs text-black/30 py-1">No page data available</div>
      ) : (
        <div className="space-y-1">
          {data.map((r, i) => (
            <div key={i} className="flex items-center gap-3 text-xs py-1">
              <span className="text-[#B87333] font-medium truncate max-w-xs">{r.keys[0]?.replace('https://www.creativebooks.co.za', '') || '/'}</span>
              <span className="text-black/60">{r.clicks} clicks</span>
              <span className="text-black/40">{r.impressions} impr.</span>
              <a href={r.keys[0]} target="_blank" rel="noopener noreferrer"><ExternalLink className="w-3 h-3 text-black/30 hover:text-[#B87333]" /></a>
            </div>
          ))}
        </div>
      )}
    </td></tr>
  );
}

export default function GscQueriesTable({ rows = [], days, limit }) {
  const [expanded, setExpanded] = useState(null);
  const [filter, setFilter] = useState('');
  const [posFilter, setPosFilter] = useState('all');
  const [sortKey, setSortKey] = useState('clicks');
  const [sortDir, setSortDir] = useState('desc');

  const displayed = (limit ? rows.slice(0, limit) : rows)
    .filter(r => {
      if (filter && !r.keys[0]?.toLowerCase().includes(filter.toLowerCase())) return false;
      if (posFilter === '1-10' && (r.position < 1 || r.position > 10)) return false;
      if (posFilter === '11-20' && (r.position < 11 || r.position > 20)) return false;
      if (posFilter === '21-50' && (r.position < 21 || r.position > 50)) return false;
      if (posFilter === '51+' && r.position < 51) return false;
      return true;
    })
    .sort((a, b) => {
      const av = sortKey === 'query' ? a.keys[0] : sortKey === 'ctr' ? a.ctr : a[sortKey];
      const bv = sortKey === 'query' ? b.keys[0] : sortKey === 'ctr' ? b.ctr : b[sortKey];
      return sortDir === 'asc' ? (av > bv ? 1 : -1) : (av < bv ? 1 : -1);
    });

  const exportCsv = () => {
    const header = 'Query,Clicks,Impressions,CTR,Avg Position\n';
    const body = displayed.map(r => `"${r.keys[0]}",${r.clicks},${r.impressions},${(r.ctr * 100).toFixed(2)}%,${r.position.toFixed(1)}`).join('\n');
    const blob = new Blob([header + body], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'gsc-queries.csv'; a.click();
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
      {/* Filters */}
      {!limit && (
        <div className="flex flex-wrap gap-3 mb-4">
          <input value={filter} onChange={e => setFilter(e.target.value)} placeholder="Filter queries…"
            className="px-3 py-1.5 border border-black/10 rounded-lg text-sm focus:outline-none focus:border-[#B87333] w-48" />
          <select value={posFilter} onChange={e => setPosFilter(e.target.value)}
            className="px-3 py-1.5 border border-black/10 rounded-lg text-sm focus:outline-none focus:border-[#B87333] bg-white">
            <option value="all">All positions</option>
            <option value="1-10">1–10 (Page 1)</option>
            <option value="11-20">11–20 (Page 2)</option>
            <option value="21-50">21–50</option>
            <option value="51+">51+</option>
          </select>
          <button onClick={exportCsv} className="flex items-center gap-1.5 px-3 py-1.5 border border-black/10 rounded-lg text-sm text-black/60 hover:border-[#B87333] hover:text-[#B87333] transition-colors ml-auto">
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
                <SortHeader label="Query" k="query" />
                <SortHeader label="Clicks" k="clicks" />
                <SortHeader label="Impressions" k="impressions" />
                <SortHeader label="CTR" k="ctr" />
                <SortHeader label="Position" k="position" />
              </tr>
            </thead>
            <tbody>
              {displayed.length === 0 && (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-black/30 text-sm">No queries match your filters</td></tr>
              )}
              {displayed.map((r, i) => (
                <React.Fragment key={i}>
                  <tr onClick={() => setExpanded(expanded === i ? null : i)}
                    className="border-t border-black/5 hover:bg-[#F9F7F2] transition-colors cursor-pointer">
                    <td className="px-4 py-3 text-black/30">
                      {expanded === i ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                    </td>
                    <td className="px-4 py-3 font-medium text-[#1A1208] max-w-[200px]">
                      <span className="truncate block" title={r.keys[0]}>{r.keys[0]}</span>
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
                  {expanded === i && <ExpandedQueryRow query={r.keys[0]} days={days} />}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {displayed.length > 0 && (
        <div className="text-xs text-black/30 mt-2 text-right">{displayed.length} queries shown</div>
      )}
    </div>
  );
}