// The ONE calendar used by both the client portal (picking a collection/delivery day)
// and the CRM appointments page. Styling comes from CSS variables on .cbc (light or dark).
import React, { useRef } from 'react';
import Icon from './Icon.jsx';
import { fmtDayLong, monthGrid, monthName, todaySast } from './dates.js';

/**
 * props:
 *  year, month (0-11), onMonth(year, month)
 *  selected: 'YYYY-MM-DD' | null, onSelect(day)
 *  info(day) → { disabled?: bool, reason?: string, dots?: ['amber'|'green'|'blue'|'red'], count?: number }
 *  minMonth / maxMonth: 'YYYY-MM' limits for navigation (optional)
 */
export default function Calendar({ year, month, onMonth, selected, onSelect, info = () => ({}), minMonth, maxMonth, loading }) {
  const grid = monthGrid(year, month);
  const today = todaySast();
  const ref = useRef(null);
  const key = `${year}-${String(month + 1).padStart(2, '0')}`;
  const canPrev = !minMonth || key > minMonth;
  const canNext = !maxMonth || key < maxMonth;
  const go = (delta) => { const d = new Date(year, month + delta, 1); onMonth(d.getFullYear(), d.getMonth()); };

  // arrow-key navigation between day buttons
  const onKey = (e) => {
    const moves = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -7, ArrowDown: 7 };
    if (!(e.key in moves)) return;
    const btns = [...ref.current.querySelectorAll('button[data-day]')];
    const i = btns.indexOf(document.activeElement);
    if (i < 0) return;
    e.preventDefault();
    const next = btns[Math.min(btns.length - 1, Math.max(0, i + moves[e.key]))];
    next?.focus();
  };

  return (
    <div className="cbc" ref={ref}>
      <div className="cbc-head">
        <button type="button" className="cbc-nav" onClick={() => go(-1)} disabled={!canPrev} aria-label="Previous month"><Icon name="left" /></button>
        <span className="cbc-title" aria-live="polite">{monthName(month)} {year}{loading ? <span className="cbc-load"> · loading…</span> : null}</span>
        <button type="button" className="cbc-nav" onClick={() => go(1)} disabled={!canNext} aria-label="Next month"><Icon name="right" /></button>
      </div>
      <div className="cbc-grid" role="grid" onKeyDown={onKey}>
        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((d) => <span key={d} className="cbc-dow" role="columnheader">{d.slice(0, 2)}</span>)}
        {grid.map((c) => {
          const i = info(c.day) || {};
          const isSel = selected === c.day;
          const cls = ['cbc-day', !c.inMonth && 'out', c.day === today && 'today', isSel && 'sel', i.disabled && 'off'].filter(Boolean).join(' ');
          return (
            <button key={c.day} type="button" data-day={c.day} className={cls} disabled={i.disabled} aria-pressed={isSel}
              aria-label={`${fmtDayLong(c.day)}${i.reason ? `, ${i.reason}` : ''}${i.count ? `, ${i.count} item${i.count === 1 ? '' : 's'}` : ''}`}
              title={i.reason || undefined} onClick={() => onSelect(c.day)}>
              <span className="n">{c.date}</span>
              {i.dots?.length ? <span className="dots">{i.dots.slice(0, 3).map((d, k) => <i key={k} className={d} />)}</span> : null}
            </button>
          );
        })}
      </div>
    </div>
  );
}
