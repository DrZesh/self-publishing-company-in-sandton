import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const STATUS_COLORS = {
  Accepted: '#10b981',
  Declined: '#ef4444',
  Expired: '#f97316',
  Pending: '#3b82f6',
  Draft: '#6b7280',
  Sent: '#8b5cf6',
  Viewed: '#06b6d4',
  Converted: '#14b8a6',
};

export default function QuoteConversionFunnel({ quotes = [] }) {
  const data = React.useMemo(() => {
    const statusCounts = {};
    quotes.forEach(q => {
      let status = q.status;
      if (status === 'Sent' && q.valid_until && new Date(q.valid_until) < new Date()) status = 'Expired';
      statusCounts[status] = (statusCounts[status] || 0) + 1;
    });

    return [
      { name: 'Draft', count: statusCounts['Draft'] || 0 },
      { name: 'Sent', count: (statusCounts['Sent'] || 0) + (statusCounts['Viewed'] || 0) + (statusCounts['Opened'] || 0) + (statusCounts['Delivered'] || 0) },
      { name: 'Accepted', count: statusCounts['Accepted'] || 0 },
      { name: 'Declined', count: statusCounts['Declined'] || 0 },
      { name: 'Expired', count: statusCounts['Expired'] || 0 },
    ].filter(d => d.count > 0);
  }, [quotes]);

  const total = quotes.length;
  const accepted = quotes.filter(q => q.status === 'Accepted').length;
  const conversionRate = total > 0 ? Math.round((accepted / total) * 100) : 0;

  if (data.length === 0) {
    return (
      <Card className="border-gray-200">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold text-gray-700">Conversion Funnel</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-48 flex items-center justify-center text-gray-400 text-sm">No quote data yet</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-gray-200">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-semibold text-gray-700">Conversion Funnel</CardTitle>
          <div className="text-xs text-gray-500">Conversion Rate: <span className="font-semibold text-green-600">{conversionRate}%</span></div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} layout="vertical" margin={{ left: 0, right: 20, top: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis type="number" hide />
              <YAxis dataKey="name" type="category" width={80} tick={{ fontSize: 11 }} />
              <Tooltip 
                contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e5e7eb' }}
                formatter={(value) => [`${value} quotes`, 'Count']}
              />
              <Bar dataKey="count" radius={[0, 4, 4, 0]} barSize={28}>
                {data.map((entry, index) => (
                  <Cell key={index} fill={STATUS_COLORS[entry.name] || '#6b7280'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}