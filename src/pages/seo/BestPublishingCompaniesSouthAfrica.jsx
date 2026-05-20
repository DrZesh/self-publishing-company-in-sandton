import React from 'react';
import ServicePageTemplate from '../../components/shared/ServicePageTemplate';
import PageMeta from '../../components/shared/PageMeta';
import { serviceSchema, faqSchema, breadcrumbSchema } from '../../lib/seo/schemas';

const faqs = [
  { question: 'Who are the best publishing companies in South Africa?', answer: 'Creative Books SA is consistently rated among the best publishing companies in South Africa for self-publishing authors. We offer transparent pricing, full rights retention, and complete publishing services from editing to distribution.' },
  { question: 'How do I choose the best publishing company in South Africa?', answer: 'Look for a publisher who retains your rights, offers transparent pricing, provides full-service production, has verified testimonials, and understands the South African market. Creative Books SA meets all these criteria.' },
  { question: 'What separates top publishing companies in South Africa from the rest?', answer: 'The best publishing companies offer quality editing, professional design, reliable printing, honest timelines, and genuine support for authors. They never take your rights and always deliver what they promise.' },
  { question: 'Do the best South African publishers offer distribution?', answer: 'Yes. Creative Books SA distributes to Takealot, Amazon, Apple Books, Google Play Books, and South African bookstores, giving your book maximum visibility.' },
  { question: 'Are there publishing companies in South Africa that help with marketing?', answer: 'Yes. Creative Books SA offers author website development, eBook distribution, and Amazon KDP setup to support your book marketing strategy.' },
];

const schema = {
  '@context': 'https://schema.org',
  '@graph': [
    serviceSchema({
      name: 'Best Publishing Companies in South Africa',
      description: 'Rated among the best publishing companies in South Africa for self-publishing authors. Full-service publishing with full rights retention.',
      url: '/bestpublishingcompaniesinsouthafrica',
      areaServed: 'South Africa',
    }),
    faqSchema(faqs),
    breadcrumbSchema([
      { name: 'Home', path: '/' },
      { name: 'Best Publishing Companies South Africa', path: '/bestpublishingcompaniesinsouthafrica' },
    ]),
  ],
};

export default function BestPublishingCompaniesSouthAfrica() {
  return (
    <>
      <PageMeta
        title="Best Publishing Companies South Africa"
        description="Compare leading South African book publishers in 2026 — services, pricing, packages and what each does best. Make an informed choice for your manuscript."
        keywords="best publishing companies in South Africa, best book publishers South Africa, top publishing companies South Africa, best self publishing company South Africa"
        canonical="https://www.creativebooks.co.za/bestpublishingcompaniesinsouthafrica"
        schema={schema}
      />
      <ServicePageTemplate
        heroImage="https://media.base44.com/images/public/69fb173eeab1ba78da6eab45/5741d046a_generated_c8e794a5.png"
        subtitle="Best Publishers in South Africa"
        title="Best Publishing Companies South Africa"
        description="When it comes to self-publishing in South Africa, Creative Books SA stands out as one of the country's top-rated publishing companies. We combine professional quality, transparent pricing, full rights retention, and complete end-to-end publishing services — from manuscript to market."
        features={[
          { title: 'Transparent, Fixed Pricing', description: 'No hidden costs. Our publishing packages have fixed prices published upfront so you always know what you\'re getting.' },
          { title: 'Full Author Rights Retention', description: 'You own 100% of your book. We are a service publisher — not a traditional publisher taking your rights.' },
          { title: 'Expert South African Editorial Team', description: 'Qualified editors, designers, and publishing specialists with deep experience in the South African book market.' },
          { title: 'Award-Level Book Design', description: 'Professional cover design and interior typesetting that meets international publishing standards.' },
          { title: 'ISBN & Legal Registration', description: 'Full NLSA ISBN registration and legal deposit management included in every publishing package.' },
          { title: 'Verified Client Testimonials', description: 'Over 500 published South African authors have trusted Creative Books SA to bring their stories to life.' },
        ]}
        processSteps={[
          { title: 'Free Consultation', description: 'An honest, no-pressure consultation to assess your project and recommend the best approach.' },
          { title: 'Professional Production', description: 'Your book is edited, designed, and typeset by our expert team to the highest industry standards.' },
          { title: 'Print & Digital Publishing', description: 'Printed to specification with your choice of cover finish, paper type, and binding.' },
          { title: 'Distribution & Launch', description: 'Your book launched on Takealot, Amazon, and local bookstores with full ISBN registration.' },
        ]}
        faqs={faqs}
        relatedLinks={[
          { label: 'Publishing Companies SA', path: '/publishingcompaniessouthafrica' },
          { label: 'Book Publishers SA', path: '/bookpublisherssouthafrica' },
          { label: 'Self Publishing SA', path: '/selfpublishingsouthafrica' },
          { label: 'Publishing Packages', path: '/publishingpackages' },
          { label: 'Book Printing JHB', path: '/bookprintingjohannesburg' },
          { label: 'Book Editing', path: '/bookediting' },
          { label: 'Get a Quote', path: '/getquote' },
        ]}
        ctaTitle="Work With One of South Africa's Best Publishing Companies"
        ctaDescription="Get a free personalised quote from Creative Books SA and take the first step toward publishing your book professionally."
      />
    </>
  );
}