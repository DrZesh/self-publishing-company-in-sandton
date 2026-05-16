import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { formatZAR, PACKAGES } from '../../lib/calculatorPricing';

function getTimeline(answers, pricing) {
  if (answers.ghostwriting) return '16–22 weeks (incl. ghostwriting)';
  if (pricing.pathA) {
    const key = Object.keys(PACKAGES).find(k => PACKAGES[k].label === pricing.pathA.label);
    if (key?.startsWith('mini')) return '4–6 weeks';
    if (key?.includes('gold')) return '10–12 weeks';
    return '8–10 weeks';
  }
  if (!answers.wantPrint && answers.wantEbook) return '3–4 weeks';
  return '6–10 weeks';
}

function SidebarHint({ pricing, answers }) {
  const hints = [];
  if (pricing.pathA && pricing.pathATotal < pricing.pathBTotal) {
    hints.push({ icon: '💡', text: `A bundled package could save you ${formatZAR(pricing.pathBTotal - pricing.pathATotal)}. We'll show both options at the end.`, type: 'save' });
  }
  if (pricing.pathA && answers.pages > pricing.pathA.maxPages) {
    hints.push({ icon: '⚠️', text: `Your manuscript (${answers.pages} pages) exceeds the ${pricing.pathA.label} limit. We'll suggest an upgrade.`, type: 'warn' });
  }
  if (!hints.length) return null;
  return (
    <div className="space-y-2 mt-4">
      {hints.map((h, i) => (
        <div key={i} className={`p-3 rounded-xl text-xs leading-relaxed ${h.type === 'save' ? 'bg-emerald-50 border border-emerald-200 text-emerald-800' : 'bg-amber-50 border border-amber-200 text-amber-800'}`}>
          {h.icon} {h.text}
        </div>
      ))}
    </div>
  );
}

export default function EstimateSidebar({ answers, pricing, inclVat, setInclVat, step, onGoToReview }) {
  const { lines, pathBTotal, recommendation } = pricing;
  const subtotal = pathBTotal;
  const vat = inclVat ? Math.round(subtotal * 0.15) : 0;
  const total = subtotal + vat;
  const deposit = Math.round(total * 0.75);
  const balance = total - deposit;
  const timeline = getTimeline(answers, pricing);

  return (
    <div className="bg-white rounded-2xl border border-black/10 shadow-sm overflow-hidden sticky top-20">
      {/* Header */}
      <div className="bg-[#0A0806] px-5 py-4">
        <div className="flex items-center justify-between">
          <span className="text-white/80 text-sm font-medium">Your Estimate So Far</span>
          <button onClick={() => setInclVat(!inclVat)} className="text-xs text-copper border border-copper/30 px-2 py-1 rounded-full hover:bg-copper/10 transition-all">
            {inclVat ? 'Inc. VAT' : 'Ex. VAT'}
          </button>
        </div>
        <div className="mt-2">
          <motion.div key={total} initial={{ opacity: 0.5, y: -4 }} animate={{ opacity: 1, y: 0 }}
            className="font-heading text-3xl font-bold text-copper">
            {total > 0 ? formatZAR(total) : 'R –'}
          </motion.div>
          {total > 0 && <div className="text-white/40 text-xs mt-0.5">{inclVat ? 'incl. VAT' : 'excl. VAT'}</div>}
        </div>
      </div>

      <div className="p-5 space-y-4 max-h-[60vh] overflow-y-auto">
        {/* Line items */}
        {lines.length === 0 ? (
          <p className="text-xs text-black/40 text-center py-4">Answer the questions to build your estimate.</p>
        ) : (
          <div className="space-y-2">
            <AnimatePresence>
              {lines.map(line => (
                <motion.div key={line.id}
                  initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, height: 0 }}
                  className="flex items-start justify-between gap-2 py-2 border-b border-black/5 last:border-0">
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-semibold text-[#1A1208] truncate">{line.label}</div>
                    <div className="text-xs text-black/40 truncate">{line.sub}</div>
                  </div>
                  <div className="text-xs font-bold text-right flex-shrink-0">
                    {line.custom ? <span className="text-amber-600">Custom Quote</span> : <span className="text-copper">{formatZAR(line.amount)}</span>}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}

        {/* Payment structure */}
        {total > 0 && (
          <div className="pt-3 border-t border-black/10 space-y-1">
            <div className="text-xs font-semibold text-black/50 uppercase tracking-wide mb-2">Payment Structure</div>
            <div className="flex justify-between text-xs"><span className="text-black/60">75% deposit to start</span><span className="font-semibold">{formatZAR(deposit)}</span></div>
            <div className="flex justify-between text-xs"><span className="text-black/60">25% on completion</span><span className="font-semibold">{formatZAR(balance)}</span></div>
          </div>
        )}

        {/* Timeline */}
        <div className="pt-3 border-t border-black/10">
          <div className="text-xs text-black/50">⏱ Estimated timeline: <strong className="text-[#1A1208]">{timeline}</strong></div>
        </div>

        <SidebarHint pricing={pricing} answers={answers} />
      </div>

      {/* Footer */}
      <div className="px-5 pb-5">
        <div className="text-xs text-black/30 text-center mb-3">Step {step} of 10</div>
        {step >= 5 && (
          <button onClick={onGoToReview}
            className="w-full py-2.5 bg-copper text-white rounded-full text-sm font-semibold hover:bg-copper/90 transition-all shadow-md">
            View Full Quote →
          </button>
        )}
      </div>
    </div>
  );
}