import React from 'react';
import ServicePageTemplate from '../../../components/shared/ServicePageTemplate';
import PageMeta from '../../../components/shared/PageMeta';
import { serviceSchema, faqSchema, breadcrumbSchema } from '../../../lib/seo/schemas';

const faqs = [
  { question: 'Do you print books in Sandton?', answer: 'Yes. Creative Books SA serves authors and businesses throughout Sandton. We offer book printing, publishing, editing, and design services with collection or delivery across Gauteng.' },
  { question: 'How long does book printing take for Sandton clients?', answer: 'Standard turnaround is 7–14 business days. Gauteng clients including Sandton can collect from our Johannesburg facility or receive courier delivery within 1–2 business days.' },
  { question: 'Can I visit your office from Sandton?', answer: 'Yes. We welcome in-person consultations from Sandton clients at our Johannesburg office by appointment.' },
  { question: 'What book printing services do you offer Sandton businesses?', answer: 'We offer softcover and hardcover book printing, annual report printing, workbook printing, corporate book printing, and full publishing services for Sandton-based businesses and authors.' },
];

const schema = {
  '@context': 'https://schema.org',
  '@graph': [
    serviceSchema({ name: 'Book Printing Sandton', description: 'Professional book printing services for authors and businesses in Sandton, Gauteng.', url: '/bookprintingsandton', areaServed: 'Sandton, Johannesburg, Gauteng, South Africa' }),
    faqSchema(faqs),
    breadcrumbSchema([{ name: 'Home', path: '/' }, { name: 'Book Printing', path: '/bookprinting' }, { name: 'Book Printing Sandton', path: '/bookprintingsandton' }]),
  ],
};

export default function BookPrintingSandton() {
  return (
    <>
      <PageMeta
        title="Book Printing Sandton | Professional Book Printers Sandton | Creative Books SA"
        description="Book printing services for Sandton authors and businesses. Softcover, hardcover, and specialty book printing with delivery to Sandton, Johannesburg. Get a free quote today."
        keywords="book printing Sandton, book printers Sandton, Sandton book printing, printing services Sandton, book publishing Sandton"
        canonical="https://www.creativebookssa.co.za/bookprintingsandton"
        schema={schema}
      />
      <ServicePageTemplate
        heroImage="https://media.base44.com/images/public/69fb173eeab1ba78da6eab45/cff7b79e1_generated_7cf45eea.png"
        subtitle="Book Printing Sandton"
        title="Book Printing in Sandton"
        description="Creative Books SA provides professional book printing services to authors, publishers, and businesses in Sandton and throughout the greater Johannesburg area. Softcover, hardcover, and full-colour printing with fast Gauteng turnaround."
        features={[
          { title: 'Sandton Delivery Available', description: 'We deliver printed books directly to Sandton addresses via courier within 1–2 business days after printing is complete.' },
          { title: 'Corporate Book Printing', description: 'Annual reports, corporate books, training manuals, and branded publications for Sandton businesses and the corporate sector.' },
          { title: 'Premium Hardcover & Softcover', description: 'Full range of binding options including perfect-bound softcover and case-bound hardcover for all types of books.' },
          { title: 'Author Services', description: 'Complete publishing, editing, cover design, and printing packages for Sandton-based self-publishing authors.' },
          { title: 'Fast Turnaround', description: 'Standard 7–14 business day turnaround. Rush printing available. Gauteng collection and delivery options.' },
          { title: 'Competitive SA Pricing', description: 'Transparent, competitive book printing pricing designed for South African authors and businesses.' },
        ]}
        processSteps={[
          { title: 'Free Consultation', description: 'Contact us from Sandton for a free quote and publishing consultation — in person, by phone, or online.' },
          { title: 'File Submission', description: 'Submit your print-ready PDF or manuscript. We check files and advise on any adjustments needed.' },
          { title: 'Proof & Approval', description: 'Review a digital or physical proof before your full print run is produced.' },
          { title: 'Print & Deliver to Sandton', description: 'Books printed in Johannesburg and delivered to your Sandton address.' },
        ]}
        faqs={faqs}
        relatedLinks={[
          { label: 'Book Printing Johannesburg', path: '/bookprintingjohannesburg' },
          { label: 'Book Printing Randburg', path: '/bookprintingrandburg' },
          { label: 'Book Printing Midrand', path: '/bookprintingmidrand' },
          { label: 'A5 Book Printing', path: '/printing/a5' },
          { label: 'Hardcover Printing', path: '/printing/hardcover' },
          { label: 'Annual Report Design', path: '/annualreportdesignsandton' },
          { label: 'Get a Quote', path: '/getquote' },
        ]}
        ctaTitle="Get a Book Printing Quote for Sandton"
        ctaDescription="Contact us today for a free book printing quote. We serve Sandton and all of Gauteng."
      />
    </>
  );
}