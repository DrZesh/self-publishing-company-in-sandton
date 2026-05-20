import React from 'react';
import ServicePageTemplate from '../../components/shared/ServicePageTemplate';
import PageMeta from '../../components/shared/PageMeta';
import { serviceSchema, faqSchema, breadcrumbSchema } from '../../lib/seo/schemas';

const faqs = [
  { question: 'How much does proofreading cost in South Africa?', answer: 'Proofreading rates in South Africa typically range from R30–R60 per page depending on the condition of the manuscript and turnaround required. Contact us for a personalised quote based on your word count.' },
  { question: 'What is the difference between proofreading and copy editing?', answer: 'Proofreading is the final quality check for spelling, grammar, punctuation, and formatting errors. Copy editing is more substantive — it addresses sentence structure, clarity, consistency, and style. We recommend copy editing before proofreading for best results.' },
  { question: 'How long does proofreading take in South Africa?', answer: 'A standard proofreading turnaround is 5–10 business days for manuscripts up to 80,000 words. Rush turnaround is available.' },
  { question: 'Do you proofread academic documents in South Africa?', answer: 'Yes. We offer academic proofreading and editing for theses, dissertations, research papers, and academic publications to South African university standards.' },
  { question: 'What style guides do your South African proofreaders follow?', answer: 'We work with Chicago Manual of Style, APA, MLA, and custom house styles depending on your requirements.' },
];

const schema = {
  '@context': 'https://schema.org',
  '@graph': [
    serviceSchema({
      name: 'Proofreading Services South Africa',
      description: 'Professional proofreading services in South Africa. Expert proofreaders for books, academic work, theses and business documents based in Johannesburg.',
      url: '/proofreadingservicessouthafrica',
      areaServed: 'South Africa',
    }),
    faqSchema(faqs),
    breadcrumbSchema([
      { name: 'Home', path: '/' },
      { name: 'Book Editing', path: '/bookediting' },
      { name: 'Proofreading Services South Africa', path: '/proofreadingservicessouthafrica' },
    ]),
  ],
};

export default function ProofreadingServicesSouthAfrica() {
  return (
    <>
      <PageMeta
        title="Proofreading Services South Africa"
        description="Professional manuscript proofreading services across South Africa from R0.25 per word. Final-stage error checking before your book goes to print or upload."
        keywords="proofreading services South Africa, proofreading South Africa, book proofreading South Africa, academic proofreading South Africa, proofreader Johannesburg"
        canonical="https://www.creativebooks.co.za/proofreadingservicessouthafrica"
        schema={schema}
      />
      <ServicePageTemplate
        heroImage="https://media.base44.com/images/public/69fb173eeab1ba78da6eab45/5741d046a_generated_c8e794a5.png"
        subtitle="Proofreading Services South Africa"
        title="Proofreading Services South Africa"
        description="South Africa's trusted proofreading specialists. Our expert proofreaders eliminate every spelling, grammar, punctuation, and formatting error from your book, thesis, academic paper, or business document — delivering a polished, error-free final product."
        features={[
          { title: 'Book Proofreading', description: 'Final-stage error elimination for novels, non-fiction, memoirs, and academic books before going to print.' },
          { title: 'Academic Proofreading', description: 'Thesis, dissertation, and research paper proofreading to South African university and international standards.' },
          { title: 'Business Document Proofreading', description: 'Annual reports, company profiles, proposals, and corporate communications proofread to professional standards.' },
          { title: 'Style Guide Compliance', description: 'We work with Chicago, APA, MLA, and custom house styles to ensure consistency throughout your document.' },
          { title: 'Fast Turnaround', description: 'Standard 5–10 day turnaround with rush options available for urgent projects.' },
          { title: 'South African English', description: 'Our proofreaders are experts in South African English, spelling conventions, and local style preferences.' },
        ]}
        processSteps={[
          { title: 'Submit Your Document', description: 'Send your manuscript or document in Word or PDF format along with any style guide requirements.' },
          { title: 'Quote & Turnaround', description: 'We provide a fixed quote and confirmed turnaround date based on your word count and deadline.' },
          { title: 'Expert Proofreading', description: 'Your document is proofread by a qualified South African editor with tracked changes for transparency.' },
          { title: 'Final Delivery', description: 'Receive your proofread document with all corrections clearly marked and a summary of changes.' },
        ]}
        faqs={faqs}
        relatedLinks={[
          { label: 'Book Editing', path: '/bookediting' },
          { label: 'Copy Editing', path: '/copyediting' },
          { label: 'Academic Editing', path: '/academicediting' },
          { label: 'Thesis Editing', path: '/thesisediting' },
          { label: 'Manuscript Evaluation', path: '/manuscriptevaluation' },
          { label: 'Book Cover Design', path: '/bookcoverdesign' },
          { label: 'Book Publishing', path: '/bookpublishing' },
          { label: 'Get a Quote', path: '/getquote' },
        ]}
        ctaTitle="Get a Proofreading Quote in South Africa"
        ctaDescription="Submit your word count and receive a fixed proofreading quote from our South African editorial team within 24 hours."
      />
    </>
  );
}