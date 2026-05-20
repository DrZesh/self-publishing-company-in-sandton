import React from 'react';
import { Link } from 'react-router-dom';
import PageMeta from '../../components/shared/PageMeta';
import CTASection from '../../components/shared/CTASection';

export default function MiniPackages() {
  return (
    <div>
      <PageMeta
        title="Publishing Mini Packages"
        description="Flexible mini publishing packages — combine editing, design or printing without committing to a full bundle. Pay only for what you need."
      />

      {/* Hero */}
      <section className="relative min-h-[60vh] flex items-center pt-20 bg-[#0F0F0F]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-20 lg:py-28">
          <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
            Publishing Mini Packages
          </h1>
          <p className="text-white/60 text-lg max-w-2xl mb-8">
            Coming soon. Our most affordable publishing solution for aspiring authors.
          </p>
          <Link to="/getquote"
            className="inline-flex items-center gap-2 px-7 py-3.5 bg-copper text-white font-medium rounded-full hover:bg-copper/90 transition-all">
            Get a Free Quote
          </Link>
        </div>
      </section>

      <CTASection />
    </div>
  );
}