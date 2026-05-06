import React from 'react';
import ServicePageTemplate from '../../components/shared/ServicePageTemplate';
import PageMeta from '../../components/shared/PageMeta';

export default function BookPublishersSouthAfrica() {
  return (
    <>
      <PageMeta
        title="Book Publishers in South Africa | Creative Books SA"
        description="Creative Books SA supports authors across South Africa with professional book publishing, printing, editing, cover design and publishing packages."
        keywords="book publishers in South Africa, book publishing South Africa, self publish South Africa"
      />
      <ServicePageTemplate
        heroImage="https://media.base44.com/images/public/69fb173eeab1ba78da6eab45/a56a0b3c6_generated_e004f6f0.png"
        subtitle="Book Publishers South Africa"
        title="Book Publishers in South Africa"
        description="Creative Books SA provides professional book publishing support to authors across South Africa. Whether you are publishing your first novel, a memoir, a business book, or a children's book — we have the expertise, tools and packages to bring your story to life."
        features={[
          { title: 'Fiction & Non-Fiction', description: 'We publish novels, memoirs, biographies, business books, children\'s books, poetry and more across all genres.' },
          { title: 'Publishing Packages', description: 'Choose from our Mini, Standard or Premium publishing packages. All include ISBN registration and cover design.' },
          { title: 'Professional Editing', description: 'Our South African editing team handles proofreading, copy editing, and developmental editing.' },
          { title: 'Cover Design', description: 'Custom book cover design for every genre — fiction, non-fiction, children\'s, Christian, and academic books.' },
          { title: 'Print & Digital', description: 'We produce high-quality printed books as well as eBook versions for Amazon Kindle, Apple Books and Kobo.' },
          { title: 'Author Support', description: 'A dedicated project manager guides you through every stage of the publishing journey.' },
        ]}
        processSteps={[
          { title: 'Submit Your Manuscript', description: 'Send us your completed manuscript for a free assessment. We will review it and recommend the best publishing approach.' },
          { title: 'Select Your Package', description: 'Choose a publishing package that suits your goals and budget. All packages include ISBN registration.' },
          { title: 'Production Begins', description: 'Editing, cover design, typesetting and printing are handled by our professional team.' },
          { title: 'Publish Your Book', description: 'Receive your printed copies and digital files. We support distribution on South African and international platforms.' },
        ]}
        faqs={[
          { question: 'Who are the best book publishers in South Africa?', answer: 'Creative Books SA is one of the most recommended publishing companies for self-publishing authors in South Africa, with 500+ published books and 15+ years of experience.' },
          { question: 'How do I choose a book publisher in South Africa?', answer: 'Look for transparent pricing, quality samples, clear timelines, author testimonials, and full rights retention. Creative Books SA ticks all these boxes.' },
          { question: 'What publishing packages do you offer?', answer: 'We offer Mini (from R4,999), Standard (from R12,999) and Premium (from R24,999) packages. Each includes editing, cover design, typesetting, ISBN, and printing.' },
          { question: 'Do you publish all types of books?', answer: 'Yes. We publish fiction, non-fiction, memoirs, biographies, children\'s books, Christian books, poetry, business books, and academic works.' },
          { question: 'Do you offer distribution?', answer: 'Yes. We help authors list their books on Takealot, Amazon, and other platforms. We also assist with distribution to local bookstores.' },
        ]}
        relatedLinks={[
          { label: 'Publishing Companies SA', path: '/publishingcompaniessouthafrica' },
          { label: 'Book Publishing', path: '/bookpublishing' },
          { label: 'Publishing Packages', path: '/publishingpackages' },
          { label: 'Self Publishing SA', path: '/selfpublishingsouthafrica' },
          { label: 'Book Printing', path: '/bookprinting' },
          { label: 'Book Editing', path: '/bookediting' },
          { label: 'Cover Design', path: '/bookcoverdesign' },
          { label: 'Get a Quote', path: '/getquote' },
        ]}
        ctaTitle="Ready to Publish Your Book in South Africa?"
        ctaDescription="Contact Creative Books SA for a free consultation and personalised publishing quote."
      />
    </>
  );
}