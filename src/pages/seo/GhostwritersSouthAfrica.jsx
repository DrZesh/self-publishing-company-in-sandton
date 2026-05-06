import React from 'react';
import ServicePageTemplate from '../../components/shared/ServicePageTemplate';
import PageMeta from '../../components/shared/PageMeta';

export default function GhostwritersSouthAfrica() {
  return (
    <>
      <PageMeta
        title="Ghost Writers South Africa | Professional Ghostwriting | Creative Books SA"
        description="Work with professional ghost writers in South Africa for memoirs, biographies, Christian books, business books and personal stories."
        keywords="ghost writers South Africa, ghostwriting South Africa, ghostwriter South Africa"
      />
      <ServicePageTemplate
        heroImage="https://media.base44.com/images/public/69fb173eeab1ba78da6eab45/866979bdb_generated_1a350664.png"
        subtitle="Ghost Writers South Africa"
        title="Ghost Writers in South Africa"
        description="Work with professional ghost writers in South Africa to tell your story. Whether it is a memoir, biography, Christian testimony, business book, or personal narrative — our ghost writers capture your voice and create a compelling, publishable manuscript."
        features={[
          { title: 'Memoir Ghostwriting', description: 'Tell your life story with authenticity and literary craft. Our memoir ghost writers conduct interviews and transform your experiences into a powerful narrative.' },
          { title: 'Biography Writing', description: 'Professional biography writing through research, interviews, and expert storytelling to create a lasting tribute.' },
          { title: 'Christian Book Writing', description: 'Faith-based ghostwriting for devotionals, testimonies, ministry books, and inspirational Christian works.' },
          { title: 'Business Book Writing', description: 'Establish your authority with a professionally written business book. Ideal for entrepreneurs, executives, and thought leaders.' },
          { title: 'Full Confidentiality', description: 'All ghostwriting services are completely confidential. The book is published in your name with you as the author.' },
          { title: 'Your Voice, Your Story', description: 'We work closely with you through interviews and reviews to ensure the writing captures your authentic voice.' },
        ]}
        processSteps={[
          { title: 'Discovery Interview', description: 'We meet with you — in person or virtually — to understand your story, voice, and publishing goals.' },
          { title: 'Outline & Agreement', description: 'We create a detailed chapter outline for your approval, then begin writing with regular milestone deliveries.' },
          { title: 'Writing & Review', description: 'Chapters are submitted for your review. We refine based on your feedback until every section is right.' },
          { title: 'Final Manuscript', description: 'The completed manuscript is delivered ready for professional editing, design, and publication.' },
        ]}
        faqs={[
          { question: 'What is ghostwriting?', answer: 'Ghostwriting is when a professional writer writes a book on your behalf — based on your ideas, experiences, and voice. The book is published in your name as the author.' },
          { question: 'How much does ghostwriting cost in South Africa?', answer: 'Ghostwriting costs depend on the length and complexity of the book. Business books and memoirs typically range from R15,000 to R60,000. Contact us for a personalised quote.' },
          { question: 'Is ghostwriting confidential?', answer: 'Absolutely. All our ghostwriting services are 100% confidential. We sign non-disclosure agreements and the book is published solely in your name.' },
          { question: 'How long does ghostwriting take?', answer: 'A full-length book (50,000–80,000 words) typically takes 3–6 months from the first interview to the completed manuscript.' },
          { question: 'What types of books can you ghostwrite?', answer: 'We ghostwrite memoirs, biographies, Christian books, business books, self-help books, and personal stories. Contact us to discuss your specific project.' },
          { question: 'Can I still be involved in writing the book?', answer: 'Yes. Most clients are involved throughout the process — providing stories, reviewing chapters, and ensuring the writing captures their authentic voice.' },
        ]}
        relatedLinks={[
          { label: 'Ghostwriting Services', path: '/ghostwriting' },
          { label: 'Memoir Writing', path: '/memoirwriting' },
          { label: 'Biography Writing', path: '/biographywriting' },
          { label: 'Christian Book Writing', path: '/christianbookwriting' },
          { label: 'Book Editing', path: '/bookediting' },
          { label: 'Book Publishing', path: '/bookpublishing' },
          { label: 'Publishing Packages', path: '/publishingpackages' },
          { label: 'Get a Quote', path: '/getquote' },
        ]}
        ctaTitle="Start Your Ghostwriting Project"
        ctaDescription="Speak to a ghostwriting consultant today to discuss your story and get a personalised quote."
      />
    </>
  );
}