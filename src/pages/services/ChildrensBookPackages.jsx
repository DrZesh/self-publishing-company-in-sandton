import React, { useState } from 'react';
import PageMeta from '../../components/shared/PageMeta';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Check, Plus, Minus, Award } from 'lucide-react';
import InternalLinks from '../../components/shared/InternalLinks';

const packages = [
  {
    title: 'Package 1',
    price: 'R15,000',
    badge: null,
    includes: ['Full Cover Design', 'Scenery', '3 Main Characters', 'Additional Characters', '15 Spread Pages', 'Ready Print Files'],
  },
  {
    title: 'Package 2',
    price: 'R25,000',
    badge: 'Recommended',
    popular: true,
    includes: ['Full Cover Design', 'Text Layout', 'Simple Background', 'Scenery', '3 Main Characters', 'Additional Characters', '25 to 30 Pages', 'Ready Print Files'],
  },
  {
    title: 'Package 3',
    price: 'R45,000',
    badge: 'Premium',
    includes: ['Detailed Drawings', 'Full Cover Design', 'Text Layout', 'Scenery', '5 Main Characters', 'Additional Characters', 'Up to 45 Pages', 'Book Mockups', 'Ready Print Files'],
  },
];

const comparisonData = [
  { feature: 'Price', p1: 'R15,000', p2: 'R25,000', p3: 'R45,000' },
  { feature: 'Characters', p1: '3 Main', p2: '3 Main', p3: '5 Main' },
  { feature: 'Pages', p1: '15 Spread Pages', p2: '25–30 Pages', p3: 'Up to 45 Pages' },
  { feature: 'Text Layout', p1: '—', p2: '✓', p3: '✓' },
  { feature: 'Book Mockups', p1: '—', p2: '—', p3: '✓' },
  { feature: 'Ready Print Files', p1: '✓', p2: '✓', p3: '✓' },
];

const faqs = [
  { q: 'What is included in a children\'s book illustration package?', a: 'Each package includes cover design, character development, scenery and spread page illustrations. Higher packages include text layout, more pages, more characters, book mockups and detailed drawing styles.' },
  { q: 'How many characters can be included?', a: 'Package 1 and Package 2 include 3 main characters plus additional characters. Package 3 includes 5 main characters plus additional characters. Character complexity and detail increase with each package.' },
  { q: 'How long does children\'s book illustration take?', a: 'Timelines depend on the package selected and the complexity of the illustrations. A children\'s book illustration project typically takes 6 to 12 weeks from brief approval to final print-ready files.' },
  { q: 'What do I need to provide before illustration starts?', a: 'You need to provide your completed story text, character descriptions, setting descriptions, any reference images you have in mind and your preferred visual style or mood. The more detailed your brief, the more aligned the illustrations will be.' },
  { q: 'Will I receive print-ready files?', a: 'Yes. All packages include ready print files in the appropriate format for book printing or digital publishing.' },
  { q: 'Do you illustrate children\'s books for self-published authors?', a: 'Yes. Creative Books SA provides illustration services for self-published children\'s book authors in South Africa and internationally.' },
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

export default function ChildrensBookPackages() {
  const [openFaq, setOpenFaq] = useState(null);
  const [selected, setSelected] = useState(null);

  return (
    <div style={{ background: '#f8f9fc' }}>
      <PageMeta
        title="Children's Book Publishing Packages South Africa"
        description="Children's book publishing packages for SA authors — illustration coordination, full-colour printing in 15×15, 20×20, 21×21cm formats. Free quote."
        canonical="https://www.creativebooks.co.za/childrensbookpackages"
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
            <span className="text-[#B8955B] text-xs font-body font-semibold tracking-[0.3em] uppercase mb-5 block">Children's Book Illustration · South Africa</span>
            <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 leading-[1.05]">
              Children's Book Publishing Packages
            </h1>
            <p className="text-white/60 text-base font-body mb-5 font-medium">Professional Children's Book Illustration, Character Development and Print-Ready Files</p>
            <p className="text-white/45 text-sm leading-relaxed font-body mb-10 max-w-2xl">
              Creative Books SA helps children's book authors bring their stories to life through professional illustration, character development, scenery, cover design, text layout and print-ready files. Whether you are creating your first children's book or preparing a polished illustrated title for publishing, our children's book packages give you a clear path from story concept to finished book files.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link to="/getquote" className="inline-flex items-center gap-2 px-8 py-4 text-white text-sm font-semibold transition-all group" style={{ background: '#B8955B', boxShadow: '0 12px 32px rgba(184,149,91,0.35)', borderRadius: '8px' }}>
                Request an Illustration Quote <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <a href="#pricing" className="inline-flex items-center gap-2 px-8 py-4 text-white/80 text-sm font-medium" style={{ border: '1px solid rgba(255,255,255,0.15)', borderRadius: '8px', background: 'rgba(255,255,255,0.04)' }}>
                View Illustration Packages
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20 lg:py-28 overflow-hidden" style={{ background: 'linear-gradient(135deg, #f0f4ff 0%, #eef1f7 100%)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-14">
            <span className="text-[#B8955B] text-xs tracking-[0.3em] uppercase font-body block mb-4">Illustration Packages</span>
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-[#0B1220] mb-2 leading-tight">Children's Book Illustration Packages</h2>
            <p className="text-[#2B2B2B]/50 font-body text-sm">Select a package to see full details. Click a card to mark it as selected.</p>
          </motion.div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-10">
            {packages.map((pkg, i) => {
              const isSelected = selected === i;
              return (
                <motion.div key={pkg.title}
                  initial={{ opacity: 0, y: 28 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08 }}
                  whileHover={{ y: -8, transition: { duration: 0.2 } }}
                  onClick={() => setSelected(isSelected ? null : i)}
                  className="relative flex flex-col overflow-hidden h-full cursor-pointer"
                  style={{
                    background: isSelected ? 'linear-gradient(160deg, #0B1220 0%, #1a2a4a 100%)' : pkg.popular ? 'linear-gradient(160deg, #ffffff 0%, #fdf9f4 100%)' : 'rgba(255,255,255,0.72)',
                    backdropFilter: 'blur(24px)',
                    border: isSelected ? '1.5px solid rgba(184,149,91,0.8)' : pkg.popular ? '1.5px solid rgba(184,149,91,0.55)' : '1px solid rgba(255,255,255,0.88)',
                    boxShadow: isSelected ? '0 24px 60px rgba(11,18,32,0.4), 0 0 0 2px rgba(184,149,91,0.3)' : pkg.popular ? '0 24px 60px rgba(184,149,91,0.18)' : '0 8px 32px rgba(0,0,0,0.06)',
                    borderRadius: '16px',
                    transition: 'all 0.25s ease',
                  }}>
                  {isSelected && (
                    <div className="absolute top-0 left-0 right-0 flex justify-center">
                      <span className="inline-block px-4 py-1.5 text-[10px] font-semibold tracking-[0.15em] uppercase rounded-b-lg" style={{ background: '#B8955B', color: '#fff' }}>Selected Package</span>
                    </div>
                  )}
                  {!isSelected && pkg.badge && (
                    <div className="absolute top-4 right-4">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 text-[10px] font-semibold tracking-[0.15em] uppercase" style={{ background: 'linear-gradient(135deg, #0B1220 0%, #1a2a4a 100%)', color: '#D4AF72', border: '1px solid rgba(212,175,114,0.3)', borderRadius: '4px' }}>
                        <Award className="w-2.5 h-2.5" />{pkg.badge}
                      </span>
                    </div>
                  )}
                  <div className={`p-7 flex-1 ${isSelected ? 'pt-10' : ''}`}>
                    <p className="text-[10px] font-semibold tracking-[0.25em] uppercase font-body mb-3" style={{ color: isSelected ? 'rgba(184,149,91,0.8)' : pkg.popular ? '#B8955B' : 'rgba(11,18,32,0.4)' }}>{pkg.title}</p>
                    <span className="font-heading text-4xl font-bold" style={{ color: isSelected ? '#fff' : '#0B1220' }}>{pkg.price}</span>
                    <div className="h-px my-5" style={{ background: isSelected ? 'rgba(255,255,255,0.08)' : pkg.popular ? 'rgba(184,149,91,0.2)' : 'rgba(0,0,0,0.06)' }} />
                    <ul className="space-y-2">
                      {pkg.includes.map(f => (
                        <li key={f} className="flex items-start gap-2.5">
                          <div className="w-4 h-4 rounded-full flex items-center justify-center shrink-0 mt-0.5" style={{ background: isSelected ? 'rgba(184,149,91,0.2)' : pkg.popular ? 'rgba(184,149,91,0.12)' : 'rgba(11,18,32,0.06)', border: `1px solid ${isSelected || pkg.popular ? 'rgba(184,149,91,0.4)' : 'rgba(11,18,32,0.1)'}` }}>
                            <Check className="w-2.5 h-2.5" style={{ color: isSelected || pkg.popular ? '#B8955B' : '#0B1220' }} strokeWidth={2.5} />
                          </div>
                          <span className="text-xs font-body" style={{ color: isSelected ? 'rgba(255,255,255,0.7)' : 'rgba(43,43,43,0.7)' }}>{f}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="p-7 pt-0">
                    <Link to="/getquote" onClick={e => e.stopPropagation()} className="block text-center py-3 text-sm font-semibold font-body transition-all"
                      style={isSelected ? { background: '#B8955B', color: '#fff', boxShadow: '0 8px 24px rgba(184,149,91,0.35)', borderRadius: '8px' } : pkg.popular ? { background: 'linear-gradient(135deg, #0B1220, #1a2a4a)', color: '#fff', boxShadow: '0 8px 24px rgba(11,18,32,0.25)', borderRadius: '8px' } : { background: 'rgba(11,18,32,0.05)', color: '#0B1220', border: '1px solid rgba(11,18,32,0.12)', borderRadius: '8px' }}>
                      Choose {pkg.title}
                    </Link>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Comparison Table */}
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="overflow-x-auto rounded-2xl" style={{ border: '1px solid rgba(255,255,255,0.9)', boxShadow: '0 8px 32px rgba(0,0,0,0.06)' }}>
            <table className="w-full text-sm">
              <thead>
                <tr style={{ background: 'rgba(11,18,32,0.05)' }}>
                  <th className="text-left px-6 py-4 font-heading text-xs font-bold text-[#0B1220] tracking-[0.1em] uppercase">Feature</th>
                  <th className="text-center px-6 py-4 font-heading text-xs font-bold text-[#0B1220] tracking-[0.1em] uppercase">Package 1</th>
                  <th className="text-center px-6 py-4 font-heading text-xs font-bold text-[#B8955B] tracking-[0.1em] uppercase">Package 2</th>
                  <th className="text-center px-6 py-4 font-heading text-xs font-bold text-[#0B1220] tracking-[0.1em] uppercase">Package 3</th>
                </tr>
              </thead>
              <tbody style={{ background: 'rgba(255,255,255,0.85)' }}>
                {comparisonData.map((row, i) => (
                  <tr key={row.feature} style={{ borderTop: '1px solid rgba(0,0,0,0.05)', background: i % 2 === 0 ? 'rgba(255,255,255,0.85)' : 'rgba(248,245,239,0.8)' }}>
                    <td className="px-6 py-3.5 font-body text-xs font-semibold text-[#0B1220]/70">{row.feature}</td>
                    <td className="px-6 py-3.5 text-center font-body text-xs text-[#2B2B2B]/65">{row.p1}</td>
                    <td className="px-6 py-3.5 text-center font-body text-xs font-semibold text-[#B8955B]">{row.p2}</td>
                    <td className="px-6 py-3.5 text-center font-body text-xs text-[#2B2B2B]/65">{row.p3}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </motion.div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 lg:py-28 overflow-hidden" style={{ background: '#F8F5EF' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
            <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="lg:sticky lg:top-28">
              <span className="text-[#B8955B] text-xs tracking-[0.3em] uppercase font-body block mb-5">FAQ</span>
              <h2 className="font-heading text-3xl md:text-4xl font-bold text-[#0B1220] mb-4 leading-tight">Children's Book Illustration FAQs</h2>
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
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-white mb-5 leading-tight">Ready to Bring Your Children's Book to Life?</h2>
            <p className="text-white/45 font-body text-sm leading-relaxed mb-10 max-w-lg mx-auto">Your children's story deserves beautiful illustrations. Request a personalised illustration quote from our team today.</p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link to="/getquote" className="inline-flex items-center gap-2 px-8 py-4 text-white text-sm font-semibold transition-all group" style={{ background: '#B8955B', boxShadow: '0 12px 32px rgba(184,149,91,0.35)', borderRadius: '8px' }}>
                Request an Illustration Quote <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link to="/publishingpackages" className="inline-flex items-center gap-2 px-8 py-4 text-white/70 text-sm" style={{ border: '1px solid rgba(255,255,255,0.12)', borderRadius: '8px', background: 'rgba(255,255,255,0.04)' }}>
                View Publishing Packages
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      <InternalLinks links={[
        { label: 'Book Cover Design', path: '/bookcoverdesign' },
        { label: 'Book Layout & Typesetting', path: '/typesetting' },
        { label: 'eBook Formatting', path: '/ebookpublishing' },
        { label: 'Publishing Packages', path: '/publishingpackages' },
        { label: 'Request a Quote', path: '/getquote' },
      ]} light />
    </div>
  );
}