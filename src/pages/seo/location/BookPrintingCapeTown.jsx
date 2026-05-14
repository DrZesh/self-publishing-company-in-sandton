import React from 'react';
import ServicePageTemplate from '../../../components/shared/ServicePageTemplate';
import PageMeta from '../../../components/shared/PageMeta';
import InternalLinks from '../../../components/shared/InternalLinks';

export default function BookPrintingCapeTown() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    'name': 'Book Printing Cape Town',
    'description': 'Professional book printing services in Cape Town, Western Cape. High-quality printing for authors and businesses.',
    'areaServed': 'Cape Town, Western Cape, South Africa',
  };

  return (
    <>
      <PageMeta
        title="Book Printing in Cape Town | Creative Books SA"
        description="Looking for book printing in Cape Town? Creative Books SA helps Western Cape authors with high-quality softcover, hardcover, and specialty book printing. Fast delivery to Cape Town."
        keywords="book printing Cape Town, book printers Cape Town, Cape Town book printing, printing services Cape Town, book publishing Cape Town, Western Cape book printing"
        canonical="https://www.creativebookssa.co.za/bookprintingcapetown"
        schema={schema}
      />
      
      <ServicePageTemplate
        heroImage="https://media.base44.com/images/public/69fb173eeab1ba78da6eab45/cff7b79e1_generated_7cf45eea.png"
        subtitle="Book Printing Cape Town"
        title="Premium Book Printing Services in Cape Town"
        description="High-quality book printing in Cape Town, Western Cape. Hardcover, softcover, children's books, workbooks, and specialty formats. Fast delivery to Cape Town, Stellenbosch, and surrounding areas with competitive pricing."
        features={[
          { title: 'Hardcover Printing', description: 'Case-bound hardcover books with dust jackets, foil stamping, and premium finishes for Cape Town authors.' },
          { title: 'Softcover Printing', description: 'Perfect-bound softcover books with laminated covers in gloss or matte finishes.' },
          { title: 'Full-Colour Printing', description: 'Vibrant full-colour printing for children\'s books, photo books, and illustrated works.' },
          { title: 'Cream & White Paper', description: 'Choose between cream (80gsm/100gsm) and white (80gsm/100gsm) paper options.' },
          { title: 'Multiple Sizes', description: 'A5, 6×9, A4, and custom sizes available. We accommodate all standard and unique formats.' },
          { title: 'Fast Delivery', description: 'Quick delivery to Cape Town and Western Cape. 3–5 business day delivery to the Mother City and surrounding areas.' },
        ]}
        processSteps={[
          { title: 'Submit Your Files', description: 'Send us your print-ready PDF or manuscript. We review files for print compatibility.' },
          { title: 'Choose Your Specs', description: 'Select paper type, cover finish, binding, size, and quantity.' },
          { title: 'Proof Approval', description: 'Review a digital proof or order a physical proof copy before the full print run.' },
          { title: 'Print & Deliver', description: 'Professional printing with fast delivery to Cape Town and anywhere in South Africa.' },
        ]}
        faqs={[
          { question: 'Do you offer book printing in Cape Town?', answer: 'Yes. Creative Books SA provides professional book printing services for authors and businesses in Cape Town and throughout the Western Cape.' },
          { question: 'What is the minimum print run?', answer: 'Our minimum order is 50 copies for offset printing. For print-on-demand, you can order as few as 1 copy.' },
          { question: 'How much does book printing cost?', answer: 'Pricing depends on page count, size, paper type, cover type, and quantity. A 200-page softcover A5 book starts from approximately R45 per copy for 100 copies. Request a detailed quote for your specs.' },
          { question: 'What file format do you need?', answer: 'We accept print-ready PDF files (PDF/X-1a preferred). If you don\'t have print-ready files, we offer typesetting and formatting services.' },
          { question: 'How fast is delivery to Cape Town?', answer: 'Standard turnaround is 7–14 business days from proof approval. Rush printing (3–5 days) is available. We deliver to Cape Town within 3–5 business days.' },
          { question: 'Do you serve areas outside Cape Town?', answer: 'Yes. We deliver to Stellenbosch, Bellville, Paarl, Somerset West, and throughout the Western Cape region.' },
          { question: 'Can you design my book cover before printing?', answer: 'Yes. Our book cover design team creates professional print-ready covers with front, spine, and back cover integration.' },
        ]}
        relatedLinks={[
          { label: 'Book Printing Johannesburg', path: '/bookprintingjohannesburg' },
          { label: 'Book Printing Durban', path: '/bookprintingdurban' },
          { label: 'Book Printing Pretoria', path: '/bookprintingpretoria' },
          { label: 'A5 Book Printing', path: '/a5bookprinting' },
          { label: '6×9 Book Printing', path: '/6x9bookprinting' },
          { label: 'Hardcover Printing', path: '/hardcoverprinting' },
          { label: 'Softcover Printing', path: '/softcoverprinting' },
          { label: "Children's Book Printing", path: '/childrensbookprinting' },
          { label: 'Typesetting', path: '/typesetting' },
          { label: 'Book Cover Design', path: '/bookcoverdesign' },
          { label: 'Get a Quote', path: '/getquote' },
        ]}
        ctaTitle="Get a Printing Quote in Cape Town"
        ctaDescription="Tell us your book specs and we'll send you a competitive printing quote within 24 hours. Fast delivery to Cape Town and throughout the Western Cape."
      />
      
      <InternalLinks
        links={[
          { label: 'Book Printing Johannesburg', path: '/bookprintingjohannesburg' },
          { label: 'Book Printing Durban', path: '/bookprintingdurban' },
          { label: 'Book Cover Design Cape Town', path: '/bookcoverdesigncapetown' },
          { label: 'Typesetting Services', path: '/typesetting' },
          { label: 'Self-Publishing Packages', path: '/selfpublishingpackagesinsouthafrica' },
          { label: 'Request a Quote', path: '/getquote' },
        ]}
        light
      />
    </>
  );
}