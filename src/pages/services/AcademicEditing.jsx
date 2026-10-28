import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowRight, Check, Plus, Minus, ChevronDown,
  BookOpen, FileText, BarChart2, Database, CheckSquare, ClipboardList, Shield, PenTool, Users, Award
} from 'lucide-react';
import InternalLinks from '../../components/shared/InternalLinks';
import PageMeta from '../../components/shared/PageMeta';

// ─── Data ─────────────────────────────────────────────────────────────────────
const services = [
  {
    icon: BookOpen,
    title: 'Academic Writing',
    slug: 'Academic Writing Services South Africa',
    body: 'We provide corporate and academic research writing services to SMEs, municipalities, institutions of higher learning and researchers. Our team delivers well-structured, credible and publication-ready academic content tailored to your institution\'s standards and research objectives.',
    bullets: ['Research papers and journal articles', 'Corporate and municipal reports', 'Literature reviews', 'Institutional research writing', 'Publication-ready manuscripts'],
  },
  {
    icon: PenTool,
    title: 'Language Editing',
    slug: 'Professional Language Editing',
    body: 'Our team of professional editors works meticulously to refine your writing, ensuring it meets high academic and publishing standards. Whether your manuscript is fiction, non-fiction or academic, we provide the expertise to make your work shine. Trust us to help you communicate your ideas clearly and effectively.',
    bullets: ['Grammar and syntax correction', 'Academic tone and register', 'Clarity and fluency improvement', 'Fiction and non-fiction manuscripts', 'Journal and publication standards'],
  },
  {
    icon: FileText,
    title: 'Technical Editing',
    slug: 'Technical Document Editing',
    body: 'We focus on correcting technical terminology, enhancing document structure and improving readability without altering the core message. Ideal for manuals, reports and technical papers, our expert editors ensure your content is precise, consistent and professional.',
    bullets: ['Technical terminology correction', 'Document structure improvement', 'Manuals and technical reports', 'Scientific and research papers', 'Readability without altering core content'],
  },
  {
    icon: BarChart2,
    title: 'Research Data Analysis',
    slug: 'Research Data Analysis South Africa',
    body: 'Our Research Data Analysis service provides expert analysis and interpretation of complex data sets, ensuring accurate and actionable insights for your research. We help researchers and institutions transform raw data into meaningful findings.',
    bullets: ['Quantitative and qualitative analysis', 'Data interpretation and reporting', 'Statistical analysis support', 'Actionable research insights', 'Academic and corporate research'],
    popular: true,
  },
  {
    icon: Database,
    title: 'Research Data Collection',
    slug: 'Research Data Collection Services',
    body: 'Our Research Data Collection service ensures accurate and comprehensive data gathering tailored to your study\'s needs, providing a solid foundation for reliable analysis and credible research outcomes.',
    bullets: ['Structured data collection', 'Survey and interview coordination', 'Field and desk research support', 'Study-specific methodology', 'Reliable and comprehensive gathering'],
  },
  {
    icon: CheckSquare,
    title: 'References Verification',
    slug: 'Academic Reference Verification',
    body: 'Our References Verification service meticulously checks your citations for accuracy and consistency, ensuring all sources are correctly formatted and credible. We work across APA, Harvard, Chicago and institutional referencing styles.',
    bullets: ['Citation accuracy checks', 'APA, Harvard, Chicago styles', 'Source credibility verification', 'Consistent formatting throughout', 'In-text and bibliography review'],
  },
  {
    icon: ClipboardList,
    title: 'Questionnaire Design',
    slug: 'Survey and Questionnaire Design',
    body: 'Our Questionnaire Design service crafts effective and tailored surveys to gather precise and relevant data for your research, ensuring high response rates and valuable insights that support your study objectives.',
    bullets: ['Structured survey design', 'Research-aligned question framing', 'High response rate optimisation', 'Quantitative and qualitative formats', 'Study-specific customisation'],
  },
  {
    icon: Shield,
    title: 'Assistance With Ethical Clearance Application',
    slug: 'Ethical Clearance Application Support',
    body: 'Our Assistance With Ethical Clearance Application service guides you through the process of obtaining ethical approval, ensuring your research meets all necessary ethical standards and requirements set by your institution or review board.',
    bullets: ['Ethical clearance documentation', 'Institutional review board preparation', 'Compliance with ethical standards', 'Application guidance and review', 'University and institutional submissions'],
  },
];

const faqs = [
  { q: 'Who do your academic services cater to?', a: 'We serve SMEs, municipalities, institutions of higher learning, postgraduate students, researchers and corporate clients who need professional academic writing, editing and research support.' },
  { q: 'Do you assist with thesis and dissertation editing?', a: 'Yes. Our language editing and technical editing services cover thesis chapters, dissertations and postgraduate research documents to meet university formatting and language standards.' },
  { q: 'Which referencing styles do you work with?', a: 'We work with APA, Harvard, Chicago, MLA and institution-specific referencing styles. Our references verification service checks all citations for accuracy and consistency.' },
  { q: 'Can you help with ethical clearance applications?', a: 'Yes. We provide guidance and documentation support to help researchers prepare and submit ethical clearance applications to their institutional review boards.' },
  { q: 'Do you offer data analysis services?', a: 'Yes. Our Research Data Analysis service handles both quantitative and qualitative data sets, helping researchers interpret findings accurately and prepare them for academic or corporate reporting.' },
  { q: 'Do you work with clients outside Johannesburg?', a: 'Yes. We assist researchers, students and institutions across South Africa and work with clients electronically for all academic and research services.' },
];

const clients = [
  'SMEs and Businesses', 'Municipalities', 'Universities and Colleges',
  'Postgraduate Students', 'PhD and Masters Candidates', 'Independent Researchers',
  'Non-Profit Organisations', 'Government Institutions', 'Research Institutes',
  'Corporate Research Teams', 'Healthcare Researchers', 'Education Sector Clients',
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

export default function AcademicEditing() {
  const [openFaq, setOpenFaq] = useState(null);

  return (
    <div style={{ background: '#f8f9fc' }}>
      <PageMeta
        title="Academic Editing Services in South Africa | Creative Books"
        description="Academic editing for South African students & researchers - theses, dissertations & research papers. UNISA, UJ, UP & Wits standards. Confidential. Get a quote."
        canonical="https://creativebooks.co.za/academicediting"
      />

      {/* FAQ Schema */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": faqs.map(f => ({ "@type": "Question", "name": f.q, "acceptedAnswer": { "@type": "Answer", "text": f.a } }))
      }) }} />

      {/* ── Hero ── */}
      <section className="relative min-h-[65vh] flex items-end overflow-hidden" style={{ background: 'linear-gradient(160deg, #090E18 0%, #0d1830 60%, #111827 100%)' }}>
        <div className="absolute top-0 left-0 w-[600px] h-[400px] pointer-events-none"
          style={{ background: 'radial-gradient(ellipse at 20% 30%, rgba(184,149,91,0.12) 0%, transparent 60%)', filter: 'blur(40px)' }} />
        <div className="absolute bottom-0 right-0 w-[500px] h-[300px] pointer-events-none"
          style={{ background: 'radial-gradient(ellipse at 80% 80%, rgba(100,130,220,0.08) 0%, transparent 60%)', filter: 'blur(60px)' }} />
        <div className="absolute top-0 left-0 right-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(184,149,91,0.6), transparent)' }} />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 pt-32 pb-20 w-full">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }} className="max-w-3xl">
            <span className="text-[#B8955B] text-xs font-body font-semibold tracking-[0.3em] uppercase mb-5 block">Academic Editing & Research Services · South Africa</span>
            <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 leading-[1.05]">
              Academic Editing Services in South Africa
            </h1>
            <p className="text-white/60 text-base font-body mb-4 font-medium">
              Professional Academic Writing, Language Editing, Technical Editing and Research Support
            </p>
            <p className="text-white/45 text-sm leading-relaxed font-body mb-10 max-w-2xl">
              Creative Books SA provides academic editing and research services for SMEs, municipalities, universities, postgraduate students and independent researchers across South Africa. From language and technical editing to research data analysis, references verification and ethical clearance support — we help you meet the highest academic and institutional standards.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link to="/getquote" className="inline-flex items-center gap-2 px-8 py-4 text-white text-sm font-semibold transition-all group"
                style={{ background: '#B8955B', boxShadow: '0 12px 32px rgba(184,149,91,0.35)', borderRadius: '8px' }}>
                Request an Academic Services Quote
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <a href="#services" className="inline-flex items-center gap-2 px-8 py-4 text-white/80 text-sm font-medium transition-all"
                style={{ border: '1px solid rgba(255,255,255,0.15)', borderRadius: '8px', background: 'rgba(255,255,255,0.04)' }}>
                View All Services
                <ChevronDown className="w-4 h-4" />
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Trust Strip ── */}
      <section className="relative py-10 overflow-hidden" style={{ background: 'linear-gradient(135deg, #f0f4ff 0%, #eef1f7 100%)', borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { icon: BookOpen,     title: 'Academic & Research Writing',  body: 'Writing and editing for universities, municipalities, SMEs and researchers.' },
              { icon: PenTool,      title: 'Language & Technical Editing', body: 'Precision editing that meets academic and publishing standards.' },
              { icon: BarChart2,    title: 'Data Analysis & Collection',   body: 'Expert data handling for reliable research insights.' },
              { icon: Shield,       title: 'Ethical Clearance Support',    body: 'Guidance through institutional ethical approval processes.' },
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

      {/* ── Intro ── */}
      <section className="py-20 lg:py-28" style={{ background: '#F8F5EF' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="max-w-3xl">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
              <span className="text-[#B8955B] text-xs tracking-[0.3em] uppercase font-body block mb-5">Why It Matters</span>
              <h2 className="font-heading text-3xl md:text-4xl font-bold text-[#0B1220] mb-6 leading-tight">Professional Academic Editing and Research Services in South Africa</h2>
              <p className="text-[#2B2B2B]/60 font-body text-sm leading-relaxed mb-5">
                Academic and research work demands precision, credibility and clarity. Whether you are preparing a thesis, journal article, institutional report or corporate research document, the quality of your writing and data directly affects how your work is received.
              </p>
              <p className="text-[#2B2B2B]/60 font-body text-sm leading-relaxed mb-5">
                Creative Books SA works with researchers, postgraduate students, universities, municipalities and SMEs to provide end-to-end academic support — from writing and editing to data collection, analysis, references verification and ethical clearance assistance.
              </p>
              <p className="text-[#2B2B2B]/60 font-body text-sm leading-relaxed mb-8">
                Our services are designed to meet the high standards required by academic institutions, publishers and research bodies across South Africa.
              </p>
              <Link to="/getquote" className="inline-flex items-center gap-2 px-7 py-3.5 text-white text-sm font-semibold transition-all group"
                style={{ background: '#0B1220', borderRadius: '8px', boxShadow: '0 8px 24px rgba(11,18,32,0.2)' }}>
                Request an Academic Services Quote
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── Services Grid ── */}
      <section id="services" className="py-20 lg:py-28 overflow-hidden" style={{ background: 'linear-gradient(135deg, #f0f4ff 0%, #eef1f7 100%)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-14">
            <span className="text-[#B8955B] text-xs tracking-[0.3em] uppercase font-body block mb-4">Our Services</span>
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-[#0B1220] mb-3 leading-tight">Academic Editing and Research Services</h2>
            <p className="text-[#2B2B2B]/55 font-body text-sm max-w-2xl leading-relaxed">We offer a comprehensive suite of academic and research support services for individuals, institutions and organisations across South Africa.</p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {services.map((svc, i) => {
              const Icon = svc.icon;
              return (
                <motion.div key={svc.title}
                  initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.07 }}
                  className="relative flex flex-col overflow-hidden"
                  style={{
                    background: svc.popular ? 'linear-gradient(160deg, #ffffff 0%, #fdf9f4 100%)' : 'rgba(255,255,255,0.72)',
                    backdropFilter: 'blur(24px)',
                    border: svc.popular ? '1.5px solid rgba(184,149,91,0.5)' : '1px solid rgba(255,255,255,0.88)',
                    boxShadow: svc.popular ? '0 24px 60px rgba(184,149,91,0.15), inset 0 1px 0 rgba(255,255,255,1)' : '0 8px 32px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,1)',
                    borderRadius: '16px',
                  }}>
                  {svc.popular && (
                    <div className="absolute top-4 right-4">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 text-[10px] font-semibold tracking-[0.15em] uppercase"
                        style={{ background: 'linear-gradient(135deg, #0B1220 0%, #1a2a4a 100%)', color: '#D4AF72', border: '1px solid rgba(212,175,114,0.3)', borderRadius: '4px' }}>
                        <Award className="w-2.5 h-2.5" />Popular
                      </span>
                    </div>
                  )}
                  <div className="p-7 flex-1">
                    <div className="flex items-center gap-3 mb-5">
                      <div className="w-10 h-10 flex items-center justify-center shrink-0"
                        style={{ background: svc.popular ? 'rgba(184,149,91,0.12)' : 'rgba(11,18,32,0.05)', border: `1px solid ${svc.popular ? 'rgba(184,149,91,0.25)' : 'rgba(11,18,32,0.08)'}`, borderRadius: '10px' }}>
                        <Icon className="w-5 h-5" style={{ color: svc.popular ? '#B8955B' : '#0B1220' }} strokeWidth={1.5} />
                      </div>
                      <div>
                        <p className="text-[9px] font-semibold tracking-[0.2em] uppercase font-body mb-0.5" style={{ color: svc.popular ? '#B8955B' : 'rgba(11,18,32,0.35)' }}>{svc.slug}</p>
                        <h3 className="font-heading text-base font-bold text-[#0B1220] leading-tight">{svc.title}</h3>
                      </div>
                    </div>
                    <p className="text-xs font-body text-[#2B2B2B]/60 leading-relaxed mb-5">{svc.body}</p>
                    <ul className="space-y-2">
                      {svc.bullets.map(b => (
                        <li key={b} className="flex items-center gap-2.5">
                          <div className="w-3.5 h-3.5 rounded-full flex items-center justify-center shrink-0"
                            style={{ background: svc.popular ? 'rgba(184,149,91,0.12)' : 'rgba(11,18,32,0.06)', border: `1px solid ${svc.popular ? 'rgba(184,149,91,0.3)' : 'rgba(11,18,32,0.1)'}` }}>
                            <Check className="w-2 h-2" style={{ color: svc.popular ? '#B8955B' : '#0B1220' }} strokeWidth={3} />
                          </div>
                          <span className="text-xs font-body text-[#2B2B2B]/65">{b}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="px-7 pb-7">
                    <Link to="/getquote" className="block text-center py-3 text-sm font-semibold font-body transition-all"
                      style={svc.popular
                        ? { background: 'linear-gradient(135deg, #0B1220, #1a2a4a)', color: '#fff', boxShadow: '0 8px 24px rgba(11,18,32,0.25)', borderRadius: '8px' }
                        : { background: 'rgba(11,18,32,0.05)', color: '#0B1220', border: '1px solid rgba(11,18,32,0.12)', borderRadius: '8px' }}>
                      Request a Quote
                    </Link>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Who We Serve ── */}
      <section className="py-20 lg:py-24" style={{ background: '#F8F5EF' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-10">
            <span className="text-[#B8955B] text-xs tracking-[0.3em] uppercase font-body block mb-4">Clients We Serve</span>
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-[#0B1220] mb-3 leading-tight">Academic Services for Researchers and Institutions</h2>
            <p className="text-[#2B2B2B]/55 font-body text-sm max-w-xl leading-relaxed">
              We work with a wide range of clients who need professional academic writing, editing and research support across South Africa.
            </p>
          </motion.div>
          <div className="flex flex-wrap gap-2">
            {clients.map((c, i) => (
              <motion.span key={c} initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: i * 0.04 }}
                className="px-4 py-2 text-xs font-body font-medium text-[#0B1220]"
                style={{ background: 'rgba(255,255,255,0.75)', backdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,0.9)', boxShadow: '0 2px 12px rgba(0,0,0,0.05)', borderRadius: '6px' }}>
                {c}
              </motion.span>
            ))}
          </div>
        </div>
      </section>

      {/* ── SEO Section ── */}
      <section className="py-20 overflow-hidden" style={{ background: 'linear-gradient(135deg, #f0f4ff 0%, #eef1f7 100%)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="max-w-3xl">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
              <span className="text-[#B8955B] text-xs tracking-[0.3em] uppercase font-body block mb-5">Johannesburg · South Africa</span>
              <h2 className="font-heading text-3xl md:text-4xl font-bold text-[#0B1220] mb-6 leading-tight">Academic Editing and Research Services in Johannesburg</h2>
              <p className="text-[#2B2B2B]/60 font-body text-sm leading-relaxed mb-5">
                If you are looking for academic editing services in Johannesburg or across South Africa, Creative Books SA provides professional support for researchers, students, universities and institutions. Our services cover academic writing, language editing, technical editing, research data collection, data analysis, references verification, questionnaire design and ethical clearance application assistance.
              </p>
              <p className="text-[#2B2B2B]/60 font-body text-sm leading-relaxed mb-8">
                Whether you are preparing a postgraduate thesis, publishing a journal article, managing a municipal research project or completing a corporate report, our academic editing team helps you present your work with accuracy, credibility and professional quality.
              </p>
              <Link to="/getquote" className="inline-flex items-center gap-2 px-7 py-3.5 text-white text-sm font-semibold transition-all group"
                style={{ background: '#B8955B', borderRadius: '8px', boxShadow: '0 8px 24px rgba(184,149,91,0.3)' }}>
                Start Your Academic Services Quote
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="py-20 lg:py-28" style={{ background: '#F8F5EF' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
            <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="lg:sticky lg:top-28">
              <span className="text-[#B8955B] text-xs tracking-[0.3em] uppercase font-body block mb-5">FAQ</span>
              <h2 className="font-heading text-3xl md:text-4xl font-bold text-[#0B1220] mb-4 leading-tight">Academic Services FAQs</h2>
              <p className="text-[#2B2B2B]/55 font-body text-sm leading-relaxed max-w-sm">Have more questions about our academic editing or research services? Contact us for a personalised answer.</p>
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

      {/* ── Final CTA ── */}
      <section className="relative py-20 overflow-hidden" style={{ background: 'linear-gradient(160deg, #090E18 0%, #0d1830 100%)' }}>
        <div className="absolute top-0 left-0 right-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(184,149,91,0.5), transparent)' }} />
        <div className="absolute bottom-0 left-0 right-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(184,149,91,0.2), transparent)' }} />
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[600px] h-[400px] pointer-events-none"
          style={{ background: 'radial-gradient(ellipse, rgba(184,149,91,0.07) 0%, transparent 65%)', filter: 'blur(60px)' }} />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <span className="text-[#B8955B] text-xs tracking-[0.3em] uppercase font-body block mb-6">Ready to Get Started?</span>
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-white mb-5 leading-tight">Ready to Strengthen Your Academic Work?</h2>
            <p className="text-white/45 font-body text-sm leading-relaxed mb-10 max-w-lg mx-auto">
              Whether you need academic writing, language editing, technical editing, data analysis or research support, Creative Books SA can help you meet the highest academic and institutional standards.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link to="/getquote" className="inline-flex items-center gap-2 px-8 py-4 text-white text-sm font-semibold transition-all group"
                style={{ background: '#B8955B', boxShadow: '0 12px 32px rgba(184,149,91,0.35)', borderRadius: '8px' }}>
                Request an Academic Services Quote
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link to="/book-editing" className="inline-flex items-center gap-2 px-8 py-4 text-white/70 text-sm transition-all"
                style={{ border: '1px solid rgba(255,255,255,0.12)', borderRadius: '8px', background: 'rgba(255,255,255,0.04)' }}>
                View Book Editing Services
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      <InternalLinks links={[
        { label: 'Book Editing Services',    path: '/book-editing' },
        { label: 'Proofreading Services',    path: '/proofreading' },
        { label: 'Thesis Editing',           path: '/thesisediting' },
        { label: 'Dissertation Editing',     path: '/dissertationediting' },
        { label: 'Language Editing',         path: '/book-editing' },
        { label: 'Request a Quote',          path: '/getquote' },
      ]} light />
    </div>
  );
}