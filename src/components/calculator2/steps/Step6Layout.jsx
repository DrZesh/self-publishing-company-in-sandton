import React from 'react';
import StepCard, { OptionCard } from '../StepCard';
import { TYPESETTING, formatZAR } from '../../../lib/calculatorPricing';

const RECOMMENDATIONS = {
  adult_fiction:    'standard',
  memoir:           'standard',
  adult_nonfiction: 'standard',
  poetry:           'basic',
  academic:         'premium',
  christian:        'standard',
  childrens:        'premium',
  other:            'standard',
};

const TIERS = [
  { value: 'basic',    icon: '📄', title: `Simple layout — ${formatZAR(TYPESETTING.basic)}/page`,    rate: TYPESETTING.basic,    sub: 'Clean, no-frills. Best for poetry and short non-fiction.' },
  { value: 'standard', icon: '📖', title: `Standard novel-style — ${formatZAR(TYPESETTING.standard)}/page`, rate: TYPESETTING.standard, sub: 'Author name & book title in headers, drop caps, chapter starts. Best for most fiction and memoir.' },
  { value: 'premium',  icon: '📊', title: `Complex layout — ${formatZAR(TYPESETTING.premium)}/page`,  rate: TYPESETTING.premium,  sub: 'Tables, sidebars, charts. Best for academic, non-fiction with data, training manuals.' },
  { value: 'recommend',icon: '❓', title: 'Recommend based on my book type',                             rate: null,                  sub: 'We\'ll auto-select the best layout for your genre.' },
];

export default function Step6Layout({ answers, update, onNext, onBack }) {
  const { layoutTier, projectType, pages } = answers;
  const recommended = RECOMMENDATIONS[projectType] || 'standard';

  const effTier = layoutTier === 'recommend' ? recommended : layoutTier;
  const cost = effTier && pages ? Math.round((TYPESETTING[effTier] || 0) * pages) : null;

  return (
    <StepCard
      heading="How should the inside of your book look?"
      sub="A well-typeset interior is invisible to the reader. A bad one screams 'amateur'."
      onNext={onNext}
      onBack={onBack}
      canNext={!!layoutTier}
    >
      {TIERS.map(opt => (
        <OptionCard
          key={opt.value} {...opt}
          badge={opt.value !== 'recommend' && pages ? formatZAR(Math.round(opt.rate * pages)) : (opt.value === recommended ? '✨ Recommended' : undefined)}
          selected={layoutTier === opt.value}
          onClick={() => update({ layoutTier: opt.value })}
        />
      ))}
      {layoutTier === 'recommend' && (
        <div className="p-3 bg-copper/5 rounded-xl border border-copper/20 text-sm text-[#2C2C2C]">
          💡 For your book type, we recommend: <strong className="text-copper">{recommended === 'basic' ? 'Simple Layout' : recommended === 'premium' ? 'Complex Layout' : 'Standard Layout'}</strong>
          {cost ? ` — ${formatZAR(cost)} for ${pages} pages` : ''}
        </div>
      )}
      {effTier && pages > 0 && layoutTier !== 'recommend' && (
        <div className="p-3 bg-copper/5 rounded-xl border border-copper/20 text-sm text-[#2C2C2C]">
          Live estimate: {pages} pages × {formatZAR(TYPESETTING[effTier])}/page = <strong className="text-copper">{formatZAR(cost)}</strong>
        </div>
      )}
    </StepCard>
  );
}