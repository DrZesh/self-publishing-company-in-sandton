import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import StepCard from '../StepCard';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';

const WORDS_PER_PAGE = 250;

function validate(pages, words) {
  const errors = {};
  if (pages < 50 || pages > 400) errors.pages = true;
  if (words < 12500 || words > 100000) errors.words = true;
  return errors;
}

export default function Step3Length({ answers, update, onNext, onBack }) {
  const [flashPages, setFlashPages] = useState(false);
  const [flashWords, setFlashWords] = useState(false);
  const pagesTimer = useRef(null);
  const wordsTimer = useRef(null);

  const errors = validate(answers.pages, answers.words);
  const isGhostwriting = answers.stage === 'idea';

  const handlePagesChange = (val) => {
    const p = parseInt(val) || 0;
    const w = Math.round(p * WORDS_PER_PAGE);
    update({ pages: p, words: w });
    setFlashWords(true);
    clearTimeout(wordsTimer.current);
    wordsTimer.current = setTimeout(() => setFlashWords(false), 400);
    base44.analytics.track({ eventName: 'pages_changed', properties: { pages: p } });
  };

  const handleWordsChange = (val) => {
    const w = parseInt(val) || 0;
    const p = Math.round(w / WORDS_PER_PAGE);
    update({ words: w, pages: p });
    setFlashPages(true);
    clearTimeout(pagesTimer.current);
    pagesTimer.current = setTimeout(() => setFlashPages(false), 400);
    base44.analytics.track({ eventName: 'words_changed', properties: { words: w } });
  };

  const hasError = errors.pages || errors.words;
  const canContinue = true; // allow even out-of-range (flag for custom quote)

  return (
    <StepCard
      heading={isGhostwriting ? "How long do you want your finished book to be?" : "How long is your book?"}
      sub={isGhostwriting ? "An estimate is fine — we can refine this." : "Enter whichever number you know — we'll calculate the other automatically."}
      onNext={onNext}
      onBack={onBack}
      canNext={canContinue}
    >
      {/* Paired inputs */}
      <div className="bg-white rounded-2xl border border-black/10 p-6">
        <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-end">
          {/* Pages */}
          <div className="flex-1">
            <label className="block text-xs font-semibold text-[#2C2C2C]/70 mb-1.5 uppercase tracking-wide">Pages</label>
            <motion.input
              type="number"
              inputMode="numeric"
              min={1}
              value={answers.pages}
              onChange={e => handlePagesChange(e.target.value)}
              animate={{ backgroundColor: flashPages ? '#B8733322' : '#ffffff' }}
              transition={{ duration: 0.3 }}
              className={`w-full px-4 py-3 rounded-xl border-2 text-lg font-bold text-[#1A1208] focus:outline-none transition-colors ${
                errors.pages ? 'border-red-400' : flashPages ? 'border-copper' : 'border-black/15 focus:border-copper'
              }`}
            />
            <div className="text-xs text-black/40 mt-1">min 50 · max 400</div>
          </div>

          {/* Lock icon */}
          <div className="flex items-center justify-center sm:pb-6">
            <div className="w-9 h-9 rounded-full bg-copper/10 flex items-center justify-center">
              <span className="text-copper text-sm">🔒</span>
            </div>
          </div>

          {/* Words */}
          <div className="flex-1">
            <label className="block text-xs font-semibold text-[#2C2C2C]/70 mb-1.5 uppercase tracking-wide">Words</label>
            <motion.input
              type="number"
              inputMode="numeric"
              min={1}
              value={answers.words}
              onChange={e => handleWordsChange(e.target.value)}
              animate={{ backgroundColor: flashWords ? '#B8733322' : '#ffffff' }}
              transition={{ duration: 0.3 }}
              className={`w-full px-4 py-3 rounded-xl border-2 text-lg font-bold text-[#1A1208] focus:outline-none transition-colors ${
                errors.words ? 'border-red-400' : flashWords ? 'border-copper' : 'border-black/15 focus:border-copper'
              }`}
            />
            <div className="text-xs text-black/40 mt-1">min 12,500 · max 100,000</div>
          </div>
        </div>

        {hasError && (
          <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-900 flex items-center justify-between gap-3">
            <span>For manuscripts outside the standard range, we'll include a custom quote note.</span>
            <Link to="/getquote" className="text-copper font-semibold whitespace-nowrap hover:underline">Custom Quote →</Link>
          </div>
        )}

        <div className="mt-4 text-xs text-black/40 leading-relaxed">
          Most novels: 60,000–90,000 words (240–360 pages) &nbsp;·&nbsp; Most memoirs: 50,000–80,000 words &nbsp;·&nbsp; Most non-fiction: 40,000–60,000 words &nbsp;·&nbsp; <span className="italic">1 page = 250 words</span>
        </div>
      </div>
    </StepCard>
  );
}