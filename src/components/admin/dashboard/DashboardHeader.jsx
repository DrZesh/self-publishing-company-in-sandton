import React, { useState, useEffect } from 'react';
import { CalendarDays, ChevronDown } from 'lucide-react';

const SUBTEXTS = [
  "Here's what's happening on Creative Books SA today.",
  "Every author has a publisher who believed in them. Today, that's you.",
  "Your pipeline is what you make of it.",
  "Yesterday was the foundation. Today is the build.",
  "Great publishing companies are built one author at a time.",
  "The best time to follow up was yesterday. The second best time is now.",
];

const DATE_RANGES = [
  { label: 'Today', value: 'today' },
  { label: 'This Week', value: 'week' },
  { label: 'This Month', value: 'month' },
  { label: 'Last Month', value: 'last_month' },
  { label: 'This Quarter', value: 'quarter' },
  { label: 'This Year', value: 'year' },
];

export default function DashboardHeader({ userName, dateRange, onDateRangeChange }) {
  const [greeting, setGreeting] = useState('');
  const [subtext, setSubtext] = useState('');
  const [showRangeMenu, setShowRangeMenu] = useState(false);

  useEffect(() => {
    const hour = new Date().getHours();
    const firstName = userName?.split(' ')[0] || 'Owner';
    if (hour >= 5 && hour < 12) setGreeting(`Good morning, ${firstName}`);
    else if (hour >= 12 && hour < 17) setGreeting(`Good afternoon, ${firstName}`);
    else if (hour >= 17 && hour < 21) setGreeting(`Good evening, ${firstName}`);
    else setGreeting(`Working late, ${firstName}?`);

    const dayIndex = new Date().getDate() % SUBTEXTS.length;
    setSubtext(SUBTEXTS[dayIndex]);
  }, [userName]);

  const today = new Date().toLocaleDateString('en-ZA', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });

  const selectedRange = DATE_RANGES.find(r => r.value === dateRange) || DATE_RANGES[2];

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 pb-5 border-b border-gray-200">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-0.5">{greeting}</h1>
        <p className="text-gray-500 text-sm">{today}</p>
      </div>

      <div className="relative">
        <button
          onClick={() => setShowRangeMenu(!showRangeMenu)}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:border-gray-400 transition-colors shadow-sm"
        >
          <CalendarDays className="w-4 h-4 text-gray-400" />
          {selectedRange.label}
          <ChevronDown className="w-4 h-4 text-gray-400" />
        </button>

        {showRangeMenu && (
          <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 overflow-hidden min-w-[160px]">
            {DATE_RANGES.map(r => (
              <button
                key={r.value}
                onClick={() => { onDateRangeChange(r.value); setShowRangeMenu(false); }}
                className={`w-full text-left px-4 py-2 text-sm transition-colors ${dateRange === r.value ? 'text-white' : 'hover:bg-gray-50 text-gray-700'}`}
                style={dateRange === r.value ? { background: '#B87333' } : {}}
              >
                {r.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}