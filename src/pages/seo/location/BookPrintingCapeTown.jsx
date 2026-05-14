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
  { question: 'Do you offer book printing in Cape Town?', answer: 'Yes. Creative Books SA provides professional book printing services for authors and businesses in Cape Town and throughout the Western Cape.' },
  { question: 'What is the minimum print run?', answer: 'Our minimum order is 50 copies for offset printing. For print-on-demand, you can order as few as 1 copy.' },
  { question: 'How much does book printing cost?', answer: 'Pricing depends on page count, size, paper type, cover type, and quantity. A 200-page softcover A5 book starts from approximately R45 per copy for 100 copies. Request a detailed quote for your specs.' },
  { question: 'How fast is delivery to Cape Town?', answer: 'Standard turnaround is 7–14 business days from proof approval. Rush printing (3–5 days) is available. We deliver to Cape Town within 3–5 business days.' },
  { question: 'Do you serve areas outside Cape Town?', answer: 'Yes. We deliver to Stellenbosch, Bellville, Paarl, Somerset West, and throughout the Western Cape region.' },
  { question: 'Can you help with layout before printing?', answer: 'Yes. We offer book layout and typesetting services to prepare your manuscript for professional printing.' },
];

export default function BookPrintingCapeTown() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    'name': 'Book Printing Cape Town',
    'description': 'Professional book printing services in Cape Town, Western Cape. High-quality printing for authors and businesses.',
    'areaServed': 'Cape Town, Western Cape, South Africa',
  };

  return (
    <div>
      <PageMeta
        title="Book Printing in Cape Town | Creative Books SA"
        description="Looking for book printing in Cape Town? Creative Books SA helps South African authors print self-published books, novels, memoirs, poetry books, business books and more. Request a book printing quote today."
        keywords="book printing Cape Town, book printers Cape Town, Cape Town book printing, printing services Cape Town, book publishing Cape Town, Western Cape book printing"
        canonical="https://www.creativebookssa.co.za/bookprintingcapetown"
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