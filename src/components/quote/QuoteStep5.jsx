import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Field, RadioGroup, StepHeading } from './QuoteFields';

const tsTypes = [
  { value: 'basic', label: 'Basic Layout — R10.50 per page' },
  { value: 'standard', label: 'Standard Layout — R12.50 per page' },
  { value: 'premium', label: 'Premium Layout — R19.50 per page' },
];

export default function QuoteStep5({ data, update, errors }) {
  return (
    <div>
      <StepHeading title="Typesetting" description="Professional typesetting ensures your book is print-ready and beautiful." />
      <div className="space-y-5">
        <Field label="Do you need typesetting?" required error={errors.needTypesetting}>
          <RadioGroup
            value={data.needTypesetting}
            onChange={v => update({ needTypesetting: v, typesettingType: '' })}
            options={[{ value: 'yes', label: 'Yes' }, { value: 'no', label: 'No' }]}
            error={errors.needTypesetting}
          />
        </Field>
        <AnimatePresence>
          {data.needTypesetting === 'yes' && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
              <Field label="Which type of typesetting do you need?" required error={errors.typesettingType}>
                <div className="space-y-3 mt-1">
                  {tsTypes.map(opt => (
                    <label key={opt.value}
                      className={`flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-all
                        ${data.typesettingType === opt.value ? 'border-copper bg-copper/5' : 'border-[#0F0F0F]/10 hover:border-copper/40'}`}>
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0
                        ${data.typesettingType === opt.value ? 'border-copper' : 'border-[#0F0F0F]/30'}`}>
                        {data.typesettingType === opt.value && <div className="w-2.5 h-2.5 rounded-full bg-copper" />}
                      </div>
                      <span className={`text-sm font-body font-medium ${data.typesettingType === opt.value ? 'text-copper' : 'text-[#0F0F0F]'}`}>
                        {opt.label}
                      </span>
                      <input type="radio" className="sr-only" value={opt.value} checked={data.typesettingType === opt.value} onChange={() => update({ typesettingType: opt.value })} />
                    </label>
                  ))}
                </div>
                {errors.typesettingType && <p className="mt-1 text-xs text-red-500">{errors.typesettingType}</p>}
              </Field>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}