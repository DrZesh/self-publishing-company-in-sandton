import React from 'react';
import LazySection from '../components/shared/LazySection';
import PageMeta from '../components/shared/PageMeta';
import { faqSchema, mainLocalBusinessSchema } from '../lib/seo/schemas';

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
        title="Book Publishing in South Africa from R21,000 | Creative Books SA"
        description="Self-publishing services in South Africa — editing, cover design, typesetting and printing from R21,000. Based in Sandton, working with authors nationwide."
        keywords="self publishing South Africa, book printing South Africa, book editing South Africa, book publishing Johannesburg, self publish a book, book cover design, typesetting South Africa, ebook publishing South Africa"
        canonical="https://www.creativebooks.co.za/"
        schema={{ '@graph': [mainLocalBusinessSchema(), faqSchema(homeFaqs)] }}
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