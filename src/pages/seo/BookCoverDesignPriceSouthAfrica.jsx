import React from 'react';
import { motion } from 'framer-motion';
import { Clock, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import PageMeta from '../../components/shared/PageMeta';
import CTASection from '../../components/shared/CTASection';
import InternalLinks from '../../components/shared/InternalLinks';

const faqs = [
  { q: 'How much does book cover design cost in South Africa?', a: 'The cost depends on whether the cover is front only, full print cover, stock image based or illustrated. Pricing also depends on concepts, revisions and file formats.' },
  { q: 'Do I need a spine for my book cover?', a: 'Yes, if you are printing a paperback with enough pages for a spine. The spine width must be calculated using the final page count and paper type.' },
  { q: 'Can I use my own photo?', a: 'Yes, but it should be high resolution and professionally suitable. Low-quality photos can weaken the final design.' },
  { q: 'Is an eBook cover different from a print cover?', a: 'Yes. An eBook cover is usually front cover only, while a print cover includes front, spine and back cover.' },
];

export default function BookCoverDesignPriceSouthAfrica() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    'headline': 'Book Cover Design Price in South Africa: What Authors Should Know',
    'description': 'Learn what affects book cover design prices in South Africa, including front cover, full cover, spine, back cover, stock images and illustrations.',
    'keywords': 'book cover design price South Africa, book cover designer, book cover design near me, ebook cover design',
  };

  return (
    <>
      <PageMeta
        title="Book Cover Design Prices South Africa (2026)"
        description="How much does book cover design cost in South Africa? Transparent pricing for custom covers — from simple to fully illustrated."
        keywords="book cover design price South Africa, book cover designer, book cover design near me, ebook cover design"
        canonical="https://www.creativebooks.co.za/bookcoverdesignpricesouthafrica"
        schema={schema}
      />
      
      <div className="bg-vellum min-h-screen">
        {/* Hero */}
        <section className="relative pt-32 pb-16 bg-obsidian">
          <div className="max-w-4xl mx-auto px-4 sm:px-6">
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}>
              <span className="text-copper text-xs font-body bg-copper/10 px-3 py-1 rounded-full mb-4 inline-block">Design Guide</span>
              <h1 className="font-heading text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6">
                Book Cover Design Price in South Africa: What Authors Should Know
              </h1>
              <p className="flex items-center gap-2 text-white/50 text-sm font-body">
                <Clock className="w-4 h-4" /> 10 min read
              </p>
            </motion.div>
          </div>
        </section>

        {/* Content */}
        <section className="py-16 bg-vellum">
          <div className="max-w-4xl mx-auto px-4 sm:px-6">
            <div className="prose prose-lg max-w-none">
              <motion.p initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-[#0F0F0F]/70 leading-[1.8] font-body text-lg mb-8">
                Book cover design price in South Africa depends on what the author needs, the complexity of the design and whether the cover is for print, eBook or both. A book cover is not just a picture on the front. It is the first sales message your book sends to a reader, often before they read a single sentence.
              </motion.p>

              <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="font-heading text-2xl font-bold text-[#0F0F0F] mb-4 mt-12">
                What affects the price of a book cover
              </motion.h2>
              <motion.p initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-[#0F0F0F]/70 leading-[1.8] font-body mb-6">
                The cost of a cover depends on whether the author supplies a professional image, whether stock images are needed, whether illustration is required, how many concepts are included, how many revisions are allowed and whether the designer must prepare a full print cover.
              </motion.p>

              <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="font-heading text-2xl font-bold text-[#0F0F0F] mb-4 mt-12">
                Front cover vs full print cover
              </motion.h2>
              <motion.p initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-[#0F0F0F]/70 leading-[1.8] font-body mb-6">
                A front cover is suitable for an eBook or early promotional mockup, but a printed book needs a full cover. A full cover includes the front, spine and back. The spine widths depends on page count, paper type and binding method. You cannot guess the spine like you are guessing whether it will rain in Joburg. It must be calculated.
              </motion.p>

              <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="font-heading text-2xl font-bold text-[#0F0F0F] mb-4 mt-12">
                Why cheap covers can cost more later
              </motion.h2>
              <motion.p initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-[#0F0F0F]/70 leading-[1.8] font-body mb-6">
                A very cheap cover may look fine on a phone screen but fail in print. Common problems include low-resolution images, wrong dimensions, missing bleed, poor typography, bad contrast and text placed too close to the edges. These issues may only become obvious when the proof copy arrives.
              </motion.p>

              <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="font-heading text-2xl font-bold text-[#0F0F0F] mb-4 mt-12">
                Stock images and illustrated covers
              </motion.h2>
              <motion.p initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-[#0F0F0F]/70 leading-[1.8] font-body mb-6">
                Stock image covers can work well when the images are selected carefully and integrated professionally. The designer must avoid making the cover look like a generic poster. Illustrated covers usually cost more because they may involve custom character development or original artwork.
              </motion.p>

              <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="font-heading text-2xl font-bold text-[#0F0F0F] mb-4 mt-12">
                What makes a cover look professional
              </motion.h2>
              <motion.p initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-[#0F0F0F]/70 leading-[1.8] font-body mb-6">
                Professional covers usually have clear hierarchy. The title is readable, the subtitle supports the title, the author's name is placed intentionally and the image does not fight with the text. Colour, contrast and spacing all work together. The cover should tell readers what kind of book they are looking at before they read the blurb.
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
                <h3 className="font-heading text-2xl font-bold text-[#0F0F0F] mb-4">Need a professional book cover?</h3>
                <p className="text-[#0F0F0F]/70 font-body mb-6">
                  Creative Books SA offers professional book cover design for print and eBook. Get a cover that sells your book.
                </p>
                <Link to="/getquote" className="inline-flex items-center gap-2 px-6 py-3 bg-copper text-white rounded-full font-medium hover:bg-copper/90 transition-all">
                  Request a Cover Design Quote <ArrowRight className="w-4 h-4" />
                </Link>
              </motion.div>
            </div>
          </div>
        </section>

        <InternalLinks
          links={[
            { label: 'Book Cover Design', path: '/bookcoverdesign' },
            { label: 'Book Printing', path: '/bookprinting' },
            { label: 'Children\'s Book Illustrations', path: '/printing/childrensbooks' },
            { label: 'Self Publishing Packages', path: '/selfpublishingpackagesinsouthafrica' },
            { label: 'Book Layout & Typesetting', path: '/typesetting' },
            { label: 'Get a Quote', path: '/getquote' },
          ]}
          light
        />
        <CTASection />
      </div>
    </>
  );
}