import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowRight, Check, Plus, Minus, ChevronDown,
  BookOpen, Eye, AlignLeft, Feather, Shield, Star, Award, Sparkles
} from 'lucide-react';
import InternalLinks from '../../components/shared/InternalLinks';
import PageMeta from '../../components/shared/PageMeta';

// ─── Data ─────────────────────────────────────────────────────────────────────
const coverageCards = [
  {
    icon: Eye,
    title: 'Spelling and Grammar',
    body: 'We check your manuscript for spelling mistakes, grammar errors, typing errors and incorrect word usage.',
  },
  {
    icon: AlignLeft,
    title: 'Punctuation and Tenses',
    body: 'We review punctuation, tense consistency and sentence-level errors that may affect the flow of your writing.',
  },
  {
    icon: Feather,
    title: 'Suggestions-Based Editing',
    body: 'Where needed, we provide visible suggestions so you can review changes and understand the improvements made.',
  },
  {
    icon: Star,
    title: 'Best Interpretations',
    body: 'We help refine unclear wording where a small correction can improve meaning without changing your author voice.',
  },
];

const processSteps = [
  {
    num: '01',
    title: 'Choose A Package',
    body: 'Choose our proofreading package and unlock the full potential of your manuscript, transforming it into a polished masterpiece ready to captivate readers and stand out in the competitive literary landscape.',
  },
  {
    num: '02',
    title: 'Get A Quote',
    body: 'Request a quote and take the first step towards refining your manuscript into a professional, publishable work that showcases your unique voice and vision.',
  },
  {
    num: '03',
    title: 'Sign the Contract',
    body: 'Sign the contract to secure expert proofreading services that will elevate your manuscript to its fullest potential, ensuring it shines brightly in the eyes of readers and publishers alike.',
  },
  {
    num: '04',
    title: 'Send the Word Doc Manuscript Electronically',
    body: 'Send us your manuscript in a Word document and let our experienced proofreaders work through your writing, correcting errors and preparing it for the next stage of publishing.',
  },
  {
    num: '05',
    title: 'Sign-Off',
    body: 'Upon signing off on the project, witness your manuscript\'s transformation into a polished gem, carefully refined through our proofreading package to showcase your unique voice and captivate readers from the very first page.',
  },
];

const pricing = [
  {
    title: 'Essential Proofreading',
    price: 'R0.25',
    cents: '25c',
    badge: null,
    popular: false,
    bestFor: 'Authors who need a final spelling, grammar and punctuation check before publishing.',
    includes: [
      '2x Drafts',
      'Spell & Grammar Check',
      'Punctuation Check',
      'Tense Check',
      'Suggestions',
      'Best Interpretations',
      'Suggestions-visible version',
      'Final cleaned version',
    ],
    process: [
      '50% upfront payment',
      'Word document accepted',
      'Suggestions visible version included',
      'Final accepted version included',
    ],
    cta: 'Get Started',
  },
  {
    title: 'Professional Proofreading',
    price: 'R0.30',
    cents: '30c',
    badge: null,
    popular: false,
    bestFor: 'Authors who need proofreading plus stronger consistency and readability checks before layout or printing.',
    includes: [
      'Everything in Essential Proofreading',
      'Grammar and punctuation correction',
      'Spelling and typo correction',
      'Consistency checks',
      'Sentence clarity suggestions',
      'Repeated error checks',
      'Two returned manuscript versions',
      'One review period',
    ],
    process: [
      '50% upfront payment',
      'Word document or Google Docs accepted',
      'Suggestions editing included',
      'Final cleaned version included',
    ],
    cta: 'Choose Package',
  },
  {
    title: 'Premium Proofreading and Final Polish',
    price: 'R0.35',
    cents: '35c',
    badge: 'Recommended',
    popular: true,
    bestFor: 'Authors who want a more careful final polish before professional publishing, typesetting, printing or ebook formatting.',
    includes: [
      'Everything in Professional Proofreading',
      'Final manuscript polish',
      'Readability improvement suggestions',
      'Light sentence refinement',
      'Style consistency checks',
      'Formatting comments where needed',
      'Publication-readiness review',
      'Two returned manuscript versions',
    ],
    process: [
      '50% upfront payment',
      'Full manuscript proofreading',
      'Suggestions-visible version included',
      'Final cleaned version included',
      'One week review period per 30,000 words',
    ],
    cta: 'Request Premium Proofreading',
  },
];

const whyCards = [
  {
    icon: BookOpen,
    title: 'Cleaner Writing',
    body: 'Proofreading removes distracting errors so readers can focus on your message.',
  },
  {
    icon: Shield,
    title: 'Stronger Credibility',
    body: 'A clean manuscript helps your book feel more professional and trustworthy.',
  },
  {
    icon: Sparkles,
    title: 'Publishing Confidence',
    body: 'Proofreading gives you more confidence before your book moves into layout, printing or publishing.',
  },
];

const authorTypes = [
  'Novel authors', 'Memoir writers', 'Christian authors', 'Poetry authors',
  'Business book authors', 'Inspirational writers', "Children's book authors",
  'Academic writers', 'Entrepreneurs', 'Coaches and speakers',
  'Pastors and ministry leaders', 'Self-published authors',
];

const faqs = [
  { q: 'What is proofreading?', a: 'Proofreading is the final review of a manuscript before publishing. It focuses on spelling, grammar, punctuation, typing errors, tense consistency and small language corrections.' },
  { q: 'Is proofreading the same as editing?', a: 'No. Proofreading focuses on final corrections, while editing may go deeper into sentence flow, structure, tone, content and readability. If your manuscript needs deeper improvement, copy editing or line editing may be more suitable.' },
  { q: 'When should I proofread my manuscript?', a: 'Proofreading should be done when your manuscript is complete and close to ready for layout, printing or digital publishing.' },
  { q: 'How is proofreading pricing calculated?', a: 'Proofreading pricing is calculated per word based on the selected package.' },
  { q: 'Do I need to send my manuscript as a Word document?', a: 'Yes. Manuscripts are usually sent electronically as a Word document so changes and suggestions can be reviewed clearly.' },
  { q: 'Can proofreading be done before book printing?', a: 'Yes. Proofreading is recommended before typesetting, layout and book printing to reduce errors in the final printed book.' },
  { q: 'Do you offer proofreading outside Johannesburg?', a: 'Yes. Creative Books SA assists authors in Johannesburg, Gauteng and across South Africa.' },
];

// ─── Sub-components ────────────────────────────────────────────────────────────
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
  return (
    <motion.div
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: i * 0.08 }}
      whileHover={{ y: -6, transition: { duration: 0.22 } }}
      className="relative flex flex-col overflow-hidden h-full"
      style={{
        background: pkg.popular ? 'linear-gradient(160deg, #ffffff 0%, #fdf9f4 100%)' : 'rgba(255,255,255,0.72)',
        backdropFilter: 'blur(24px)',
        border: pkg.popular ? '1.5px solid rgba(184,149,91,0.55)' : '1px solid rgba(255,255,255,0.88)',
        boxShadow: pkg.popular
          ? '0 24px 60px rgba(184,149,91,0.18), inset 0 1px 0 rgba(255,255,255,1)'
          : '0 8px 32px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,1)',
        borderRadius: '16px',
      }}
    >
      <div className="absolute top-0 left-4 right-4 h-px"
        style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,1), transparent)' }} />

      {pkg.badge && (
        <div className="absolute top-4 right-4">
          <span className="inline-flex items-center gap-1 px-2.5 py-1 text-[10px] font-semibold tracking-[0.15em] uppercase"
            style={{ background: 'linear-gradient(135deg, #0B1220 0%, #1a2a4a 100%)', color: '#D4AF72', border: '1px solid rgba(212,175,114,0.3)', borderRadius: '4px' }}>
            <Award className="w-2.5 h-2.5" />{pkg.badge}
          </span>
        </div>
      )}

      <div className="p-6 flex-1">
        <p className="text-[10px] font-semibold tracking-[0.25em] uppercase font-body mb-3"
          style={{ color: pkg.popular ? '#B8955B' : 'rgba(11,18,32,0.4)' }}>{pkg.title}</p>

        <div className="mb-1">
          <span className="font-heading text-4xl font-bold text-[#0B1220]">{pkg.price}</span>
          <span className="text-sm font-body ml-2 text-[#2B2B2B]/40">per word</span>
        </div>
        <p className="text-sm font-body mb-2" style={{ color: pkg.popular ? '#B8955B' : 'rgba(11,18,32,0.45)' }}>
          {pkg.cents} per word
        </p>
        <p className="text-xs font-body text-[#2B2B2B]/50 italic mb-5 leading-relaxed">{pkg.bestFor}</p>

        <div className="h-px mb-5" style={{ background: pkg.popular ? 'rgba(184,149,91,0.2)' : 'rgba(0,0,0,0.06)' }} />

        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] font-body mb-3 text-[#0B1220]/35">Includes</p>
        <ul className="space-y-2 mb-5">
          {pkg.includes.map(f => (
            <li key={f} className="flex items-start gap-2.5">
              <div className="w-4 h-4 rounded-full flex items-center justify-center shrink-0 mt-0.5"
                style={{ background: pkg.popular ? 'rgba(184,149,91,0.12)' : 'rgba(11,18,32,0.06)', border: `1px solid ${pkg.popular ? 'rgba(184,149,91,0.3)' : 'rgba(11,18,32,0.1)'}` }}>
                <Check className="w-2.5 h-2.5" style={{ color: pkg.popular ? '#B8955B' : '#0B1220' }} strokeWidth={2.5} />
              </div>
              <span className="text-xs font-body leading-relaxed text-[#2B2B2B]/70">{f}</span>
            </li>
          ))}
        </ul>

        <div className="h-px mb-4" style={{ background: pkg.popular ? 'rgba(184,149,91,0.15)' : 'rgba(0,0,0,0.05)' }} />
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] font-body mb-2 text-[#0B1220]/35">Process</p>
        <ul className="space-y-1.5">
          {pkg.process.map(p => (
            <li key={p} className="text-xs font-body text-[#2B2B2B]/50">· {p}</li>
          ))}
        </ul>
      </div>

      <div className="p-6 pt-0">
        <Link to="/getquote"
          className="block text-center py-3 px-5 text-sm font-semibold font-body transition-all"
          style={pkg.popular ? {
            background: 'linear-gradient(135deg, #0B1220, #1a2a4a)',
            color: '#fff', boxShadow: '0 8px 24px rgba(11,18,32,0.25)', borderRadius: '8px',
          } : {
            background: 'rgba(11,18,32,0.05)', color: '#0B1220',
            border: '1px solid rgba(11,18,32,0.12)', borderRadius: '8px',
          }}>
          {pkg.cta}
        </Link>
      </div>
    </motion.div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────
export default function Proofreading() {
  const [openFaq, setOpenFaq] = useState(null);

  return (
    <div style={{ background: '#f8f9fc' }}>
      <PageMeta
        title="Book Proofreading Services in South Africa | Per-Word Pricing"
        description="Final-stage manuscript proofreading for South African authors. Catch typos, grammar and formatting errors before printing. Per-word pricing available."
        canonical="https://www.creativebookssa.co.za/proofreading"
      />

      {/* FAQ Schema */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": faqs.map(f => ({ "@type": "Question", "name": f.q, "acceptedAnswer": { "@type": "Answer", "text": f.a } }))
      }) }} />

      {/* ── 1. HERO ── */}
      <section className="relative min-h-[65vh] flex items-end overflow-hidden"
        style={{ background: 'linear-gradient(160deg, #090E18 0%, #0d1830 60%, #111827 100%)' }}>
        <div className="absolute top-0 left-0 w-[600px] h-[400px] pointer-events-none"
          style={{ background: 'radial-gradient(ellipse at 20% 30%, rgba(184,149,91,0.12) 0%, transparent 60%)', filter: 'blur(40px)' }} />
        <div className="absolute bottom-0 right-0 w-[500px] h-[300px] pointer-events-none"
          style={{ background: 'radial-gradient(ellipse at 80% 80%, rgba(100,130,220,0.08) 0%, transparent 60%)', filter: 'blur(60px)' }} />
        <div className="absolute top-0 left-0 right-0 h-px"
          style={{ background: 'linear-gradient(90deg, transparent, rgba(184,149,91,0.6), transparent)' }} />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 pt-32 pb-20 w-full">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }} className="max-w-3xl">
            <span className="text-[#B8955B] text-xs font-body font-semibold tracking-[0.3em] uppercase mb-5 block">
              Proofreading Services · Johannesburg · South Africa
            </span>
            <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 leading-[1.05]">
              Professional Proofreading Services
            </h1>
            <p className="text-white/60 text-base font-body mb-4 font-medium">
              Professional Manuscript Proofreading for Authors Preparing to Publish
            </p>
            <p className="text-white/45 text-sm leading-relaxed font-body mb-6 max-w-2xl">
              Creative Books SA provides professional proofreading services in Johannesburg for authors who want their manuscripts to be clean, polished and ready for publishing. Proofreading is the final quality check before your book moves into typesetting, layout, printing or digital publishing.
            </p>
            <p className="text-white/40 text-sm leading-relaxed font-body mb-10 max-w-2xl">
              Our proofreading service helps correct spelling, grammar, punctuation, typing errors, tense inconsistencies and small language issues that can weaken the reader's experience. Whether you are publishing a novel, memoir, Christian book, poetry collection, business book, inspirational title or non-fiction manuscript, our proofreading support helps your writing look more professional before it reaches readers.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link to="/getquote"
                className="inline-flex items-center gap-2 px-8 py-4 text-white text-sm font-semibold transition-all group"
                style={{ background: '#B8955B', boxShadow: '0 12px 32px rgba(184,149,91,0.35)', borderRadius: '8px' }}>
                Request a Proofreading Quote
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <a href="#pricing"
                className="inline-flex items-center gap-2 px-8 py-4 text-white/80 text-sm font-medium transition-all"
                style={{ border: '1px solid rgba(255,255,255,0.15)', borderRadius: '8px', background: 'rgba(255,255,255,0.04)' }}>
                View Proofreading Packages
                <ChevronDown className="w-4 h-4" />
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── 2. TRUST STRIP ── */}
      <section className="relative py-10 overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #f0f4ff 0%, #eef1f7 100%)', borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { icon: Eye,      title: 'Final Manuscript Polish',      body: 'Correct spelling, grammar, punctuation and small language errors before publishing.' },
              { icon: BookOpen, title: 'Ideal Before Printing',        body: 'Prepare your manuscript before typesetting, layout and book printing.' },
              { icon: Feather,  title: 'Author-Focused Proofreading',  body: 'Support for authors in Johannesburg and across South Africa.' },
              { icon: Shield,   title: 'Two Returned Versions',        body: 'Receive a suggestions-visible version and a cleaned final version where applicable.' },
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

      {/* ── 3. INTRO ── */}
      <section className="py-20 lg:py-28" style={{ background: '#F8F5EF' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="max-w-3xl">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
              <span className="text-[#B8955B] text-xs tracking-[0.3em] uppercase font-body block mb-5">Why It Matters</span>
              <h2 className="font-heading text-3xl md:text-4xl font-bold text-[#0B1220] mb-6 leading-tight">
                Professional Book Proofreading for Authors
              </h2>
              <p className="text-[#2B2B2B]/60 font-body text-sm leading-relaxed mb-5">
                A finished manuscript still needs a careful final review before it becomes a published book. Even strong writing can contain small mistakes that distract readers, reduce credibility and affect the professional quality of the final product.
              </p>
              <p className="text-[#2B2B2B]/60 font-body text-sm leading-relaxed mb-5">
                Creative Books SA helps authors identify and correct surface-level errors before publishing. Our proofreading service focuses on spelling, grammar, punctuation, consistency and readability so your manuscript feels cleaner, sharper and more professional.
              </p>
              <p className="text-[#2B2B2B]/60 font-body text-sm leading-relaxed mb-8">
                If your book is almost ready for layout, printing or ebook publishing, proofreading is the final step that helps protect the quality of your work.
              </p>
              <Link to="/getquote"
                className="inline-flex items-center gap-2 px-7 py-3.5 text-white text-sm font-semibold transition-all group"
                style={{ background: '#0B1220', borderRadius: '8px', boxShadow: '0 8px 24px rgba(11,18,32,0.2)' }}>
                Request a Proofreading Quote
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── 4. WHAT'S INCLUDED ── */}
      <section className="py-20 lg:py-28 overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #f0f4ff 0%, #eef1f7 100%)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-14">
            <span className="text-[#B8955B] text-xs tracking-[0.3em] uppercase font-body block mb-4">What We Cover</span>
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-[#0B1220] mb-3 leading-tight">
              What Is Included in Our Proofreading Service?
            </h2>
            <p className="text-[#2B2B2B]/55 font-body text-sm max-w-2xl leading-relaxed">
              Our proofreading service is designed to give your manuscript a thorough final check before it moves into publishing.
            </p>
          </motion.div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {coverageCards.map((card, i) => {
              const Icon = card.icon;
              return (
                <motion.div key={card.title}
                  initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}
                  className="p-7"
                  style={{ background: 'rgba(255,255,255,0.75)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.9)', boxShadow: '0 4px 20px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,1)', borderRadius: '14px' }}>
                  <div className="w-10 h-10 flex items-center justify-center mb-5"
                    style={{ background: 'rgba(184,149,91,0.1)', border: '1px solid rgba(184,149,91,0.2)', borderRadius: '10px' }}>
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

      {/* ── 5. PROCESS ── */}
      <section className="py-20 lg:py-28"
        style={{ background: 'linear-gradient(160deg, #090E18 0%, #0d1830 100%)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-14">
            <span className="text-[#B8955B] text-xs tracking-[0.3em] uppercase font-body block mb-4">How It Works</span>
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-white mb-3 leading-tight">Our Proofreading Process</h2>
            <p className="text-white/40 font-body text-sm max-w-lg leading-relaxed">
              We follow a clear proofreading process to help authors understand what happens before, during and after the manuscript is reviewed.
            </p>
          </motion.div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {processSteps.map((step, i) => (
              <motion.div key={step.num}
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}
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

      {/* ── 6. PRICING ── */}
      <section id="pricing" className="py-20 lg:py-28 overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #f0f4ff 0%, #eef1f7 100%)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-14">
            <span className="text-[#B8955B] text-xs tracking-[0.3em] uppercase font-body block mb-4">Pricing</span>
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-[#0B1220] mb-2 leading-tight">Proofreading Packages</h2>
            <p className="text-[#2B2B2B]/50 font-body text-sm">Professional proofreading priced per word</p>
          </motion.div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-12">
            {pricing.map((pkg, i) => (
              <PricingCard key={pkg.title} pkg={pkg} i={i} />
            ))}
          </div>

          {/* ── 7. CONVERSION NUDGE ── */}
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
            className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 px-8 py-6"
            style={{ background: 'rgba(255,255,255,0.72)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.9)', boxShadow: '0 4px 20px rgba(0,0,0,0.06)', borderRadius: '12px' }}>
            <div>
              <h2 className="font-heading text-lg font-bold text-[#0B1220] mb-1">Not Sure Which Proofreading Package You Need?</h2>
              <p className="text-xs font-body text-[#2B2B2B]/60 leading-relaxed max-w-xl">
                If your manuscript is complete but you are not sure how much proofreading support it needs, send us your book details and we will guide you. Creative Books SA can help you choose the right proofreading package based on your manuscript length, genre and publishing stage.
              </p>
            </div>
            <Link to="/getquote"
              className="shrink-0 inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold text-white transition-all group"
              style={{ background: '#B8955B', borderRadius: '8px', boxShadow: '0 8px 20px rgba(184,149,91,0.3)' }}>
              Request a Proofreading Assessment
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ── 8. WHY PROOFREADING MATTERS ── */}
      <section className="py-20 lg:py-28" style={{ background: '#F8F5EF' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-12">
            <span className="text-[#B8955B] text-xs tracking-[0.3em] uppercase font-body block mb-4">Why It Matters</span>
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-[#0B1220] mb-5 leading-tight max-w-2xl">
              Why Proofreading Matters Before Publishing
            </h2>
            <p className="text-[#2B2B2B]/60 font-body text-sm leading-relaxed max-w-2xl mb-4">
              Small errors can affect how readers experience your book. Spelling mistakes, grammar issues, punctuation errors and inconsistent wording can make a manuscript feel unfinished, even when the message is strong.
            </p>
            <p className="text-[#2B2B2B]/60 font-body text-sm leading-relaxed max-w-2xl">
              Professional proofreading gives your manuscript a final layer of quality control before it is designed, printed or published online. For self-published authors, this step is especially important because your book represents your name, your message and your credibility.
            </p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {whyCards.map((card, i) => {
              const Icon = card.icon;
              return (
                <motion.div key={card.title}
                  initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}
                  className="p-7"
                  style={{ background: 'rgba(255,255,255,0.78)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.95)', boxShadow: '0 4px 20px rgba(0,0,0,0.06)', borderRadius: '14px' }}>
                  <div className="w-10 h-10 flex items-center justify-center mb-5"
                    style={{ background: 'rgba(184,149,91,0.1)', border: '1px solid rgba(184,149,91,0.2)', borderRadius: '10px' }}>
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

      {/* ── 9. WHO NEEDS PROOFREADING ── */}
      <section className="py-20 lg:py-24 overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #f0f4ff 0%, #eef1f7 100%)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-10">
            <span className="text-[#B8955B] text-xs tracking-[0.3em] uppercase font-body block mb-4">Author Types</span>
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-[#0B1220] mb-3 leading-tight">
              Proofreading for Different Types of Authors
            </h2>
            <p className="text-[#2B2B2B]/55 font-body text-sm max-w-xl leading-relaxed">
              Creative Books SA provides proofreading services for authors across different genres and publishing goals. Whether your book is personal, professional, creative or educational, our proofreading service helps prepare your manuscript for the final stages of publishing.
            </p>
          </motion.div>
          <div className="flex flex-wrap gap-2">
            {authorTypes.map((type, i) => (
              <motion.span key={type}
                initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: i * 0.04 }}
                className="px-4 py-2 text-xs font-body font-medium text-[#0B1220]"
                style={{ background: 'rgba(255,255,255,0.75)', backdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,0.9)', boxShadow: '0 2px 12px rgba(0,0,0,0.05)', borderRadius: '6px' }}>
                {type}
              </motion.span>
            ))}
          </div>
        </div>
      </section>

      {/* ── 10. SEO SECTION ── */}
      <section className="py-20" style={{ background: '#F8F5EF' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="max-w-3xl">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
              <span className="text-[#B8955B] text-xs tracking-[0.3em] uppercase font-body block mb-5">Johannesburg · South Africa</span>
              <h2 className="font-heading text-3xl md:text-4xl font-bold text-[#0B1220] mb-6 leading-tight">
                Book Proofreading Services in Johannesburg and South Africa
              </h2>
              <p className="text-[#2B2B2B]/60 font-body text-sm leading-relaxed mb-5">
                If you are looking for proofreading services in Johannesburg, Creative Books SA provides professional manuscript proofreading for authors who want to prepare their books for publishing. We help correct spelling, grammar, punctuation, tense errors and small language issues before your manuscript moves into typesetting, layout, book printing or ebook publishing.
              </p>
              <p className="text-[#2B2B2B]/60 font-body text-sm leading-relaxed mb-8">
                Our proofreading services are suitable for authors in Johannesburg, Gauteng and across South Africa. Whether you are publishing your first book or preparing another title for print, our team can help you polish your manuscript with care and professionalism.
              </p>
              <Link to="/getquote"
                className="inline-flex items-center gap-2 px-7 py-3.5 text-white text-sm font-semibold transition-all group"
                style={{ background: '#B8955B', borderRadius: '8px', boxShadow: '0 8px 24px rgba(184,149,91,0.3)' }}>
                Start Your Proofreading Quote
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── 11. FAQ ── */}
      <section className="py-20 lg:py-28 overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #f0f4ff 0%, #eef1f7 100%)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
            <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="lg:sticky lg:top-28">
              <span className="text-[#B8955B] text-xs tracking-[0.3em] uppercase font-body block mb-5">FAQ</span>
              <h2 className="font-heading text-3xl md:text-4xl font-bold text-[#0B1220] mb-4 leading-tight">Proofreading Services FAQs</h2>
              <p className="text-[#2B2B2B]/55 font-body text-sm leading-relaxed max-w-sm">Have more questions about our proofreading services? Contact us for a personalised answer.</p>
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

      {/* ── 12. FINAL CTA ── */}
      <section className="relative py-20 overflow-hidden"
        style={{ background: 'linear-gradient(160deg, #090E18 0%, #0d1830 100%)' }}>
        <div className="absolute top-0 left-0 right-0 h-px"
          style={{ background: 'linear-gradient(90deg, transparent, rgba(184,149,91,0.5), transparent)' }} />
        <div className="absolute bottom-0 left-0 right-0 h-px"
          style={{ background: 'linear-gradient(90deg, transparent, rgba(184,149,91,0.2), transparent)' }} />
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[600px] h-[400px] pointer-events-none"
          style={{ background: 'radial-gradient(ellipse, rgba(184,149,91,0.07) 0%, transparent 65%)', filter: 'blur(60px)' }} />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <span className="text-[#B8955B] text-xs tracking-[0.3em] uppercase font-body block mb-6">Ready to Polish?</span>
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-white mb-5 leading-tight">
              Ready to Polish Your Manuscript?
            </h2>
            <p className="text-white/45 font-body text-sm leading-relaxed mb-10 max-w-lg mx-auto">
              Your manuscript deserves a clean final review before it becomes a published book. Whether you need essential proofreading, professional proofreading or a premium final polish, Creative Books SA can help prepare your book with clarity, confidence and care.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link to="/getquote"
                className="inline-flex items-center gap-2 px-8 py-4 text-white text-sm font-semibold transition-all group"
                style={{ background: '#B8955B', boxShadow: '0 12px 32px rgba(184,149,91,0.35)', borderRadius: '8px' }}>
                Request a Proofreading Quote
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
        { label: 'Book Editing Services',      path: '/bookediting' },
        { label: 'Copy Editing',               path: '/copyediting' },
        { label: 'Line Editing',               path: '/bookediting' },
        { label: 'Academic Editing',           path: '/academicediting' },
        { label: 'Publishing Packages',        path: '/publishingpackages' },
        { label: 'Request a Quote',            path: '/getquote' },
      ]} light />
    </div>
  );
}