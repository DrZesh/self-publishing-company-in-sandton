import React from 'react';
import ServicePageTemplate from '../../components/shared/ServicePageTemplate';
import PageMeta from '../../components/shared/PageMeta';

export default function BookPrintingJohannesburg() {
  return (
    <>
      <PageMeta
        title="Book Printing Johannesburg | Affordable Book Printing | Creative Books SA"
        description="Affordable book printing in Johannesburg for authors, businesses and publishers. Print softcover, hardcover, A5 and 6x9 books with Creative Books SA."
        keywords="book printing Johannesburg, book printing Gauteng, affordable book printing South Africa"
      />
      <ServicePageTemplate
        heroImage="https://media.base44.com/images/public/69fb173eeab1ba78da6eab45/cff7b79e1_generated_7cf45eea.png"
        subtitle="Book Printing Johannesburg"
        title="Book Printing in Johannesburg"
        description="Affordable, high-quality book printing in Johannesburg for authors, businesses, and publishers. Print softcover, hardcover, A5, 6x9, full-colour, and specialty books with fast turnaround from our Johannesburg print facility."
        features={[
          { title: 'A5 Book Printing', description: 'The most popular size for novels, poetry, and non-fiction. Softcover and hardcover A5 printing with cream or white paper.' },
          { title: '6x9 Book Printing', description: 'Standard 6x9 trade paperback printing — compatible with Amazon KDP specifications for authors planning print-on-demand.' },
          { title: 'Softcover Printing', description: 'Perfect-bound softcover books with gloss or matte lamination. Affordable and professional for most book types.' },
          { title: 'Hardcover Printing', description: 'Premium case-bound hardcover printing with dust jackets, foil stamping, and embossing options.' },
          { title: 'Cream & White Paper', description: 'Choose cream paper (ideal for novels) or bright white paper (ideal for illustrated and full-colour books) in 80gsm or 100gsm.' },
          { title: 'Fast Johannesburg Turnaround', description: 'Books printed locally in Johannesburg with standard 7–14 day turnaround. Rush printing available.' },
        ]}
        processSteps={[
          { title: 'Submit Print Files', description: 'Send your print-ready PDF or manuscript. We check files for print compatibility at no extra charge.' },
          { title: 'Choose Your Specs', description: 'Select paper type, cover finish, binding style, book size, and quantity. We help you make the right choices.' },
          { title: 'Proof Approval', description: 'Review a digital proof or order a physical proof copy from our Johannesburg facility before your full print run.' },
          { title: 'Print & Deliver', description: 'Books are printed in Johannesburg and delivered anywhere in South Africa. Same-day collection available for Gauteng.' },
        ]}
        faqs={[
          { question: 'How much does book printing cost in Johannesburg?', answer: 'A 200-page A5 softcover book costs approximately R45–R65 per copy for 100 copies. Hardcover adds R30–R50 per copy. Full-colour printing is higher. Contact us for a precise quote for your book specs.' },
          { question: 'What is the minimum print run for Johannesburg printing?', answer: 'Our minimum is 50 copies for offset printing. For print-on-demand, there is no minimum — you can print a single copy.' },
          { question: 'How long does book printing take in Johannesburg?', answer: 'Standard turnaround is 7–14 business days from proof approval. Rush printing (3–5 days) is available at an additional cost.' },
          { question: 'Can I collect my books from your Johannesburg facility?', answer: 'Yes. Authors in Gauteng are welcome to collect their books directly from our Johannesburg facility by appointment.' },
          { question: 'What file format do you need for printing?', answer: 'We accept print-ready PDF files (PDF/X-1a preferred). If you need typesetting, we offer full interior layout services.' },
          { question: 'Do you deliver outside Johannesburg?', answer: 'Yes. We deliver printed books to all provinces in South Africa via courier. Delivery takes 2–5 business days to most areas.' },
        ]}
        relatedLinks={[
          { label: 'Book Printing SA', path: '/bookprinting' },
          { label: 'A5 Book Printing', path: '/a5bookprinting' },
          { label: '6x9 Book Printing', path: '/6x9bookprinting' },
          { label: 'Hardcover Printing', path: '/hardcoverprinting' },
          { label: 'Softcover Printing', path: '/softcoverprinting' },
          { label: 'Book Publishers JHB', path: '/bookpublishersjohannesburg' },
          { label: 'Typesetting', path: '/typesetting' },
          { label: 'Get a Quote', path: '/getquote' },
        ]}
        ctaTitle="Get a Book Printing Quote in Johannesburg"
        ctaDescription="Tell us your book specs and get a competitive printing quote from our Johannesburg team within 24 hours."
      />
    </>
  );
}