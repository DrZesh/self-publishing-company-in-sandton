import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Field, SelectInput, RadioGroup, StepHeading } from './QuoteFields';

const copyOptions = [100,150,200,250,300,350,400,450,500,600,700,800,900,1000].map(n => ({ value: String(n), label: String(n) + ' copies' }));

export default function QuoteStep4({ data, update, errors }) {
  return (
    <div>
      <StepHeading title="Printing Details" description="Let us know your print requirements and specifications." />
      <div className="space-y-5">
        <Field label="Do you need printing?" required error={errors.needPrinting}>
          <RadioGroup
            value={data.needPrinting}
            onChange={v => update({ needPrinting: v, printCopies: '', paperType: '', coverFinish: '', hasColourImages: '', colourImageCount: '', colourImagePrint: '' })}
            options={[{ value: 'yes', label: 'Yes' }, { value: 'no', label: 'No' }]}
            error={errors.needPrinting}
          />
        </Field>
        <AnimatePresence>
          {data.needPrinting === 'yes' && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden space-y-5">
              <Field label="How many copies do you want to print?" required error={errors.printCopies}>
                <SelectInput value={data.printCopies} onChange={v => update({ printCopies: v })} options={copyOptions} placeholder="Select quantity" error={errors.printCopies} />
              </Field>
              <Field label="Type of paper" required error={errors.paperType}>
                <RadioGroup
                  value={data.paperType}
                  onChange={v => update({ paperType: v })}
                  options={[{ value: 'White Paper', label: 'White Paper' }, { value: 'Cream Paper', label: 'Cream Paper' }]}
                  error={errors.paperType}
                />
              </Field>
              <Field label="Book cover finishing" required error={errors.coverFinish}>
                <RadioGroup
                  value={data.coverFinish}
                  onChange={v => update({ coverFinish: v })}
                  options={[{ value: 'Matte', label: 'Matte' }, { value: 'Gloss', label: 'Gloss' }]}
                  error={errors.coverFinish}
                />
              </Field>
              <Field label="Do you have colour images inside the book?" required error={errors.hasColourImages}>
                <RadioGroup
                  value={data.hasColourImages}
                  onChange={v => update({ hasColourImages: v, colourImageCount: '', colourImagePrint: '' })}
                  options={[{ value: 'yes', label: 'Yes' }, { value: 'no', label: 'No' }]}
                  error={errors.hasColourImages}
                />
              </Field>
              <AnimatePresence>
                {data.hasColourImages === 'yes' && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden space-y-5">
                    <Field label="How many colour images are inside?" required error={errors.colourImageCount}>
                      <input
                        type="number" min="1" value={data.colourImageCount}
                        onChange={e => update({ colourImageCount: e.target.value })}
                        placeholder="e.g. 12"
                        className={`w-full px-4 py-3 rounded-xl border text-sm font-body bg-[#F9F7F2] outline-none transition-all
                          ${errors.colourImageCount ? 'border-red-400' : 'border-[#0F0F0F]/10 focus:border-copper'}`}
                      />
                      {errors.colourImageCount && <p className="mt-1 text-xs text-red-500">{errors.colourImageCount}</p>}
                    </Field>
                    <Field label="Should they be printed in colour or black and white?" required error={errors.colourImagePrint}>
                      <RadioGroup
                        value={data.colourImagePrint}
                        onChange={v => update({ colourImagePrint: v })}
                        options={[{ value: 'Colour', label: 'Colour' }, { value: 'Black and White', label: 'Black and White' }]}
                        error={errors.colourImagePrint}
                      />
                    </Field>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}