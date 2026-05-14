import React from 'react';
import { motion } from 'framer-motion';
import { Clock, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import PageMeta from '../../components/shared/PageMeta';
import CTASection from '../../components/shared/CTASection';
import InternalLinks from '../../components/shared/InternalLinks';

const faqs = [
  { q: 'What is the best publishing company in South Africa?', a: 'The best company depends on your goal. If you want a traditional deal, you need a publisher that accepts submissions. If you want control, speed and professional production, look for a self-publishing support company that offers editing, design, layout and printing.' },
  { q: 'Should I pay a company to publish my book?', a: 'You can pay for professional publishing services such as editing, cover design, layout and printing. The key is to understand exactly what you are buying and whether you keep control of your rights and files.' },
  { q: 'Do publishing companies market my book?', a: 'Some may offer marketing support, but authors should expect to be involved in selling and promoting their books. A publisher can help prepare the product, but demand still needs to be built.' },
  { q: 'Can I publish without a traditional publisher?', a: 'Yes. Self-publishing allows authors to produce and sell their books independently, provided the manuscript is properly edited, designed and printed.' },
];

export default function PublishingCompaniesSouthAfrica() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    'headline': 'Publishing Companies in South Africa: How to Choose the Right Team for Your Book',
    'description': 'Looking for publishing companies in South Africa? Learn how to compare publishers, avoid confusion and prepare your book professionally.',
    'keywords': 'publishing companies in South Africa, book publishing companies, publishers in South Africa, self-publishing South Africa',
  };

  return (
    <>
      <PageMeta
        title="Publishing Companies in South Africa | Author Publishing Services"
        description="Looking for publishing companies in South Africa? Learn how to compare publishers, avoid confusion and prepare your book professionally."
        keywords="publishing companies in South Africa, book publishing companies, publishers in South Africa, self-publishing South Africa"
        canonical="https://www.creativebooks.co.za/publishingcompaniesinsouthafrica"
        schema={schema}
      />
      
      <div className="bg-vellum min-h-screen">
        {/* Hero */}
        <section className="relative pt-32 pb-16 bg-obsidian">
          <div className="max-w-4xl mx-auto px-4 sm:px-6">
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}>
              <span className="text-copper text-xs font-body bg-copper/10 px-3 py-1 rounded-full mb-4 inline-block">Publishing Guide</span>
              <h1 className="font-heading text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6">
                Publishing Companies in South Africa: How to Choose the Right Team for Your Book
              </h1>
              <p className="flex items-center gap-2 text-white/50 text-sm font-body">
                <Clock className="w-4 h-4" /> 12 min read
              </p>
            </motion.div>
          </div>
        </section>

        {/* Content */}
        <section className="py-16 bg-vellum">
          <div className="max-w-4xl mx-auto px-4 sm:px-6">
            <div className="prose prose-lg max-w-none">
              <motion.p initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-[#0F0F0F]/70 leading-[1.8] font-body text-lg mb-8">
                Searching for publishing companies in South Africa usually means one thing: your book idea is no longer just sitting quietly in your laptop. It is starting to make noise. Maybe the manuscript is finished, maybe it is halfway there, or maybe you have a folder full of chapters named Final, Final 2 and Final Really Final. Either way, you are at the point where you need professional guidance.
              </motion.p>

              <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="font-heading text-2xl font-bold text-[#0F0F0F] mb-4 mt-12">
                What publishing companies actually do
              </motion.h2>
              <motion.p initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-[#0F0F0F]/70 leading-[1.8] font-body mb-6">
                A publishing company helps move a book from manuscript to finished product. In a traditional model, the publisher may acquire rights, edit the book, design it, print it, distribute it and pay the author royalties. In a self-publishing support model, the author usually pays for specific services and keeps more control over the book, the files and the selling process.
              </motion.p>
              <motion.p initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-[#0F0F0F]/70 leading-[1.8] font-body mb-6">
                This distinction matters because many first-time authors expect one quote to include everything: editing, design, printing, ISBN, marketing, bookstore placement, media interviews and maybe a red carpet at the launch. A professional quote should make clear what is included and what is not included. If it does not, ask before paying.
              </motion.p>

              <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="font-heading text-2xl font-bold text-[#0F0F0F] mb-4 mt-12">
                Traditional publishing vs assisted self-publishing
              </motion.h2>
              <motion.p initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-[#0F0F0F]/70 leading-[1.8] font-body mb-6">
                Traditional publishing can be valuable, but it is selective and slow. A manuscript may be rejected for reasons that have nothing to do with quality, such as market timing, list fit or commercial risk. Assisted self-publishing is different. It gives authors a practical route to produce a professional book without waiting years for approval.
              </motion.p>
              <motion.p initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-[#0F0F0F]/70 leading-[1.8] font-body mb-6">
                For many South African authors, assisted self-publishing is more realistic. A pastor with a devotional book, a business coach with a leadership guide, a poet with a finished collection or a parent with a children's story may need production support more than a gatekeeper. That is where services such as book editing, typesetting, cover design and book printing become important.
              </motion.p>

              <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="font-heading text-2xl font-bold text-[#0F0F0F] mb-4 mt-12">
                How to compare publishing quotes
              </motion.h2>
              <motion.p initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-[#0F0F0F]/70 leading-[1.8] font-body mb-6">
                When comparing publishing companies, do not only look at the total price. Look at what the price includes. A cheaper quote may exclude editing, printed copies, cover revisions, eBook conversion or consultation. It may look cheaper at first, then start collecting extras like a taxi meter in peak traffic.
              </motion.p>
              <motion.p initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-[#0F0F0F]/70 leading-[1.8] font-body mb-6">
                A strong quote should tell you the book size, number of pages allowed, number of printed copies, type of paper, whether the cover is front only or full cover, whether editing is included, how many revision rounds apply and what final files you receive.
              </motion.p>

              <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="font-heading text-2xl font-bold text-[#0F0F0F] mb-4 mt-12">
                What authors should own
              </motion.h2>
              <motion.p initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-[#0F0F0F]/70 leading-[1.8] font-body mb-6">
                Ownership is one of the most important issues in self-publishing. Authors should understand who owns the manuscript, the ISBN account, the final print-ready files and the online publishing account. A good publishing arrangement should not leave the author locked out of their own book.
              </motion.p>
              <motion.p initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-[#0F0F0F]/70 leading-[1.8] font-body mb-6">
                At minimum, authors should keep copies of the print-ready interior PDF, the full print cover PDF, the high-resolution front cover image and the eBook file if one was created. Losing these files years later is painful. It is like losing the keys to a house you paid to build.
              </motion.p>

              <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="font-heading text-2xl font-bold text-[#0F0F0F] mb-4 mt-12">
                Signs of a trustworthy publishing company
              </motion.h2>
              <motion.p initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-[#0F0F0F]/70 leading-[1.8] font-body mb-6">
                A trustworthy publishing company should be easy to understand before it is easy to pay. The website should explain services clearly, show what authors can expect and make it possible to ask questions without pressure. Look for evidence of real work, clear communication channels, examples of services and a quote process that asks practical production questions instead of pushing every author into one package.
              </motion.p>

              <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="font-heading text-2xl font-bold text-[#0F0F0F] mb-4 mt-12">
                Red flags authors should avoid
              </motion.h2>
              <motion.p initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-[#0F0F0F]/70 leading-[1.8] font-body mb-6">
                Authors should be careful with any company that promises guaranteed bestseller status, instant bookstore placement or effortless riches from a first book. Publishing can create opportunity, but it is not a money-printing machine in a blazer. The author still needs a clear audience, a polished product and a selling plan.
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
                <h3 className="font-heading text-2xl font-bold text-[#0F0F0F] mb-4">Ready to choose the right publishing partner?</h3>
                <p className="text-[#0F0F0F]/70 font-body mb-6">
                  Creative Books SA offers transparent publishing packages with editing, design, layout and printing. Get a clear quote that matches your book's needs.
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
            { label: 'Book Publishing', path: '/bookpublishing' },
            { label: 'Self Publishing Packages', path: '/selfpublishingpackagesinsouthafrica' },
            { label: 'Book Editing', path: '/bookediting' },
            { label: 'Book Printing', path: '/bookprinting' },
            { label: 'Book Cover Design', path: '/bookcoverdesign' },
            { label: 'Get a Quote', path: '/getquote' },
          ]}
          light
        />
        <CTASection />
      </div>
    </>
  );
}