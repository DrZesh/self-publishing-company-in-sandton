import React from 'react';
import ServicePageTemplate from '../../components/shared/ServicePageTemplate';
import PageMeta from '../../components/shared/PageMeta';

export default function BookPublishersJohannesburg() {
  return (
    <>
      <PageMeta
        title="Book Publishers Johannesburg | Creative Books SA"
        description="Looking for book publishers in Johannesburg? Creative Books SA offers publishing, editing, printing and design support for authors in Johannesburg and across South Africa."
        keywords="book publishers Johannesburg, book publisher Johannesburg, publishing company Johannesburg"
      />
      <ServicePageTemplate
        heroImage="https://media.base44.com/images/public/69fb173eeab1ba78da6eab45/5741d046a_generated_c8e794a5.png"
        subtitle="Book Publishers Johannesburg"
        title="Book Publishers in Johannesburg"
        description="Creative Books SA is a leading book publisher based in Johannesburg, Gauteng. We offer full publishing, editing, printing, and cover design services for authors in Johannesburg and across South Africa — with in-person consultations, local printing, and transparent pricing."
        features={[
          { title: 'Johannesburg Based', description: 'Our offices and print facility are in Johannesburg, Gauteng. In-person consultations and book collections available.' },
          { title: 'Full Publishing Services', description: 'Editing, cover design, typesetting, ISBN registration, printing and distribution — all handled locally in Johannesburg.' },
          { title: 'Publishing Packages', description: 'Mini, Standard and Premium publishing packages for first-time authors, business book writers, and memoir authors.' },
          { title: 'Fast Local Printing', description: 'Books printed locally in Johannesburg with 7–14 day turnaround and same-day collection for Gauteng authors.' },
          { title: 'SA Market Expertise', description: 'Deep knowledge of the South African publishing market, ISBN registration, local bookstores, and retail channels.' },
          { title: 'Author Support', description: 'Dedicated project manager and author support team based in Johannesburg to guide you through every step.' },
        ]}
        processSteps={[
          { title: 'Free Consultation', description: 'Meet us at our Johannesburg office or schedule a video call. We review your manuscript and discuss your goals.' },
          { title: 'Personalised Quote', description: 'Receive a detailed, no-obligation quote with a clear timeline and milestone plan.' },
          { title: 'Professional Production', description: 'Our Johannesburg team handles editing, design, and printing with hands-on quality control.' },
          { title: 'Deliver & Support', description: 'Collect or receive your books in Johannesburg with ongoing author support for marketing and distribution.' },
        ]}
        faqs={[
          { question: 'Where are you located in Johannesburg?', answer: 'Creative Books SA is located in Johannesburg, Gauteng, South Africa. We welcome in-person consultations by appointment at our Johannesburg office.' },
          { question: 'Do you serve authors outside Johannesburg?', answer: 'Yes. While based in Johannesburg, we serve authors across Gauteng, all nine provinces, and internationally. Most of our process is handled digitally.' },
          { question: 'Can I collect my printed books in Johannesburg?', answer: 'Yes. Authors in Gauteng can collect their printed books directly from our Johannesburg facility by appointment. We also offer courier delivery nationwide.' },
          { question: 'What publishing packages do you offer?', answer: 'We offer Mini (from R4,999), Standard (from R12,999) and Premium (from R24,999) packages. All include ISBN registration, editing, cover design, and printing.' },
          { question: 'Do you work with first-time authors in Johannesburg?', answer: 'Absolutely. Most of our clients are first-time authors. Our Johannesburg team guides you through every step of the publishing process.' },
        ]}
        relatedLinks={[
          { label: 'Book Publishers SA', path: '/bookpublisherssouthafrica' },
          { label: 'Book Publishing', path: '/bookpublishing' },
          { label: 'Book Printing JHB', path: '/bookprintingjohannesburg' },
          { label: 'Publishing Packages', path: '/publishingpackages' },
          { label: 'Book Editing', path: '/bookediting' },
          { label: 'Cover Design JHB', path: '/bookcoverdesignjohannesburg' },
          { label: 'Self Publishing JHB', path: '/selfpublishingjohannesburg' },
          { label: 'Get a Quote', path: '/getquote' },
        ]}
        ctaTitle="Publish Your Book in Johannesburg"
        ctaDescription="Contact Creative Books SA in Johannesburg for a free consultation and personalised publishing quote."
      />
    </>
  );
}