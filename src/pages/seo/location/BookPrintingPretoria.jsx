import React from 'react';
import ServicePageTemplate from '../../../components/shared/ServicePageTemplate';
import PageMeta from '../../../components/shared/PageMeta';
import { serviceSchema, faqSchema, breadcrumbSchema } from '../../../lib/seo/schemas';

const faqs = [
  { question: 'Do you print books for Pretoria clients?', answer: 'Yes. We serve Pretoria authors, businesses, and publishers with delivery to all Pretoria and Tshwane addresses.' },
  { question: 'How long does delivery take to Pretoria?', answer: 'After printing (7–14 business days), courier delivery to Pretoria typically takes 1–2 business days.' },
  { question: 'Do you offer academic book printing for Pretoria universities?', answer: 'Yes. We offer thesis printing, dissertation printing, and academic book printing for Pretoria universities and researchers.' },
  { question: 'Can I get government publication printing for Pretoria?', answer: 'Yes. We provide professional publication printing for government departments, NGOs, and institutions in the Tshwane region.' },
];

const schema = {
  '@context': 'https://schema.org',
  '@graph': [
    serviceSchema({ name: 'Book Printing Pretoria', description: 'Book printing services for authors, businesses, and academics in Pretoria, Tshwane.', url: '/bookprintingpretoria', areaServed: 'Pretoria, Tshwane, Gauteng, South Africa' }),
    faqSchema(faqs),
    breadcrumbSchema([{ name: 'Home', path: '/' }, { name: 'Book Printing', path: '/bookprinting' }, { name: 'Book Printing Pretoria', path: '/bookprintingpretoria' }]),
  ],
};

export default function BookPrintingPretoria() {
  return (
    <>
      <PageMeta
        title="Book Printing Pretoria | Professional Book Printers Tshwane | Creative Books SA"
        description="Book printing services for Pretoria and Tshwane authors, businesses, and academics. Softcover, hardcover, academic, and corporate printing. Delivery to Pretoria. Get a free quote."
        keywords="book printing Pretoria, book printers Pretoria, printing services Tshwane, academic book printing Pretoria, book printing Gauteng"
        canonical="https://www.creativebookssa.co.za/bookprintingpretoria"
        schema={schema}
      />
      <ServicePageTemplate
        heroImage="https://media.base44.com/images/public/69fb173eeab1ba78da6eab45/cff7b79e1_generated_7cf45eea.png"
        subtitle="Book Printing Pretoria"
        title="Book Printing in Pretoria"
        description="Professional book printing services for Pretoria and Tshwane-based authors, academics, businesses, and government organisations. Creative Books SA brings premium book printing quality to Pretoria with fast delivery."
        features={[
          { title: 'Pretoria Delivery', description: 'Fast courier delivery to all Pretoria and Tshwane addresses within 1–2 business days after printing.' },
          { title: 'Academic Book Printing', description: 'Thesis printing, dissertation printing, and academic publications for Pretoria universities and researchers.' },
          { title: 'Government & NGO Publications', description: 'Professional publication printing for government departments, NGOs, and institutions in the Tshwane region.' },
          { title: 'Corporate Book Printing', description: 'Annual reports, training manuals, workbooks, and branded publications for Pretoria businesses.' },
          { title: 'Author Publishing Services', description: 'Full publishing support for Pretoria-based self-publishing authors — editing, design, printing, and ISBN.' },
          { title: 'Competitive Pricing', description: 'Transparent, competitive pricing for all Pretoria and Gauteng clients. No hidden costs.' },
        ]}
        processSteps={[
          { title: 'Consultation', description: 'Contact us from Pretoria for a free quote by phone, email, or our online quote form.' },
          { title: 'File Submission', description: 'Submit your manuscript or print-ready PDF. We check and advise on any adjustments needed.' },
          { title: 'Proof Approval', description: 'Review your book proof before the full print run begins.' },
          { title: 'Deliver to Pretoria', description: 'Books printed in Johannesburg and couriered to your Pretoria address within 1–2 days.' },
        ]}
        faqs={faqs}
        relatedLinks={[
          { label: 'Book Printing Johannesburg', path: '/bookprintingjohannesburg' },
          { label: 'Book Printing Midrand', path: '/bookprintingmidrand' },
          { label: 'Book Printing Centurion', path: '/bookprintingcenturion' },
          { label: 'Academic Editing', path: '/academicediting' },
          { label: 'Thesis Editing', path: '/thesisediting' },
          { label: 'Get a Quote', path: '/getquote' },
        ]}
        ctaTitle="Get a Book Printing Quote for Pretoria"
        ctaDescription="Professional book printing serving Pretoria and Tshwane. Get your free quote within 24 hours."
      />
    </>
  );
}