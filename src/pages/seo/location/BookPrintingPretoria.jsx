import React from 'react';
import ServicePageTemplate from '../../../components/shared/ServicePageTemplate';
import PageMeta from '../../../components/shared/PageMeta';
import InternalLinks from '../../../components/shared/InternalLinks';

export default function BookPrintingPretoria() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    'name': 'Book Printing Pretoria',
    'description': 'Professional book printing services in Pretoria, Gauteng. High-quality printing for authors, businesses, and academics.',
    'areaServed': 'Pretoria, Gauteng, South Africa',
  };

  return (
    <>
      <PageMeta
        title="Book Printing in Pretoria | Creative Books SA"
        description="Looking for book printing in Pretoria? Creative Books SA helps authors with high-quality softcover, hardcover, and specialty book printing. Fast delivery to Pretoria and Tshwane."
        keywords="book printing Pretoria, book printers Pretoria, Pretoria book printing, printing services Pretoria, book publishing Pretoria, Tshwane book printing"
        canonical="https://www.creativebookssa.co.za/bookprintingpretoria"
        schema={schema}
      />
      
      <ServicePageTemplate
        heroImage="https://media.base44.com/images/public/69fb173eeab1ba78da6eab45/cff7b79e1_generated_7cf45eea.png"
        subtitle="Book Printing Pretoria"
        title="Premium Book Printing Services in Pretoria"
        description="High-quality book printing in Pretoria, Gauteng. Hardcover, softcover, children's books, workbooks, academic printing, and specialty formats. Fast delivery to Pretoria and Tshwane with competitive pricing."
        features={[
          { title: 'Hardcover Printing', description: 'Case-bound hardcover books with dust jackets, foil stamping, and premium finishes for Pretoria authors.' },
          { title: 'Softcover Printing', description: 'Perfect-bound softcover books with laminated covers in gloss or matte finishes.' },
          { title: 'Academic Printing', description: 'Specialised printing for theses, dissertations, and academic publications with university formatting compliance.' },
          { title: 'Cream & White Paper', description: 'Choose between cream (80gsm/100gsm) and white (80gsm/100gsm) paper options.' },
          { title: 'Multiple Sizes', description: 'A5, 6×9, A4, and custom sizes available. We accommodate all standard and unique formats.' },
          { title: 'Fast Delivery', description: 'Quick delivery to Pretoria and Tshwane areas. Same-day or next-day delivery available for urgent projects.' },
        ]}
        processSteps={[
          { title: 'Submit Your Files', description: 'Send us your print-ready PDF or manuscript. We review files for print compatibility.' },
          { title: 'Choose Your Specs', description: 'Select paper type, cover finish, binding, size, and quantity.' },
          { title: 'Proof Approval', description: 'Review a digital proof or order a physical proof copy before the full print run.' },
          { title: 'Print & Deliver', description: 'Professional printing with fast delivery to Pretoria and anywhere in South Africa.' },
        ]}
        faqs={[
          { question: 'Do you offer book printing in Pretoria?', answer: 'Yes. Creative Books SA provides professional book printing services for authors, businesses, and academics in Pretoria and throughout Gauteng.' },
          { question: 'What is the minimum print run?', answer: 'Our minimum order is 50 copies for offset printing. For print-on-demand, you can order as few as 1 copy.' },
          { question: 'How much does book printing cost?', answer: 'Pricing depends on page count, size, paper type, cover type, and quantity. A 200-page softcover A5 book starts from approximately R45 per copy for 100 copies. Request a detailed quote for your specs.' },
          { question: 'What file format do you need?', answer: 'We accept print-ready PDF files (PDF/X-1a preferred). If you don\'t have print-ready files, we offer typesetting and formatting services.' },
          { question: 'How fast is delivery to Pretoria?', answer: 'Standard turnaround is 7–14 business days from proof approval. Rush printing (3–5 days) is available. We deliver to Pretoria within 1–2 business days.' },
          { question: 'Do you print academic theses and dissertations?', answer: 'Yes. We specialise in academic printing for universities in Pretoria and ensure compliance with institutional formatting requirements.' },
          { question: 'Can you design my book cover before printing?', answer: 'Yes. Our book cover design team creates professional print-ready covers with front, spine, and back cover integration.' },
        ]}
        relatedLinks={[
          { label: 'Book Printing Johannesburg', path: '/bookprintingjohannesburg' },
          { label: 'Book Printing Midrand', path: '/bookprintingmidrand' },
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
        ctaTitle="Get a Printing Quote in Pretoria"
        ctaDescription="Tell us your book specs and we'll send you a competitive printing quote within 24 hours. Fast delivery to Pretoria, Tshwane, and throughout Gauteng."
      />
      
      <InternalLinks
        links={[
          { label: 'Book Printing Johannesburg', path: '/bookprintingjohannesburg' },
          { label: 'Book Printing Midrand', path: '/bookprintingmidrand' },
          { label: 'Book Printing Centurion', path: '/bookprintingcenturion' },
          { label: 'Typesetting Services', path: '/typesetting' },
          { label: 'Self-Publishing Packages', path: '/selfpublishingpackagesinsouthafrica' },
          { label: 'Request a Quote', path: '/getquote' },
        ]}
        light
      />
    </>
  );
}