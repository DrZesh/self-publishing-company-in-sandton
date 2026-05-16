import React from 'react';
import StepCard, { OptionCard } from '../StepCard';
import { QTY_MULTIPLIERS, getPrintingCost, formatZAR } from '../../../lib/calculatorPricing';

const QUANTITIES = [100, 150, 200, 250, 300, 400, 500, 1000];

const SPECIAL = [
  { value: 'white_paper',   label: 'White paper instead of cream' },
  { value: 'glossy',        label: 'Glossy interior pages' },
  { value: 'special_bind',  label: 'Special binding (spiral, wire-o, etc.)' },
];

export default function Step7Printing({ answers, update, onNext, onBack }) {
  const { wantPrint, bookSize, copies, pages, stage, specialPrint = [] } = answers;

  if (stage === 'ebook_only_ready') {
    return (
      <StepCard
        heading="Do you want printed copies of your book?"
        sub="You can always reprint later."
        onNext={onNext}
        onBack={onBack}
        canNext={true}
      >
        <div className="p-4 bg-copper/5 rounded-xl border border-copper/20 text-[#2C2C2C]">
          ℹ️ Since you selected "ebook only", printing is skipped. Continue to ebook details →
        </div>
      </StepCard>
    );
  }

  const printResult = wantPrint && bookSize !== 'hardcover'
    ? getPrintingCost(bookSize || 'a5', pages, copies || 100)
    : null;

  const toggleSpecial = (val) => {
    const current = specialPrint || [];
    update({ specialPrint: current.includes(val) ? current.filter(v => v !== val) : [...current, val] });
  };

  return (
    <StepCard
      heading="Do you want printed copies of your book?"
      sub="You can always reprint later — start with what you can sell."
      onNext={onNext}
      onBack={onBack}
      canNext={true}
    >
      {/* Print toggle */}
      <div className="flex gap-3">
        <button onClick={() => update({ wantPrint: true })}
          className={`flex-1 py-3 rounded-xl border-2 font-semibold text-sm transition-all ${wantPrint ? 'border-copper bg-copper text-white' : 'border-black/15 text-black/50 hover:border-copper/40'}`}>
          ✓ Yes — I want printed copies
        </button>
        <button onClick={() => update({ wantPrint: false, bookSize: null })}
          className={`flex-1 py-3 rounded-xl border-2 font-semibold text-sm transition-all ${wantPrint === false ? 'border-copper bg-copper text-white' : 'border-black/15 text-black/50 hover:border-copper/40'}`}>
          ✗ No — ebook only
        </button>
      </div>

      {wantPrint && (
        <>
          {/* Book size */}
          <div className="mt-5">
            <div className="text-sm font-semibold text-[#2C2C2C]/80 mb-3">What size should your book be?</div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { value: 'a5',       label: 'A5 (148×210mm)',     sub: 'Standard SA novel size. Most affordable.', rec: ['adult_fiction','memoir','christian','poetry'] },
                { value: '6x9',      label: '6×9 inch',           sub: 'International standard. Important if distributing globally.', rec: ['adult_nonfiction','academic'] },
                { value: 'hardcover',label: 'Hardcover',          sub: 'Custom Quote Required.' },
              ].map(opt => (
                <button key={opt.value} onClick={() => update({ bookSize: opt.value })}
                  className={`p-4 rounded-xl border-2 text-left transition-all ${bookSize === opt.value ? 'border-copper bg-copper/5' : 'border-black/10 bg-white hover:border-copper/30'}`}>
                  <div className="font-semibold text-sm text-[#1A1208]">{opt.label}</div>
                  <div className="text-xs text-black/50 mt-0.5">{opt.sub}</div>
                  {opt.rec?.includes(answers.projectType) && <div className="text-xs text-copper font-medium mt-1">✨ Recommended</div>}
                  {opt.value === 'hardcover' && <div className="text-xs text-amber-600 mt-1">Custom Quote</div>}
                </button>
              ))}
            </div>
          </div>

          {/* Copies */}
          {bookSize && bookSize !== 'hardcover' && (
            <div className="mt-5">
              <div className="text-sm font-semibold text-[#2C2C2C]/80 mb-3">How many copies?</div>
              <div className="flex flex-wrap gap-2">
                {QUANTITIES.map(qty => (
                  <button key={qty} onClick={() => update({ copies: qty })}
                    className={`px-4 py-2 rounded-full text-sm font-medium border-2 transition-all ${
                      copies === qty ? 'border-copper bg-copper text-white' : 'border-copper/30 text-copper hover:bg-copper/5'
                    }`}>
                    {qty}
                  </button>
                ))}
              </div>

              {printResult && (
                <div className="mt-3 p-3 bg-copper/5 rounded-xl border border-copper/20 text-sm">
                  <span className="text-black/60">Live cost: </span>
                  <strong className="text-copper text-base">{formatZAR(printResult.total)}</strong>
                  <span className="text-black/50 ml-2">({formatZAR(printResult.perCopy)}/book)</span>
                  {copies > 100 && (
                    <div className="text-xs text-black/40 mt-1">Larger orders qualify for better per-copy rates — confirmed in formal quote.</div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Special requirements */}
          {bookSize && bookSize !== 'hardcover' && (
            <details className="mt-4">
              <summary className="text-sm text-copper font-medium cursor-pointer hover:underline">Any special requirements?</summary>
              <div className="mt-3 space-y-2">
                {SPECIAL.map(s => (
                  <label key={s.value} className="flex items-center gap-3 cursor-pointer">
                    <input type="checkbox" checked={(specialPrint || []).includes(s.value)} onChange={() => toggleSpecial(s.value)}
                      className="w-4 h-4 accent-copper rounded" />
                    <span className="text-sm text-[#2C2C2C]">{s.label} <span className="text-black/40">(Custom Quote)</span></span>
                  </label>
                ))}
              </div>
            </details>
          )}
        </>
      )}

      {wantPrint === false && (
        <div className="p-3 bg-copper/5 rounded-xl border border-copper/20 text-sm text-[#2C2C2C]">
          Got it — ebook only. We'll suggest the right ebook package next.
        </div>
      )}
    </StepCard>
  );
}