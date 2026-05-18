import React from 'react';
import PageMeta from '../../../components/shared/PageMeta';

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
import FinalCTA from '../../../components/home/FinalCTA';

export default function BookPrintingRandburg() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    'name': 'Book Printing Randburg',
    'description': 'Professional book printing services in Randburg, Gauteng. High-quality printing for authors and businesses.',
    'areaServed': 'Randburg, Gauteng, South Africa',
  };

  return (
    <div>
      <PageMeta
        title="Book Printing in Randburg | Paperback & Hardcover"
        description="Book printing for Randburg authors — softcover, hardcover and children's formats. Fast Gauteng delivery, competitive pricing, from 100 copies."
        keywords="book printing Randburg, book printers Randburg, Randburg book printing, printing services Randburg, book publishing Randburg"
        canonical="https://www.creativebooks.co.za/bookprintingrandburg"
        schema={{ '@graph': [schema] }}
      />

      {/* 1. Hero */}
      <HeroSlider locationData={{ serviceType: 'Book Printing', city: 'Randburg', province: 'Gauteng' }} />

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

      {/* 11. Final CTA */}
      <FinalCTA />
    </div>
  );
}