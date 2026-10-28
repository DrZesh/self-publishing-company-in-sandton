import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

const VIEWS = [
  { key: 'submissions', label: 'Enquiries', color: '#22d3ee', gradient: ['#22d3ee', '#06b6d4'] },
  { key: 'leads', label: 'Leads', color: '#6366f1', gradient: ['#6366f1', '#818cf8'] },
  { key: 'revenue', label: 'Revenue (R)', color: '#10b981', gradient: ['#10b981', '#34d399'] },
];

function CustomTooltip({ active, payload, label, view }) {
  if (!active || !payload?.length) return null;
  const val = payload[0]?.value;
  return (
    <div className="rounded-xl border px-4 py-3 text-sm backdrop-blur-xl" style={{
      background: 'rgba(15, 23, 42, 0.95)',
      borderColor: 'rgba(34, 211, 238, 0.3)',
      boxShadow: '0 4px 24px rgba(0, 0, 0, 0.5)'
    }}>
      <p className="font-bold text-cyan-100 mb-1">{label}</p>
      <p style={{ color: payload[0]?.fill || payload[0]?.stroke || '#22d3ee' }} className="font-bold">
        {view === 'revenue' ? `R${(val || 0).toLocaleString()}` : val}
        {' '}{VIEWS.find(v => v.key === view)?.label}
      </p>
    </div>
  );
}

export default function MonthlyTrendChart({ monthlyTrend, loading }) {
  const [view, setView] = useState('submissions');

  if (loading) {
    return <div className="h-64 rounded-xl animate-pulse mb-6" style={{ background: 'rgba(34, 211, 238, 0.1)', border: '1px solid rgba(34, 211, 238, 0.2)' }} />;
  }

  const data = monthlyTrend || [];
  if (!data.length) return null;

  const current = VIEWS.find(v => v.key === view);

  return (
    <div
      className="rounded-2xl border backdrop-blur-xl p-6 mb-6"
      style={{
        background: 'rgba(15, 23, 42, 0.6)',
        borderColor: 'rgba(34, 211, 238, 0.2)',
        boxShadow: '0 4px 24px rgba(0, 0, 0, 0.4), inset 0 0 20px rgba(34, 211, 238, 0.1)'
      }}
    >
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
        <div>
          <h2 className="text-base font-bold text-cyan-50">6-Month Trend</h2>
          <p className="text-xs text-cyan-200/50">Monthly performance over the past 6 months</p>
        </div>
        <div className="flex gap-1 p-1 rounded-xl border" style={{
          background: 'rgba(15, 23, 42, 0.8)',
          borderColor: 'rgba(34, 211, 238, 0.2)'
        }}>
          {VIEWS.map(v => (
            <button
              key={v.key}
              onClick={() => setView(v.key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${view === v.key ? 'text-white shadow-lg' : 'text-cyan-200/50 hover:text-cyan-200/80'}`}
              style={view === v.key ? {
                background: `linear-gradient(135deg,${v.gradient[0]},${v.gradient[1]})`,
                boxShadow: `0 2px 12px ${v.color}60`
              } : {}}
            >
              {v.label}
            </button>
          ))}
        </div>
      </div>

      <ResponsiveContainer width="100%" height={220}>
        <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id={`gradient-${view}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={current.color} stopOpacity={0.4} />
              <stop offset="95%" stopColor={current.color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(34, 211, 238, 0.1)" />
          <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'rgba(165, 243, 252, 0.5)' }} axisLine={false} tickLine={false} />
          <YAxis
            tick={{ fontSize: 11, fill: 'rgba(165, 243, 252, 0.5)' }}
            axisLine={false}
            tickLine={false}
            tickFormatter={v => view === 'revenue' ? `R${v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}` : v}
          />
          <Tooltip content={<CustomTooltip view={view} />} cursor={{ fill: 'rgba(34, 211, 238, 0.1)' }} />
          <Area
            type="monotone"
            dataKey={view}
            stroke={current.color}
            strokeWidth={3}
            fill={`url(#gradient-${view})`}
            fillOpacity={1}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}