import React from 'react';
import { Field, TextInput, SelectInput, RadioGroup, StepHeading } from './QuoteFields';

const genres = [
  { value: 'Memoir / Autobiography', label: 'Memoir / Autobiography' },
  { value: 'Novel', label: 'Novel' },
  { value: 'Inspirational', label: 'Inspirational' },
  { value: 'Self-help', label: 'Self-help' },
  { value: "Children's Book", label: "Children's Book" },
  { value: 'Educational', label: 'Educational' },
];

export default function QuoteStep2({ data, update, errors }) {
  return (
    <div>
      <StepHeading title="Book Details" description="Tell us about your manuscript and book specifications." />
      <div className="space-y-5">
        <Field label="Book Size" required error={errors.bookSize}>
          <RadioGroup
            value={data.bookSize}
            onChange={v => update({ bookSize: v })}
            options={[{ value: 'A5', label: 'A5' }, { value: 'A4', label: 'A4' }, { value: '6×9', label: '6×9' }]}
            error={errors.bookSize}
          />
        </Field>
        <Field label="Is your book already converted to the selected size?" required error={errors.bookSizeConverted}>
          <RadioGroup
            value={data.bookSizeConverted}
            onChange={v => update({ bookSizeConverted: v })}
            options={[{ value: 'yes', label: 'Yes' }, { value: 'no', label: 'No' }]}
            error={errors.bookSizeConverted}
          />
        </Field>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <Field label="Number of Pages" required error={errors.numberOfPages}>
            <TextInput type="number" value={data.numberOfPages} onChange={v => update({ numberOfPages: v })} placeholder="e.g. 220" error={errors.numberOfPages} min="1" />
          </Field>
          <Field label="Total Manuscript Word Count" required error={errors.wordCount}>
            <TextInput type="number" value={data.wordCount} onChange={v => update({ wordCount: v })} placeholder="e.g. 55000" error={errors.wordCount} min="1" />
          </Field>
        </div>
        <Field label="Book Genre" required error={errors.bookGenre}>
          <SelectInput value={data.bookGenre} onChange={v => update({ bookGenre: v })} options={genres} placeholder="Select genre" error={errors.bookGenre} />
        </Field>
      </div>
    </div>
  );
}