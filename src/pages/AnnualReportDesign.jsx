import React, { useState } from 'react';
import PageMeta from '../components/shared/PageMeta';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Check, Plus, Minus, Users, FileText, Edit3, Calendar, Camera, Printer, Award } from 'lucide-react';
import InternalLinks from '../components/shared/InternalLinks';

const processSteps = [
  { icon: Users, num: '01', title: 'Right Team', body: 'Make sure you appoint the right team from your company to gather the information required and project manage the annual report design professionally.' },
  { icon: FileText, num: '02', title: 'Gather the Information', body: 'Garbage in, garbage out. Providing the right content is something that should happen throughout the year to avoid a rushed year-end scramble.' },
  { icon: Edit3, num: '03', title: 'Review and Edit', body: 'After the annual report design and copy are completed, the first draft will be sent for review and edits will be applied. It is critical to allow enough time for a proper review process.' },
  { icon: Calendar, num: '04', title: 'Project Plan', body: 'You will need a detailed project plan for your annual report design, detailing who is doing what and by when, to meet the deadline.' },
  { icon: Camera, num: '05', title: 'Design, Copy and Photos', body: 'Design and copywriting can commence after the written brief is received and all the content has been collated. At this point, you can commission your photographer to shoot images needed for the report.' },
  { icon: Printer, num: '06', title: 'Print and Publish', body: 'After final approval, the final annual report design will be sent to the printer or prepared for digital publishing.' },
];

const plans = [
  { name: 'Basic', price: 'R25,000', pages: 'Up to 50 Pages', popular: false, features: ['Cover Design', 'Collage Artwork', 'Typographic Work', 'Layout'] },
  { name: 'Standard', price: 'R48,000', pages: 'Up to 100 Pages', popular: true, features: ['Cover Design', 'Collage Artwork', 'Typographic Artwork', 'Layout'] },
  { name: 'Gold', price: 'R71,000', pages: 'Up to 150 Pages', popular: false, features: ['Cover Design', 'Collage Artwork', 'Typographic Artwork', 'Layout'] },
  { name: 'Personal', price: 'R94,000', pages: 'Up to 200 Pages', popular: false, features: ['Cover Design', 'Collage Artwork', 'Typographic Artwork', 'Layout'] },
];

const faqs = [
  { q: 'Do you design annual reports for companies and organisations?', a: 'Yes. Creative Books SA designs professional annual reports for companies, non-profit organisations, government entities, NGOs, schools, institutions and associations in South Africa.' },
  { q: 'Can you design APP documents?', a: 'Yes. We design Annual Performance Plan (APP) documents, corporate reports, strategic plans and government publications to the same professional standard as our annual report design service.' },
  { q: 'What types of corporate reports do you design?', a: 'We design annual reports, integrated reports, sustainability reports, APP documents, board reports, company profiles, corporate brochures, magazines and coffee table books.' },
  { q: 'What does the layout design include?', a: 'Our annual report layout design includes cover design, collage artwork, typographic artwork, infographic layout support and interior page design. The number of pages depends on the selected package.' },
  { q: 'Will I receive print-ready files?', a: 'Yes. After final approval, you receive print-ready PDF files suitable for commercial printing and a digital version suitable for email distribution or website publishing.' },
  { q: 'What content do I need to provide?', a: 'You need to provide all written content, images, logos, brand guidelines and any data or infographic information. The quality and completeness of content directly affects the final report quality and turnaround time.' },
  { q: 'How long does an annual report design take?', a: 'Timelines depend on project complexity and content readiness. A standard annual report typically takes 3 to 6 weeks from brief to print-ready files. We strongly recommend beginning the process well before your deadline.' },
];

function FAQItem({ faq, i, open, setOpen }) {
  const isOpen = open === i;
  return (
    <div className="overflow-hidden" style={{ background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px' }}>
      <button className="w-full flex items-center justify-between gap-4 px-6 py-4 text-left" onClick={() => setOpen(isOpen ? null : i)}>
        <span className="font-heading text-sm font-semibold text-white leading-snug">{faq.q}</span>
        <span className="shrink-0 w-6 h-6 flex items-center justify-center" style={{ background: isOpen ? '#B8955B' : 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '50%' }}>
          {isOpen ? <Minus className="w-3 h-3 text-white" /> : <Plus className="w-3 h-3 text-white/70" />}
        </span>
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3 }}>
            <div className="px-6 pb-5" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
              <p className="text-sm text-white/50 font-body leading-relaxed pt-4">{faq.a}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function AnnualReportDesign() {
  const [openFaq, setOpenFaq] = useState(null);

  return (
    <div style={{ background: '#090E18' }}>
      <PageMeta
        title="Annual Report Design in Sandton | Premium Reports"
        description="Premium annual report design and printing in Sandton. Professionally designed reports for companies, NGOs and institutions."
        canonical="https://www.creativebookssa.co.za/annualreportdesignsandton"
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
            <span className="text-[#B8955B] text-xs font-body font-semibold tracking-[0.3em] uppercase mb-5 block">Annual Report Design · Johannesburg · South Africa</span>
            <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 leading-[1.05]">
              Annual Report Design in Sandton
            </h1>
            <p className="text-white/60 text-base font-body mb-5 font-medium">Professional Annual Report, APP and Corporate Publication Design</p>
            <p className="text-white/45 text-sm leading-relaxed font-body mb-10 max-w-2xl">
              Creative Books SA designs professional annual reports, corporate reports, APP documents, magazines, cookbooks and coffee table books for organisations that need polished, structured and visually compelling publications. We help turn complex information into a clean, readable and professionally designed report that reflects your brand and communicates clearly with stakeholders.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link to="/getquote" className="inline-flex items-center gap-2 px-8 py-4 text-white text-sm font-semibold transition-all group" style={{ background: '#B8955B', boxShadow: '0 12px 32px rgba(184,149,91,0.35)', borderRadius: '8px' }}>
                Request a Quote <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <a href="#pricing" className="inline-flex items-center gap-2 px-8 py-4 text-white/80 text-sm font-medium" style={{ border: '1px solid rgba(255,255,255,0.15)', borderRadius: '8px', background: 'rgba(255,255,255,0.04)' }}>
                View Pricing Plans
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* About */}
      <section className="py-20 lg:py-28" style={{ background: 'rgba(255,255,255,0.02)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="max-w-3xl">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
              <span className="text-[#B8955B] text-xs tracking-[0.3em] uppercase font-body block mb-5">Why It Matters</span>
              <h2 className="font-heading text-3xl md:text-4xl font-bold text-white mb-6 leading-tight">Professional Annual Report Design Services</h2>
              <p className="text-white/55 font-body text-sm leading-relaxed mb-5">An annual report is one of the most important documents an organisation can produce. It presents performance, achievements, financial information, strategy, leadership communication and the story of the year.</p>
              <p className="text-white/55 font-body text-sm leading-relaxed mb-8">A poorly designed report can make important information difficult to understand, while a professional design improves readability, credibility and stakeholder confidence.</p>
              <Link to="/getquote" className="inline-flex items-center gap-2 px-7 py-3.5 text-white text-sm font-semibold" style={{ background: '#B8955B', borderRadius: '8px', boxShadow: '0 8px 24px rgba(184,149,91,0.3)' }}>
                Request a Design Quote <ArrowRight className="w-4 h-4" />
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Process */}
      <section className="py-20 lg:py-28" style={{ background: 'linear-gradient(160deg, #0d1830 0%, #090E18 100%)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-14">
            <span className="text-[#B8955B] text-xs tracking-[0.3em] uppercase font-body block mb-4">How It Works</span>
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-white mb-3 leading-tight">Annual Report Design Process</h2>
          </motion.div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {processSteps.map((step, i) => {
              const Icon = step.icon;
              return (
                <motion.div key={step.num} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}
                  className="p-7" style={{ background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px' }}>
                  <div className="w-10 h-10 flex items-center justify-center mb-5" style={{ background: 'rgba(184,149,91,0.15)', border: '1px solid rgba(184,149,91,0.25)', borderRadius: '10px' }}>
                    <Icon className="w-5 h-5 text-[#B8955B]" strokeWidth={1.5} />
                  </div>
                  <div className="font-heading text-3xl font-bold mb-3" style={{ color: 'rgba(184,149,91,0.2)' }}>{step.num}</div>
                  <h3 className="font-heading text-base font-bold text-white mb-2">{step.title}</h3>
                  <p className="text-xs font-body text-white/45 leading-relaxed">{step.body}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20 lg:py-28" style={{ background: 'linear-gradient(135deg, #090E18 0%, #0d1830 100%)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-14">
            <span className="text-[#B8955B] text-xs tracking-[0.3em] uppercase font-body block mb-4">Pricing Plan</span>
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-white mb-2 leading-tight">Annual Report Design Pricing Plan</h2>
            <p className="text-white/45 font-body text-sm">Design and layout for annual reports, APP documents, cookbooks, magazines and coffee table books.</p>
          </motion.div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {plans.map((plan, i) => (
              <motion.div key={plan.name} initial={{ opacity: 0, y: 28 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}
                whileHover={{ y: -6, transition: { duration: 0.2 } }}
                className="relative flex flex-col overflow-hidden"
                style={{
                  background: plan.popular ? 'linear-gradient(160deg, #ffffff 0%, #fdf9f4 100%)' : 'rgba(255,255,255,0.05)',
                  backdropFilter: 'blur(24px)',
                  border: plan.popular ? '1.5px solid rgba(184,149,91,0.55)' : '1px solid rgba(255,255,255,0.08)',
                  boxShadow: plan.popular ? '0 24px 60px rgba(184,149,91,0.2)' : '0 8px 32px rgba(0,0,0,0.4)',
                  borderRadius: '16px',
                }}>
                {plan.popular && (
                  <div className="absolute top-4 right-4">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 text-[10px] font-semibold tracking-[0.15em] uppercase" style={{ background: 'linear-gradient(135deg, #0B1220 0%, #1a2a4a 100%)', color: '#D4AF72', border: '1px solid rgba(212,175,114,0.3)', borderRadius: '4px' }}>
                      <Award className="w-2.5 h-2.5" />Popular
                    </span>
                  </div>
                )}
                <div className="p-7 flex-1">
                  <p className="text-[10px] font-semibold tracking-[0.25em] uppercase font-body mb-3" style={{ color: plan.popular ? '#B8955B' : 'rgba(255,255,255,0.4)' }}>{plan.name}</p>
                  <span className="font-heading text-4xl font-bold" style={{ color: plan.popular ? '#0B1220' : '#fff' }}>{plan.price}</span>
                  <p className="text-xs font-body mt-1 mb-5" style={{ color: plan.popular ? 'rgba(0,0,0,0.4)' : 'rgba(255,255,255,0.35)' }}>{plan.pages}</p>
                  <div className="h-px mb-5" style={{ background: plan.popular ? 'rgba(184,149,91,0.2)' : 'rgba(255,255,255,0.08)' }} />
                  <ul className="space-y-2">
                    {[...plan.features, plan.pages].map(f => (
                      <li key={f} className="flex items-center gap-2.5">
                        <div className="w-4 h-4 rounded-full flex items-center justify-center shrink-0" style={{ background: plan.popular ? 'rgba(184,149,91,0.12)' : 'rgba(255,255,255,0.08)', border: `1px solid ${plan.popular ? 'rgba(184,149,91,0.3)' : 'rgba(255,255,255,0.15)'}` }}>
                          <Check className="w-2.5 h-2.5" style={{ color: plan.popular ? '#B8955B' : 'rgba(255,255,255,0.7)' }} strokeWidth={2.5} />
                        </div>
                        <span className="text-xs font-body" style={{ color: plan.popular ? 'rgba(11,18,32,0.7)' : 'rgba(255,255,255,0.6)' }}>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="p-7 pt-0">
                  <Link to="/getquote" className="block text-center py-3 text-sm font-semibold font-body transition-all"
                    style={plan.popular ? { background: 'linear-gradient(135deg, #0B1220, #1a2a4a)', color: '#fff', boxShadow: '0 8px 24px rgba(11,18,32,0.25)', borderRadius: '8px' } : { background: 'rgba(184,149,91,0.15)', color: '#B8955B', border: '1px solid rgba(184,149,91,0.3)', borderRadius: '8px' }}>
                    Choose Plan
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 lg:py-28" style={{ background: 'linear-gradient(160deg, #0d1830 0%, #090E18 100%)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
            <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="lg:sticky lg:top-28">
              <span className="text-[#B8955B] text-xs tracking-[0.3em] uppercase font-body block mb-5">FAQ</span>
              <h2 className="font-heading text-3xl md:text-4xl font-bold text-white mb-4 leading-tight">Annual Report Design FAQs</h2>
              <p className="text-white/45 font-body text-sm leading-relaxed max-w-sm">Have more questions? Contact us for a personalised answer.</p>
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
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-white mb-5 leading-tight">Ready to Design a Professional Annual Report?</h2>
            <p className="text-white/45 font-body text-sm leading-relaxed mb-10 max-w-lg mx-auto">Get a personalised quote for your annual report design. Our Johannesburg team delivers professional, print-ready publications that reflect your brand with confidence.</p>
            <Link to="/getquote" className="inline-flex items-center gap-2 px-8 py-4 text-white text-sm font-semibold transition-all group" style={{ background: '#B8955B', boxShadow: '0 12px 32px rgba(184,149,91,0.35)', borderRadius: '8px' }}>
              Request a Design Quote <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>
        </div>
      </section>

      <InternalLinks links={[
        { label: 'Book Cover Design', path: '/bookcoverdesign' },
        { label: 'Book Layout & Typesetting', path: '/typesetting' },
        { label: 'eBook Formatting', path: '/ebookformatting' },
        { label: 'Author Websites', path: '/authorwebsites' },
        { label: 'Request a Quote', path: '/getquote' },
      ]} />
    </div>
  );
}