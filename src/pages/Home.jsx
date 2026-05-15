import React from 'react';
import PageMeta from '../components/shared/PageMeta';
import { faqSchema, mainLocalBusinessSchema } from '../lib/seo/schemas';

// Hero — unchanged
import HeroSlider from '../components/home/HeroSlider';

// New homepage sections
import TrustStrip from '../components/home/TrustStrip';
import PublishingPath from '../components/home/PublishingPath';
import CoreServices from '../components/home/CoreServices';
import PublishingPackagesSection from '../components/home/PublishingPackagesSection';
import CalculatorCTA from '../components/home/CalculatorCTA';
import UniversalCalculatorCTA from '../components/home/UniversalCalculatorCTA';
import WhyChooseUsNew from '../components/home/WhyChooseUsNew';
import BookTypes from '../components/home/BookTypes';
import PublishingProcess from '../components/home/PublishingProcess';
import LocationSEO from '../components/home/LocationSEO';
import PortfolioPreview from '../components/home/PortfolioPreview';
import HomeFAQ from '../components/home/HomeFAQ';
import FinalCTA from '../components/home/FinalCTA';
import FeaturedBlog from '../components/home/FeaturedBlog';
import GoogleReviews from '../components/home/GoogleReviews';

const homeFaqs = [
  { question: 'Do you help first-time authors?', answer: 'Yes. Creative Books SA helps first-time authors with editing, book cover design, typesetting, printing and self-publishing support.' },
  { question: 'Do I keep ownership of my book?', answer: 'Yes. Our self-publishing support allows you to remain in control of your book, your rights and your profits. We are a service provider, not a rights holder.' },
  { question: 'Do you charge royalties?', answer: 'No. Creative Books SA works with once-off service charges for selected services, which means you do not have to deal with ongoing royalty deductions.' },
  { question: 'What is the minimum quantity for book printing?', answer: 'Our minimum quantity for book printing is 100 copies.' },
  { question: 'Can you help with ebooks?', answer: 'Yes. We assist with ebook cover design, ebook formatting and digital publishing support.' },
  { question: 'Do you work with authors outside Johannesburg?', answer: 'Yes. We assist authors across South Africa and can support authors outside South Africa depending on the service required.' },
];

export default function Home() {
  return (
    <div>
      <PageMeta
        title="Book Publishing South Africa | Creative Books SA"
        description="Premium book publishing, editing, printing & cover design in South Africa. Self-publishing packages from Johannesburg. Get a free quote today."
        keywords="self publishing South Africa, book printing South Africa, book editing South Africa, book publishing Johannesburg, self publish a book, book cover design, typesetting South Africa, ebook publishing South Africa"
        canonical="https://www.creativebookssa.co.za/"
        schema={{ '@graph': [mainLocalBusinessSchema(), faqSchema(homeFaqs)] }}
      />

      {/* 1. Hero — design completely unchanged */}
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

      {/* 6b. Universal Calculator CTA */}
      <UniversalCalculatorCTA />

      {/* 7. Why Choose Us */}
      <WhyChooseUsNew />

      {/* 8. Book Types */}
      <BookTypes />

      {/* 9. Publishing Process */}
      <PublishingProcess />

      {/* 10. Location SEO */}
      <LocationSEO />

      {/* 11. Portfolio Preview */}
      <PortfolioPreview />

      {/* 12. Featured Blog */}
      <FeaturedBlog />

      {/* 12b. Google Reviews */}
      <GoogleReviews />

      {/* 13. FAQ */}
      <HomeFAQ />

      {/* 14. Final CTA */}
      <FinalCTA />
    </div>
  );
}