import React from 'react';
import { motion } from 'framer-motion';
import { Clock, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import PageMeta from '../../components/shared/PageMeta';
import CTASection from '../../components/shared/CTASection';
import InternalLinks from '../../components/shared/InternalLinks';

const faqs = [
  { q: 'Will the book still sound like me?', a: 'It should. A good ghostwriter captures your tone, ideas and message while improving structure and readability.' },
  { q: 'Do ghostwriters get credit?', a: 'Usually not, unless agreed. Many ghostwriting arrangements are confidential.' },
  { q: 'How long does ghostwriting take?', a: 'It depends on book length, availability for interviews, amount of material and revision rounds.' },
  { q: 'Do I need editing after ghostwriting?', a: 'Yes, it is wise to have a completed ghostwritten manuscript edited before layout and printing.' },
];

export default function GhostwritersSouthAfrica() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    'headline': 'Ghostwriters in South Africa: How to Turn Your Ideas Into a Finished Book',
    'description': 'Learn how ghostwriters in South Africa help authors, speakers, pastors, coaches and entrepreneurs turn ideas into complete manuscripts.',
    'keywords': 'ghostwriters in South Africa, ghost writer near me, ghostwriting services, book writer South Africa',
  };

  return (
    <>
      <PageMeta
        title="Ghostwriters South Africa"
        description="Hire a professional ghostwriter in South Africa for memoirs, business books, fiction and non-fiction. Discreet, NDA-protected, transparent project pricing."
        keywords="ghostwriters in South Africa, ghost writer near me, ghostwriting services, book writer South Africa"
        canonical="https://creativebooks.co.za/ghostwritersinsouthafrica"
        schema={schema}
      />
      
      <div className="bg-vellum min-h-screen">
        {/* Hero */}
        <section className="relative pt-32 pb-16 bg-obsidian">
          <div className="max-w-4xl mx-auto px-4 sm:px-6">
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}>
              <span className="text-copper text-xs font-body bg-copper/10 px-3 py-1 rounded-full mb-4 inline-block">Writing Guide</span>
              <h1 className="font-heading text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6">
                Ghostwriters South Africa
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
                Ghostwriters in South Africa help people turn ideas, stories, expertise and lived experience into complete manuscripts. Not everyone who has a powerful book idea has the time, structure or writing skill to produce a full book alone. That does not mean the story should stay trapped in voice notes forever.
              </motion.p>

              <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="font-heading text-2xl font-bold text-[#0F0F0F] mb-4 mt-12">
                What a ghostwriter does
              </motion.h2>
              <motion.p initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-[#0F0F0F]/70 leading-[1.8] font-body mb-6">
                A ghostwriter may interview the client, review notes, create a chapter outline, write draft chapters, revise the manuscript and help preserve the author's voice. In book projects, ghostwriting is often used for memoirs, business books, leadership books, Christian books, inspirational books and expert guides.
              </motion.p>

              <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="font-heading text-2xl font-bold text-[#0F0F0F] mb-4 mt-12">
                Who needs a ghostwriter
              </motion.h2>
              <motion.p initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-[#0F0F0F]/70 leading-[1.8] font-body mb-6">
                Ghostwriting is useful for busy professionals, speakers, entrepreneurs, ministers, community leaders and people with life stories. Some clients know exactly what they want to say but struggle to structure it. Others have years of notes, sermons, talks, emails and recordings but no clear book format.
              </motion.p>

              <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="font-heading text-2xl font-bold text-[#0F0F0F] mb-4 mt-12">
                Ghostwriting vs editing
              </motion.h2>
              <motion.p initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-[#0F0F0F]/70 leading-[1.8] font-body mb-6">
                Ghostwriting creates or heavily develops the manuscript. Editing improves a manuscript that already exists. If you have only ideas, recordings and notes, ghostwriting may be suitable. If you already have a draft, book editing services may be enough.
              </motion.p>

              <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="font-heading text-2xl font-bold text-[#0F0F0F] mb-4 mt-12">
                How the ghostwriting process works
              </motion.h2>
              <motion.p initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-[#0F0F0F]/70 leading-[1.8] font-body mb-6">
                A practical process starts with a consultation. The ghostwriter needs to understand the purpose of the book, target reader, tone, story arc, chapter structure and source material. After that, the project may move into interviews, outline development, writing, review and revision.
              </motion.p>

              <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="font-heading text-2xl font-bold text-[#0F0F0F] mb-4 mt-12">
                Confidentiality and ownership
              </motion.h2>
              <motion.p initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-[#0F0F0F]/70 leading-[1.8] font-body mb-6">
                Ghostwriting should be clear about confidentiality, credit and ownership. Most ghostwriters do not receive public credit unless agreed. The client should understand who owns the final manuscript, how payments are structured and whether the ghostwriter may mention the project in a portfolio.
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
                <h3 className="font-heading text-2xl font-bold text-[#0F0F0F] mb-4">Have a book idea?</h3>
                <p className="text-[#0F0F0F]/70 font-body mb-6">
                  Creative Books SA offers ghostwriting services to help you turn your story into a professionally written manuscript.
                </p>
                <Link to="/getquote" className="inline-flex items-center gap-2 px-6 py-3 bg-copper text-white rounded-full font-medium hover:bg-copper/90 transition-all">
                  Request a Ghostwriting Quote <ArrowRight className="w-4 h-4" />
                </Link>
              </motion.div>
            </div>
          </div>
        </section>

        <InternalLinks
          links={[
            { label: 'Ghostwriting', path: '/ghostwriting' },
            { label: 'Book Editing', path: '/book-editing' },
            { label: 'Book Publishing', path: '/book-publishing' },
            { label: 'Memoir Writing', path: '/memoirwriting' },
            { label: 'Biography Writing', path: '/biographywriting' },
            { label: 'Get a Quote', path: '/getquote' },
          ]}
          light
        />
        <CTASection />
      </div>
    </>
  );
}