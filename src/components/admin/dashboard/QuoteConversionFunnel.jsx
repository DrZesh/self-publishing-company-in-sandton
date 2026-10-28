import React, { useState, useEffect } from 'react';
import { platform } from '@/api/platformClient';
import { Link } from 'react-router-dom';

const FUNNEL_STAGES = [
  { key: 'Draft', color: '#e5e7eb', text: '#6b7280' },
  { key: 'Sent', color: '#dbeafe', text: '#1d4ed8' },
  { key: 'Viewed', color: '#fef3c7', text: '#d97706' },
  { key: 'Accepted', color: '#dcfce7', text: '#16a34a' },
  { key: 'Declined', color: '#fee2e2', text: '#dc2626' },
  { key: 'Expired', color: '#f3f4f6', text: '#9ca3af' },
];

export default function QuoteConversionFunnel() {
  const [quotes, setQuotes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    platform.entities.Quote.list('-created_date', 200)
      .then(setQuotes)
      .finally(() => setLoading(false));
  }, []);

  const counts = FUNNEL_STAGES.map(s => ({
    ...s,
    count: quotes.filter(q => q.status === s.key).length,
  }));

  const total = quotes.length;
  const acceptedCount = counts.find(s => s.key === 'Accepted')?.count || 0;
  const conversionRate = total ? Math.round((acceptedCount / total) * 100) : 0;

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-bold text-gray-900 text-sm">Quote Conversion Funnel</h3>
          <p className="text-xs text-gray-400 mt-0.5">{total} total quotes · {conversionRate}% conversion</p>
        </div>
        <Link to="/admin/quotes" className="text-xs text-[#B87333] hover:underline font-semibold">View all →</Link>
      </div>

      {loading ? (
        <div className="space-y-2">{[...Array(5)].map((_, i) => <div key={i} className="h-8 bg-gray-100 rounded animate-pulse" />)}</div>
      ) : (
        <div className="space-y-2">
          {counts.map(({ key, color, text, count }) => {
            const pct = total ? Math.round((count / total) * 100) : 0;
            return (
              <div key={key} className="flex items-center gap-3">
                <div className="w-20 text-xs font-semibold text-gray-600 shrink-0">{key}</div>
                <div className="flex-1 bg-gray-100 rounded-full h-6 overflow-hidden">
                  <div
                    className="h-full rounded-full flex items-center px-2 transition-all duration-500"
                    style={{ width: `${Math.max(pct, count > 0 ? 8 : 0)}%`, backgroundColor: color }}
                  >
                    {count > 0 && <span className="text-xs font-bold" style={{ color: text }}>{count}</span>}
                  </div>
                </div>
                <div className="w-8 text-right text-xs text-gray-400">{pct}%</div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}