import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Field, TextInput, RadioGroup, StepHeading } from './QuoteFields';

export default function QuoteStep6({ data, update, errors }) {
  return (
    <div>
      <StepHeading title="Editing" description="Professional editing polishes your manuscript before publication." />
      <div className="space-y-5">
        <Field label="Do you need editing?" required error={errors.needEditing}>
          <RadioGroup
            value={data.needEditing}
            onChange={v => update({ needEditing: v, editingWordCount: '', editingGenre: '' })}
            options={[{ value: 'yes', label: 'Yes' }, { value: 'no', label: 'No' }]}
            error={errors.needEditing}
          />
        </Field>
        <AnimatePresence>
          {data.needEditing === 'yes' && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden space-y-5">
              <Field label="Total word count on manuscript" required error={errors.editingWordCount}>
                <TextInput type="number" value={data.editingWordCount} onChange={v => update({ editingWordCount: v })} placeholder="e.g. 60000" error={errors.editingWordCount} min="1" />
              </Field>
              <Field label="Book genre" required error={errors.editingGenre}>
                <TextInput value={data.editingGenre} onChange={v => update({ editingGenre: v })} placeholder="e.g. Memoir, Novel, Self-help..." error={errors.editingGenre} />
              </Field>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}