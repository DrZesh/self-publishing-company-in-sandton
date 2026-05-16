import React from 'react';
import StepCard, { OptionCard } from '../StepCard';

const OPTIONS = [
  { value: 'idea',            icon: '✍️', title: "Just an idea — I haven't started writing", sub: 'We can write it for you (ghostwriting services).' },
  { value: 'in_progress',    icon: '📝', title: 'Writing in progress — first draft underway', sub: 'Editing will be needed when complete.' },
  { value: 'first_draft',    icon: '📄', title: 'First draft complete — needs editing', sub: 'Ready for a professional editor.' },
  { value: 'already_edited', icon: '✅', title: 'Already edited — ready for design & layout', sub: 'Skip editing. Continue with cover, typesetting, printing.' },
  { value: 'fully_designed', icon: '🎨', title: 'Fully designed — just need printing', sub: 'Skip editing AND design. Print-only path.' },
  { value: 'ebook_only_ready',icon: '📱', title: 'Ready for ebook conversion only — no print', sub: 'Ebook-only path.' },
];

export default function Step2Stage({ answers, update, onNext, onBack }) {
  return (
    <StepCard
      heading="Where are you in your writing journey?"
      sub="This determines what services you actually need."
      onNext={onNext}
      onBack={onBack}
      canNext={!!answers.stage}
    >
      {OPTIONS.map(opt => (
        <OptionCard key={opt.value} {...opt} selected={answers.stage === opt.value}
          onClick={() => update({ stage: opt.value, ghostwriting: opt.value === 'idea' })} />
      ))}
    </StepCard>
  );
}