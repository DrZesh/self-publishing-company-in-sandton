import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Check, Plus, Minus, Award, Layers, PenTool, ShieldCheck, Mail, Sparkles, ScanSearch, RefreshCw } from 'lucide-react';
import InternalLinks from '../../components/shared/InternalLinks';
import PageMeta from '../../components/shared/PageMeta';
import { serviceSchema, faqSchema, breadcrumbSchema, authorSchema } from '../../lib/seo/schemas';

const EMAIL = 'hello@creativebooks.co.za';
const BOTTOM_EMAIL = 'info@creativebooks.co.za';

// ─── Data ─────────────────────────────────────────────────────────────────────
const aiSigns = [
  {
    text: '"This book stands as a testament to the enduring power of the human spirit."',
    why: 'A plain fact dressed up as a monument. AI inflates the importance of nearly everything it describes.',
  },
  {
    text: '"It\'s not just a memoir. It\'s a movement."',
    why: 'It corrects a belief the reader never held. This "not X, but Y" flip is one of the clearest signs of AI writing.',
  },
  {
    text: '"She moved to Cape Town in 2009, highlighting her commitment to a fresh start."',
    why: 'The second half interprets nothing and adds nothing. AI ends sentences with these tacked-on clauses over and over.',
  },
  {
    fragments: ['Everything changed.', 'Nothing was the same.', 'And she knew it.'],
    label: 'The three-word paragraph',
    why: 'Tiny fragments given their own paragraphs to force drama the writing has not earned. AI reaches for this far more than most authors do.',
  },
  {
    text: '"It was bold, brilliant, and unforgettable."',
    why: 'Three adjectives where one honest word would do. Once you notice how often AI writes in threes, you cannot unsee it.',
  },
  {
    text: '"According to a 2018 study, 73% of readers agree."',
    why: 'It looks precise and sourced, but very often the study does not exist. AI makes up figures and citations that only look real until you check them.',
  },
];

// Tiers used for both the interactive genre selector and the pricing cards
const tiers = [
  { key: 'audit', name: 'Audit', tagline: 'Detect & clean up', icon: ScanSearch, desc: 'We find the AI patterns in your draft and clean up the most obvious tells.' },
  { key: 'rebuild', name: 'Rebuild', tagline: 'Full rewrite in your voice', icon: RefreshCw, desc: 'A complete rewrite, structure and sentences, so the whole book reads like you.', popular: true },
  { key: 'recon', name: 'Reconstruction', tagline: 'Rewrite + developmental edit + fact-check', icon: ShieldCheck, desc: 'Everything in Rebuild plus a developmental edit and a check of every fact and source.' },
];

const genres = [
  { genre: 'Business & self-help', audit: 0.20, rebuild: 0.35, recon: 0.60 },
  { genre: 'General non-fiction', audit: 0.22, rebuild: 0.40, recon: 0.65 },
  { genre: 'Memoir & biography', audit: 0.25, rebuild: 0.45, recon: 0.75 },
  { genre: "Children's & YA", audit: 0.24, rebuild: 0.42, recon: 0.68 },
  { genre: 'Fiction / novels', audit: 0.28, rebuild: 0.50, recon: 0.80 },
  { genre: 'Academic & technical', audit: 0.30, rebuild: 0.55, recon: 0.90 },
];

const rand = (n) => `R${n.toFixed(2)}`;

const faqs = [
  { q: 'Will it still be my book?', a: 'Yes. We work from your material and match your voice, and we never invent facts, quotes, or sources to fill gaps.' },
  { q: 'Can you make it undetectable to AI checkers?', a: 'No, and be careful of anyone who promises that. AI checkers disagree with each other and often flag writing a person wrote. We rebuild the book for real readers, which is the honest thing that actually makes a difference.' },
  { q: 'Am I allowed to publish a book written with AI?', a: 'Yes. Amazon and most retailers allow it, but they ask you to tick a private AI box when you upload, which readers never see. They remove undisclosed, low-quality books, not carefully edited ones. This is not legal advice.' },
  { q: 'Is my manuscript kept private?', a: 'Yes. Your work is handled under POPIA, used only for your project, and never shared.' },
];

const rebuildSteps = [
  { icon: Layers, title: 'First the structure', body: 'We break up the machine\'s tidy, same-length paragraphs and its predictable intro-then-list-then-summary shape.' },
  { icon: PenTool, title: 'Then the sentences', body: 'One at a time, taking out the patterns above and putting real rhythm back in.' },
  { icon: ShieldCheck, title: 'Facts and sources', body: 'On the top tier, we also check the facts, names, and sources the AI may have invented.' },
];

// ─── FAQ Item ─────────────────────────────────────────────────────────────────
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

// ─── Pricing Card ─────────────────────────────────────────────────────────────
function PricingCard({ tier, price, i }) {
  const Icon = tier.icon;
  const popular = tier.popular;
  return (
    <motion.div initial={{ opacity: 0, y: 28 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}
      whileHover={{ y: -6, transition: { duration: 0.22 } }}
      className="relative flex flex-col overflow-hidden h-full"
      style={{
        background: popular ? 'linear-gradient(160deg, #ffffff 0%, #fdf9f4 100%)' : 'rgba(255,255,255,0.72)',
        backdropFilter: 'blur(24px)',
        border: popular ? '1.5px solid rgba(184,149,91,0.55)' : '1px solid rgba(255,255,255,0.88)',
        boxShadow: popular ? '0 24px 60px rgba(184,149,91,0.18), inset 0 1px 0 rgba(255,255,255,1)' : '0 8px 32px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,1)',
        borderRadius: '16px',
      }}>
      <div className="absolute top-0 left-4 right-4 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,1), transparent)' }} />
      {popular && (
        <div className="absolute top-4 right-4">
          <span className="inline-flex items-center gap-1 px-2.5 py-1 text-[10px] font-semibold tracking-[0.15em] uppercase"
            style={{ background: 'linear-gradient(135deg, #0B1220 0%, #1a2a4a 100%)', color: '#D4AF72', border: '1px solid rgba(212,175,114,0.3)', borderRadius: '4px' }}>
            <Award className="w-2.5 h-2.5" />Most Chosen
          </span>
        </div>
      )}
      <div className="p-6 flex-1">
        <div className="w-10 h-10 flex items-center justify-center mb-5" style={{ background: popular ? 'rgba(184,149,91,0.12)' : 'rgba(11,18,32,0.05)', border: `1px solid ${popular ? 'rgba(184,149,91,0.25)' : 'rgba(11,18,32,0.08)'}`, borderRadius: '10px' }}>
          <Icon className="w-5 h-5" style={{ color: popular ? '#B8955B' : '#0B1220' }} strokeWidth={1.5} />
        </div>
        <p className="text-[10px] font-semibold tracking-[0.25em] uppercase font-body mb-3" style={{ color: popular ? '#B8955B' : 'rgba(11,18,32,0.4)' }}>{tier.name}</p>
        <div className="mb-1">
          <span className="font-heading text-4xl font-bold text-[#0B1220]">{rand(price)}</span>
          <span className="text-sm font-body ml-2 text-[#0B1220]/40">per word</span>
        </div>
        <p className="text-sm font-body mb-5" style={{ color: popular ? '#B8955B' : 'rgba(11,18,32,0.4)' }}>{tier.tagline}</p>
        <div className="h-px mb-5" style={{ background: popular ? 'rgba(184,149,91,0.2)' : 'rgba(0,0,0,0.06)' }} />
        <p className="text-xs font-body text-[#2B2B2B]/65 leading-relaxed">{tier.desc}</p>
      </div>
      <div className="p-6 pt-0">
        <a href={`mailto:${EMAIL}?subject=${encodeURIComponent(`Free sample audit - ${tier.name}`)}`}
          className="block text-center py-3 px-5 text-sm font-semibold font-body transition-all"
          style={popular ? {
            background: 'linear-gradient(135deg, #0B1220, #1a2a4a)', color: '#fff', boxShadow: '0 8px 24px rgba(11,18,32,0.25)', borderRadius: '8px',
          } : {
            background: 'rgba(11,18,32,0.05)', color: '#0B1220', border: '1px solid rgba(11,18,32,0.12)', borderRadius: '8px',
          }}>
          Get a free quote
        </a>
      </div>
    </motion.div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function AIGeneratedBookEditing() {
  const [openFaq, setOpenFaq] = useState(null);
  const [selectedGenre, setSelectedGenre] = useState(genres[2]); // Memoir & biography default

  const schema = {
    '@context': 'https://schema.org',
    '@graph': [
      serviceSchema({
        name: 'AI Generated Book Editing and Manuscript Reconstruction',
        description: 'We rewrite AI-generated book manuscripts into natural prose in your own voice. Per-word pricing by genre, with a free sample audit of your first 1,000 words.',
        url: '/ai-generated-book-editing',
        areaServed: 'South Africa',
      }),
      faqSchema(faqs.map(f => ({ question: f.q, answer: f.a }))),
      breadcrumbSchema([
        { name: 'Home', path: '/' },
        { name: 'Editing', path: '/book-editing' },
        { name: 'AI Generated Books', path: '/ai-generated-book-editing' },
      ]),
      authorSchema({ name: 'Creative Books SA', description: 'AI generated book editing and manuscript reconstruction in South Africa' }),
    ],
  };

  return (
    <>
      <PageMeta
        title="AI-Generated Book Editing & Reconstruction | Creative Books"
        description="Drafted your book with AI? Creative Books rewrites AI-generated manuscripts into natural prose in your own voice. Per-word pricing by genre, free sample."
        keywords="AI generated books, AI generated book editing, rewrite AI manuscript, humanise AI book, AI book rewriting South Africa"
        canonical="https://creativebooks.co.za/ai-generated-book-editing"
        schema={schema}
      />
      <div style={{ background: '#f8f9fc' }}>

        {/* ── Hero / Banner ── */}
        <section className="relative min-h-[65vh] flex items-end overflow-hidden" style={{ background: 'linear-gradient(160deg, #090E18 0%, #0d1830 60%, #111827 100%)' }}>
          <img
            src="https://images.unsplash.com/photo-1455390582262-044cdead277a?w=1400&q=80"
            alt="Editor rewriting an AI-drafted book manuscript"
            className="absolute inset-0 w-full h-full object-cover opacity-20"
          />
          <div className="absolute top-0 left-0 w-[600px] h-[400px] pointer-events-none"
            style={{ background: 'radial-gradient(ellipse at 20% 30%, rgba(184,149,91,0.12) 0%, transparent 60%)', filter: 'blur(40px)' }} />
          <div className="absolute bottom-0 right-0 w-[500px] h-[300px] pointer-events-none"
            style={{ background: 'radial-gradient(ellipse at 80% 80%, rgba(100,130,220,0.08) 0%, transparent 60%)', filter: 'blur(60px)' }} />
          <div className="absolute top-0 left-0 right-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(184,149,91,0.6), transparent)' }} />
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 pt-32 pb-20 w-full">
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }} className="max-w-3xl">
              <span className="inline-flex items-center gap-2 text-[#B8955B] text-xs font-body font-semibold tracking-[0.3em] uppercase mb-5">
                <Sparkles className="w-3.5 h-3.5" /> AI Generated Books · South Africa
              </span>
              <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 leading-[1.05]">
                We rewrite books drafted with AI so they read like you wrote them.
              </h1>
              <p className="text-white/60 text-base font-body mb-10 font-medium max-w-2xl">
                AI-generated book editing and manuscript reconstruction, in your own voice.
              </p>
              <div className="flex flex-wrap gap-4">
                <a href={`mailto:${EMAIL}?subject=Free sample audit`} className="inline-flex items-center gap-2 px-8 py-4 text-white text-sm font-semibold transition-all group"
                  style={{ background: '#B8955B', boxShadow: '0 12px 32px rgba(184,149,91,0.35)', borderRadius: '8px' }}>
                  Get a free quote
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </a>
                <a href="#pricing" className="inline-flex items-center gap-2 px-8 py-4 text-white/80 text-sm font-medium transition-all"
                  style={{ border: '1px solid rgba(255,255,255,0.15)', borderRadius: '8px', background: 'rgba(255,255,255,0.04)' }}>
                  See pricing
                </a>
              </div>
            </motion.div>
          </div>
        </section>

        {/* ── Intro (elevated typography) ── */}
        <section className="py-20 lg:py-28" style={{ background: '#F8F5EF' }}>
          <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
              <span className="text-[#B8955B] text-xs tracking-[0.3em] uppercase font-body block mb-6">The Problem</span>
              <p className="font-heading text-2xl md:text-4xl font-bold text-[#0B1220] leading-[1.25]">
                If you used <span className="text-[#B8955B]">ChatGPT</span> or another AI tool to draft your book, it carries patterns that readers and platforms like <span className="text-[#B8955B]">Amazon</span> have learnt to spot.
              </p>
              <p className="font-body text-base md:text-lg text-[#2B2B2B]/60 leading-relaxed mt-8 max-w-2xl mx-auto">
                We take that draft and rebuild it into clean, natural prose in your own voice.
              </p>
              <p className="font-body text-sm md:text-base text-[#2B2B2B]/55 leading-relaxed mt-6 max-w-3xl mx-auto text-left">
                Many people thought the arrival of generative AI would be a win, and yes, it was, especially for drafting emails, contracts and the like. But people have taken it too far and started generating whole books with AI, which has lowered the quality of books in this new AI age. A year ago we started noticing that books coming into the market were far weaker, full of AI patterns and predictive writing styles, and the drop in quality has been steep. A tool that was meant to make things easier has ended up making authors look like amateurs. The books read as generic and have no voice. There is nothing wrong with using AI to help you with grammar, but it becomes a problem when the whole book looks generated with no real effort from the author. We help you rewrite your book in a professional way.
              </p>
            </motion.div>
          </div>
        </section>

        {/* ── Before / After comparison ── */}
        <section className="py-20 lg:py-28 overflow-hidden" style={{ background: 'linear-gradient(160deg, #090E18 0%, #0d1830 100%)' }}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-12 max-w-2xl">
              <span className="text-[#B8955B] text-xs tracking-[0.3em] uppercase font-body block mb-4">See The Difference</span>
              <h2 className="font-heading text-3xl md:text-4xl font-bold text-white mb-4 leading-tight">The same memoir, before and after</h2>
              <p className="text-white/45 font-body text-sm leading-relaxed">One is a machine draft. The other is the same story rebuilt in the author's own voice.</p>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {/* Before */}
              <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                className="p-8 flex flex-col"
                style={{ background: 'rgba(255,255,255,0.04)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px' }}>
                <span className="inline-flex items-center gap-2 text-xs font-semibold tracking-[0.2em] uppercase font-body mb-5" style={{ color: 'rgba(255,255,255,0.4)' }}>
                  <span className="w-2 h-2 rounded-full" style={{ background: '#8a94a8' }} /> Before · machine draft
                </span>
                <p className="font-heading text-lg italic leading-relaxed" style={{ color: 'rgba(255,255,255,0.5)' }}>
                  In today's fast-paced world, this memoir stands as a testament to the enduring power of the human spirit. It chronicles a remarkable journey from humble beginnings in a small Karoo town to a life of hard-won triumph. From childhood hardship to lasting success, every chapter underscores the importance of perseverance, highlighting the author's unwavering commitment to hope. It is not merely a book. It is a journey.
                </p>
              </motion.div>

              {/* After */}
              <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }}
                className="p-8 flex flex-col"
                style={{ background: 'linear-gradient(160deg, rgba(184,149,91,0.12) 0%, rgba(184,149,91,0.04) 100%)', backdropFilter: 'blur(20px)', border: '1.5px solid rgba(184,149,91,0.4)', boxShadow: '0 12px 40px rgba(184,149,91,0.12)', borderRadius: '16px' }}>
                <span className="inline-flex items-center gap-2 text-xs font-semibold tracking-[0.2em] uppercase font-body mb-5 text-[#D4AF72]">
                  <span className="w-2 h-2 rounded-full" style={{ background: '#D4AF72' }} /> After · rebuilt in the author's voice
                </span>
                <p className="font-heading text-lg leading-relaxed text-white">
                  I grew up in a small town in the Karoo, in a house where money was always short. I left at nineteen with one bag and no plan. This book is about the years between that morning and the day things finally came right. Some of it was hard to write. But I've told it straight, because that's the only way it's worth telling.
                </p>
              </motion.div>
            </div>
          </div>
        </section>

        {/* ── How to tell a book was written by AI ── */}
        <section className="py-20 lg:py-28 overflow-hidden" style={{ background: 'linear-gradient(135deg, #f0f4ff 0%, #eef1f7 100%)' }}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-12 max-w-3xl">
              <h2 className="font-heading text-3xl md:text-4xl font-bold text-[#0B1220] mb-4 leading-tight">How to tell a book was written by AI</h2>
              <p className="text-[#2B2B2B]/60 font-body text-sm leading-relaxed">
                None of these are wrong on their own. AI just uses them constantly, and when they stack up page after page, they give a book away. These are the ones we see most, based on the list <a href="https://en.wikipedia.org/wiki/Wikipedia:Signs_of_AI_writing" target="_blank" rel="noopener noreferrer" className="text-[#B8955B] font-semibold underline decoration-[#B8955B]/40 hover:decoration-[#B8955B]">Wikipedia's editors</a> put together from thousands of real examples.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {aiSigns.map((sign, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.06 }}
                  whileHover={{ y: -4, transition: { duration: 0.2 } }}
                  className="p-7 flex flex-col"
                  style={{ background: 'rgba(255,255,255,0.78)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.95)', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', borderRadius: '14px' }}>
                  {sign.label && (
                    <span className="text-[10px] font-semibold tracking-[0.2em] uppercase font-body text-[#B8955B] mb-3 block">{sign.label}</span>
                  )}
                  {sign.fragments ? (
                    <div className="mb-5 space-y-2">
                      {sign.fragments.map((f) => (
                        <p key={f} className="font-heading text-lg italic text-[#0B1220] leading-snug">{f}</p>
                      ))}
                    </div>
                  ) : (
                    <p className="font-heading text-lg italic text-[#0B1220] leading-snug mb-5">{sign.text}</p>
                  )}
                  <div className="mt-auto pt-4" style={{ borderTop: '1px solid rgba(0,0,0,0.06)' }}>
                    <h3 className="text-[10px] font-semibold tracking-[0.2em] uppercase font-body text-[#0B1220]/40 mb-2">Why it's AI</h3>
                    <p className="text-xs font-body text-[#2B2B2B]/55 leading-relaxed">{sign.why}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ── How we rewrite ── */}
        <section className="py-20 lg:py-28" style={{ background: 'linear-gradient(160deg, #090E18 0%, #0d1830 100%)' }}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-14 max-w-2xl">
              <span className="text-[#B8955B] text-xs tracking-[0.3em] uppercase font-body block mb-4">Our Approach</span>
              <h2 className="font-heading text-3xl md:text-4xl font-bold text-white mb-4 leading-tight">How we rewrite an AI-generated book</h2>
              <p className="text-white/45 font-body text-sm leading-relaxed">We work through the whole manuscript in your voice.</p>
            </motion.div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-10">
              {rebuildSteps.map((step, i) => {
                const Icon = step.icon;
                return (
                  <motion.div key={step.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}
                    className="p-7"
                    style={{ background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.08)', boxShadow: '0 8px 32px rgba(0,0,0,0.3)', borderRadius: '16px' }}>
                    <div className="w-10 h-10 flex items-center justify-center mb-5" style={{ background: 'rgba(184,149,91,0.12)', border: '1px solid rgba(184,149,91,0.25)', borderRadius: '10px' }}>
                      <Icon className="w-5 h-5 text-[#B8955B]" strokeWidth={1.5} />
                    </div>
                    <h3 className="font-heading text-base font-bold text-white mb-3">{step.title}</h3>
                    <p className="text-xs font-body text-white/45 leading-relaxed">{step.body}</p>
                  </motion.div>
                );
              })}
            </div>
            <motion.p initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
              className="text-white/50 font-body text-sm leading-relaxed max-w-3xl">
              Two rounds of revisions are included. You get the finished book as a Word file and a print-ready PDF. Everything is handled under POPIA and never used to train anything.
            </motion.p>
          </div>
        </section>

        {/* ── Pricing ── */}
        <section id="pricing" className="py-20 lg:py-28 overflow-hidden" style={{ background: 'linear-gradient(135deg, #f0f4ff 0%, #eef1f7 100%)' }}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-10 max-w-3xl">
              <span className="text-[#B8955B] text-xs tracking-[0.3em] uppercase font-body block mb-4">Pricing</span>
              <h2 className="font-heading text-3xl md:text-4xl font-bold text-[#0B1220] mb-4 leading-tight">Pricing per word, by genre</h2>
              <p className="text-[#2B2B2B]/60 font-body text-sm leading-relaxed mb-3">
                Priced per word, because that is what the work actually depends on. Rates vary by genre: fiction and academic books take more than straightforward non-fiction. Every project starts with a free sample of your first 1,000 words, so you get an exact quote before you commit. A 75% deposit reserves your slot; the balance is due on delivery.
              </p>
              <p className="text-[#2B2B2B]/60 font-body text-sm leading-relaxed">
                Memoirs include at least two voice interviews, see the note below.
              </p>
            </motion.div>

            {/* Interactive genre selector */}
            <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-8">
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] font-body text-[#0B1220]/40 mb-3">Choose your genre to see rates</p>
              <div className="flex flex-wrap gap-2">
                {genres.map((g) => {
                  const active = selectedGenre.genre === g.genre;
                  return (
                    <button key={g.genre} onClick={() => setSelectedGenre(g)}
                      className="px-4 py-2 text-xs font-body font-semibold transition-all"
                      style={active ? {
                        background: 'linear-gradient(135deg, #0B1220, #1a2a4a)', color: '#fff', borderRadius: '8px', boxShadow: '0 8px 20px rgba(11,18,32,0.2)',
                      } : {
                        background: 'rgba(255,255,255,0.75)', color: '#0B1220', border: '1px solid rgba(255,255,255,0.9)', borderRadius: '8px',
                      }}>
                      {g.genre}
                    </button>
                  );
                })}
              </div>
            </motion.div>

            {/* Pricing cards (matching site style) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
              {tiers.map((tier, i) => (
                <PricingCard key={tier.key} tier={tier} price={selectedGenre[tier.key]} i={i} />
              ))}
            </div>

            <p className="text-xs font-body text-[#2B2B2B]/55 leading-relaxed mb-12">
              Example: a 50,000-word memoir on the Rebuild tier works out to about R22,500. Most authors choose the Rebuild.
            </p>

            {/* Memoir callout */}
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              className="p-8"
              style={{ background: 'linear-gradient(160deg, #ffffff 0%, #fdf9f4 100%)', border: '1.5px solid rgba(184,149,91,0.4)', boxShadow: '0 12px 40px rgba(184,149,91,0.12)', borderRadius: '16px' }}>
              <h3 className="font-heading text-lg font-bold text-[#0B1220] mb-3">A note on memoirs</h3>
              <p className="text-sm font-body text-[#2B2B2B]/65 leading-relaxed">
                A life story lives in how you tell it, not only in what happened. So every memoir includes at least two interviews before we begin. Over a call or in person, we listen to your voice, your pacing, and the emotion behind the moments that matter most to you. What we hear there is what we build the rewrite around, and it is why a finished memoir sounds like you rather than a tidy summary of your life.
              </p>
            </motion.div>
          </div>
        </section>

        {/* ── FAQ ── */}
        <section className="py-20 lg:py-28 overflow-hidden" style={{ background: '#F8F5EF' }}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
              <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="lg:sticky lg:top-28">
                <span className="text-[#B8955B] text-xs tracking-[0.3em] uppercase font-body block mb-5">FAQ</span>
                <h2 className="font-heading text-3xl md:text-4xl font-bold text-[#0B1220] mb-4 leading-tight">Frequently asked questions</h2>
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

        {/* ── Bottom CTA ── */}
        <section className="relative py-20 overflow-hidden" style={{ background: 'linear-gradient(160deg, #090E18 0%, #0d1830 100%)' }}>
          <div className="absolute top-0 left-0 right-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(184,149,91,0.5), transparent)' }} />
          <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[600px] h-[400px] pointer-events-none"
            style={{ background: 'radial-gradient(ellipse, rgba(184,149,91,0.07) 0%, transparent 65%)', filter: 'blur(60px)' }} />
          <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
            <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
              <span className="text-[#B8955B] text-xs tracking-[0.3em] uppercase font-body block mb-6">Ready When You Are</span>
              <h2 className="font-heading text-3xl md:text-4xl font-bold text-white mb-5 leading-tight">Send us your first 1,000 words.</h2>
              <p className="text-white/45 font-body text-sm leading-relaxed mb-10 max-w-lg mx-auto">We will show you the AI patterns hiding in your own draft and quote the exact price.</p>
              <div className="flex flex-wrap items-center justify-center gap-4">
                <a href={`mailto:${BOTTOM_EMAIL}?subject=Free sample audit`} className="inline-flex items-center gap-2 px-8 py-4 text-white text-sm font-semibold transition-all group"
                  style={{ background: '#B8955B', boxShadow: '0 12px 32px rgba(184,149,91,0.35)', borderRadius: '8px' }}>
                  <Mail className="w-4 h-4" />
                  Get a free quote
                </a>
                <Link to="/book-editing" className="inline-flex items-center gap-2 px-8 py-4 text-white/70 text-sm transition-all"
                  style={{ border: '1px solid rgba(255,255,255,0.12)', borderRadius: '8px', background: 'rgba(255,255,255,0.04)' }}>
                  View Editing Services
                </Link>
              </div>
            </motion.div>
          </div>
        </section>

        <InternalLinks links={[
          { label: 'Book Editing Services', path: '/book-editing' },
          { label: 'Proofreading', path: '/proofreading' },
          { label: 'Ghostwriting', path: '/ghostwriting' },
          { label: 'Memoir Writing', path: '/memoirwriting' },
          { label: 'Contact Us', path: '/contact' },
          { label: 'Request a Quote', path: '/getquote' },
        ]} light />
      </div>
    </>
  );
}