import React from 'react';
import { motion } from 'framer-motion';
import { Clock, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import PageMeta from '../../components/shared/PageMeta';
import CTASection from '../../components/shared/CTASection';
import InternalLinks from '../../components/shared/InternalLinks';

const faqs = [
  { q: 'Do book publishers in South Africa accept new authors?', a: 'Some do, but traditional publishers are selective and may have submission guidelines. Self-publishing companies are usually more accessible because authors pay for production services.' },
  { q: 'Can a self-published book look professional?', a: 'Yes. A self-published book can look professional when it has strong editing, proper typesetting, a genre-appropriate cover and quality printing.' },
  { q: 'Will a publisher get my book into stores?', a: 'Not automatically. Bookstore placement depends on demand, distribution arrangements, pricing and retailer decisions.' },
  { q: 'Do I keep my rights when self-publishing?', a: 'In most self-publishing service arrangements, the author should keep the rights. Always confirm this before signing or paying.' },
];

export default function BookPublishersSouthAfrica() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    'headline': 'Book Publishers in South Africa: What First-Time Authors Should Know',
    'description': 'A detailed guide to book publishers in South Africa, including traditional publishing, self-publishing, royalties, printing and author responsibilities.',
    'keywords': 'book publishers in South Africa, book publishers Johannesburg, publishers near me, publishing houses South Africa',
  };

  return (
    <>
      <PageMeta
        title="Book Publishers in South Africa | Publish Your Book Professionally"
        description="A detailed guide to book publishers in South Africa, including traditional publishing, self-publishing, royalties, printing and author responsibilities."
        keywords="book publishers in South Africa, book publishers Johannesburg, publishers near me, publishing houses South Africa"
        canonical="https://www.creativebooks.co.za/bookpublishersinsouthafrica"
        schema={schema}
      />
      
      <div className="bg-vellum min-h-screen">
        {/* Hero */}
        <section className="relative pt-32 pb-16 bg-obsidian">
          <div className="max-w-4xl mx-auto px-4 sm:px-6">
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}>
              <span className="text-copper text-xs font-body bg-copper/10 px-3 py-1 rounded-full mb-4 inline-block">Publishing Guide</span>
              <h1 className="font-heading text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6">
                Book Publishers in South Africa: What First-Time Authors Should Know
              </h1>
              <p className="flex items-center gap-2 text-white/50 text-sm font-body">
                <Clock className="w-4 h-4" /> 14 min read
              </p>
            </motion.div>
          </div>
        </section>

        {/* Content */}
        <section className="py-16 bg-vellum">
          <div className="max-w-4xl mx-auto px-4 sm:px-6">
            <div className="prose prose-lg max-w-none">
              <motion.p initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-[#0F0F0F]/70 leading-[1.8] font-body text-lg mb-8">
                Looking for book publishers in South Africa can feel exciting and confusing at the same time. You have written something important, and now you want the right people to help you turn it into a professional book. That is a serious step. It is also the stage where many authors discover that publishing has more moving parts than they expected.
              </motion.p>

              <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="font-heading text-2xl font-bold text-[#0F0F0F] mb-4 mt-12">
                The different types of book publishers
              </motion.h2>
              <motion.p initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-[#0F0F0F]/70 leading-[1.8] font-body mb-6">
                Traditional book publishers usually select manuscripts, invest in production and pay authors royalties from sales. Because they carry the financial risk, they are selective. They may focus on specific genres, commercial potential or educational markets. A self-publishing service provider works differently. The author pays for production services and usually keeps more control over the book.
              </motion.p>

              <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="font-heading text-2xl font-bold text-[#0F0F0F] mb-4 mt-12">
                What a professional publishing process should include
              </motion.h2>
              <motion.p initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-[#0F0F0F]/70 leading-[1.8] font-body mb-6">
                A professional process normally begins with manuscript assessment or editing. After that comes layout and typesetting, cover design, ISBN placement, print-ready PDF preparation, proof checking and printing. If the author also wants an eBook, the book must be converted into a suitable digital format.
              </motion.p>

              <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="font-heading text-2xl font-bold text-[#0F0F0F] mb-4 mt-12">
                Bookstore expectations
              </motion.h2>
              <motion.p initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-[#0F0F0F]/70 leading-[1.8] font-body mb-6">
                Many new authors believe that a publisher automatically gets the book into every major bookstore. In reality, bookstore distribution is competitive and not guaranteed. Shops consider demand, genre, pricing, discount structures, returns and whether the book already has an audience.
              </motion.p>

              <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="font-heading text-2xl font-bold text-[#0F0F0F] mb-4 mt-12">
                The honest truth about royalties
              </motion.h2>
              <motion.p initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-[#0F0F0F]/70 leading-[1.8] font-body mb-6">
                Many authors hear the word royalties and imagine automatic monthly income. In reality, royalties depend on sales, platform fees, print costs, distribution terms and pricing. In a self-publishing service model, it may be better for the author to pay for production services upfront and keep control of future earnings.
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
                <h3 className="font-heading text-2xl font-bold text-[#0F0F0F] mb-4">Comparing book publishers?</h3>
                <p className="text-[#0F0F0F]/70 font-body mb-6">
                  Creative Books SA provides transparent publishing services with clear quotes. Understand the full production process before you commit.
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
            { label: 'Book Publishing', path: '/bookpublishing' },
            { label: 'Self Publishing Packages', path: '/publishingpackages' },
            { label: 'Book Editing', path: '/bookediting' },
            { label: 'Book Printing', path: '/bookprinting' },
            { label: 'ISBN Registration', path: '/isbnregistration' },
            { label: 'Get a Quote', path: '/getquote' },
          ]}
          light
        />
        <CTASection />
      </div>
    </>
  );
}