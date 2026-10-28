import React from 'react';
import ServicePageTemplate from '../../components/shared/ServicePageTemplate';
import PageMeta from '../../components/shared/PageMeta';
import { serviceSchema, breadcrumbSchema } from '../../lib/seo/schemas';

const faqs = [
  { question: 'What file format do you need?', answer: 'We accept print-ready PDF files (PDF/X-1a preferred). If you don\'t have print-ready files, we offer typesetting and formatting services.' },
  { question: 'How fast is delivery?', answer: 'Standard turnaround is 7–14 business days from proof approval. Rush printing (3–5 days) is available at an additional cost.' },
];

const schema = {
  '@context': 'https://schema.org',
  '@graph': [
    serviceSchema({
      name: 'Book Printing Johannesburg',
      description: 'Professional book printing services in Johannesburg. Hardcover, softcover, children\'s books, workbooks, and specialty formats with fast turnaround and competitive pricing.',
      url: '/book-printing',
      areaServed: 'South Africa',
    }),
    breadcrumbSchema([
      { name: 'Home', path: '/' },
      { name: 'Services', path: '/book-printing' },
      { name: 'Book Printing', path: '/book-printing' },
    ]),
  ],
};

export default function BookPrinting() {
  return (
    <>
      <PageMeta
        title="Book Printing in South Africa | Creative Books SA"
        description="Professional book printing in South Africa - softcover, hardcover & full-colour, from single copies to bulk runs. Premium finishes, fast turnaround. Free quote."
        keywords="book printing South Africa, book printing Johannesburg, hardcover printing, softcover printing, children's book printing, workbook printing, offset printing, print on demand South Africa"
        canonical="https://creativebooks.co.za/book-printing"
        schema={schema}
      />
      <ServicePageTemplate
        heroImage="https://media.base44.com/images/public/69fb173eeab1ba78da6eab45/cff7b79e1_generated_7cf45eea.png"
        subtitle="Book Printing South Africa"
        title="Book Printing in South Africa"
        description="High-quality book printing in Johannesburg. Hardcover, softcover, children's books, workbooks, and specialty formats. From 50 to 50,000 copies with fast turnaround and competitive pricing."
        features={[
          { title: 'Hardcover Printing', description: 'Case-bound hardcover books with dust jackets, foil stamping, and premium finishes.' },
          { title: 'Softcover Printing', description: 'Perfect-bound softcover books with laminated covers in gloss or matte finishes.' },
          { title: 'Full-Colour Printing', description: 'Vibrant full-colour printing for children\'s books, photo books, and illustrated works.' },
          { title: 'Cream & White Paper', description: 'Choose between cream (80gsm/100gsm) and white (80gsm/100gsm) paper options.' },
          { title: 'Multiple Sizes', description: 'A5, 6×9, A4, and custom sizes available. We accommodate all standard and unique formats.' },
          { title: 'Print-on-Demand', description: 'No minimum order. Print single copies or bulk runs of thousands.' },
        ]}
        processSteps={[
          { title: 'Submit Your Files', description: 'Send us your print-ready PDF or manuscript. We review files for print compatibility.' },
          { title: 'Choose Your Specs', description: 'Select paper type, cover finish, binding, size, and quantity.' },
          { title: 'Proof Approval', description: 'Review a digital proof or order a physical proof copy before the full print run.' },
          { title: 'Print & Deliver', description: 'Professional printing in Johannesburg with delivery anywhere in South Africa.' },
        ]}
        faqs={faqs}
        relatedLinks={[
          { label: 'Book Printing Johannesburg', path: '/book-printing-johannesburg' },
          { label: 'A5 Book Printing', path: '/printing/a5' },
          { label: '6×9 Book Printing', path: '/printing/6x9' },
          { label: 'Hardcover Printing', path: '/printing/hardcover' },
          { label: 'Softcover Printing', path: '/book-printing' },
          { label: "Children's Book Printing", path: '/printing/childrensbooks' },
          { label: 'Typesetting', path: '/typesetting' },
          { label: 'Book Cover Design', path: '/book-cover-design' },
          { label: 'Publishing Packages', path: '/publishingpackages/a5' },
          { label: 'Get a Quote', path: '/getquote' },
        ]}
        ctaTitle="Get a Printing Quote"
        ctaDescription="Tell us your book specs and we'll send you a competitive printing quote within 24 hours."
      />
    </>
  );
}