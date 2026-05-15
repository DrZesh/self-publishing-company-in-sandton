import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Check, Plus, Minus, Award, Image, Palette, Layers, Mail } from 'lucide-react';
import PricingButtons from '../../components/shared/PricingButtons';
import InternalLinks from '../../components/shared/InternalLinks';
import PageMeta from '../../components/shared/PageMeta';
import QuoteFormSection from '../../components/shared/QuoteFormSection';
import { serviceSchema, faqSchema, breadcrumbSchema, aggregateRatingSchema } from '../../lib/seo/schemas';

const printPackages = [
  {
    title: "Authors Book Cover",
    price: "R1,650",
    badge: "Popular",
    popular: true,
    description: "Authors use their own professional image.",
    includes: ["2x Concepts", "2x Mockups", "3x Revisions", "Delivered in Jpg & Pdf", "Print Ready", "Front, Spine & Back Cover Integrated"],
    mailto: "mailto:info@creativebookssa.co.za?subject=Service%20Order%3A%20Author%27s%20Book%20Cover%20%28Full%20Paperback%29%20-%20R1%2C650&body=Hi%20Creative%20Books%20SA%2C%0A%0AI%20would%20like%20to%20order%20the%20following%20service%20as-is%3A%0A%0ASERVICE%3A%20Author%27s%20Book%20Cover%20%28Full%20Paperback%29%0APRICE%3A%20R1%2C650%0A%0AINCLUDED%3A%0A-%20Author%20uses%20their%20own%20professional%20image%0A-%202x%20concepts%0A-%202x%20mockups%0A-%203x%20revisions%0A-%20Delivered%20in%20JPG%20and%20PDF%0A-%20Print%20ready%0A-%20Front%2C%20spine%20and%20back%20cover%20integrated%0A%0A---%0AMY%20DETAILS%3A%0AName%3A%20%0APhone%3A%20%0ABook%20title%3A%20%0AGenre%3A%20%0AAny%20notes%3A%20%0A%0AThank%20you%2C",
  },
  {
    title: "Stock Design Cover",
    price: "R2,150",
    badge: null,
    popular: false,
    description: "Shutterstock image integration.",
    includes: ["2x Concepts", "2x Mockups", "2x Revisions", "Delivered in Jpg & Pdf", "Front, Spine & Back Cover Integrated"],
    mailto: "mailto:info@creativebookssa.co.za?subject=Service%20Order%3A%20Stock%20Design%20Cover%20%28Full%20Paperback%29%20-%20R2%2C150&body=Hi%20Creative%20Books%20SA%2C%0A%0AI%20would%20like%20to%20order%20the%20following%20service%20as-is%3A%0A%0ASERVICE%3A%20Stock%20Design%20Cover%20%28Full%20Paperback%29%0APRICE%3A%20R2%2C150%0A%0AINCLUDED%3A%0A-%20Shutterstock%20image%20integration%0A-%202x%20concepts%0A-%202x%20mockups%0A-%202x%20revisions%0A-%20Delivered%20in%20JPG%20and%20PDF%0A-%20Front%2C%20spine%20and%20back%20cover%20integrated%0A%0A---%0AMY%20DETAILS%3A%0AName%3A%20%0APhone%3A%20%0ABook%20title%3A%20%0AGenre%3A%20%0AAny%20notes%3A%20%0A%0AThank%20you%2C",
  },
  {
    title: "Illustrated Cover Design",
    price: "R3,850",
    badge: null,
    popular: false,
    description: "Illustrated cover design.",
    includes: ["1x Character Development", "2x Concepts", "2x Revisions", "Delivered in Jpg & Pdf", "Custom product catalog", "Front, Spine & Back Cover Integrated"],
    mailto: "mailto:info@creativebookssa.co.za?subject=Service%20Order%3A%20Illustrated%20Cover%20Design%20%28Full%20Paperback%29%20-%20R3%2C850&body=Hi%20Creative%20Books%20SA%2C%0A%0AI%20would%20like%20to%20order%20the%20following%20service%20as-is%3A%0A%0ASERVICE%3A%20Illustrated%20Cover%20Design%20%28Full%20Paperback%29%0APRICE%3A%20R3%2C850%0A%0AINCLUDED%3A%0A-%201x%20character%20development%0A-%202x%20concepts%0A-%202x%20revisions%0A-%20Delivered%20in%20JPG%20and%20PDF%0A-%20Custom%20product%20catalog%0A-%20Front%2C%20spine%20and%20back%20cover%20integrated%0A%0A---%0AMY%20DETAILS%3A%0AName%3A%20%0APhone%3A%20%0ABook%20title%3A%20%0AGenre%3A%20%0AStyle%20preferences%3A%20%0AAny%20notes%3A%20%0A%0AThank%20you%2C",
  },
];

const ebookPackages = [
  {
    title: "Authors Book Cover",
    price: "R1,200",
    badge: "Popular",
    popular: true,
    description: "Authors use their own professional image.",
    includes: ["2x Concepts", "2x Mockups", "3x Revisions", "Delivered in Jpg & Pdf", "Ebook Cover", "Front Cover"],
    mailto: "mailto:info@creativebookssa.co.za?subject=Service%20Order%3A%20Author%27s%20Ebook%20Cover%20%28Front%20Only%29%20-%20R1%2C200&body=Hi%20Creative%20Books%20SA%2C%0A%0AI%20would%20like%20to%20order%20the%20following%20service%20as-is%3A%0A%0ASERVICE%3A%20Author%27s%20Book%20Cover%20%28Amazon%20Ebook%2C%20Front%20Only%29%0APRICE%3A%20R1%2C200%0A%0AINCLUDED%3A%0A-%20Author%20uses%20their%20own%20professional%20image%0A-%202x%20concepts%0A-%202x%20mockups%0A-%203x%20revisions%0A-%20Delivered%20in%20JPG%20and%20PDF%0A-%20Ebook%20cover%0A-%20Front%20cover%20only%0A%0A---%0AMY%20DETAILS%3A%0AName%3A%20%0APhone%3A%20%0ABook%20title%3A%20%0AGenre%3A%20%0AAny%20notes%3A%20%0A%0AThank%20you%2C",
  },
  {
    title: "Stock Design Cover",
    price: "R1,700",
    badge: null,
    popular: false,
    description: "Shutterstock Image Integration.",
    includes: ["2x Concepts", "2x Mockups", "2x Revisions", "Delivered in Jpg & Pdf", "Ebook Cover", "Front Cover"],
    mailto: "mailto:info@creativebookssa.co.za?subject=Service%20Order%3A%20Stock%20Ebook%20Cover%20%28Front%20Only%29%20-%20R1%2C700&body=Hi%20Creative%20Books%20SA%2C%0A%0AI%20would%20like%20to%20order%20the%20following%20service%20as-is%3A%0A%0ASERVICE%3A%20Stock%20Design%20Cover%20%28Amazon%20Ebook%2C%20Front%20Only%29%0APRICE%3A%20R1%2C700%0A%0AINCLUDED%3A%0A-%20Shutterstock%20image%20integration%0A-%202x%20concepts%0A-%202x%20mockups%0A-%202x%20revisions%0A-%20Delivered%20in%20JPG%20and%20PDF%0A-%20Ebook%20cover%0A-%20Front%20cover%20only%0A%0A---%0AMY%20DETAILS%3A%0AName%3A%20%0APhone%3A%20%0ABook%20title%3A%20%0AGenre%3A%20%0AAny%20notes%3A%20%0A%0AThank%20you%2C",
  },
  {
    title: "Illustrated Cover Design",
    price: "R3,400",
    badge: null,
    popular: false,
    description: "Illustrated Cover.",
    includes: ["1x Character Development", "2x Concepts", "2x Revisions", "Delivered in Jpg & Pdf", "Ebook Cover", "Front Cover"],
    mailto: "mailto:info@creativebookssa.co.za?subject=Service%20Order%3A%20Illustrated%20Ebook%20Cover%20%28Front%20Only%29%20-%20R3%2C400&body=Hi%20Creative%20Books%20SA%2C%0A%0AI%20would%20like%20to%20order%20the%20following%20service%20as-is%3A%0A%0ASERVICE%3A%20Illustrated%20Cover%20Design%20%28Amazon%20Ebook%2C%20Front%20Only%29%0APRICE%3A%20R3%2C400%0A%0AINCLUDED%3A%0A-%201x%20character%20development%0A-%202x%20concepts%0A-%202x%20revisions%0A-%20Delivered%20in%20JPG%20and%20PDF%0A-%20Ebook%20cover%0A-%20Front%20cover%20only%0A%0A---%0AMY%20DETAILS%3A%0AName%3A%20%0APhone%3A%20%0ABook%20title%3A%20%0AGenre%3A%20%0AStyle%20preferences%3A%20%0AAny%20notes%3A%20%0A%0AThank%20you%2C",
  },
];

const faqs = [
  { q: "Do self-published authors need a professional book cover?", a: "Yes. A professionally designed book cover is one of the most important investments a self-published author can make. It communicates your genre, tone and quality before a reader opens the first page, and it significantly affects purchasing decisions both online and in print." },
  { q: "What is the difference between a print cover and an ebook cover?", a: "A print cover includes the front, spine and back cover integrated as one full-wrap design. An ebook cover is a standalone front cover designed for digital display on platforms like Amazon, where only the front cover is visible to potential readers." },
  { q: "How many revisions are included?", a: "The number of revisions depends on the selected package. Our Author Book Cover packages include 3 revisions, while Stock Design and Illustrated packages include 2 revisions. Additional revision rounds can be discussed." },
  { q: "Can I use my own professional photograph?", a: "Yes. The Authors Book Cover package is specifically designed for authors who already have a professional photograph or author image they would like to use on their cover. This is the most popular option for memoir, Christian, inspirational and business book authors." },
  { q: "Are all covers custom designed?", a: "Yes. We do not use generic templates. Every book cover we create is designed specifically for your title, genre, target audience and publishing goals. You receive a unique, original design." },
  { q: "Do you design illustrated children's book covers?", a: "Yes. Our Illustrated Cover Design package is suitable for children's books, fiction, fantasy and any title requiring custom character-based or illustrated artwork rather than photography." },
  { q: "Can I get both a print cover and an ebook cover?", a: "Yes. Many authors choose both a full print cover and a matching ebook cover for Amazon. Contact us for a bundled quote." },
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

function PricingCard({ pkg, cta }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      whileHover={{ y: -6, transition: { duration: 0.2 } }}
      className="relative flex flex-col overflow-hidden h-full"
      style={{
        background: pkg.popular ? 'linear-gradient(160deg, #ffffff 0%, #fdf9f4 100%)' : 'rgba(255,255,255,0.72)',
        backdropFilter: 'blur(24px)',
        border: pkg.popular ? '1.5px solid rgba(184,149,91,0.55)' : '1px solid rgba(255,255,255,0.88)',
        boxShadow: pkg.popular ? '0 24px 60px rgba(184,149,91,0.18), inset 0 1px 0 rgba(255,255,255,1)' : '0 8px 32px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,1)',
        borderRadius: '16px',
      }}
    >
      {pkg.badge && (
        <div className="absolute top-4 right-4">
          <span className="inline-flex items-center gap-1 px-2.5 py-1 text-[10px] font-semibold tracking-[0.15em] uppercase"
            style={{ background: 'linear-gradient(135deg, #0B1220 0%, #1a2a4a 100%)', color: '#D4AF72', border: '1px solid rgba(212,175,114,0.3)', borderRadius: '4px' }}>
            <Award className="w-2.5 h-2.5" />{pkg.badge}
          </span>
        </div>
      )}
      <div className="p-6 flex-1">
        <p className="text-[10px] font-semibold tracking-[0.25em] uppercase font-body mb-3" style={{ color: pkg.popular ? '#B8955B' : 'rgba(11,18,32,0.4)' }}>{pkg.title}</p>
        <div className="mb-1">
          <span className="font-heading text-4xl font-bold text-[#0B1220]">{pkg.price}</span>
        </div>
        <p className="text-xs font-body text-[#2B2B2B]/50 italic mb-5">{pkg.description}</p>
        <div className="h-px mb-4" style={{ background: pkg.popular ? 'rgba(184,149,91,0.2)' : 'rgba(0,0,0,0.06)' }} />
        <ul className="space-y-2 mb-5">
          {pkg.includes.map(f => (
            <li key={f} className="flex items-start gap-2.5">
              <div className="w-4 h-4 rounded-full flex items-center justify-center shrink-0 mt-0.5"
                style={{ background: pkg.popular ? 'rgba(184,149,91,0.12)' : 'rgba(11,18,32,0.06)', border: `1px solid ${pkg.popular ? 'rgba(184,149,91,0.3)' : 'rgba(11,18,32,0.1)'}` }}>
                <Check className="w-2.5 h-2.5" style={{ color: pkg.popular ? '#B8955B' : '#0B1220' }} strokeWidth={2.5} />
              </div>
              <span className="text-xs font-body text-[#2B2B2B]/70">{f}</span>
            </li>
          ))}
        </ul>
      </div>
      <div className="px-6 pb-6">
        <PricingButtons mailtoUrl={pkg.mailto} />
      </div>
    </motion.div>
  );
}

export default function BookCoverDesign() {
  const [openFaq, setOpenFaq] = useState(null);

  const schema = {
    '@context': 'https://schema.org',
    '@graph': [
      serviceSchema({
        name: 'Book Cover Design Johannesburg',
        description: 'Professional book cover design services in Johannesburg. Custom print covers, ebook covers, illustrated covers, and stock image designs for authors and publishers.',
        url: '/bookcoverdesign',
        areaServed: 'South Africa',
      }),
      faqSchema(faqs.map(f => ({ question: f.q, answer: f.a }))),
      breadcrumbSchema([
        { name: 'Home', path: '/' },
        { name: 'Services', path: '/bookcoverdesign' },
        { name: 'Book Cover Design', path: '/bookcoverdesign' },
      ]),
      aggregateRatingSchema(),
    ],
  };

  return (
    <>
      <PageMeta
        title="Book Cover Design South Africa | Custom Covers"
        description="Custom, market-ready book cover design in South Africa. Cinematic covers that sell — for novels, memoirs, children's books and non-fiction."
        keywords="book cover design Johannesburg, book cover designers South Africa, ebook cover design, print cover design, illustrated book covers, Amazon cover design, professional cover designers"
        canonical="https://www.creativebookssa.co.za/bookcoverdesign"
        schema={schema}
      />

      {/* Hero */}
      <section className="relative min-h-[65vh] flex items-end overflow-hidden" style={{ background: 'linear-gradient(160deg, #090E18 0%, #0d1830 60%, #111827 100%)' }}>
        <div className="absolute top-0 left-0 w-[600px] h-[400px] pointer-events-none" style={{ background: 'radial-gradient(ellipse at 20% 30%, rgba(184,149,91,0.12) 0%, transparent 60%)', filter: 'blur(40px)' }} />
        <div className="absolute top-0 left-0 right-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(184,149,91,0.6), transparent)' }} />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 pt-32 pb-20 w-full">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }} className="max-w-3xl">
            <span className="text-[#B8955B] text-xs font-body font-semibold tracking-[0.3em] uppercase mb-5 block">Book Cover Design · Johannesburg · South Africa</span>
            <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 leading-[1.05]">
              Custom Book Cover Design in South Africa
            </h1>
            <p className="text-white/60 text-base font-body mb-4 font-medium">Professional Book Cover Design for Authors, Publishers and Self-Published Books</p>
            <p className="text-white/45 text-sm leading-relaxed font-body mb-10 max-w-2xl">
              Creative Books SA creates professional book cover designs for authors who want their books to stand out, attract readers and look ready for the market. Whether you need a full print cover with front, spine and back cover integration, an illustrated book cover, a stock image design or an Amazon ebook cover, our team can help you create a strong visual identity for your book.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link to="/getquote" className="inline-flex items-center gap-2 px-8 py-4 text-white text-sm font-semibold transition-all group" style={{ background: '#B8955B', boxShadow: '0 12px 32px rgba(184,149,91,0.35)', borderRadius: '8px' }}>
                Request a Book Cover Quote <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <a href="#pricing" className="inline-flex items-center gap-2 px-8 py-4 text-white/80 text-sm font-medium" style={{ border: '1px solid rgba(255,255,255,0.15)', borderRadius: '8px', background: 'rgba(255,255,255,0.04)' }}>
                View Cover Design Packages
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-20 lg:py-28" style={{ background: '#F8F5EF' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-14">
            <span className="text-[#B8955B] text-xs tracking-[0.3em] uppercase font-body block mb-4">Why Choose Us</span>
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-[#0B1220] mb-4 leading-tight">Why Choose Creative Books SA for Book Cover Design?</h2>
            <p className="text-[#2B2B2B]/60 font-body text-sm leading-relaxed max-w-2xl">Our book cover designs start at an affordable price, with options created to meet different author needs and budgets. Whether you already have a professional author image, need a stock image cover, want a custom illustrated cover or require an ebook cover for Amazon, Creative Books SA helps you create a polished and market-ready design.</p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              { icon: Award, title: 'Reliable', body: 'We have a strong track record of helping authors prepare their books professionally. Once your project starts, you can trust our team to guide the design process clearly and deliver according to the agreed scope.' },
              { icon: Palette, title: 'Custom Designs', body: 'We do not create generic template covers. Our designs are original, unique and shaped around your book\'s title, genre, audience and publishing goals.' },
              { icon: Image, title: 'Competitive Pricing', body: 'Our book cover design pricing is competitive and designed to give authors access to professional covers that make their books stand out.' },
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

      {/* Print Pricing */}
      <section id="pricing" className="py-20 lg:py-28 overflow-hidden" style={{ background: 'linear-gradient(135deg, #f0f4ff 0%, #eef1f7 100%)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-14">
            <span className="text-[#B8955B] text-xs tracking-[0.3em] uppercase font-body block mb-4">Print Covers</span>
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-[#0B1220] mb-2 leading-tight">Print Book Cover Design Packages</h2>
            <p className="text-[#2B2B2B]/50 font-body text-sm">Full print covers including front, spine and back</p>
          </motion.div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {printPackages.map((pkg) => <PricingCard key={pkg.title} pkg={pkg} cta="Request This Cover Package" />)}
          </div>
          <p className="text-center text-[#2B2B2B]/40 text-xs font-body mt-6">Need adjustments or have questions? Click 'Get a Custom Quote'. Ready to go? Click 'Order This As-Is' to send a pre-filled email.</p>
        </div>
      </section>

      {/* Ebook Pricing */}
      <section className="py-20 lg:py-28 overflow-hidden" style={{ background: 'linear-gradient(160deg, #090E18 0%, #0d1830 100%)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-14">
            <span className="text-[#B8955B] text-xs tracking-[0.3em] uppercase font-body block mb-4">Amazon Ebook</span>
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-white mb-2 leading-tight">Amazon Ebook Cover Design Packages</h2>
            <p className="text-white/45 font-body text-sm">Front cover designs optimised for Amazon and digital platforms</p>
          </motion.div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {ebookPackages.map((pkg) => <PricingCard key={pkg.title + '-ebook'} pkg={pkg} cta="Request Ebook Cover Quote" />)}
          </div>
          <p className="text-center text-white/25 text-xs font-body mt-6">Need adjustments or have questions? Click 'Get a Custom Quote'. Ready to go? Click 'Order This As-Is' to send a pre-filled email.</p>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 lg:py-28 overflow-hidden" style={{ background: 'linear-gradient(135deg, #f0f4ff 0%, #eef1f7 100%)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
            <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="lg:sticky lg:top-28">
              <span className="text-[#B8955B] text-xs tracking-[0.3em] uppercase font-body block mb-5">FAQ</span>
              <h2 className="font-heading text-3xl md:text-4xl font-bold text-[#0B1220] mb-4 leading-tight">Book Cover Design FAQs</h2>
              <p className="text-[#2B2B2B]/55 font-body text-sm leading-relaxed max-w-sm">Have more questions? Contact us for a personalised answer.</p>
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

      {/* Quick Quote Form */}
      <QuoteFormSection
        title="Get a Quick Book Cover Quote"
        description="Fill out the form below and we'll send you a personalised quote based on your requirements."
        services={[
          { value: 'paperback-cover', label: 'Paperback Cover (Front, Spine, Back)' },
          { value: 'ebook-cover', label: 'eBook Cover (Amazon)' },
          { value: 'author-image-cover', label: 'Cover with Author Image' },
          { value: 'stock-image-cover', label: 'Stock Image Cover' },
          { value: 'illustrated-cover', label: 'Illustrated Cover Design' },
        ]}
      />

      {/* Final CTA */}
      <section className="relative py-20 overflow-hidden" style={{ background: 'linear-gradient(160deg, #090E18 0%, #0d1830 100%)' }}>
        <div className="absolute top-0 left-0 right-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(184,149,91,0.5), transparent)' }} />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <span className="text-[#B8955B] text-xs tracking-[0.3em] uppercase font-body block mb-6">Get Started</span>
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-white mb-5 leading-tight">Ready to Design a Book Cover That Stands Out?</h2>
            <p className="text-white/45 font-body text-sm leading-relaxed mb-10 max-w-lg mx-auto">Your book deserves a cover that commands attention and communicates quality. Request a personalised quote from our Johannesburg design team today.</p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link to="/getquote" className="inline-flex items-center gap-2 px-8 py-4 text-white text-sm font-semibold transition-all group" style={{ background: '#B8955B', boxShadow: '0 12px 32px rgba(184,149,91,0.35)', borderRadius: '8px' }}>
                Request a Book Cover Quote <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link to="/publishingpackages" className="inline-flex items-center gap-2 px-8 py-4 text-white/70 text-sm" style={{ border: '1px solid rgba(255,255,255,0.12)', borderRadius: '8px', background: 'rgba(255,255,255,0.04)' }}>
                View Publishing Packages
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      <InternalLinks links={[
        { label: 'Book Layout & Typesetting', path: '/typesetting' },
        { label: 'eBook Formatting', path: '/ebookformatting' },
        { label: 'Book Editing Services', path: '/bookediting' },
        { label: 'Publishing Packages', path: '/publishingpackages' },
        { label: 'Self Publishing South Africa', path: '/selfpublishingsouthafrica' },
        { label: 'Request a Quote', path: '/getquote' },
      ]} light />
    </>
  );
}