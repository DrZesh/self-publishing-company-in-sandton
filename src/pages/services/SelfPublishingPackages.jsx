import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { ArrowRight, Check, Plus, Minus, Award, BookOpen, Printer, Star, Clock, Users, Zap, Shield, Layers, ChevronRight } from 'lucide-react';
import InternalLinks from '../../components/shared/InternalLinks';
import PageMeta from '../../components/shared/PageMeta';

// ─── Data ──────────────────────────────────────────────────────────────────────

const includedCards = [
  { icon: '🎨', title: 'Book Cover Design', body: 'Professional cover with two concepts to attract readers and communicate quality.' },
  { icon: '✏️', title: 'Editing Support', body: 'Two editing drafts to refine grammar, structure, readability and overall quality.' },
  { icon: '📐', title: 'Book Layout', body: 'Interior typesetting that transforms your manuscript into a clean, print-ready file.' },
  { icon: '📚', title: 'Printed Copies', body: 'A5 printed books included — quantity based on your chosen package.' },
  { icon: '🍂', title: 'Cream Paper', body: 'Warm cream paper for a softer, professional reading experience ideal for novels and memoirs.' },
  { icon: '🚀', title: 'Launch Assets', body: 'Facebook banners, book mockups or roll-up banner depending on package.' },
];

const packages = [
  {
    title: 'Bronze',
    price: 'R21,000',
    badge: null,
    accent: 'rgba(184,149,91,0.6)',
    glowColor: 'rgba(184,149,91,0.15)',
    billing: 'Once Off',
    copies: '100',
    pages: '150',
    bestFor: 'First-time authors needing a complete, affordable publishing package.',
    includes: [
      'A5 Book Size', '100 Printed Copies', 'Book Cover Design (2x Concepts)',
      'Editing (2x Drafts)', '150 Pages Max', 'Book Layout',
      'Cream Paper · B&W Inners', 'Facebook Banner Design',
      'Book Mockups', 'Publishing Consultation',
    ],
    cta: 'Choose Bronze',
  },
  {
    title: 'Silver',
    price: 'R25,500',
    badge: 'Most Popular',
    accent: '#B8955B',
    glowColor: 'rgba(184,149,91,0.25)',
    billing: 'Once Off',
    copies: '150',
    pages: '200',
    bestFor: 'Authors needing more copies, a higher page limit and stronger layout support.',
    includes: [
      'A5 Book Size', '150 Printed Copies', 'Book Cover Design (2x Concepts)',
      'Editing (2x Drafts)', '200 Pages Max', 'Book Layout (2x Styles)',
      'Cream Paper · B&W Inners', 'Facebook Banner Design',
      'Book Mockups', 'Publishing Consultation', 'Save R2,450',
    ],
    cta: 'Choose Silver',
  },
  {
    title: 'Gold',
    price: 'R35,000',
    badge: 'Best Value',
    accent: 'rgba(212,175,114,0.9)',
    glowColor: 'rgba(212,175,114,0.2)',
    billing: 'Once Off',
    copies: '200',
    pages: '250',
    bestFor: 'Authors wanting the most complete package with ebook conversion and launch support.',
    includes: [
      'A5 Book Size', '200 Printed Copies', 'Book Cover Design (2x Concepts)',
      'Editing (2x Drafts)', '250 Pages Max', 'Book Layout',
      'Cream Paper · B&W Inners', 'Roll Up Banner Design + Print',
      'Ebook Conversion (All Platforms)', 'Publishing Consultation',
    ],
    cta: 'Choose Gold',
  },
];

const comparisonRows = [
  { feature: 'Once-off price', bronze: 'R21,000', silver: 'R25,500', gold: 'R35,000' },
  { feature: 'Book size', bronze: 'A5', silver: 'A5', gold: 'A5' },
  { feature: 'Printed copies', bronze: '100', silver: '150', gold: '200' },
  { feature: 'Book cover design', bronze: '2x Concepts', silver: '2x Concepts', gold: '2x Concepts' },
  { feature: 'Editing drafts', bronze: '2x Drafts', silver: '2x Drafts', gold: '2x Drafts' },
  { feature: 'Maximum pages', bronze: '150', silver: '200', gold: '250' },
  { feature: 'Book layout styles', bronze: '1x', silver: '2x', gold: '1x' },
  { feature: 'Paper type', bronze: 'Cream', silver: 'Cream', gold: 'Cream' },
  { feature: 'Facebook banner', bronze: true, silver: true, gold: false },
  { feature: 'Book mockups', bronze: true, silver: true, gold: false },
  { feature: 'Roll up banner + print', bronze: false, silver: false, gold: true },
  { feature: 'Ebook conversion', bronze: false, silver: false, gold: true },
  { feature: 'Publishing consultation', bronze: true, silver: true, gold: true },
];

const processSteps = [
  { num: '01', title: 'Send Your Manuscript Details', body: 'Share your title, genre, page count, word count and preferred package.' },
  { num: '02', title: 'Choose Your Package', body: 'Select Bronze, Silver or Gold based on budget, copies needed and publishing goals.' },
  { num: '03', title: 'Submit Your Manuscript', body: 'Send your Word file so editing and layout can begin.' },
  { num: '04', title: 'Design & Editing Begins', body: 'Our team works on editing, cover concepts, layout and package deliverables.' },
  { num: '05', title: 'Review & Approve', body: 'You approve the edited manuscript, cover design and layout before print.' },
  { num: '06', title: 'Print & Deliver', body: 'Your book enters print production and is delivered according to your package.' },
];

const authorTypes = [
  'First-time authors', 'Self-published authors', 'Novel writers', 'Memoir writers',
  'Christian authors', 'Poetry authors', 'Business book authors', 'Inspirational writers',
  'Coaches & speakers', 'Pastors & ministry leaders', 'Entrepreneurs',
  'Personal development authors', 'Authors preparing for a launch',
  'Authors needing printing & publishing support',
];

const faqs = [
  { q: 'What is included in a self publishing package?', a: 'A self publishing package can include book cover design, editing, book layout, printed copies, cream paper, black and white inner pages, book mockups, banner design, ebook conversion and publishing consultation depending on the package selected.' },
  { q: 'Are these packages once-off payments?', a: 'Yes. The Bronze, Silver and Gold packages are once-off package prices.' },
  { q: 'What book size is included in these packages?', a: 'The packages are based on A5 book size.' },
  { q: 'How many printed copies are included?', a: 'Bronze: 100 copies · Silver: 150 copies · Gold: 200 copies.' },
  { q: 'Do the packages include editing?', a: 'Yes. All three packages include editing with 2 drafts.' },
  { q: 'Do the packages include book cover design?', a: 'Yes. All packages include book cover design with 2 concepts.' },
  { q: 'What paper type is included?', a: 'Cream paper with black and white inner pages is included in all packages.' },
  { q: 'Does the Gold package include ebook conversion?', a: 'Yes. The Gold package includes ebook conversion suitable for all digital platforms.' },
  { q: 'Can I request a custom publishing package?', a: 'Yes. If your book doesn\'t fit a listed package, request a custom quote based on your manuscript, page count and publishing needs.' },
  { q: 'Do you work with authors outside Johannesburg?', a: 'Yes. Creative Books SA supports authors in Johannesburg, Gauteng and across South Africa.' },
  { q: 'Can you help me choose the right package?', a: 'Yes. Send us your manuscript details, page count and publishing goals and we will guide you to the most suitable package.' },
  { q: 'Can I use these for a poetry book, memoir, Christian or business book?', a: 'Yes. These packages are suitable for poetry books, memoirs, Christian books, business books, novels and inspirational titles.' },
  // Editing FAQs
  { q: 'What type of editing is included in the packages?', a: 'The packages include two rounds of editing drafts focused on grammar, spelling, punctuation, sentence structure, readability and consistency. This is comprehensive copy editing support to prepare your manuscript for publication.' },
  { q: 'Do you offer developmental or structural editing?', a: 'The included editing focuses on copy editing. If your manuscript needs developmental or structural editing (plot, pacing, chapter organization, character development), contact us for a separate quote based on your manuscript\'s needs.' },
  { q: 'Can I skip editing if my manuscript is already edited?', a: 'Yes. If you have already worked with a professional editor, we can discuss adjusting the package. However, we strongly recommend at least one professional editing round before layout and printing.' },
  { q: 'How long does the editing process take?', a: 'Editing typically takes 2 to 4 weeks depending on manuscript length, complexity and the editor\'s schedule. This is included in the overall production timeline.' },
  // Printing FAQs
  { q: 'What is the print quality of the books?', a: 'We use professional printing equipment and high-quality cream paper. The print is sharp, clear and suitable for both personal distribution and commercial sales through bookshops and online retailers.' },
  { q: 'Can I order additional printed copies later?', a: 'Yes. After your initial package copies, you can order additional print runs at competitive rates. Contact us for a reprint quote based on your quantity needs.' },
  { q: 'Do you offer hardcover printing options?', a: 'The standard packages include softcover books. If you want hardcover options, contact us for a custom quote. We also offer hardcover printing as a separate service.' },
  { q: 'How long does printing and delivery take?', a: 'Printing typically takes 2 to 3 weeks after final approval. Delivery timelines depend on your location within South Africa. We will provide an estimated delivery date when your project begins.' },
  // ISBN FAQs
  { q: 'Is ISBN registration included in the packages?', a: 'ISBN registration is not included in the standard packages. However, we can assist you with ISBN registration through the National Library of South Africa. Contact us for ISBN registration support or visit our ISBN registration service page.' },
  { q: 'Do I need an ISBN to sell my book?', a: 'An ISBN is required if you want to sell your book through bookshops, distributors or major online retailers like Takealot. If you are only printing for personal use (family, friends, events), an ISBN is not mandatory.' },
  { q: 'Who owns the ISBN if I use your services?', a: 'The ISBN is registered in your name or your publishing company\'s name. You retain full ownership and control of your ISBN and publishing rights.' },
  { q: 'Can you help me register my ISBN?', a: 'Yes. We offer ISBN registration assistance as a separate service. We can guide you through the application process with the National Library of South Africa or handle the registration on your behalf.' },
  // General Publishing FAQs
  { q: 'Do I retain the copyright to my book?', a: 'Yes. You retain full copyright and ownership of your book. Our packages are service-based — we provide professional production support, but you remain the rights holder.' },
  { q: 'Can you help me distribute my book to bookshops?', a: 'We can provide guidance on distribution channels and help you prepare files for distribution. However, active distribution and sales representation are separate services. Contact us for distribution advice.' },
  { q: 'Do you help with Amazon KDP or eBook platform uploads?', a: 'The Gold package includes ebook conversion suitable for all platforms. We can provide guidance on uploading to Amazon KDP or other platforms, but account setup and uploads are typically handled by the author.' },
  { q: 'What file formats will I receive?', a: 'You will receive print-ready PDF files for printing, high-resolution JPG files for your cover, and ebook files (EPUB or MOBI) if included in your package. All files are suitable for professional printing and digital distribution.' },
];

// ─── Sub-components ────────────────────────────────────────────────────────────

function GlowOrb({ style }) {
  return (
    <motion.div
      animate={{ scale: [1, 1.15, 1], opacity: [0.4, 0.7, 0.4] }}
      transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
      className="absolute pointer-events-none rounded-full"
      style={{ filter: 'blur(80px)', ...style }}
    />
  );
}

function FAQItem({ faq, i, open, setOpen }) {
  const isOpen = open === i;
  return (
    <motion.div
      layout
      className="overflow-hidden"
      style={{
        background: isOpen ? 'rgba(184,149,91,0.06)' : 'rgba(255,255,255,0.04)',
        backdropFilter: 'blur(24px)',
        border: `1px solid ${isOpen ? 'rgba(184,149,91,0.35)' : 'rgba(255,255,255,0.1)'}`,
        borderRadius: '14px',
        transition: 'border-color 0.3s, background 0.3s',
      }}
    >
      <button className="w-full flex items-center justify-between gap-4 px-6 py-5 text-left" onClick={() => setOpen(isOpen ? null : i)}>
        <span className="font-heading text-sm font-semibold text-white leading-snug">{faq.q}</span>
        <motion.span
          animate={{ rotate: isOpen ? 45 : 0 }}
          transition={{ duration: 0.25 }}
          className="shrink-0 w-7 h-7 flex items-center justify-center"
          style={{ background: isOpen ? '#B8955B' : 'rgba(255,255,255,0.08)', borderRadius: '50%', border: '1px solid rgba(255,255,255,0.12)' }}
        >
          <Plus className="w-3.5 h-3.5 text-white" />
        </motion.span>
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3 }}>
            <div className="px-6 pb-5" style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}>
              <p className="text-sm text-white/55 font-body leading-relaxed pt-4">{faq.a}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function PricingCard({ pkg, i }) {
  const [hovered, setHovered] = useState(false);
  const isSilver = pkg.title === 'Silver';
  const isGold = pkg.title === 'Gold';

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: i * 0.1, duration: 0.6 }}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      className="relative flex flex-col h-full cursor-default"
      style={{ zIndex: hovered ? 10 : 1 }}
    >
      {/* Glow on hover */}
      <motion.div
        animate={{ opacity: hovered ? 1 : 0, scale: hovered ? 1 : 0.8 }}
        transition={{ duration: 0.35 }}
        className="absolute inset-0 pointer-events-none"
        style={{ background: `radial-gradient(ellipse at 50% 0%, ${pkg.glowColor} 0%, transparent 70%)`, filter: 'blur(24px)', borderRadius: '20px' }}
      />

      <motion.div
        animate={{ y: hovered ? -8 : 0 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        className="relative flex flex-col h-full overflow-hidden"
        style={{
          background: isSilver
            ? 'linear-gradient(160deg, rgba(255,255,255,0.1) 0%, rgba(184,149,91,0.08) 100%)'
            : isGold
            ? 'linear-gradient(160deg, rgba(212,175,114,0.1) 0%, rgba(255,255,255,0.04) 100%)'
            : 'rgba(255,255,255,0.05)',
          backdropFilter: 'blur(32px)',
          border: isSilver
            ? '1.5px solid rgba(184,149,91,0.5)'
            : isGold
            ? '1.5px solid rgba(212,175,114,0.4)'
            : '1px solid rgba(255,255,255,0.1)',
          boxShadow: isSilver
            ? '0 32px 64px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.15)'
            : '0 16px 48px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.06)',
          borderRadius: '20px',
        }}
      >
        {/* Top shimmer line */}
        <div className="absolute top-0 left-6 right-6 h-px"
          style={{ background: `linear-gradient(90deg, transparent, ${pkg.accent}, transparent)`, opacity: isSilver || isGold ? 0.8 : 0.3 }} />

        {/* Badge */}
        {pkg.badge && (
          <div className="absolute top-5 right-5">
            <motion.span
              animate={{ boxShadow: hovered ? `0 0 20px ${pkg.glowColor}` : '0 0 0px transparent' }}
              transition={{ duration: 0.3 }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-bold tracking-[0.18em] uppercase"
              style={{ background: 'linear-gradient(135deg, #0B1220, #1a2a4a)', color: '#D4AF72', border: '1px solid rgba(212,175,114,0.4)', borderRadius: '6px' }}
            >
              <Award className="w-2.5 h-2.5" />{pkg.badge}
            </motion.span>
          </div>
        )}

        <div className="p-8 flex-1">
          <p className="text-[10px] font-semibold tracking-[0.3em] uppercase font-body mb-3" style={{ color: pkg.accent }}>{pkg.billing}</p>
          <h3 className="font-heading text-3xl font-bold text-white mb-1">{pkg.title}</h3>

          {/* Stats row */}
          <div className="flex gap-4 mb-4 mt-3">
            <div className="flex flex-col">
              <span className="font-heading text-2xl font-bold" style={{ color: pkg.accent }}>{pkg.copies}</span>
              <span className="text-[10px] text-white/35 uppercase tracking-wider font-body">Copies</span>
            </div>
            <div className="w-px self-stretch" style={{ background: 'rgba(255,255,255,0.08)' }} />
            <div className="flex flex-col">
              <span className="font-heading text-2xl font-bold" style={{ color: pkg.accent }}>{pkg.pages}</span>
              <span className="text-[10px] text-white/35 uppercase tracking-wider font-body">Pages Max</span>
            </div>
            <div className="w-px self-stretch" style={{ background: 'rgba(255,255,255,0.08)' }} />
            <div className="flex flex-col">
              <span className="font-heading text-2xl font-bold text-white">{pkg.price}</span>
              <span className="text-[10px] text-white/35 uppercase tracking-wider font-body">Once Off</span>
            </div>
          </div>

          <p className="text-xs font-body text-white/40 italic mb-6 leading-relaxed">{pkg.bestFor}</p>

          <div className="h-px mb-6" style={{ background: `linear-gradient(90deg, ${pkg.accent}40, transparent)` }} />

          <p className="text-[10px] font-bold uppercase tracking-[0.25em] font-body mb-4 text-white/30">What's Included</p>
          <ul className="space-y-2.5">
            {pkg.includes.map(f => (
              <li key={f} className="flex items-center gap-3">
                <div className="w-4 h-4 rounded-full shrink-0 flex items-center justify-center"
                  style={{ background: `${pkg.accent}22`, border: `1px solid ${pkg.accent}55` }}>
                  <Check className="w-2.5 h-2.5" style={{ color: pkg.accent }} strokeWidth={3} />
                </div>
                <span className="text-xs font-body text-white/60">{f}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="p-8 pt-0">
          <Link to="/getquote"
            className="group flex items-center justify-center gap-2 py-4 text-sm font-semibold font-body transition-all"
            style={isSilver ? {
              background: 'linear-gradient(135deg, #B8955B, #d4af72)',
              color: '#0B1220', borderRadius: '12px',
              boxShadow: '0 8px 32px rgba(184,149,91,0.4)',
            } : isGold ? {
              background: 'rgba(212,175,114,0.15)',
              color: '#D4AF72', border: '1px solid rgba(212,175,114,0.35)',
              borderRadius: '12px',
            } : {
              background: 'rgba(255,255,255,0.07)',
              color: '#fff', border: '1px solid rgba(255,255,255,0.12)',
              borderRadius: '12px',
            }}>
            {pkg.cta}
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </motion.div>
    </motion.div>
  );
}

function CheckCell({ value }) {
  if (value === true) return <span className="text-[#B8955B] text-base">✓</span>;
  if (value === false) return <span className="text-white/20">—</span>;
  return <span className="text-white/70 text-xs font-body">{value}</span>;
}

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function SelfPublishingPackages() {
  const [openFaq, setOpenFaq] = useState(null);
  const [activeStep, setActiveStep] = useState(null);
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const heroY = useTransform(scrollYProgress, [0, 1], ['0%', '25%']);

  return (
    <div style={{ background: '#070B12' }}>
      <PageMeta
        title="Affordable Self-Publishing Packages in South Africa"
        description="Affordable self-publishing packages in South Africa. Bronze R21,000, Silver R25,500, Gold R35,000 — editing, design and printing included."
        description="Self-publishing packages for South African authors. Bronze R21,000, Silver R25,500, Gold R35,000 — editing, design, printing all included."
        canonical="https://creativebooks.co.za/self-publishing-packages-in-south-africa"
      />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context": "https://schema.org", "@type": "FAQPage",
        "mainEntity": faqs.map(f => ({ "@type": "Question", "name": f.q, "acceptedAnswer": { "@type": "Answer", "text": f.a } }))
      }) }} />

      {/* ══════════════════════════════════════════════════════
          1. HERO — full-dark, parallax, animated orbs
      ══════════════════════════════════════════════════════ */}
      <section ref={heroRef} className="relative min-h-screen flex items-center overflow-hidden">
        <motion.div style={{ y: heroY }} className="absolute inset-0">
          <GlowOrb style={{ top: '-10%', left: '-5%', width: 700, height: 700, background: 'radial-gradient(circle, rgba(184,149,91,0.18) 0%, transparent 65%)' }} />
          <GlowOrb style={{ bottom: '0%', right: '-10%', width: 600, height: 600, background: 'radial-gradient(circle, rgba(80,120,220,0.1) 0%, transparent 65%)' }} />
          <GlowOrb style={{ top: '40%', left: '45%', width: 400, height: 400, background: 'radial-gradient(circle, rgba(184,149,91,0.07) 0%, transparent 65%)' }} />
        </motion.div>

        {/* Subtle grid overlay */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.03]"
          style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)', backgroundSize: '60px 60px' }} />

        <div className="absolute top-0 left-0 right-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(184,149,91,0.5), transparent)' }} />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 pt-32 pb-24 w-full">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div initial={{ opacity: 0, x: -40 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8, ease: 'easeOut' }}>
              <motion.div
                initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                className="inline-flex items-center gap-2 px-4 py-2 mb-6 text-[10px] font-semibold tracking-[0.25em] uppercase"
                style={{ background: 'rgba(184,149,91,0.12)', border: '1px solid rgba(184,149,91,0.3)', borderRadius: '100px', color: '#B8955B' }}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-[#B8955B] animate-pulse" />
                South Africa · Johannesburg · Gauteng
              </motion.div>

              <h1 className="font-heading text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-[1.02] mb-6">
                Affordable Self-Publishing Packages in South Africa
              </h1>

              <p className="text-white/55 text-base font-body leading-relaxed mb-8 max-w-lg">
                Complete book production packages for South African authors. Editing, design, layout, printing and publishing guidance — all in one structured package.
              </p>

              <div className="flex flex-wrap gap-3 mb-10">
                {['100–200 Copies', 'A5 Format', 'Once-Off Price', 'Full Production'].map((tag, i) => (
                  <motion.span key={tag} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.4 + i * 0.07 }}
                    className="px-3 py-1.5 text-[11px] font-body font-medium text-white/60"
                    style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px' }}>
                    {tag}
                  </motion.span>
                ))}
              </div>

              <div className="flex flex-wrap gap-4">
                <Link to="/getquote"
                  className="group inline-flex items-center gap-2 px-8 py-4 text-sm font-semibold text-white transition-all"
                  style={{ background: 'linear-gradient(135deg, #B8955B, #d4af72)', boxShadow: '0 12px 40px rgba(184,149,91,0.4)', borderRadius: '12px' }}>
                  Request a Package Quote
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
                <a href="#pricing"
                  className="inline-flex items-center gap-2 px-8 py-4 text-white/70 text-sm font-medium transition-all hover:text-white"
                  style={{ border: '1px solid rgba(255,255,255,0.12)', borderRadius: '12px', background: 'rgba(255,255,255,0.04)' }}>
                  View Packages
                </a>
              </div>
            </motion.div>

            {/* Right: Floating stats cards */}
            <motion.div initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8, delay: 0.2 }}
              className="hidden lg:grid grid-cols-2 gap-4">
              {[
                { num: '3', label: 'Publishing Packages', sub: 'Bronze · Silver · Gold' },
                { num: '100+', label: 'Printed Copies', sub: 'Per Package' },
                { num: 'A5', label: 'Professional Format', sub: 'Cream Paper Included' },
                { num: '6', label: 'Step Process', sub: 'Manuscript to Book' },
              ].map((stat, i) => (
                <motion.div key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 + i * 0.1 }}
                  whileHover={{ y: -4, transition: { duration: 0.2 } }}
                  className="p-6"
                  style={{ background: 'rgba(255,255,255,0.04)', backdropFilter: 'blur(24px)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px' }}>
                  <div className="font-heading text-3xl font-bold mb-1" style={{ color: '#B8955B' }}>{stat.num}</div>
                  <div className="font-heading text-sm font-semibold text-white mb-1">{stat.label}</div>
                  <div className="text-[11px] font-body text-white/35">{stat.sub}</div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>

        {/* Bottom fade */}
        <div className="absolute bottom-0 left-0 right-0 h-32 pointer-events-none"
          style={{ background: 'linear-gradient(to bottom, transparent, #070B12)' }} />
      </section>

      {/* ══════════════════════════════════════════════════════
          2. WHAT'S INCLUDED — animated flip cards on dark bg
      ══════════════════════════════════════════════════════ */}
      <section className="relative py-24 overflow-hidden">
        <GlowOrb style={{ top: '20%', right: '5%', width: 500, height: 500, background: 'radial-gradient(circle, rgba(80,120,220,0.07) 0%, transparent 65%)' }} />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-16 max-w-xl">
            <span className="text-[#B8955B] text-xs tracking-[0.3em] uppercase font-body block mb-4">What's Included</span>
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-white mb-4 leading-tight">What Our Packages Can Include</h2>
            <p className="text-white/45 font-body text-sm leading-relaxed">Every package is built around the most critical stages of book production.</p>
          </motion.div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {includedCards.map((card, i) => (
              <motion.div key={card.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
                className="group relative p-7 overflow-hidden"
                style={{ background: 'rgba(255,255,255,0.04)', backdropFilter: 'blur(24px)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '18px', cursor: 'default' }}>
                {/* Hover glow */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                  style={{ background: 'linear-gradient(135deg, rgba(184,149,91,0.06) 0%, transparent 60%)' }} />
                <div className="absolute top-0 left-6 right-6 h-px opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  style={{ background: 'linear-gradient(90deg, transparent, rgba(184,149,91,0.5), transparent)' }} />
                <span className="text-3xl mb-5 block">{card.icon}</span>
                <h3 className="font-heading text-base font-bold text-white mb-2">{card.title}</h3>
                <p className="text-xs font-body text-white/45 leading-relaxed">{card.body}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          3. PRICING — immersive dark glass cards
      ══════════════════════════════════════════════════════ */}
      <section id="pricing" className="relative py-28 overflow-hidden">
        <GlowOrb style={{ top: '0%', left: '30%', width: 800, height: 400, background: 'radial-gradient(ellipse, rgba(184,149,91,0.08) 0%, transparent 60%)' }} />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-16 text-center">
            <span className="text-[#B8955B] text-xs tracking-[0.3em] uppercase font-body block mb-4">Pricing</span>
            <h2 className="font-heading text-3xl md:text-5xl font-bold text-white mb-3 leading-tight">Choose Your Package</h2>
            <p className="text-white/40 font-body text-sm">Once-off pricing. No hidden costs. South African authors.</p>
          </motion.div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
            {packages.map((pkg, i) => <PricingCard key={pkg.title} pkg={pkg} i={i} />)}
          </div>

          {/* Nudge bar */}
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
            className="flex flex-col md:flex-row items-center justify-between gap-6 px-8 py-6"
            style={{ background: 'rgba(184,149,91,0.07)', backdropFilter: 'blur(24px)', border: '1px solid rgba(184,149,91,0.2)', borderRadius: '16px' }}>
            <div className="flex items-center gap-4">
              <Zap className="w-5 h-5 text-[#B8955B] shrink-0" />
              <div>
                <h3 className="font-heading text-base font-bold text-white mb-0.5">Not sure which package fits your book?</h3>
                <p className="text-xs font-body text-white/45 leading-relaxed">Tell us your page count, genre and goals — we'll guide you to the right package.</p>
              </div>
            </div>
            <Link to="/getquote" className="shrink-0 inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold text-[#0B1220] transition-all group"
              style={{ background: 'linear-gradient(135deg, #B8955B, #d4af72)', borderRadius: '10px', boxShadow: '0 8px 24px rgba(184,149,91,0.3)' }}>
              Get a Custom Quote <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          4. COMPARISON TABLE — glass dark
      ══════════════════════════════════════════════════════ */}
      <section className="relative py-24 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-12">
            <span className="text-[#B8955B] text-xs tracking-[0.3em] uppercase font-body block mb-4">Compare</span>
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-white mb-3 leading-tight">Compare All Packages</h2>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="overflow-x-auto rounded-2xl"
            style={{ background: 'rgba(255,255,255,0.03)', backdropFilter: 'blur(24px)', border: '1px solid rgba(255,255,255,0.08)', boxShadow: '0 24px 48px rgba(0,0,0,0.5)' }}>
            <table className="w-full min-w-[600px]">
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                  <th className="text-left px-6 py-5 font-body text-xs font-semibold text-white/30 uppercase tracking-[0.15em]">Feature</th>
                  <th className="text-center px-6 py-5 font-heading text-sm font-bold text-white/70 uppercase">Bronze</th>
                  <th className="text-center px-6 py-5 font-heading text-sm font-bold uppercase" style={{ color: '#B8955B' }}>Silver ✦</th>
                  <th className="text-center px-6 py-5 font-heading text-sm font-bold text-white/70 uppercase">Gold</th>
                </tr>
              </thead>
              <tbody>
                {comparisonRows.map((row, i) => (
                  <motion.tr key={row.feature}
                    initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: i * 0.03 }}
                    className="group"
                    style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                    <td className="px-6 py-4 font-body text-xs font-medium text-white/50 group-hover:text-white/70 transition-colors">{row.feature}</td>
                    <td className="px-6 py-4 text-center"><CheckCell value={row.bronze} /></td>
                    <td className="px-6 py-4 text-center" style={{ background: 'rgba(184,149,91,0.04)' }}><CheckCell value={row.silver} /></td>
                    <td className="px-6 py-4 text-center"><CheckCell value={row.gold} /></td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </motion.div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          5. PROCESS — interactive timeline
      ══════════════════════════════════════════════════════ */}
      <section className="relative py-28 overflow-hidden">
        <GlowOrb style={{ bottom: '10%', left: '10%', width: 600, height: 400, background: 'radial-gradient(ellipse, rgba(184,149,91,0.07) 0%, transparent 60%)' }} />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-16">
            <span className="text-[#B8955B] text-xs tracking-[0.3em] uppercase font-body block mb-4">How It Works</span>
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-white mb-3 leading-tight">From Manuscript to Printed Book</h2>
          </motion.div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {processSteps.map((step, i) => (
              <motion.div key={step.num}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.09 }}
                onHoverStart={() => setActiveStep(i)}
                onHoverEnd={() => setActiveStep(null)}
                className="relative p-8 overflow-hidden cursor-default"
                style={{
                  background: activeStep === i ? 'rgba(184,149,91,0.08)' : 'rgba(255,255,255,0.04)',
                  backdropFilter: 'blur(24px)',
                  border: `1px solid ${activeStep === i ? 'rgba(184,149,91,0.35)' : 'rgba(255,255,255,0.07)'}`,
                  borderRadius: '18px',
                  transition: 'all 0.3s ease',
                }}>
                <div className="absolute top-5 right-6 font-heading text-6xl font-bold" style={{ color: 'rgba(255,255,255,0.03)' }}>{step.num}</div>
                <motion.div
                  className="w-10 h-10 flex items-center justify-center rounded-xl mb-5"
                  style={{ background: activeStep === i ? '#B8955B' : 'rgba(184,149,91,0.12)', border: '1px solid rgba(184,149,91,0.3)', transition: 'background 0.3s' }}>
                  <span className="font-heading text-sm font-bold" style={{ color: activeStep === i ? '#0B1220' : '#B8955B' }}>{step.num}</span>
                </motion.div>
                <h3 className="font-heading text-base font-bold text-white mb-2">{step.title}</h3>
                <p className="text-xs font-body text-white/45 leading-relaxed">{step.body}</p>
                <ChevronRight className="absolute bottom-6 right-6 w-4 h-4 opacity-0 text-[#B8955B]" style={{ opacity: activeStep === i ? 1 : 0, transition: 'opacity 0.3s' }} />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          6. WHO IT'S FOR — animated tag cloud
      ══════════════════════════════════════════════════════ */}
      <section className="relative py-24 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
              <span className="text-[#B8955B] text-xs tracking-[0.3em] uppercase font-body block mb-5">Author Types</span>
              <h2 className="font-heading text-3xl md:text-4xl font-bold text-white mb-5 leading-tight">Who These Packages Are For</h2>
              <p className="text-white/45 font-body text-sm leading-relaxed mb-8">Our self publishing packages are designed for authors who want a structured and professional way to publish their books — for personal, professional, creative or ministry purposes.</p>
              <Link to="/getquote" className="group inline-flex items-center gap-2 px-7 py-4 text-sm font-semibold text-white transition-all"
                style={{ background: 'rgba(184,149,91,0.15)', border: '1px solid rgba(184,149,91,0.35)', borderRadius: '12px' }}>
                Request a Package Quote <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </motion.div>
            <div className="flex flex-wrap gap-2">
              {authorTypes.map((type, i) => (
                <motion.span key={type}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.04 }}
                  whileHover={{ scale: 1.05, transition: { duration: 0.15 } }}
                  className="px-4 py-2.5 text-xs font-body font-medium text-white/65 cursor-default"
                  style={{ background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,0.09)', borderRadius: '8px' }}>
                  {type}
                </motion.span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          7. SEO TEXT — minimal dark
      ══════════════════════════════════════════════════════ */}
      <section className="relative py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="p-10 md:p-14"
            style={{ background: 'rgba(255,255,255,0.03)', backdropFilter: 'blur(24px)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '24px' }}>
            <div className="grid lg:grid-cols-2 gap-10 items-center">
              <div>
                <span className="text-[#B8955B] text-xs tracking-[0.3em] uppercase font-body block mb-5">Johannesburg · South Africa</span>
                <h2 className="font-heading text-3xl font-bold text-white mb-5 leading-tight">Self Publishing Packages in Johannesburg and South Africa</h2>
                <p className="text-white/45 font-body text-sm leading-relaxed mb-4">If you are looking for self publishing packages in South Africa, Creative Books SA offers complete publishing solutions for authors who want professional editing, book cover design, layout, printing and publishing guidance.</p>
                <p className="text-white/40 font-body text-sm leading-relaxed">We support authors in Johannesburg, Gauteng and across South Africa. Whether you need 100, 150 or 200 copies, our Bronze, Silver and Gold packages give you a clear route from manuscript to printed book.</p>
              </div>
              <div className="flex flex-col gap-4">
                {[
                  { icon: Shield, title: 'Professional Book Production', body: 'Complete services from editing through to print.' },
                  { icon: Layers, title: 'Structured Package Pricing', body: 'Once-off pricing covering all major production stages.' },
                  { icon: Users, title: 'South African Authors', body: 'Supporting authors in Johannesburg, Gauteng and nationwide.' },
                ].map((item, i) => {
                  const Icon = item.icon;
                  return (
                    <motion.div key={item.title} initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}
                      className="flex items-start gap-4 p-4"
                      style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '12px' }}>
                      <div className="w-9 h-9 flex items-center justify-center shrink-0" style={{ background: 'rgba(184,149,91,0.12)', border: '1px solid rgba(184,149,91,0.25)', borderRadius: '10px' }}>
                        <Icon className="w-4 h-4 text-[#B8955B]" strokeWidth={1.5} />
                      </div>
                      <div>
                        <h3 className="font-heading text-sm font-bold text-white mb-1">{item.title}</h3>
                        <p className="text-xs text-white/40 font-body leading-relaxed">{item.body}</p>
                      </div>
                    </motion.div>
                  );
                })}
                <Link to="/getquote" className="group mt-2 inline-flex items-center gap-2 px-6 py-3.5 text-sm font-semibold text-[#0B1220] transition-all self-start"
                  style={{ background: 'linear-gradient(135deg, #B8955B, #d4af72)', borderRadius: '10px', boxShadow: '0 8px 24px rgba(184,149,91,0.3)' }}>
                  Start Your Quote <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          8. FAQ — full dark glass
      ══════════════════════════════════════════════════════ */}
      <section className="relative py-28 overflow-hidden">
        <GlowOrb style={{ top: '20%', right: '0%', width: 500, height: 500, background: 'radial-gradient(circle, rgba(184,149,91,0.06) 0%, transparent 65%)' }} />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-16 items-start">
            <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="lg:col-span-2 lg:sticky lg:top-28">
              <span className="text-[#B8955B] text-xs tracking-[0.3em] uppercase font-body block mb-5">FAQ</span>
              <h2 className="font-heading text-3xl md:text-4xl font-bold text-white mb-5 leading-tight">Self Publishing<br />Packages FAQs</h2>
              <p className="text-white/40 font-body text-sm leading-relaxed mb-8 max-w-xs">Have more questions? Contact us for a personalised answer.</p>
              <Link to="/contact" className="group inline-flex items-center gap-2 px-6 py-3 text-sm font-medium text-white/70 hover:text-white transition-colors"
                style={{ border: '1px solid rgba(255,255,255,0.12)', borderRadius: '10px', background: 'rgba(255,255,255,0.04)' }}>
                Contact Us <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <div className="mt-10 h-px w-20" style={{ background: 'linear-gradient(90deg, #B8955B, transparent)' }} />
            </motion.div>
            <div className="lg:col-span-3 space-y-2">
              {faqs.map((faq, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.04 }}>
                  <FAQItem faq={faq} i={i} open={openFaq} setOpen={setOpenFaq} />
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          9. FINAL CTA — immersive glass panel
      ══════════════════════════════════════════════════════ */}
      <section className="relative py-28 overflow-hidden">
        <GlowOrb style={{ top: '0%', left: '20%', width: 800, height: 500, background: 'radial-gradient(ellipse, rgba(184,149,91,0.1) 0%, transparent 60%)' }} />
        <div className="absolute top-0 left-0 right-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(184,149,91,0.4), transparent)' }} />
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="relative p-12 md:p-20 overflow-hidden"
            style={{ background: 'rgba(255,255,255,0.04)', backdropFilter: 'blur(40px)', border: '1px solid rgba(184,149,91,0.2)', borderRadius: '28px', boxShadow: '0 40px 80px rgba(0,0,0,0.6)' }}>
            <div className="absolute inset-0 pointer-events-none"
              style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(184,149,91,0.08) 0%, transparent 60%)' }} />
            <div className="absolute top-0 left-12 right-12 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(184,149,91,0.5), transparent)' }} />
            <span className="text-[#B8955B] text-xs tracking-[0.3em] uppercase font-body block mb-6">Start Your Journey</span>
            <h2 className="font-heading text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">Ready to Start Your<br />Publishing Journey?</h2>
            <p className="text-white/45 font-body text-sm leading-relaxed mb-10 max-w-md mx-auto">Your manuscript deserves a professional path to print. Choose Bronze, Silver or Gold and we'll guide you every step of the way.</p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link to="/getquote" className="group inline-flex items-center gap-2 px-10 py-5 text-sm font-bold text-[#0B1220] transition-all"
                style={{ background: 'linear-gradient(135deg, #B8955B, #d4af72)', boxShadow: '0 16px 48px rgba(184,149,91,0.45)', borderRadius: '14px' }}>
                Request a Package Quote
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link to="/getquote" className="group inline-flex items-center gap-2 px-8 py-4 text-sm font-medium text-white/70 hover:text-white transition-colors"
                style={{ border: '1px solid rgba(255,255,255,0.12)', borderRadius: '14px', background: 'rgba(255,255,255,0.04)' }}>
                Speak to Our Team
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      <InternalLinks links={[
        { label: 'Book Printing Johannesburg', path: '/book-printing-johannesburg' },
        { label: 'Book Editing Services', path: '/book-editing' },
        { label: 'Proofreading Services', path: '/proofreading' },
        { label: 'Book Cover Design', path: '/book-cover-design' },
        { label: 'Book Layout & Typesetting', path: '/typesetting' },
        { label: 'eBook Formatting', path: '/ebook-publishing' },
        { label: 'Author Website Design', path: '/author-websites' },
        { label: 'Ghost Writing Services', path: '/ghostwriting' },
        { label: 'Self Publishing South Africa', path: '/self-publishing-south-africa' },
        { label: 'Request a Quote', path: '/getquote' },
      ]} />
    </div>
  );
}