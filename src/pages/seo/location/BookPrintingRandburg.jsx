import React from 'react';
import ServicePageTemplate from '../../../components/shared/ServicePageTemplate';
import PageMeta from '../../../components/shared/PageMeta';
import { serviceSchema, faqSchema, breadcrumbSchema } from '../../../lib/seo/schemas';

const faqs = [
  { question: 'Do you offer book printing services in Randburg?', answer: 'Yes. We serve authors and businesses in Randburg with professional book printing, publishing, and editing services. We offer delivery to Randburg or collection from our Johannesburg facility.' },
  { question: 'How quickly can I get books delivered to Randburg?', answer: 'After printing (7–14 business days), we deliver to Randburg within 1–2 business days via courier. Same-day collection from Johannesburg is also available.' },
  { question: 'Do you print small quantities for Randburg authors?', answer: 'Yes. We print from as few as 50 copies for offset printing, or from 1 copy for print-on-demand.' },
  { question: 'What types of books do you print for Randburg clients?', answer: 'We print novels, non-fiction, memoirs, children\'s books, workbooks, poetry, Christian books, and business publications for clients in Randburg.' },
];

const schema = {
  '@context': 'https://schema.org',
  '@graph': [
    serviceSchema({ name: 'Book Printing Randburg', description: 'Professional book printing for Randburg authors and businesses in Gauteng.', url: '/bookprintingrandburg', areaServed: 'Randburg, Johannesburg, Gauteng, South Africa' }),
    faqSchema(faqs),
    breadcrumbSchema([{ name: 'Home', path: '/' }, { name: 'Book Printing', path: '/bookprinting' }, { name: 'Book Printing Randburg', path: '/bookprintingrandburg' }]),
  ],
};

export default function BookPrintingRandburg() {
  return (
    <>
      <PageMeta
        title="Book Printing Randburg | Professional Book Printers | Creative Books SA"
        description="Book printing services for Randburg authors and businesses. Softcover, hardcover, and specialty printing with delivery to Randburg, Gauteng. Get a free quote today."
        keywords="book printing Randburg, book printers Randburg, printing services Randburg, self publishing Randburg, book printing Gauteng"
        canonical="https://www.creativebookssa.co.za/bookprintingrandburg"
        schema={schema}
      />
      <ServicePageTemplate
        heroImage="https://media.base44.com/images/public/69fb173eeab1ba78da6eab45/cff7b79e1_generated_7cf45eea.png"
        subtitle="Book Printing Randburg"
        title="Book Printing in Randburg"
        description="Professional book printing services for Randburg authors, publishers, and businesses. Creative Books SA offers softcover, hardcover, full-colour, and specialty book printing with fast Gauteng delivery."
        features={[
          { title: 'Randburg Delivery', description: 'Fast courier delivery to Randburg addresses within 1–2 business days after printing is completed.' },
          { title: 'All Book Types', description: 'Novels, non-fiction, memoirs, workbooks, children\'s books, poetry, business books, and more.' },
          { title: 'Softcover & Hardcover', description: 'Perfect-bound softcover and case-bound hardcover printing with a full range of paper and finish options.' },
          { title: 'Self Publishing Support', description: 'Full self-publishing packages including editing, cover design, printing, and ISBN registration for Randburg authors.' },
          { title: 'Small & Large Runs', description: 'Print from 50 copies to 50,000+ copies. Print-on-demand available for single copies and small quantities.' },
          { title: 'No Hidden Costs', description: 'Transparent, itemised printing quotes. No surprises. Competitive pricing for all Gauteng clients.' },
        ]}
        processSteps={[
          { title: 'Request a Quote', description: 'Contact us from Randburg for a personalised book printing quote at no obligation.' },
          { title: 'Submit Your Files', description: 'Upload your print-ready PDF or manuscript for file checking and print spec confirmation.' },
          { title: 'Review Your Proof', description: 'Approve a digital or physical proof before production begins.' },
          { title: 'Deliver to Randburg', description: 'Your books are printed in Johannesburg and delivered to your Randburg door.' },
        ]}
        faqs={faqs}
        relatedLinks={[
          { label: 'Book Printing Johannesburg', path: '/bookprintingjohannesburg' },
          { label: 'Book Printing Sandton', path: '/bookprintingsandton' },
          { label: 'Book Printing Roodepoort', path: '/bookprintingroodepoort' },
          { label: 'A5 Book Printing', path: '/printing/a5' },
          { label: 'Book Publishing', path: '/bookpublishing' },
          { label: 'Get a Quote', path: '/getquote' },
        ]}
        ctaTitle="Get a Book Printing Quote for Randburg"
        ctaDescription="Contact us for a free printing quote. We serve Randburg and all of greater Johannesburg."
      />
    </>
  );
}