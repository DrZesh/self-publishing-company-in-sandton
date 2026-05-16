import React from 'react';
import StepCard, { OptionCard } from '../StepCard';
import { EBOOK_PRICE, formatZAR } from '../../../lib/calculatorPricing';

const OPTIONS = [
  { value: 'kindle',  icon: '📱', title: `Yes — Amazon Kindle ready (${formatZAR(EBOOK_PRICE)})`,            sub: 'Converted, formatted, uploaded to Amazon KDP.' },
  { value: 'multi',   icon: '📱', title: `Yes — Multi-platform (${formatZAR(EBOOK_PRICE)} + platform setup)`, sub: 'Amazon + Apple Books + Google Play. Maximum reach.' },
  { value: 'no',      icon: '❌', title: 'No — print only',                                                   sub: 'You can always add an ebook later.' },
  { value: 'unsure',  icon: '❓', title: 'Not sure — recommend',                                              sub: "Most authors earn passive income from Kindle even without active marketing." },
];

export default function Step8Ebook({ answers, update, onNext, onBack }) {
  const { wantEbook } = answers;

  const ebookVal = wantEbook === true ? 'kindle' : wantEbook === false ? 'no' : wantEbook;

  return (
    <StepCard
      heading="Do you want an ebook version of your book?"
      sub="Ebooks reach readers worldwide and earn passive income on Amazon."
      onNext={onNext}
      onBack={onBack}
      canNext={wantEbook !== null && wantEbook !== undefined}
    >
      {OPTIONS.map(opt => (
        <OptionCard key={opt.value} {...opt}
          selected={ebookVal === opt.value}
          onClick={() => update({ wantEbook: opt.value === 'no' ? false : opt.value === 'unsure' ? 'kindle' : opt.value })}
        />
      ))}
      {ebookVal === 'unsure' && (
        <div className="p-3 bg-copper/5 rounded-xl border border-copper/20 text-sm text-[#2C2C2C]">
          💡 Recommendation: Yes — Amazon Kindle. We've added it to your estimate.
        </div>
      )}
    </StepCard>
  );
}