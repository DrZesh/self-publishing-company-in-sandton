import React from 'react';
import ServicePageTemplate from '../../components/shared/ServicePageTemplate';
import PageMeta from '../../components/shared/PageMeta';

export default function ProofreadingServicesSouthAfrica() {
  return (
    <>
      <PageMeta
        title="Proofreading Services South Africa | Creative Books SA"
        description="Professional proofreading services in South Africa for books, manuscripts, academic writing, business documents and author projects."
        keywords="proofreading services South Africa, proofreader South Africa, book proofreading"
      />
      <ServicePageTemplate
        heroImage="https://media.base44.com/images/public/69fb173eeab1ba78da6eab45/c42df8e32_generated_ce28133a.png"
        subtitle="Proofreading Services South Africa"
        title="Proofreading Services in South Africa"
        description="Professional proofreading services in South Africa for books, manuscripts, academic writing, theses, dissertations, and business documents. Our South African proofreaders catch every error before your work goes to print or publication."
        features={[
          { title: 'Book Proofreading', description: 'Final proofreading pass for novels, non-fiction, memoirs, children\'s books, and all genres before printing.' },
          { title: 'Academic Proofreading', description: 'Proofreading for theses, dissertations, journal articles, and academic papers to meet institutional standards.' },
          { title: 'Business Proofreading', description: 'Error-free business documents, reports, proposals, and marketing materials for professional presentation.' },
          { title: 'Spelling & Grammar', description: 'Comprehensive checks for spelling, grammar, punctuation, capitalisation, and typographical errors.' },
          { title: 'Consistency Checks', description: 'Ensuring consistent style, formatting, terminology, and hyphenation throughout your document.' },
          { title: 'Fast Turnaround', description: 'Standard proofreading turnaround of 3–5 business days per 100 pages. Rush service available.' },
        ]}
        processSteps={[
          { title: 'Submit Your Document', description: 'Send your manuscript or document in Word format. Tell us about your style guide preferences if any.' },
          { title: 'Assessment & Quote', description: 'We assess your document and provide a fixed quote with a clear turnaround time.' },
          { title: 'Professional Proofreading', description: 'Your proofreader works through the document using tracked changes in Microsoft Word.' },
          { title: 'Delivery & Review', description: 'Receive the proofread document with all changes tracked. Accept or reject each change with confidence.' },
        ]}
        faqs={[
          { question: 'What is the difference between proofreading and copy editing?', answer: 'Proofreading is a final check for surface errors — spelling, grammar, punctuation and formatting. Copy editing is more comprehensive, addressing style, tone, clarity, consistency, and sentence structure. Proofreading is the last step before printing.' },
          { question: 'How much does proofreading cost in South Africa?', answer: 'Proofreading rates start from R30 per page for standard manuscripts. Academic and technical documents may be slightly higher. Contact us for a fixed quote based on your word count.' },
          { question: 'How long does proofreading take?', answer: 'Standard turnaround is 3–5 business days per 100 pages. Rush proofreading (24–48 hours) is available at an additional cost.' },
          { question: 'Do you proofread academic work?', answer: 'Yes. We proofread theses, dissertations, journal articles, and academic papers. Our academic proofreaders are familiar with APA, Harvard, and Chicago style guides.' },
          { question: 'What format should I submit my document in?', answer: 'We accept Microsoft Word (.doc, .docx) files for proofreading with tracked changes. We can also work with Google Docs.' },
          { question: 'Do I need proofreading if I already copy edited my manuscript?', answer: 'Yes. Proofreading should always be the final step. Copy editing can introduce new typos during revisions, so a separate proofread before printing is essential.' },
        ]}
        relatedLinks={[
          { label: 'Book Editing', path: '/bookediting' },
          { label: 'Copy Editing', path: '/copyediting' },
          { label: 'Manuscript Evaluation', path: '/manuscriptevaluation' },
          { label: 'Academic Editing', path: '/academicediting' },
          { label: 'Thesis Editing', path: '/thesisediting' },
          { label: 'Editing Guide', path: '/editingguide' },
          { label: 'Book Publishing', path: '/bookpublishing' },
          { label: 'Get a Quote', path: '/getquote' },
        ]}
        ctaTitle="Get a Professional Proofreading Quote"
        ctaDescription="Send us your manuscript for a free assessment and fixed proofreading quote."
      />
    </>
  );
}