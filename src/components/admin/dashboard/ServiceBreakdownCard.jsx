import React from 'react';
import { Link } from 'react-router-dom';

const SERVICE_LABELS = {
  book_printing: 'Book Printing',
  book_editing: 'Book Editing',
  proofreading: 'Proofreading',
  book_cover_design: 'Cover Design',
  typesetting: 'Typesetting',
  ghostwriting: 'Ghostwriting',
  ebook_publishing: 'Ebook Publishing',
  self_publishing: 'Self Publishing',
  memoir_writing: 'Memoir Writing',
  biography_writing: 'Biography Writing',
  children_books: "Children's Books",
  author_websites: 'Author Websites',
  contact: 'General Enquiry',
  quote: 'Quote Request',
  other: 'Other',
};

const BAR_COLORS = ['#B87333', '#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

export default function ServiceBreakdownCard({ metrics, loading }) {
  if (loading) return <div className="h-48 rounded-xl animate-pulse mb-6" style={{ background: 'rgba(34, 211, 238, 0.1)', border: '1px solid rgba(34, 211, 238, 0.2)' }} />;

  const raw = metrics?.serviceCount || {};
  const data = Object.entries(raw)
    .map(([key, count]) => ({ key, label: SERVICE_LABELS[key] || key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()), count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 7);

  const total = data.reduce((s, d) => s + d.count, 0);

  if (!total) return null;

  return (
    <div
      className="rounded-2xl border backdrop-blur-xl p-6 mb-6"
      style={{
        background: 'rgba(15, 23, 42, 0.6)',
        borderColor: 'rgba(34, 211, 238, 0.2)',
        boxShadow: '0 4px 24px rgba(0, 0, 0, 0.4), inset 0 0 20px rgba(34, 211, 238, 0.1)'
      }}
    >
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-base font-bold text-cyan-50">Services Requested This Month</h2>
          <p className="text-xs text-cyan-200/50">What clients are enquiring about</p>
        </div>
        <Link to="/admin/leads" className="text-xs font-semibold text-cyan-300 hover:text-cyan-200 transition-colors">View leads →</Link>
      </div>

      <div className="space-y-3">
        {data.map((item, i) => {
          const pct = Math.round((item.count / total) * 100);
          const color = BAR_COLORS[i % BAR_COLORS.length];
          return (
            <div key={item.key}>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="font-medium text-cyan-100/90">{item.label}</span>
                <span className="font-bold text-cyan-50">{item.count} <span className="text-cyan-200/50 font-normal">({pct}%)</span></span>
              </div>
              <div className="h-2.5 rounded-full overflow-hidden" style={{ background: 'rgba(34, 211, 238, 0.1)' }}>
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${pct}%`, background: color, boxShadow: `0 0 10px ${color}60` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}