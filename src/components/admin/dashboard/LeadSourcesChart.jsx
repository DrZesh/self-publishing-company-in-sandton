import React from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const SOURCE_LABELS = {
  organic_search: 'Organic Search',
  direct: 'Direct',
  social: 'Social',
  referral: 'Referral',
  paid: 'Paid Ads',
  email: 'Email',
  other: 'Other',
};

const COLORS = ['#B87333', '#93c5fd', '#86efac', '#fcd34d', '#c4b5fd', '#f9a8d4', '#94a3b8'];

export default function LeadSourcesChart({ leadSources, loading }) {
  if (loading) return <div className="h-48 bg-black/5 rounded-2xl animate-pulse mb-6" />;

  const data = Object.entries(leadSources || {})
    .map(([key, value]) => ({ name: SOURCE_LABELS[key] || key, value }))
    .sort((a, b) => b.value - a.value);

  const total = data.reduce((s, d) => s + d.value, 0);

  if (!total) return null;

  return (
    <div className="bg-white rounded-2xl border border-black/8 shadow-sm p-6 mb-6">
      <div className="mb-4">
        <h2 className="text-base font-bold text-[#1A1208]">Lead Sources This Month</h2>
        <p className="text-xs text-black/40">Where your submissions are coming from</p>
      </div>
      <div className="flex flex-col sm:flex-row items-center gap-6">
        <ResponsiveContainer width={160} height={160}>
          <PieChart>
            <Pie data={data} cx="50%" cy="50%" innerRadius={45} outerRadius={70} dataKey="value" paddingAngle={2}>
              {data.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
            </Pie>
            <Tooltip formatter={(v) => [`${v} submissions`, '']} />
          </PieChart>
        </ResponsiveContainer>
        <div className="flex-1 space-y-2">
          {data.map((item, i) => (
            <div key={i} className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: COLORS[i % COLORS.length] }} />
                <span className="text-xs text-black/70">{item.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-[#1A1208]">{item.value}</span>
                <span className="text-xs text-black/40">{Math.round(item.value / total * 100)}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}