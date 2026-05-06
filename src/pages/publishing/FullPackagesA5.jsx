import React from 'react';
import { Link } from 'react-router-dom';
import PageMeta from '../../components/shared/PageMeta';
import CTASection from '../../components/shared/CTASection';

export default function FullPackagesA5() {
  return (
    <div>
      <PageMeta
        title="Full Publishing Package A5 | Creative Books SA"
        description="Complete A5 publishing package with professional editing, design, and printing."
      />

      {/* Hero */}
      <section className="relative min-h-[60vh] flex items-center pt-20 bg-[#0F0F0F]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-20 lg:py-28">
          <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
            Full Publishing Package (A5)
          </h1>
          <p className="text-white/60 text-lg max-w-2xl mb-8">
            Coming soon. Comprehensive publishing solution for A5 format books.
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