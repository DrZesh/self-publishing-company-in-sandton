import React, { useState } from 'react';
import PageMeta from '../../components/shared/PageMeta';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Check, Plus, Minus, BookOpen, Star, PenTool, Heart } from 'lucide-react';
import InternalLinks from '../../components/shared/InternalLinks';

const serviceCards = [
  { icon: Heart, title: 'Testimony Books', body: 'Document your personal testimony, spiritual journey or encounter with God in a powerful book that can encourage and inspire others.' },
  { icon: BookOpen, title: 'Devotionals', body: 'Create structured daily devotional books, monthly devotionals or topical devotional guides written from a scriptural and faith-based foundation.' },
  { icon: PenTool, title: 'Sermon-Based Books', body: 'Transform your sermons, teachings and messages into a well-structured book that extends your ministry reach beyond the pulpit.' },
  { icon: Star, title: 'Christian Memoirs', body: 'Write a memoir from a Christian perspective, interweaving your faith journey, trials, breakthroughs and spiritual lessons.' },
  { icon: BookOpen, title: 'Inspirational Christian Books', body: 'Create motivational, faith-based books designed to encourage, uplift and equip believers through scripture-aligned writing.' },
  { icon: PenTool, title: 'Bible Study and Teaching Books', body: 'Develop structured Bible study guides, teaching workbooks or doctrinal books for group or individual use.' },
];

const processSteps = [
  { num: '01', title: 'Submit Your Book Concept', body: 'Share your message, vision, topic and audience. Let us understand the spiritual purpose of your book and what you want it to achieve.' },
  { num: '02', title: 'Receive a Quote', body: 'Based on your concept and manuscript requirements, we provide a personalised quote covering scope, length and timeline.' },
  { num: '03', title: 'Sign the Agreement', body: 'A writing agreement is signed to confirm scope, timeline, confidentiality and the agreed publishing outcome.' },
  { num: '04', title: 'Christian Book Writing Begins', body: 'Your writer works through recordings, interviews, notes and materials to craft your Christian manuscript with faithfulness to your message and voice.' },
];

const faqs = [
  { q: 'What types of Christian books do you help write?', a: 'We help write testimony books, devotionals, sermon-based books, Christian memoirs, inspirational books, Bible study guides, teaching manuals and faith-based non-fiction across all Christian traditions.' },
  { q: 'Do you understand Christian writing and faith-based content?', a: 'Yes. Our writing approach respects the faith context of every project. We work to preserve your theological voice, scriptural references and the spiritual intent of your message.' },
  { q: 'Can a pastor use a ghostwriter for a Christian book?', a: 'Yes. Many pastors, ministry leaders and speakers use professional ghostwriters to help structure and articulate their teachings and messages into a published book. This is widely accepted in Christian publishing.' },
  { q: 'Will the book reflect my voice and message?', a: 'Yes. The goal of Christian book writing is to express your message authentically. Your ghostwriter works to understand your theological perspective, tone and audience so the finished manuscript sounds like you.' },
  { q: 'Can the manuscript be edited and published after writing?', a: 'Yes. Creative Books SA can assist with editing, proofreading, cover design, typesetting and self-publishing once the Christian manuscript is complete.' },
  { q: 'Do you serve authors outside Johannesburg?', a: 'Yes. We assist Christian authors and ministry leaders in Johannesburg, Gauteng and across South Africa and beyond.' },
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

export default function ChristianBookWriting() {
  const [openFaq, setOpenFaq] = useState(null);

  return (
    <div style={{ background: '#f8f9fc' }}>
      <PageMeta
        title="Christian Book Writing Services South Africa | Faith-Based Ghostwriters"
        description="Professional Christian book writing services in South Africa. We help pastors, ministry leaders and believers write testimonies, devotionals and faith-based books."
        canonical="https://www.creativebookssa.co.za/christianbookwriting"
      />
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
            <span className="text-[#B8955B] text-xs font-body font-semibold tracking-[0.3em] uppercase mb-5 block">Christian Book Writing Services · South Africa</span>
            <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 leading-[1.05]">
              Christian Book Writing and Publishing
            </h1>
            <p className="text-white/60 text-base font-body mb-5 font-medium">Professional Christian Ghostwriters for Testimonies, Devotionals, Sermons and Faith-Based Books</p>
            <p className="text-white/45 text-sm leading-relaxed font-body mb-10 max-w-2xl">
              Creative Books SA helps Christian authors, pastors, ministry leaders, speakers and believers turn faith-based messages, testimonies, teachings and spiritual experiences into professionally written books. If you have a Christian book idea but need help shaping the structure, writing the chapters or refining the message, our Christian book writing service can help you move from idea to manuscript.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link to="/getquote" className="inline-flex items-center gap-2 px-8 py-4 text-white text-sm font-semibold transition-all group" style={{ background: '#B8955B', boxShadow: '0 12px 32px rgba(184,149,91,0.35)', borderRadius: '8px' }}>
                Request a Christian Book Quote <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Services */}
      <section className="py-20 lg:py-28 overflow-hidden" style={{ background: 'linear-gradient(135deg, #f0f4ff 0%, #eef1f7 100%)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-14">
            <span className="text-[#B8955B] text-xs tracking-[0.3em] uppercase font-body block mb-4">Types of Books</span>
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-[#0B1220] mb-3 leading-tight">Types of Christian Books We Can Help Write</h2>
          </motion.div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {serviceCards.map((svc, i) => {
              const Icon = svc.icon;
              return (
                <motion.div key={svc.title} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.07 }}
                  className="p-7" style={{ background: 'rgba(255,255,255,0.78)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.95)', boxShadow: '0 4px 20px rgba(0,0,0,0.06)', borderRadius: '14px' }}>
                  <div className="w-10 h-10 flex items-center justify-center mb-5" style={{ background: 'rgba(184,149,91,0.1)', border: '1px solid rgba(184,149,91,0.2)', borderRadius: '10px' }}>
                    <Icon className="w-5 h-5 text-[#B8955B]" strokeWidth={1.5} />
                  </div>
                  <h3 className="font-heading text-base font-bold text-[#0B1220] mb-2">{svc.title}</h3>
                  <p className="text-xs font-body text-[#2B2B2B]/55 leading-relaxed">{svc.body}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Process */}
      <section className="py-20 lg:py-28" style={{ background: 'linear-gradient(160deg, #090E18 0%, #0d1830 100%)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-14">
            <span className="text-[#B8955B] text-xs tracking-[0.3em] uppercase font-body block mb-4">How It Works</span>
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-white mb-3 leading-tight">Our Christian Book Writing Process</h2>
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

      {/* Packages */}
      <section className="py-20 lg:py-28 overflow-hidden" style={{ background: 'linear-gradient(135deg, #f0f4ff 0%, #eef1f7 100%)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-14">
            <span className="text-[#B8955B] text-xs tracking-[0.3em] uppercase font-body block mb-4">Packages</span>
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-[#0B1220] mb-3 leading-tight">Christian Book Writing Packages</h2>
            <p className="text-[#2B2B2B]/55 font-body text-sm">Pricing is based on manuscript length and scope. Request a personalised quote.</p>
          </motion.div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              { title: 'Christian Short Manuscript', desc: 'For shorter testimonies, devotionals and focused faith-based manuscripts.', points: ['Up to 30 000 words', 'Structured outline', 'Interview-based writing', 'Faith-sensitive approach'] },
              { title: 'Full Christian Book Writing', desc: 'For complete faith-based books, sermon-based books and Christian non-fiction.', points: ['30 000 to 60 000 words', 'Full chapter structure', 'Extended writing collaboration', 'Theological voice preserved'], popular: true },
              { title: 'Premium Ministry Book Development', desc: 'For large-scale ministry books, Bible study series and leadership titles.', points: ['60 000+ words', 'Advanced research and development', 'Ministry-ready manuscript', 'Premium writing collaboration'] },
            ].map((pkg, i) => (
              <motion.div key={pkg.title} initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}
                whileHover={{ y: -6, transition: { duration: 0.2 } }}
                className="relative flex flex-col overflow-hidden"
                style={{
                  background: pkg.popular ? 'linear-gradient(160deg, #ffffff 0%, #fdf9f4 100%)' : 'rgba(255,255,255,0.72)',
                  border: pkg.popular ? '1.5px solid rgba(184,149,91,0.55)' : '1px solid rgba(255,255,255,0.88)',
                  boxShadow: pkg.popular ? '0 24px 60px rgba(184,149,91,0.18)' : '0 8px 32px rgba(0,0,0,0.06)',
                  borderRadius: '16px',
                }}>
                <div className="p-7 flex-1">
                  <p className="text-[10px] font-semibold tracking-[0.25em] uppercase font-body mb-3" style={{ color: pkg.popular ? '#B8955B' : 'rgba(11,18,32,0.4)' }}>{pkg.title}</p>
                  <p className="font-heading text-2xl font-bold text-[#0B1220] mb-3">Quote Based</p>
                  <p className="text-xs font-body text-[#2B2B2B]/55 italic mb-5">{pkg.desc}</p>
                  <div className="h-px mb-5" style={{ background: pkg.popular ? 'rgba(184,149,91,0.2)' : 'rgba(0,0,0,0.06)' }} />
                  <ul className="space-y-2">
                    {pkg.points.map(f => (
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
                    style={pkg.popular ? { background: 'linear-gradient(135deg, #0B1220, #1a2a4a)', color: '#fff', borderRadius: '8px' } : { background: 'rgba(11,18,32,0.05)', color: '#0B1220', border: '1px solid rgba(11,18,32,0.12)', borderRadius: '8px' }}>
                    Request Christian Book Quote
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 lg:py-28" style={{ background: '#F8F5EF' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
            <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="lg:sticky lg:top-28">
              <span className="text-[#B8955B] text-xs tracking-[0.3em] uppercase font-body block mb-5">FAQ</span>
              <h2 className="font-heading text-3xl md:text-4xl font-bold text-[#0B1220] mb-4 leading-tight">Christian Book Writing Services FAQs</h2>
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
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-white mb-5 leading-tight">Ready to Turn Your Christian Message Into a Book?</h2>
            <p className="text-white/45 font-body text-sm leading-relaxed mb-10 max-w-lg mx-auto">Your message has the power to impact lives. Let us help you turn your testimony, teachings or faith-based story into a professionally written book.</p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link to="/getquote" className="inline-flex items-center gap-2 px-8 py-4 text-white text-sm font-semibold transition-all group" style={{ background: '#B8955B', boxShadow: '0 12px 32px rgba(184,149,91,0.35)', borderRadius: '8px' }}>
                Request a Christian Book Quote <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link to="/ghostwriting" className="inline-flex items-center gap-2 px-8 py-4 text-white/70 text-sm" style={{ border: '1px solid rgba(255,255,255,0.12)', borderRadius: '8px', background: 'rgba(255,255,255,0.04)' }}>
                Ghost Writing Services
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      <InternalLinks links={[
        { label: 'Ghost Writing Services', path: '/ghostwriting' },
        { label: 'Memoir Writing Services', path: '/memoirwriting' },
        { label: 'Book Editing Services', path: '/bookediting' },
        { label: 'Publishing Packages', path: '/publishingpackages' },
        { label: 'Request a Quote', path: '/getquote' },
      ]} light />
    </div>
  );
}