import React from 'react';
import ServicePageTemplate from '../../../components/shared/ServicePageTemplate';
import PageMeta from '../../../components/shared/PageMeta';
import { serviceSchema, faqSchema, breadcrumbSchema } from '../../../lib/seo/schemas';

const faqs = [
  { question: 'Do you offer book printing for Roodepoort clients?', answer: 'Yes. We serve Roodepoort authors, businesses, and publishers with professional book printing, publishing, and editing services. Delivery to all Roodepoort addresses is available.' },
  { question: 'What types of books do you print for Roodepoort?', answer: 'We print novels, non-fiction, memoirs, children\'s books, workbooks, training manuals, poetry collections, and Christian books for Roodepoort clients.' },
  { question: 'How quickly can I receive my books in Roodepoort?', answer: 'After printing (7–14 business days), courier delivery to Roodepoort typically takes 1 business day.' },
  { question: 'Do you offer self-publishing for Roodepoort authors?', answer: 'Yes. We offer complete self-publishing packages for Roodepoort authors — editing, ISBN, cover design, typesetting, printing, and distribution setup.' },
];

const schema = {
  '@context': 'https://schema.org',
  '@graph': [
    serviceSchema({ name: 'Book Printing Roodepoort', description: 'Book printing services for authors and businesses in Roodepoort, Gauteng.', url: '/bookprintingroodepoort', areaServed: 'Roodepoort, Johannesburg, Gauteng, South Africa' }),
    faqSchema(faqs),
    breadcrumbSchema([{ name: 'Home', path: '/' }, { name: 'Book Printing', path: '/bookprinting' }, { name: 'Book Printing Roodepoort', path: '/bookprintingroodepoort' }]),
  ],
};

export default function BookPrintingRoodepoort() {
  return (
    <>
      <PageMeta
        title="Book Printing Roodepoort | Professional Book Printers | Creative Books SA"
        description="Book printing services for Roodepoort authors and businesses. Softcover, hardcover, and specialty printing with delivery to Roodepoort. Get a free quote today."
        keywords="book printing Roodepoort, book printers Roodepoort, printing services Roodepoort, self publishing Roodepoort, book printing West Rand"
        canonical="https://www.creativebookssa.co.za/bookprintingroodepoort"
        schema={schema}
      />
      <ServicePageTemplate
        heroImage="https://media.base44.com/images/public/69fb173eeab1ba78da6eab45/cff7b79e1_generated_7cf45eea.png"
        subtitle="Book Printing Roodepoort"
        title="Book Printing in Roodepoort"
        description="Professional book printing for Roodepoort authors and businesses on the West Rand. Creative Books SA serves all of Gauteng including Roodepoort with premium book printing, self-publishing, and corporate publication services."
        features={[
          { title: 'Roodepoort Delivery', description: 'Fast courier delivery to all Roodepoort addresses. Typically 1 business day from our Johannesburg facility after printing.' },
          { title: 'Self-Publishing Packages', description: 'Complete self-publishing support — editing, cover design, printing, and distribution for Roodepoort authors.' },
          { title: 'All Book Types', description: 'Novels, poetry, memoirs, children\'s books, workbooks, training manuals, and more.' },
          { title: 'Affordable Printing', description: 'Competitive book printing pricing for Roodepoort and West Rand authors and businesses.' },
          { title: 'Quality Guaranteed', description: 'Professional-grade printing matching international publishing standards.' },
          { title: 'Expert Advice', description: 'Free consultation for Roodepoort authors — we guide you through every step of the publishing process.' },
        ]}
        processSteps={[
          { title: 'Get Your Quote', description: 'Request a free book printing quote from Roodepoort via our online form or phone.' },
          { title: 'Submit Files', description: 'Upload your PDF or manuscript for file checking and specification review.' },
          { title: 'Approve Proof', description: 'Review a digital or physical proof before your print run begins.' },
          { title: 'Deliver to Roodepoort', description: 'Your books are printed and couriered to your Roodepoort address.' },
        ]}
        faqs={faqs}
        relatedLinks={[
          { label: 'Book Printing Johannesburg', path: '/bookprintingjohannesburg' },
          { label: 'Book Printing Randburg', path: '/bookprintingrandburg' },
          { label: 'Self Publishing SA', path: '/selfpublishingsouthafrica' },
          { label: 'A5 Book Printing', path: '/printing/a5' },
          { label: 'Book Publishing', path: '/bookpublishing' },
          { label: 'Get a Quote', path: '/getquote' },
        ]}
        ctaTitle="Get a Book Printing Quote for Roodepoort"
        ctaDescription="Serving Roodepoort and the West Rand with premium book printing. Get your free quote today."
      />
    </>
  );
}