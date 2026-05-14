import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Check, ChevronDown, Plus, Minus, BookOpen, Eye, AlignLeft, Feather, Users, Shield, Star } from 'lucide-react';
import InternalLinks from '../../components/shared/InternalLinks';

// ─── FAQ Data ─────────────────────────────────────────────────────────────────
const faqs = [
  { q: 'What is the difference between proofreading and copy editing?', a: 'Proofreading focuses on final checks such as spelling, grammar, punctuation and minor errors. Copy editing goes deeper by improving clarity, sentence flow, consistency, readability and structure.' },
  { q: 'Do you edit fiction and non-fiction books?', a: 'Yes. Creative Books SA offers editing support for both fiction and non-fiction manuscripts. Structural editing is mainly recommended for fiction, while non-fiction manuscripts are usually handled through copy editing.' },
  { q: 'Do I need to send my manuscript as a Word document?', a: 'Yes. Manuscripts should be sent electronically as a Word document so the editor can work directly on the file.' },
  { q: 'How is editing pricing calculated?', a: 'Editing pricing is calculated per word based on the selected editing package.' },
  { q: 'Can you edit my book before printing?', a: 'Yes. We can edit your manuscript before it moves into typesetting, layout, cover design and printing.' },
  { q: 'Do you offer proofreading services in South Africa?', a: 'Yes. Creative Books SA offers proofreading and editing services for authors in Johannesburg and across South Africa.' },
];

const processSteps = [
  { num: '01', title: 'Choose A Package', body: 'Choose our editing package and unlock the full potential of your manuscript, transforming it into a polished masterpiece ready to captivate readers and stand out in the competitive literary landscape.' },
  { num: '02', title: 'Get A Quote', body: 'Request a quote and take the first step towards refining your manuscript into a professional, publishable work that showcases your unique voice and vision.' },
  { num: '03', title: 'Sign the Contract', body: 'Sign the contract to secure expert editing services that will elevate your manuscript to its fullest potential, ensuring it shines brightly in the eyes of readers and publishers alike.' },
  { num: '04', title: 'Send the Word Doc', body: 'Send us your manuscript in a Word document and let our experienced editors work their magic, transforming your writing into a polished masterpiece that exceeds your expectations.' },
  { num: '05', title: 'Editing and Review', body: 'Our editors review your manuscript according to the selected package, focusing on grammar, clarity, structure, consistency, sentence flow and overall readability.' },
  { num: '06', title: 'Sign-Off', body: 'Upon signing off on the project, witness your manuscript\'s transformation into a polished gem, meticulously refined through our editing package to showcase your unique voice and captivate readers from the very first page.' },
];

const authorTypes = [
  'Novel authors', 'Memoir writers', 'Christian authors', 'Poetry authors',
  'Business book authors', 'Inspirational writers', "Children's book authors",
  'Academic writers', 'Entrepreneurs', 'Coaches and speakers',
  'Pastors and ministry leaders', 'Self-published authors',
];

// ─── FAQ Accordion ────────────────────────────────────────────────────────────
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

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function BookEditing() {
  const [openFaq, setOpenFaq] = useState(null);

  return (
    <div style={{ background: '#f8f9fc' }}>

      {/* ── Hero ── */}
      <section className="relative min-h-[65vh] flex items-end overflow-hidden" style={{ background: 'linear-gradient(160deg, #090E18 0%, #0d1830 60%, #111827 100%)' }}>
        <div className="absolute top-0 left-0 w-[600px] h-[400px] pointer-events-none"
          style={{ background: 'radial-gradient(ellipse at 20% 30%, rgba(184,149,91,0.12) 0%, transparent 60%)', filter: 'blur(40px)' }} />
        <div className="absolute bottom-0 right-0 w-[500px] h-[300px] pointer-events-none"
          style={{ background: 'radial-gradient(ellipse at 80% 80%, rgba(100,130,220,0.08) 0%, transparent 60%)', filter: 'blur(60px)' }} />
        <div className="absolute top-0 left-0 right-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(184,149,91,0.6), transparent)' }} />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 pt-32 pb-20 w-full">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }} className="max-w-3xl">
            <span className="text-[#B8955B] text-xs font-body font-semibold tracking-[0.3em] uppercase mb-5 block">Book Editing Services · South Africa</span>
            <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 leading-[1.05]">
              Book Editors in<br /><span style={{ color: '#B8955B' }}>Johannesburg</span>
            </h1>
            <p className="text-white/60 text-base font-body mb-4 font-medium">Professional Book Editing, Proofreading and Manuscript Refinement for Authors</p>
            <p className="text-white/45 text-sm leading-relaxed font-body mb-10 max-w-2xl">
              Creative Books SA provides professional book editing services for authors who want their manuscripts to read clearly, flow naturally and feel ready for publication. Whether you are preparing a novel, memoir, Christian book, business book, poetry collection, inspirational title or non-fiction manuscript, our editing team helps refine your writing while preserving your unique voice.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link to="/getquote"
                className="inline-flex items-center gap-2 px-8 py-4 text-white text-sm font-semibold transition-all group"
                style={{ background: '#B8955B', boxShadow: '0 12px 32px rgba(184,149,91,0.35)', borderRadius: '8px' }}>
                Request an Editing Quote
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <a href="#pricing"
                className="inline-flex items-center gap-2 px-8 py-4 text-white/80 text-sm font-medium transition-all"
                style={{ border: '1px solid rgba(255,255,255,0.15)', borderRadius: '8px', background: 'rgba(255,255,255,0.04)' }}>
                View Editing Packages
                <ChevronDown className="w-4 h-4" />
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Trust Strip ── */}
      <section className="relative py-10 overflow-hidden" style={{ background: 'linear-gradient(135deg, #f0f4ff 0%, #eef1f7 100%)', borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { icon: BookOpen, title: 'Professional Manuscript Editing', body: 'Improve clarity, grammar, sentence flow and overall readability.' },
              { icon: Eye,      title: 'Proofreading and Copy Editing', body: 'Choose the right level of editing for your manuscript\'s needs.' },
              { icon: Users,    title: 'Support for South African Authors', body: 'Editing services for authors in Johannesburg and across South Africa.' },
              { icon: Shield,   title: 'Publishing-Ready Preparation', body: 'Prepare your manuscript for layout, printing and self-publishing.' },
            ].map((card, i) => {
              const Icon = card.icon;
              return (
                <motion.div key={card.title} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.07 }}
                  className="flex items-start gap-4 p-5"
                  style={{ background: 'rgba(255,255,255,0.78)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.95)', boxShadow: '0 4px 20px rgba(0,0,0,0.05), inset 0 1px 0 rgba(255,255,255,1)', borderRadius: '14px' }}>
                  <div className="w-9 h-9 flex items-center justify-center shrink-0" style={{ background: 'rgba(184,149,91,0.1)', border: '1px solid rgba(184,149,91,0.2)', borderRadius: '10px' }}>
                    <Icon className="w-4 h-4 text-[#B8955B]" strokeWidth={1.5} />
                  </div>
                  <div>
                    <h3 className="font-heading text-sm font-bold text-[#0B1220] mb-1">{card.title}</h3>
                    <p className="text-xs font-body text-[#2B2B2B]/55 leading-relaxed">{card.body}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Intro Section ── */}
      <section className="py-20 lg:py-28" style={{ background: '#F8F5EF' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="max-w-3xl">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
              <span className="text-[#B8955B] text-xs tracking-[0.3em] uppercase font-body block mb-5">Why Editing Matters</span>
              <h2 className="font-heading text-3xl md:text-4xl font-bold text-[#0B1220] mb-6 leading-tight">
                Book Editing Services for Authors in Johannesburg and South Africa
              </h2>
              <p className="text-[#2B2B2B]/60 font-body text-sm leading-relaxed mb-5">
                A strong book needs more than a good idea. It needs clear writing, consistent language, smooth sentence flow and a structure that keeps readers engaged. Creative Books SA helps authors refine their manuscripts before publishing so the final book feels professional, polished and ready for readers.
              </p>
              <p className="text-[#2B2B2B]/60 font-body text-sm leading-relaxed mb-5">
                Our book editing services are designed for authors who want honest, practical and professional support. Whether your manuscript only needs proofreading or requires deeper copy editing, our team helps improve the quality of your writing while keeping your voice, message and intention intact.
              </p>
              <p className="text-[#2B2B2B]/60 font-body text-sm leading-relaxed mb-8">
                If you are planning to self-publish, print your book or prepare it for digital publishing, professional editing is one of the most important steps in the process.
              </p>
              <Link to="/getquote"
                className="inline-flex items-center gap-2 px-7 py-3.5 text-white text-sm font-semibold transition-all group"
                style={{ background: '#0B1220', borderRadius: '8px', boxShadow: '0 8px 24px rgba(11,18,32,0.2)' }}>
                Request a Book Editing Quote
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── Main Services Section ── */}
      <section className="py-20 lg:py-28 overflow-hidden" style={{ background: 'linear-gradient(135deg, #f0f4ff 0%, #eef1f7 100%)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-14">
            <span className="text-[#B8955B] text-xs tracking-[0.3em] uppercase font-body block mb-4">Services</span>
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-[#0B1220] mb-3 leading-tight">Book Editing Packages South Africa</h2>
            <p className="text-[#2B2B2B]/55 font-body text-sm max-w-xl leading-relaxed">We offer proofreading and editing services in South Africa. Look no further than our team of experts — we offer top-notch quality services.</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            {[
              {
                icon: Eye, title: 'Proofreading', label: null,
                body: 'Proofreading is ideal for manuscripts that are already well-written but need final checks for spelling, grammar, punctuation and small language errors. This service helps clean up your manuscript before layout, printing or digital publishing.',
                best: ['Final manuscript polish', 'Grammar and spelling checks', 'Punctuation correction', 'Minor readability improvements'],
                cta: 'Request Proofreading Quote',
              },
              {
                icon: AlignLeft, title: 'Copy Editing', label: 'Non Fiction',
                body: 'Copy editing improves the clarity, consistency, flow and readability of your manuscript. It is ideal for non-fiction books, memoirs, inspirational books, Christian books, business books and other manuscripts that need language refinement and structure improvement.',
                best: ['Non-fiction manuscripts', 'Language consistency', 'Sentence flow', 'Redundancy reduction', 'Structure and clarity improvement'],
                cta: 'Request Copy Editing Quote',
                popular: true,
              },
              {
                icon: Feather, title: 'Structural Editing', label: 'Fiction',
                body: 'Structural editing is ideal for fiction manuscripts that need deeper feedback on story structure, plot development, characters, descriptions and overall narrative flow. This service helps strengthen the reading experience and improve the manuscript as a complete story.',
                best: ['Fiction manuscripts', 'Novels', 'Plot development', 'Character development', 'Story structure', 'Narrative flow'],
                cta: 'Request Structural Editing Quote',
              },
            ].map((svc, i) => {
              const Icon = svc.icon;
              return (
                <motion.div key={svc.title} initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                  className="relative flex flex-col overflow-hidden"
                  style={{
                    background: svc.popular ? 'linear-gradient(160deg, #ffffff 0%, #fdf9f4 100%)' : 'rgba(255,255,255,0.72)',
                    backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)',
                    border: svc.popular ? '1.5px solid rgba(184,149,91,0.5)' : '1px solid rgba(255,255,255,0.88)',
                    boxShadow: svc.popular ? '0 24px 60px rgba(184,149,91,0.15), inset 0 1px 0 rgba(255,255,255,1)' : '0 8px 32px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,1)',
                    borderRadius: '16px',
                  }}>
                  <div className="absolute top-0 left-4 right-4 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,1), transparent)' }} />
                  <div className="p-7 flex-1">
                    <div className="flex items-center gap-3 mb-5">
                      <div className="w-10 h-10 flex items-center justify-center" style={{ background: svc.popular ? 'rgba(184,149,91,0.12)' : 'rgba(11,18,32,0.05)', border: `1px solid ${svc.popular ? 'rgba(184,149,91,0.25)' : 'rgba(11,18,32,0.08)'}`, borderRadius: '10px' }}>
                        <Icon className="w-5 h-5" style={{ color: svc.popular ? '#B8955B' : '#0B1220' }} strokeWidth={1.5} />
                      </div>
                      <div>
                        <h3 className="font-heading text-base font-bold text-[#0B1220]">{svc.title}</h3>
                        {svc.label && <span className="text-[10px] font-body font-semibold tracking-[0.2em] uppercase text-[#B8955B]">{svc.label}</span>}
                      </div>
                    </div>
                    <p className="text-xs font-body text-[#2B2B2B]/60 leading-relaxed mb-5">{svc.body}</p>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.2em] font-body text-[#0B1220]/40 mb-3">Best for</p>
                    <ul className="space-y-2 mb-6">
                      {svc.best.map(b => (
                        <li key={b} className="flex items-center gap-2.5">
                          <div className="w-3.5 h-3.5 rounded-full flex items-center justify-center shrink-0" style={{ background: svc.popular ? 'rgba(184,149,91,0.12)' : 'rgba(11,18,32,0.06)', border: `1px solid ${svc.popular ? 'rgba(184,149,91,0.3)' : 'rgba(11,18,32,0.1)'}` }}>
                            <Check className="w-2 h-2" style={{ color: svc.popular ? '#B8955B' : '#0B1220' }} strokeWidth={3} />
                          </div>
                          <span className="text-xs font-body text-[#2B2B2B]/65">{b}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="px-7 pb-7">
                    <Link to="/getquote" className="block text-center py-3 text-sm font-semibold font-body transition-all"
                      style={svc.popular ? { background: 'linear-gradient(135deg, #0B1220, #1a2a4a)', color: '#fff', boxShadow: '0 8px 24px rgba(11,18,32,0.25)', borderRadius: '8px' } : { background: 'rgba(11,18,32,0.05)', color: '#0B1220', border: '1px solid rgba(11,18,32,0.12)', borderRadius: '8px' }}>
                      {svc.cta}
                    </Link>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Note */}
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
            className="px-7 py-5 flex items-start gap-4"
            style={{ background: 'rgba(255,255,255,0.72)', backdropFilter: 'blur(16px)', border: '1px solid rgba(184,149,91,0.2)', borderRadius: '12px', borderLeft: '3px solid #B8955B' }}>
            <div>
              <p className="text-xs font-body text-[#2B2B2B]/70 leading-relaxed">
                <span className="font-semibold text-[#0B1220]">Important note: </span>
                Structural editing is mainly recommended for fiction manuscripts such as novels. Non-fiction, memoirs, inspirational books and other genres are usually handled through copy editing, depending on the manuscript's needs.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Process Section ── */}
      <section className="py-20 lg:py-28" style={{ background: 'linear-gradient(160deg, #090E18 0%, #0d1830 100%)' }}>
        <div className="absolute top-0 left-0 right-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(184,149,91,0.4), transparent)' }} />
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-14">
            <span className="text-[#B8955B] text-xs tracking-[0.3em] uppercase font-body block mb-4">How It Works</span>
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-white mb-3 leading-tight">Our Book Editing Process</h2>
            <p className="text-white/40 font-body text-sm max-w-lg leading-relaxed">We follow a clear editing process to help authors understand what happens before, during and after the manuscript is edited.</p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {processSteps.map((step, i) => (
              <motion.div key={step.num} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}
                className="p-7"
                style={{ background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.08)', boxShadow: '0 8px 32px rgba(0,0,0,0.3)', borderRadius: '16px' }}>
                <div className="font-heading text-4xl font-bold mb-4" style={{ color: 'rgba(184,149,91,0.25)' }}>{step.num}</div>
                <h3 className="font-heading text-base font-bold text-white mb-3">{step.title}</h3>
                <p className="text-xs font-body text-white/45 leading-relaxed">{step.body}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pricing Section ── */}
      <section id="pricing" className="py-20 lg:py-28 overflow-hidden" style={{ background: 'linear-gradient(135deg, #f0f4ff 0%, #eef1f7 100%)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-14">
            <span className="text-[#B8955B] text-xs tracking-[0.3em] uppercase font-body block mb-4">Pricing</span>
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-[#0B1220] mb-2 leading-tight">Book Editing Pricing</h2>
            <p className="text-[#2B2B2B]/50 font-body text-sm">Save Time. Save Money.</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {[
              {
                title: 'Proofreading', category: null, price: '0.25c', popular: false,
                features: ['2x Drafts', 'Spell & Grammar Check', 'Suggestions', 'Best Interpretations'],
                cta: 'Request Proofreading Quote',
              },
              {
                title: 'Copy Editing', category: 'Non Fiction', price: '0.30c', popular: true,
                features: ['Developmental Editing (Initial Editing)', 'Ensures language consistency, redundancy & structure', 'Copy Editing (Secondary Editing)', 'Discussion & Feedback'],
                cta: 'Request Copy Editing Quote',
              },
              {
                title: 'Structural Editing', category: 'Fiction', price: '0.40c', popular: false,
                features: ['Structural editing', 'Comments on characters, plot development and descriptions', 'Line editing & refinery', '2x Drafts', 'Discussions & Feedback'],
                cta: 'Request Structural Editing Quote',
              },
            ].map((pkg, i) => (
              <motion.div key={pkg.title} initial={{ opacity: 0, y: 28 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                whileHover={{ y: -6, transition: { duration: 0.22 } }}
                className="relative flex flex-col overflow-hidden"
                style={{
                  background: pkg.popular ? 'linear-gradient(160deg, #ffffff 0%, #fdf9f4 100%)' : 'rgba(255,255,255,0.72)',
                  backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)',
                  border: pkg.popular ? '1.5px solid rgba(184,149,91,0.55)' : '1px solid rgba(255,255,255,0.88)',
                  boxShadow: pkg.popular ? '0 24px 60px rgba(184,149,91,0.18), inset 0 1px 0 rgba(255,255,255,1)' : '0 8px 32px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,1)',
                  borderRadius: '16px',
                }}>
                <div className="absolute top-0 left-4 right-4 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,1), transparent)' }} />
                <div className="p-7 flex-1">
                  <p className="text-[10px] font-semibold tracking-[0.25em] uppercase font-body mb-1" style={{ color: pkg.popular ? '#B8955B' : 'rgba(11,18,32,0.4)' }}>{pkg.title}</p>
                  {pkg.category && <p className="text-[10px] font-body text-[#2B2B2B]/40 mb-3">{pkg.category}</p>}
                  <div className="mb-1">
                    <span className="font-heading text-5xl font-bold text-[#0B1220]">{pkg.price}</span>
                  </div>
                  <p className="text-xs text-[#2B2B2B]/40 font-body mb-6">Per Word</p>
                  <div className="h-px mb-5" style={{ background: pkg.popular ? 'rgba(184,149,91,0.2)' : 'rgba(0,0,0,0.06)' }} />
                  <ul className="space-y-2.5 mb-6">
                    {pkg.features.map(f => (
                      <li key={f} className="flex items-start gap-2.5">
                        <div className="w-4 h-4 rounded-full flex items-center justify-center shrink-0 mt-0.5" style={{ background: pkg.popular ? 'rgba(184,149,91,0.12)' : 'rgba(11,18,32,0.06)', border: `1px solid ${pkg.popular ? 'rgba(184,149,91,0.3)' : 'rgba(11,18,32,0.1)'}` }}>
                          <Check className="w-2.5 h-2.5" style={{ color: pkg.popular ? '#B8955B' : '#0B1220' }} strokeWidth={2.5} />
                        </div>
                        <span className="text-xs font-body text-[#2B2B2B]/70 leading-relaxed">{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="px-7 pb-7">
                  <Link to="/getquote" className="block text-center py-3 text-sm font-semibold font-body transition-all"
                    style={pkg.popular ? { background: 'linear-gradient(135deg, #0B1220, #1a2a4a)', color: '#fff', boxShadow: '0 8px 24px rgba(11,18,32,0.25)', borderRadius: '8px' } : { background: 'rgba(11,18,32,0.05)', color: '#0B1220', border: '1px solid rgba(11,18,32,0.12)', borderRadius: '8px' }}>
                    {pkg.cta}
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Conversion nudge */}
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
            className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 px-8 py-6"
            style={{ background: 'rgba(255,255,255,0.72)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.9)', boxShadow: '0 4px 20px rgba(0,0,0,0.06)', borderRadius: '12px' }}>
            <div>
              <h2 className="font-heading text-lg font-bold text-[#0B1220] mb-1">Not Sure Which Editing Package Your Manuscript Needs?</h2>
              <p className="text-xs font-body text-[#2B2B2B]/60 leading-relaxed max-w-xl">Every manuscript is different. Send us your manuscript details and Creative Books SA will guide you on the most suitable editing option for your book.</p>
            </div>
            <Link to="/getquote"
              className="shrink-0 inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold text-white transition-all group"
              style={{ background: '#B8955B', borderRadius: '8px', boxShadow: '0 8px 20px rgba(184,149,91,0.3)' }}>
              Request an Editing Assessment
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ── Why Editing Matters ── */}
      <section className="py-20 lg:py-28" style={{ background: '#F8F5EF' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-12">
            <span className="text-[#B8955B] text-xs tracking-[0.3em] uppercase font-body block mb-4">Why It Matters</span>
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-[#0B1220] mb-5 leading-tight max-w-2xl">Why Book Editing Matters Before Publishing</h2>
            <p className="text-[#2B2B2B]/60 font-body text-sm leading-relaxed max-w-2xl mb-4">
              Readers notice when a book has not been edited properly. Grammar errors, unclear sentences, weak structure and inconsistent language can distract from your message and reduce the credibility of your book.
            </p>
            <p className="text-[#2B2B2B]/60 font-body text-sm leading-relaxed max-w-2xl">
              For self-published authors, editing is especially important because your book represents your name, your story and your brand. A polished manuscript gives your book a better chance of connecting with readers and standing confidently in the market.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              { icon: Star,   title: 'Clarity',           body: 'Editing helps your message become easier to understand and more enjoyable to read.' },
              { icon: Shield, title: 'Credibility',        body: 'A professionally edited book gives readers more confidence in your work.' },
              { icon: BookOpen, title: 'Reader Experience', body: 'Good editing improves flow, structure and consistency from the first page to the last.' },
            ].map((card, i) => {
              const Icon = card.icon;
              return (
                <motion.div key={card.title} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}
                  className="p-7"
                  style={{ background: 'rgba(255,255,255,0.78)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.95)', boxShadow: '0 4px 20px rgba(0,0,0,0.06)', borderRadius: '14px' }}>
                  <div className="w-10 h-10 flex items-center justify-center mb-5" style={{ background: 'rgba(184,149,91,0.1)', border: '1px solid rgba(184,149,91,0.2)', borderRadius: '10px' }}>
                    <Icon className="w-5 h-5 text-[#B8955B]" strokeWidth={1.5} />
                  </div>
                  <h3 className="font-heading text-base font-bold text-[#0B1220] mb-2">{card.title}</h3>
                  <p className="text-xs font-body text-[#2B2B2B]/55 leading-relaxed">{card.body}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Who We Edit For ── */}
      <section className="py-20 lg:py-24 overflow-hidden" style={{ background: 'linear-gradient(135deg, #f0f4ff 0%, #eef1f7 100%)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-10">
            <span className="text-[#B8955B] text-xs tracking-[0.3em] uppercase font-body block mb-4">Author Types</span>
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-[#0B1220] mb-3 leading-tight">Editing Services for Different Types of Authors</h2>
            <p className="text-[#2B2B2B]/55 font-body text-sm max-w-xl leading-relaxed">Creative Books SA supports authors across different genres and publishing goals. Whether your book is personal, professional, creative or educational, we help you prepare your manuscript for the next stage of publishing.</p>
          </motion.div>
          <div className="flex flex-wrap gap-2">
            {authorTypes.map((type, i) => (
              <motion.span key={type} initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: i * 0.04 }}
                className="px-4 py-2 text-xs font-body font-medium text-[#0B1220]"
                style={{ background: 'rgba(255,255,255,0.75)', backdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,0.9)', boxShadow: '0 2px 12px rgba(0,0,0,0.05)', borderRadius: '6px' }}>
                {type}
              </motion.span>
            ))}
          </div>
        </div>
      </section>

      {/* ── SEO Section ── */}
      <section className="py-20" style={{ background: '#F8F5EF' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="max-w-3xl">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
              <span className="text-[#B8955B] text-xs tracking-[0.3em] uppercase font-body block mb-5">Johannesburg Editors</span>
              <h2 className="font-heading text-3xl md:text-4xl font-bold text-[#0B1220] mb-6 leading-tight">Professional Book Editors in Johannesburg</h2>
              <p className="text-[#2B2B2B]/60 font-body text-sm leading-relaxed mb-5">
                If you are looking for book editors in Johannesburg, Creative Books SA provides professional editing and proofreading services for authors who want to prepare their manuscripts for publication. We help improve grammar, readability, structure, consistency and overall manuscript quality.
              </p>
              <p className="text-[#2B2B2B]/60 font-body text-sm leading-relaxed mb-8">
                Our editing services are suitable for authors in Johannesburg, Gauteng and across South Africa. Whether you need proofreading, copy editing or fiction structural editing, our team can help you refine your manuscript before book design, typesetting, printing or ebook publishing.
              </p>
              <Link to="/getquote"
                className="inline-flex items-center gap-2 px-7 py-3.5 text-white text-sm font-semibold transition-all group"
                style={{ background: '#B8955B', borderRadius: '8px', boxShadow: '0 8px 24px rgba(184,149,91,0.3)' }}>
                Start Your Editing Quote
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="py-20 lg:py-28 overflow-hidden" style={{ background: 'linear-gradient(135deg, #f0f4ff 0%, #eef1f7 100%)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
            <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="lg:sticky lg:top-28">
              <span className="text-[#B8955B] text-xs tracking-[0.3em] uppercase font-body block mb-5">FAQ</span>
              <h2 className="font-heading text-3xl md:text-4xl font-bold text-[#0B1220] mb-4 leading-tight">Book Editing Services FAQs</h2>
              <p className="text-[#2B2B2B]/55 font-body text-sm leading-relaxed max-w-sm">Have more questions about our editing services? Contact us for a personalised answer.</p>
              <div className="mt-6 h-px w-24" style={{ background: '#B8955B' }} />
            </motion.div>
            <div className="space-y-2">
              {faqs.map((faq, i) => (
                <motion.div key={faq.q} initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.06 }}>
                  <FAQItem faq={faq} i={i} open={openFaq} setOpen={setOpenFaq} />
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section className="relative py-20 overflow-hidden" style={{ background: 'linear-gradient(160deg, #090E18 0%, #0d1830 100%)' }}>
        <div className="absolute top-0 left-0 right-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(184,149,91,0.5), transparent)' }} />
        <div className="absolute bottom-0 left-0 right-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(184,149,91,0.2), transparent)' }} />
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[600px] h-[400px] pointer-events-none"
          style={{ background: 'radial-gradient(ellipse, rgba(184,149,91,0.07) 0%, transparent 65%)', filter: 'blur(60px)' }} />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <span className="text-[#B8955B] text-xs tracking-[0.3em] uppercase font-body block mb-6">Ready to Refine?</span>
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-white mb-5 leading-tight">Ready to Refine Your Manuscript?</h2>
            <p className="text-white/45 font-body text-sm leading-relaxed mb-10 max-w-lg mx-auto">
              Your manuscript deserves professional attention before it becomes a published book. Whether you need proofreading, copy editing or structural editing for fiction, Creative Books SA can help you prepare your book with clarity, confidence and care.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link to="/getquote"
                className="inline-flex items-center gap-2 px-8 py-4 text-white text-sm font-semibold transition-all group"
                style={{ background: '#B8955B', boxShadow: '0 12px 32px rgba(184,149,91,0.35)', borderRadius: '8px' }}>
                Request an Editing Quote
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link to="/publishingpackages"
                className="inline-flex items-center gap-2 px-8 py-4 text-white/70 text-sm transition-all"
                style={{ border: '1px solid rgba(255,255,255,0.12)', borderRadius: '8px', background: 'rgba(255,255,255,0.04)' }}>
                View Publishing Packages
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      <InternalLinks links={[
        { label: 'Book Printing Johannesburg', path: '/bookprintingjohannesburg' },
        { label: 'Book Cover Design', path: '/bookcoverdesign' },
        { label: 'Typesetting and Layout', path: '/typesetting' },
        { label: 'Self Publishing South Africa', path: '/selfpublishingsouthafrica' },
        { label: 'Publishing Packages', path: '/publishingpackages' },
        { label: 'Request a Quote', path: '/getquote' },
      ]} light />

      {/* FAQ Schema */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": faqs.map(f => ({
          "@type": "Question",
          "name": f.q,
          "acceptedAnswer": { "@type": "Answer", "text": f.a }
        }))
      }) }} />
    </div>
  );
}