import React from 'react';
import StepCard, { OptionCard } from '../StepCard';
import { COVER_DESIGN, formatZAR } from '../../../lib/calculatorPricing';

const OPTIONS = [
  { value: 'authors',    icon: '📷', title: "Use my own image / artwork", sub: "We design a professional cover around your image." },
  { value: 'stock',      icon: '🖼️', title: "Use a stock image — clean, photographic", sub: "We source the image (Shutterstock licensing included)." },
  { value: 'illustrated',icon: '🎨', title: "Custom illustrated cover", sub: "Hand-drawn or digital illustration designed for your book." },
  { value: 'premium',    icon: '🏆', title: "Premium / hardcover / specialty cover", sub: "Custom quote — foil, embossing, dust jacket, etc." },
];

const RECOMMENDATIONS = {
  adult_fiction:    'stock',
  memoir:           'authors',
  adult_nonfiction: 'stock',
  poetry:           'illustrated',
  christian:        'stock',
  academic:         'stock',
  other:            'stock',
};

const EBOOK_VARIANTS = [
  { value: 'no',   label: 'No ebook cover needed' },
  { value: 'yes',  label: 'Yes — add ebook cover too' },
  { value: 'later',label: 'Decide later' },
];

export default function Step5Cover({ answers, update, onNext, onBack }) {
  const { coverTier, coverEbook, projectType } = answers;
  const recommended = RECOMMENDATIONS[projectType];

  const priceFor = (tier) => {
    if (tier === 'premium') return 'Custom Quote';
    return formatZAR(COVER_DESIGN.paperback[tier]);
  };

  return (
    <StepCard
      heading="What style of cover do you have in mind?"
      sub="Cover quality is the single biggest factor in whether someone clicks 'buy'."
      onNext={onNext}
      onBack={onBack}
      canNext={!!coverTier}
    >
      {OPTIONS.map(opt => (
        <OptionCard
          key={opt.value} {...opt}
          badge={opt.value === recommended ? '✨ Recommended' : opt.value !== 'premium' ? priceFor(opt.value) : 'Custom Quote'}
          selected={coverTier === opt.value}
          onClick={() => update({ coverTier: opt.value })}
        />
      ))}

      {coverTier && coverTier !== 'premium' && (
        <div className="mt-4 p-4 bg-copper/5 rounded-xl border border-copper/20">
          <div className="text-sm font-semibold text-[#1A1208] mb-3">Will you also need an ebook version of the cover?</div>
          <div className="flex flex-wrap gap-2">
            {EBOOK_VARIANTS.map(v => (
              <button key={v.value} onClick={() => update({ coverEbook: v.value })}
                className={`px-4 py-2 rounded-full text-sm font-medium border-2 transition-all ${
                  coverEbook === v.value ? 'border-copper bg-copper text-white' : 'border-copper/30 text-copper hover:bg-copper/5'
                }`}>
                {v.label}
                {v.value === 'yes' && coverTier && coverTier !== 'premium' && (
                  <span className="ml-1 text-xs opacity-80">+ {formatZAR(COVER_DESIGN.ebook[coverTier])}</span>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </StepCard>
  );
}