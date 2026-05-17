import React from 'react';
import ServicePageTemplate from '../../../components/shared/ServicePageTemplate';
import PageMeta from '../../../components/shared/PageMeta';
import { serviceSchema, faqSchema, breadcrumbSchema } from '../../../lib/seo/schemas';

const faqs = [
  { question: 'What size is best for a business book?', answer: '6×9 inches is recommended if you plan to sell on Amazon internationally. A5 is better for South African market distribution. We often print both formats for business authors.' },
  { question: 'Can I use a business book for corporate gifting?', answer: 'Yes. Many business authors print hardcover editions specifically for corporate gifting — signed copies given to clients, partners, or delegates at events. We produce small hardcover runs from 50 copies.' },
  { question: 'Do you help with business book editing?', answer: 'Yes. We offer professional business book editing including copy editing, proofreading, and developmental editing to sharpen your message and authority.' },
  { question: 'How much does business book printing cost?', answer: 'A 200-page A5 or 6×9 softcover at 100 copies costs approximately R50–R75 per copy. Hardcover editions cost R90–R140 per copy. Contact us for a detailed quote.' },
];

const schema = {
  '@context': 'https://schema.org',
  '@graph': [
    serviceSchema({ name: 'Business Book Printing Johannesburg', description: 'Professional business book printing and publishing in Johannesburg.', url: '/businessbookprintingjohannesburg' }),
    faqSchema(faqs),
    breadcrumbSchema([{ name: 'Home', path: '/' }, { name: 'Book Printing', path: '/bookprinting' }, { name: 'Business Book Printing', path: '/businessbookprintingjohannesburg' }]),
  ],
};

export default function BusinessBookPrinting() {
  return (
    <>
      <PageMeta
        title="Business Book Printing South Africa | A5 & 6×9 for Amazon"
        description="Business book printing for SA authors — A5 for local retail, 6×9 for Amazon KDP, hardcover for corporate gifting. Free 24-hour quote."
        keywords="business book printing Johannesburg, corporate book printing, leadership book printing South Africa, entrepreneur book printing, business publishing Johannesburg"
        canonical="https://www.creativebookssa.co.za/businessbookprintingjohannesburg"
        schema={schema}
      />
      <ServicePageTemplate
        heroImage="https://media.base44.com/images/public/69fb173eeab1ba78da6eab45/cff7b79e1_generated_7cf45eea.png"
        subtitle="Business Book Printing"
        title="Business Book Printing in South Africa"
        description="Print your business book, leadership guide, or entrepreneurship title professionally with Creative Books SA. We help South African business authors create authority-building books that open doors, generate leads, and command premium prices."
        features={[
          { title: 'A5 & 6×9 Formats', description: 'A5 for SA retail; 6×9 for Amazon KDP. We print both formats simultaneously for maximum market reach.' },
          { title: 'Hardcover Corporate Editions', description: 'Premium hardcover books for corporate gifting, board presentations, and signed launch copies.' },
          { title: 'Professional Typesetting', description: 'Business book interior design that communicates credibility and authority.' },
          { title: 'Amazon KDP Ready', description: 'We format and upload your book to Amazon KDP for international sales alongside your local print run.' },
          { title: 'Complete Publishing Package', description: 'Editing, ISBN, cover design, typesetting, printing, and KDP setup in one package.' },
          { title: 'Fast Turnaround', description: '7–14 business day printing turnaround. Rush service available for conference or event deadlines.' },
        ]}
        processSteps={[
          { title: 'Consultation', description: 'Free consultation to discuss your business book goals, audience, format, and quantity.' },
          { title: 'Editing & Design', description: 'Professional business book editing, typesetting, and premium cover design.' },
          { title: 'Print & KDP', description: 'Local print run and Amazon KDP setup running in parallel.' },
          { title: 'Launch Ready', description: 'Books delivered to your office or event venue in time for your launch.' },
        ]}
        faqs={faqs}
        relatedLinks={[
          { label: 'Business Book Publishing', path: '/businessbookpublishing' },
          { label: 'A5 Book Printing', path: '/printing/a5' },
          { label: '6×9 Book Printing', path: '/printing/6x9' },
          { label: 'Hardcover Printing', path: '/printing/hardcover' },
          { label: 'Amazon KDP', path: '/amazonkdp' },
          { label: 'Get a Quote', path: '/getquote' },
        ]}
        ctaTitle="Print Your Business Book"
        ctaDescription="Get a free business book printing and publishing quote from our Johannesburg team today."
      />
    </>
  );
}