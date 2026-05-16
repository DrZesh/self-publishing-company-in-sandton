import React from 'react';
import { MousePointer, Eye, Percent, TrendingUp, ArrowUpRight, ArrowDownRight } from 'lucide-react';

function pctChange(current, previous) {
  if (!previous || previous === 0) return null;
  return ((current - previous) / previous) * 100;
}

function ChangeTag({ pct, invertColors = false }) {
  if (pct === null || pct === undefined) return null;
  const positive = invertColors ? pct < 0 : pct >= 0;
  const label = `${pct >= 0 ? '+' : ''}${pct.toFixed(1)}%`;
  return (
    <span className={`flex items-center gap-0.5 text-xs font-semibold ${positive ? 'text-emerald-600' : 'text-red-500'}`}>
      {positive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
      {label}
    </span>
  );
}

function Card({ label, value, sub, IconComp, color, pct, invertColors, helper }) {
  return (
    <div className="bg-white rounded-2xl p-5 border border-black/8 shadow-sm">
      <div className="flex items-start justify-between mb-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
          <IconComp className="w-5 h-5 text-white" />
        </div>
        <ChangeTag pct={pct} invertColors={invertColors} />
      </div>
      <div className="text-2xl font-bold text-[#1A1208] mb-0.5">{value}</div>
      <div className="text-xs text-black/50">{sub}</div>
      {helper && <div className="text-xs text-black/30 mt-1 italic">{helper}</div>}
    </div>
  );
}

export default function GscKpiCards({ current, previous, showComparison }) {
  const cur = current || {};
  const prev = previous || {};

  const curClicks = cur.totalClicks ?? 0;
  const curImpressions = cur.totalImpressions ?? 0;
  const curCtr = cur.avgCtr != null ? (cur.avgCtr * 100).toFixed(1) : '—';
  const curPos = cur.avgPosition != null ? cur.avgPosition.toFixed(1) : '—';

  const clickPct = showComparison ? pctChange(curClicks, prev.totalClicks) : null;
  const impPct = showComparison ? pctChange(curImpressions, prev.totalImpressions) : null;
  const ctrPct = showComparison ? pctChange(cur.avgCtr, prev.avgCtr) : null;
  const posPct = showComparison ? pctChange(cur.avgPosition, prev.avgPosition) : null;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <Card
        label="Total Clicks" value={curClicks.toLocaleString()} sub="Visitors from Google search"
        IconComp={MousePointer} color="bg-[#B87333]" pct={clickPct}
      />
      <Card
        label="Impressions" value={curImpressions.toLocaleString()} sub="Times shown in search results"
        IconComp={Eye} color="bg-blue-500" pct={impPct}
      />
      <Card
        label="Avg CTR" value={`${curCtr}%`} sub="Click-through rate"
        IconComp={Percent} color="bg-emerald-500" pct={ctrPct}
        helper="SA benchmark: 2–5% for general queries"
      />
      <Card
        label="Avg Position" value={curPos} sub="Average ranking in Google"
        IconComp={TrendingUp} color="bg-purple-500" pct={posPct} invertColors
        helper="Lower number = higher ranking"
      />
    </div>
  );
}