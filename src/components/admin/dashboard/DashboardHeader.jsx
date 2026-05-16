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
    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-8">
      <div>
        <h1 className="text-3xl lg:text-4xl font-bold text-[#0B1220] font-heading mb-1">{greeting}</h1>
        <p className="text-[#2B2B2B]/60 text-sm">{today}</p>
        <p className="text-[#2B2B2B]/40 text-xs mt-1 italic">{subtext}</p>
      </div>

      <div className="relative">
        <button
          onClick={() => setShowRangeMenu(!showRangeMenu)}
          className="flex items-center gap-2 px-4 py-2.5 bg-white border border-[#ddd] rounded-xl text-sm font-medium text-[#1A1208] hover:border-[#B87333] transition-colors shadow-sm"
        >
          <CalendarDays className="w-4 h-4 text-[#B87333]" />
          {selectedRange.label}
          <ChevronDown className="w-4 h-4 text-[#2B2B2B]/40" />
        </button>

        {showRangeMenu && (
          <div className="absolute right-0 top-full mt-1 bg-white border border-[#ddd] rounded-xl shadow-lg z-50 overflow-hidden min-w-[160px]">
            {DATE_RANGES.map(r => (
              <button
                key={r.value}
                onClick={() => { onDateRangeChange(r.value); setShowRangeMenu(false); }}
                className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${dateRange === r.value ? 'bg-[#B87333] text-white' : 'hover:bg-[#F9F7F2] text-[#1A1208]'}`}
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