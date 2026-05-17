import React from 'react';
import { motion } from 'framer-motion';
import { Clock, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import PageMeta from '../../components/shared/PageMeta';
import CTASection from '../../components/shared/CTASection';
import InternalLinks from '../../components/shared/InternalLinks';

const faqs = [
  { q: 'Is an ISBN free in South Africa?', a: 'The National Library of South Africa states that ISBNs are assigned free of charge once an application has been processed.' },
  { q: 'Does an ISBN protect my copyright?', a: 'No. An ISBN identifies the book format. Copyright is a separate legal protection for original work.' },
  { q: 'Do I need an ISBN for an eBook?', a: 'It depends on platform and distribution needs, but separate formats are usually treated separately for ISBN purposes.' },
  { q: 'Where should I put my ISBN?', a: 'Place it on the copyright page and, for printed books, in the barcode area on the back cover.' },
];

export default function ISBNNumberSouthAfrica() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    'headline': 'ISBN Number South Africa: What Authors Need to Know Before Publishing',
    'description': 'A practical South African guide to ISBN numbers, including what an ISBN is, where to apply, whether it is free and where to place it in your book.',
    'keywords': 'ISBN number South Africa, how to get ISBN South Africa, ISBN registration South Africa, ISBN for self-published book',
  };

  return (
    <>
      <PageMeta
        title="ISBN Number South Africa | Free Registration Guide"
        description="What is an ISBN, do you need one, and how to get a free ISBN number in South Africa from the National Library. Includes barcode and placement tips."
        keywords="ISBN number South Africa, how to get ISBN South Africa, ISBN registration South Africa, ISBN for self-published book"
        canonical="https://www.creativebooks.co.za/isbnnumbersouthafrica"
        schema={schema}
      />
      
      <div className="bg-vellum min-h-screen">
        {/* Hero */}
        <section className="relative pt-32 pb-16 bg-obsidian">
          <div className="max-w-4xl mx-auto px-4 sm:px-6">
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}>
              <span className="text-copper text-xs font-body bg-copper/10 px-3 py-1 rounded-full mb-4 inline-block">Publishing Guide</span>
              <h1 className="font-heading text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6">
                How to Get an ISBN Number in South Africa
              </h1>
              <p className="flex items-center gap-2 text-white/50 text-sm font-body">
                <Clock className="w-4 h-4" /> 9 min read
              </p>
            </motion.div>
          </div>
        </section>

        {/* Content */}
        <section className="py-16 bg-vellum">
          <div className="max-w-4xl mx-auto px-4 sm:px-6">
            <div className="prose prose-lg max-w-none">
              <motion.p initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-[#0F0F0F]/70 leading-[1.8] font-body text-lg mb-8">
                An ISBN number is one of the small details that makes a book feel official, but many authors only think about it when the cover is already designed and the printer is asking for final files. That is not ideal. The ISBN should be planned before the book goes into final production.
              </motion.p>

              <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="font-heading text-2xl font-bold text-[#0F0F0F] mb-4 mt-12">
                Who issues ISBNs in South Africa
              </motion.h2>
              <motion.p initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-[#0F0F0F]/70 leading-[1.8] font-body mb-6">
                In South Africa, ISBNs are handled by the National Library of South Africa. The NLSA explains that South African authors and publishers can apply online, and that once the application has been processed, the ISBN is assigned free of charge. The NLSA also notes processing time guidance, which means authors should not leave ISBN planning until the day before printing.
              </motion.p>

              <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="font-heading text-2xl font-bold text-[#0F0F0F] mb-4 mt-12">
                ISBN vs copyright
              </motion.h2>
              <motion.p initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-[#0F0F0F]/70 leading-[1.8] font-body mb-6">
                An ISBN identifies a publication. Copyright protects original creative work. Getting an ISBN does not create copyright, and having copyright does not automatically give your book an ISBN. Authors often confuse the two because both appear in the publishing process.
              </motion.p>

              <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="font-heading text-2xl font-bold text-[#0F0F0F] mb-4 mt-12">
                Do different formats need different ISBNs
              </motion.h2>
              <motion.p initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-[#0F0F0F]/70 leading-[1.8] font-body mb-6">
                Different formats usually need separate ISBNs. A printed paperback and an eBook are different formats. A hardcover may also be treated separately. Authors should confirm their specific needs when applying, especially if they plan to publish both print and digital editions.
              </motion.p>

              <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="font-heading text-2xl font-bold text-[#0F0F0F] mb-4 mt-12">
                Where the ISBN goes
              </motion.h2>
              <motion.p initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-[#0F0F0F]/70 leading-[1.8] font-body mb-6">
                The ISBN is commonly placed on the copyright page inside the book. For printed books, it is also used with a barcode on the back cover. The barcode area must be clear and correctly positioned so it does not clash with the design.
              </motion.p>

              <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="font-heading text-2xl font-bold text-[#0F0F0F] mb-4 mt-12">
                When to apply
              </motion.h2>
              <motion.p initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-[#0F0F0F]/70 leading-[1.8] font-body mb-6">
                Apply once you have enough details about the book, such as title, author, publisher or self-publisher details, format and expected publishing timeline. You do not need to wait until the book is printed, but you should have a clear publishing plan.
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
                <h3 className="font-heading text-2xl font-bold text-[#0F0F0F] mb-4">Need help with ISBN registration?</h3>
                <p className="text-[#0F0F0F]/70 font-body mb-6">
                  Creative Books SA assists authors with ISBN registration and ensures it is placed correctly in your book files.
                </p>
                <Link to="/getquote" className="inline-flex items-center gap-2 px-6 py-3 bg-copper text-white rounded-full font-medium hover:bg-copper/90 transition-all">
                  Request Publishing Support <ArrowRight className="w-4 h-4" />
                </Link>
              </motion.div>
            </div>
          </div>
        </section>

        <InternalLinks
          links={[
            { label: 'ISBN Registration', path: '/isbnregistration' },
            { label: 'Book Publishing', path: '/bookpublishing' },
            { label: 'Book Layout & Typesetting', path: '/typesetting' },
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