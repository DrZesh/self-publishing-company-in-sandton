import React from 'react';
import ServicePageTemplate from '../../../components/shared/ServicePageTemplate';
import PageMeta from '../../../components/shared/PageMeta';
import { serviceSchema, faqSchema, breadcrumbSchema } from '../../../lib/seo/schemas';

const faqs = [
  { question: 'Do you print books for Centurion clients?', answer: 'Yes. We serve Centurion authors, businesses, and publishers with delivery to all Centurion addresses.' },
  { question: 'How long does book delivery take to Centurion?', answer: 'After printing (7–14 business days), courier delivery to Centurion takes 1–2 business days.' },
  { question: 'Do you offer workbook and manual printing for Centurion businesses?', answer: 'Yes. We offer workbook printing, training manual printing, and corporate publication printing for Centurion businesses.' },
  { question: 'Can I self-publish a book in Centurion?', answer: 'Absolutely. We offer complete self-publishing packages for Centurion authors including editing, cover design, printing, and ISBN registration.' },
];

const schema = {
  '@context': 'https://schema.org',
  '@graph': [
    serviceSchema({ name: 'Book Printing Centurion', description: 'Book printing services for authors and businesses in Centurion, Gauteng.', url: '/bookprintingcenturion', areaServed: 'Centurion, Pretoria, Johannesburg, Gauteng, South Africa' }),
    faqSchema(faqs),
    breadcrumbSchema([{ name: 'Home', path: '/' }, { name: 'Book Printing', path: '/bookprinting' }, { name: 'Book Printing Centurion', path: '/bookprintingcenturion' }]),
  ],
};

export default function BookPrintingCenturion() {
  return (
    <>
      <PageMeta
        title="Book Printing Centurion | Professional Book Printers | Creative Books SA"
        description="Book printing services for Centurion authors and businesses. Softcover, hardcover, workbook, and corporate printing with delivery to Centurion. Get a free quote today."
        keywords="book printing Centurion, book printers Centurion, printing services Centurion, self publishing Centurion, corporate book printing Centurion"
        canonical="https://www.creativebookssa.co.za/bookprintingcenturion"
        schema={schema}
      />
      <ServicePageTemplate
        heroImage="https://media.base44.com/images/public/69fb173eeab1ba78da6eab45/cff7b79e1_generated_7cf45eea.png"
        subtitle="Book Printing Centurion"
        title="Book Printing in Centurion"
        description="Professional book printing for Centurion authors, publishers, and businesses. Strategically located between Johannesburg and Pretoria, we serve Centurion clients with premium book printing and author services."
        features={[
          { title: 'Centurion Delivery', description: 'Courier delivery to Centurion within 1–2 business days after printing.' },
          { title: 'Author Self-Publishing', description: 'Complete self-publishing support for Centurion authors — editing, design, printing, and ISBN.' },
          { title: 'Corporate & Workbook Printing', description: 'Training manuals, workbooks, and branded corporate publications for Centurion businesses.' },
          { title: 'Softcover & Hardcover', description: 'Full range of binding options to suit every type of book and budget.' },
          { title: 'Full-Colour Printing', description: 'Full-colour interior printing for children\'s books, training materials, and illustrated publications.' },
          { title: 'Reliable Turnaround', description: 'Standard 7–14 business day turnaround. Rush printing available for urgent Centurion orders.' },
        ]}
        processSteps={[
          { title: 'Free Quote', description: 'Submit your book specs for a free, no-obligation printing quote.' },
          { title: 'File Upload', description: 'Upload your print-ready PDF or manuscript for file checking.' },
          { title: 'Proof Review', description: 'Approve your book proof before production begins.' },
          { title: 'Deliver to Centurion', description: 'Fast courier delivery to your Centurion address.' },
        ]}
        faqs={faqs}
        relatedLinks={[
          { label: 'Book Printing Pretoria', path: '/bookprintingpretoria' },
          { label: 'Book Printing Midrand', path: '/bookprintingmidrand' },
          { label: 'Book Printing Johannesburg', path: '/bookprintingjohannesburg' },
          { label: 'Workbook Printing', path: '/workbookprinting' },
          { label: 'Self Publishing SA', path: '/selfpublishingsouthafrica' },
          { label: 'Get a Quote', path: '/getquote' },
        ]}
        ctaTitle="Get a Book Printing Quote for Centurion"
        ctaDescription="Professional book printing serving Centurion and all of Gauteng. Get your free quote today."
      />
    </>
  );
}