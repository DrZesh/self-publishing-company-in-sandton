import React from 'react';
import LongTailArticlePage from '../../../components/seo/LongTailArticlePage';
import { faqSchema, breadcrumbSchema, articleSchema } from '../../../lib/seo/schemas';

const faqs = [
  { question: 'How much does it cost to self-publish a book in South Africa?', answer: 'Self-publishing costs vary widely. A basic package (formatting, cover design, ISBN, and 100 printed copies) starts from approximately R10,000–R15,000. Full-service packages with editing, premium design, and 250 copies range from R25,000–R60,000.' },
  { question: 'How long does self-publishing take in South Africa?', answer: 'A complete self-publishing project typically takes 8–20 weeks depending on editing needs and revision cycles. The design and printing stage takes 4–8 weeks once the manuscript is final.' },
  { question: 'Do I need an ISBN to self-publish?', answer: 'You need an ISBN to sell your book through bookshops, libraries, and online stores. ISBN registration in South Africa is handled by the National Library of South Africa (NLSA) and typically takes 2–4 weeks.' },
  { question: 'Can I self-publish and sell on Amazon from South Africa?', answer: 'Yes. Amazon KDP is available to South African authors. You can publish a print-on-demand edition and/or an eBook on Amazon. We offer full Amazon KDP setup as part of our publishing services.' },
  { question: 'Do I retain my rights when self-publishing?', answer: 'Yes. When you self-publish, you retain 100% of your intellectual property rights, publishing rights, and royalties. You are the publisher of your own book.' },
];

export default function HowToSelfPublishABook() {
  const schema = {
    '@context': 'https://schema.org',
    '@graph': [
      articleSchema({ title: 'How to Self Publish a Book in South Africa', description: 'Step-by-step guide to self-publishing a book in South Africa.', datePublished: '2025-01-01', url: '/howtoselfpublishabook' }),
      faqSchema(faqs),
      breadcrumbSchema([{ name: 'Home', path: '/' }, { name: 'Resources', path: '/blog' }, { name: 'How to Self Publish', path: '/howtoselfpublishabook' }]),
    ],
  };

  return (
    <LongTailArticlePage
      metaTitle="How to Self-Publish a Book in South Africa | Full Guide"
      metaDescription="Step-by-step guide to self-publishing in South Africa — editing, ISBN, cover design, printing, Amazon KDP and distribution. Keep 100% of your rights."
      metaKeywords="how to self publish a book South Africa, self publishing guide, self publishing steps, self publishing cost South Africa, how to publish a book"
      canonical="https://www.creativebooks.co.za/howtoselfpublishabook"
      schema={schema}
      subtitle="Self Publishing Guide"
      h1="How to Self-Publish a Book in South Africa"
      intro="Self-publishing gives you complete control over your book — your story, your design, your timeline, and 100% of your royalties. This guide walks South African authors through every step of the process."
      sections={[
        {
          heading: 'Step 1 — Complete and Edit Your Manuscript',
          body: 'Before anything else, your manuscript must be finished and professionally edited. Even the best self-published books fail when they go to print with editing errors. Professional editing is not optional if you want your book to compete with traditionally published titles.',
          list: [
            'Proofreading — corrects spelling, grammar, and punctuation errors',
            'Copy editing — improves clarity, style, and consistency',
            'Developmental editing — assesses structure, pace, and narrative arc',
            'Manuscript evaluation — high-level feedback on strengths and weaknesses',
          ],
          cta: 'Get a professional editing quote',
        },
        {
          heading: 'Step 2 — Register Your ISBN',
          body: 'An International Standard Book Number (ISBN) is a unique identifier for your book. You need a separate ISBN for each edition (softcover, hardcover, eBook). In South Africa, ISBNs are issued free of charge by the National Library of South Africa (NLSA), but the process takes 4–6 weeks. We can manage this for you.',
          list: [
            'South African ISBNs are issued by the NLSA (nlsa.ac.za)',
            'Each format (print, eBook, audiobook) needs its own ISBN',
            'ISBNs are required for retail and library sales',
            'Barcode artwork is generated from your ISBN for the back cover',
          ],
          cta: 'Let us register your ISBN for you',
        },
        {
          heading: 'Step 3 — Design Your Cover',
          body: 'Your book cover is your most powerful marketing tool. Readers do judge books by their covers — and a poorly designed cover can sink an excellent book. Your cover must work at full size in a bookshop and at thumbnail size on Amazon. Professional cover design is essential.',
          list: [
            'Front cover, back cover, and spine must all be designed',
            'Spine width depends on page count and paper type',
            'Back cover must include blurb, author bio, and ISBN barcode',
            'Cover must be supplied as high-resolution print-ready PDF',
          ],
          cta: 'Get a professional cover design quote',
        },
        {
          heading: 'Step 4 — Typeset Your Interior',
          body: 'Typesetting (or interior layout) is the process of formatting your manuscript into a professional book design. This includes font selection, margin settings, chapter headings, page numbers, headers, and more. Word documents are never print-ready without proper typesetting.',
          list: [
            'Professional typesetting uses InDesign or Affinity Publisher',
            'Fonts must be licensed for print publication',
            'Margins must accommodate the book spine',
            'File must be exported as PDF/X-1a for printing',
          ],
          cta: 'Get a typesetting and layout quote',
        },
        {
          heading: 'Step 5 — Print Your Book',
          body: 'Once your files are print-ready, we produce your books. You can print a small proof run first (50–100 copies) to test the market, or go straight to a larger print run. We offer softcover and hardcover in A5, 6×9, and other formats.',
          table: {
            headers: ['Quantity', 'Purpose'],
            rows: [
              ['50–100 copies', 'Launch, friends, family, test market'],
              ['200–500 copies', 'Bookshop submissions, events, online sales'],
              ['500–1,000 copies', 'Distribution to retailers and libraries'],
              ['1,000+ copies', 'National distribution, media campaigns'],
            ],
          },
          cta: 'Get a printing quote',
        },
        {
          heading: 'Step 6 — Publish on Amazon KDP',
          body: 'Amazon KDP (Kindle Direct Publishing) allows you to sell a print-on-demand edition of your book internationally without holding stock. We handle your KDP setup, file upload, and price configuration as part of our digital publishing service.',
        },
        {
          heading: 'Step 7 — Distribute and Market Your Book',
          body: 'Self-publishing does not come with a distribution network — you need to create your own. Options for South African authors include:',
          list: [
            'Direct sales via your own website',
            'Amazon KDP for international online sales',
            'Local indie bookshops (consignment or wholesale)',
            'Book markets and literary festivals',
            'Library submissions through the NLSA',
            'Author events, book clubs, and speaking engagements',
            'Social media, newsletter marketing, and book influencers',
          ],
          cta: 'Learn about our publishing packages',
        },
      ]}
      faqs={faqs}
      relatedLinks={[
        { label: 'Self Publishing SA', path: '/selfpublishingsouthafrica' },
        { label: 'Publishing Packages', path: '/publishingpackages' },
        { label: 'ISBN Registration', path: '/isbnregistration' },
        { label: 'Book Cover Design', path: '/bookcoverdesign' },
        { label: 'Book Typesetting', path: '/typesetting' },
        { label: 'Book Printing SA', path: '/bookprinting' },
        { label: 'Amazon KDP', path: '/amazonkdp' },
        { label: 'Book Printing Costs', path: '/howmuchdoesbookprintingcost' },
        { label: 'Get a Quote', path: '/getquote' },
      ]}
      ctaTitle="Start Your Self-Publishing Journey"
      ctaDescription="Get a free consultation and self-publishing quote from our Johannesburg team today."
    />
  );
}