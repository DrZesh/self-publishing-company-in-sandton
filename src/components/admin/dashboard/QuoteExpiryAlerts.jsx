import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { AlertTriangle, Clock } from 'lucide-react';

export default function QuoteExpiryAlerts() {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    base44.entities.Quote.filter({ status: 'Sent' }, '-valid_until', 100)
      .then(quotes => {
        const now = new Date();
        const in7 = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
        const expiring = quotes.filter(q => {
          if (!q.valid_until) return false;
          const exp = new Date(q.valid_until);
          return exp <= in7 && exp >= now;
        }).sort((a, b) => new Date(a.valid_until) - new Date(b.valid_until));
        setAlerts(expiring);
      })
      .finally(() => setLoading(false));
  }, []);

  const getDaysLeft = (dateStr) => {
    const diff = new Date(dateStr) - new Date();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-500" />
          <h3 className="font-bold text-gray-900 text-sm">Quote Expiry Alerts</h3>
          {alerts.length > 0 && (
            <span className="px-1.5 py-0.5 bg-amber-100 text-amber-700 rounded-full text-xs font-bold">{alerts.length}</span>
          )}
        </div>
        <Link to="/admin/quotes" className="text-xs text-[#B87333] hover:underline font-semibold">View all →</Link>
      </div>

      {loading ? (
        <div className="space-y-2">{[...Array(3)].map((_, i) => <div key={i} className="h-12 bg-gray-100 rounded animate-pulse" />)}</div>
      ) : alerts.length === 0 ? (
        <div className="py-6 text-center text-sm text-gray-400">
          <Clock className="w-6 h-6 mx-auto mb-2 text-gray-300" />
          No quotes expiring in the next 7 days
        </div>
      ) : (
        <div className="space-y-2">
          {alerts.map(q => {
            const daysLeft = getDaysLeft(q.valid_until);
            const urgent = daysLeft <= 2;
            return (
              <div key={q.id} className={`flex items-center justify-between p-3 rounded-xl border ${urgent ? 'bg-red-50 border-red-200' : 'bg-amber-50 border-amber-200'}`}>
                <div>
                  <p className="text-sm font-semibold text-gray-800">{q.book_title || q.quote_number}</p>
                  <p className="text-xs text-gray-500">{q.quote_number} · R{(q.total || 0).toLocaleString()}</p>
                </div>
                <div className={`text-xs font-bold px-2 py-1 rounded-lg ${urgent ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>
                  {daysLeft === 0 ? 'Today' : `${daysLeft}d left`}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}