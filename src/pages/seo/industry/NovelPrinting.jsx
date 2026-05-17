import React from 'react';
import ServicePageTemplate from '../../../components/shared/ServicePageTemplate';
import PageMeta from '../../../components/shared/PageMeta';
import { serviceSchema, faqSchema, breadcrumbSchema } from '../../../lib/seo/schemas';

const faqs = [
  { question: 'What is the best format for a novel in South Africa?', answer: 'A5 softcover on cream 80gsm paper is the South African standard for novels. It is cost-effective, familiar to local readers, and displays well on bookshop shelves.' },
  { question: 'How long does novel printing take?', answer: 'Standard turnaround is 7–14 business days from file approval. Allow extra time for proofreading and any edits before final file submission.' },
  { question: 'How many copies should I print for my first novel?', answer: 'Most first-time novelists in South Africa start with 100–200 copies. This is enough for your launch, bookshop submissions, and initial sales without overcommitting budget.' },
  { question: 'Should my novel be softcover or hardcover?', answer: 'Softcover (perfect binding) is standard for novels. Many authors print a small hardcover run (50–100 copies) for signed editions and launch gifts.' },
];

const schema = {
  '@context': 'https://schema.org',
  '@graph': [
    serviceSchema({ name: 'Novel Printing Johannesburg', description: 'Professional novel and fiction book printing in Johannesburg.', url: '/novelprintingjohannesburg' }),
    faqSchema(faqs),
    breadcrumbSchema([{ name: 'Home', path: '/' }, { name: 'Book Printing', path: '/bookprinting' }, { name: 'Novel Printing', path: '/novelprintingjohannesburg' }]),
  ],
};

export default function NovelPrinting() {
  return (
    <>
      <PageMeta
        title="Novel Printing South Africa | Cream Paper, Perfect Binding"
        description="Professional novel printing in SA — A5 softcover on cream paper, the South African standard. Hardcover signed editions also available. Free quote."
        keywords="novel printing Johannesburg, fiction book printing South Africa, novel publishing South Africa, print my novel Johannesburg, self publish novel South Africa"
        canonical="https://www.creativebooks.co.za/novelprintingjohannesburg"
        schema={schema}
      />
      <ServicePageTemplate
        heroImage="https://media.base44.com/images/public/69fb173eeab1ba78da6eab45/cff7b79e1_generated_7cf45eea.png"
        subtitle="Novel Printing"
        title="Novel Printing in South Africa"
        description="Print your novel with the quality it deserves. Creative Books SA provides professional novel and fiction book printing for South African authors — from debut novelists to established writers. A5 softcover, cream paper, and hardcover options."
        features={[
          { title: 'A5 Cream Paper', description: 'The South African standard — A5 softcover on cream 80gsm paper for a warm, premium literary feel.' },
          { title: 'Debut Author Packages', description: 'Self-publishing packages for first-time novelists — editing, cover design, ISBN, and printing in one affordable package.' },
          { title: 'Signed Edition Hardcovers', description: 'Small hardcover runs for launch events, bookshop signings, and collector editions.' },
          { title: 'Professional Cover Design', description: 'Eye-catching covers designed to compete on bookshop shelves and Amazon listings.' },
          { title: 'Proofreading & Editing', description: 'Professional fiction editing to ensure your novel is polished before print.' },
          { title: 'Author Distribution Advice', description: 'Guidance on submitting to SA bookshops, literary events, and setting up Amazon KDP.' },
        ]}
        processSteps={[
          { title: 'Manuscript Check', description: 'Submit your manuscript — we advise on editing needs before typesetting begins.' },
          { title: 'Design', description: 'Cover design and interior typesetting for your novel.' },
          { title: 'Proof', description: 'Review a physical proof copy before your full print run.' },
          { title: 'Print & Launch', description: 'Books ready for your launch, bookshop submissions, and direct sales.' },
        ]}
        faqs={faqs}
        relatedLinks={[
          { label: 'Self Publishing SA', path: '/selfpublishingsouthafrica' },
          { label: 'A5 Book Printing', path: '/printing/a5' },
          { label: 'Book Cover Design', path: '/bookcoverdesign' },
          { label: 'Book Editing', path: '/bookediting' },
          { label: 'Publishing Packages', path: '/publishingpackages' },
          { label: 'Get a Quote', path: '/getquote' },
        ]}
        ctaTitle="Print Your Novel"
        ctaDescription="Get a free novel printing quote from our Johannesburg team today."
      />
    </>
  );
}