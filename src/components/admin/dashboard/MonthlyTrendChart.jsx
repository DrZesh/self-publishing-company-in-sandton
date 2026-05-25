import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, LineChart, Line } from 'recharts';

const VIEWS = [
  { key: 'submissions', label: 'Enquiries', color: '#B87333' },
  { key: 'leads', label: 'Leads', color: '#6366f1' },
  { key: 'revenue', label: 'Revenue (R)', color: '#10b981' },
];

function CustomTooltip({ active, payload, label, view }) {
  if (!active || !payload?.length) return null;
  const val = payload[0]?.value;
  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-lg px-4 py-3 text-sm">
      <p className="font-semibold text-gray-800 mb-1">{label}</p>
      <p style={{ color: payload[0]?.fill || payload[0]?.stroke }}>
        {view === 'revenue' ? `R${(val || 0).toLocaleString()}` : val}
        {' '}{VIEWS.find(v => v.key === view)?.label}
      </p>
    </div>
  );
}

export default function MonthlyTrendChart({ monthlyTrend, loading }) {
  const [view, setView] = useState('submissions');

  if (loading) {
    return <div className="h-64 bg-gray-100 rounded-xl animate-pulse mb-6" />;
  }

  const data = monthlyTrend || [];
  if (!data.length) return null;

  const current = VIEWS.find(v => v.key === view);

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
        <div>
          <h2 className="text-base font-semibold text-gray-900">6-Month Trend</h2>
          <p className="text-xs text-gray-400">Monthly performance over the past 6 months</p>
        </div>
        <div className="flex gap-1 p-1 bg-gray-100 rounded-lg">
          {VIEWS.map(v => (
            <button
              key={v.key}
              onClick={() => setView(v.key)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${view === v.key ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
              {v.label}
            </button>
          ))}
        </div>
      </div>

      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
          <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
          <YAxis
            tick={{ fontSize: 11, fill: '#9ca3af' }}
            axisLine={false}
            tickLine={false}
            tickFormatter={v => view === 'revenue' ? `R${v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}` : v}
          />
          <Tooltip content={<CustomTooltip view={view} />} cursor={{ fill: 'rgba(0,0,0,0.04)' }} />
          <Bar dataKey={view} fill={current.color} radius={[4, 4, 0, 0]} maxBarSize={40} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}