import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import PageMeta from '../../../components/shared/PageMeta';
import CTASection from '../../../components/shared/CTASection';
import InternalLinks from '../../../components/shared/InternalLinks';

export default function BookCoverDesignCapeTown() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    'name': 'Book Cover Design Cape Town',
    'description': 'Professional book cover design services in Cape Town. Custom covers for print and eBook.',
    'areaServed': 'Cape Town, Western Cape, South Africa',
  };

  return (
    <>
      <PageMeta
        title="Book Cover Design in Cape Town | Custom Covers"
        description="Custom book cover design for Cape Town authors. Cinematic, market-ready covers for self-published novels, memoirs and more."
        keywords="book cover design Cape Town, book cover designer Cape Town, book cover design Western Cape, professional book covers Cape Town"
        canonical="https://www.creativebookssa.co.za/bookcoverdesigncapetown"
        schema={schema}
      />
      
      <div className="bg-vellum min-h-screen">
        {/* Hero */}
        <section className="relative pt-32 pb-16 bg-obsidian">
          <div className="max-w-4xl mx-auto px-4 sm:px-6">
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}>
              <span className="text-copper text-xs font-body bg-copper/10 px-3 py-1 rounded-full mb-4 inline-block">Book Cover Design · Cape Town</span>
              <h1 className="font-heading text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6">
                Book Cover Design in Cape Town
              </h1>
              <p className="text-white/60 text-base font-body mb-4">Professional Book Cover Design for Authors in Cape Town and Western Cape</p>
              <p className="text-white/45 text-sm leading-relaxed font-body mb-10 max-w-2xl">
                Creative Books SA creates professional book cover designs for authors in Cape Town. Whether you need a full print cover with front, spine and back cover integration, an illustrated book cover, a stock image design or an Amazon ebook cover, our team can help you create a strong visual identity for your book.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link to="/getquote" className="inline-flex items-center gap-2 px-8 py-4 text-white text-sm font-semibold transition-all group" style={{ background: '#B8955B', boxShadow: '0 12px 32px rgba(184,149,91,0.35)', borderRadius: '8px' }}>
                  Request a Book Cover Quote <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Content */}
        <section className="py-16 bg-vellum">
          <div className="max-w-4xl mx-auto px-4 sm:px-6">
            <div className="prose prose-lg max-w-none">
              <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="font-heading text-2xl font-bold text-[#0F0F0F] mb-4 mt-8">
                Book Cover Design Services in Cape Town
              </motion.h2>
              <motion.p initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-[#0F0F0F]/70 leading-[1.8] font-body mb-6">
                Serving Cape Town and the Western Cape, Creative Books SA provides professional book cover design services to authors throughout South Africa. Our designers create custom covers that communicate your genre, attract readers and look ready for the market.
              </motion.p>

              <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mt-12 p-8 rounded-2xl bg-gradient-to-br from-copper/10 to-copper/5 border border-copper/20">
                <h3 className="font-heading text-2xl font-bold text-[#0F0F0F] mb-4">Ready to Design Your Book Cover?</h3>
                <p className="text-[#0F0F0F]/70 font-body mb-6">
                  Creative Books SA offers professional book cover design services in Cape Town and nationwide. Request a personalised quote today.
                </p>
                <Link to="/getquote" className="inline-flex items-center gap-2 px-6 py-3 bg-copper text-white rounded-full font-medium hover:bg-copper/90 transition-all">
                  Request a Quote <ArrowRight className="w-4 h-4" />
                </Link>
              </motion.div>
            </div>
          </div>
        </section>

        <InternalLinks
          links={[
            { label: 'Book Cover Design', path: '/bookcoverdesign' },
            { label: 'Book Cover Design Johannesburg', path: '/bookcoverdesignjohannesburg' },
            { label: 'Book Layout & Typesetting', path: '/typesetting' },
            { label: 'Book Printing', path: '/printing/a5' },
            { label: 'Publishing Packages', path: '/publishingpackages' },
            { label: 'Get a Quote', path: '/getquote' },
          ]}
          light
        />
        <CTASection />
      </div>
    </>
  );
}