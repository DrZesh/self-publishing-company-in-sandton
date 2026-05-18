import React from 'react';
import ServicePageTemplate from '../../components/shared/ServicePageTemplate';
import PageMeta from '../../components/shared/PageMeta';
import { serviceSchema, faqSchema, breadcrumbSchema } from '../../lib/seo/schemas';

const faqs = [
  { question: 'How much does book cover design cost in South Africa?', answer: 'Book cover design in South Africa typically ranges from R3,500 to R12,000 depending on complexity, number of concepts, and revisions required. Contact us for a personalised quote.' },
  { question: 'What is included in a book cover design package?', answer: 'Our cover design packages include front cover design, spine design, back cover design, author photo placement, barcode placement, and print-ready files in the correct resolution and colour profile.' },
  { question: 'Do you design eBook covers separately?', answer: 'Yes. We design eBook covers optimised for digital platforms like Amazon KDP, Kindle, Apple Books, and Google Play, which have different dimensions to print covers.' },
  { question: 'How many revisions are included?', answer: 'Standard packages include 3 rounds of revisions. Additional revision rounds are available at an agreed rate.' },
  { question: 'Do you provide print-ready files?', answer: 'Yes. All cover designs are delivered as print-ready PDF and high-resolution JPEG/PNG files meeting your printer\'s exact specifications.' },
];

const schema = {
  '@context': 'https://schema.org',
  '@graph': [
    serviceSchema({
      name: 'Book Cover Design South Africa',
      description: 'Professional book cover design services in South Africa. Award-winning designers creating market-ready covers for print and digital publishing.',
      url: '/bookcoverdesignsouthafrica',
      areaServed: 'South Africa',
    }),
    faqSchema(faqs),
    breadcrumbSchema([
      { name: 'Home', path: '/' },
      { name: 'Book Cover Design', path: '/bookcoverdesign' },
      { name: 'Book Cover Design South Africa', path: '/bookcoverdesignsouthafrica' },
    ]),
  ],
};

export default function BookCoverDesignSouthAfrica() {
  return (
    <>
      <PageMeta
        title="Book Cover Design in South Africa | Custom Covers"
        description="Custom book cover design in South Africa — illustrated, photographic and typographic covers for print and ebook. View portfolio and get a project quote."
        keywords="book cover design South Africa, book cover designer South Africa, book cover design Johannesburg, eBook cover design South Africa, professional book covers South Africa"
        canonical="https://www.creativebooks.co.za/bookcoverdesignsouthafrica"
        schema={schema}
      />
      <ServicePageTemplate
        heroImage="https://media.base44.com/images/public/69fb173eeab1ba78da6eab45/5741d046a_generated_c8e794a5.png"
        subtitle="Book Cover Design South Africa"
        title="Book Cover Design in South Africa"
        description="Your book cover is your most powerful marketing tool. Creative Books SA designs professional, genre-appropriate book covers for South African authors that compete with the best-published titles on any shelf or digital platform — from Amazon to Takealot."
        features={[
          { title: 'Genre-Specific Cover Design', description: 'We design covers that speak your genre\'s visual language — whether fiction, non-fiction, academic, or children\'s books.' },
          { title: 'Full Cover Design (Front, Spine & Back)', description: 'Complete print-ready covers including front, spine, back, author bio, blurb, and barcode placement.' },
          { title: 'eBook Cover Design', description: 'Digital covers optimised for Amazon KDP, Kindle, Apple Books, and Google Play with the correct dimensions.' },
          { title: 'Print-Ready File Delivery', description: 'Receive your files at the correct DPI, colour profile, and bleed specifications for your specific printer.' },
          { title: 'Multiple Concepts', description: 'We present multiple distinct design concepts for you to choose from and develop further.' },
          { title: 'Unlimited Revisions Policy', description: 'We work with you until you love the final design. Your satisfaction is our standard.' },
        ]}
        processSteps={[
          { title: 'Creative Brief', description: 'Complete a detailed brief about your book genre, audience, style preferences, and any reference covers.' },
          { title: 'Concept Presentation', description: 'We present 2–3 distinct cover concepts for your review and feedback.' },
          { title: 'Revisions', description: 'Your chosen concept is refined through revision rounds until it perfectly represents your book.' },
          { title: 'Final File Delivery', description: 'Print-ready and digital files delivered in all required formats for your printer and publishing platforms.' },
        ]}
        faqs={faqs}
        relatedLinks={[
          { label: 'Book Cover Design', path: '/bookcoverdesign' },
          { label: 'Book Layout & Typesetting', path: '/typesetting' },
          { label: 'Annual Report Design', path: '/annualreportdesignsandton' },
          { label: 'eBook Formatting', path: '/ebookformatting' },
          { label: 'Book Printing JHB', path: '/bookprintingjohannesburg' },
          { label: 'Book Publishing', path: '/bookpublishing' },
          { label: 'Get a Quote', path: '/getquote' },
        ]}
        ctaTitle="Get a Book Cover Design Quote in South Africa"
        ctaDescription="Share your vision and receive professional book cover design concepts from our Johannesburg design team."
      />
    </>
  );
}