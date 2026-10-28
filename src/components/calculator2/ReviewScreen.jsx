import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { formatZAR, PACKAGES } from '../../lib/calculatorPricing';
import { platform } from '@/api/platformClient';

const EXTRA_LABELS = {
  author_website: 'Author Website', book_launch: 'Book Launch & Marketing', rollup_banner: 'Roll-up Banner',
  book_trailer: 'Book Trailer', press_release: 'Press Release', launch_event: 'Launch Event Planning',
  distribution: 'International Distribution', isbn: 'ISBN Registration', audiobook: 'Audiobook',
  speaking_coaching: 'Speaking Coaching',
};

const PROJECT_LABELS = {
  adult_fiction:'Adult Fiction', adult_nonfiction:'Adult Non-Fiction', memoir:'Memoir/Biography',
  poetry:'Poetry', academic:'Academic/Educational', childrens:"Children's Book", christian:'Christian/Spiritual', other:'Other',
};
const STAGE_LABELS = {
  idea:'Just an idea', in_progress:'Writing in progress', first_draft:'First draft complete',
  already_edited:'Already edited', fully_designed:'Fully designed', ebook_only_ready:'Ready for ebook only',
};
const TIMELINE_LABELS = {
  asap:'ASAP', '2_3_months':'Within 2–3 months', '3_6_months':'Within 3–6 months',
  '6_plus':'6 months+', exploring:'Just exploring',
};

function QuickAddChip({ label, onAdd }) {
  return (
    <button onClick={onAdd}
      className="px-3 py-1.5 rounded-full border border-copper text-copper text-xs font-medium hover:bg-copper hover:text-white transition-all">
      + {label}
    </button>
  );
}

export default function ReviewScreen({ answers, pricing, inclVat, setInclVat, update, onBack, onEmail, onPdf, onTalkToPublisher }) {
  const [chosenPath, setChosenPath] = useState(pricing.recommendation);
  const { lines, pathBTotal, pathA, pathATotal, recommendation, hasCustomOnly } = pricing;

  const subtotal = chosenPath === 'A' && pathATotal ? pathATotal : pathBTotal;
  const vat = inclVat ? Math.round(subtotal * 0.15) : 0;
  const total = subtotal + vat;
  const deposit = Math.round(total * 0.75);
  const balance = total - deposit;

  const quoteRef = React.useMemo(() => {
    const d = new Date().toISOString().slice(0, 10);
    return `CB-EST-${d}-${String(Math.floor(1000 + Math.random() * 9000))}`;
  }, []);

  const savePath = (path) => {
    setChosenPath(path);
    update({ chosenPath: path });
    platform.analytics.track({ eventName: path === 'A' ? 'option_a_selected' : 'option_b_selected', properties: { total: subtotal } });
  };

  // Quick-add chips — items not already in quote
  const inQuote = lines.map(l => l.id);
  const quickAdd = [];
  if (!inQuote.includes('ebook') && !answers.wantEbook) quickAdd.push({ label: 'Ebook Version', action: () => update({ wantEbook: 'kindle' }) });
  if (!inQuote.includes('cover') && !answers.coverTier) quickAdd.push({ label: 'Cover Design', action: () => update({ coverTier: 'stock' }) });
  if (!inQuote.find(id => id.startsWith('extra_author_website'))) quickAdd.push({ label: 'Author Website Quote', action: () => update({ extras: [...(answers.extras||[]), 'author_website'] }) });
  if (!inQuote.find(id => id.startsWith('extra_audiobook'))) quickAdd.push({ label: 'Audiobook Quote', action: () => update({ extras: [...(answers.extras||[]), 'audiobook'] }) });

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 pb-24">
      {/* Back */}
      <button onClick={onBack} className="text-sm text-black/40 hover:text-copper mb-6 flex items-center gap-1 transition-colors">
        ← Edit my answers
      </button>

      <h1 className="font-heading text-3xl sm:text-4xl font-bold text-[#1A1208] mb-2">Your Publishing Quote</h1>
      <p className="text-black/50 mb-8">Based on your answers, here are your best pricing options.</p>

      {/* Comparison cards */}
      {!hasCustomOnly ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-8">
          {/* Path A */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            onClick={() => pathA && savePath('A')}
            className={`p-6 rounded-2xl border-2 cursor-pointer transition-all ${
              chosenPath === 'A' ? 'border-copper shadow-lg bg-copper/5' : pathA ? 'border-black/15 bg-white hover:border-copper/40' : 'border-black/10 bg-black/3 opacity-60 cursor-not-allowed'
            }`}>
            <div className="flex items-center justify-between mb-4">
              <div className="font-semibold text-sm text-black/50">📦 BUNDLED PACKAGE</div>
              {recommendation === 'A' && pathA && <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full font-bold">✓ RECOMMENDED</span>}
            </div>
            {pathA ? (
              <>
                <div className="font-heading text-xl font-bold text-[#1A1208] mb-1">{pathA.label}</div>
                <div className="font-heading text-3xl font-bold text-copper mb-4">{formatZAR(pathATotal)}</div>
                <div className="space-y-1 text-sm text-black/60">
                  <div>✓ Up to {pathA.maxPages} pages / {(pathA.maxWords / 1000).toFixed(0)}k words</div>
                  <div>✓ {pathA.copies > 0 ? `${pathA.copies} copies` : 'Digital only'}</div>
                  <div>✓ Editing included</div>
                  <div>✓ Cover design included</div>
                  <div>✓ Typesetting included</div>
                  {pathA.includesEbook && <div>✓ Ebook formatting included</div>}
                  <div>✓ Facebook banner + book mockups</div>
                  <div>✓ ISBN + barcode (free)</div>
                  <div>✓ Publishing consultation</div>
                </div>
                <button onClick={() => savePath('A')}
                  className={`w-full mt-5 py-2.5 rounded-full text-sm font-semibold transition-all ${chosenPath === 'A' ? 'bg-copper text-white' : 'border-2 border-copper text-copper hover:bg-copper hover:text-white'}`}>
                  {chosenPath === 'A' ? '✓ Selected' : 'Select This Option'}
                </button>
              </>
            ) : (
              <div className="text-sm text-black/50 py-4">No package fits your selections — see à la carte option.</div>
            )}
          </motion.div>

          {/* Path B */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            onClick={() => savePath('B')}
            className={`p-6 rounded-2xl border-2 cursor-pointer transition-all ${
              chosenPath === 'B' ? 'border-copper shadow-lg bg-copper/5' : 'border-black/15 bg-white hover:border-copper/40'
            }`}>
            <div className="flex items-center justify-between mb-4">
              <div className="font-semibold text-sm text-black/50">🛠️ À LA CARTE</div>
              {recommendation === 'B' && <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full font-bold">✓ RECOMMENDED</span>}
            </div>
            <div className="font-heading text-xl font-bold text-[#1A1208] mb-1">Custom build</div>
            <div className="font-heading text-3xl font-bold text-copper mb-4">{formatZAR(pathBTotal)}</div>
            <div className="space-y-1 text-sm text-black/60">
              {lines.filter(l => !l.custom).map(l => (
                <div key={l.id}>✓ {l.label} — {formatZAR(l.amount)}</div>
              ))}
              {lines.filter(l => l.custom).map(l => (
                <div key={l.id} className="text-amber-700">◦ {l.label} (custom quote)</div>
              ))}
            </div>
            <button onClick={() => savePath('B')}
              className={`w-full mt-5 py-2.5 rounded-full text-sm font-semibold transition-all ${chosenPath === 'B' ? 'bg-copper text-white' : 'border-2 border-copper text-copper hover:bg-copper hover:text-white'}`}>
              {chosenPath === 'B' ? '✓ Selected' : 'Select This Option'}
            </button>
          </motion.div>
        </div>
      ) : (
        <div className="p-6 bg-amber-50 border border-amber-200 rounded-2xl mb-8">
          <div className="font-heading text-lg font-bold text-amber-900 mb-2">Your project needs a personalised quote</div>
          <p className="text-sm text-amber-800">It includes services that need a custom proposal. Send your details and our team will reply with a full quote within 24 hours.</p>
        </div>
      )}

      {/* Recommendation message */}
      {!hasCustomOnly && pathA && pathBTotal !== pathATotal && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl mb-8 text-sm text-emerald-900">
          💡 We recommend <strong>Option {recommendation}</strong> — it
          {recommendation === 'A' ? ` includes extras (banners, mockups, consultation) AND is ${formatZAR(pathBTotal - pathATotal)} cheaper.` : ` saves you ${formatZAR(pathATotal - pathBTotal)} over the bundled package.`}
        </div>
      )}

      {/* Quote preview */}
      <div className="bg-white rounded-2xl border border-black/10 shadow-sm overflow-hidden mb-8">
        {/* Quote header */}
        <div className="p-6 border-b border-black/10">
          <div className="flex items-start justify-between gap-4">
            <div>
              <img src="https://media.base44.com/images/public/69fb173eeab1ba78da6eab45/a6ae114da_creativelogo.png" alt="Creative Books SA" className="h-10 mb-3" />
              <div className="text-xl font-heading font-bold text-[#1A1208]">Publishing Estimate</div>
            </div>
            <div className="text-right text-sm text-black/50">
              <div>Ref: <span className="font-mono text-xs font-bold text-[#1A1208]">{quoteRef}</span></div>
              <div>Date: {new Date().toLocaleDateString('en-ZA')}</div>
              <div>Valid: 30 days</div>
            </div>
          </div>
        </div>

        {/* Book summary */}
        <div className="p-6 border-b border-black/10">
          <div className="text-xs font-semibold uppercase tracking-widest text-copper mb-3">Book Project Summary</div>
          <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-sm">
            {[
              ['Book Type', PROJECT_LABELS[answers.projectType] || '–'],
              ['Manuscript Stage', STAGE_LABELS[answers.stage] || '–'],
              ['Length', `${answers.pages} pages / ${answers.words?.toLocaleString()} words`],
              ['Book Size', answers.bookSize?.toUpperCase() || '–'],
              ['Target Timeline', TIMELINE_LABELS[answers.timeline] || '–'],
            ].map(([k, v]) => (
              <div key={k}><span className="text-black/50">{k}:</span> <strong className="text-[#1A1208]">{v}</strong></div>
            ))}
          </div>
        </div>

        {/* Line items */}
        <div className="p-6 border-b border-black/10">
          <div className="text-xs font-semibold uppercase tracking-widest text-copper mb-3">
            {chosenPath === 'A' && pathA ? `Selected Option: ${pathA.label}` : 'Selected Option: À La Carte'}
          </div>
          {chosenPath === 'A' && pathA ? (
            <div className="flex justify-between items-center p-3 bg-copper/5 rounded-xl">
              <div>
                <div className="font-semibold text-[#1A1208]">{pathA.label}</div>
                <div className="text-xs text-black/50">Complete publishing package</div>
              </div>
              <div className="font-bold text-copper">{formatZAR(pathATotal)}</div>
            </div>
          ) : (
            <div className="space-y-2">
              {lines.map(l => (
                <div key={l.id} className="flex justify-between items-start py-2 border-b border-black/5 last:border-0 text-sm">
                  <div>
                    <div className="font-medium text-[#1A1208]">{l.label}</div>
                    <div className="text-xs text-black/40">{l.sub}</div>
                  </div>
                  <div className="font-semibold ml-4">{l.custom ? <span className="text-amber-600">Custom Quote</span> : <span className="text-copper">{formatZAR(l.amount)}</span>}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Totals */}
        <div className="p-6">
          <div className="flex items-center justify-between mb-2">
            <button onClick={() => setInclVat(!inclVat)} className="text-xs text-copper underline">
              {inclVat ? 'Hide VAT' : 'Show VAT (15%)'}
            </button>
          </div>
          {inclVat && <div className="flex justify-between text-sm text-black/50 mb-1"><span>Subtotal</span><span>{formatZAR(subtotal)}</span></div>}
          {inclVat && <div className="flex justify-between text-sm text-black/50 mb-3"><span>VAT (15%)</span><span>{formatZAR(vat)}</span></div>}
          <div className="flex justify-between items-center pt-3 border-t-2 border-copper/20">
            <span className="font-heading text-lg font-bold text-[#1A1208]">TOTAL</span>
            <span className="font-heading text-3xl font-bold text-copper">{formatZAR(total)}</span>
          </div>
          <div className="mt-4 p-4 bg-[#F9F7F2] rounded-xl text-sm">
            <div className="flex justify-between mb-1"><span className="text-black/60">75% deposit to start</span><span className="font-bold">{formatZAR(deposit)}</span></div>
            <div className="flex justify-between"><span className="text-black/60">25% on completion</span><span className="font-bold">{formatZAR(balance)}</span></div>
          </div>
          <div className="mt-3 text-xs text-black/40">
            ℹ️ Automated estimate — final pricing confirmed after Creative Books SA reviews your files within 24 hours.
          </div>
        </div>
      </div>

      {/* Quick-add chips */}
      {quickAdd.length > 0 && (
        <div className="mb-8">
          <div className="text-sm font-semibold text-[#2C2C2C] mb-3">Forgot something? Quick-add:</div>
          <div className="flex flex-wrap gap-2">
            {quickAdd.map((qa, i) => (
              <QuickAddChip key={i} label={qa.label} onAdd={qa.action} />
            ))}
          </div>
        </div>
      )}

      {/* Action buttons */}
      <div className="flex flex-col sm:flex-row gap-3">
        <button onClick={onEmail}
          className="flex-1 py-4 bg-copper text-white rounded-full font-bold text-base shadow-lg hover:bg-copper/90 transition-all flex items-center justify-center gap-2">
          📧 Email This Quote to Me
        </button>
        <button onClick={onPdf}
          className="flex-1 py-4 border-2 border-copper text-copper rounded-full font-bold text-base hover:bg-copper/5 transition-all flex items-center justify-center gap-2">
          📥 Download as PDF
        </button>
      </div>
      <div className="text-center mt-4">
        <button onClick={onTalkToPublisher} className="text-sm text-black/40 hover:text-copper transition-colors underline">
          💬 Talk to a publisher instead →
        </button>
      </div>
    </div>
  );
}