import React from 'react';
import { motion } from 'framer-motion';
import { Clock, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import PageMeta from '../../components/shared/PageMeta';
import CTASection from '../../components/shared/CTASection';
import InternalLinks from '../../components/shared/InternalLinks';

const faqs = [
  { q: 'Can I print from a Word document?', a: 'For professional book printing, a print-ready PDF is strongly recommended. Word files can shift between devices and may not preserve exact layout.' },
  { q: 'What is perfect binding?', a: 'Perfect binding is a common paperback binding method where pages are glued into a printed cover. It is widely used for novels, memoirs, poetry books and non-fiction books.' },
  { q: 'Is cream paper better than white paper?', a: 'Neither is automatically better. Cream paper is often comfortable for long reading, while white paper is useful for sharper visuals, workbooks and manuals.' },
  { q: 'How many copies should I print?', a: 'This depends on your launch plan, audience size and budget. Many self-published authors start with a controlled quantity and reprint when demand is clearer.' },
];

export default function BookPrintingJohannesburg() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    'headline': 'Book Printing in Johannesburg for Self-Published Authors',
    'description': 'Book printing in Johannesburg for authors who need print-ready files, paperback printing, cream or white paper and professional book production.',
    'keywords': 'book printing Johannesburg, book printing, book printers Johannesburg, print self-published books',
  };

  return (
    <>
      <PageMeta
        title="Book Printing Johannesburg | Print Self-Published Books"
        description="Book printing in Johannesburg for authors who need print-ready files, paperback printing, cream or white paper and professional book production."
        keywords="book printing Johannesburg, book printing, book printers Johannesburg, print self-published books"
        canonical="https://www.creativebooks.co.za/bookprintingjohannesburg"
        schema={schema}
      />
      
      <div className="bg-vellum min-h-screen">
        {/* Hero */}
        <section className="relative pt-32 pb-16 bg-obsidian">
          <div className="max-w-4xl mx-auto px-4 sm:px-6">
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}>
              <span className="text-copper text-xs font-body bg-copper/10 px-3 py-1 rounded-full mb-4 inline-block">Printing Guide</span>
              <h1 className="font-heading text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6">
                Book Printing in Johannesburg for Self-Published Authors
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
                Book printing in Johannesburg is one of the final steps in the self-publishing journey, but it should never be treated as an afterthought. By the time a book goes to print, the manuscript should be edited, the layout should be approved, the cover should include the front, spine and back, and the final files should be print-ready.
              </motion.p>

              <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="font-heading text-2xl font-bold text-[#0F0F0F] mb-4 mt-12">
                What book printers need before production
              </motion.h2>
              <motion.p initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-[#0F0F0F]/70 leading-[1.8] font-body mb-6">
                Before printing, the printer needs the final interior PDF and full cover PDF. The interior should already be typeset to the correct size, such as A5 or 6 x 9. The cover should be prepared as a full wraparound file with front cover, spine and back cover. If there is an ISBN barcode, it must be placed correctly before the file is approved.
              </motion.p>

              <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="font-heading text-2xl font-bold text-[#0F0F0F] mb-4 mt-12">
                Cream paper or white paper
              </motion.h2>
              <motion.p initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-[#0F0F0F]/70 leading-[1.8] font-body mb-6">
                Cream paper is often used for novels, memoirs, poetry and longer reading books because it gives the pages a warmer tone and can feel softer on the eyes. White paper is often better for workbooks, manuals, educational material and books with diagrams or images because it gives a cleaner and sharper look.
              </motion.p>

              <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="font-heading text-2xl font-bold text-[#0F0F0F] mb-4 mt-12">
                Black and white vs colour printing
              </motion.h2>
              <motion.p initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-[#0F0F0F]/70 leading-[1.8] font-body mb-6">
                Black and white printing is usually the best choice for novels, poetry, memoirs, Christian books, self-help books and business books without image-heavy pages. Colour printing is useful for children's books, recipe books, art books, photo books and educational books where images carry meaning.
              </motion.p>

              <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="font-heading text-2xl font-bold text-[#0F0F0F] mb-4 mt-12">
                Why print-ready layout matters
              </motion.h2>
              <motion.p initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-[#0F0F0F]/70 leading-[1.8] font-body mb-6">
                A professionally typeset book looks balanced. It has consistent margins, clean chapter openings, proper page numbers, controlled spacing and no awkward single lines sitting alone at the top or bottom of a page. These details may sound small, but readers feel them.
              </motion.p>

              <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="font-heading text-2xl font-bold text-[#0F0F0F] mb-4 mt-12">
                Mistakes that delay book printing
              </motion.h2>
              <motion.p initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-[#0F0F0F]/70 leading-[1.8] font-body mb-6">
                The most common delays include unfinished editing, missing cover files, low-resolution images, wrong page size, missing ISBN, unclear colour requirements and late changes after approval. Late changes are especially dangerous because one small text change can shift the layout, which can change the page count, which can affect the spine.
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
                <h3 className="font-heading text-2xl font-bold text-[#0F0F0F] mb-4">Ready to print your book?</h3>
                <p className="text-[#0F0F0F]/70 font-body mb-6">
                  Creative Books SA offers professional book printing in Johannesburg with competitive pricing and quality production.
                </p>
                <Link to="/getquote" className="inline-flex items-center gap-2 px-6 py-3 bg-copper text-white rounded-full font-medium hover:bg-copper/90 transition-all">
                  Request a Printing Quote <ArrowRight className="w-4 h-4" />
                </Link>
              </motion.div>
            </div>
          </div>
        </section>

        <InternalLinks
          links={[
            { label: 'Book Printing', path: '/bookprinting' },
            { label: 'Book Layout & Typesetting', path: '/typesetting' },
            { label: 'Book Cover Design', path: '/bookcoverdesign' },
            { label: 'Self Publishing Packages', path: '/selfpublishingpackagesinsouthafrica' },
            { label: 'A5 Book Printing', path: '/printing/a5' },
            { label: 'Get a Quote', path: '/getquote' },
          ]}
          light
        />
        <CTASection />
      </div>
    </>
  );
}