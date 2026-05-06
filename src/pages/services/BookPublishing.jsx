import React from 'react';
import ServicePageTemplate from '../../components/shared/ServicePageTemplate';

export default function BookPublishing() {
  return (
    <ServicePageTemplate
      heroImage="https://media.base44.com/images/public/69fb173eeab1ba78da6eab45/a56a0b3c6_generated_e004f6f0.png"
      subtitle="Book Publishing South Africa"
      title="Professional Book Publishing Services"
      description="South Africa's leading book publishing company. We transform your manuscript into a professionally published book with expert editing, stunning design, quality printing, and global distribution."
      features={[
        { title: 'Full-Service Publishing', description: 'From manuscript evaluation to distribution, we handle every aspect of the publishing process.' },
        { title: 'ISBN Registration', description: 'We register your ISBN with the National Library of South Africa and set up your barcode.' },
        { title: 'Professional Editing', description: 'Expert editors refine your manuscript for grammar, style, consistency, and readability.' },
        { title: 'Custom Cover Design', description: 'Eye-catching book covers designed by professionals to stand out on shelves and online.' },
        { title: 'Quality Printing', description: 'High-quality offset and digital printing in softcover, hardcover, and specialty formats.' },
        { title: 'Global Distribution', description: 'Get your book on Amazon, Takealot, and bookstores across South Africa and internationally.' },
      ]}
      processSteps={[
        { title: 'Free Consultation', description: 'We discuss your publishing goals, timeline, and budget to find the perfect package.' },
        { title: 'Manuscript Preparation', description: 'Professional editing, proofreading, and manuscript formatting to publishing standards.' },
        { title: 'Design & Layout', description: 'Custom cover design and interior typesetting that brings your vision to life.' },
        { title: 'Print & Produce', description: 'Premium printing at our Johannesburg facility with rigorous quality control.' },
        { title: 'Publish & Distribute', description: 'ISBN registration, online listing, and distribution to retail channels.' },
      ]}
      faqs={[
        { question: 'How much does book publishing cost in South Africa?', answer: 'Our publishing packages range from R4,999 for the Mini Package to R24,999+ for the Premium Package. The cost depends on manuscript length, editing needs, and design complexity. We offer a free quote for every project.' },
        { question: 'How long does it take to publish a book?', answer: 'The publishing process typically takes 6–12 weeks from manuscript submission to printed copies. Timeline depends on the package chosen and manuscript readiness.' },
        { question: 'Do I retain the rights to my book?', answer: 'Yes, 100%. Creative Books SA is a publishing service provider. You retain full copyright and intellectual property rights to your work.' },
        { question: 'Can you help first-time authors?', answer: 'Absolutely. Many of our authors are first-time publishers. We guide you through every step and provide the support you need.' },
      ]}
      relatedLinks={[
        { label: 'Self Publishing', path: '/selfpublishing' },
        { label: 'Publishing Packages', path: '/publishingpackages' },
        { label: 'Book Printing', path: '/bookprinting' },
        { label: 'Book Editing', path: '/bookediting' },
        { label: 'Cover Design', path: '/bookcoverdesign' },
        { label: 'eBook Publishing', path: '/ebookpublishing' },
        { label: 'ISBN Registration', path: '/isbnregistration' },
        { label: 'Get a Quote', path: '/getquote' },
      ]}
      ctaTitle="Ready to Publish Your Book?"
      ctaDescription="Get a free consultation and personalised publishing quote from South Africa's trusted publishing partner."
    />
  );
}