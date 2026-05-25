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
  if (loading) return <div className="h-48 bg-gray-100 rounded-xl animate-pulse mb-6" />;

  const raw = metrics?.serviceCount || {};
  const data = Object.entries(raw)
    .map(([key, count]) => ({ key, label: SERVICE_LABELS[key] || key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()), count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 7);

  const total = data.reduce((s, d) => s + d.count, 0);

  if (!total) return null;

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-base font-semibold text-gray-900">Services Requested This Month</h2>
          <p className="text-xs text-gray-400">What clients are enquiring about</p>
        </div>
        <Link to="/admin/leads" className="text-xs text-[#B87333] hover:underline">View leads →</Link>
      </div>

      <div className="space-y-3">
        {data.map((item, i) => {
          const pct = Math.round((item.count / total) * 100);
          return (
            <div key={item.key}>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="font-medium text-gray-700">{item.label}</span>
                <span className="font-bold text-gray-800">{item.count} <span className="text-gray-400 font-normal">({pct}%)</span></span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all"
                  style={{ width: `${pct}%`, background: BAR_COLORS[i % BAR_COLORS.length] }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}