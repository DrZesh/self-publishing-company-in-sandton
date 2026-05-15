import React from 'react';
import PageMeta from '../../../components/shared/PageMeta';
import { faqSchema } from '../../../lib/seo/schemas';

// Hero — same as home page
import HeroSlider from '../../../components/home/HeroSlider';

// All home page sections
import TrustStrip from '../../../components/home/TrustStrip';
import PublishingPath from '../../../components/home/PublishingPath';
import CoreServices from '../../../components/home/CoreServices';
import PublishingPackagesSection from '../../../components/home/PublishingPackagesSection';
import CalculatorCTA from '../../../components/home/CalculatorCTA';
import WhyChooseUsNew from '../../../components/home/WhyChooseUsNew';
import BookTypes from '../../../components/home/BookTypes';
import PublishingProcess from '../../../components/home/PublishingProcess';
import LocationSEO from '../../../components/home/LocationSEO';
import HomeFAQ from '../../../components/home/HomeFAQ';
import FinalCTA from '../../../components/home/FinalCTA';

const locationFaqs = [
  { question: 'Do you offer book printing in Pretoria?', answer: 'Yes. Creative Books SA provides professional book printing services for authors, businesses, and academics in Pretoria and throughout Gauteng.' },
  { question: 'What is the minimum print run?', answer: 'Our minimum order is 50 copies for offset printing. For print-on-demand, you can order as few as 1 copy.' },
  { question: 'How much does book printing cost?', answer: 'Pricing depends on page count, size, paper type, cover type, and quantity. A 200-page softcover A5 book starts from approximately R45 per copy for 100 copies. Request a detailed quote for your specs.' },
  { question: 'How fast is delivery to Pretoria?', answer: 'Standard turnaround is 7–14 business days from proof approval. Rush printing (3–5 days) is available. We deliver to Pretoria within 1–2 business days.' },
  { question: 'Do you print academic theses and dissertations?', answer: 'Yes. We specialise in academic printing for universities in Pretoria and ensure compliance with institutional formatting requirements.' },
  { question: 'Can you design my book cover before printing?', answer: 'Yes. Our book cover design team creates professional print-ready covers with front, spine, and back cover integration.' },
];

export default function BookPrintingPretoria() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    'name': 'Book Printing Pretoria',
    'description': 'Professional book printing services in Pretoria, Gauteng. High-quality printing for authors, businesses, and academics.',
    'areaServed': 'Pretoria, Gauteng, South Africa',
  };

  return (
    <div>
      <PageMeta
        title="Book Printing in Pretoria | Quality Printing & Delivery"
        description="Professional book printing for Pretoria authors. Hardcover, paperback, A5 and 6x9 with fast Gauteng delivery."
        keywords="book printing Pretoria, book printers Pretoria, Pretoria book printing, printing services Pretoria, book publishing Pretoria, Tshwane book printing"
        canonical="https://www.creativebookssa.co.za/bookprintingpretoria"
        schema={{ '@graph': [schema, faqSchema(locationFaqs)] }}
      />

      {/* 1. Hero */}
      <HeroSlider locationData={{ serviceType: 'Book Printing', city: 'Pretoria', province: 'Gauteng' }} />

      {/* 2. Trust Strip */}
      <TrustStrip />

      {/* 3. Choose Your Publishing Path */}
      <PublishingPath />

      {/* 4. Core Services */}
      <CoreServices />

      {/* 5. Publishing Packages */}
      <PublishingPackagesSection />

      {/* 6. Book Printing Calculator CTA */}
      <CalculatorCTA />

      {/* 7. Why Choose Us */}
      <WhyChooseUsNew />

      {/* 8. Book Types */}
      <BookTypes />

      {/* 9. Publishing Process */}
      <PublishingProcess />

      {/* 10. Location SEO */}
      <LocationSEO />

      {/* 11. FAQ */}
      <HomeFAQ />

      {/* 12. Final CTA */}
      <FinalCTA />
    </div>
  );
}