import React from 'react';
import ServicePageTemplate from '../../../components/shared/ServicePageTemplate';
import PageMeta from '../../../components/shared/PageMeta';
import { serviceSchema, faqSchema, breadcrumbSchema } from '../../../lib/seo/schemas';

const faqs = [
  { question: 'What is the best size for a memoir?', answer: 'A5 (148×210mm) is the most popular and cost-effective format for memoirs in South Africa. It is compact, familiar to readers, and prints economically.' },
  { question: 'Should I print my memoir in softcover or hardcover?', answer: 'Many memoir authors print both — a softcover run for general sales and a small hardcover edition for signed copies, family gifts, and book launch keepsakes.' },
  { question: 'How long does memoir printing take?', answer: 'Standard turnaround is 7–14 business days from file approval. Rush printing is available.' },
  { question: 'Do you offer memoir editing services?', answer: 'Yes. We offer proofreading, copy editing, and developmental editing for memoirs. Many clients use our full publishing package that includes editing, design, ISBN, and printing.' },
];

const schema = {
  '@context': 'https://schema.org',
  '@graph': [
    serviceSchema({ name: 'Memoir Book Printing Johannesburg', description: 'Professional memoir book printing services in Johannesburg.', url: '/memoirbookprintingjohannesburg' }),
    faqSchema(faqs),
    breadcrumbSchema([{ name: 'Home', path: '/' }, { name: 'Book Printing', path: '/bookprinting' }, { name: 'Memoir Book Printing', path: '/memoirbookprintingjohannesburg' }]),
  ],
};

export default function MemoirBookPrinting() {
  return (
    <>
      <PageMeta
        title="Memoir Printing Services South Africa | Tell Your Story"
        description="Beautiful memoir printing in South Africa. Quality hardcover and paperback printing for personal histories and life stories."
        keywords="memoir book printing Johannesburg, memoir printing South Africa, print memoir book, memoir publishing Johannesburg, biography printing South Africa"
        canonical="https://www.creativebookssa.co.za/memoirbookprintingjohannesburg"
        schema={schema}
      />
      <ServicePageTemplate
        heroImage="https://media.base44.com/images/public/69fb173eeab1ba78da6eab45/cff7b79e1_generated_7cf45eea.png"
        subtitle="Memoir Book Printing"
        title="Memoir Book Printing in Johannesburg"
        description="Print your memoir professionally with Creative Books SA. Whether it is a personal family memoir, a business biography, or a literary autobiography, we bring your story to life in a beautifully produced book."
        features={[
          { title: 'Personal & Family Memoirs', description: 'We specialise in private family memoir printing — from 50 copies for family to 500+ for wider distribution.' },
          { title: 'Cream Paper for Warmth', description: 'Cream 80gsm paper gives memoirs a warm, personal feel that suits the intimate nature of the genre.' },
          { title: 'Hardcover Gift Editions', description: 'Premium hardcover editions for gifts, commemorations, and keepsake family histories.' },
          { title: 'Photo Sections', description: 'Full-colour photo inserts or full-colour interior for memoirs with photographs.' },
          { title: 'Complete Publishing Package', description: 'Editing, ISBN, cover design, typesetting, and printing — we handle the whole process.' },
          { title: 'Small & Large Runs', description: 'Print 50 copies for family or 500+ for commercial release. We accommodate both.' },
        ]}
        processSteps={[
          { title: 'Consultation', description: 'Discuss your memoir project — page count, photos, format, quantities, and timeline.' },
          { title: 'Editing & Design', description: 'Professional editing and interior layout. Photo section design if applicable.' },
          { title: 'Cover & ISBN', description: 'Bespoke cover design and ISBN registration for your memoir.' },
          { title: 'Print & Deliver', description: 'Your memoir books printed and delivered nationwide, or collected in Johannesburg.' },
        ]}
        faqs={faqs}
        relatedLinks={[
          { label: 'Memoir Publishing', path: '/memoirpublishing' },
          { label: 'Memoir Writing', path: '/memoirwriting' },
          { label: 'A5 Book Printing', path: '/printing/a5' },
          { label: 'Hardcover Printing', path: '/printing/hardcover' },
          { label: 'Book Editing', path: '/bookediting' },
          { label: 'Get a Quote', path: '/getquote' },
        ]}
        ctaTitle="Print Your Memoir Professionally"
        ctaDescription="Get a free memoir printing and publishing quote from our Johannesburg team today."
      />
    </>
  );
}