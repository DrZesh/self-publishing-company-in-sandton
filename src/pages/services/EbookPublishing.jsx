import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Check, Plus, Minus, Award, Smartphone, Globe, BookOpen } from 'lucide-react';
import InternalLinks from '../../components/shared/InternalLinks';
import PageMeta from '../../components/shared/PageMeta';

const packages = [
  {
    title: 'Ebook',
    price: 'R6,500',
    badge: null,
    popular: false,
    description: 'Create and publish your new eBook on Amazon!',
    includes: ['eBook & Print Ready Manuscript', 'Layout / Typesetting', '150 Pages Max'],
    cta: 'Choose Ebook Package',
  },
  {
    title: 'PaperBack',
    price: 'R8,500',
    badge: null,
    popular: false,
    description: 'Professional & print-ready paperback!',
    includes: ['Layout / Typesetting', 'Ebook Ready Manuscript', '250 Pages Max'],
    cta: 'Choose Paperback Package',
  },
  {
    title: 'Plus',
    price: 'R12,500',
    badge: 'Premium',
    popular: true,
    description: 'Design and publish both eBook and paperback editions!',
    includes: ['Ebook Cover Design', 'Interior Layout for Print', 'eBook Conversion', '350 Pages Max'],
    cta: 'Choose Plus Package',
  },
];

const faqs = [
  { q: 'What is eBook formatting?', a: 'eBook formatting is the process of converting your manuscript into a digital book file (typically EPUB or MOBI format) that displays correctly on eReaders, tablets and phones across platforms like Amazon Kindle, Apple Books and Kobo.' },
  { q: 'Can South African authors publish on Amazon?', a: 'Yes. South African authors can publish on Amazon KDP (Kindle Direct Publishing). We assist with account setup, file formatting and uploading your book to Amazon for both Kindle and paperback editions.' },
  { q: 'What is the difference between an ebook and a paperback layout?', a: 'An ebook is a reflowable digital file optimised for screens. A paperback layout is a fixed-format print-ready PDF designed for physical printing. Both require professional formatting to ensure quality presentation.' },
  { q: 'Do you design ebook covers?', a: 'Yes. Our Plus package includes ebook cover design. We also offer standalone ebook cover design through our Book Cover Design service.' },
  { q: 'How long does eBook formatting take?', a: 'eBook formatting typically takes 5 to 10 business days depending on manuscript length and complexity. Paperback layout may take slightly longer.' },
  { q: 'What file format should I send my manuscript in?', a: 'Send your manuscript as a Microsoft Word (.docx) file. This is the most common and easiest format for us to work from when formatting your ebook or paperback layout.' },
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

export default function EbookPublishing() {
  const [openFaq, setOpenFaq] = useState(null);

  return (
    <div style={{ background: '#f8f9fc' }}>
      <PageMeta
        title="Ebook Publishing in South Africa | Creative Books SA"
        description="Publish your ebook in South Africa on Amazon Kindle, Apple Books & more. Conversion, cover & upload handled for you. Reach global readers. Get a quote."
        canonical="https://creativebooks.co.za/ebook-publishing"
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
            <span className="text-[#B8955B] text-xs font-body font-semibold tracking-[0.3em] uppercase mb-5 block">eBook Formatting and Publishing · South Africa</span>
            <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 leading-[1.05]">
              Ebook Publishing in South Africa
            </h1>
            <p className="text-white/60 text-base font-body mb-5 font-medium">Professional eBook Formatting, Conversion, Paperback Layout and Amazon Publishing Support</p>
            <p className="text-white/45 text-sm leading-relaxed font-body mb-10 max-w-2xl">
              Creative Books SA helps authors prepare professional ebooks and print-ready manuscripts for digital and paperback publishing. Whether you want to publish your book on Amazon, convert your manuscript into an ebook, design an ebook cover or prepare both ebook and paperback editions, our team can help you package your book professionally.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link to="/getquote" className="inline-flex items-center gap-2 px-8 py-4 text-white text-sm font-semibold transition-all group" style={{ background: '#B8955B', boxShadow: '0 12px 32px rgba(184,149,91,0.35)', borderRadius: '8px' }}>
                Request an eBook Quote <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link to="/printing/a5" className="inline-flex items-center gap-2 px-8 py-4 text-white/80 text-sm font-medium" style={{ border: '1px solid rgba(255,255,255,0.15)', borderRadius: '8px', background: 'rgba(255,255,255,0.04)' }}>
                I Need to Print My Book
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-20 lg:py-28 overflow-hidden" style={{ background: 'linear-gradient(135deg, #f0f4ff 0%, #eef1f7 100%)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-12">
            <span className="text-[#B8955B] text-xs tracking-[0.3em] uppercase font-body block mb-4">Why It Matters</span>
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-[#0B1220] mb-3 leading-tight">Why Professional eBook Formatting Matters</h2>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              { icon: Smartphone, title: 'Device-Ready Formatting', body: 'Professional eBook formatting ensures your book displays correctly on all devices — Kindle, iPad, phone, tablet and desktop — without formatting errors.' },
              { icon: Globe, title: 'Amazon and Global Platforms', body: 'We prepare your manuscript for Amazon KDP, Apple Books, Kobo and other major digital publishing platforms so South African authors can reach a global readership.' },
              { icon: BookOpen, title: 'Print and Digital Together', body: 'Our Plus package covers both ebook and paperback editions, giving you a complete publishing solution for print and digital distribution.' },
            ].map((card, i) => {
              const Icon = card.icon;
              return (
                <motion.div key={card.title} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}
                  className="p-7" style={{ background: 'rgba(255,255,255,0.78)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.95)', boxShadow: '0 4px 20px rgba(0,0,0,0.06)', borderRadius: '14px' }}>
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

      {/* Pricing */}
      <section id="pricing" className="py-20 lg:py-28 overflow-hidden" style={{ background: 'linear-gradient(160deg, #090E18 0%, #0d1830 100%)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-14">
            <span className="text-[#B8955B] text-xs tracking-[0.3em] uppercase font-body block mb-4">Publishing Packages</span>
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-white mb-2 leading-tight">eBook Packages</h2>
            <p className="text-white/45 font-body text-sm">Professional eBook formatting and publishing packages</p>
          </motion.div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {packages.map((pkg, i) => (
              <motion.div key={pkg.title} initial={{ opacity: 0, y: 28 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}
                whileHover={{ y: -6, transition: { duration: 0.2 } }}
                className="relative flex flex-col overflow-hidden h-full"
                style={{
                  background: pkg.popular ? 'linear-gradient(160deg, #ffffff 0%, #fdf9f4 100%)' : 'rgba(255,255,255,0.06)',
                  backdropFilter: 'blur(24px)',
                  border: pkg.popular ? '1.5px solid rgba(184,149,91,0.55)' : '1px solid rgba(255,255,255,0.1)',
                  boxShadow: pkg.popular ? '0 24px 60px rgba(184,149,91,0.2)' : '0 8px 32px rgba(0,0,0,0.4)',
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
                  <p className="text-[10px] font-semibold tracking-[0.25em] uppercase font-body mb-3" style={{ color: pkg.popular ? '#B8955B' : 'rgba(255,255,255,0.4)' }}>{pkg.title}</p>
                  <span className="font-heading text-4xl font-bold" style={{ color: pkg.popular ? '#0B1220' : '#fff' }}>{pkg.price}</span>
                  <p className="text-xs font-body mt-2 mb-5" style={{ color: pkg.popular ? 'rgba(0,0,0,0.45)' : 'rgba(255,255,255,0.4)' }}>{pkg.description}</p>
                  <div className="h-px mb-5" style={{ background: pkg.popular ? 'rgba(184,149,91,0.2)' : 'rgba(255,255,255,0.08)' }} />
                  <ul className="space-y-2">
                    {pkg.includes.map(f => (
                      <li key={f} className="flex items-start gap-2.5">
                        <div className="w-4 h-4 rounded-full flex items-center justify-center shrink-0 mt-0.5" style={{ background: pkg.popular ? 'rgba(184,149,91,0.12)' : 'rgba(255,255,255,0.08)', border: `1px solid ${pkg.popular ? 'rgba(184,149,91,0.3)' : 'rgba(255,255,255,0.15)'}` }}>
                          <Check className="w-2.5 h-2.5" style={{ color: pkg.popular ? '#B8955B' : 'rgba(255,255,255,0.7)' }} strokeWidth={2.5} />
                        </div>
                        <span className="text-xs font-body" style={{ color: pkg.popular ? 'rgba(11,18,32,0.7)' : 'rgba(255,255,255,0.6)' }}>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="p-7 pt-0">
                  <Link to="/getquote" className="block text-center py-3 text-sm font-semibold font-body transition-all"
                    style={pkg.popular ? { background: 'linear-gradient(135deg, #0B1220, #1a2a4a)', color: '#fff', boxShadow: '0 8px 24px rgba(11,18,32,0.3)', borderRadius: '8px' } : { background: 'rgba(184,149,91,0.15)', color: '#B8955B', border: '1px solid rgba(184,149,91,0.3)', borderRadius: '8px' }}>
                    {pkg.cta}
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 lg:py-28 overflow-hidden" style={{ background: 'linear-gradient(135deg, #f0f4ff 0%, #eef1f7 100%)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
            <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="lg:sticky lg:top-28">
              <span className="text-[#B8955B] text-xs tracking-[0.3em] uppercase font-body block mb-5">FAQ</span>
              <h2 className="font-heading text-3xl md:text-4xl font-bold text-[#0B1220] mb-4 leading-tight">eBook Formatting and Publishing FAQs</h2>
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
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-white mb-5 leading-tight">Ready to Publish Your eBook Professionally?</h2>
            <p className="text-white/45 font-body text-sm leading-relaxed mb-10 max-w-lg mx-auto">Your book deserves professional formatting and a strong digital presence. Request a personalised eBook publishing quote from our team today.</p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link to="/getquote" className="inline-flex items-center gap-2 px-8 py-4 text-white text-sm font-semibold transition-all group" style={{ background: '#B8955B', boxShadow: '0 12px 32px rgba(184,149,91,0.35)', borderRadius: '8px' }}>
                Request an eBook Quote <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link to="/book-cover-design" className="inline-flex items-center gap-2 px-8 py-4 text-white/70 text-sm" style={{ border: '1px solid rgba(255,255,255,0.12)', borderRadius: '8px', background: 'rgba(255,255,255,0.04)' }}>
                Book Cover Design
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      <InternalLinks links={[
      { label: 'Book Cover Design', path: '/book-cover-design' },
      { label: 'Book Layout & Typesetting', path: '/typesetting' },
      { label: 'I Need a Complete Package', path: '/self-publishing-packages-in-south-africa' },
      { label: 'Self Publishing South Africa', path: '/self-publishing-south-africa' },
      { label: 'Request a Quote', path: '/getquote' },
      ]} light />
    </div>
  );
}