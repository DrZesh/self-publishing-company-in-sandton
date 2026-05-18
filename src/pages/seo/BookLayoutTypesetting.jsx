import React from 'react';
import { motion } from 'framer-motion';
import { Clock, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import PageMeta from '../../components/shared/PageMeta';
import CTASection from '../../components/shared/CTASection';
import InternalLinks from '../../components/shared/InternalLinks';

const faqs = [
  { q: 'What is the difference between layout and typesetting?', a: 'They are often used together. Layout focuses on page arrangement, while typesetting focuses on the professional placement and styling of text.' },
  { q: 'When should typesetting happen?', a: 'After editing and proofreading, or at least after the manuscript is close to final.' },
  { q: 'Do poetry books need typesetting?', a: 'Yes. Poetry often needs careful spacing, line breaks and page balance.' },
  { q: 'Can I make changes after typesetting?', a: 'Yes, but major changes may affect page count and require additional layout work.' },
];

export default function BookLayoutTypesetting() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    'headline': 'Book Layout and Typesetting Services for Self-Published Authors',
    'description': 'Professional book layout and typesetting services for authors who need print-ready interiors, clean margins, page numbers and polished book design.',
    'keywords': 'book layout, typesetting, book typesetting services, typesetter South Africa, print-ready book files',
  };

  return (
    <>
      <PageMeta
        title="Book Layout &amp; Typesetting in South Africa | Print-Ready"
        description="Professional book layout and typesetting in South Africa — print-ready interior PDFs for A5, 6×9, hardcover and children's book formats. Built for print."
        keywords="book layout, typesetting, book typesetting services, typesetter South Africa, print-ready book files"
        canonical="https://www.creativebooks.co.za/booklayoutandtypesetting"
        schema={schema}
      />
      
      <div className="bg-vellum min-h-screen">
        {/* Hero */}
        <section className="relative pt-32 pb-16 bg-obsidian">
          <div className="max-w-4xl mx-auto px-4 sm:px-6">
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}>
              <span className="text-copper text-xs font-body bg-copper/10 px-3 py-1 rounded-full mb-4 inline-block">Design Guide</span>
              <h1 className="font-heading text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6">
                Book Layout and Typesetting Services
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
                Book layout and typesetting turn a manuscript into a professional book interior. This is the stage where a Word document becomes something that feels like a real book. Margins, line spacing, chapter openings, page numbers, headings and front matter are arranged so the reader can move through the book comfortably.
              </motion.p>

              <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="font-heading text-2xl font-bold text-[#0F0F0F] mb-4 mt-12">
                What typesetting means
              </motion.h2>
              <motion.p initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-[#0F0F0F]/70 leading-[1.8] font-body mb-6">
                Typesetting is the professional arrangement of text on a page. It includes choosing the correct page size, font styling, spacing, margins, chapter headings, page numbers, headers, footers, front matter and back matter. The goal is not only to make the book look pretty. The goal is to make the reading experience smooth.
              </motion.p>

              <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="font-heading text-2xl font-bold text-[#0F0F0F] mb-4 mt-12">
                Why Word documents are not enough
              </motion.h2>
              <motion.p initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-[#0F0F0F]/70 leading-[1.8] font-body mb-6">
                Microsoft Word is useful for writing and editing, but it is not ideal for final professional book production. Text can shift, fonts can change and page breaks can behave differently on different machines. A print-ready PDF locks the layout so the printer receives exactly what was approved.
              </motion.p>

              <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="font-heading text-2xl font-bold text-[#0F0F0F] mb-4 mt-12">
                Layout and cover spine width
              </motion.h2>
              <motion.p initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-[#0F0F0F]/70 leading-[1.8] font-body mb-6">
                Final layout affects the final page count. Final page count affects the spine width. Spine width affects the full cover design. This means layout and cover design must speak to each other. If you change the page count after the cover is done, the cover may need adjustment.
              </motion.p>

              <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="font-heading text-2xl font-bold text-[#0F0F0F] mb-4 mt-12">
                Typesetting for different books
              </motion.h2>
              <motion.p initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-[#0F0F0F]/70 leading-[1.8] font-body mb-6">
                A novel may need simple, elegant chapter openings and comfortable reading flow. A poetry book may need careful spacing and line breaks. A workbook may need tables, answer spaces and diagrams. A children's book may need image and text placement on every spread.
              </motion.p>

              <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="font-heading text-2xl font-bold text-[#0F0F0F] mb-4 mt-12">
                Why interior design affects reader trust
              </motion.h2>
              <motion.p initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-[#0F0F0F]/70 leading-[1.8] font-body mb-6">
                Interior design is quiet, but powerful. Readers may not praise good margins or balanced chapter openings, but they notice when a book feels easy to read. Poor layout makes a book feel tiring. Text that is too tight, margins that are too narrow or headings that float awkwardly can make even strong writing feel less polished.
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
                <h3 className="font-heading text-2xl font-bold text-[#0F0F0F] mb-4">Need professional book layout?</h3>
                <p className="text-[#0F0F0F]/70 font-body mb-6">
                  Creative Books SA offers professional typesetting and book layout services. Get print-ready files that look professional.
                </p>
                <Link to="/getquote" className="inline-flex items-center gap-2 px-6 py-3 bg-copper text-white rounded-full font-medium hover:bg-copper/90 transition-all">
                  Request a Layout Quote <ArrowRight className="w-4 h-4" />
                </Link>
              </motion.div>
            </div>
          </div>
        </section>

        <InternalLinks
          links={[
            { label: 'Book Typesetting', path: '/typesetting' },
            { label: 'Book Editing', path: '/bookediting' },
            { label: 'Book Cover Design', path: '/bookcoverdesign' },
            { label: 'Book Printing', path: '/bookprinting' },
            { label: 'Self Publishing Packages', path: '/selfpublishingpackagesinsouthafrica' },
            { label: 'Get a Quote', path: '/getquote' },
          ]}
          light
        />
        <CTASection />
      </div>
    </>
  );
}