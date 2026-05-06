import React from 'react';
import ServicePageTemplate from '../../components/shared/ServicePageTemplate';
import PageMeta from '../../components/shared/PageMeta';
import { serviceSchema, faqSchema, breadcrumbSchema } from '../../lib/seo/schemas';

const faqs = [
  { question: 'What services do publishing companies in South Africa offer?', answer: 'Most publishing companies in South Africa offer editing, cover design, typesetting, ISBN registration, printing, and distribution. Creative Books SA offers all these services under one roof with transparent pricing.' },
  { question: 'How much does it cost to publish a book in South Africa?', answer: 'Publishing costs range from R4,999 for a Mini Package to R24,999+ for a Premium Package including developmental editing, premium cover design, hardcover printing, Amazon KDP setup and an author website.' },
  { question: 'Do I keep the rights to my book?', answer: 'Yes. At Creative Books SA, you retain 100% of your intellectual property rights and royalties. We are a service-based publishing company, not a traditional publisher.' },
  { question: 'Do you help first-time authors in South Africa?', answer: 'Absolutely. Most of our clients are first-time authors. We guide you through every step from manuscript to printed book and distribution.' },
  { question: 'How long does publishing take in South Africa?', answer: 'Depending on the package, the full publishing process takes 4–12 weeks from manuscript submission to printed books.' },
  { question: 'Do you offer self-publishing packages in South Africa?', answer: 'Yes. Our publishing packages are self-publishing packages — you own the rights, we provide the professional production services.' },
];

const schema = {
  '@context': 'https://schema.org',
  '@graph': [
    serviceSchema({
      name: 'Book Publishing South Africa',
      description: 'Professional book publishing services in South Africa including editing, cover design, typesetting, ISBN registration, printing and distribution.',
      url: '/publishingcompaniessouthafrica',
      areaServed: 'South Africa',
    }),
    faqSchema(faqs),
    breadcrumbSchema([
      { name: 'Home', path: '/' },
      { name: 'Publishing Companies South Africa', path: '/publishingcompaniessouthafrica' },
    ]),
  ],
};

export default function PublishingCompaniesSouthAfrica() {
  return (
    <>
      <PageMeta
        title="Publishing Companies in South Africa | Book Publishers SA | Creative Books SA"
        description="Looking for trusted publishing companies in South Africa? Creative Books SA offers full-service book publishing, editing, printing & ISBN support. Authors retain 100% rights. Free quote."
        keywords="publishing companies in South Africa, book publishers South Africa, self publishing South Africa, best publishing company South Africa, book publishing services"
        canonical="https://www.creativebookssa.co.za/publishingcompaniessouthafrica"
        schema={schema}
      />
      <ServicePageTemplate
        heroImage="https://media.base44.com/images/public/69fb173eeab1ba78da6eab45/5741d046a_generated_c8e794a5.png"
        subtitle="Publishing Companies South Africa"
        title="Publishing Companies in South Africa"
        description="Creative Books SA is one of South Africa's most trusted publishing companies. We help authors across South Africa publish, print, edit, and design books professionally — with full rights retention, transparent pricing, and expert support from Johannesburg."
        features={[
          { title: 'Full-Service Book Publishing', description: 'From manuscript to printed book — editing, design, typesetting, ISBN registration, printing and distribution in one place.' },
          { title: '100% Author Rights Retained', description: 'You keep 100% of your intellectual property rights and royalties. We are a service provider, not a rights holder.' },
          { title: 'Professional Book Editing', description: 'Expert proofreading, copy editing, developmental editing and manuscript evaluation by qualified South African editors.' },
          { title: 'Cover Design & Typesetting', description: 'Award-winning cover designs and interior layout that give your book a professional, market-ready look.' },
          { title: 'ISBN Registration Included', description: 'We handle ISBN registration with the National Library of South Africa on your behalf, included in all packages.' },
          { title: 'Local & International Distribution', description: 'Get your book onto Takealot, Amazon, local bookstores, and global online retailers.' },
        ]}
        processSteps={[
          { title: 'Free Consultation', description: 'Share your manuscript and goals. We assess your project and recommend the best publishing approach.' },
          { title: 'Choose Your Package', description: 'Select from Mini, Standard, or Premium publishing packages based on your needs and budget.' },
          { title: 'Professional Production', description: 'Our team handles editing, design, typesetting, and printing with regular milestone updates.' },
          { title: 'Publish & Distribute', description: 'Your book is printed, ISBN-registered, and made available through South African and international channels.' },
        ]}
        faqs={faqs}
        relatedLinks={[
          { label: 'Book Publishers South Africa', path: '/bookpublisherssouthafrica' },
          { label: 'Book Publishing', path: '/bookpublishing' },
          { label: 'Self Publishing SA', path: '/selfpublishingsouthafrica' },
          { label: 'Publishing Packages', path: '/publishingpackages' },
          { label: 'Book Printing JHB', path: '/bookprintingjohannesburg' },
          { label: 'Book Editing', path: '/bookediting' },
          { label: 'ISBN Registration', path: '/isbnregistration' },
          { label: 'Best Publishers SA', path: '/bestpublishingcompaniesinsouthafrica' },
          { label: 'Get a Quote', path: '/getquote' },
        ]}
        ctaTitle="Work With a Trusted South African Publishing Company"
        ctaDescription="Get a free consultation and personalised publishing quote from Creative Books SA today."
      />
    </>
  );
}