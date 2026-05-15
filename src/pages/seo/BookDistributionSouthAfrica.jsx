import React from 'react';
import { motion } from 'framer-motion';
import { Clock, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import PageMeta from '../../components/shared/PageMeta';
import CTASection from '../../components/shared/CTASection';
import InternalLinks from '../../components/shared/InternalLinks';

const faqs = [
  { q: 'Can self-published authors get into bookstores?', a: 'Yes, but it is not automatic. Bookshops consider demand, pricing, stock management and commercial fit.' },
  { q: "What is the best way to sell a self-published book?", a: "The best method depends on the author's audience. Direct sales, events, websites, speaking engagements and online platforms can all work." },
  { q: 'Do I need marketing before distribution?', a: 'Yes. Distribution makes the book available, but marketing makes readers aware of it.' },
  { q: 'Should I print before I have a sales plan?', a: 'It is better to create a sales plan first, then decide how many copies to print.' },
];

export default function BookDistributionSouthAfrica() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    'headline': 'Book Distribution in South Africa: How Self-Published Authors Can Sell Their Books',
    'description': 'Learn how book distribution works in South Africa, including direct sales, bookstores, online platforms, launches and author marketing.',
    'keywords': 'book distribution South Africa, book distribution companies, sell self-published books, book marketing for authors',
  };

  return (
    <>
      <PageMeta
        title="Book Distribution Services South Africa | Get Your Book Out"
        description="Book distribution services in South Africa. Get your book into bookstores, online retailers and international platforms like Amazon."
        keywords="book distribution South Africa, book distribution companies, sell self-published books, book marketing for authors"
        canonical="https://www.creativebooks.co.za/bookdistributioninsouthafrica"
        schema={schema}
      />
      
      <div className="bg-vellum min-h-screen">
        {/* Hero */}
        <section className="relative pt-32 pb-16 bg-obsidian">
          <div className="max-w-4xl mx-auto px-4 sm:px-6">
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}>
              <span className="text-copper text-xs font-body bg-copper/10 px-3 py-1 rounded-full mb-4 inline-block">Marketing Guide</span>
              <h1 className="font-heading text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6">
                Book Distribution Services in South Africa
              </h1>
              <p className="flex items-center gap-2 text-white/50 text-sm font-body">
                <Clock className="w-4 h-4" /> 11 min read
              </p>
            </motion.div>
          </div>
        </section>

        {/* Content */}
        <section className="py-16 bg-vellum">
          <div className="max-w-4xl mx-auto px-4 sm:px-6">
            <div className="prose prose-lg max-w-none">
              <motion.p initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-[#0F0F0F]/70 leading-[1.8] font-body text-lg mb-8">
                Book distribution in South Africa is one of the most misunderstood parts of publishing. Many authors believe that once the book is printed, distribution will automatically happen. Unfortunately, books do not walk themselves into stores, introduce themselves to buyers and politely ask to be placed near the front counter.
              </motion.p>

              <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="font-heading text-2xl font-bold text-[#0F0F0F] mb-4 mt-12">
                What book distribution means
              </motion.h2>
              <motion.p initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-[#0F0F0F]/70 leading-[1.8] font-body mb-6">
                Distribution means getting the book into places where readers can buy it. This may include bookshops, online stores, author websites, launches, schools, churches, conferences, corporate orders, libraries, community events and direct delivery.
              </motion.p>

              <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="font-heading text-2xl font-bold text-[#0F0F0F] mb-4 mt-12">
                Bookshops and reality
              </motion.h2>
              <motion.p initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-[#0F0F0F]/70 leading-[1.8] font-body mb-6">
                Bookshops can be valuable, but placement is not guaranteed. Retailers consider whether the book has demand, whether it fits their audience, whether pricing allows a retail margin, whether stock can be supplied and whether returns can be managed.
              </motion.p>

              <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="font-heading text-2xl font-bold text-[#0F0F0F] mb-4 mt-12">
                Direct sales can be powerful
              </motion.h2>
              <motion.p initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-[#0F0F0F]/70 leading-[1.8] font-body mb-6">
                Self-published authors often earn better margins through direct sales. A speaker can sell books after a talk. A pastor can sell through church networks. A children's author can approach schools. A business author can sell at workshops or include books in training packages.
              </motion.p>

              <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="font-heading text-2xl font-bold text-[#0F0F0F] mb-4 mt-12">
                Online selling options
              </motion.h2>
              <motion.p initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-[#0F0F0F]/70 leading-[1.8] font-body mb-6">
                Authors can sell through their own websites, social media, payment links, WhatsApp orders, Amazon KDP, Takealot-style retail routes or other online platforms. Each option has pros and cons around control, fees, delivery, visibility and customer data.
              </motion.p>

              <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="font-heading text-2xl font-bold text-[#0F0F0F] mb-4 mt-12">
                Pricing and margins
              </motion.h2>
              <motion.p initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-[#0F0F0F]/70 leading-[1.8] font-body mb-6">
                Distribution decisions affect profit. A book sold directly at R250 may give the author a stronger margin than a book sold through a retailer after discounts, fees and logistics. That does not mean retail is bad. It means authors must understand the numbers.
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
                <h3 className="font-heading text-2xl font-bold text-[#0F0F0F] mb-4">Ready to sell your book?</h3>
                <p className="text-[#0F0F0F]/70 font-body mb-6">
                  Creative Books SA helps authors prepare professional books ready for distribution and sales. Start with a quality product.
                </p>
                <Link to="/getquote" className="inline-flex items-center gap-2 px-6 py-3 bg-copper text-white rounded-full font-medium hover:bg-copper/90 transition-all">
                  Request a Publishing Quote <ArrowRight className="w-4 h-4" />
                </Link>
              </motion.div>
            </div>
          </div>
        </section>

        <InternalLinks
          links={[
            { label: 'Book Printing', path: '/bookprinting' },
            { label: 'Self Publishing Packages', path: '/selfpublishingpackagesinsouthafrica' },
            { label: 'Author Websites', path: '/authorwebsites' },
            { label: 'Book Marketing', path: '/blog' },
            { label: 'Book Publishing', path: '/bookpublishing' },
            { label: 'Get a Quote', path: '/getquote' },
          ]}
          light
        />
        <CTASection />
      </div>
    </>
  );
}