import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Field, RadioGroup, StepHeading } from './QuoteFields';

const coverTypes = [
  { value: 'author', label: 'Author Book Cover — R1,650' },
  { value: 'stock', label: 'Stock Design Cover — R2,150' },
  { value: 'illustrated', label: 'Illustrated Book Cover — R3,850' },
];

export default function QuoteStep3({ data, update, errors }) {
  return (
    <div>
      <StepHeading title="Cover Design" description="A professional cover is one of the most important parts of your book." />
      <div className="space-y-5">
        <Field label="Do you need a book cover?" required error={errors.needCover}>
          <RadioGroup
            value={data.needCover}
            onChange={v => update({ needCover: v, coverType: '' })}
            options={[{ value: 'yes', label: 'Yes' }, { value: 'no', label: 'No' }]}
            error={errors.needCover}
          />
        </Field>
        <AnimatePresence>
          {data.needCover === 'yes' && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
              <Field label="What type of book cover do you need?" required error={errors.coverType}>
                <div className="space-y-3 mt-1">
                  {coverTypes.map(opt => (
                    <label key={opt.value}
                      className={`flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-all
                        ${data.coverType === opt.value ? 'border-copper bg-copper/5' : 'border-[#0F0F0F]/10 hover:border-copper/40'}`}>
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0
                        ${data.coverType === opt.value ? 'border-copper' : 'border-[#0F0F0F]/30'}`}>
                        {data.coverType === opt.value && <div className="w-2.5 h-2.5 rounded-full bg-copper" />}
                      </div>
                      <div>
                        <span className={`text-sm font-body font-medium ${data.coverType === opt.value ? 'text-copper' : 'text-[#0F0F0F]'}`}>
                          {opt.label}
                        </span>
                      </div>
                      <input type="radio" className="sr-only" value={opt.value} checked={data.coverType === opt.value} onChange={() => update({ coverType: opt.value })} />
                    </label>
                  ))}
                </div>
                {errors.coverType && <p className="mt-1 text-xs text-red-500">{errors.coverType}</p>}
              </Field>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}