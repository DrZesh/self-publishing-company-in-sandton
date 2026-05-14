import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Check, Plus, Minus, Award, BookOpen, Printer, Layout, Star, Clock, Users } from 'lucide-react';
import InternalLinks from '../../components/shared/InternalLinks';

// ─── Data ─────────────────────────────────────────────────────────────────────

const trustCards = [
  { icon: BookOpen, title: 'Complete Book Production', body: 'Editing, cover design, layout, printing and publishing support in one package.' },
  { icon: Clock, title: 'Once-Off Package Pricing', body: 'Clear once-off pricing so authors can plan their publishing budget properly.' },
  { icon: Users, title: 'Designed for South African Authors', body: 'Professional self publishing support for authors across Johannesburg, Gauteng and South Africa.' },
  { icon: Printer, title: 'Print and Launch Ready', body: 'Packages include printed copies, mockups and selected launch design assets.' },
];

const includedCards = [
  { title: 'Book Cover Design', body: 'Professional cover design with two concepts to help your book look attractive, credible and market-ready.' },
  { title: 'Editing Support', body: 'Editing support with two drafts to help refine grammar, readability, structure and overall manuscript quality.' },
  { title: 'Book Layout', body: 'Interior book layout to transform your manuscript into a clean, readable and professionally formatted book.' },
  { title: 'Printed Copies', body: 'Printed A5 book copies included in each package, with quantity depending on the selected package.' },
  { title: 'Cream Paper', body: 'Cream paper gives the book a softer, professional reading feel and is suitable for novels, memoirs, poetry books and many non-fiction titles.' },
  { title: 'Launch Design Assets', body: 'Selected packages include Facebook banner design, book mockups or roll up banner design and print to support your launch and promotion.' },
];

const packages = [
  {
    title: 'Bronze',
    price: 'R21,000',
    badge: null,
    popular: false,
    billing: 'Once Off',
    bestFor: 'First-time authors who need an affordable full publishing package with essential book production services.',
    includes: [
      'A5', '100 Copies', 'Book Cover Design (2x Concepts)', 'Editing (2x Drafts)',
      '150 Pages Max', 'Book Layout', 'Cream Paper', 'Black and White Inners',
      'Facebook Banner Design', 'Book Mockups', 'Publishing Consultation & Guidance',
    ],
    cta: 'Choose Bronze Package',
  },
  {
    title: 'Silver',
    price: 'R25,500',
    badge: 'Popular',
    popular: true,
    billing: 'Once Off',
    bestFor: 'Authors who need more printed copies, a higher page limit and stronger layout support.',
    includes: [
      'A5', '150 Copies', 'Book Cover Design (2x Concepts)', 'Editing (2x Drafts)',
      '200 Pages Max', 'Book Layout (2x Styles)', 'Cream Paper', 'Black and White Inners',
      'Facebook Banner Design', 'Book Mockups', 'Publishing Consultation & Guidance', 'Save (R2,450)',
    ],
    cta: 'Choose Silver Package',
  },
  {
    title: 'Gold',
    price: 'R35,000',
    badge: 'Best Value',
    popular: false,
    billing: 'Once Off',
    bestFor: 'Authors who want the most complete package with more copies, ebook conversion and launch support.',
    includes: [
      'A5', '200 Copies', 'Book Cover Design (2x Concepts)', 'Editing (2x Drafts)',
      '250 Pages Max', 'Book Layout', 'Cream Paper', 'Black and White Inners',
      'Roll Up Banner Design + Print', 'Ebook Conversion (All Digital Platforms)',
      'Publishing Consultation & Guidance',
    ],
    cta: 'Choose Gold Package',
  },
];

const comparisonRows = [
  { feature: 'Once-off price', bronze: 'R21,000', silver: 'R25,500', gold: 'R35,000' },
  { feature: 'Book size', bronze: 'A5', silver: 'A5', gold: 'A5' },
  { feature: 'Printed copies', bronze: '100', silver: '150', gold: '200' },
  { feature: 'Book cover design', bronze: '2x Concepts', silver: '2x Concepts', gold: '2x Concepts' },
  { feature: 'Editing drafts', bronze: '2x Drafts', silver: '2x Drafts', gold: '2x Drafts' },
  { feature: 'Maximum pages', bronze: '150', silver: '200', gold: '250' },
  { feature: 'Book layout', bronze: '✓', silver: '2x Styles', gold: '✓' },
  { feature: 'Paper type', bronze: 'Cream', silver: 'Cream', gold: 'Cream' },
  { feature: 'Inner pages', bronze: 'B&W', silver: 'B&W', gold: 'B&W' },
  { feature: 'Facebook banner design', bronze: '✓', silver: '✓', gold: '—' },
  { feature: 'Book mockups', bronze: '✓', silver: '✓', gold: '—' },
  { feature: 'Roll up banner + print', bronze: '—', silver: '—', gold: '✓' },
  { feature: 'Ebook conversion', bronze: '—', silver: '—', gold: '✓' },
  { feature: 'Publishing consultation', bronze: '✓', silver: '✓', gold: '✓' },
];

const authorTypes = [
  'First-time authors', 'Self-published authors', 'Novel writers', 'Memoir writers',
  'Christian authors', 'Poetry authors', 'Business book authors', 'Inspirational writers',
  'Coaches and speakers', 'Pastors and ministry leaders', 'Entrepreneurs',
  'Personal development authors', 'Authors preparing for a book launch',
  'Authors who need printing and publishing support',
];

const processSteps = [
  { num: '01', title: 'Send Your Manuscript Details', body: 'Tell us your book title, genre, page count, word count, book size and preferred publishing package.' },
  { num: '02', title: 'Choose a Package', body: 'Select the Bronze, Silver or Gold package based on your budget, page count, number of copies and publishing goals.' },
  { num: '03', title: 'Submit Your Manuscript', body: 'Send your manuscript in Word format so the editing and layout process can begin.' },
  { num: '04', title: 'Design and Editing Begins', body: 'Our team works on your manuscript editing, book cover concepts, layout preparation and selected package deliverables.' },
  { num: '05', title: 'Review and Approve', body: 'You review the edited manuscript, cover design, layout and relevant design assets before production continues.' },
  { num: '06', title: 'Print and Prepare Your Book', body: 'Once approved, your book moves into printing and final delivery according to the selected package.' },
];

const whyCards = [
  { title: 'Clearer Budget', body: 'You know what the package includes and can plan your publishing investment upfront.' },
  { title: 'Better Production Flow', body: 'Editing, design, layout and printing move together in a more organised process.' },
  { title: 'Consistent Book Presentation', body: 'Your cover, layout, mockups and print production are aligned under one creative direction.' },
  { title: 'Professional Author Support', body: 'You receive guidance from a team that understands self publishing, book design and print production.' },
];

const faqs = [
  { q: 'What is included in a self publishing package?', a: 'A self publishing package can include book cover design, editing, book layout, printed copies, cream paper, black and white inner pages, book mockups, banner design, ebook conversion and publishing consultation depending on the package selected.' },
  { q: 'Are these packages once-off payments?', a: 'Yes. The Bronze, Silver and Gold packages are once-off package prices.' },
  { q: 'What book size is included in these packages?', a: 'The packages are based on A5 book size.' },
  { q: 'How many printed copies are included?', a: 'The Bronze package includes 100 copies, the Silver package includes 150 copies and the Gold package includes 200 copies.' },
  { q: 'Do the packages include editing?', a: 'Yes. All three packages include editing with 2 drafts.' },
  { q: 'Do the packages include book cover design?', a: 'Yes. All packages include book cover design with 2 concepts.' },
  { q: 'What paper type is included?', a: 'The packages include cream paper with black and white inner pages.' },
  { q: 'Does the Gold package include ebook conversion?', a: 'Yes. The Gold package includes ebook conversion suitable for all digital platforms.' },
  { q: 'Can I request a custom publishing package?', a: 'Yes. If your book does not fit one of the listed packages, you can request a custom quote based on your manuscript, page count, book size and publishing needs.' },
  { q: 'Do you work with authors outside Johannesburg?', a: 'Yes. Creative Books SA supports authors in Johannesburg, Gauteng and across South Africa.' },
  { q: 'Can you help me choose the right package?', a: 'Yes. Send us your manuscript details, page count and publishing goals, and we will guide you on the most suitable package.' },
  { q: 'Can I use these packages for a poetry book, memoir, Christian book or business book?', a: 'Yes. These self publishing packages are suitable for different book types, including poetry books, memoirs, Christian books, business books, novels and inspirational titles.' },
];

// ─── Components ───────────────────────────────────────────────────────────────

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

function PricingCard({ pkg, i }) {
  const isGold = pkg.title === 'Gold';
  return (
    <motion.div
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: i * 0.08 }}
      whileHover={{ y: -8, transition: { duration: 0.22 } }}
      className="relative flex flex-col overflow-hidden h-full"
      style={{
        background: pkg.popular
          ? 'linear-gradient(160deg, #ffffff 0%, #fdf9f4 100%)'
          : isGold
          ? 'linear-gradient(160deg, #0d1830 0%, #111827 100%)'
          : 'rgba(255,255,255,0.72)',
        backdropFilter: 'blur(24px)',
        border: pkg.popular
          ? '1.5px solid rgba(184,149,91,0.55)'
          : isGold
          ? '1.5px solid rgba(184,149,91,0.4)'
          : '1px solid rgba(255,255,255,0.88)',
        boxShadow: pkg.popular
          ? '0 24px 60px rgba(184,149,91,0.18), inset 0 1px 0 rgba(255,255,255,1)'
          : isGold
          ? '0 24px 60px rgba(0,0,0,0.45)'
          : '0 8px 32px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,1)',
        borderRadius: '16px',
      }}
    >
      <div className="absolute top-0 left-4 right-4 h-px"
        style={{ background: isGold ? 'linear-gradient(90deg, transparent, rgba(184,149,91,0.5), transparent)' : 'linear-gradient(90deg, transparent, rgba(255,255,255,1), transparent)' }} />

      {pkg.badge && (
        <div className="absolute top-4 right-4">
          <span className="inline-flex items-center gap-1 px-2.5 py-1 text-[10px] font-semibold tracking-[0.15em] uppercase"
            style={{ background: 'linear-gradient(135deg, #0B1220 0%, #1a2a4a 100%)', color: '#D4AF72', border: '1px solid rgba(212,175,114,0.3)', borderRadius: '4px' }}>
            <Award className="w-2.5 h-2.5" />{pkg.badge}
          </span>
        </div>
      )}

      <div className="p-7 flex-1">
        <p className="text-[10px] font-semibold tracking-[0.25em] uppercase font-body mb-3"
          style={{ color: pkg.popular ? '#B8955B' : isGold ? '#B8955B' : 'rgba(11,18,32,0.4)' }}>{pkg.billing}</p>
        <h3 className="font-heading text-2xl font-bold mb-2" style={{ color: isGold ? '#fff' : '#0B1220' }}>{pkg.title}</h3>
        <div className="mb-2">
          <span className="font-heading text-4xl font-bold" style={{ color: isGold ? '#fff' : '#0B1220' }}>{pkg.price}</span>
        </div>
        <p className="text-xs font-body italic mb-5 leading-relaxed" style={{ color: isGold ? 'rgba(255,255,255,0.5)' : 'rgba(43,43,43,0.5)' }}>{pkg.bestFor}</p>

        <div className="h-px mb-5" style={{ background: pkg.popular ? 'rgba(184,149,91,0.2)' : isGold ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)' }} />

        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] font-body mb-3"
          style={{ color: isGold ? 'rgba(255,255,255,0.35)' : 'rgba(11,18,32,0.35)' }}>Includes</p>
        <ul className="space-y-2">
          {pkg.includes.map(f => (
            <li key={f} className="flex items-start gap-2.5">
              <div className="w-4 h-4 rounded-full flex items-center justify-center shrink-0 mt-0.5"
                style={{ background: pkg.popular ? 'rgba(184,149,91,0.12)' : isGold ? 'rgba(184,149,91,0.15)' : 'rgba(11,18,32,0.06)', border: `1px solid ${pkg.popular || isGold ? 'rgba(184,149,91,0.3)' : 'rgba(11,18,32,0.1)'}` }}>
                <Check className="w-2.5 h-2.5" style={{ color: pkg.popular || isGold ? '#B8955B' : '#0B1220' }} strokeWidth={2.5} />
              </div>
              <span className="text-xs font-body leading-relaxed" style={{ color: isGold ? 'rgba(255,255,255,0.65)' : 'rgba(43,43,43,0.72)' }}>{f}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="p-7 pt-0">
        <Link to="/getquote" className="block text-center py-3.5 px-5 text-sm font-semibold font-body transition-all"
          style={pkg.popular ? {
            background: 'linear-gradient(135deg, #0B1220, #1a2a4a)', color: '#fff', boxShadow: '0 8px 24px rgba(11,18,32,0.25)', borderRadius: '8px',
          } : isGold ? {
            background: 'linear-gradient(135deg, #B8955B, #d4af72)', color: '#0B1220', boxShadow: '0 8px 24px rgba(184,149,91,0.35)', borderRadius: '8px', fontWeight: '700',
          } : {
            background: 'rgba(11,18,32,0.05)', color: '#0B1220', border: '1px solid rgba(11,18,32,0.12)', borderRadius: '8px',
          }}>
          {pkg.cta}
        </Link>
      </div>
    </motion.div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function SelfPublishingPackages() {
  const [openFaq, setOpenFaq] = useState(null);

  return (
    <div style={{ background: '#f8f9fc' }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context": "https://schema.org", "@type": "FAQPage",
        "mainEntity": faqs.map(f => ({ "@type": "Question", "name": f.q, "acceptedAnswer": { "@type": "Answer", "text": f.a } }))
      }) }} />

      {/* ── 1. HERO ── */}
      <section className="relative min-h-[68vh] flex items-end overflow-hidden" style={{ background: 'linear-gradient(160deg, #090E18 0%, #0d1830 60%, #111827 100%)' }}>
        <div className="absolute top-0 left-0 w-[700px] h-[450px] pointer-events-none" style={{ background: 'radial-gradient(ellipse at 20% 30%, rgba(184,149,91,0.13) 0%, transparent 60%)', filter: 'blur(40px)' }} />
        <div className="absolute bottom-0 right-0 w-[500px] h-[300px] pointer-events-none" style={{ background: 'radial-gradient(ellipse at 80% 80%, rgba(100,130,220,0.07) 0%, transparent 60%)', filter: 'blur(60px)' }} />
        <div className="absolute top-0 left-0 right-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(184,149,91,0.6), transparent)' }} />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 pt-32 pb-20 w-full">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }} className="max-w-3xl">
            <span className="text-[#B8955B] text-xs font-body font-semibold tracking-[0.3em] uppercase mb-5 block">
              Self Publishing Packages · South Africa · Johannesburg
            </span>
            <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 leading-[1.05]">
              Self Publishing Packages<br /><span style={{ color: '#B8955B' }}>in South Africa</span>
            </h1>
            <p className="text-white/60 text-base font-body mb-5 font-medium">
              Complete Publishing Packages for Authors Ready to Print, Publish and Launch Their Books
            </p>
            <p className="text-white/45 text-sm leading-relaxed font-body mb-4 max-w-2xl">
              Creative Books SA helps authors turn manuscripts into professionally edited, designed, typeset and printed books through complete self publishing packages. Whether you are publishing your first book or preparing a new title for launch, our packages give you the essential services needed to move from manuscript to finished copies with confidence.
            </p>
            <p className="text-white/40 text-sm leading-relaxed font-body mb-10 max-w-2xl">
              Our self publishing packages are designed for South African authors who want professional book production without the confusion of handling every stage alone. From editing and book cover design to layout, book printing, mockups, banners and publishing guidance, we help you prepare a book that looks polished, credible and ready for readers.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link to="/getquote" className="inline-flex items-center gap-2 px-8 py-4 text-white text-sm font-semibold transition-all group"
                style={{ background: '#B8955B', boxShadow: '0 12px 32px rgba(184,149,91,0.35)', borderRadius: '8px' }}>
                Request a Publishing Package Quote
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <a href="#pricing" className="inline-flex items-center gap-2 px-8 py-4 text-white/80 text-sm font-medium"
                style={{ border: '1px solid rgba(255,255,255,0.15)', borderRadius: '8px', background: 'rgba(255,255,255,0.04)' }}>
                View Publishing Packages
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── 2. TRUST STRIP ── */}
      <section className="relative py-10 overflow-hidden" style={{ background: 'linear-gradient(135deg, #f0f4ff 0%, #eef1f7 100%)', borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {trustCards.map((card, i) => {
              const Icon = card.icon;
              return (
                <motion.div key={card.title} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.07 }}
                  className="flex items-start gap-4 p-5"
                  style={{ background: 'rgba(255,255,255,0.78)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.95)', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', borderRadius: '14px' }}>
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

      {/* ── 3. INTRO ── */}
      <section className="py-20 lg:py-28" style={{ background: '#F8F5EF' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="max-w-3xl">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
              <span className="text-[#B8955B] text-xs tracking-[0.3em] uppercase font-body block mb-5">Start Your Journey</span>
              <h2 className="font-heading text-3xl md:text-4xl font-bold text-[#0B1220] mb-6 leading-tight">Full Publishing Packages for Authors</h2>
              <p className="text-[#2B2B2B]/60 font-body text-sm leading-relaxed mb-4 font-semibold">Ready to start your publishing journey? Let Creative Books SA walk this journey with you.</p>
              <p className="text-[#2B2B2B]/60 font-body text-sm leading-relaxed mb-5">Publishing a book can feel overwhelming when you have to manage editing, cover design, layout, printing and marketing assets separately. Our full publishing packages bring the most important book production services together, making the process clearer, more organised and easier to manage.</p>
              <p className="text-[#2B2B2B]/60 font-body text-sm leading-relaxed mb-8">These packages are ideal for authors who want a professional A5 book package with printed copies, editing, book cover design, book layout, cream paper, black and white inner pages, book mockups and publishing guidance. Instead of trying to coordinate multiple suppliers, you can work with one team that understands the full publishing process.</p>
              <Link to="/getquote" className="inline-flex items-center gap-2 px-7 py-3.5 text-white text-sm font-semibold transition-all group"
                style={{ background: '#0B1220', borderRadius: '8px', boxShadow: '0 8px 24px rgba(11,18,32,0.2)' }}>
                Start My Publishing Package Quote
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── 4. WHY CHOOSE US ── */}
      <section className="py-20 lg:py-28 overflow-hidden" style={{ background: 'linear-gradient(135deg, #f0f4ff 0%, #eef1f7 100%)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-14">
            <span className="text-[#B8955B] text-xs tracking-[0.3em] uppercase font-body block mb-4">Why Choose Us</span>
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-[#0B1220] mb-3 leading-tight">Why Choose Creative Books SA Publishing Packages?</h2>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              { icon: Star, title: 'Cost Effective', body: 'Get essential publishing services at an affordable once-off price. Our packages are ideal for authors who want professional support while keeping their publishing budget clear and manageable.' },
              { icon: Clock, title: 'Time-Saving', body: 'Save time and effort by trusting your publishing needs to professionals who understand book production. We help bring your manuscript, cover, layout and printed copies together efficiently and professionally.' },
              { icon: Users, title: 'Professional Guidance', body: 'Receive expert advice and support from our experienced team throughout the publishing process, helping you move from manuscript to finished book with more clarity and confidence.' },
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

      {/* ── 5. WHAT'S INCLUDED ── */}
      <section className="py-20 lg:py-28" style={{ background: '#F8F5EF' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-14">
            <span className="text-[#B8955B] text-xs tracking-[0.3em] uppercase font-body block mb-4">What's Included</span>
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-[#0B1220] mb-4 leading-tight">What Our Self Publishing Packages Can Include</h2>
            <p className="text-[#2B2B2B]/55 font-body text-sm leading-relaxed max-w-2xl">Each package is designed to support authors through the most important stages of book production. Depending on the package selected, your publishing package can include book cover design, manuscript editing, book layout, printed copies, cream paper, book mockups, banner design, ebook conversion and publishing consultation.</p>
          </motion.div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {includedCards.map((card, i) => (
              <motion.div key={card.title} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.07 }}
                className="p-7" style={{ background: 'rgba(255,255,255,0.78)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.95)', boxShadow: '0 4px 20px rgba(0,0,0,0.06)', borderRadius: '14px' }}>
                <div className="w-8 h-0.5 mb-5" style={{ background: '#B8955B' }} />
                <h3 className="font-heading text-base font-bold text-[#0B1220] mb-2">{card.title}</h3>
                <p className="text-xs font-body text-[#2B2B2B]/55 leading-relaxed">{card.body}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 6. PRICING ── */}
      <section id="pricing" className="py-20 lg:py-28 overflow-hidden" style={{ background: 'linear-gradient(135deg, #f0f4ff 0%, #eef1f7 100%)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-14">
            <span className="text-[#B8955B] text-xs tracking-[0.3em] uppercase font-body block mb-4">Pricing</span>
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-[#0B1220] mb-2 leading-tight">Self Publishing Packages Pricing Table</h2>
            <p className="text-[#2B2B2B]/50 font-body text-sm">Save Time. Save Money.</p>
          </motion.div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-12">
            {packages.map((pkg, i) => <PricingCard key={pkg.title} pkg={pkg} i={i} />)}
          </div>

          {/* Conversion nudge */}
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
            className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 px-8 py-6"
            style={{ background: 'rgba(255,255,255,0.72)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.9)', boxShadow: '0 4px 20px rgba(0,0,0,0.06)', borderRadius: '12px' }}>
            <div>
              <h3 className="font-heading text-lg font-bold text-[#0B1220] mb-1">Not Sure Which Package Suits Your Book?</h3>
              <p className="text-xs font-body text-[#2B2B2B]/60 leading-relaxed max-w-xl">Send us your manuscript details, page count, genre and publishing goals and we will guide you to the most suitable package.</p>
            </div>
            <Link to="/getquote" className="shrink-0 inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold text-white transition-all group"
              style={{ background: '#B8955B', borderRadius: '8px', boxShadow: '0 8px 20px rgba(184,149,91,0.3)' }}>
              Request a Custom Quote
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ── 7. COMPARISON TABLE ── */}
      <section className="py-20 lg:py-28" style={{ background: '#F8F5EF' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-12">
            <span className="text-[#B8955B] text-xs tracking-[0.3em] uppercase font-body block mb-4">Compare Packages</span>
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-[#0B1220] mb-3 leading-tight">Compare Our Self Publishing Packages</h2>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="overflow-x-auto rounded-2xl" style={{ border: '1px solid rgba(255,255,255,0.9)', boxShadow: '0 8px 32px rgba(0,0,0,0.06)' }}>
            <table className="w-full text-sm min-w-[600px]">
              <thead>
                <tr style={{ background: 'rgba(11,18,32,0.05)' }}>
                  <th className="text-left px-6 py-4 font-heading text-xs font-bold text-[#0B1220] tracking-[0.1em] uppercase">Feature</th>
                  <th className="text-center px-6 py-4 font-heading text-xs font-bold text-[#0B1220] tracking-[0.1em] uppercase">Bronze</th>
                  <th className="text-center px-6 py-4 font-heading text-xs font-bold text-[#B8955B] tracking-[0.1em] uppercase">Silver ★</th>
                  <th className="text-center px-6 py-4 font-heading text-xs font-bold text-[#0B1220] tracking-[0.1em] uppercase">Gold</th>
                </tr>
              </thead>
              <tbody>
                {comparisonRows.map((row, i) => (
                  <tr key={row.feature} style={{ borderTop: '1px solid rgba(0,0,0,0.05)', background: i % 2 === 0 ? 'rgba(255,255,255,0.85)' : 'rgba(248,245,239,0.8)' }}>
                    <td className="px-6 py-3.5 font-body text-xs font-semibold text-[#0B1220]/70">{row.feature}</td>
                    <td className="px-6 py-3.5 text-center font-body text-xs text-[#2B2B2B]/65">{row.bronze}</td>
                    <td className="px-6 py-3.5 text-center font-body text-xs font-semibold text-[#B8955B]">{row.silver}</td>
                    <td className="px-6 py-3.5 text-center font-body text-xs text-[#2B2B2B]/65">{row.gold}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </motion.div>
        </div>
      </section>

      {/* ── 8. WHO IT'S FOR ── */}
      <section className="py-20 lg:py-24 overflow-hidden" style={{ background: 'linear-gradient(135deg, #f0f4ff 0%, #eef1f7 100%)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-10">
            <span className="text-[#B8955B] text-xs tracking-[0.3em] uppercase font-body block mb-4">Author Types</span>
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-[#0B1220] mb-3 leading-tight">Who Our Self Publishing Packages Are For</h2>
            <p className="text-[#2B2B2B]/55 font-body text-sm max-w-2xl leading-relaxed">Our self publishing packages are designed for authors who want a structured and professional way to publish their books. Whether you are writing for personal, professional, creative or ministry reasons, these packages help you prepare your book for readers with a clear production process.</p>
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

      {/* ── 9. PROCESS ── */}
      <section className="py-20 lg:py-28" style={{ background: 'linear-gradient(160deg, #090E18 0%, #0d1830 100%)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-14">
            <span className="text-[#B8955B] text-xs tracking-[0.3em] uppercase font-body block mb-4">How It Works</span>
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-white mb-3 leading-tight">How Our Self Publishing Package Process Works</h2>
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

      {/* ── 10. WHY PACKAGE-BASED ── */}
      <section className="py-20 lg:py-28 overflow-hidden" style={{ background: 'linear-gradient(135deg, #f0f4ff 0%, #eef1f7 100%)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-12">
            <span className="text-[#B8955B] text-xs tracking-[0.3em] uppercase font-body block mb-4">Package Benefits</span>
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-[#0B1220] mb-5 leading-tight max-w-2xl">Why Choose a Full Publishing Package Instead of Separate Services?</h2>
            <p className="text-[#2B2B2B]/60 font-body text-sm leading-relaxed max-w-2xl mb-4">Many authors struggle because they try to manage editing, cover design, layout and printing as separate steps with different service providers. This can lead to delays, inconsistent design, unclear costs and confusion about what must happen next.</p>
            <p className="text-[#2B2B2B]/60 font-body text-sm leading-relaxed max-w-2xl">A full publishing package gives you a clearer process. Your main production services are grouped together, helping you save time, plan your budget and keep the book's design and production direction consistent. It also gives you access to guidance from a team that understands how each stage affects the final book.</p>
          </motion.div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {whyCards.map((card, i) => (
              <motion.div key={card.title} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.07 }}
                className="p-7" style={{ background: 'rgba(255,255,255,0.78)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.95)', boxShadow: '0 4px 20px rgba(0,0,0,0.06)', borderRadius: '14px' }}>
                <div className="w-8 h-0.5 mb-5" style={{ background: '#B8955B' }} />
                <h3 className="font-heading text-base font-bold text-[#0B1220] mb-2">{card.title}</h3>
                <p className="text-xs font-body text-[#2B2B2B]/55 leading-relaxed">{card.body}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 11. SEO SECTION ── */}
      <section className="py-20" style={{ background: '#F8F5EF' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="max-w-3xl">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
              <span className="text-[#B8955B] text-xs tracking-[0.3em] uppercase font-body block mb-5">Johannesburg · South Africa</span>
              <h2 className="font-heading text-3xl md:text-4xl font-bold text-[#0B1220] mb-6 leading-tight">Self Publishing Packages in Johannesburg and South Africa</h2>
              <p className="text-[#2B2B2B]/60 font-body text-sm leading-relaxed mb-5">If you are looking for self publishing packages in South Africa, Creative Books SA offers complete publishing solutions for authors who want professional editing, book cover design, layout, printing and publishing guidance. Our packages are designed to help authors prepare polished A5 books with printed copies and essential design support.</p>
              <p className="text-[#2B2B2B]/60 font-body text-sm leading-relaxed mb-8">We support authors in Johannesburg, Gauteng and across South Africa with book publishing packages that are practical, affordable and professionally structured. Whether you need 100 copies, 150 copies or 200 copies, our Bronze, Silver and Gold packages give you a clear route from manuscript to printed book.</p>
              <Link to="/getquote" className="inline-flex items-center gap-2 px-7 py-3.5 text-white text-sm font-semibold transition-all group"
                style={{ background: '#B8955B', borderRadius: '8px', boxShadow: '0 8px 24px rgba(184,149,91,0.3)' }}>
                Start Your Self Publishing Package Quote
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── 12. FAQ ── */}
      <section className="py-20 lg:py-28 overflow-hidden" style={{ background: 'linear-gradient(135deg, #f0f4ff 0%, #eef1f7 100%)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
            <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="lg:sticky lg:top-28">
              <span className="text-[#B8955B] text-xs tracking-[0.3em] uppercase font-body block mb-5">FAQ</span>
              <h2 className="font-heading text-3xl md:text-4xl font-bold text-[#0B1220] mb-4 leading-tight">Self Publishing Packages FAQs</h2>
              <p className="text-[#2B2B2B]/55 font-body text-sm leading-relaxed max-w-sm">Have more questions? Contact us for a personalised answer.</p>
              <div className="mt-6 h-px w-24" style={{ background: '#B8955B' }} />
            </motion.div>
            <div className="space-y-2">
              {faqs.map((faq, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.04 }}>
                  <FAQItem faq={faq} i={i} open={openFaq} setOpen={setOpenFaq} />
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── 13. FINAL CTA ── */}
      <section className="relative py-20 overflow-hidden" style={{ background: 'linear-gradient(160deg, #090E18 0%, #0d1830 100%)' }}>
        <div className="absolute top-0 left-0 right-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(184,149,91,0.5), transparent)' }} />
        <div className="absolute bottom-0 left-0 right-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(184,149,91,0.2), transparent)' }} />
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[600px] h-[400px] pointer-events-none"
          style={{ background: 'radial-gradient(ellipse, rgba(184,149,91,0.07) 0%, transparent 65%)', filter: 'blur(60px)' }} />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <span className="text-[#B8955B] text-xs tracking-[0.3em] uppercase font-body block mb-6">Start Your Journey</span>
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-white mb-5 leading-tight">Ready to Start Your Publishing Journey?</h2>
            <p className="text-white/45 font-body text-sm leading-relaxed mb-10 max-w-lg mx-auto">Your manuscript deserves a professional path to becoming a finished book. Whether you choose Bronze, Silver or Gold, Creative Books SA can help you move from manuscript to edited, designed and printed copies with clarity and confidence.</p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link to="/getquote" className="inline-flex items-center gap-2 px-8 py-4 text-white text-sm font-semibold transition-all group"
                style={{ background: '#B8955B', boxShadow: '0 12px 32px rgba(184,149,91,0.35)', borderRadius: '8px' }}>
                Request a Publishing Package Quote
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link to="/getquote" className="inline-flex items-center gap-2 px-8 py-4 text-white/70 text-sm"
                style={{ border: '1px solid rgba(255,255,255,0.12)', borderRadius: '8px', background: 'rgba(255,255,255,0.04)' }}>
                Speak to Our Publishing Team
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      <InternalLinks links={[
        { label: 'Book Printing Johannesburg', path: '/bookprintingjohannesburg' },
        { label: 'Book Editing Services', path: '/bookediting' },
        { label: 'Proofreading Services', path: '/proofreading' },
        { label: 'Book Cover Design', path: '/bookcoverdesign' },
        { label: 'Book Layout & Typesetting', path: '/typesetting' },
        { label: 'eBook Formatting', path: '/ebookpublishing' },
        { label: 'Author Website Design', path: '/authorwebsites' },
        { label: 'Ghost Writing Services', path: '/ghostwriting' },
        { label: 'Self Publishing South Africa', path: '/selfpublishingsouthafrica' },
        { label: 'Request a Quote', path: '/getquote' },
      ]} light />
    </div>
  );
}