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

export default function BookPrintingMidrand() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    'name': 'Book Printing Midrand',
    'description': 'Professional book printing services in Midrand, Gauteng. High-quality printing for authors and businesses.',
    'areaServed': 'Midrand, Gauteng, South Africa',
  };

  return (
    <div>
      <PageMeta
        title="Book Printing in Midrand | Fast Local Turnaround"
        description="Book printing for Midrand authors — A5, 6×9, hardcover. Cream or white paper, from 100 copies, delivered to Midrand within 1–2 business days."
        keywords="book printing Midrand, book printers Midrand, Midrand book printing, printing services Midrand, book publishing Midrand"
        canonical="https://www.creativebooks.co.za/bookprintingmidrand"
        schema={{ '@graph': [schema] }}
      />

      {/* 1. Hero */}
      <HeroSlider locationData={{ serviceType: 'Book Printing', city: 'Midrand', province: 'Gauteng' }} />

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