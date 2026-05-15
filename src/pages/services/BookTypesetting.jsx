import React, { useState } from 'react';
import PageMeta from '../../components/shared/PageMeta';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Check, Plus, Minus, Award, AlignLeft, BookOpen, Layers } from 'lucide-react';
import InternalLinks from '../../components/shared/InternalLinks';

const packages = [
  {
    title: 'Basic Layout',
    label: 'Print Ready File (Microsoft Word)',
    price: 'R10.50',
    billing: 'Per Page',
    popular: false,
    includes: ['Basic Formatting', 'Standard paragraph indentation', 'Drop Cap', 'Includes source file', 'Well Structured Chapter Headings'],
    cta: 'Choose Basic Layout',
  },
  {
    title: 'Standard Layout',
    label: 'Print Ready File (Microsoft Word)',
    price: 'R12.50',
    billing: 'Per Page',
    popular: true,
    includes: ['Basic Formatting', 'Paragraph indentation', 'Author Title & Book Name on the header', 'Bullet & Numbering', 'Includes Source File', 'Images & Bleed Images', 'Well Structured Chapter Headings'],
    cta: 'Choose Standard Layout',
  },
  {
    title: 'Premium Layout',
    label: 'Print Ready (Microsoft Word)',
    price: 'R19.50',
    billing: 'Per Page',
    popular: false,
    includes: ['Everything in Basic & Standard Layout', 'Tabulation', 'Structures'],
    cta: 'Choose Premium Layout',
  },
];

const processSteps = [
  { num: '01', title: 'Submit Your Manuscript', body: 'Send your completed manuscript as a Microsoft Word document along with any images, artwork, fonts or design references you would like included in the layout.' },
  { num: '02', title: 'Select Your Layout Package', body: 'Choose the typesetting package that best suits your needs, whether you require basic formatting, standard professional layout or premium typesetting with additional elements.' },
  { num: '03', title: 'Layout and Typesetting', body: 'Our team works through your manuscript, applying professional typesetting standards to create a clean, readable and visually structured interior layout.' },
  { num: '04', title: 'Review and Approve', body: 'You receive the typeset manuscript for review. Any requested adjustments are made before final files are delivered.' },
  { num: '05', title: 'Receive Print-Ready Files', body: 'Final print-ready files are delivered in the agreed format, ready for book printing, ebook conversion or submission to your publisher.' },
];

const faqs = [
  { q: 'What is book typesetting?', a: 'Typesetting is the process of arranging text, headings, images and spacing in a structured, readable format inside your book. It transforms a raw Word document into a professionally designed, print-ready book interior.' },
  { q: 'Why does a self-published author need typesetting?', a: 'A self-published book that has been professionally typeset looks more polished, reads more clearly and creates a stronger impression. Typesetting ensures consistent spacing, professional chapter headings, proper indentation and a clean layout that matches industry standards.' },
  { q: 'What is the difference between Basic, Standard and Premium layout?', a: 'Basic Layout covers fundamental formatting. Standard Layout adds headers, bullet lists, images and more advanced structure. Premium Layout includes everything in Basic and Standard plus tabulation and complex structural elements.' },
  { q: 'Do you provide print-ready files?', a: 'Yes. All layout packages include print-ready files. The output format depends on the package and your printing requirements.' },
  { q: 'Can you typeset a book that already has a cover design?', a: 'Yes. We can typeset the interior of your book separately from the cover design. The interior layout and cover design are separate services.' },
  { q: 'What file formats do you work with?', a: 'We accept manuscripts in Microsoft Word (.docx) format. Final print-ready files are typically delivered as PDF files.' },
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

export default function BookTypesetting() {
  const [openFaq, setOpenFaq] = useState(null);

  return (
    <div style={{ background: '#f8f9fc' }}>
      <PageMeta
        title="Book Typesetting & Layout Services South Africa"
        description="Professional book typesetting and interior layout in South Africa. Print-ready files for paperback, hardcover and ebook formats."
        canonical="https://www.creativebookssa.co.za/typesetting"
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
            <span className="text-[#B8955B] text-xs font-body font-semibold tracking-[0.3em] uppercase mb-5 block">Book Layout & Typesetting · Johannesburg · South Africa</span>
            <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 leading-[1.05]">
              Book Typesetting and Interior Layout
            </h1>
            <p className="text-white/60 text-base font-body mb-5 font-medium">Professional Book Interior Layout, Typesetting and Print-Ready Files</p>
            <p className="text-white/45 text-sm leading-relaxed font-body mb-10 max-w-2xl">
              Creative Books SA provides professional book layout and typesetting services for authors who want their manuscripts transformed into clean, readable and print-ready book interiors. Whether you are preparing a novel, memoir, poetry book, Christian book, business book, workbook or self-published title, we help organise your content into a polished layout that improves the reading experience.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link to="/getquote" className="inline-flex items-center gap-2 px-8 py-4 text-white text-sm font-semibold transition-all group" style={{ background: '#B8955B', boxShadow: '0 12px 32px rgba(184,149,91,0.35)', borderRadius: '8px' }}>
                Request a Typesetting Quote <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <a href="#pricing" className="inline-flex items-center gap-2 px-8 py-4 text-white/80 text-sm font-medium" style={{ border: '1px solid rgba(255,255,255,0.15)', borderRadius: '8px', background: 'rgba(255,255,255,0.04)' }}>
                View Layout Packages
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* About */}
      <section className="py-20 lg:py-28" style={{ background: '#F8F5EF' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
              <span className="text-[#B8955B] text-xs tracking-[0.3em] uppercase font-body block mb-5">What Is Typesetting</span>
              <h2 className="font-heading text-3xl md:text-4xl font-bold text-[#0B1220] mb-6 leading-tight">Typesetting and Layout</h2>
              <p className="text-[#2B2B2B]/60 font-body text-sm leading-relaxed mb-5">Typesetting is the arrangement of words to create an optimal reading experience. It focuses on legible, beautiful type and compelling page layout.</p>
              <p className="text-[#2B2B2B]/60 font-body text-sm leading-relaxed mb-5">Layout refers to organising and arranging information such as text and images in a clear, structured and visually pleasing way. Typesetting is the specific task of placing the actual content into the layout in a polished and readable format.</p>
              <p className="text-[#2B2B2B]/60 font-body text-sm leading-relaxed mb-8">Creative Books SA can create a beautifully typeset interior layout that complements your book's cover and creates a cohesive end product. We design a unique and custom look for your book by borrowing visual components from the cover and arranging your manuscript's elements in an artful and professional way. At the end of the process, you receive clean, print-ready files.</p>
              <Link to="/getquote" className="inline-flex items-center gap-2 px-7 py-3.5 text-white text-sm font-semibold" style={{ background: '#0B1220', borderRadius: '8px', boxShadow: '0 8px 24px rgba(11,18,32,0.2)' }}>
                Request a Layout Quote <ArrowRight className="w-4 h-4" />
              </Link>
            </motion.div>
            <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
              <div className="grid grid-cols-1 gap-4">
                {[
                  { icon: AlignLeft, title: 'Clean Interior Layout', body: 'Properly structured chapters, consistent spacing and professional typography.' },
                  { icon: BookOpen, title: 'Print-Ready Files', body: 'Receive files formatted correctly for your chosen print specifications and paper size.' },
                  { icon: Layers, title: 'Custom Book Design', body: 'Visual elements borrowed from your cover to create a cohesive, branded book design.' },
                ].map((item, i) => {
                  const Icon = item.icon;
                  return (
                    <motion.div key={item.title} initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}
                      className="flex items-start gap-4 p-5" style={{ background: 'rgba(255,255,255,0.78)', border: '1px solid rgba(255,255,255,0.95)', boxShadow: '0 4px 16px rgba(0,0,0,0.05)', borderRadius: '12px' }}>
                      <div className="w-9 h-9 flex items-center justify-center shrink-0" style={{ background: 'rgba(184,149,91,0.1)', border: '1px solid rgba(184,149,91,0.2)', borderRadius: '10px' }}>
                        <Icon className="w-4 h-4 text-[#B8955B]" strokeWidth={1.5} />
                      </div>
                      <div>
                        <h3 className="font-heading text-sm font-bold text-[#0B1220] mb-1">{item.title}</h3>
                        <p className="text-xs font-body text-[#2B2B2B]/55 leading-relaxed">{item.body}</p>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20 lg:py-28 overflow-hidden" style={{ background: 'linear-gradient(135deg, #f0f4ff 0%, #eef1f7 100%)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-14">
            <span className="text-[#B8955B] text-xs tracking-[0.3em] uppercase font-body block mb-4">Pricing</span>
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-[#0B1220] mb-2 leading-tight">Microsoft Word Packages</h2>
            <p className="text-[#2B2B2B]/50 font-body text-sm">Save Time. Save Money. — Priced per page.</p>
          </motion.div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {packages.map((pkg, i) => (
              <motion.div key={pkg.title} initial={{ opacity: 0, y: 28 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}
                whileHover={{ y: -6, transition: { duration: 0.2 } }}
                className="relative flex flex-col overflow-hidden h-full"
                style={{
                  background: pkg.popular ? 'linear-gradient(160deg, #ffffff 0%, #fdf9f4 100%)' : 'rgba(255,255,255,0.72)',
                  backdropFilter: 'blur(24px)',
                  border: pkg.popular ? '1.5px solid rgba(184,149,91,0.55)' : '1px solid rgba(255,255,255,0.88)',
                  boxShadow: pkg.popular ? '0 24px 60px rgba(184,149,91,0.18)' : '0 8px 32px rgba(0,0,0,0.06)',
                  borderRadius: '16px',
                }}>
                {pkg.popular && (
                  <div className="absolute top-4 right-4">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 text-[10px] font-semibold tracking-[0.15em] uppercase" style={{ background: 'linear-gradient(135deg, #0B1220 0%, #1a2a4a 100%)', color: '#D4AF72', border: '1px solid rgba(212,175,114,0.3)', borderRadius: '4px' }}>
                      <Award className="w-2.5 h-2.5" />Popular
                    </span>
                  </div>
                )}
                <div className="p-7 flex-1">
                  <p className="text-[10px] font-semibold tracking-[0.25em] uppercase font-body mb-1" style={{ color: pkg.popular ? '#B8955B' : 'rgba(11,18,32,0.4)' }}>{pkg.label}</p>
                  <p className="font-heading text-lg font-bold text-[#0B1220] mb-2">{pkg.title}</p>
                  <div className="mb-1">
                    <span className="font-heading text-4xl font-bold text-[#0B1220]">{pkg.price}</span>
                    <span className="text-sm font-body ml-2 text-[#2B2B2B]/40">{pkg.billing}</span>
                  </div>
                  <div className="h-px my-5" style={{ background: pkg.popular ? 'rgba(184,149,91,0.2)' : 'rgba(0,0,0,0.06)' }} />
                  <ul className="space-y-2">
                    {pkg.includes.map(f => (
                      <li key={f} className="flex items-start gap-2.5">
                        <div className="w-4 h-4 rounded-full flex items-center justify-center shrink-0 mt-0.5" style={{ background: pkg.popular ? 'rgba(184,149,91,0.12)' : 'rgba(11,18,32,0.06)', border: `1px solid ${pkg.popular ? 'rgba(184,149,91,0.3)' : 'rgba(11,18,32,0.1)'}` }}>
                          <Check className="w-2.5 h-2.5" style={{ color: pkg.popular ? '#B8955B' : '#0B1220' }} strokeWidth={2.5} />
                        </div>
                        <span className="text-xs font-body text-[#2B2B2B]/70">{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="p-7 pt-0">
                  <Link to="/getquote" className="block text-center py-3 text-sm font-semibold font-body transition-all"
                    style={pkg.popular ? { background: 'linear-gradient(135deg, #0B1220, #1a2a4a)', color: '#fff', boxShadow: '0 8px 24px rgba(11,18,32,0.25)', borderRadius: '8px' } : { background: 'rgba(11,18,32,0.05)', color: '#0B1220', border: '1px solid rgba(11,18,32,0.12)', borderRadius: '8px' }}>
                    {pkg.cta}
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Process */}
      <section className="py-20 lg:py-28" style={{ background: 'linear-gradient(160deg, #090E18 0%, #0d1830 100%)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-14">
            <span className="text-[#B8955B] text-xs tracking-[0.3em] uppercase font-body block mb-4">How It Works</span>
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-white mb-3 leading-tight">Our Book Layout and Typesetting Process</h2>
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

      {/* FAQ */}
      <section className="py-20 lg:py-28 overflow-hidden" style={{ background: 'linear-gradient(135deg, #f0f4ff 0%, #eef1f7 100%)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
            <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="lg:sticky lg:top-28">
              <span className="text-[#B8955B] text-xs tracking-[0.3em] uppercase font-body block mb-5">FAQ</span>
              <h2 className="font-heading text-3xl md:text-4xl font-bold text-[#0B1220] mb-4 leading-tight">Book Layout and Typesetting FAQs</h2>
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
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-white mb-5 leading-tight">Ready to Turn Your Manuscript Into a Print-Ready Book?</h2>
            <p className="text-white/45 font-body text-sm leading-relaxed mb-10 max-w-lg mx-auto">Get a personalised typesetting and layout quote based on your manuscript length and selected package. Our Johannesburg team delivers professional, print-ready interiors.</p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link to="/getquote" className="inline-flex items-center gap-2 px-8 py-4 text-white text-sm font-semibold transition-all group" style={{ background: '#B8955B', boxShadow: '0 12px 32px rgba(184,149,91,0.35)', borderRadius: '8px' }}>
                Request a Typesetting Quote <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link to="/bookcoverdesign" className="inline-flex items-center gap-2 px-8 py-4 text-white/70 text-sm" style={{ border: '1px solid rgba(255,255,255,0.12)', borderRadius: '8px', background: 'rgba(255,255,255,0.04)' }}>
                Book Cover Design
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      <InternalLinks links={[
        { label: 'Book Cover Design', path: '/bookcoverdesign' },
        { label: 'eBook Formatting', path: '/ebookpublishing' },
        { label: 'Book Editing Services', path: '/bookediting' },
        { label: 'Publishing Packages', path: '/publishingpackages' },
        { label: 'Self Publishing South Africa', path: '/selfpublishingsouthafrica' },
        { label: 'Request a Quote', path: '/getquote' },
      ]} light />
    </div>
  );
}