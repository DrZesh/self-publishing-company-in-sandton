import React from 'react';
import ServicePageTemplate from '../../../components/shared/ServicePageTemplate';
import PageMeta from '../../../components/shared/PageMeta';
import { serviceSchema, faqSchema, breadcrumbSchema } from '../../../lib/seo/schemas';

const faqs = [
  { question: 'What is the best size for a poetry book in South Africa?', answer: 'A5 (148×210mm) is the most popular size for poetry collections in South Africa. It is compact, affordable to print, and the format most readers associate with literary poetry.' },
  { question: 'How many pages does a poetry collection need to be?', answer: 'Most poetry collections are between 60 and 120 pages. We can print from as few as 50 pages. Shorter collections often use thicker paper to give the book more substance.' },
  { question: 'What paper is best for poetry books?', answer: 'Cream 80gsm or 100gsm paper is the traditional choice for poetry — it gives a warm, literary feel. White paper is also an option for a more contemporary, minimalist aesthetic.' },
  { question: 'How much does poetry book printing cost?', answer: 'A 96-page A5 softcover poetry book costs approximately R35–R55 per copy for 100 copies. Contact us for a precise quote based on your page count and specifications.' },
];

const schema = {
  '@context': 'https://schema.org',
  '@graph': [
    serviceSchema({ name: 'Poetry Book Printing Johannesburg', description: 'Specialist poetry book printing in Johannesburg for South African poets.', url: '/poetrybookprintingjohannesburg' }),
    faqSchema(faqs),
    breadcrumbSchema([{ name: 'Home', path: '/' }, { name: 'Book Printing', path: '/bookprinting' }, { name: 'Poetry Book Printing', path: '/poetrybookprintingjohannesburg' }]),
  ],
};

export default function PoetryBookPrinting() {
  return (
    <>
      <PageMeta
        title="Poetry Book Printing South Africa | Beautiful Editions"
        description="Specialist poetry book printing in South Africa. Beautiful, considered editions for poets and small presses."
        keywords="poetry book printing Johannesburg, poetry collection printing, print poetry book South Africa, poetry publishing Johannesburg"
        canonical="https://www.creativebookssa.co.za/poetrybookprintingjohannesburg"
        schema={schema}
      />
      <ServicePageTemplate
        heroImage="https://media.base44.com/images/public/69fb173eeab1ba78da6eab45/cff7b79e1_generated_7cf45eea.png"
        subtitle="Poetry Book Printing"
        title="Poetry Book Printing in South Africa"
        description="Creative Books SA provides specialist poetry book printing for South African poets. From intimate collections to prize-worthy volumes, we print poetry books that honour your work with premium quality production."
        features={[
          { title: 'A5 Poetry Format', description: 'A5 softcover on cream paper — the classic, trusted format for South African poetry collections.' },
          { title: 'Small Runs Welcome', description: 'Print from 50 copies for chapbooks and limited editions. No need for large minimum orders.' },
          { title: 'Cream & White Paper', description: 'Choose cream 80gsm for a warm literary feel or white 80gsm for a contemporary minimalist look.' },
          { title: 'Hardcover Poetry Editions', description: 'Premium hardcover editions for signed, collector, or prize submissions. Limited runs available.' },
          { title: 'Cover Design', description: 'Professional poetry book cover design by our in-house designers who understand literary aesthetics.' },
          { title: 'Full Publishing Package', description: 'Editing, ISBN, typesetting, cover design, and printing — complete poetry publishing in one place.' },
        ]}
        processSteps={[
          { title: 'Consultation', description: 'Discuss your poetry collection with our team — page count, format, paper, binding, and quantities.' },
          { title: 'Typesetting', description: 'We typeset your poems in a clean, professional layout that respects line breaks and white space.' },
          { title: 'Cover Design', description: 'Beautiful literary cover design that positions your collection in the market.' },
          { title: 'Print & Deliver', description: 'Your poetry books printed in Johannesburg and delivered nationwide.' },
        ]}
        faqs={faqs}
        relatedLinks={[
          { label: 'Poetry Publishing', path: '/poetrypublishing' },
          { label: 'A5 Book Printing', path: '/printing/a5' },
          { label: 'Book Cover Design', path: '/bookcoverdesign' },
          { label: 'Self Publishing SA', path: '/selfpublishingsouthafrica' },
          { label: 'ISBN Registration', path: '/isbnregistration' },
          { label: 'Get a Quote', path: '/getquote' },
        ]}
        ctaTitle="Print Your Poetry Collection"
        ctaDescription="Get a free poetry book printing quote from our Johannesburg team today."
      />
    </>
  );
}