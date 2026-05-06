import React from 'react';
import ServicePageTemplate from '../../components/shared/ServicePageTemplate';

export default function BookEditing() {
  return (
    <ServicePageTemplate
      heroImage="https://media.base44.com/images/public/69fb173eeab1ba78da6eab45/c42df8e32_generated_ce28133a.png"
      subtitle="Book Editing South Africa"
      title="Professional Book Editing Services"
      description="Expert editing services in South Africa. Proofreading, copy editing, developmental editing, manuscript evaluation, and academic editing by experienced editors."
      features={[
        { title: 'Proofreading', description: 'Final check for spelling, grammar, punctuation, and formatting errors before print.' },
        { title: 'Copy Editing', description: 'Comprehensive editing for grammar, style, tone, clarity, and consistency throughout.' },
        { title: 'Developmental Editing', description: 'Big-picture editing focusing on structure, plot, character development, and narrative flow.' },
        { title: 'Manuscript Evaluation', description: 'Detailed assessment of your manuscript with feedback on strengths and areas for improvement.' },
        { title: 'Academic Editing', description: 'Specialised editing for theses, dissertations, and academic publications to meet institutional standards.' },
        { title: 'Language Editing', description: 'Professional language editing for non-native English speakers and multilingual manuscripts.' },
      ]}
      processSteps={[
        { title: 'Send Your Manuscript', description: 'Upload your manuscript and tell us what type of editing you need.' },
        { title: 'Assessment & Quote', description: 'We review your manuscript and provide a detailed quote with turnaround time.' },
        { title: 'Professional Editing', description: 'Your assigned editor works through your manuscript with expert precision.' },
        { title: 'Review & Revisions', description: 'Receive your edited manuscript with tracked changes and editorial notes for your review.' },
      ]}
      faqs={[
        { question: 'How much does book editing cost in South Africa?', answer: 'Editing rates depend on the type: Proofreading starts from R30/page, copy editing from R40/page, and developmental editing from R50/page. Contact us for a precise quote based on your manuscript length and needs.' },
        { question: 'What\'s the difference between proofreading and copy editing?', answer: 'Proofreading is a final check for surface errors (spelling, grammar, punctuation). Copy editing is more comprehensive, addressing style, tone, clarity, sentence structure, and consistency.' },
        { question: 'How long does editing take?', answer: 'Turnaround depends on manuscript length and editing type. Proofreading typically takes 1–2 weeks, while developmental editing may take 3–4 weeks for a full-length manuscript.' },
      ]}
      relatedLinks={[
        { label: 'Proofreading Services SA', path: '/proofreadingservicessouthafrica' },
        { label: 'Proofreading', path: '/proofreading' },
        { label: 'Copy Editing', path: '/copyediting' },
        { label: 'Manuscript Evaluation', path: '/manuscriptevaluation' },
        { label: 'Academic Editing', path: '/academicediting' },
        { label: 'Thesis Editing', path: '/thesisediting' },
        { label: 'Book Publishing', path: '/bookpublishing' },
        { label: 'Typesetting', path: '/typesetting' },
        { label: 'Editing Guide', path: '/editingguide' },
        { label: 'Get a Quote', path: '/getquote' },
      ]}
      ctaTitle="Get an Editing Quote"
      ctaDescription="Send us your manuscript for a free assessment and personalised editing quote."
    />
  );
}