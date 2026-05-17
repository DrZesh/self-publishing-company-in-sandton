import React, { useState } from 'react';
import PageMeta from '../../components/shared/PageMeta';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Check, Plus, Minus, Users, Briefcase, BookOpen, Star } from 'lucide-react';
import InternalLinks from '../../components/shared/InternalLinks';

const services = [
  { icon: Users, title: 'Personal Biography Writing', body: 'Document the life story of an individual — their background, journey, achievements and legacy — in a professionally written and structured biography.' },
  { icon: Briefcase, title: 'Business Biography Writing', body: 'Tell the story of a company, founder or executive in a compelling business biography that captures the vision, challenges and milestones of the organisation.' },
  { icon: Star, title: 'Family Legacy Biography', body: 'Preserve a family history, generational story or ancestral journey in a beautifully written legacy biography that can be shared with family members and future generations.' },
  { icon: BookOpen, title: 'Founder and Organisation Biography', body: 'Create an authoritative biography for an organisation, institution, ministry, NGO or corporate entity documenting its history, founding story and impact.' },
];

const processSteps = [
  { num: '01', title: 'Initial Consultation', body: 'We discuss the subject of the biography, the scope of the project, available source material and the publishing outcome you are working towards.' },
  { num: '02', title: 'Research and Interviews', body: 'We conduct structured interviews with the subject, family members, colleagues or available sources to gather the information needed for an accurate and compelling biography.' },
  { num: '03', title: 'Outline and Structure', body: 'We develop a chapter structure and narrative framework before writing begins, ensuring the biography is well-organised and tells a coherent story.' },
  { num: '04', title: 'Writing and Review', body: 'The biography is written in stages with regular review opportunities so you can provide input, corrections and additions throughout the process.' },
  { num: '05', title: 'Final Manuscript', body: 'The completed biography manuscript is delivered for final approval before moving into editing, design and publishing stages.' },
];

const faqs = [
  { q: 'What is the difference between a biography and a memoir?', a: 'A memoir is written from a first-person perspective, focusing on personal reflection and specific life experiences. A biography is typically written in the third person about another person\'s life, based on research and interviews rather than personal narration.' },
  { q: 'Can I commission a biography for someone else?', a: 'Yes. Many biographies are commissioned by families, organisations, companies and communities to honour a leader, founder, parent or public figure. We handle the research, interviews and writing on your behalf.' },
  { q: 'What types of people are biography subjects?', a: 'Biography subjects include business leaders, entrepreneurs, founders, pastors, community leaders, parents, public figures, veterans, teachers, activists and anyone whose story is worth preserving and sharing.' },
  { q: 'Do you research the biography or do I provide all the information?', a: 'We work collaboratively. You provide access to interviews, documents, photographs and relevant sources. We structure, research and write from the material provided.' },
  { q: 'Can the biography be published after it is written?', a: 'Yes. Creative Books SA can assist with editing, proofreading, book design, typesetting, printing and self-publishing once the biography manuscript is complete.' },
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

export default function BiographyWriting() {
  const [openFaq, setOpenFaq] = useState(null);

  return (
    <div style={{ background: '#f8f9fc' }}>
      <PageMeta
        title="Biography Writing Services South Africa | Researched & Crafted"
        description="Professional biography writing in South Africa — for business leaders, public figures and family histories. Researched, well-crafted, ready for print."
        canonical="https://www.creativebooks.co.za/biographywriting"
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
            <span className="text-[#B8955B] text-xs font-body font-semibold tracking-[0.3em] uppercase mb-5 block">Biography Writing · South Africa</span>
            <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 leading-[1.05]">
              Professional Biography Writing Services
            </h1>
            <p className="text-white/60 text-base font-body mb-5 font-medium">Professional Biography Writers for Leaders, Families, Organisations and Legacy Books</p>
            <p className="text-white/45 text-sm leading-relaxed font-body mb-10 max-w-2xl">
              Creative Books SA helps individuals, families, organisations and professionals turn life stories, achievements and personal histories into professionally written biographies. Whether you want to document the life of a founder, leader, parent, public figure, entrepreneur, pastor, community builder or family member, our biography writing service helps preserve the story with clarity, structure and respect.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link to="/getquote" className="inline-flex items-center gap-2 px-8 py-4 text-white text-sm font-semibold transition-all group" style={{ background: '#B8955B', boxShadow: '0 12px 32px rgba(184,149,91,0.35)', borderRadius: '8px' }}>
                Request a Biography Writing Quote <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Services */}
      <section className="py-20 lg:py-28 overflow-hidden" style={{ background: 'linear-gradient(135deg, #f0f4ff 0%, #eef1f7 100%)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-14">
            <span className="text-[#B8955B] text-xs tracking-[0.3em] uppercase font-body block mb-4">Services</span>
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-[#0B1220] mb-3 leading-tight">Biography Writing Services We Offer</h2>
          </motion.div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {services.map((svc, i) => {
              const Icon = svc.icon;
              return (
                <motion.div key={svc.title} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}
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
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-white mb-3 leading-tight">Our Biography Writing Process</h2>
          </motion.div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
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
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-[#0B1220] mb-3 leading-tight">Biography Writing Packages</h2>
            <p className="text-[#2B2B2B]/55 font-body text-sm">Biography writing pricing is based on scope, length and research requirements. Request a quote for a personalised estimate.</p>
          </motion.div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              { title: 'Personal Biography', desc: 'For individuals, parents, leaders and personal legacy books.', points: ['Up to 40 000 words', 'Interview-based research', 'Chapter structure and writing', 'One review period'] },
              { title: 'Professional Biography', desc: 'For executives, founders, public figures and business leaders.', points: ['40 000 to 70 000 words', 'Extended research and interviews', 'Professional narrative structure', 'Suitable for commercial publishing'], popular: true },
              { title: 'Legacy Biography', desc: 'For organisations, families, institutions and large-scale legacy projects.', points: ['70 000+ words', 'Multi-source research', 'Archival and documentary support', 'Premium manuscript development'] },
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
                    Request Biography Quote
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
              <h2 className="font-heading text-3xl md:text-4xl font-bold text-[#0B1220] mb-4 leading-tight">Biography Writing Services FAQs</h2>
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
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-white mb-5 leading-tight">Ready to Preserve a Life Story?</h2>
            <p className="text-white/45 font-body text-sm leading-relaxed mb-10 max-w-lg mx-auto">Every extraordinary life deserves to be documented. Our biography writing team can help you preserve a story, honour a legacy and share it with the world.</p>
            <Link to="/getquote" className="inline-flex items-center gap-2 px-8 py-4 text-white text-sm font-semibold transition-all group" style={{ background: '#B8955B', boxShadow: '0 12px 32px rgba(184,149,91,0.35)', borderRadius: '8px' }}>
              Request a Biography Writing Quote <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
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