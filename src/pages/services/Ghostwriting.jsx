import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Check, Plus, Minus, Award, Mic, BookOpen, FileText, PenTool } from 'lucide-react';
import InternalLinks from '../../components/shared/InternalLinks';

const processSteps = [
  { num: '01', title: 'Submit Your Book Concept', body: 'Share your book idea, your story, your message and the outcome you want your book to achieve. This helps us understand the scope and provide an accurate quote.' },
  { num: '02', title: 'Receive a Quote', body: 'After reviewing your book concept, we will provide a detailed ghostwriting quote that covers the word count, recording hours, transcription and timeline.' },
  { num: '03', title: 'Sign the Ghostwriting Contract', body: 'A contract is signed to confirm the agreed scope, timeline, word count, payment terms and confidentiality agreement. Your name will be the published author.' },
  { num: '04', title: 'Ghostwriting Begins', body: 'Recording sessions begin. Your ghostwriter works from your recorded input, interviews, notes and materials to craft your manuscript chapter by chapter until the full book is complete.' },
];

const packages = [
  {
    title: 'Starter',
    price: 'R75,000',
    badge: null,
    popular: false,
    includes: ['30 000 to 44 000-word manuscript', '20 to 30 hours recording time', 'Transcribing'],
  },
  {
    title: 'Professional',
    price: 'R180,000',
    badge: 'Recommended',
    popular: true,
    includes: ['45 000 to 60 000 words', 'Up to 45 hours of recording', 'Transcribing'],
  },
  {
    title: 'Gold',
    price: 'R350,000',
    badge: null,
    popular: false,
    includes: ['100 000 words', 'Up to 100 hours of recording', 'Transcribing'],
  },
];

const bookTypes = [
  'Memoirs', 'Autobiographies', 'Biographies', 'Christian Books', 'Testimonies',
  'Devotionals', 'Business Books', 'Inspirational Books', 'Self-Help Books',
  'Non-Fiction Books', 'Leadership Books', 'Ministry Books',
];

const faqs = [
  { q: 'What is ghostwriting?', a: 'Ghostwriting is the process of hiring a professional writer to write a book on your behalf. The ghostwriter researches, structures and writes the manuscript while you remain the credited author. The ghostwriter signs a confidentiality agreement.' },
  { q: 'Will my name appear as the author?', a: 'Yes. As a ghostwriting client, your name appears as the sole author on the finished book. Our ghostwriters sign comprehensive non-disclosure and confidentiality agreements.' },
  { q: 'How long does ghostwriting take?', a: 'Ghostwriting is a long-term process. A 30 000 to 44 000 word book typically takes 3 to 6 months. Longer manuscripts of 60 000 words or more can take 6 to 12 months depending on input quality and availability.' },
  { q: 'What do I need to provide?', a: 'Ghostwriting depends on your collaboration. You will need to provide recording time, detailed interviews, notes, stories, experiences, teachings or existing written content. The more structured and detailed your input, the stronger the manuscript.' },
  { q: 'Is ghostwriting ethical?', a: 'Yes. Ghostwriting is a widely used and accepted practice across all industries. Business leaders, celebrities, pastors, entrepreneurs and authors regularly use ghostwriters to help articulate their message professionally.' },
  { q: 'Do you offer ghostwriting for Christian books?', a: 'Yes. We help pastors, ministry leaders, speakers and believers write testimonies, devotionals, sermon-based books and Christian inspirational manuscripts.' },
  { q: 'Can the manuscript be edited and published after ghostwriting?', a: 'Yes. Once the ghostwritten manuscript is complete, we can assist with editing, proofreading, cover design, typesetting, printing and self-publishing through Creative Books SA.' },
];

function FAQItem({ faq, i, open, setOpen }) {
  const isOpen = open === i;
  return (
    <div className="overflow-hidden" style={{ background: 'rgba(255,255,255,0.72)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.9)', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', borderRadius: '12px' }}>
      <button className="w-full flex items-center justify-between gap-4 px-6 py-4 text-left" onClick={() => setOpen(isOpen ? null : i)}>
        <span className="font-heading text-sm font-semibold text-[#0B1220] leading-snug">{faq.q}</span>
        <span className="shrink-0 w-6 h-6 flex items-center justify-center" style={{ background: isOpen ? '#0B1220' : 'rgba(0,0,0,0.05)', border: '1px solid rgba(0,0,0,0.08)', borderRadius: '50%' }}>
          {isOpen ? <Minus className="w-3 h-3 text-white" /> : <Plus className="w-3 h-3 text-[#0B1220]" />}
        </span>
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3 }}>
            <div className="px-6 pb-5" style={{ borderTop: '1px solid rgba(0,0,0,0.06)' }}>
              <p className="text-sm text-[#2B2B2B]/65 font-body leading-relaxed pt-4">{faq.a}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function Ghostwriting() {
  const [openFaq, setOpenFaq] = useState(null);

  return (
    <div style={{ background: '#f8f9fc' }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context": "https://schema.org", "@type": "FAQPage",
        "mainEntity": faqs.map(f => ({ "@type": "Question", "name": f.q, "acceptedAnswer": { "@type": "Answer", "text": f.a } }))
      }) }} />

      {/* Hero */}
      <section className="relative min-h-[65vh] flex items-end overflow-hidden" style={{ background: 'linear-gradient(160deg, #090E18 0%, #0d1830 60%, #111827 100%)' }}>
        <div className="absolute top-0 left-0 w-[600px] h-[400px] pointer-events-none" style={{ background: 'radial-gradient(ellipse at 20% 30%, rgba(184,149,91,0.12) 0%, transparent 60%)', filter: 'blur(40px)' }} />
        <div className="absolute top-0 left-0 right-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(184,149,91,0.6), transparent)' }} />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 pt-32 pb-20 w-full">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }} className="max-w-3xl">
            <span className="text-[#B8955B] text-xs font-body font-semibold tracking-[0.3em] uppercase mb-5 block">Ghost Writing Services · South Africa</span>
            <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 leading-[1.05]">
              Ghost Writing Services<br /><span style={{ color: '#B8955B' }}>South Africa</span>
            </h1>
            <p className="text-white/60 text-base font-body mb-5 font-medium">Professional Ghostwriters for Books, Memoirs, Christian Titles and Business Manuscripts</p>
            <p className="text-white/45 text-sm leading-relaxed font-body mb-5 max-w-2xl">
              Creative Books SA helps people turn powerful ideas, personal stories, teachings, testimonies and professional knowledge into complete manuscripts. If you have a book concept but do not have the time, structure or writing experience to complete it yourself, our ghostwriting service gives you the professional support needed to turn your message into a well-written book.
            </p>
            <p className="text-white/40 text-sm leading-relaxed font-body mb-10 max-w-2xl">
              A writer essentially becomes your voice, expressing your thoughts and ideas. However, they often rely on the information you provide, which means ghostwriting depends on strong collaboration, clear direction and detailed input.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link to="/getquote" className="inline-flex items-center gap-2 px-8 py-4 text-white text-sm font-semibold transition-all group" style={{ background: '#B8955B', boxShadow: '0 12px 32px rgba(184,149,91,0.35)', borderRadius: '8px' }}>
                Request a Ghostwriting Quote <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <a href="#pricing" className="inline-flex items-center gap-2 px-8 py-4 text-white/80 text-sm font-medium" style={{ border: '1px solid rgba(255,255,255,0.15)', borderRadius: '8px', background: 'rgba(255,255,255,0.04)' }}>
                View Ghostwriting Packages
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Who We Help */}
      <section className="py-20 lg:py-28 overflow-hidden" style={{ background: 'linear-gradient(135deg, #f0f4ff 0%, #eef1f7 100%)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-10">
            <span className="text-[#B8955B] text-xs tracking-[0.3em] uppercase font-body block mb-4">Who We Help</span>
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-[#0B1220] mb-3 leading-tight">Who Our Ghostwriting Services Are For</h2>
            <p className="text-[#2B2B2B]/55 font-body text-sm max-w-xl leading-relaxed">Our ghostwriting service is suitable for a wide range of people who have a story, message or knowledge worth sharing in book form.</p>
          </motion.div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
            {[
              { icon: Mic, title: 'Pastors and Ministry Leaders', body: 'Turn your teachings, sermons and spiritual insights into a published book.' },
              { icon: BookOpen, title: 'Entrepreneurs and Business Leaders', body: 'Document your journey, expertise and leadership lessons in a professional manuscript.' },
              { icon: PenTool, title: 'Memoir and Life Story Authors', body: 'Share your personal story, experiences, struggles and victories with the world.' },
              { icon: FileText, title: 'Speakers and Coaches', body: 'Extend your message and credibility through a professionally written book.' },
            ].map((card, i) => {
              const Icon = card.icon;
              return (
                <motion.div key={card.title} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}
                  className="p-6" style={{ background: 'rgba(255,255,255,0.75)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.9)', boxShadow: '0 4px 20px rgba(0,0,0,0.06)', borderRadius: '14px' }}>
                  <div className="w-10 h-10 flex items-center justify-center mb-4" style={{ background: 'rgba(184,149,91,0.1)', border: '1px solid rgba(184,149,91,0.2)', borderRadius: '10px' }}>
                    <Icon className="w-5 h-5 text-[#B8955B]" strokeWidth={1.5} />
                  </div>
                  <h3 className="font-heading text-sm font-bold text-[#0B1220] mb-2">{card.title}</h3>
                  <p className="text-xs font-body text-[#2B2B2B]/55 leading-relaxed">{card.body}</p>
                </motion.div>
              );
            })}
          </div>
          <div className="flex flex-wrap gap-2">
            {bookTypes.map((type, i) => (
              <motion.span key={type} initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: i * 0.04 }}
                className="px-4 py-2 text-xs font-body font-medium text-[#0B1220]"
                style={{ background: 'rgba(255,255,255,0.75)', border: '1px solid rgba(255,255,255,0.9)', boxShadow: '0 2px 12px rgba(0,0,0,0.05)', borderRadius: '6px' }}>
                {type}
              </motion.span>
            ))}
          </div>
        </div>
      </section>

      {/* Process */}
      <section className="py-20 lg:py-28" style={{ background: 'linear-gradient(160deg, #090E18 0%, #0d1830 100%)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-14">
            <span className="text-[#B8955B] text-xs tracking-[0.3em] uppercase font-body block mb-4">How It Works</span>
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-white mb-3 leading-tight">Our Ghostwriting Process</h2>
          </motion.div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {processSteps.map((step, i) => (
              <motion.div key={step.num} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}
                className="p-7" style={{ background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px' }}>
                <div className="font-heading text-4xl font-bold mb-4" style={{ color: 'rgba(184,149,91,0.25)' }}>{step.num}</div>
                <h3 className="font-heading text-base font-bold text-white mb-3">{step.title}</h3>
                <p className="text-xs font-body text-white/45 leading-relaxed">{step.body}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20 lg:py-28 overflow-hidden" style={{ background: 'linear-gradient(135deg, #f0f4ff 0%, #eef1f7 100%)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-14">
            <span className="text-[#B8955B] text-xs tracking-[0.3em] uppercase font-body block mb-4">Pricing</span>
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-[#0B1220] mb-2 leading-tight">Ghostwriting Pricing Packages</h2>
            <p className="text-[#2B2B2B]/50 font-body text-sm">Professional ghostwriting packages for different manuscript lengths</p>
          </motion.div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-10">
            {packages.map((pkg, i) => (
              <motion.div key={pkg.title} initial={{ opacity: 0, y: 28 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}
                whileHover={{ y: -6, transition: { duration: 0.2 } }}
                className="relative flex flex-col overflow-hidden h-full"
                style={{
                  background: pkg.popular ? 'linear-gradient(160deg, #ffffff 0%, #fdf9f4 100%)' : 'rgba(255,255,255,0.72)',
                  backdropFilter: 'blur(24px)',
                  border: pkg.popular ? '1.5px solid rgba(184,149,91,0.55)' : '1px solid rgba(255,255,255,0.88)',
                  boxShadow: pkg.popular ? '0 24px 60px rgba(184,149,91,0.18)' : '0 8px 32px rgba(0,0,0,0.06)',
                  borderRadius: '16px',
                }}>
                {pkg.badge && (
                  <div className="absolute top-4 right-4">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 text-[10px] font-semibold tracking-[0.15em] uppercase" style={{ background: 'linear-gradient(135deg, #0B1220 0%, #1a2a4a 100%)', color: '#D4AF72', border: '1px solid rgba(212,175,114,0.3)', borderRadius: '4px' }}>
                      <Award className="w-2.5 h-2.5" />{pkg.badge}
                    </span>
                  </div>
                )}
                <div className="p-7 flex-1">
                  <p className="text-[10px] font-semibold tracking-[0.25em] uppercase font-body mb-3" style={{ color: pkg.popular ? '#B8955B' : 'rgba(11,18,32,0.4)' }}>{pkg.title}</p>
                  <span className="font-heading text-4xl font-bold text-[#0B1220]">{pkg.price}</span>
                  <div className="h-px my-5" style={{ background: pkg.popular ? 'rgba(184,149,91,0.2)' : 'rgba(0,0,0,0.06)' }} />
                  <ul className="space-y-2">
                    {pkg.includes.map(f => (
                      <li key={f} className="flex items-start gap-2.5">
                        <div className="w-4 h-4 rounded-full flex items-center justify-center shrink-0 mt-0.5" style={{ background: pkg.popular ? 'rgba(184,149,91,0.12)' : 'rgba(11,18,32,0.06)', border: `1px solid ${pkg.popular ? 'rgba(184,149,91,0.3)' : 'rgba(11,18,32,0.1)'}` }}>
                          <Check className="w-2.5 h-2.5" style={{ color: pkg.popular ? '#B8955B' : '#0B1220' }} strokeWidth={2.5} />
                        </div>
                        <span className="text-xs font-body text-[#2B2B2B]/70">{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="p-7 pt-0">
                  <Link to="/getquote" className="block text-center py-3 text-sm font-semibold font-body transition-all"
                    style={pkg.popular ? { background: 'linear-gradient(135deg, #0B1220, #1a2a4a)', color: '#fff', boxShadow: '0 8px 24px rgba(11,18,32,0.25)', borderRadius: '8px' } : { background: 'rgba(11,18,32,0.05)', color: '#0B1220', border: '1px solid rgba(11,18,32,0.12)', borderRadius: '8px' }}>
                    Request {pkg.title} Ghostwriting Quote
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
            className="p-6" style={{ background: 'rgba(255,255,255,0.72)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.9)', borderRadius: '12px' }}>
            <h3 className="font-heading text-base font-bold text-[#0B1220] mb-2">Important Notes About Ghostwriting Pricing</h3>
            <p className="text-xs font-body text-[#2B2B2B]/60 leading-relaxed">Ghostwriting pricing depends on manuscript length, topic complexity and the hours of recording input required. Ghostwriting is a long-term collaborative process that requires dedication from both sides. The more structured your input, the stronger the manuscript.</p>
          </motion.div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 lg:py-28 overflow-hidden" style={{ background: '#F8F5EF' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
            <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="lg:sticky lg:top-28">
              <span className="text-[#B8955B] text-xs tracking-[0.3em] uppercase font-body block mb-5">FAQ</span>
              <h2 className="font-heading text-3xl md:text-4xl font-bold text-[#0B1220] mb-4 leading-tight">Ghostwriting Services FAQs</h2>
              <div className="mt-6 h-px w-24" style={{ background: '#B8955B' }} />
            </motion.div>
            <div className="space-y-2">
              {faqs.map((faq, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}>
                  <FAQItem faq={faq} i={i} open={openFaq} setOpen={setOpenFaq} />
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="relative py-20 overflow-hidden" style={{ background: 'linear-gradient(160deg, #090E18 0%, #0d1830 100%)' }}>
        <div className="absolute top-0 left-0 right-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(184,149,91,0.5), transparent)' }} />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <span className="text-[#B8955B] text-xs tracking-[0.3em] uppercase font-body block mb-6">Get Started</span>
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-white mb-5 leading-tight">Ready to Turn Your Story Into a Book?</h2>
            <p className="text-white/45 font-body text-sm leading-relaxed mb-10 max-w-lg mx-auto">Your message, story or expertise deserves to be in print. Our ghostwriting team can help you move from idea to completed manuscript, your name, your book, professionally written.</p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link to="/getquote" className="inline-flex items-center gap-2 px-8 py-4 text-white text-sm font-semibold transition-all group" style={{ background: '#B8955B', boxShadow: '0 12px 32px rgba(184,149,91,0.35)', borderRadius: '8px' }}>
                Request a Ghostwriting Quote <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link to="/publishingpackages" className="inline-flex items-center gap-2 px-8 py-4 text-white/70 text-sm" style={{ border: '1px solid rgba(255,255,255,0.12)', borderRadius: '8px', background: 'rgba(255,255,255,0.04)' }}>
                View Publishing Packages
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      <InternalLinks links={[
        { label: 'Memoir Writing Services', path: '/memoirwriting' },
        { label: 'Biography Writing Services', path: '/biographywriting' },
        { label: 'Christian Book Writing', path: '/christianbookwriting' },
        { label: 'Book Editing Services', path: '/bookediting' },
        { label: 'Publishing Packages', path: '/publishingpackages' },
        { label: 'Request a Quote', path: '/getquote' },
      ]} light />
    </div>
  );
}