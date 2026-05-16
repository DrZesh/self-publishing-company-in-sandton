import React from 'react';
import StepCard from '../StepCard';

const TIMELINES = [
  { value: 'asap',       label: '⚡ ASAP — fast-track if possible' },
  { value: '2_3_months', label: '📅 Within 2–3 months (standard)' },
  { value: '3_6_months', label: '🗓️ Within 3–6 months' },
  { value: '6_plus',     label: '☕ 6 months or longer' },
  { value: 'exploring',  label: '🔍 Just exploring — no specific timeline' },
];

const PRIORITIES = [
  'Quality',
  'Speed',
  'Affordability',
  'Personal attention',
  'International distribution',
  'Marketing support',
];

export default function Step10Final({ answers, update, onNext, onBack }) {
  const { timeline, priorities = [], notes } = answers;

  const togglePriority = (p) => {
    if (priorities.includes(p)) {
      update({ priorities: priorities.filter(x => x !== p) });
    } else if (priorities.length < 3) {
      update({ priorities: [...priorities, p] });
    }
  };

  return (
    <StepCard
      heading="Last few questions to finalise your quote."
      sub="Almost there — this helps our team prepare the best proposal."
      onNext={onNext}
      onBack={onBack}
      canNext={!!timeline}
      nextLabel="Generate My Quote →"
    >
      {/* Timeline */}
      <div className="mb-6">
        <div className="text-sm font-semibold text-[#2C2C2C]/80 mb-3">When do you want your book published?</div>
        <div className="space-y-2">
          {TIMELINES.map(t => (
            <button key={t.value} onClick={() => update({ timeline: t.value })}
              className={`w-full text-left p-3 rounded-xl border-2 text-sm font-medium transition-all ${
                timeline === t.value ? 'border-copper bg-copper/5 text-copper' : 'border-black/10 bg-white text-[#2C2C2C] hover:border-copper/30'
              }`}>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Priorities */}
      <div className="mb-6">
        <div className="text-sm font-semibold text-[#2C2C2C]/80 mb-1">What's most important to you? <span className="font-normal text-black/40">(pick up to 3)</span></div>
        <div className="flex flex-wrap gap-2 mt-3">
          {PRIORITIES.map(p => (
            <button key={p} onClick={() => togglePriority(p)}
              disabled={!priorities.includes(p) && priorities.length >= 3}
              className={`px-4 py-2 rounded-full text-sm border-2 font-medium transition-all ${
                priorities.includes(p) ? 'border-copper bg-copper text-white' :
                priorities.length >= 3 ? 'border-black/10 text-black/30 cursor-not-allowed' :
                'border-copper/30 text-copper hover:bg-copper/5'
              }`}>
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Notes */}
      <div>
        <label className="block text-sm font-semibold text-[#2C2C2C]/80 mb-2">Any specific questions or requirements? <span className="font-normal text-black/40">(optional)</span></label>
        <textarea
          rows={3}
          placeholder="e.g. My manuscript is in Afrikaans, I'd like a cream cover, I need distribution to Exclusive Books..."
          value={notes || ''}
          onChange={e => update({ notes: e.target.value })}
          className="w-full px-4 py-3 border-2 border-black/15 rounded-xl focus:outline-none focus:border-copper resize-none text-sm"
        />
      </div>
    </StepCard>
  );
}