import React from 'react';
import ServicePageTemplate from '../../components/shared/ServicePageTemplate';
import PageMeta from '../../components/shared/PageMeta';
import { serviceSchema, faqSchema, breadcrumbSchema } from '../../lib/seo/schemas';

const faqs = [
  { question: 'How much do ghostwriters charge in South Africa?', answer: 'Ghostwriting rates in South Africa vary depending on the length and complexity of the project. A memoir or business book typically ranges from R30,000–R150,000+ depending on word count, research required, and ghostwriter experience. Contact us for a personalised quote.' },
  { question: 'Do ghostwriters in South Africa sign NDAs?', answer: 'Yes. All Creative Books SA ghostwriters sign comprehensive non-disclosure agreements. Your project remains completely confidential and you receive full authorship credit.' },
  { question: 'What types of books do South African ghostwriters write?', answer: 'Our ghostwriters specialise in memoirs, biographies, business books, Christian books, self-help, motivational books, and corporate publications.' },
  { question: 'How does the ghostwriting process work?', answer: 'We start with an in-depth interview process to capture your voice, story, and key messages. We then create an outline, draft chapters for your approval, and revise until the manuscript is exactly as you envisioned.' },
  { question: 'Do I own the rights to a ghostwritten book?', answer: 'Yes. You are the legal author and owner of all rights to the finished manuscript. The ghostwriter has no claim to the work.' },
];

const schema = {
  '@context': 'https://schema.org',
  '@graph': [
    serviceSchema({
      name: 'Ghostwriters South Africa',
      description: 'Professional ghostwriting services in South Africa. Memoirs, biographies, business books and more. Confidential, expert ghostwriters based in Johannesburg.',
      url: '/ghostwriterssouthafrica',
      areaServed: 'South Africa',
    }),
    faqSchema(faqs),
    breadcrumbSchema([
      { name: 'Home', path: '/' },
      { name: 'Ghostwriting', path: '/ghostwriting' },
      { name: 'Ghostwriters South Africa', path: '/ghostwriterssouthafrica' },
    ]),
  ],
};

export default function GhostwritersSouthAfrica() {
  return (
    <>
      <PageMeta
        title="Ghostwriters South Africa | Professional Ghostwriting Services | Creative Books SA"
        description="Professional ghostwriters in South Africa. We write your memoir, biography, business book or personal story. Confidential, expert ghostwriting in Johannesburg. Free quote today."
        keywords="ghostwriters South Africa, ghostwriting services South Africa, ghostwriter Johannesburg, memoir ghostwriter South Africa, book ghostwriter South Africa"
        canonical="https://www.creativebookssa.co.za/ghostwriterssouthafrica"
        schema={schema}
      />
      <ServicePageTemplate
        heroImage="https://media.base44.com/images/public/69fb173eeab1ba78da6eab45/5741d046a_generated_c8e794a5.png"
        subtitle="Ghostwriters South Africa"
        title="Professional Ghostwriters in South Africa"
        description="Turn your story into a professionally written book with South Africa's expert ghostwriting team. Whether it's a memoir, business book, biography, or personal story — our experienced ghostwriters in Johannesburg capture your unique voice with complete confidentiality."
        features={[
          { title: 'Memoir Ghostwriting', description: 'Your life story, told compellingly. We interview you and craft your memoir in your authentic voice.' },
          { title: 'Business Book Ghostwriting', description: 'Establish your authority with a professionally ghostwritten business or leadership book.' },
          { title: 'Biography Writing', description: 'Comprehensive biographies for executives, public figures, and individuals with important stories to tell.' },
          { title: 'Christian Book Writing', description: 'Faith-based books ghostwritten with spiritual sensitivity and literary excellence.' },
          { title: 'Complete Confidentiality', description: 'All projects are covered by strict NDA. You receive full authorship credit. Your secret is safe.' },
          { title: 'South African Voice', description: 'Ghostwriters who understand South African culture, context, and storytelling sensibilities.' },
        ]}
        processSteps={[
          { title: 'Discovery Interview', description: 'An in-depth consultation to understand your story, goals, audience, and desired tone.' },
          { title: 'Outline & Approval', description: 'We create a detailed chapter outline for your approval before any writing begins.' },
          { title: 'Drafting', description: 'Chapter-by-chapter drafts written in your voice, delivered for review and feedback.' },
          { title: 'Revisions & Final Manuscript', description: 'Revisions applied until the manuscript perfectly captures your vision and voice.' },
        ]}
        faqs={faqs}
        relatedLinks={[
          { label: 'Ghostwriting', path: '/ghostwriting' },
          { label: 'Memoir Writing', path: '/memoirwriting' },
          { label: 'Biography Writing', path: '/biographywriting' },
          { label: 'Christian Book Writing', path: '/christianbookwriting' },
          { label: 'Book Editing', path: '/bookediting' },
          { label: 'Publishing Packages', path: '/publishingpackages' },
          { label: 'Book Cover Design', path: '/bookcoverdesign' },
          { label: 'Get a Quote', path: '/getquote' },
        ]}
        ctaTitle="Tell Your Story With South Africa's Expert Ghostwriters"
        ctaDescription="Get a free consultation for your ghostwriting project. Completely confidential. You retain all rights."
      />
    </>
  );
}