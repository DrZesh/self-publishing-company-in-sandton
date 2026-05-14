import React from 'react';
import ServicePageTemplate from '../../../components/shared/ServicePageTemplate';
import PageMeta from '../../../components/shared/PageMeta';
import InternalLinks from '../../../components/shared/InternalLinks';

export default function BookPrintingMidrand() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    'name': 'Book Printing Midrand',
    'description': 'Professional book printing services in Midrand, Gauteng. High-quality printing for authors and businesses.',
    'areaServed': 'Midrand, Gauteng, South Africa',
  };

  return (
    <>
      <PageMeta
        title="Book Printing in Midrand | Creative Books SA"
        description="Looking for book printing in Midrand? Creative Books SA helps authors with high-quality softcover, hardcover, and specialty book printing. Fast delivery to Midrand."
        keywords="book printing Midrand, book printers Midrand, Midrand book printing, printing services Midrand, book publishing Midrand"
        canonical="https://www.creativebookssa.co.za/bookprintingmidrand"
        schema={schema}
      />
      
      <ServicePageTemplate
        heroImage="https://media.base44.com/images/public/69fb173eeab1ba78da6eab45/cff7b79e1_generated_7cf45eea.png"
        subtitle="Book Printing Midrand"
        title="Premium Book Printing Services in Midrand"
        description="High-quality book printing in Midrand, Gauteng. Hardcover, softcover, children's books, workbooks, and specialty formats. Fast delivery to Midrand with competitive pricing for authors across Gauteng."
        features={[
          { title: 'Hardcover Printing', description: 'Case-bound hardcover books with dust jackets, foil stamping, and premium finishes for Midrand authors.' },
          { title: 'Softcover Printing', description: 'Perfect-bound softcover books with laminated covers in gloss or matte finishes.' },
          { title: 'Full-Colour Printing', description: 'Vibrant full-colour printing for children\'s books, photo books, and illustrated works.' },
          { title: 'Cream & White Paper', description: 'Choose between cream (80gsm/100gsm) and white (80gsm/100gsm) paper options.' },
          { title: 'Multiple Sizes', description: 'A5, 6×9, A4, and custom sizes available. We accommodate all standard and unique formats.' },
          { title: 'Fast Delivery', description: 'Quick delivery to Midrand and surrounding areas. Same-day or next-day delivery available for urgent projects.' },
        ]}
        processSteps={[
          { title: 'Submit Your Files', description: 'Send us your print-ready PDF or manuscript. We review files for print compatibility.' },
          { title: 'Choose Your Specs', description: 'Select paper type, cover finish, binding, size, and quantity.' },
          { title: 'Proof Approval', description: 'Review a digital proof or order a physical proof copy before the full print run.' },
          { title: 'Print & Deliver', description: 'Professional printing with fast delivery to Midrand and anywhere in South Africa.' },
        ]}
        faqs={[
          { question: 'Do you offer book printing in Midrand?', answer: 'Yes. Creative Books SA provides professional book printing services for authors and businesses in Midrand and throughout Gauteng.' },
          { question: 'What is the minimum print run?', answer: 'Our minimum order is 50 copies for offset printing. For print-on-demand, you can order as few as 1 copy.' },
          { question: 'How much does book printing cost?', answer: 'Pricing depends on page count, size, paper type, cover type, and quantity. A 200-page softcover A5 book starts from approximately R45 per copy for 100 copies. Request a detailed quote for your specs.' },
          { question: 'What file format do you need?', answer: 'We accept print-ready PDF files (PDF/X-1a preferred). If you don\'t have print-ready files, we offer typesetting and formatting services.' },
          { question: 'How fast is delivery to Midrand?', answer: 'Standard turnaround is 7–14 business days from proof approval. Rush printing (3–5 days) is available. We deliver to Midrand within 1–2 business days.' },
          { question: 'Can you help with layout before printing?', answer: 'Yes. We offer book layout and typesetting services to prepare your manuscript for professional printing.' },
          { question: 'Can you design my book cover before printing?', answer: 'Yes. Our book cover design team creates professional print-ready covers with front, spine, and back cover integration.' },
        ]}
        relatedLinks={[
          { label: 'Book Printing Johannesburg', path: '/bookprintingjohannesburg' },
          { label: 'Book Printing Pretoria', path: '/bookprintingpretoria' },
          { label: 'Book Printing Centurion', path: '/bookprintingcenturion' },
          { label: 'A5 Book Printing', path: '/a5bookprinting' },
          { label: '6×9 Book Printing', path: '/6x9bookprinting' },
          { label: 'Hardcover Printing', path: '/hardcoverprinting' },
          { label: 'Softcover Printing', path: '/softcoverprinting' },
          { label: "Children's Book Printing", path: '/childrensbookprinting' },
          { label: 'Typesetting', path: '/typesetting' },
          { label: 'Book Cover Design', path: '/bookcoverdesign' },
          { label: 'Get a Quote', path: '/getquote' },
        ]}
        ctaTitle="Get a Printing Quote in Midrand"
        ctaDescription="Tell us your book specs and we'll send you a competitive printing quote within 24 hours. Fast delivery to Midrand and throughout Gauteng."
      />
      
      <InternalLinks
        links={[
          { label: 'Book Printing Johannesburg', path: '/bookprintingjohannesburg' },
          { label: 'Book Printing Pretoria', path: '/bookprintingpretoria' },
          { label: 'Book Printing Sandton', path: '/bookprintingsandton' },
          { label: 'Typesetting Services', path: '/typesetting' },
          { label: 'Self-Publishing Packages', path: '/selfpublishingpackagesinsouthafrica' },
          { label: 'Request a Quote', path: '/getquote' },
        ]}
        light
      />
    </>
  );
}