import React, { useState, useEffect } from 'react';
import { platform } from '@/api/platformClient';
import { Timer } from 'lucide-react';

export default function ResponseTimeTracker() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      platform.entities.Submission.filter({ status: 'read' }, '-created_date', 100),
      platform.entities.Submission.filter({ status: 'converted_to_lead' }, '-created_date', 100),
    ]).then(([read, converted]) => {
      const all = [...read, ...converted];
      // estimate response time as time between creation and last update (when status changed from new)
      const times = all
        .filter(s => s.created_date && s.updated_date && s.created_date !== s.updated_date)
        .map(s => (new Date(s.updated_date) - new Date(s.created_date)) / (1000 * 60 * 60)); // hours

      const avgHours = times.length ? times.reduce((a, b) => a + b, 0) / times.length : null;
      const under24 = times.filter(t => t <= 24).length;
      const pctUnder24 = times.length ? Math.round((under24 / times.length) * 100) : 0;

      // By day of week
      const dayBuckets = [0, 0, 0, 0, 0, 0, 0];
      all.forEach(s => {
        const d = new Date(s.created_date).getDay();
        dayBuckets[d]++;
      });
      const peakDay = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][dayBuckets.indexOf(Math.max(...dayBuckets))];

      setStats({ avgHours, pctUnder24, total: all.length, peakDay });
    }).finally(() => setLoading(false));
  }, []);

  const formatHours = (h) => {
    if (h === null) return '—';
    if (h < 1) return `${Math.round(h * 60)}m`;
    if (h < 24) return `${h.toFixed(1)}h`;
    return `${(h / 24).toFixed(1)}d`;
  };

  const getColor = (h) => {
    if (h === null) return 'text-gray-400';
    if (h <= 4) return 'text-green-600';
    if (h <= 24) return 'text-amber-600';
    return 'text-red-600';
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
      <div className="flex items-center gap-2 mb-4">
        <Timer className="w-4 h-4 text-[#B87333]" />
        <h3 className="font-bold text-gray-900 text-sm">Response Time</h3>
      </div>

      {loading ? (
        <div className="space-y-3">{[...Array(3)].map((_, i) => <div key={i} className="h-8 bg-gray-100 rounded animate-pulse" />)}</div>
      ) : !stats || stats.total === 0 ? (
        <p className="text-sm text-gray-400 py-4 text-center">Not enough data yet</p>
      ) : (
        <div className="space-y-4">
          <div className="text-center">
            <div className={`text-3xl font-bold ${getColor(stats.avgHours)}`}>{formatHours(stats.avgHours)}</div>
            <div className="text-xs text-gray-400 mt-0.5">avg response time</div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-gray-50 rounded-xl p-3 text-center">
              <div className="text-lg font-bold text-gray-800">{stats.pctUnder24}%</div>
              <div className="text-xs text-gray-400">replied within 24h</div>
            </div>
            <div className="bg-gray-50 rounded-xl p-3 text-center">
              <div className="text-lg font-bold text-gray-800">{stats.peakDay}</div>
              <div className="text-xs text-gray-400">busiest day</div>
            </div>
          </div>
          <p className="text-xs text-gray-400 text-center">Based on {stats.total} processed submissions</p>
        </div>
      )}
    </div>
  );
}