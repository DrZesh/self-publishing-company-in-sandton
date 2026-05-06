import React from 'react';
import { CheckCircle } from 'lucide-react';

export default function QuoteProgress({ step, labels }) {
  return (
    <div className="w-full overflow-x-auto pb-1">
      <div className="flex items-center min-w-max mx-auto px-2">
        {labels.map((label, i) => {
          const done = i < step;
          const active = i === step;
          return (
            <React.Fragment key={i}>
              <div className="flex flex-col items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-heading font-bold transition-all
                  ${done ? 'bg-copper text-white' : active ? 'bg-obsidian text-white ring-2 ring-copper ring-offset-2' : 'bg-[#0F0F0F]/10 text-[#0F0F0F]/40'}`}>
                  {done ? <CheckCircle className="w-4 h-4" /> : i + 1}
                </div>
                <span className={`text-[10px] mt-1 font-body whitespace-nowrap hidden sm:block
                  ${active ? 'text-copper font-medium' : done ? 'text-[#0F0F0F]/60' : 'text-[#0F0F0F]/30'}`}>
                  {label}
                </span>
              </div>
              {i < labels.length - 1 && (
                <div className={`h-0.5 w-8 md:w-10 mx-1 rounded transition-all ${i < step ? 'bg-copper' : 'bg-[#0F0F0F]/10'}`} />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}