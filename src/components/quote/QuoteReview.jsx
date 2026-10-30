import React from 'react';
import { Edit2 } from 'lucide-react';

const Row = ({ label, value }) => value ? (
  <div className="flex justify-between gap-4 py-2 border-b border-[#0F0F0F]/5 last:border-0">
    <span className="text-xs text-[#0F0F0F]/50 font-body shrink-0">{label}</span>
    <span className="text-xs text-[#0F0F0F] font-body font-medium text-right">{value}</span>
  </div>
) : null;

const Section = ({ title, step, onEdit, children }) => (
  <div className="bg-[#F9F7F2] rounded-2xl p-5 mb-4">
    <div className="flex items-center justify-between mb-3">
      <h3 className="font-heading text-sm font-bold text-[#0F0F0F]">{title}</h3>
      <button onClick={() => onEdit(step)} className="inline-flex items-center gap-1 text-xs text-copper hover:text-copper/70 transition-colors font-body">
        <Edit2 className="w-3 h-3" /> Edit
      </button>
    </div>
    {children}
  </div>
);

const coverTypeMap = { author: 'Author Book Cover — R1,650', stock: 'Stock Design Cover — R2,150', illustrated: 'Illustrated Book Cover — R3,850' };
const tsMap = { basic: 'Basic Layout — R12/page', standard: 'Standard Layout — R13/page', premium: 'Premium Layout — R20/page + eBook conversion' };

export default function QuoteReview({ data, onEdit }) {
  return (
    <div>
      <div className="mb-6">
        <h2 className="font-heading text-xl md:text-2xl font-bold text-[#0F0F0F]">Review Your Quote Request</h2>
        <p className="text-sm text-[#0F0F0F]/50 font-body mt-1">Please review all details before submitting.</p>
      </div>

      <Section title="Client Details" step={0} onEdit={onEdit}>
        <Row label="Name" value={`${data.firstName} ${data.lastName}`} />
        <Row label="Email" value={data.email} />
        <Row label="Phone" value={data.phone} />
        <Row label="Address" value={`${data.address}, ${data.city}, ${data.province}, ${data.postalCode}`} />
      </Section>

      <Section title="Book Details" step={1} onEdit={onEdit}>
        <Row label="Book Size" value={data.bookSize} />
        <Row label="Size Converted" value={data.bookSizeConverted === 'yes' ? 'Yes' : 'No'} />
        <Row label="Number of Pages" value={data.numberOfPages} />
        <Row label="Genre" value={data.bookGenre} />
        <Row label="Word Count" value={data.wordCount} />
      </Section>

      <Section title="Cover Design" step={2} onEdit={onEdit}>
        <Row label="Needs Cover" value={data.needCover === 'yes' ? 'Yes' : data.needCover === 'no' ? 'No' : ''} />
        {data.needCover === 'yes' && <Row label="Cover Type" value={coverTypeMap[data.coverType] || data.coverType} />}
      </Section>

      <Section title="Printing" step={3} onEdit={onEdit}>
        <Row label="Needs Printing" value={data.needPrinting === 'yes' ? 'Yes' : data.needPrinting === 'no' ? 'No' : ''} />
        {data.needPrinting === 'yes' && <>
          <Row label="Copies" value={data.printCopies} />
          <Row label="Paper Type" value={data.paperType} />
          <Row label="Cover Finish" value={data.coverFinish} />
          <Row label="Colour Images" value={data.hasColourImages === 'yes' ? `Yes (${data.colourImageCount} images — ${data.colourImagePrint})` : 'No'} />
        </>}
      </Section>

      <Section title="Typesetting" step={4} onEdit={onEdit}>
        <Row label="Needs Typesetting" value={data.needTypesetting === 'yes' ? 'Yes' : data.needTypesetting === 'no' ? 'No' : ''} />
        {data.needTypesetting === 'yes' && <Row label="Type" value={tsMap[data.typesettingType] || data.typesettingType} />}
      </Section>

      <Section title="Editing" step={5} onEdit={onEdit}>
        <Row label="Needs Editing" value={data.needEditing === 'yes' ? 'Yes' : data.needEditing === 'no' ? 'No' : ''} />
        {data.needEditing === 'yes' && <>
          <Row label="Word Count" value={data.editingWordCount} />
          <Row label="Genre" value={data.editingGenre} />
        </>}
      </Section>

      <Section title="Timeline & Source" step={6} onEdit={onEdit}>
        <Row label="Start Date" value={data.startDate} />
        <Row label="How Found" value={data.howFound} />
        {data.additionalNotes && <Row label="Additional Notes" value={data.additionalNotes} />}
      </Section>

      <div className="bg-copper/5 border border-copper/20 rounded-2xl p-4 text-center mt-2">
        <p className="text-xs text-[#0F0F0F]/60 font-body">By submitting, you agree for Creative Books SA to contact you regarding your quote request.</p>
      </div>
    </div>
  );
}