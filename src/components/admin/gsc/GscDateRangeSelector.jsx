import React, { useState } from 'react';
import { Calendar, RefreshCw, ChevronDown } from 'lucide-react';

const PRESETS = [
  { label: '7d', days: 7 },
  { label: '28d', days: 28 },
  { label: '3mo', days: 90 },
  { label: '6mo', days: 180 },
  { label: '12mo', days: 365 },
  { label: '16mo', days: 488 },
];

export default function GscDateRangeSelector({ days, onDaysChange, compare, onCompareChange, onRefresh, refreshing, lastDate }) {
  const [showCustom, setShowCustom] = useState(false);
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');

  const maxDate = (() => {
    const d = new Date(); d.setDate(d.getDate() - 3); return d.toISOString().slice(0, 10);
  })();

  return (
    <div className="flex flex-wrap items-center gap-3">
      {/* Preset chips */}
      <div className="flex flex-wrap items-center gap-1">
        {PRESETS.map(p => (
          <button key={p.days} onClick={() => { onDaysChange(p.days); setShowCustom(false); }}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${days === p.days && !showCustom ? 'bg-[#B87333] text-white' : 'bg-white border border-black/10 text-black/60 hover:border-[#B87333]'}`}>
            {p.label}
          </button>
        ))}
        <button onClick={() => setShowCustom(!showCustom)}
          className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium transition-all ${showCustom ? 'bg-[#B87333] text-white' : 'bg-white border border-black/10 text-black/60 hover:border-[#B87333]'}`}>
          <Calendar className="w-3 h-3" />
          Custom
          <ChevronDown className={`w-3 h-3 transition-transform ${showCustom ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {/* Custom date range */}
      {showCustom && (
        <div className="flex items-center gap-2 bg-white border border-black/10 rounded-xl px-3 py-1.5">
          <input type="date" value={customStart} onChange={e => setCustomStart(e.target.value)} max={maxDate}
            className="text-xs border-none outline-none text-black/70" />
          <span className="text-black/30 text-xs">to</span>
          <input type="date" value={customEnd} onChange={e => setCustomEnd(e.target.value)} max={maxDate}
            className="text-xs border-none outline-none text-black/70" />
        </div>
      )}

      {/* Compare toggle */}
      <label className="flex items-center gap-2 cursor-pointer ml-1">
        <div className={`w-8 h-4 rounded-full relative transition-colors ${compare ? 'bg-[#B87333]' : 'bg-black/15'}`}
          onClick={() => onCompareChange(!compare)}>
          <div className={`absolute top-0.5 w-3 h-3 rounded-full bg-white shadow transition-all ${compare ? 'left-4' : 'left-0.5'}`} />
        </div>
        <span className="text-xs text-black/60">Compare to prior period</span>
      </label>

      {/* Last updated */}
      {lastDate && (
        <span className="text-xs text-black/30 ml-auto hidden sm:block">
          GSC data as of {lastDate} (2–3 day delay)
        </span>
      )}

      {/* Refresh */}
      <button onClick={onRefresh} disabled={refreshing}
        className="flex items-center gap-1.5 text-xs text-[#B87333] hover:text-[#9a6129] disabled:opacity-40 transition-colors">
        <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
        {refreshing ? 'Refreshing…' : 'Refresh'}
      </button>
    </div>
  );
}