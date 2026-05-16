import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { formatZAR } from '../../lib/calculatorPricing';
import { X } from 'lucide-react';

export default function MobileEstimateBar({ answers, pricing, inclVat, step, onNext, canNext }) {
  const [expanded, setExpanded] = useState(false);
  const { lines, pathBTotal } = pricing;
  const vat = inclVat ? Math.round(pathBTotal * 0.15) : 0;
  const total = pathBTotal + vat;

  return (
    <>
      {/* Fixed bottom bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#0A0806] border-t border-copper/20 safe-area-bottom">
        <div className="flex items-center gap-3 px-4 py-3">
          <button onClick={() => setExpanded(true)} className="flex-1 text-left">
            <div className="text-xs text-white/50">Estimate so far</div>
            <div className="font-heading text-xl font-bold text-copper">{total > 0 ? formatZAR(total) : 'R –'}</div>
          </button>
          <button onClick={onNext} disabled={!canNext}
            className="px-6 py-3 bg-copper text-white rounded-full font-semibold text-sm disabled:opacity-40 whitespace-nowrap">
            Continue →
          </button>
        </div>
      </div>

      {/* Full-screen overlay */}
      <AnimatePresence>
        {expanded && (
          <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: 'tween', duration: 0.3 }}
            className="lg:hidden fixed inset-0 z-50 bg-white overflow-y-auto pb-24">
            <div className="bg-[#0A0806] px-5 py-5 flex items-center justify-between">
              <div>
                <div className="text-white/60 text-sm">Your Estimate</div>
                <div className="font-heading text-3xl font-bold text-copper mt-1">{total > 0 ? formatZAR(total) : 'R –'}</div>
              </div>
              <button onClick={() => setExpanded(false)} className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                <X className="w-5 h-5 text-white" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              {lines.length === 0 ? (
                <p className="text-sm text-black/40 text-center py-8">Keep answering questions to build your estimate.</p>
              ) : lines.map(line => (
                <div key={line.id} className="flex items-start justify-between gap-3 pb-3 border-b border-black/5 last:border-0">
                  <div>
                    <div className="text-sm font-semibold text-[#1A1208]">{line.label}</div>
                    <div className="text-xs text-black/40">{line.sub}</div>
                  </div>
                  <div className="text-sm font-bold">
                    {line.custom ? <span className="text-amber-600">Custom</span> : <span className="text-copper">{formatZAR(line.amount)}</span>}
                  </div>
                </div>
              ))}

              {total > 0 && (
                <div className="p-4 bg-copper/5 rounded-xl border border-copper/20">
                  <div className="flex justify-between text-sm mb-1"><span className="text-black/60">75% deposit to start</span><span className="font-semibold">{formatZAR(Math.round(total * 0.75))}</span></div>
                  <div className="flex justify-between text-sm"><span className="text-black/60">25% on completion</span><span className="font-semibold">{formatZAR(Math.round(total * 0.25))}</span></div>
                </div>
              )}

              <button onClick={() => { setExpanded(false); onNext(); }}
                className="w-full py-4 bg-copper text-white rounded-full font-semibold text-base shadow-lg mt-4">
                Continue →
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}