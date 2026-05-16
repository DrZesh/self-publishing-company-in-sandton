import React from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-black/10 rounded-xl shadow-lg p-3 text-sm">
      <div className="font-semibold text-black/70 mb-2">{label}</div>
      {payload.map(p => (
        <div key={p.dataKey} className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full" style={{ background: p.color }} />
          <span className="text-black/60">{p.name}:</span>
          <span className="font-semibold text-[#1A1208]">{p.dataKey === 'ctr' ? `${(p.value * 100).toFixed(1)}%` : p.value?.toLocaleString()}</span>
        </div>
      ))}
    </div>
  );
}

export default function GscTrendChart({ rows = [], compact = false }) {
  const chartData = rows.map(r => ({
    date: r.keys?.[0] || r.date,
    clicks: r.clicks,
    impressions: r.impressions,
    ctr: r.ctr,
    position: r.position,
  })).sort((a, b) => a.date > b.date ? 1 : -1);

  if (!chartData.length) return (
    <div className="flex items-center justify-center h-40 text-black/30 text-sm">No data for this period</div>
  );

  return (
    <ResponsiveContainer width="100%" height={compact ? 160 : 240}>
      <LineChart data={chartData} margin={{ top: 4, right: 16, bottom: 4, left: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0ebe3" />
        <XAxis dataKey="date" tick={{ fontSize: 10 }} tickFormatter={d => d?.slice(5)} interval="preserveStartEnd" />
        <YAxis yAxisId="left" tick={{ fontSize: 10 }} width={36} />
        <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 10 }} width={40} />
        <Tooltip content={<CustomTooltip />} />
        {!compact && <Legend wrapperStyle={{ fontSize: 11 }} />}
        <Line yAxisId="left" type="monotone" dataKey="clicks" name="Clicks" stroke="#B87333" strokeWidth={2} dot={false} />
        <Line yAxisId="right" type="monotone" dataKey="impressions" name="Impressions" stroke="#93c5fd" strokeWidth={1.5} dot={false} />
      </LineChart>
    </ResponsiveContainer>
  );
}