import React from 'react';
import ServicePageTemplate from '../../components/shared/ServicePageTemplate';
import PageMeta from '../../components/shared/PageMeta';
import { serviceSchema, faqSchema, breadcrumbSchema } from '../../lib/seo/schemas';

const faqs = [
  { question: 'Who are the best book publishers in South Africa?', answer: 'Creative Books SA is one of South Africa\'s leading self-publishing companies, offering full-service publishing including editing, cover design, typesetting, printing, and distribution. We are based in Johannesburg and serve authors nationwide.' },
  { question: 'Do book publishers in South Africa help with editing?', answer: 'Yes. Creative Books SA provides professional proofreading, copy editing, developmental editing, and manuscript evaluation as part of our publishing packages.' },
  { question: 'How do I find a book publisher in South Africa?', answer: 'Search for publishers who offer transparent pricing, full-service support, and allow authors to retain their rights. Creative Books SA ticks all these boxes — contact us for a free consultation.' },
  { question: 'Do South African publishers handle ISBN registration?', answer: 'Yes. We handle ISBN registration with the National Library of South Africa on your behalf, included in all publishing packages.' },
  { question: 'Can South African publishers distribute my book internationally?', answer: 'Yes. We distribute to Amazon KDP, Takealot, Apple Books, Google Play Books, and global retail platforms.' },
];

const schema = {
  '@context': 'https://schema.org',
  '@graph': [
    serviceSchema({
      name: 'Book Publishers South Africa',
      description: 'Professional book publishing services from one of South Africa\'s top publishers. Editing, design, printing and distribution with full author rights retention.',
      url: '/bookpublisherssouthafrica',
      areaServed: 'South Africa',
    }),
    faqSchema(faqs),
    breadcrumbSchema([
      { name: 'Home', path: '/' },
      { name: 'Book Publishers South Africa', path: '/bookpublisherssouthafrica' },
    ]),
  ],
};

export default function BookPublishersSouthAfrica() {
  return (
    <>
      <PageMeta
        title="Book Publishers South Africa | Top Publishing Company"
        description="Leading book publishers in South Africa. Full-service publishing for fiction, non-fiction, memoirs and children's books. Free consultation."
        keywords="book publishers South Africa, book publishers in South Africa, publishing company South Africa, South African book publishers, publish a book South Africa"
        canonical="https://www.creativebookssa.co.za/bookpublisherssouthafrica"
        schema={schema}
      />
      <ServicePageTemplate
        heroImage="https://media.base44.com/images/public/69fb173eeab1ba78da6eab45/5741d046a_generated_c8e794a5.png"
        subtitle="Book Publishers South Africa"
        title="Book Publishers in South Africa"
        description="Creative Books SA is one of South Africa's most experienced book publishers, offering full-service publishing for authors nationwide. From manuscript evaluation and professional editing to cover design, typesetting, printing, and global distribution — we bring your book to life while you keep 100% of your rights."
        features={[
          { title: 'Full-Service Publishing', description: 'Editing, design, typesetting, printing, ISBN, and distribution all handled under one roof in Johannesburg.' },
          { title: '100% Author Rights', description: 'We are a service publisher — you own your book entirely, including all rights and royalties.' },
          { title: 'Expert South African Editors', description: 'Qualified editors with deep knowledge of South African language, culture, and publishing standards.' },
          { title: 'Professional Book Cover Design', description: 'Market-ready cover designs that compete on shelves and online platforms across South Africa and globally.' },
          { title: 'ISBN & Legal Registration', description: 'Full NLSA ISBN registration and legal deposit management included in all publishing packages.' },
          { title: 'SA & International Distribution', description: 'Books distributed to Takealot, Amazon, Apple Books, Google Play, and major South African retailers.' },
        ]}
        processSteps={[
          { title: 'Free Manuscript Review', description: 'Submit your manuscript and receive honest feedback, a project scope assessment, and package recommendation.' },
          { title: 'Editing & Proofreading', description: 'Professional editing to polish your manuscript to publishing standards.' },
          { title: 'Cover Design & Interior Layout', description: 'Beautiful cover art and professional interior typesetting for print and digital formats.' },
          { title: 'Print, Register & Distribute', description: 'Your book is printed, ISBN-registered, and launched across South African and international channels.' },
        ]}
        faqs={faqs}
        relatedLinks={[
          { label: 'Publishing Companies SA', path: '/publishingcompaniessouthafrica' },
          { label: 'Self Publishing SA', path: '/selfpublishingsouthafrica' },
          { label: 'Publishing Packages', path: '/publishingpackages' },
          { label: 'Book Printing JHB', path: '/bookprintingjohannesburg' },
          { label: 'Best Publishers SA', path: '/bestpublishingcompaniesinsouthafrica' },
          { label: 'Book Editing', path: '/bookediting' },
          { label: 'ISBN Registration', path: '/isbnregistration' },
          { label: 'Get a Quote', path: '/getquote' },
        ]}
        ctaTitle="Publish Your Book With South Africa's Trusted Publishers"
        ctaDescription="Get a free consultation and personalised quote from Creative Books SA — South Africa's premier book publishing company."
      />
    </>
  );
}