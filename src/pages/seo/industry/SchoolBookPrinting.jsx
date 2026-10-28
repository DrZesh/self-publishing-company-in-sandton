import React from 'react';
import ServicePageTemplate from '../../../components/shared/ServicePageTemplate';
import PageMeta from '../../../components/shared/PageMeta';
import { serviceSchema, faqSchema, breadcrumbSchema } from '../../../lib/seo/schemas';

const faqs = [
  { question: 'Do you print school textbooks in South Africa?', answer: 'Yes. We print school textbooks, workbooks, study guides, and supplementary educational material for private schools, tutors, and educational publishers.' },
  { question: 'What format is best for school workbooks?', answer: 'A4 softcover with perfect binding or staple binding is standard for school workbooks and study guides. A5 is used for smaller reference booklets and reader series.' },
  { question: 'Can I print school books with write-in spaces?', answer: 'Yes. Workbooks with write-in answer spaces, fill-in activities, and interactive exercises are commonly printed for us. We accommodate all workbook layouts.' },
  { question: 'Do you print in small quantities for schools?', answer: 'Yes. We print from 50 copies. Private schools, tutors, and independent educational publishers all use our small-quantity printing services.' },
];

const schema = {
  '@context': 'https://schema.org',
  '@graph': [
    serviceSchema({ name: 'School Book Printing Johannesburg', description: 'School textbook and workbook printing for South African educators.', url: '/schoolbookprintingjohannesburg' }),
    faqSchema(faqs),
    breadcrumbSchema([{ name: 'Home', path: '/' }, { name: 'Book Printing', path: '/book-printing' }, { name: 'School Book Printing', path: '/schoolbookprintingjohannesburg' }]),
  ],
};

export default function SchoolBookPrinting() {
  return (
    <>
      <PageMeta
        title="School Book Printing in Johannesburg | Creative Books SA"
        description="School book printing in Johannesburg for primary and high schools - textbooks, workbooks, readers and CAPS-aligned learning materials in bulk quantities."
        keywords="school book printing Johannesburg, textbook printing South Africa, workbook printing Johannesburg, educational book printing, study guide printing"
        canonical="https://creativebooks.co.za/schoolbookprintingjohannesburg"
        schema={schema}
      />
      <ServicePageTemplate
        heroImage="https://media.base44.com/images/public/69fb173eeab1ba78da6eab45/cff7b79e1_generated_7cf45eea.png"
        subtitle="School Book Printing"
        title="School Book Printing Johannesburg"
        description="Professional school textbook, workbook, and study guide printing for Johannesburg private schools, tutors, and educational publishers. Quality educational material printing from 50 copies upwards."
        features={[
          { title: 'Textbook & Workbook Printing', description: 'A4 and A5 textbooks, workbooks, and study guides for all educational levels.' },
          { title: 'Full-Colour Educational Content', description: 'Full-colour printing for illustrated educational material, science textbooks, and enrichment workbooks.' },
          { title: 'Small & Large Quantities', description: 'Print from 50 copies for tutors and small schools to 5,000+ for established educational publishers.' },
          { title: 'Durable Binding', description: 'Softcover perfect binding and staple binding for workbooks. Hardcover available for reference titles.' },
          { title: 'Consistent Quality', description: 'Consistent quality across all copies — essential when all students need the same edition.' },
          { title: 'Reprint Service', description: 'We keep your files and print fresh batches each term without setup fees.' },
        ]}
        processSteps={[
          { title: 'Quote', description: 'Submit your workbook or textbook specifications for a free printing quote.' },
          { title: 'File Review', description: 'We review your files for print readiness and advise on any corrections.' },
          { title: 'Proof', description: 'Approve a proof before your full print run.' },
          { title: 'Print & Deliver', description: 'Books printed and delivered to your school or tuition centre.' },
        ]}
        faqs={faqs}
        relatedLinks={[
          { label: 'Workbook Printing', path: '/book-printing' },
          { label: 'Educational Book Printing', path: '/educationalbookprintingjohannesburg' },
          { label: 'Book Printing Johannesburg', path: '/book-printing-johannesburg' },
          { label: 'A5 Book Printing', path: '/printing/a5' },
          { label: 'Get a Quote', path: '/getquote' },
        ]}
        ctaTitle="Print Your School Books"
        ctaDescription="Get a free school book printing quote from our Johannesburg team today."
      />
    </>
  );
}