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
  { question: 'Do you offer book printing in Durban?', answer: 'Yes. Creative Books SA provides professional book printing services for authors and businesses in Durban and throughout KwaZulu-Natal.' },
  { question: 'What is the minimum print run?', answer: 'Our minimum order is 50 copies for offset printing. For print-on-demand, you can order as few as 1 copy.' },
  { question: 'How much does book printing cost?', answer: 'Pricing depends on page count, size, paper type, cover type, and quantity. A 200-page softcover A5 book starts from approximately R45 per copy for 100 copies. Request a detailed quote for your specs.' },
  { question: 'How fast is delivery to Durban?', answer: 'Standard turnaround is 7–14 business days from proof approval. Rush printing (3–5 days) is available. We deliver to Durban within 2–4 business days.' },
  { question: 'Do you serve areas outside Durban?', answer: 'Yes. We deliver to Umhlanga, Pinetown, Westville, Ballito, and throughout the KwaZulu-Natal region.' },
  { question: 'Can you help with layout before printing?', answer: 'Yes. We offer book layout and typesetting services to prepare your manuscript for professional printing.' },
];

export default function BookPrintingDurban() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    'name': 'Book Printing Durban',
    'description': 'Professional book printing services in Durban, KwaZulu-Natal. High-quality printing for authors and businesses.',
    'areaServed': 'Durban, KwaZulu-Natal, South Africa',
  };

  return (
    <div>
      <PageMeta
        title="Book Printing in Durban | Creative Books SA"
        description="Looking for book printing in Durban? Creative Books SA helps South African authors print self-published books, novels, memoirs, poetry books, business books and more. Request a book printing quote today."
        keywords="book printing Durban, book printers Durban, Durban book printing, printing services Durban, book publishing Durban, KwaZulu-Natal book printing"
        canonical="https://www.creativebookssa.co.za/bookprintingdurban"
        schema={{ '@graph': [schema, faqSchema(locationFaqs)] }}
      />

      {/* 1. Hero — same as home page */}
      <HeroSlider />

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