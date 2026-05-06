import React from 'react';
import ServicePageTemplate from '../../../components/shared/ServicePageTemplate';
import PageMeta from '../../../components/shared/PageMeta';
import { serviceSchema, faqSchema, breadcrumbSchema } from '../../../lib/seo/schemas';

const faqs = [
  { question: 'What format is best for training manuals?', answer: 'A4 with Wire-O or spiral binding is the most popular format for training manuals — it lies flat when open, making it practical for workshop use. Perfect binding (softcover) works for corporate-distributed manuals.' },
  { question: 'Can you print corporate training manuals in bulk?', answer: 'Yes. We print training manuals from 50 to 5,000+ copies. Bulk printing significantly reduces the per-unit cost. We also offer consistent reprint services for organisations that run regular training programmes.' },
  { question: 'Do you print training manuals with full-colour pages?', answer: 'Yes. Full-colour interior printing is available for training manuals that include diagrams, infographics, process charts, and branded visuals.' },
  { question: 'How quickly can training manuals be printed?', answer: 'Standard turnaround is 7–14 business days. Rush printing in 3–5 business days is available for training events and workshops.' },
];

const schema = {
  '@context': 'https://schema.org',
  '@graph': [
    serviceSchema({ name: 'Training Manual Printing Johannesburg', description: 'Professional training manual printing for businesses in Johannesburg.', url: '/trainingmanualprintingjohannesburg' }),
    faqSchema(faqs),
    breadcrumbSchema([{ name: 'Home', path: '/' }, { name: 'Book Printing', path: '/bookprinting' }, { name: 'Training Manual Printing', path: '/trainingmanualprintingjohannesburg' }]),
  ],
};

export default function TrainingManualPrinting() {
  return (
    <>
      <PageMeta
        title="Training Manual Printing Johannesburg | Corporate Manual Printing | Creative Books SA"
        description="Professional training manual printing in Johannesburg. A4 wire-o, spiral, and softcover manuals for corporate training programmes. Bulk printing available. Get a free quote."
        keywords="training manual printing Johannesburg, corporate manual printing, workbook printing Johannesburg, training material printing South Africa, A4 book printing"
        canonical="https://www.creativebookssa.co.za/trainingmanualprintingjohannesburg"
        schema={schema}
      />
      <ServicePageTemplate
        heroImage="https://media.base44.com/images/public/69fb173eeab1ba78da6eab45/cff7b79e1_generated_7cf45eea.png"
        subtitle="Training Manual Printing"
        title="Training Manual Printing in Johannesburg"
        description="Professional training manual and workbook printing for Johannesburg businesses and training providers. Wire-O, spiral, softcover, and hardcover binding. Full-colour or black and white. Fast turnaround for your training programmes."
        features={[
          { title: 'Wire-O Binding', description: 'Flat-open wire-o binding is the gold standard for training manuals — practical in workshops and durable in the field.' },
          { title: 'A4 & A5 Formats', description: 'A4 for standard training manuals; A5 for pocket guides and reference booklets.' },
          { title: 'Full-Colour Printing', description: 'Full-colour interior for manuals with branded visuals, process diagrams, and infographics.' },
          { title: 'Bulk Corporate Printing', description: 'Volume printing for large training programmes. Consistent quality across all copies.' },
          { title: 'Fast Turnaround', description: '7–14 business day standard. Rush service available for workshop deadlines.' },
          { title: 'Branded Cover Design', description: 'Professional branded cover design to maintain corporate visual identity across all materials.' },
        ]}
        processSteps={[
          { title: 'Quote Request', description: 'Submit your specs — format, page count, quantity, colour requirements, and binding type.' },
          { title: 'File Submission', description: 'Submit your print-ready PDF or send your InDesign/Word files for formatting.' },
          { title: 'Proof Approval', description: 'Approve a digital or physical proof before production begins.' },
          { title: 'Print & Deliver', description: 'Manuals printed in Johannesburg and delivered to your training venue or office.' },
        ]}
        faqs={faqs}
        relatedLinks={[
          { label: 'Manual Printing', path: '/manualprinting' },
          { label: 'Workbook Printing', path: '/workbookprinting' },
          { label: 'Book Printing Johannesburg', path: '/bookprintingjohannesburg' },
          { label: 'Book Printing Sandton', path: '/bookprintingsandton' },
          { label: 'Get a Quote', path: '/getquote' },
        ]}
        ctaTitle="Print Your Training Manuals"
        ctaDescription="Get a free training manual printing quote from our Johannesburg team within 24 hours."
      />
    </>
  );
}