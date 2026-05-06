import React from 'react';
import ServicePageTemplate from '../../components/shared/ServicePageTemplate';
import PageMeta from '../../components/shared/PageMeta';

export default function SelfPublishingSouthAfrica() {
  return (
    <>
      <PageMeta
        title="Self Publishing South Africa | Creative Books SA"
        description="Self publish your book in South Africa with professional editing, design, ISBN support, printing and publishing packages from Creative Books SA."
        keywords="self publishing South Africa, self publish a book South Africa, self publishing packages"
      />
      <ServicePageTemplate
        heroImage="https://media.base44.com/images/public/69fb173eeab1ba78da6eab45/a56a0b3c6_generated_e004f6f0.png"
        subtitle="Self Publishing South Africa"
        title="Self Publishing in South Africa"
        description="Self-publishing in South Africa has never been easier. With Creative Books SA, you retain 100% of your rights and royalties while getting professional editing, cover design, typesetting, ISBN registration, printing, and distribution support."
        features={[
          { title: 'Full Rights Retention', description: 'You own your book — 100% of intellectual property rights and royalties stay with you.' },
          { title: 'Professional Editing', description: 'Access to proofreading, copy editing, and developmental editing services in South Africa.' },
          { title: 'Custom Cover Design', description: 'Professional book cover design tailored to your genre, audience, and personal vision.' },
          { title: 'ISBN Registration', description: 'We handle ISBN registration with the National Library of South Africa — included in all packages.' },
          { title: 'Print & eBook', description: 'Get quality printed copies plus eBook versions for Kindle, Apple Books, and Kobo.' },
          { title: 'Transparent Pricing', description: 'No hidden fees. Fixed package prices with milestone-based payment options.' },
        ]}
        processSteps={[
          { title: 'Submit Your Manuscript', description: 'Share your manuscript with us. We assess it and recommend the best self-publishing approach.' },
          { title: 'Choose Your Package', description: 'Select from Mini, Standard or Premium packages based on your goals and budget.' },
          { title: 'Professional Production', description: 'We handle editing, design, layout, and printing — keeping you informed at every milestone.' },
          { title: 'Publish & Distribute', description: 'Receive your printed books and digital files. We assist with South African and global distribution.' },
        ]}
        faqs={[
          { question: 'How much does self-publishing cost in South Africa?', answer: 'Our self-publishing packages start from R4,999 for the Mini Package, R12,999 for Standard, and R24,999 for Premium. Each includes ISBN registration, editing, cover design, and printing.' },
          { question: 'What is the difference between self-publishing and traditional publishing?', answer: 'In self-publishing, you own all rights and earn higher royalties. Traditional publishers accept very few manuscripts, take a share of royalties, and you lose creative control. Self-publishing with professional support gives you the best of both worlds.' },
          { question: 'How long does self-publishing take in South Africa?', answer: 'The full process — editing, design, printing, and ISBN — typically takes 4–12 weeks depending on the package and manuscript readiness.' },
          { question: 'Do I need an ISBN to self-publish?', answer: 'Yes, an ISBN is required to sell through bookstores, online retailers, and libraries. We include ISBN registration in all our packages.' },
          { question: 'Can I print just a few copies?', answer: 'Yes. Our print-on-demand service allows you to print as few as 1 copy. For offset printing, our minimum is 50 copies.' },
          { question: 'Do you help distribute self-published books?', answer: 'Yes. We assist authors with listing on Takealot, Amazon KDP, and other platforms. We also support distribution to local bookstores.' },
        ]}
        relatedLinks={[
          { label: 'Publishing Packages', path: '/publishingpackages' },
          { label: 'Book Publishing', path: '/bookpublishing' },
          { label: 'Book Printing', path: '/bookprinting' },
          { label: 'Book Editing', path: '/bookediting' },
          { label: 'ISBN Registration', path: '/isbnregistration' },
          { label: 'Cover Design', path: '/bookcoverdesign' },
          { label: 'Amazon KDP', path: '/amazonkdp' },
          { label: 'Get a Quote', path: '/getquote' },
        ]}
        ctaTitle="Start Your Self-Publishing Journey Today"
        ctaDescription="Get a free consultation and personalised self-publishing quote from Creative Books SA."
      />
    </>
  );
}