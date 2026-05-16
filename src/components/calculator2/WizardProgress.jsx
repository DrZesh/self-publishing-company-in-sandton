import React from 'react';

const LABELS = ['Project','Manuscript','Length','Editing','Design','Layout','Printing','Ebook','Extras','Review'];

export default function WizardProgress({ step, total, shouldSkip }) {
  return (
    <div className="bg-white border-b border-black/10 sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3">
        <div className="flex items-center gap-1">
          {Array.from({ length: total }, (_, i) => i + 1).map((n, idx) => {
            if (shouldSkip(n)) return null;
            const done = n < step;
            const active = n === step;
            return (
              <React.Fragment key={n}>
                <div className="flex flex-col items-center">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                    active ? 'bg-copper text-white shadow-md' :
                    done   ? 'bg-green-500 text-white' :
                             'bg-black/10 text-black/40'
                  }`}>
                    {done ? '✓' : n}
                  </div>
                  <span className={`text-[9px] mt-0.5 font-medium hidden sm:block ${active ? 'text-copper' : done ? 'text-green-600' : 'text-black/30'}`}>
                    {LABELS[n - 1]}
                  </span>
                </div>
                {idx < total - 1 && !shouldSkip(n + 1) && (
                  <div className={`flex-1 h-0.5 mt-0 sm:-mt-3 ${done ? 'bg-green-500' : 'bg-black/10'}`} />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>
    </div>
  );
}