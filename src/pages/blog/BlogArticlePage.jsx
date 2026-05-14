import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Clock, ChevronRight, Plus, Minus } from 'lucide-react';
import InternalLinks from '../../components/shared/InternalLinks';
import CTASection from '../../components/shared/CTASection';

// Shared layout for all blog articles
export default function BlogArticlePage({ article }) {
  const [openFaq, setOpenFaq] = useState(null);

  if (!article) return null;

  return (
    <div style={{ background: '#f8f5ef' }}>
      {/* JSON-LD Article Schema */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "Article",
        "headline": article.title,
        "description": article.description,
        "author": { "@type": "Organization", "name": "Creative Books SA" },
        "publisher": { "@type": "Organization", "name": "Creative Books SA", "url": "https://www.creativebooks.co.za" },
        "datePublished": article.datePublished || "2024-01-01",
        "url": `https://www.creativebooks.co.za${article.url}`,
        "mainEntityOfPage": { "@type": "WebPage", "@id": `https://www.creativebooks.co.za${article.url}` }
      }) }} />

      {/* FAQ Schema if present */}
      {article.faqs && article.faqs.length > 0 && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          "mainEntity": article.faqs.map(f => ({
            "@type": "Question",
            "name": f.q,
            "acceptedAnswer": { "@type": "Answer", "text": f.a }
          }))
        }) }} />
      )}

      {/* Breadcrumb Schema */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://www.creativebooks.co.za/" },
          { "@type": "ListItem", "position": 2, "name": "Blog", "item": "https://www.creativebooks.co.za/blog" },
          { "@type": "ListItem", "position": 3, "name": article.title, "item": `https://www.creativebooks.co.za${article.url}` }
        ]
      }) }} />

      {/* Hero */}
      <section className="relative pt-32 pb-20 overflow-hidden" style={{ background: 'linear-gradient(160deg, #090E18 0%, #0d1830 60%, #111827 100%)' }}>
        <div className="absolute top-0 left-0 right-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(184,149,91,0.6), transparent)' }} />
        <div className="absolute top-0 left-0 w-[500px] h-[350px] pointer-events-none" style={{ background: 'radial-gradient(ellipse at 20% 30%, rgba(184,149,91,0.1) 0%, transparent 60%)', filter: 'blur(40px)' }} />
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            {/* Breadcrumb */}
            <nav className="flex items-center gap-2 text-xs font-body text-white/35 mb-6">
              <Link to="/" className="hover:text-[#B8955B] transition-colors">Home</Link>
              <ChevronRight className="w-3 h-3" />
              <Link to="/blog" className="hover:text-[#B8955B] transition-colors">Blog</Link>
              <ChevronRight className="w-3 h-3" />
              <span className="text-white/50">{article.category}</span>
            </nav>
            <Link to="/blog" className="inline-flex items-center gap-2 text-[#B8955B] text-sm font-body mb-5 hover:underline">
              <ArrowLeft className="w-4 h-4" /> Back to Blog
            </Link>
            <span className="inline-block text-[#B8955B] text-xs font-body font-semibold bg-[#B8955B]/10 border border-[#B8955B]/25 px-3 py-1 rounded-full mb-4 tracking-[0.15em] uppercase">
              {article.category}
            </span>
            <h1 className="font-heading text-3xl md:text-4xl lg:text-5xl font-bold text-white mt-4 mb-5 leading-tight">{article.title}</h1>
            <p className="text-white/55 font-body text-base leading-relaxed mb-5 max-w-2xl">{article.description}</p>
            <div className="flex items-center gap-5 text-white/35 text-sm font-body">
              <span className="flex items-center gap-1.5"><Clock className="w-4 h-4" /> {article.readTime}</span>
              {article.datePublished && <span>{article.datePublished}</span>}
              <span>Creative Books SA</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Article Body */}
      <section className="py-16" style={{ background: '#F9F7F2' }}>
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <div className="space-y-10">
            {article.sections.map((section, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.04 }}>
                {section.heading && (
                  <h2 className="font-heading text-2xl font-bold text-[#0B1220] mb-4 leading-snug">{section.heading}</h2>
                )}
                <div
                  className="text-[#2B2B2B]/75 leading-[1.9] font-body text-[15px] prose prose-a:text-[#B8955B] prose-a:no-underline hover:prose-a:underline max-w-none"
                  dangerouslySetInnerHTML={{ __html: section.text }}
                />
              </motion.div>
            ))}
          </div>

          {/* CTA box inline */}
          {article.ctaText && (
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              className="mt-14 p-8 rounded-2xl"
              style={{ background: 'linear-gradient(135deg, #090E18 0%, #0d1830 100%)', border: '1px solid rgba(184,149,91,0.25)' }}>
              <p className="text-white/70 font-body text-sm leading-relaxed mb-5">{article.ctaText}</p>
              <Link to="/getquote" className="inline-flex items-center gap-2 px-7 py-3.5 text-sm font-semibold text-white rounded-xl"
                style={{ background: 'linear-gradient(135deg, #B8955B, #d4af72)', boxShadow: '0 8px 24px rgba(184,149,91,0.35)' }}>
                Request a Quote <ChevronRight className="w-4 h-4" />
              </Link>
            </motion.div>
          )}

          {/* Source note */}
          {article.sourceNote && (
            <p className="mt-8 text-xs font-body text-[#2B2B2B]/40 italic border-t border-black/5 pt-6">{article.sourceNote}</p>
          )}
        </div>
      </section>

      {/* FAQ Section */}
      {article.faqs && article.faqs.length > 0 && (
        <section className="py-16" style={{ background: '#F0EDE6' }}>
          <div className="max-w-3xl mx-auto px-4 sm:px-6">
            <motion.h2 initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              className="font-heading text-2xl md:text-3xl font-bold text-[#0B1220] mb-8">
              Frequently Asked Questions
            </motion.h2>
            <div className="space-y-2">
              {article.faqs.map((faq, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.04 }}
                  className="overflow-hidden rounded-xl"
                  style={{ background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(16px)', border: '1px solid rgba(0,0,0,0.06)' }}>
                  <button className="w-full flex items-center justify-between gap-4 px-6 py-4 text-left" onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                    <span className="font-heading text-sm font-semibold text-[#0B1220] leading-snug">{faq.q}</span>
                    <span className="shrink-0 w-6 h-6 flex items-center justify-center rounded-full" style={{ background: openFaq === i ? '#0B1220' : 'rgba(0,0,0,0.06)', border: '1px solid rgba(0,0,0,0.08)' }}>
                      {openFaq === i ? <Minus className="w-3 h-3 text-white" /> : <Plus className="w-3 h-3 text-[#0B1220]" />}
                    </span>
                  </button>
                  <AnimatePresence initial={false}>
                    {openFaq === i && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3 }}>
                        <div className="px-6 pb-5" style={{ borderTop: '1px solid rgba(0,0,0,0.05)' }}>
                          <p className="text-sm text-[#2B2B2B]/65 font-body leading-relaxed pt-4">{faq.a}</p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      <InternalLinks title="Related Services & Articles" links={article.relatedLinks || [
        { label: 'Book Publishing', path: '/bookpublishing' },
        { label: 'Book Printing', path: '/bookprinting' },
        { label: 'Book Editing', path: '/bookediting' },
        { label: 'Self Publishing Packages', path: '/selfpublishingpackagesinsouthafrica' },
        { label: 'Request a Quote', path: '/getquote' },
        { label: 'Blog', path: '/blog' },
      ]} light />
      <CTASection />
    </div>
  );
}