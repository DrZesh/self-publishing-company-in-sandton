import React from 'react';
import ServicePageTemplate from '../../components/shared/ServicePageTemplate';
import PageMeta from '../../components/shared/PageMeta';
import { serviceSchema, faqSchema, breadcrumbSchema } from '../../lib/seo/schemas';

const faqs = [
  { question: 'How do I self-publish a book in South Africa?', answer: 'To self-publish in South Africa, you need editing, cover design, typesetting, ISBN registration, printing, and distribution. Creative Books SA handles the entire process for you while you retain 100% of your rights and royalties.' },
  { question: 'How much does self-publishing cost in South Africa?', answer: 'Self-publishing costs in South Africa range from R4,999 for a basic package to R24,999+ for a premium package with all services included. Request a free personalised quote.' },
  { question: 'Do I need an ISBN to self-publish in South Africa?', answer: 'Yes, an ISBN is required for retail distribution and library cataloguing. The NLSA issues ISBNs free of charge. We handle this for you in all publishing packages.' },
  { question: 'Can I sell my self-published book on Amazon from South Africa?', answer: 'Yes. We set up Amazon KDP accounts and upload your book to Amazon as part of our publishing packages, enabling global distribution.' },
  { question: 'How long does self-publishing take in South Africa?', answer: 'The self-publishing process typically takes 4–12 weeks depending on editing requirements, design revisions, and print quantities.' },
  { question: 'What is the difference between self-publishing and traditional publishing?', answer: 'With self-publishing, you retain all rights and control over your book. With traditional publishing, the publisher funds production but takes rights and a large share of royalties. Most South African authors prefer self-publishing for the control and higher royalty rates.' },
];

const schema = {
  '@context': 'https://schema.org',
  '@graph': [
    serviceSchema({
      name: 'Self Publishing South Africa',
      description: 'Professional self-publishing services in South Africa. Retain 100% of your rights while getting expert editing, design, printing and distribution support.',
      url: '/selfpublishingsouthafrica',
      areaServed: 'South Africa',
    }),
    faqSchema(faqs),
    breadcrumbSchema([
      { name: 'Home', path: '/' },
      { name: 'Self Publishing South Africa', path: '/selfpublishingsouthafrica' },
    ]),
  ],
};

export default function SelfPublishingSouthAfrica() {
  return (
    <>
      <PageMeta
        title="Self-Publishing in South Africa from R21,000 | Full Guide"
        description="How self-publishing works in South Africa — ISBN, editing, cover design, printing, distribution. Full-service packages from R21,000 or pick à la carte."
        keywords="self publishing South Africa, self publish a book South Africa, self publishing services South Africa, how to self publish in South Africa"
        canonical="https://www.creativebooks.co.za/selfpublishingsouthafrica"
        schema={schema}
      />
      <ServicePageTemplate
        heroImage="https://media.base44.com/images/public/69fb173eeab1ba78da6eab45/5741d046a_generated_c8e794a5.png"
        subtitle="Self Publishing South Africa"
        title="Self-Publishing in South Africa"
        description="Self-publish your book in South Africa with professional support from Creative Books SA. Keep 100% of your rights and royalties while receiving expert editing, cover design, typesetting, ISBN registration, printing, and global distribution services."
        features={[
          { title: '100% Rights Retained', description: 'Unlike traditional publishing, you own your work completely — all rights, all royalties, always.' },
          { title: 'Professional Editing', description: 'Proofreading, copy editing and developmental editing by qualified South African editors who understand your audience.' },
          { title: 'Award-Winning Cover Design', description: 'Genre-appropriate, market-ready cover designs that compete with traditionally published books on any shelf or screen.' },
          { title: 'Interior Layout & Typesetting', description: 'Professional typesetting for print and eBook formats, formatted for both South African and international markets.' },
          { title: 'ISBN Registration', description: 'Free ISBN registration handled on your behalf with the National Library of South Africa, included in all packages.' },
          { title: 'Global Distribution', description: 'Your book distributed to Amazon, Takealot, Google Play Books, Apple Books, and South African bookstores.' },
        ]}
        processSteps={[
          { title: 'Submit Your Manuscript', description: 'Share your draft manuscript with us. We review it and provide honest feedback and a project plan.' },
          { title: 'Editing & Proofreading', description: 'Our editors refine your manuscript for grammar, flow, consistency, and market readiness.' },
          { title: 'Design & Typesetting', description: 'Your cover is designed and interior typeset to professional publishing standards for print and digital.' },
          { title: 'Print, ISBN & Distribute', description: 'We print your books, register your ISBN, and get you listed on local and international platforms.' },
        ]}
        faqs={faqs}
        relatedLinks={[
          { label: 'Publishing Companies SA', path: '/publishingcompaniessouthafrica' },
          { label: 'Book Publishers SA', path: '/bookpublisherssouthafrica' },
          { label: 'Publishing Packages', path: '/publishingpackages' },
          { label: 'Book Printing JHB', path: '/bookprintingjohannesburg' },
          { label: 'Book Cover Design', path: '/bookcoverdesign' },
          { label: 'ISBN Registration', path: '/isbnregistration' },
          { label: 'How to Publish a Book', path: '/howtopublishabook' },
          { label: 'Get a Quote', path: '/getquote' },
        ]}
        ctaTitle="Start Your Self-Publishing Journey Today"
        ctaDescription="Get a free personalised quote for your self-publishing project. Our Johannesburg team is ready to bring your book to life."
      />
    </>
  );
}