import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

export default function Breadcrumbs({ items = [], light = false }) {
  if (!items.length) return null;

  const allItems = [{ label: 'Home', path: '/' }, ...items];
  const textColor = light ? 'text-white/40' : 'text-[#0F0F0F]/40';
  const activeColor = light ? 'text-copper' : 'text-copper';
  const linkColor = light ? 'text-white/60 hover:text-copper' : 'text-[#0F0F0F]/60 hover:text-copper';

  return (
    <nav aria-label="Breadcrumb" className="py-3">
      <ol className="flex flex-wrap items-center gap-1 text-xs font-body">
        {allItems.map((item, i) => {
          const isLast = i === allItems.length - 1;
          return (
            <li key={i} className="flex items-center gap-1">
              {i === 0 && <Home className="w-3 h-3 shrink-0" />}
              {isLast ? (
                <span className={activeColor}>{item.label}</span>
              ) : (
                <Link to={item.path} className={`transition-colors ${linkColor}`}>{item.label}</Link>
              )}
              {!isLast && <ChevronRight className={`w-3 h-3 shrink-0 ${textColor}`} />}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}