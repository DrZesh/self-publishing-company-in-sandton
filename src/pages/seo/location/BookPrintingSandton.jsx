import React from 'react';
import ServicePageTemplate from '../../../components/shared/ServicePageTemplate';
import PageMeta from '../../../components/shared/PageMeta';
import CTASection from '../../../components/shared/CTASection';
import InternalLinks from '../../../components/shared/InternalLinks';

export default function BookPrintingSandton() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    'name': 'Book Printing Sandton',
    'description': 'Professional book printing services in Sandton, Johannesburg. High-quality printing for authors and businesses.',
    'areaServed': 'Sandton, Gauteng, South Africa',
  };

  return (
    <>
      <PageMeta
        title="Book Printing in Sandton | Creative Books SA"
        description="Looking for book printing in Sandton? Creative Books SA helps South African authors with high-quality softcover, hardcover, and specialty book printing. Request a quote today."
        keywords="book printing Sandton, book printers Sandton, Sandton book printing, printing services Sandton, book publishing Sandton"
        canonical="https://www.creativebookssa.co.za/bookprintingsandton"
        schema={schema}
      />
      
      <ServicePageTemplate
        heroImage="https://media.base44.com/images/public/69fb173eeab1ba78da6eab45/cff7b79e1_generated_7cf45eea.png"
        subtitle="Book Printing Sandton"
        title="Premium Book Printing Services in Sandton"
        description="High-quality book printing in Sandton, Johannesburg. Hardcover, softcover, children's books, workbooks, and specialty formats. From 50 to 50,000 copies with fast turnaround and competitive pricing for authors in Gauteng."
        features={[
          { title: 'Hardcover Printing', description: 'Case-bound hardcover books with dust jackets, foil stamping, and premium finishes for Sandton authors.' },
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
          { title: 'Print & Deliver', description: 'Professional printing in Sandton with delivery anywhere in South Africa.' },
        ]}
        faqs={[
          { question: 'Do you offer book printing in Sandton?', answer: 'Yes. Creative Books SA provides professional book printing services for authors and businesses in Sandton, Johannesburg, and throughout Gauteng.' },
          { question: 'What is the minimum print run?', answer: 'Our minimum order is 50 copies for offset printing. For print-on-demand, you can order as few as 1 copy.' },
          { question: 'How much does book printing cost?', answer: 'Pricing depends on page count, size, paper type, cover type, and quantity. A 200-page softcover A5 book starts from approximately R45 per copy for 100 copies. Request a detailed quote for your specs.' },
          { question: 'What file format do you need?', answer: 'We accept print-ready PDF files (PDF/X-1a preferred). If you don\'t have print-ready files, we offer typesetting and formatting services.' },
          { question: 'How fast is delivery to Sandton?', answer: 'Standard turnaround is 7–14 business days from proof approval. Rush printing (3–5 days) is available at an additional cost. We deliver to Sandton and throughout Gauteng.' },
          { question: 'Can you help with layout before printing?', answer: 'Yes. We offer book layout and typesetting services to prepare your manuscript for professional printing.' },
          { question: 'Can you design my book cover before printing?', answer: 'Yes. Our book cover design team creates professional print-ready covers with front, spine, and back cover integration.' },
        ]}
        relatedLinks={[
          { label: 'Book Printing Johannesburg', path: '/bookprintingjohannesburg' },
          { label: 'Book Printing Pretoria', path: '/bookprintingpretoria' },
          { label: 'A5 Book Printing', path: '/a5bookprinting' },
          { label: '6×9 Book Printing', path: '/6x9bookprinting' },
          { label: 'Hardcover Printing', path: '/hardcoverprinting' },
          { label: 'Softcover Printing', path: '/softcoverprinting' },
          { label: "Children's Book Printing", path: '/childrensbookprinting' },
          { label: 'Typesetting', path: '/typesetting' },
          { label: 'Book Cover Design', path: '/bookcoverdesign' },
          { label: 'Publishing Packages', path: '/publishingpackages' },
          { label: 'Get a Quote', path: '/getquote' },
        ]}
        ctaTitle="Get a Printing Quote in Sandton"
        ctaDescription="Tell us your book specs and we'll send you a competitive printing quote within 24 hours. Serving Sandton, Johannesburg, and all of Gauteng."
      />
      
      <InternalLinks
        links={[
          { label: 'Book Printing Johannesburg', path: '/bookprintingjohannesburg' },
          { label: 'Book Printing Pretoria', path: '/bookprintingpretoria' },
          { label: 'Book Cover Design Sandton', path: '/bookcoverdesignsandton' },
          { label: 'Typesetting Services', path: '/typesetting' },
          { label: 'Self-Publishing Packages', path: '/selfpublishingpackagesinsouthafrica' },
          { label: 'Request a Quote', path: '/getquote' },
        ]}
        light
      />
    </>
  );
}