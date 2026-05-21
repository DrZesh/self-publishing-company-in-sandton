import React from 'react';
import LazySection from '../components/shared/LazySection';
import PageMeta from '../components/shared/PageMeta';
import { mainLocalBusinessSchema } from '../lib/seo/schemas';

// Hero — unchanged
import HeroSlider from '../components/home/HeroSlider';

// New homepage sections
import TrustStrip from '../components/home/TrustStrip';
import PublishingPath from '../components/home/PublishingPath';
import CoreServices from '../components/home/CoreServices';
import PublishingPackagesSection from '../components/home/PublishingPackagesSection';
import WhyChooseUsNew from '../components/home/WhyChooseUsNew';
import BookTypes from '../components/home/BookTypes';
import PublishingProcess from '../components/home/PublishingProcess';
import LocationSEO from '../components/home/LocationSEO';
import PortfolioPreview from '../components/home/PortfolioPreview';
import HomeFAQ from '../components/home/HomeFAQ';
import FinalCTA from '../components/home/FinalCTA';
import FeaturedBlog from '../components/home/FeaturedBlog';




export default function Home() {
  return (
    <div>
      <PageMeta
        title="Publish Your Book in South Africa: Packages From R21,000"
        description="Self-publishing services in South Africa — editing, cover design, typesetting and printing from R21,000. Based in Sandton, working with authors nationwide."
        keywords="self publishing South Africa, book printing South Africa, book editing South Africa, book publishing Johannesburg, self publish a book, book cover design, typesetting South Africa, ebook publishing South Africa"
        canonical="https://www.creativebooks.co.za/"
        schema={{ '@graph': [mainLocalBusinessSchema()] }}
      />

      {/* 1. Hero — design completely unchanged */}
      <HeroSlider />

      {/* 2. Trust Strip */}
      <TrustStrip />

      {/* 3–14. Below-fold sections — deferred until near viewport */}
      <LazySection>
        <PublishingPath />
      </LazySection>

      <LazySection>
        <CoreServices />
      </LazySection>

      <LazySection>
        <PublishingPackagesSection />
      </LazySection>

      <LazySection>
        <WhyChooseUsNew />
      </LazySection>

      <LazySection>
        <BookTypes />
      </LazySection>

      <LazySection>
        <PublishingProcess />
      </LazySection>

      <LazySection>
        <LocationSEO />
      </LazySection>

      <LazySection>
        <PortfolioPreview />
      </LazySection>

      <LazySection>
        <FeaturedBlog />
      </LazySection>

      <LazySection>
        <HomeFAQ />
      </LazySection>

      <LazySection>
        <FinalCTA />
      </LazySection>
    </div>
  );
}