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
        title="Book Distribution in South Africa | An Author's Guide"
        description="A practical guide to book distribution in South Africa — bookshops, online retailers, direct sales and what authors realistically need to consider before printing."
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
                Book Distribution in South Africa: An Author's Guide
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
                Book distribution in South Africa is one of the most misunderstood parts of self-publishing. Many authors assume that once a book is printed, readers will automatically find it. In reality, distribution requires deliberate planning — and most channels require the author to take an active role.
              </motion.p>

              <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="font-heading text-2xl font-bold text-[#0F0F0F] mb-4 mt-12">
                What distribution actually means
              </motion.h2>
              <motion.p initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-[#0F0F0F]/70 leading-[1.8] font-body mb-6">
                Distribution means getting your book into places where readers can buy it — whether that is a bookshop shelf, an online retailer, a direct sale at an event, or a school or corporate order. No single channel suits every author or every book. The right approach depends on your genre, audience, price point and how much time you can commit to sales.
              </motion.p>

              <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="font-heading text-2xl font-bold text-[#0F0F0F] mb-4 mt-12">
                Exclusive Books and Bargain Books
              </motion.h2>
              <motion.p initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-[#0F0F0F]/70 leading-[1.8] font-body mb-6">
                Exclusive Books and Bargain Books are the two largest physical book retail chains in South Africa. Both work with distributors rather than dealing directly with individual self-published authors in most cases. To get stocked, your book typically needs to be represented by an approved distributor, carry a valid ISBN with barcode, be priced to allow a retail margin of 40–50%, and be returnable if unsold. Getting onto these shelves as a self-published author is possible but requires persistence and, usually, an existing audience.
              </motion.p>

              <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="font-heading text-2xl font-bold text-[#0F0F0F] mb-4 mt-12">
                Takealot and Loot
              </motion.h2>
              <motion.p initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-[#0F0F0F]/70 leading-[1.8] font-body mb-6">
                Takealot accepts third-party sellers through its marketplace, but the application process requires a registered business, a South African bank account and product listings that meet their requirements. Loot.co.za is another local online retailer that lists books and can be approached directly. Both platforms require an ISBN and a product image that meets their specifications. Neither guarantees sales — visibility still depends on your own marketing.
              </motion.p>

              <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="font-heading text-2xl font-bold text-[#0F0F0F] mb-4 mt-12">
                Amazon KDP
              </motion.h2>
              <motion.p initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-[#0F0F0F]/70 leading-[1.8] font-body mb-6">
                Amazon Kindle Direct Publishing (KDP) allows authors to publish both print-on-demand paperbacks and Kindle eBooks for global sale. You register directly at kdp.amazon.com, upload your interior PDF and cover files, set your price and territory rights, and Amazon handles fulfilment. South African authors can receive royalties to a local bank account. KDP does not require a locally printed stock — copies are printed per order in Amazon's fulfilment centres. This makes it a low-risk option for reaching international readers without upfront print costs.
              </motion.p>

              <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="font-heading text-2xl font-bold text-[#0F0F0F] mb-4 mt-12">
                Direct sales
              </motion.h2>
              <motion.p initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-[#0F0F0F]/70 leading-[1.8] font-body mb-6">
                For many self-published authors, direct sales produce the strongest margins. A speaker can sell books at the back of the room after a talk. A pastor can sell through church networks and Sunday services. A children's author can approach schools and crèches directly. A business author can bundle books into training programmes or corporate orders. These channels require no distributor and give the author full control over pricing, customer data and cash flow.
              </motion.p>

              <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="font-heading text-2xl font-bold text-[#0F0F0F] mb-4 mt-12">
                What every distribution channel requires
              </motion.h2>
              <motion.p initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-[#0F0F0F]/70 leading-[1.8] font-body mb-6">
                Regardless of which channels you pursue, a distributable book needs: a valid ISBN registered with the National Library of South Africa; a barcode on the back cover; professional printing that meets retail quality standards; and a price that allows for retail or platform margins without making your book unprofitable. Most channels also expect a high-resolution cover image and accurate product metadata (title, author, category, description).
              </motion.p>

              <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="font-heading text-2xl font-bold text-[#0F0F0F] mb-4 mt-12">
                Pricing and margins
              </motion.h2>
              <motion.p initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-[#0F0F0F]/70 leading-[1.8] font-body mb-6">
                Distribution decisions affect your profit. A book sold directly at R250 may give you a much stronger margin than the same book sold through a retailer after their discount, platform fees and logistics costs are deducted. That does not mean retail is the wrong choice — it means you need to understand your numbers before setting your print quantity and retail price.
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
                <h3 className="font-heading text-2xl font-bold text-[#0F0F0F] mb-4">Need a print-ready book?</h3>
                <p className="text-[#0F0F0F]/70 font-body mb-6">
                  We do not handle book distribution, but we print books to the quality standards required by retail channels — with correct ISBNs, barcodes and print specifications. If you need a professionally printed book that is ready for whichever distribution channel you choose, we can help with that.
                </p>
                <Link to="/getquote" className="inline-flex items-center gap-2 px-6 py-3 bg-copper text-white rounded-full font-medium hover:bg-copper/90 transition-all">
                  Get a Printing Quote <ArrowRight className="w-4 h-4" />
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