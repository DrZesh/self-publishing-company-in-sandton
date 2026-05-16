import React from 'react';
import StepCard, { OptionCard } from '../StepCard';

const EDIT_OPTIONS = [
  { value: 'proofread',     icon: '🔍', title: 'Proofreading only — final polish', sub: 'Catches typos, formatting, grammar. For already-polished manuscripts.' },
  { value: 'copy',          icon: '📝', title: 'Copy editing — sentence-level rewrite', sub: 'Most common. Improves flow, grammar, consistency.' },
  { value: 'developmental', icon: '📚', title: 'Developmental editing — structural feedback', sub: 'For early drafts. Reorganises chapters, argument structure.' },
  { value: 'full',          icon: '🎯', title: 'Full edit — all three rounds', sub: 'Premium option. Best for first-time authors.' },
  { value: 'recommend',     icon: '❓', title: "Not sure — recommend based on my stage", sub: 'We\'ll auto-select based on your manuscript stage.' },
];

const GHOST_OPTIONS = [
  { value: 'full_ghost',      icon: '✍️', title: 'Yes — full ghostwriting', sub: 'Includes interviews, drafting, and revisions until you\'re happy.' },
  { value: 'partial',         icon: '🤝', title: 'Partial — write with help (writing coaching)', sub: 'You write, we guide.' },
  { value: 'concept_only',    icon: '✨', title: 'No — just help develop my idea first', sub: 'Concept development and outline.' },
];

const GHOST_BUDGETS = [
  { value: 'r20_40k', label: 'R20k–R40k' },
  { value: 'r40_75k', label: 'R40k–R75k' },
  { value: 'r75_150k', label: 'R75k–R150k' },
  { value: 'r150k+', label: 'R150k+' },
  { value: 'not_sure', label: 'Not sure' },
];

export default function Step4Editing({ answers, update, onNext, onBack }) {
  const isGhostwriting = answers.stage === 'idea';

  if (isGhostwriting) {
    const sel = answers.ghostType;
    const bud = answers.ghostBudget;
    return (
      <StepCard
        heading="Do you want us to write the book for you?"
        sub="Ghostwriting includes interviews, drafting, and revisions until you're happy."
        onNext={onNext}
        onBack={onBack}
        canNext={!!sel}
      >
        {GHOST_OPTIONS.map(opt => (
          <OptionCard key={opt.value} {...opt} selected={sel === opt.value}
            onClick={() => update({ ghostType: opt.value, ghostwriting: true })} />
        ))}
        {sel === 'full_ghost' && (
          <div className="mt-4 p-4 bg-copper/5 rounded-xl border border-copper/20">
            <div className="text-sm font-semibold text-[#1A1208] mb-3">Approximate budget range?</div>
            <div className="flex flex-wrap gap-2">
              {GHOST_BUDGETS.map(b => (
                <button key={b.value} onClick={() => update({ ghostBudget: b.value })}
                  className={`px-4 py-2 rounded-full text-sm font-medium border-2 transition-all ${
                    bud === b.value ? 'border-copper bg-copper text-white' : 'border-copper/30 text-copper hover:bg-copper/5'
                  }`}>
                  {b.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </StepCard>
    );
  }

  const autoSel = answers.stage === 'in_progress' ? 'full' : answers.stage === 'first_draft' ? 'copy' : null;
  const editSel = answers.editingType === 'recommend' && autoSel ? autoSel : answers.editingType;

  return (
    <StepCard
      heading="What kind of editing does your manuscript need?"
      sub="Most self-published books need at least proofreading. Better-edited books sell better."
      onNext={onNext}
      onBack={onBack}
      canNext={!!answers.editingType}
    >
      {EDIT_OPTIONS.map(opt => (
        <OptionCard key={opt.value} {...opt} selected={answers.editingType === opt.value}
          onClick={() => update({ editingType: opt.value })} />
      ))}
      {answers.editingType === 'recommend' && autoSel && (
        <div className="mt-2 p-3 bg-copper/5 rounded-xl border border-copper/20 text-sm text-[#2C2C2C]">
          💡 Based on your stage, we recommend: <strong className="text-copper">{autoSel === 'full' ? 'Full Edit' : 'Copy Editing'}</strong>
        </div>
      )}
      <div className="text-xs text-black/40 mt-2 p-3 bg-black/3 rounded-lg">
        ℹ️ Editing will be quoted in your formal proposal — often cheapest when bundled in a publishing package.
      </div>
    </StepCard>
  );
}