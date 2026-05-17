import React from 'react';
import ServicePageTemplate from '../../components/shared/ServicePageTemplate';
import PageMeta from '../../components/shared/PageMeta';
import { serviceSchema, faqSchema, breadcrumbSchema } from '../../lib/seo/schemas';

const faqs = [
  { question: 'Where are Creative Books SA book publishers located in Johannesburg?', answer: 'Creative Books SA is based in Johannesburg, Gauteng, serving authors across the city and all of South Africa. We welcome in-person consultations and also work remotely with authors nationwide.' },
  { question: 'Do Johannesburg book publishers help with self-publishing?', answer: 'Yes. Creative Books SA specialises in self-publishing for Johannesburg authors — we handle editing, design, typesetting, printing, ISBN, and distribution while you retain 100% of your rights.' },
  { question: 'Can I meet with a book publisher in Johannesburg?', answer: 'Yes. We welcome in-person consultations at our Johannesburg office. Contact us to book your free publishing consultation.' },
  { question: 'How much do book publishers in Johannesburg charge?', answer: 'Publishing packages in Johannesburg start from R4,999 for a basic eBook and cover package up to R24,999+ for a complete premium publishing package including editing, design, hardcover printing, and distribution.' },
  { question: 'Do Johannesburg publishers handle Amazon KDP?', answer: 'Yes. We set up and manage Amazon KDP for Johannesburg authors, enabling global distribution and print-on-demand availability worldwide.' },
];

const schema = {
  '@context': 'https://schema.org',
  '@graph': [
    serviceSchema({
      name: 'Book Publishers Johannesburg',
      description: 'Professional book publishers in Johannesburg. Full-service self-publishing with editing, cover design, printing and distribution. Authors retain all rights.',
      url: '/bookpublishersjohannesburg',
      areaServed: 'Johannesburg, Gauteng',
    }),
    faqSchema(faqs),
    breadcrumbSchema([
      { name: 'Home', path: '/' },
      { name: 'Book Publishers South Africa', path: '/bookpublisherssouthafrica' },
      { name: 'Book Publishers Johannesburg', path: '/bookpublishersjohannesburg' },
    ]),
  ],
};

export default function BookPublishersJohannesburg() {
  return (
    <>
      <PageMeta
        title="Book Publishers in Johannesburg | Local Publishing Team"
        description="Johannesburg-based book publishers offering editing, cover design, printing and distribution. In-person consultations available. Free quote within 24 hours."
        keywords="book publishers Johannesburg, book publisher Johannesburg, self publishing Johannesburg, publishing company Johannesburg, book publishing Gauteng"
        canonical="https://www.creativebookssa.co.za/bookpublishersjohannesburg"
        schema={schema}
      />
      <ServicePageTemplate
        heroImage="https://media.base44.com/images/public/69fb173eeab1ba78da6eab45/5741d046a_generated_c8e794a5.png"
        subtitle="Book Publishers Johannesburg"
        title="Book Publishers in Johannesburg"
        description="Creative Books SA is Johannesburg's trusted self-publishing company. We offer complete book publishing services for Johannesburg and Gauteng authors — from manuscript editing and professional cover design to local printing, ISBN registration, and international distribution on Amazon and Takealot."
        features={[
          { title: 'Johannesburg-Based Publishing Team', description: 'Our full publishing team is based in Johannesburg. Meet with us in person or work with us remotely.' },
          { title: 'Fast Local Turnaround', description: 'Books printed in Johannesburg with faster turnarounds for Gauteng authors. Same-day collection available.' },
          { title: 'Full-Service Publishing', description: 'Editing, design, typesetting, printing, ISBN, and distribution — everything under one roof in Johannesburg.' },
          { title: '100% Rights Retained', description: 'Johannesburg authors keep 100% of their intellectual property and royalties with Creative Books SA.' },
          { title: 'Amazon KDP & Takealot', description: 'Your book listed on Amazon globally and Takealot for South African retail, managed by our Johannesburg team.' },
          { title: 'Expert Local Knowledge', description: 'We understand Johannesburg readers, the South African book market, and local publishing requirements.' },
        ]}
        processSteps={[
          { title: 'Free Johannesburg Consultation', description: 'Meet with our team in Johannesburg or consult online. We review your manuscript and recommend the ideal package.' },
          { title: 'Production & Design', description: 'Your book professionally edited, designed, and typeset by our Johannesburg team.' },
          { title: 'Local Printing', description: 'High-quality printing at our Johannesburg facility with your choice of format, finish, and binding.' },
          { title: 'Distribution', description: 'Your book launched locally on Takealot and internationally on Amazon with full ISBN registration.' },
        ]}
        faqs={faqs}
        relatedLinks={[
          { label: 'Book Publishers SA', path: '/bookpublisherssouthafrica' },
          { label: 'Publishing Companies SA', path: '/publishingcompaniessouthafrica' },
          { label: 'Book Printing JHB', path: '/bookprintingjohannesburg' },
          { label: 'Self Publishing SA', path: '/selfpublishingsouthafrica' },
          { label: 'Book Cover Design', path: '/bookcoverdesign' },
          { label: 'Book Editing', path: '/bookediting' },
          { label: 'Publishing Packages', path: '/publishingpackages' },
          { label: 'Get a Quote', path: '/getquote' },
        ]}
        ctaTitle="Publish Your Book With Johannesburg's Trusted Publishers"
        ctaDescription="Book a free consultation with our Johannesburg publishing team today. We're ready to bring your story to life."
      />
    </>
  );
}