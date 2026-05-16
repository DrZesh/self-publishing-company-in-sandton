import React from 'react';
import StepCard, { OptionCard } from '../StepCard';
import { Link } from 'react-router-dom';

const OPTIONS = [
  { value: 'adult_fiction',    icon: '📖', title: 'Adult Fiction (Novel)',    sub: 'Romance, thriller, sci-fi, literary fiction, etc.' },
  { value: 'adult_nonfiction', icon: '📚', title: 'Adult Non-Fiction',        sub: 'Business, self-help, how-to, history, etc.' },
  { value: 'memoir',           icon: '✨', title: 'Memoir or Biography',      sub: 'Personal life story, family history.' },
  { value: 'poetry',           icon: '📜', title: 'Poetry Collection',        sub: 'Verse, anthology, spoken word.' },
  { value: 'academic',         icon: '🎓', title: 'Academic / Educational',   sub: 'Thesis, textbook, training manual.' },
  { value: 'childrens',        icon: '👶', title: "Children's Book",          sub: 'Illustrated picture book or chapter book.' },
  { value: 'christian',        icon: '✝️', title: 'Christian / Spiritual',    sub: 'Devotional, faith-based content.' },
  { value: 'other',            icon: '❓', title: 'Something else',           sub: "Tell us more on the next step." },
];

export default function Step1ProjectType({ answers, update, onNext, onBack }) {
  const selected = answers.projectType;

  if (selected === 'childrens') {
    return (
      <div className="max-w-2xl">
        <h2 className="font-heading text-2xl sm:text-3xl font-bold text-[#1A1208] mb-2">Children's Books have unique pricing</h2>
        <p className="text-[#2C2C2C]/60 mb-8">Because of illustration costs, these require a tailored quote. How would you like to proceed?</p>
        <div className="space-y-3">
          <Link to="/getquote?type=childrens_book"
            className="block w-full p-4 rounded-xl border-2 border-copper bg-copper/5 text-center font-semibold text-copper hover:bg-copper/10 transition-all">
            Continue to custom quote form →
          </Link>
          <button onClick={onNext} className="w-full p-4 rounded-xl border-2 border-black/15 bg-white text-[#2C2C2C] font-medium hover:border-copper/40 transition-all">
            Just price the printing (continue wizard)
          </button>
          <button onClick={() => update({ projectType: null })} className="w-full text-sm text-[#2C2C2C]/50 hover:text-copper mt-2">
            ← Change selection
          </button>
        </div>
      </div>
    );
  }

  return (
    <StepCard
      heading="What kind of book are you publishing?"
      sub="This helps us recommend the right services and pricing tier."
      onNext={onNext}
      onBack={onBack}
      showBack={false}
      canNext={!!selected}
    >
      {OPTIONS.map(opt => (
        <OptionCard key={opt.value} {...opt} selected={selected === opt.value}
          onClick={() => update({ projectType: opt.value })} />
      ))}
    </StepCard>
  );
}