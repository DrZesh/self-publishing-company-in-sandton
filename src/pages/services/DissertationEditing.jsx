import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowRight, Check, Plus, Minus, ChevronDown,
  BookOpen, Eye, AlignLeft, Shield, Star, Award, FileText, Users, CheckSquare, Layers
} from 'lucide-react';
import InternalLinks from '../../components/shared/InternalLinks';
import PageMeta from '../../components/shared/PageMeta';

// ─── Data ─────────────────────────────────────────────────────────────────────
const services = [
  {
    title: 'Dissertation Proofreading',
    body: "Dissertation proofreading is ideal for students whose document is already well-written but needs a final check for spelling, grammar, punctuation, typing errors and small language mistakes.",
    bullets: ['Final submission checks', 'Spelling correction', 'Grammar correction', 'Punctuation review', 'Typographical errors', 'Basic consistency checks', 'Minor wording corrections'],
    cta: 'Request Dissertation Proofreading',
  },
  {
    title: 'Dissertation Copy Editing',
    body: 'Dissertation copy editing improves grammar, sentence clarity, consistency, academic tone and readability while keeping your research argument intact. This service helps the document read more smoothly and professionally.',
    bullets: ['Sentence clarity', 'Grammar correction', 'Academic tone improvement', 'Language consistency', 'Paragraph flow', 'Readability improvement', 'Formal academic expression'],
    cta: 'Request Dissertation Copy Editing',
    popular: true,
  },
  {
    title: 'Dissertation Language Editing',
    body: 'Dissertation language editing focuses on improving how your research is communicated. It helps refine academic expression, sentence structure, paragraph transitions and the clarity of complex ideas.',
    bullets: ['Academic expression', 'Clear argument flow', 'Complex sentence refinement', 'Paragraph transitions', 'Formal academic style', 'Improved readability', 'Stronger academic communication'],
    cta: 'Request Dissertation Language Editing',
  },
  {
    title: 'Dissertation Structure Review',
    body: 'This service looks at the logical flow and presentation of your dissertation sections. It can help identify areas where the writing, chapter flow or section clarity may need improvement.',
    bullets: ['Chapter flow', 'Section organisation', 'Research argument clarity', 'Logical progression', 'Paragraph structure', 'Content presentation feedback'],
    cta: 'Request Structure Review',
  },
  {
    title: 'Referencing and Citation Consistency Check',
    body: 'We help review citation and reference consistency where the required referencing style and university instructions are provided. This helps ensure your in-text citations, reference list and formatting style are more consistent.',
    bullets: ['APA', 'Harvard', 'MLA', 'Chicago', 'Footnotes', 'In-text citations', 'Reference list consistency'],
    cta: 'Request Referencing Check',
  },
  {
    title: 'Dissertation Formatting Review',
    body: 'This service checks presentation consistency across headings, spacing, tables, figures, captions, page layout and formatting instructions where guidelines are provided.',
    bullets: ['Heading consistency', 'Table formatting', 'Figure captions', 'Spacing checks', 'Page presentation', 'University formatting requirements'],
    cta: 'Request Formatting Review',
  },
];

const chapters = [
  { num: '01', title: 'Introduction', body: 'We help improve clarity around your background, problem statement, research objectives, research questions and study overview.' },
  { num: '02', title: 'Literature Review', body: 'We help refine flow, academic tone, source integration, paragraph structure and consistency across literature discussions.' },
  { num: '03', title: 'Research Methodology', body: 'We help improve clarity in your research design, sampling, data collection, data analysis and ethical considerations.' },
  { num: '04', title: 'Findings or Results', body: 'We help polish the presentation of findings so that tables, explanations and result discussions are easier to follow.' },
  { num: '05', title: 'Discussion', body: 'We help improve the flow and clarity of your interpretation, argument and connection between findings and literature.' },
  { num: '06', title: 'Conclusion and Recommendations', body: 'We help refine your conclusion, recommendations, limitations and final academic presentation.' },
];

const processSteps = [
  { num: '01', title: 'Send Your Dissertation Details', body: 'Tell us your word count, qualification level, deadline, required editing level, university formatting instructions and referencing style if applicable.' },
  { num: '02', title: 'Get a Quote', body: 'We prepare a quote based on the length of your dissertation, the editing level required and your project timeline.' },
  { num: '03', title: 'Confirm the Editing Scope', body: 'Once the quote is accepted, we confirm the editing scope, turnaround time and submission requirements.' },
  { num: '04', title: 'Send the Word Document', body: 'Send your dissertation as a Word document so tracked changes, comments and suggestions can be reviewed clearly.' },
  { num: '05', title: 'Dissertation Editing Begins', body: 'Our editors review your dissertation according to the agreed scope, focusing on grammar, clarity, academic tone, consistency, sentence flow and presentation.' },
  { num: '06', title: 'Receive the Edited Dissertation', body: 'You receive the edited dissertation file for review, with tracked changes or suggestions where applicable.' },
];

const packages = [
  {
    title: 'Dissertation Proofreading',
    label: 'Final Language Check',
    bestFor: 'Students who need final spelling, grammar, punctuation and typo correction before submission.',
    includes: ['Spelling correction', 'Grammar check', 'Punctuation check', 'Typo correction', 'Basic consistency review', 'Clean language polish', 'Final submission readiness check'],
    cta: 'Request Proofreading Quote',
    popular: false,
  },
  {
    title: 'Dissertation Copy Editing',
    label: 'Language and Clarity Improvement',
    bestFor: 'Students who need improved grammar, sentence flow, academic tone and readability.',
    includes: ['Grammar correction', 'Sentence clarity', 'Academic tone improvement', 'Consistency checks', 'Flow improvement', 'Tracked changes where applicable', 'Readability improvement'],
    cta: 'Request Copy Editing Quote',
    popular: false,
  },
  {
    title: 'Full Dissertation Language Editing',
    label: 'Comprehensive Dissertation Polish',
    bestFor: 'Students who need a deeper language, clarity and presentation review before supervisor review or final submission.',
    includes: ['Academic language editing', 'Chapter flow review', 'Sentence structure improvement', 'Paragraph transitions', 'Consistency checks', 'Referencing consistency support', 'Submission-readiness polish'],
    cta: 'Request Full Dissertation Editing Quote',
    popular: true,
    badge: 'Popular',
  },
  {
    title: 'Referencing and Formatting Review',
    label: 'Citation and Presentation Support',
    bestFor: 'Students who need help checking citation consistency, reference list presentation and formatting alignment.',
    includes: ['In-text citation consistency', 'Reference list checks', 'Style guide alignment where instructions are provided', 'Formatting comments', 'Heading consistency', 'Table and figure presentation checks'],
    cta: 'Request Referencing and Formatting Support',
    popular: false,
  },
];

const whyCards = [
  { icon: Eye,       title: 'Clarity',               body: 'Editing helps your research argument become easier to follow.' },
  { icon: BookOpen,  title: 'Academic Tone',          body: 'Your dissertation is refined to sound more formal, consistent and professional.' },
  { icon: AlignLeft, title: 'Readability',            body: 'Long chapters, complex sections and dense paragraphs become easier to read.' },
  { icon: Star,      title: 'Submission Confidence',  body: 'A polished dissertation gives you more confidence before supervisor review or final submission.' },
];

const documentTypes = [
  "Master's dissertations", "MBA dissertations", "Honours research reports", "Postgraduate research reports",
  "Research proposals", "Concept notes", "Literature reviews", "Methodology chapters",
  "Findings chapters", "Discussion chapters", "Conclusion chapters", "Research reports",
  "Academic papers based on dissertation work", "Supervisor review drafts", "Final submission drafts",
];

const whoWeHelp = [
  "Master's students", "MBA students", "Honours students", "Postgraduate students",
  "Research students", "University students", "Distance learning students", "Part-time students",
  "Working professionals", "Education students", "Business students", "Health science students",
  "Social science students", "Humanities students", "Law students", "Independent researchers",
];

const disciplines = [
  "Business and management", "Education", "Public administration", "Social sciences",
  "Humanities", "Health sciences", "Psychology", "Law", "Theology", "Communication studies",
  "Development studies", "Nursing", "Marketing", "Human resources", "Finance", "Entrepreneurship",
];

const faqs = [
  { q: 'What is dissertation editing?', a: "Dissertation editing is the process of improving grammar, clarity, academic tone, sentence structure, consistency, readability and presentation while preserving the student's original research and argument." },
  { q: "Do you edit Master's and MBA dissertations?", a: "Yes. Creative Books SA provides editing support for Master's dissertations, MBA dissertations, Honours research reports, research proposals and dissertation chapters." },
  { q: 'Do you write dissertations for students?', a: 'No. We do not write dissertations, academic assignments or research documents on behalf of students. We only provide ethical editing support for work that has already been written.' },
  { q: 'Can you check references and citations?', a: 'Yes. We can help check referencing consistency, in-text citations and reference lists where the required referencing style and instructions are provided.' },
  { q: 'Do I need to send my dissertation as a Word document?', a: 'Yes. Dissertation documents should usually be sent as Word documents so tracked changes, comments and suggestions can be used clearly.' },
  { q: 'Can you edit individual dissertation chapters?', a: 'Yes. We can edit individual chapters such as the introduction, literature review, methodology, findings, discussion, conclusion or recommendations.' },
  { q: 'Do you offer dissertation editing outside Johannesburg?', a: 'Yes. Creative Books SA assists students in Johannesburg, Gauteng and across South Africa.' },
  { q: 'Can you edit urgent dissertation documents?', a: 'Turnaround time depends on the word count, editing level and current project schedule. Send your dissertation details so we can advise on availability.' },
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

function PackageCard({ pkg, i }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 28 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}
      whileHover={{ y: -6, transition: { duration: 0.22 } }}
      className="relative flex flex-col overflow-hidden h-full"
      style={{
        background: pkg.popular ? 'linear-gradient(160deg, #ffffff 0%, #fdf9f4 100%)' : 'rgba(255,255,255,0.72)',
        backdropFilter: 'blur(24px)',
        border: pkg.popular ? '1.5px solid rgba(184,149,91,0.55)' : '1px solid rgba(255,255,255,0.88)',
        boxShadow: pkg.popular ? '0 24px 60px rgba(184,149,91,0.18), inset 0 1px 0 rgba(255,255,255,1)' : '0 8px 32px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,1)',
        borderRadius: '16px',
      }}>
      <div className="absolute top-0 left-4 right-4 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,1), transparent)' }} />
      {pkg.badge && (
        <div className="absolute top-4 right-4">
          <span className="inline-flex items-center gap-1 px-2.5 py-1 text-[10px] font-semibold tracking-[0.15em] uppercase"
            style={{ background: 'linear-gradient(135deg, #0B1220 0%, #1a2a4a 100%)', color: '#D4AF72', border: '1px solid rgba(212,175,114,0.3)', borderRadius: '4px' }}>
            <Award className="w-2.5 h-2.5" />{pkg.badge}
          </span>
        </div>
      )}
      <div className="p-6 flex-1">
        <p className="text-[10px] font-semibold tracking-[0.2em] uppercase font-body mb-1" style={{ color: pkg.popular ? '#B8955B' : 'rgba(11,18,32,0.35)' }}>{pkg.label}</p>
        <h3 className="font-heading text-lg font-bold text-[#0B1220] mb-3">{pkg.title}</h3>
        <p className="text-xs font-body text-[#2B2B2B]/50 italic mb-5 leading-relaxed">{pkg.bestFor}</p>
        <div className="h-px mb-5" style={{ background: pkg.popular ? 'rgba(184,149,91,0.2)' : 'rgba(0,0,0,0.06)' }} />
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] font-body mb-3 text-[#0B1220]/35">Includes</p>
        <ul className="space-y-2">
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
      </div>
      <div className="p-6 pt-0">
        <Link to="/getquote" className="block text-center py-3 px-5 text-sm font-semibold font-body transition-all"
          style={pkg.popular ? {
            background: 'linear-gradient(135deg, #0B1220, #1a2a4a)', color: '#fff', boxShadow: '0 8px 24px rgba(11,18,32,0.25)', borderRadius: '8px',
          } : {
            background: 'rgba(11,18,32,0.05)', color: '#0B1220', border: '1px solid rgba(11,18,32,0.12)', borderRadius: '8px',
          }}>
          {pkg.cta}
        </Link>
      </div>
    </motion.div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────
export default function DissertationEditing() {
  const [openFaq, setOpenFaq] = useState(null);

  return (
    <div style={{ background: '#f8f9fc' }}>
      <PageMeta
        title="Dissertation Editing Services South Africa | Academic Pros"
        description="Specialised dissertation editing for SA universities. Improve clarity, structure, academic language. Confidential service with fast turnaround."
        canonical="https://www.creativebooks.co.za/dissertationediting"
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
        <div className="absolute top-0 left-0 right-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(184,149,91,0.6), transparent)' }} />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 pt-32 pb-20 w-full">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }} className="max-w-3xl">
            <span className="text-[#B8955B] text-xs font-body font-semibold tracking-[0.3em] uppercase mb-5 block">
              Dissertation Editing Services · Johannesburg · South Africa
            </span>
            <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 leading-[1.05]">
              Professional Dissertation Editing
            </h1>
            <p className="text-white/60 text-base font-body mb-4 font-medium">
              Professional Dissertation Editing and Proofreading for Postgraduate Students in South Africa
            </p>
            <p className="text-white/45 text-sm leading-relaxed font-body mb-5 max-w-2xl">
              Creative Books SA provides professional dissertation editing services in Johannesburg for students who need their academic work to read clearly, consistently and professionally before submission. Whether you are completing a Master's dissertation, MBA dissertation, Honours research project or postgraduate academic document, our editors help refine your grammar, sentence structure, academic tone, clarity, flow and overall presentation.
            </p>
            <p className="text-white/35 text-sm leading-relaxed font-body mb-10 max-w-2xl">
              A dissertation is more than a long academic document. It is the final presentation of your research, argument and academic effort. Our role is to help you polish the language and readability of your dissertation while preserving your original research, findings and academic voice.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link to="/getquote" className="inline-flex items-center gap-2 px-8 py-4 text-white text-sm font-semibold transition-all group"
                style={{ background: '#B8955B', boxShadow: '0 12px 32px rgba(184,149,91,0.35)', borderRadius: '8px' }}>
                Request a Dissertation Editing Quote
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <a href="#services" className="inline-flex items-center gap-2 px-8 py-4 text-white/80 text-sm font-medium transition-all"
                style={{ border: '1px solid rgba(255,255,255,0.15)', borderRadius: '8px', background: 'rgba(255,255,255,0.04)' }}>
                View Dissertation Editing Services
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
              { icon: FileText,  title: "Master's and MBA Dissertation Editing", body: 'Professional language editing for postgraduate research documents.' },
              { icon: AlignLeft, title: 'Academic Tone and Clarity',              body: 'Improve grammar, sentence structure, readability and formal academic expression.' },
              { icon: Shield,    title: 'Ethical Editing Support',                body: 'We polish your writing while preserving your research, argument and academic contribution.' },
              { icon: Users,     title: 'Johannesburg and South Africa',          body: 'Dissertation editing support for students in Johannesburg, Gauteng and across South Africa.' },
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
                Professional Dissertation Editing for Students in Johannesburg and South Africa
              </h2>
              <p className="text-[#2B2B2B]/60 font-body text-sm leading-relaxed mb-5">
                A dissertation must communicate research clearly, logically and professionally. Even when the research is strong, poor grammar, unclear sentences, weak flow or inconsistent academic tone can make the work difficult to read and reduce the impact of the argument.
              </p>
              <p className="text-[#2B2B2B]/60 font-body text-sm leading-relaxed mb-5">
                Creative Books SA helps students refine their dissertations before submission by improving grammar, clarity, paragraph flow, academic tone, consistency and presentation. Our dissertation editing service is designed for students who have already completed their own research and writing but need professional language support before submitting their work.
              </p>
              <p className="text-[#2B2B2B]/60 font-body text-sm leading-relaxed mb-8">
                We do not replace your research or write your dissertation for you. Instead, we help improve how your work is written, organised and presented so that your dissertation feels cleaner, more professional and easier to follow.
              </p>
              <Link to="/getquote" className="inline-flex items-center gap-2 px-7 py-3.5 text-white text-sm font-semibold transition-all group"
                style={{ background: '#0B1220', borderRadius: '8px', boxShadow: '0 8px 24px rgba(11,18,32,0.2)' }}>
                Request a Dissertation Editing Quote
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── 4. ETHICAL EDITING ── */}
      <section className="py-20 lg:py-28 overflow-hidden" style={{ background: 'linear-gradient(135deg, #f0f4ff 0%, #eef1f7 100%)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-12">
            <span className="text-[#B8955B] text-xs tracking-[0.3em] uppercase font-body block mb-4">Academic Integrity</span>
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-[#0B1220] mb-5 leading-tight max-w-2xl">
              Ethical Dissertation Editing That Protects Your Academic Integrity
            </h2>
            <p className="text-[#2B2B2B]/60 font-body text-sm leading-relaxed max-w-2xl mb-4">
              Creative Books SA provides dissertation editing that respects academic integrity. Your dissertation remains your own work. Our role is to improve grammar, language, flow, consistency, referencing presentation and readability without changing your research findings, creating content on your behalf or replacing your academic contribution.
            </p>
            <p className="text-[#2B2B2B]/60 font-body text-sm leading-relaxed max-w-2xl">
              We do not write dissertations for students. We do not fabricate research, create data, invent references, change findings or complete academic assignments. We only assist with editing and proofreading work that has already been written by the student or researcher.
            </p>
          </motion.div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              { icon: Shield,      title: 'Your Research Remains Yours',        body: 'We preserve your ideas, argument, research findings and academic voice.' },
              { icon: CheckSquare, title: 'No Fabricated Academic Content',     body: 'We do not invent research, data, references, citations or academic claims.' },
              { icon: BookOpen,    title: 'Professional Language Refinement',   body: 'We improve grammar, academic tone, clarity, consistency and readability.' },
              { icon: Star,        title: 'Submission-Focused Support',         body: 'We help polish your document so it is clearer and more professionally presented before review or submission.' },
            ].map((card, i) => {
              const Icon = card.icon;
              return (
                <motion.div key={card.title} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}
                  className="p-7" style={{ background: 'rgba(255,255,255,0.75)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.9)', boxShadow: '0 4px 20px rgba(0,0,0,0.06)', borderRadius: '14px' }}>
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

      {/* ── 5. SERVICES ── */}
      <section id="services" className="py-20 lg:py-28" style={{ background: '#F8F5EF' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-14">
            <span className="text-[#B8955B] text-xs tracking-[0.3em] uppercase font-body block mb-4">Services</span>
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-[#0B1220] mb-3 leading-tight">Dissertation Editing Services We Offer</h2>
            <p className="text-[#2B2B2B]/55 font-body text-sm max-w-2xl leading-relaxed">
              Our dissertation editing services are designed to help students prepare their work for supervisor review, examination, final submission or academic presentation. Choose the level of support that matches your dissertation's needs.
            </p>
          </motion.div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {services.map((svc, i) => (
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
                <div className="p-7 flex-1">
                  <h3 className="font-heading text-base font-bold text-[#0B1220] mb-4">{svc.title}</h3>
                  <p className="text-xs font-body text-[#2B2B2B]/60 leading-relaxed mb-5">{svc.body}</p>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.2em] font-body text-[#0B1220]/40 mb-3">Best for</p>
                  <ul className="space-y-2 mb-6">
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
                    {svc.cta}
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 6. DISSERTATION CHAPTERS ── */}
      <section className="py-20 lg:py-28" style={{ background: 'linear-gradient(160deg, #090E18 0%, #0d1830 100%)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-14">
            <span className="text-[#B8955B] text-xs tracking-[0.3em] uppercase font-body block mb-4">Chapter by Chapter</span>
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-white mb-3 leading-tight">Dissertation Chapters We Can Help Refine</h2>
            <p className="text-white/40 font-body text-sm max-w-lg leading-relaxed">
              Different chapters of a dissertation require different levels of clarity and structure. Creative Books SA can help polish the language, flow and presentation of each section so your document reads more professionally from beginning to end.
            </p>
          </motion.div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {chapters.map((ch, i) => (
              <motion.div key={ch.num} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}
                className="p-7" style={{ background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.08)', boxShadow: '0 8px 32px rgba(0,0,0,0.3)', borderRadius: '16px' }}>
                <div className="font-heading text-4xl font-bold mb-4" style={{ color: 'rgba(184,149,91,0.25)' }}>{ch.num}</div>
                <h3 className="font-heading text-base font-bold text-white mb-3">{ch.title}</h3>
                <p className="text-xs font-body text-white/45 leading-relaxed">{ch.body}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 7. DOCUMENT TYPES ── */}
      <section className="py-20 lg:py-24 overflow-hidden" style={{ background: 'linear-gradient(135deg, #f0f4ff 0%, #eef1f7 100%)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-10">
            <span className="text-[#B8955B] text-xs tracking-[0.3em] uppercase font-body block mb-4">Document Types</span>
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-[#0B1220] mb-3 leading-tight">Academic Documents Related to Dissertations That We Edit</h2>
            <p className="text-[#2B2B2B]/55 font-body text-sm max-w-xl leading-relaxed">
              Creative Books SA provides dissertation editing support for different postgraduate and research-related documents.
            </p>
          </motion.div>
          <div className="flex flex-wrap gap-2">
            {documentTypes.map((doc, i) => (
              <motion.span key={doc} initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: i * 0.03 }}
                className="px-4 py-2 text-xs font-body font-medium text-[#0B1220]"
                style={{ background: 'rgba(255,255,255,0.75)', backdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,0.9)', boxShadow: '0 2px 12px rgba(0,0,0,0.05)', borderRadius: '6px' }}>
                {doc}
              </motion.span>
            ))}
          </div>
        </div>
      </section>

      {/* ── 8. PROCESS ── */}
      <section className="py-20 lg:py-28" style={{ background: '#F8F5EF' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-14">
            <span className="text-[#B8955B] text-xs tracking-[0.3em] uppercase font-body block mb-4">How It Works</span>
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-[#0B1220] mb-3 leading-tight">Our Dissertation Editing Process</h2>
            <p className="text-[#2B2B2B]/55 font-body text-sm max-w-lg leading-relaxed">
              We follow a clear and professional editing process so you know what to expect from quote request to final edited document.
            </p>
          </motion.div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {processSteps.map((step, i) => (
              <motion.div key={step.num} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}
                className="p-7" style={{ background: 'rgba(255,255,255,0.75)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.9)', boxShadow: '0 4px 20px rgba(0,0,0,0.06)', borderRadius: '16px' }}>
                <div className="font-heading text-4xl font-bold mb-4" style={{ color: 'rgba(184,149,91,0.3)' }}>{step.num}</div>
                <h3 className="font-heading text-base font-bold text-[#0B1220] mb-3">{step.title}</h3>
                <p className="text-xs font-body text-[#2B2B2B]/55 leading-relaxed">{step.body}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 9. PACKAGES ── */}
      <section id="packages" className="py-20 lg:py-28 overflow-hidden" style={{ background: 'linear-gradient(135deg, #f0f4ff 0%, #eef1f7 100%)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-14">
            <span className="text-[#B8955B] text-xs tracking-[0.3em] uppercase font-body block mb-4">Packages</span>
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-[#0B1220] mb-2 leading-tight">Dissertation Editing Packages</h2>
            <p className="text-[#2B2B2B]/50 font-body text-sm">Professional dissertation editing based on document length, editing level and deadline</p>
          </motion.div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-12">
            {packages.map((pkg, i) => (
              <PackageCard key={pkg.title} pkg={pkg} i={i} />
            ))}
          </div>

          {/* ── 10. CONVERSION NUDGE ── */}
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
            className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 px-8 py-6"
            style={{ background: 'rgba(255,255,255,0.72)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.9)', boxShadow: '0 4px 20px rgba(0,0,0,0.06)', borderRadius: '12px' }}>
            <div>
              <h2 className="font-heading text-lg font-bold text-[#0B1220] mb-1">Not Sure What Dissertation Editing Service You Need?</h2>
              <p className="text-xs font-body text-[#2B2B2B]/60 leading-relaxed max-w-xl">
                Every dissertation is different. Some documents only need a final proofread, while others need deeper language editing, academic tone refinement, chapter flow improvement or referencing checks. Send us your dissertation details and Creative Books SA will guide you on the most suitable editing option.
              </p>
            </div>
            <Link to="/getquote" className="shrink-0 inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold text-white transition-all group"
              style={{ background: '#B8955B', borderRadius: '8px', boxShadow: '0 8px 20px rgba(184,149,91,0.3)' }}>
              Request a Dissertation Editing Assessment
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ── 11. WHY IT MATTERS ── */}
      <section className="py-20 lg:py-28" style={{ background: '#F8F5EF' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-12">
            <span className="text-[#B8955B] text-xs tracking-[0.3em] uppercase font-body block mb-4">Why It Matters</span>
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-[#0B1220] mb-5 leading-tight max-w-2xl">Why Professional Dissertation Editing Matters</h2>
            <p className="text-[#2B2B2B]/60 font-body text-sm leading-relaxed max-w-2xl mb-4">
              A dissertation is judged not only by the strength of the research, but also by how clearly that research is presented. Grammar errors, unclear sentences, weak paragraph flow and inconsistent academic tone can make strong research harder to understand.
            </p>
            <p className="text-[#2B2B2B]/60 font-body text-sm leading-relaxed max-w-2xl">
              Professional dissertation editing helps improve readability, clarity and presentation so that supervisors, reviewers and examiners can engage with your work more easily. It gives your dissertation a cleaner, more credible and more professional finish before submission.
            </p>
          </motion.div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {whyCards.map((card, i) => {
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

      {/* ── 12. WHO WE HELP ── */}
      <section className="py-20 lg:py-24 overflow-hidden" style={{ background: 'linear-gradient(135deg, #f0f4ff 0%, #eef1f7 100%)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-10">
            <span className="text-[#B8955B] text-xs tracking-[0.3em] uppercase font-body block mb-4">Who We Help</span>
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-[#0B1220] mb-3 leading-tight">Who Our Dissertation Editing Services Are For</h2>
            <p className="text-[#2B2B2B]/55 font-body text-sm max-w-xl leading-relaxed">
              Creative Books SA provides dissertation editing services for students, researchers and professionals across Johannesburg, Gauteng and South Africa.
            </p>
          </motion.div>
          <div className="flex flex-wrap gap-2 mb-16">
            {whoWeHelp.map((type, i) => (
              <motion.span key={type} initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: i * 0.03 }}
                className="px-4 py-2 text-xs font-body font-medium text-[#0B1220]"
                style={{ background: 'rgba(255,255,255,0.75)', backdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,0.9)', boxShadow: '0 2px 12px rgba(0,0,0,0.05)', borderRadius: '6px' }}>
                {type}
              </motion.span>
            ))}
          </div>

          {/* ── 13. DISCIPLINES ── */}
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-10">
            <span className="text-[#B8955B] text-xs tracking-[0.3em] uppercase font-body block mb-4">Academic Fields</span>
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-[#0B1220] mb-3 leading-tight">Dissertation Editing Across Multiple Academic Fields</h2>
            <p className="text-[#2B2B2B]/55 font-body text-sm max-w-xl leading-relaxed">
              Our dissertation editing support is suitable for a wide range of academic fields. We focus on language, clarity, structure, consistency and presentation, while preserving your subject knowledge and research content.
            </p>
          </motion.div>
          <div className="flex flex-wrap gap-2">
            {disciplines.map((d, i) => (
              <motion.span key={d} initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: i * 0.03 }}
                className="px-4 py-2 text-xs font-body font-medium text-[#0B1220]"
                style={{ background: 'rgba(255,255,255,0.75)', backdropFilter: 'blur(16px)', border: '1px solid rgba(184,149,91,0.15)', boxShadow: '0 2px 12px rgba(0,0,0,0.05)', borderRadius: '6px' }}>
                {d}
              </motion.span>
            ))}
          </div>
        </div>
      </section>

      {/* ── 14. SEO SECTION ── */}
      <section className="py-20" style={{ background: '#F8F5EF' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="max-w-3xl">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
              <span className="text-[#B8955B] text-xs tracking-[0.3em] uppercase font-body block mb-5">Johannesburg · South Africa</span>
              <h2 className="font-heading text-3xl md:text-4xl font-bold text-[#0B1220] mb-6 leading-tight">
                Dissertation Editing Services in Johannesburg and South Africa
              </h2>
              <p className="text-[#2B2B2B]/60 font-body text-sm leading-relaxed mb-5">
                If you are searching for dissertation editing services in Johannesburg, Creative Books SA provides professional dissertation proofreading, copy editing and language editing support for postgraduate students. Our services help improve grammar, clarity, academic tone, consistency and overall presentation before submission.
              </p>
              <p className="text-[#2B2B2B]/60 font-body text-sm leading-relaxed mb-8">
                We assist students in Johannesburg, Gauteng and across South Africa with Master's dissertations, MBA dissertations, Honours research reports, research proposals and dissertation chapters. Whether you need dissertation proofreading, dissertation copy editing, academic language editing or referencing checks, our team can help polish your document professionally.
              </p>
              <Link to="/getquote" className="inline-flex items-center gap-2 px-7 py-3.5 text-white text-sm font-semibold transition-all group"
                style={{ background: '#B8955B', borderRadius: '8px', boxShadow: '0 8px 24px rgba(184,149,91,0.3)' }}>
                Start Your Dissertation Editing Quote
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── 15. FAQ ── */}
      <section className="py-20 lg:py-28 overflow-hidden" style={{ background: 'linear-gradient(135deg, #f0f4ff 0%, #eef1f7 100%)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
            <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="lg:sticky lg:top-28">
              <span className="text-[#B8955B] text-xs tracking-[0.3em] uppercase font-body block mb-5">FAQ</span>
              <h2 className="font-heading text-3xl md:text-4xl font-bold text-[#0B1220] mb-4 leading-tight">Dissertation Editing Services FAQs</h2>
              <p className="text-[#2B2B2B]/55 font-body text-sm leading-relaxed max-w-sm">Have more questions about our dissertation editing services? Contact us for a personalised answer.</p>
              <div className="mt-6 h-px w-24" style={{ background: '#B8955B' }} />
            </motion.div>
            <div className="space-y-2">
              {faqs.map((faq, i) => (
                <motion.div key={faq.q} initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}>
                  <FAQItem faq={faq} i={i} open={openFaq} setOpen={setOpenFaq} />
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── 16. FINAL CTA ── */}
      <section className="relative py-20 overflow-hidden" style={{ background: 'linear-gradient(160deg, #090E18 0%, #0d1830 100%)' }}>
        <div className="absolute top-0 left-0 right-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(184,149,91,0.5), transparent)' }} />
        <div className="absolute bottom-0 left-0 right-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(184,149,91,0.2), transparent)' }} />
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[600px] h-[400px] pointer-events-none"
          style={{ background: 'radial-gradient(ellipse, rgba(184,149,91,0.07) 0%, transparent 65%)', filter: 'blur(60px)' }} />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <span className="text-[#B8955B] text-xs tracking-[0.3em] uppercase font-body block mb-6">Ready to Polish?</span>
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-white mb-5 leading-tight">Ready to Polish Your Dissertation?</h2>
            <p className="text-white/45 font-body text-sm leading-relaxed mb-10 max-w-lg mx-auto">
              Your dissertation deserves clear, professional and careful presentation before submission. Whether you need dissertation proofreading, copy editing, academic language editing, chapter refinement or referencing checks, Creative Books SA can help you prepare your document with confidence.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link to="/getquote" className="inline-flex items-center gap-2 px-8 py-4 text-white text-sm font-semibold transition-all group"
                style={{ background: '#B8955B', boxShadow: '0 12px 32px rgba(184,149,91,0.35)', borderRadius: '8px' }}>
                Request a Dissertation Editing Quote
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <a href="#packages" className="inline-flex items-center gap-2 px-8 py-4 text-white/70 text-sm transition-all"
                style={{ border: '1px solid rgba(255,255,255,0.12)', borderRadius: '8px', background: 'rgba(255,255,255,0.04)' }}>
                View Dissertation Editing Packages
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      <InternalLinks links={[
        { label: 'Thesis Editing Services',        path: '/thesisediting' },
        { label: 'Proofreading Services',          path: '/proofreading' },
        { label: 'Book Editing Services',          path: '/bookediting' },
        { label: 'Academic Editing Services',      path: '/academicediting' },
        { label: 'Self Publishing South Africa',   path: '/selfpublishingsouthafrica' },
        { label: 'Book Printing Johannesburg',     path: '/bookprintingjohannesburg' },
        { label: 'Request a Quote',                path: '/getquote' },
      ]} light />
    </div>
  );
}