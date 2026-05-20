import React from 'react';
import ServicePageTemplate from '../../../components/shared/ServicePageTemplate';
import PageMeta from '../../../components/shared/PageMeta';
import { serviceSchema, faqSchema, breadcrumbSchema } from '../../../lib/seo/schemas';

const faqs = [
  { question: 'Do you print educational books for South African schools?', answer: 'Yes. We print educational textbooks, workbooks, learner guides, and supplementary reading material for private schools, tutors, and educational publishers in South Africa.' },
  { question: 'Can you print educational books in full colour?', answer: 'Yes. Full-colour interior printing is available for illustrated educational books, science textbooks, and enrichment materials.' },
  { question: 'What is the minimum quantity for educational book printing?', answer: 'We print educational books from 50 copies. Small quantities are ideal for tutors, home schools, and private schools.' },
  { question: 'Do you offer reprinting of existing educational titles?', answer: 'Yes. We keep your approved files and reprint as needed each term or year. Consistent quality and format across all reprints.' },
];

const schema = {
  '@context': 'https://schema.org',
  '@graph': [
    serviceSchema({ name: 'Educational Book Printing Johannesburg', description: 'Educational textbook and workbook printing for South African schools and publishers.', url: '/educationalbookprintingjohannesburg' }),
    faqSchema(faqs),
    breadcrumbSchema([{ name: 'Home', path: '/' }, { name: 'Book Printing', path: '/bookprinting' }, { name: 'Educational Book Printing', path: '/educationalbookprintingjohannesburg' }]),
  ],
};

export default function EducationalBookPrinting() {
  return (
    <>
      <PageMeta
        title="Educational Book Printing"
        description="Educational book printing in Johannesburg for schools, universities and training providers — textbooks, workbooks and study guides in volume. Bulk discounts."
        keywords="educational book printing Johannesburg, textbook printing South Africa, learner guide printing, educational publisher printing, school book printing"
        canonical="https://www.creativebooks.co.za/educationalbookprintingjohannesburg"
        schema={schema}
      />
      <ServicePageTemplate
        heroImage="https://media.base44.com/images/public/69fb173eeab1ba78da6eab45/cff7b79e1_generated_7cf45eea.png"
        subtitle="Educational Book Printing"
        title="Educational Book Printing"
        description="Professional educational book printing for South African schools, tutors, and educational publishers. Textbooks, workbooks, learner guides, and supplementary reading printed with consistent quality at competitive prices."
        features={[
          { title: 'Textbook Printing', description: 'A5 and A4 textbooks for all school grades and subjects — black and white and full-colour.' },
          { title: 'Workbook Printing', description: 'Student workbooks with write-in spaces, activity pages, and interactive exercises.' },
          { title: 'Learner Guide Printing', description: 'Study guides, revision booklets, and supplementary learning material.' },
          { title: 'Full-Colour Educational Content', description: 'Full-colour illustrations, diagrams, and photographs for science, geography, and enrichment titles.' },
          { title: 'Reprint Service', description: 'Consistent reprinting each term. We hold your files and maintain format integrity across editions.' },
          { title: 'Educational Publisher Volumes', description: 'Large print runs for established educational publishers with strict quality and deadline requirements.' },
        ]}
        processSteps={[
          { title: 'Quote', description: 'Submit your educational book specs for a detailed, itemised printing quote.' },
          { title: 'File Review', description: 'We check your files and advise on any print-readiness issues before production.' },
          { title: 'Proof', description: 'Physical or digital proof approval before your full print run begins.' },
          { title: 'Print & Deliver', description: 'Books delivered to your school, tuition centre, or distribution warehouse.' },
        ]}
        faqs={faqs}
        relatedLinks={[
          { label: 'School Book Printing', path: '/schoolbookprintingjohannesburg' },
          { label: 'Workbook Printing', path: '/workbookprinting' },
          { label: 'Book Printing Johannesburg', path: '/bookprintingjohannesburg' },
          { label: 'A5 Book Printing', path: '/printing/a5' },
          { label: 'Get a Quote', path: '/getquote' },
        ]}
        ctaTitle="Print Your Educational Books"
        ctaDescription="Get a free educational book printing quote from our Johannesburg team today."
      />
    </>
  );
}