import React from 'react';
import { motion } from 'framer-motion';

export default function StepCard({ heading, sub, children, onNext, onBack, canNext = true, nextLabel = 'Continue →', showBack = true }) {
  return (
    <div className="max-w-2xl">
      <h2 className="font-heading text-2xl sm:text-3xl font-bold text-[#1A1208] mb-2">{heading}</h2>
      {sub && <p className="text-[#2C2C2C]/60 mb-8 text-sm sm:text-base">{sub}</p>}
      <div className="space-y-3">{children}</div>
      <div className="flex gap-3 mt-8">
        {showBack && (
          <button onClick={onBack} className="px-6 py-3 border-2 border-copper text-copper rounded-full font-medium hover:bg-copper/5 transition-all text-sm">
            ← Back
          </button>
        )}
        <button onClick={onNext} disabled={!canNext}
          className="flex-1 sm:flex-none sm:px-10 py-3 bg-copper text-white rounded-full font-semibold shadow-md hover:bg-copper/90 disabled:opacity-40 disabled:cursor-not-allowed transition-all text-sm">
          {nextLabel}
        </button>
      </div>
    </div>
  );
}

export function OptionCard({ icon, title, sub, selected, onClick, badge }) {
  return (
    <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
        selected ? 'border-copper bg-copper/8 shadow-sm' : 'border-black/10 bg-white hover:border-copper/40'
      }`}>
      <div className="flex items-start gap-3">
        {icon && <span className="text-2xl flex-shrink-0 mt-0.5">{icon}</span>}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-[#1A1208] text-sm">{title}</span>
            {badge && <span className="text-xs font-bold text-copper bg-copper/10 px-2 py-0.5 rounded-full">{badge}</span>}
          </div>
          {sub && <p className="text-xs text-[#2C2C2C]/60 mt-0.5 leading-relaxed">{sub}</p>}
        </div>
        <div className={`w-5 h-5 rounded-full border-2 flex-shrink-0 mt-0.5 transition-all ${
          selected ? 'border-copper bg-copper' : 'border-black/20'
        }`}>
          {selected && <svg viewBox="0 0 10 10" className="w-full h-full text-white p-1"><polyline points="1,5 4,8 9,2" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>}
        </div>
      </div>
    </motion.button>
  );
}