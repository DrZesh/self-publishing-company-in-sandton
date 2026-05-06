import React from 'react';
import ServicePageTemplate from '../../components/shared/ServicePageTemplate';

export default function Ghostwriting() {
  return (
    <ServicePageTemplate
      heroImage="https://media.base44.com/images/public/69fb173eeab1ba78da6eab45/866979bdb_generated_1a350664.png"
      subtitle="Ghost Writers South Africa"
      title="Professional Ghostwriting Services"
      description="Expert ghostwriters in South Africa for memoirs, biographies, business books, Christian literature, and more. Your story, your name, professionally written."
      features={[
        { title: 'Memoir Ghostwriting', description: 'Capture your life story with a professional writer who brings your memories to vivid life.' },
        { title: 'Biography Writing', description: 'Professional biography writers who research, interview, and craft compelling life stories.' },
        { title: 'Business Books', description: 'Transform your expertise and insights into a published business book that establishes authority.' },
        { title: 'Christian Ghostwriting', description: 'Faithful ghostwriters who understand Christian literature and spiritual narratives.' },
        { title: 'Fiction Ghostwriting', description: 'Skilled fiction writers who can develop your concept into a compelling novel.' },
        { title: 'Complete Confidentiality', description: 'Full NDAs and confidentiality agreements. Your name, your book, your credit.' },
      ]}
      processSteps={[
        { title: 'Discovery Session', description: 'We discuss your book concept, vision, tone, and target audience in depth.' },
        { title: 'Outline & Structure', description: 'Your ghostwriter creates a detailed chapter outline for your approval.' },
        { title: 'Writing Process', description: 'Regular chapter submissions with your feedback incorporated throughout.' },
        { title: 'Review & Publish', description: 'Final manuscript review, editing, and optional publishing services.' },
      ]}
      faqs={[
        { question: 'How much does ghostwriting cost in South Africa?', answer: 'Ghostwriting rates depend on book length and complexity. Typical rates range from R30,000 to R100,000+ for a full-length book. We provide a detailed quote after the initial consultation.' },
        { question: 'Will my name be on the book?', answer: 'Yes, absolutely. As a ghostwriting client, your name appears as the author. Our ghostwriters sign comprehensive confidentiality and non-disclosure agreements.' },
        { question: 'How long does ghostwriting take?', answer: 'A typical ghostwritten book takes 3–6 months to complete, depending on length and complexity. Rush timelines are available for urgent projects.' },
      ]}
      relatedLinks={[
        { label: 'Memoir Writing', path: '/memoirwriting' },
        { label: 'Biography Writing', path: '/biographywriting' },
        { label: 'Christian Book Writing', path: '/christianbookwriting' },
        { label: 'Book Publishing', path: '/bookpublishing' },
        { label: 'Book Editing', path: '/bookediting' },
        { label: 'Get a Quote', path: '/getquote' },
      ]}
      ctaTitle="Start Your Ghostwriting Project"
      ctaDescription="Book a free consultation to discuss your book idea with our experienced ghostwriters."
    />
  );
}