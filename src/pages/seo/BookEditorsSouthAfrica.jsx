import React from 'react';
import { motion } from 'framer-motion';
import { Clock, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import PageMeta from '../../components/shared/PageMeta';
import CTASection from '../../components/shared/CTASection';
import InternalLinks from '../../components/shared/InternalLinks';

const faqs = [
  { q: 'How much does book editing cost?', a: 'Editing cost depends on word count, editing level, manuscript quality and turnaround time.' },
  { q: 'Do I need editing if I am a good writer?', a: 'Yes. Even strong writers need a second professional eye because authors are often too close to their own work to catch every issue.' },
  { q: 'Can editing change my voice?', a: 'Good editing should improve clarity while preserving your voice. Heavy rewriting should only happen when agreed upfront.' },
  { q: 'Should I edit before or after printing?', a: 'Before printing. Printing should happen only once the manuscript has been edited, proofread and approved.' },
];

export default function BookEditorsSouthAfrica() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    'headline': 'Book Editors in South Africa: How to Choose the Right Editor for Your Manuscript',
    'description': 'Find out how book editors in South Africa help authors improve grammar, structure, clarity, flow and manuscript quality before publishing.',
    'keywords': 'book editors in South Africa, book editors near me, copy editing services, proofreading services',
  };

  return (
    <>
      <PageMeta
        title="Book Editors in South Africa | From R0.30 Per Word"
        description="Hire a professional book editor in South Africa from R0.30 per word — developmental, line and copy editing for fiction, non-fiction and memoir manuscripts."
        keywords="book editors in South Africa, book editors near me, copy editing services, proofreading services"
        canonical="https://www.creativebooks.co.za/bookeditorsinsouthafrica"
        schema={schema}
      />
      
      <div className="bg-vellum min-h-screen">
        {/* Hero */}
        <section className="relative pt-32 pb-16 bg-obsidian">
          <div className="max-w-4xl mx-auto px-4 sm:px-6">
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}>
              <span className="text-copper text-xs font-body bg-copper/10 px-3 py-1 rounded-full mb-4 inline-block">Editing Guide</span>
              <h1 className="font-heading text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6">
                Professional Book Editors in South Africa
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
                Book editors in South Africa help authors turn rough manuscripts into cleaner, clearer and more professional books. Editing is one of the most important publishing steps because readers may forgive a plain cover sooner than they forgive a book full of confusing sentences, repeated paragraphs and grammar problems.
              </motion.p>

              <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="font-heading text-2xl font-bold text-[#0F0F0F] mb-4 mt-12">
                What a book editor does
              </motion.h2>
              <motion.p initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-[#0F0F0F]/70 leading-[1.8] font-body mb-6">
                A book editor reads the manuscript carefully and improves the writing without destroying the author's voice. Depending on the editing level, this may include grammar, spelling, punctuation, sentence clarity, repetition, paragraph flow, consistency, chapter structure and tone.
              </motion.p>

              <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="font-heading text-2xl font-bold text-[#0F0F0F] mb-4 mt-12">
                Proofreading vs copy editing
              </motion.h2>
              <motion.p initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-[#0F0F0F]/70 leading-[1.8] font-body mb-6">
                Proofreading is usually the final check. It catches spelling errors, punctuation slips, missing words and small formatting issues. Copy editing is more involved. It improves sentence structure, grammar, clarity, consistency and flow.
              </motion.p>

              <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="font-heading text-2xl font-bold text-[#0F0F0F] mb-4 mt-12">
                Why editors need to see the manuscript before quoting
              </motion.h2>
              <motion.p initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-[#0F0F0F]/70 leading-[1.8] font-body mb-6">
                Editing is often priced according to word count and level of work required. A 40,000-word manuscript that is already clean will not need the same effort as a 90,000-word manuscript with structural problems, inconsistent tense and long confusing paragraphs.
              </motion.p>

              <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="font-heading text-2xl font-bold text-[#0F0F0F] mb-4 mt-12">
                Editing before layout
              </motion.h2>
              <motion.p initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-[#0F0F0F]/70 leading-[1.8] font-body mb-6">
                Editing should happen before typesetting. Once a book has been laid out, major text changes can disturb page flow, chapter breaks, page numbering and cover spine width. This is why professional copy editing should happen before book layout and typesetting.
              </motion.p>

              <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="font-heading text-2xl font-bold text-[#0F0F0F] mb-4 mt-12">
                Why editing is a credibility issue
              </motion.h2>
              <motion.p initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-[#0F0F0F]/70 leading-[1.8] font-body mb-6">
                Editing is not just a production step. It is a credibility issue. Readers may not know the author personally, so the book becomes part of the author's reputation. If the writing is careless, the reader may assume the ideas are careless too.
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
                <h3 className="font-heading text-2xl font-bold text-[#0F0F0F] mb-4">Ready to edit your manuscript?</h3>
                <p className="text-[#0F0F0F]/70 font-body mb-6">
                  Creative Books SA offers professional editing services including copy editing and proofreading. Get a clear quote for your manuscript.
                </p>
                <Link to="/getquote" className="inline-flex items-center gap-2 px-6 py-3 bg-copper text-white rounded-full font-medium hover:bg-copper/90 transition-all">
                  Request an Editing Quote <ArrowRight className="w-4 h-4" />
                </Link>
              </motion.div>
            </div>
          </div>
        </section>

        <InternalLinks
          links={[
            { label: 'Book Editing', path: '/bookediting' },
            { label: 'Proofreading', path: '/proofreading' },
            { label: 'Book Layout & Typesetting', path: '/typesetting' },
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