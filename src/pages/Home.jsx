import React from 'react';
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
import BarcodeToolCTA from '../components/home/BarcodeToolCTA';
import CoverCalculatorCTA from '../components/home/CoverCalculatorCTA';




export default function Home() {
  return (
    <div>
      <PageMeta
        title="Self-Publishing & Book Printing in South Africa | Creative Books"
        description="Creative Books SA helps authors self-publish, edit, design & print professional books nationwide. Full packages from R21,000. Keep 100% of your rights. Get a quote."
        keywords="self publishing South Africa, book printing South Africa, book editing South Africa, book publishing South Africa, self publish a book, book cover design, typesetting South Africa, ebook publishing South Africa"
        canonical="https://creativebooks.co.za/"
        schema={{ '@graph': [mainLocalBusinessSchema()] }}
      />

      {/* 1. Hero — design completely unchanged */}
      <HeroSlider />

      {/* 2. Trust Strip */}
      <TrustStrip />

      {/* 3–14. Below-fold sections */}
      <PublishingPath />
      <CoreServices />
      <PublishingPackagesSection />
      <WhyChooseUsNew />
      <BookTypes />
      <PublishingProcess />
      <LocationSEO />
      <PortfolioPreview />
      <CoverCalculatorCTA />
      <BarcodeToolCTA />
      <FeaturedBlog />
      <HomeFAQ />
      <FinalCTA />
    </div>
  );
}