import React from 'react';
import { motion } from 'framer-motion';
import { Clock, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import PageMeta from '../../components/shared/PageMeta';
import CTASection from '../../components/shared/CTASection';
import InternalLinks from '../../components/shared/InternalLinks';

const faqs = [
  { q: 'Is self-publishing respected?', a: 'Yes, when the book is professionally edited, designed and printed. Readers judge the final product, not only the publishing route.' },
  { q: 'How much does self-publishing cost in South Africa?', a: 'It depends on word count, editing level, page count, cover design, layout, printing quantity and whether eBook conversion is included.' },
  { q: 'Can I self-publish and still sell in bookshops?', a: 'It is possible, but not guaranteed. Bookshops consider demand, pricing, distribution and commercial fit.' },
  { q: 'Do I need an ISBN?', a: 'For a professional printed book, especially one intended for libraries, bookshops or formal distribution, an ISBN is usually recommended.' },
];

export default function SelfPublishingCompaniesSouthAfrica() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    'headline': 'Self-Publishing Companies in South Africa: How to Choose the Right Partner',
    'description': 'Compare self-publishing companies in South Africa and learn what editing, layout, cover design, ISBN support and printing should include.',
    'keywords': 'self-publishing companies in South Africa, self publishing services, self publish a book South Africa',
  };

  return (
    <>
      <PageMeta
        title="Self-Publishing Companies South Africa | Top Picks"
        description="Compare leading self-publishing companies in South Africa. Pricing, packages and services for authors ready to publish their book."
        keywords="self-publishing companies in South Africa, self publishing services, self publish a book South Africa"
        canonical="https://www.creativebooks.co.za/selfpublishingcompaniesinsouthafrica"
        schema={schema}
      />
      
      <div className="bg-vellum min-h-screen">
        {/* Hero */}
        <section className="relative pt-32 pb-16 bg-obsidian">
          <div className="max-w-4xl mx-auto px-4 sm:px-6">
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}>
              <span className="text-copper text-xs font-body bg-copper/10 px-3 py-1 rounded-full mb-4 inline-block">Publishing Guide</span>
              <h1 className="font-heading text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6">
                Self-Publishing Companies in South Africa
              </h1>
              <p className="flex items-center gap-2 text-white/50 text-sm font-body">
                <Clock className="w-4 h-4" /> 13 min read
              </p>
            </motion.div>
          </div>
        </section>

        {/* Content */}
        <section className="py-16 bg-vellum">
          <div className="max-w-4xl mx-auto px-4 sm:px-6">
            <div className="prose prose-lg max-w-none">
              <motion.p initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-[#0F0F0F]/70 leading-[1.8] font-body text-lg mb-8">
                Self-publishing has become one of the most practical routes for South African authors who want control, speed and ownership. Instead of waiting for a traditional publisher to accept a manuscript, authors can build their own publishing path using professional services such as editing, layout, cover design, ISBN guidance and printing.
              </motion.p>

              <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="font-heading text-2xl font-bold text-[#0F0F0F] mb-4 mt-12">
                What self-publishing companies do
              </motion.h2>
              <motion.p initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-[#0F0F0F]/70 leading-[1.8] font-body mb-6">
                A self-publishing company helps authors produce books independently. This may include proofreading, copy editing, typesetting, cover design, eBook conversion, printing and publishing consultation. The company does not usually own the author's story. It provides services so that the author can publish professionally.
              </motion.p>

              <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="font-heading text-2xl font-bold text-[#0F0F0F] mb-4 mt-12">
                Why self-publishing is attractive
              </motion.h2>
              <motion.p initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-[#0F0F0F]/70 leading-[1.8] font-body mb-6">
                Self-publishing gives authors more creative control. You can choose the title, cover direction, launch timeline, selling price and printing quantity. You can also decide whether to print locally, publish an eBook, use Amazon KDP or sell directly from your own website.
              </motion.p>

              <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="font-heading text-2xl font-bold text-[#0F0F0F] mb-4 mt-12">
                What should be included in a self-publishing quote
              </motion.h2>
              <motion.p initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-[#0F0F0F]/70 leading-[1.8] font-body mb-6">
                A detailed quote should show the services included, not just a final amount. Authors should check whether editing is included, how many editing drafts apply, whether layout is basic or premium, whether the cover includes front, spine and back, how many printed copies are included and whether eBook conversion is part of the package.
              </motion.p>

              <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="font-heading text-2xl font-bold text-[#0F0F0F] mb-4 mt-12">
                Ownership and royalties
              </motion.h2>
              <motion.p initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-[#0F0F0F]/70 leading-[1.8] font-body mb-6">
                Authors should ask who owns the final files, who controls online publishing accounts and who receives royalties. In a clean self-publishing arrangement, the author should not be trapped into giving away future income unnecessarily. Paying for services upfront is often clearer than surrendering long-term control without understanding the trade-off.
              </motion.p>

              <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="font-heading text-2xl font-bold text-[#0F0F0F] mb-4 mt-12">
                Red flags to avoid
              </motion.h2>
              <motion.p initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-[#0F0F0F]/70 leading-[1.8] font-body mb-6">
                Authors should be careful with any company that promises guaranteed bestseller status, instant bookstore placement or effortless riches from a first book. Publishing can create opportunity, but it is not a money-printing machine. The author still needs a clear audience, a polished product and a selling plan.
              </motion.p>

              <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="bg-white rounded-2xl p-8 mt-12 border border-[#0F0F0F]/5">
                <h3 className="font-heading text-xl font-bold text-[#0F0F0F] mb-6">Frequently Asked Questions</h3>
                <div className="space-y-6">
                  {faqs.map((faq, i) => (
                    <div key={i}>
                      <h4 className="font-heading text-sm font-bold text-[#0F0F0F] mb-2">{faq.q}</h4>
                      <p className="text-[#0F0F0F]/70 text-sm leading-[1.8] font-body">{faq.a}</p>
                    </div>
                  ))}
                </div>
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mt-12 p-8 rounded-2xl bg-gradient-to-br from-copper/10 to-copper/5 border border-copper/20">
                <h3 className="font-heading text-2xl font-bold text-[#0F0F0F] mb-4">Ready to self-publish your book?</h3>
                <p className="text-[#0F0F0F]/70 font-body mb-6">
                  Creative Books SA offers transparent self-publishing packages with editing, design, layout and printing. Get a clear quote before you commit.
                </p>
                <Link to="/getquote" className="inline-flex items-center gap-2 px-6 py-3 bg-copper text-white rounded-full font-medium hover:bg-copper/90 transition-all">
                  Request a Self-Publishing Quote <ArrowRight className="w-4 h-4" />
                </Link>
              </motion.div>
            </div>
          </div>
        </section>

        <InternalLinks
          links={[
            { label: 'Self Publishing Packages', path: '/selfpublishingpackagesinsouthafrica' },
            { label: 'Book Publishing', path: '/bookpublishing' },
            { label: 'Book Editing', path: '/bookediting' },
            { label: 'Book Cover Design', path: '/bookcoverdesign' },
            { label: 'Book Printing', path: '/bookprinting' },
            { label: 'Get a Quote', path: '/getquote' },
          ]}
          light
        />
        <CTASection />
      </div>
    </>
  );
}