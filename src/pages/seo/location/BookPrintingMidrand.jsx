import React from 'react';
import ServicePageTemplate from '../../../components/shared/ServicePageTemplate';
import PageMeta from '../../../components/shared/PageMeta';
import { serviceSchema, faqSchema, breadcrumbSchema } from '../../../lib/seo/schemas';

const faqs = [
  { question: 'Do you serve Midrand book printing clients?', answer: 'Yes. We serve authors, businesses, and publishers in Midrand with delivery within 1–2 business days after printing.' },
  { question: 'How much does book printing cost for Midrand clients?', answer: 'A 200-page A5 softcover book starts from approximately R45 per copy for 100 copies. Contact us for a detailed quote.' },
  { question: 'Can businesses in Midrand use your corporate printing services?', answer: 'Yes. We provide training manual printing, workbook printing, and corporate book printing for Midrand businesses.' },
  { question: 'Do you deliver to Midrand after printing?', answer: 'Yes. We offer courier delivery to all Midrand addresses within 1–2 business days after printing.' },
];

const schema = {
  '@context': 'https://schema.org',
  '@graph': [
    serviceSchema({ name: 'Book Printing Midrand', description: 'Book printing services for authors and businesses in Midrand, Gauteng.', url: '/bookprintingmidrand', areaServed: 'Midrand, Johannesburg, Pretoria, Gauteng, South Africa' }),
    faqSchema(faqs),
    breadcrumbSchema([{ name: 'Home', path: '/' }, { name: 'Book Printing', path: '/bookprinting' }, { name: 'Book Printing Midrand', path: '/bookprintingmidrand' }]),
  ],
};

export default function BookPrintingMidrand() {
  return (
    <>
      <PageMeta
        title="Book Printing Midrand | Professional Book Printers | Creative Books SA"
        description="Book printing services for Midrand authors and businesses. Softcover, hardcover, workbook, and corporate printing with delivery to Midrand. Get a free quote today."
        keywords="book printing Midrand, book printers Midrand, printing services Midrand, workbook printing Midrand, corporate book printing Midrand"
        canonical="https://www.creativebookssa.co.za/bookprintingmidrand"
        schema={schema}
      />
      <ServicePageTemplate
        heroImage="https://media.base44.com/images/public/69fb173eeab1ba78da6eab45/cff7b79e1_generated_7cf45eea.png"
        subtitle="Book Printing Midrand"
        title="Book Printing in Midrand"
        description="Professional book printing for Midrand authors and businesses. Ideally located between Johannesburg and Pretoria, Midrand clients benefit from fast turnaround and delivery. We print novels, workbooks, training manuals, and corporate books."
        features={[
          { title: 'Midrand Delivery', description: 'Courier delivery to all Midrand addresses within 1–2 business days after printing completes.' },
          { title: 'Corporate & Training Materials', description: 'Workbooks, training manuals, and corporate publications for Midrand businesses and organisations.' },
          { title: 'Author Book Printing', description: 'Full-service book printing for self-publishing authors in Midrand — novels, memoirs, business books, and more.' },
          { title: 'Full-Colour Printing', description: 'Full-colour interior printing for illustrated books, children\'s books, and training materials.' },
          { title: 'All Binding Types', description: 'Softcover perfect binding, hardcover case binding, wire binding, and saddle stitching available.' },
          { title: 'Pretoria Accessible', description: 'Midrand clients are between Johannesburg and Pretoria — we serve both metro areas efficiently.' },
        ]}
        processSteps={[
          { title: 'Get a Quote', description: 'Submit your book specs online or contact us for a personalised Midrand printing quote.' },
          { title: 'Send Your Files', description: 'Upload your print-ready PDF. We verify all files before production.' },
          { title: 'Approve Your Proof', description: 'Review a digital or physical proof to confirm everything is perfect.' },
          { title: 'Deliver to Midrand', description: 'Printed books delivered to your Midrand address within 1–2 business days.' },
        ]}
        faqs={faqs}
        relatedLinks={[
          { label: 'Book Printing Johannesburg', path: '/bookprintingjohannesburg' },
          { label: 'Book Printing Pretoria', path: '/bookprintingpretoria' },
          { label: 'Book Printing Centurion', path: '/bookprintingcenturion' },
          { label: 'Workbook Printing', path: '/workbookprinting' },
          { label: 'Manual Printing', path: '/manualprinting' },
          { label: 'Get a Quote', path: '/getquote' },
        ]}
        ctaTitle="Get a Book Printing Quote for Midrand"
        ctaDescription="Fast, professional book printing serving Midrand and all of Gauteng. Get your free quote today."
      />
    </>
  );
}