import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Check, Plus, Minus, Monitor, ShoppingCart, Smartphone } from 'lucide-react';
import InternalLinks from '../../components/shared/InternalLinks';
import PageMeta from '../../components/shared/PageMeta';

const faqs = [
  { q: 'Do authors need a website?', a: 'Yes. A professional author website is essential for building your credibility, promoting your books and giving readers a place to learn more about you. It also provides a platform to sell books directly, collect reader enquiries and build your author brand.' },
  { q: 'What is included in the Author Website package?', a: 'The package includes a domain name, 30GB web space, 12 months hosting, 5 pages, an SSL certificate, up to 3 payment systems, 10 products, image optimisation and a contact form.' },
  { q: 'Can the website sell my books directly?', a: 'Yes. Our Author Website package includes ecommerce functionality with up to 10 products and 3 payment systems. This allows readers to purchase your books directly from your website.' },
  { q: 'Is the website mobile friendly?', a: 'Yes. All websites we build are responsive and mobile-optimised. Readers can browse your author website on a phone, tablet or desktop without any layout issues.' },
  { q: 'Can I update my own website after it is built?', a: 'Yes. We build with content management systems that allow you to update pages, add or remove products, change prices and manage your content where ecommerce functionality is included.' },
  { q: 'Do you design websites outside Johannesburg?', a: 'Yes. We design author websites for writers, self-published authors and publishers across South Africa and internationally.' },
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

export default function AuthorWebsites() {
  const [openFaq, setOpenFaq] = useState(null);

  return (
    <div style={{ background: '#f8f9fc' }}>
      <PageMeta
        title="Author Website Design South Africa | Build Your Platform"
        description="Custom author websites for South African writers — showcase books, build a mailing list, sell direct. Mobile-friendly, SEO-ready, easy to manage."
        canonical="https://www.creativebookssa.co.za/authorwebsites"
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
            <span className="text-[#B8955B] text-xs font-body font-semibold tracking-[0.3em] uppercase mb-5 block">Author Website Design · South Africa</span>
            <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 leading-[1.05]">
              Author Website Design
            </h1>
            <p className="text-white/60 text-base font-body mb-5 font-medium">Professional Websites for Authors, Writers and Self-Published Creatives</p>
            <p className="text-white/45 text-sm leading-relaxed font-body mb-10 max-w-2xl">
              Creative Books SA designs professional author websites that help writers build credibility, promote their books and sell online. Whether you are launching your first book, building your author brand or creating an ecommerce website to sell your books directly, we help you create a polished online presence that supports your publishing journey.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link to="/getquote" className="inline-flex items-center gap-2 px-8 py-4 text-white text-sm font-semibold transition-all group" style={{ background: '#B8955B', boxShadow: '0 12px 32px rgba(184,149,91,0.35)', borderRadius: '8px' }}>
                Request a Website Quote <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <a href="#pricing" className="inline-flex items-center gap-2 px-8 py-4 text-white/80 text-sm font-medium" style={{ border: '1px solid rgba(255,255,255,0.15)', borderRadius: '8px', background: 'rgba(255,255,255,0.04)' }}>
                View Website Package
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-20 lg:py-28 overflow-hidden" style={{ background: 'linear-gradient(135deg, #f0f4ff 0%, #eef1f7 100%)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-14">
            <span className="text-[#B8955B] text-xs tracking-[0.3em] uppercase font-body block mb-4">Web Design for Authors</span>
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-[#0B1220] mb-3 leading-tight">Web Design Packages in South Africa</h2>
            <p className="text-[#2B2B2B]/55 font-body text-sm leading-relaxed max-w-2xl">Creative Books SA creates professional and stunning website designs for authors, writers and self-published creatives who want to promote their books online.</p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              { icon: Monitor, title: 'Content Management Systems', body: 'Your audience and business needs may change over time. We build content management systems that allow you to update pages, add or remove products, change prices and manage promotions.' },
              { icon: Smartphone, title: 'Mobile User Friendly', body: 'Readers now browse on phones, tablets and laptops. We create responsive websites that are attractive, easy to use and accessible across devices.' },
              { icon: ShoppingCart, title: 'Bespoke Solutions', body: 'Your author brand is unique, so your website should not feel like a generic template. We create tailored website solutions based on your book, audience, sales goals and publishing needs.' },
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
      <section id="pricing" className="py-20 lg:py-28" style={{ background: '#F8F5EF' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-14">
            <span className="text-[#B8955B] text-xs tracking-[0.3em] uppercase font-body block mb-4">Pricing</span>
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-[#0B1220] mb-2 leading-tight">Author Website Design Package</h2>
          </motion.div>
          <div className="max-w-lg">
            <motion.div initial={{ opacity: 0, y: 28 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              whileHover={{ y: -6, transition: { duration: 0.2 } }}
              className="relative flex flex-col overflow-hidden"
              style={{
                background: 'linear-gradient(160deg, #ffffff 0%, #fdf9f4 100%)',
                backdropFilter: 'blur(24px)',
                border: '1.5px solid rgba(184,149,91,0.55)',
                boxShadow: '0 24px 60px rgba(184,149,91,0.18)',
                borderRadius: '16px',
              }}>
              <div className="p-7">
                <p className="text-[10px] font-semibold tracking-[0.25em] uppercase font-body mb-1 text-[#B8955B]">Ecommerce Website Design</p>
                <p className="font-heading text-xl font-bold text-[#0B1220] mb-2">Authors Site</p>
                <p className="text-xs font-body text-[#2B2B2B]/50 mb-3">Start From:</p>
                <span className="font-heading text-5xl font-bold text-[#0B1220]">R8,800</span>
                <div className="h-px my-6" style={{ background: 'rgba(184,149,91,0.2)' }} />
                <div className="grid grid-cols-2 gap-3">
                  {[
                    'Domain Name', '30 GB Web Space', '12 Months Hosting', '5 Pages',
                    'SSL Certificate', 'Up to 3 Payment System', '10 Products',
                    'Image Optimisation', 'Contact Form',
                  ].map(f => (
                    <div key={f} className="flex items-center gap-2.5">
                      <div className="w-4 h-4 rounded-full flex items-center justify-center shrink-0" style={{ background: 'rgba(184,149,91,0.12)', border: '1px solid rgba(184,149,91,0.3)' }}>
                        <Check className="w-2.5 h-2.5 text-[#B8955B]" strokeWidth={2.5} />
                      </div>
                      <span className="text-xs font-body text-[#2B2B2B]/70">{f}</span>
                    </div>
                  ))}
                </div>
                <Link to="/getquote" className="mt-7 block text-center py-3.5 text-sm font-semibold font-body transition-all"
                  style={{ background: 'linear-gradient(135deg, #0B1220, #1a2a4a)', color: '#fff', boxShadow: '0 8px 24px rgba(11,18,32,0.25)', borderRadius: '8px' }}>
                  Choose Author Website Package
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 lg:py-28 overflow-hidden" style={{ background: 'linear-gradient(135deg, #f0f4ff 0%, #eef1f7 100%)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
            <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="lg:sticky lg:top-28">
              <span className="text-[#B8955B] text-xs tracking-[0.3em] uppercase font-body block mb-5">FAQ</span>
              <h2 className="font-heading text-3xl md:text-4xl font-bold text-[#0B1220] mb-4 leading-tight">Author Website Design FAQs</h2>
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
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-white mb-5 leading-tight">Ready to Build a Professional Author Website?</h2>
            <p className="text-white/45 font-body text-sm leading-relaxed mb-10 max-w-lg mx-auto">Your author brand deserves a professional online presence. Request a personalised quote for your author website today.</p>
            <Link to="/getquote" className="inline-flex items-center gap-2 px-8 py-4 text-white text-sm font-semibold transition-all group" style={{ background: '#B8955B', boxShadow: '0 12px 32px rgba(184,149,91,0.35)', borderRadius: '8px' }}>
              Request a Website Quote <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>
        </div>
      </section>

      <InternalLinks links={[
        { label: 'Book Cover Design', path: '/bookcoverdesign' },
        { label: 'eBook Formatting', path: '/ebookpublishing' },
        { label: 'Publishing Packages', path: '/publishingpackages' },
        { label: 'Self Publishing South Africa', path: '/selfpublishingsouthafrica' },
        { label: 'Request a Quote', path: '/getquote' },
      ]} light />
    </div>
  );
}