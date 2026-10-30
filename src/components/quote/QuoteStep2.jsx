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

const STANDARD_SIZES = [{ value: 'A5', label: 'A5' }, { value: 'A4', label: 'A4' }, { value: '6×9', label: '6×9' }];
// Square formats are only offered for children's books.
const CHILDRENS_SIZES = [{ value: '15×15 cm', label: '15 × 15 cm' }, { value: '20×20 cm', label: '20 × 20 cm' }, { value: '21×21 cm', label: '21 × 21 cm' }];
const CHILDRENS = "Children's Book";

export default function QuoteStep2({ data, update, errors }) {
  const sizes = data.bookGenre === CHILDRENS ? [...STANDARD_SIZES, ...CHILDRENS_SIZES] : STANDARD_SIZES;
  const pickGenre = (v) => {
    const keepSize = v === CHILDRENS || !CHILDRENS_SIZES.some((o) => o.value === data.bookSize);
    update(keepSize ? { bookGenre: v } : { bookGenre: v, bookSize: '' });
  };
  return (
    <div>
      <StepHeading title="Book Details" description="Tell us about your manuscript and book specifications." />
      <div className="space-y-5">
        <Field label="Book Genre" required error={errors.bookGenre}>
          <SelectInput value={data.bookGenre} onChange={pickGenre} options={genres} placeholder="Select genre" error={errors.bookGenre} />
        </Field>
        <Field label="Book Size" required error={errors.bookSize}>
          <RadioGroup
            value={data.bookSize}
            onChange={v => update({ bookSize: v })}
            options={sizes}
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
      </div>
    </div>
  );
}