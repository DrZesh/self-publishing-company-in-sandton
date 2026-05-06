import React from 'react';
import { Field, SelectInput, StepHeading } from './QuoteFields';

const sources = [
  { value: 'Facebook', label: 'Facebook' },
  { value: 'Google Search', label: 'Google Search' },
  { value: 'Instagram', label: 'Instagram' },
  { value: 'TikTok', label: 'TikTok' },
  { value: 'LinkedIn', label: 'LinkedIn' },
];

export default function QuoteStep7({ data, update, errors }) {
  return (
    <div>
      <StepHeading title="Timeline & Source" description="Help us plan your project and understand how you found us." />
      <div className="space-y-5">
        <Field label="When do you want to start?" required error={errors.startDate}>
          <input
            type="date"
            value={data.startDate}
            onChange={e => update({ startDate: e.target.value })}
            min={new Date().toISOString().split('T')[0]}
            className={`w-full px-4 py-3 rounded-xl border text-sm font-body bg-[#F9F7F2] outline-none transition-all
              ${errors.startDate ? 'border-red-400' : 'border-[#0F0F0F]/10 focus:border-copper'}`}
          />
          {errors.startDate && <p className="mt-1 text-xs text-red-500">{errors.startDate}</p>}
        </Field>
        <Field label="How did you find us?" required error={errors.howFound}>
          <SelectInput value={data.howFound} onChange={v => update({ howFound: v })} options={sources} placeholder="Select a source" error={errors.howFound} />
        </Field>
        <Field label="Anything else you would like to add?">
          <textarea
            value={data.additionalNotes}
            onChange={e => update({ additionalNotes: e.target.value })}
            placeholder="Any additional details, special requirements, or questions..."
            rows={4}
            className="w-full px-4 py-3 rounded-xl border border-[#0F0F0F]/10 focus:border-copper text-sm font-body bg-[#F9F7F2] outline-none transition-all resize-none"
          />
        </Field>
      </div>
    </div>
  );
}