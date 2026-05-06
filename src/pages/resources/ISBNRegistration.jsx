import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, CheckCircle, ChevronDown, ChevronUp, BookOpen, Hash, Smartphone, FileText, MapPin, User, ArrowRight, Copy, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import CTASection from '../../components/shared/CTASection';
import InternalLinks from '../../components/shared/InternalLinks';
import PageMeta from '../../components/shared/PageMeta';

const steps = [
  {
    number: '01',
    icon: FileText,
    title: 'Gather Your Information',
    description: 'Before emailing the NLSA, collect all required details about your book and yourself.',
    details: [
      { icon: BookOpen, label: 'Book Title', note: 'The full, final title of your book' },
      { icon: User, label: 'Publisher / Author Name(s)', note: 'Your full name or publishing company name' },
      { icon: Smartphone, label: 'Cell Number & Email Address', note: 'Contact details for correspondence' },
      { icon: MapPin, label: 'Physical Address', note: 'Your registered physical address' },
      { icon: Hash, label: 'Format(s) Required', note: 'Specify: eBook, Hardcover, Softcover, or all three' },
    ],
  },
  {
    number: '02',
    icon: Mail,
    title: 'Send the Email',
    description: 'Email your request to the National Library of South Africa with all the details above.',
    email: 'Kholofelo.mojela@nlsa.ac.za',
    emailSubject: 'ISBN Application – [Your Book Title]',
    emailBody: `Dear Kholofelo,\n\nI would like to apply for an ISBN for my book.\n\nBook Title: [Your Title]\nAuthor / Publisher Name: [Your Name]\nCell Number: [Your Number]\nEmail Address: [Your Email]\nPhysical Address: [Your Address]\nFormat(s) Required: [eBook / Softcover / Hardcover]\n\nThank you,\n[Your Name]`,
  },
  {
    number: '03',
    icon: CheckCircle,
    title: 'Await Your ISBN',
    description: 'The NLSA typically responds within 3–5 working days with your ISBN and a form to complete for each number.',
    tips: [
      'Each format (eBook, Softcover, Hardcover) requires its own separate ISBN.',
      'You will need to fill in a form for each ISBN number you are assigned.',
      'Keep your ISBN(s) safe — they are unique identifiers permanently linked to your book edition.',
      'Creative Books SA can handle this entire process on your behalf.',
    ],
  },
];

const faqs = [
  { q: 'Is an ISBN free in South Africa?', a: 'Yes. The National Library of South Africa issues ISBNs free of charge to South African publishers and self-publishing authors.' },
  { q: 'How long does it take to get an ISBN in South Africa?', a: 'The NLSA typically responds within 3–5 working days of receiving your email application.' },
  { q: 'Do I need a separate ISBN for my eBook and printed book?', a: 'Yes. Each format — softcover, hardcover, and eBook — requires its own unique ISBN number.' },
  { q: 'Can Creative Books SA register my ISBN for me?', a: 'Yes. All our publishing packages include ISBN registration as a standard service. We handle the full NLSA application on your behalf.' },
  { q: 'What is the NLSA?', a: 'The National Library of South Africa (NLSA) is the official legal deposit library and ISBN issuing authority for South Africa.' },
];

function CopyButton({ text, label }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button
      onClick={handleCopy}
      className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full bg-copper/10 text-copper hover:bg-copper/20 transition-all font-body"
    >
      {copied ? <CheckCircle className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
      {copied ? 'Copied!' : label}
    </button>
  );
}

function FAQItem({ q, a, index }) {
  const [open, setOpen] = useState(false);
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.07 }}
      className="border border-[#0F0F0F]/10 rounded-2xl overflow-hidden"
    >
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between gap-4 px-6 py-5 text-left bg-white hover:bg-vellum transition-colors"
      >
        <span className="font-heading text-[#0F0F0F] font-semibold text-base">{q}</span>
        {open ? <ChevronUp className="w-4 h-4 text-copper shrink-0" /> : <ChevronDown className="w-4 h-4 text-copper shrink-0" />}
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <p className="px-6 py-5 text-[#0F0F0F]/70 font-body text-sm leading-relaxed bg-white border-t border-[#0F0F0F]/5">{a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function ISBNRegistration() {
  const emailBody = steps[1].emailBody;
  const emailAddress = steps[1].email;

  return (
    <>
      <PageMeta
        title="How to Get an ISBN in South Africa | ISBN Registration | Creative Books SA"
        description="Step-by-step guide to getting an ISBN number in South Africa from the National Library of South Africa (NLSA). Free ISBN registration for South African authors."
        keywords="ISBN South Africa, how to get ISBN number South Africa, NLSA ISBN registration, ISBN registration South Africa"
      />

      {/* Hero */}
      <section className="relative pt-32 pb-20 bg-obsidian overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 20% 80%, #B87333 0%, transparent 50%)' }} />
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
            <span className="inline-flex items-center gap-2 text-copper text-sm font-body tracking-[0.25em] uppercase mb-6">
              <Hash className="w-4 h-4" /> ISBN South Africa
            </span>
            <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
              How to Get an ISBN<br />
              <span className="text-gradient-copper">in South Africa</span>
            </h1>
            <p className="text-white/60 text-lg leading-relaxed font-body max-w-2xl mx-auto mb-10">
              ISBNs in South Africa are issued free of charge by the National Library of South Africa (NLSA). Follow these three simple steps to get yours.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <a
                href={`mailto:${emailAddress}?subject=ISBN%20Application&body=${encodeURIComponent(emailBody)}`}
                className="group inline-flex items-center gap-2 px-7 py-3.5 bg-copper text-white font-medium rounded-full hover:bg-copper/90 transition-all shadow-lg shadow-copper/20"
              >
                Apply via Email <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </a>
              <Link to="/getquote"
                className="inline-flex items-center gap-2 px-7 py-3.5 border border-white/20 text-white rounded-full hover:border-copper hover:text-copper transition-all">
                Let Us Handle It
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 3-Step Process */}
      <section className="py-20 lg:py-28 bg-vellum">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="space-y-8">
            {steps.map((step, i) => {
              const Icon = step.icon;
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.15 }}
                  className="bg-white rounded-3xl p-8 md:p-10 border border-[#0F0F0F]/5 shadow-sm"
                >
                  <div className="flex items-start gap-6">
                    <div className="shrink-0 w-14 h-14 rounded-2xl bg-obsidian flex flex-col items-center justify-center">
                      <span className="text-copper font-heading font-bold text-xs leading-none">{step.number}</span>
                      <Icon className="w-4 h-4 text-white mt-1" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h2 className="font-heading text-xl md:text-2xl font-bold text-[#0F0F0F] mb-2">{step.title}</h2>
                      <p className="text-[#0F0F0F]/60 font-body mb-6 leading-relaxed">{step.description}</p>

                      {/* Step 1: info fields */}
                      {step.details && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {step.details.map((item, j) => {
                            const ItemIcon = item.icon;
                            return (
                              <div key={j} className="flex items-start gap-3 bg-vellum rounded-xl p-4">
                                <div className="w-8 h-8 rounded-lg bg-copper/10 flex items-center justify-center shrink-0 mt-0.5">
                                  <ItemIcon className="w-4 h-4 text-copper" />
                                </div>
                                <div>
                                  <p className="font-heading text-sm font-semibold text-[#0F0F0F]">{item.label}</p>
                                  <p className="text-xs text-[#0F0F0F]/50 font-body mt-0.5">{item.note}</p>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}

                      {/* Step 2: email block */}
                      {step.email && (
                        <div className="space-y-4">
                          <div className="bg-obsidian rounded-2xl p-5">
                            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                              <div>
                                <p className="text-white/40 text-xs font-body uppercase tracking-wider mb-1">Send to</p>
                                <p className="text-copper font-body font-medium text-sm">{step.email}</p>
                              </div>
                              <div className="flex gap-2 flex-wrap">
                                <CopyButton text={step.email} label="Copy Email" />
                                <a
                                  href={`mailto:${step.email}?subject=${encodeURIComponent(step.emailSubject)}&body=${encodeURIComponent(step.emailBody)}`}
                                  className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full bg-copper text-white hover:bg-copper/90 transition-all font-body"
                                >
                                  <ExternalLink className="w-3 h-3" /> Open in Mail App
                                </a>
                              </div>
                            </div>
                            <div className="border-t border-white/10 pt-4">
                              <p className="text-white/40 text-xs font-body uppercase tracking-wider mb-2">Email Template</p>
                              <pre className="text-white/70 text-xs font-body leading-relaxed whitespace-pre-wrap break-words">{step.emailBody}</pre>
                            </div>
                          </div>
                          <CopyButton text={step.emailBody} label="Copy Full Email Template" />
                        </div>
                      )}

                      {/* Step 3: tips */}
                      {step.tips && (
                        <div className="space-y-3">
                          {step.tips.map((tip, j) => (
                            <div key={j} className="flex items-start gap-3">
                              <CheckCircle className="w-4 h-4 text-copper shrink-0 mt-0.5" />
                              <p className="text-sm text-[#0F0F0F]/70 font-body leading-relaxed">{tip}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Important note */}
      <section className="py-12 bg-obsidian">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="rounded-3xl border border-copper/20 bg-copper/5 p-8 text-center"
          >
            <Hash className="w-8 h-8 text-copper mx-auto mb-4" />
            <h3 className="font-heading text-xl font-bold text-white mb-3">Don't Want to Do This Yourself?</h3>
            <p className="text-white/60 font-body mb-6 max-w-xl mx-auto text-sm leading-relaxed">
              All Creative Books SA publishing packages include ISBN registration as a standard service. We handle the full NLSA application, form completion, and ISBN management on your behalf.
            </p>
            <Link to="/publishingpackages"
              className="group inline-flex items-center gap-2 px-6 py-3 bg-copper text-white rounded-full hover:bg-copper/90 transition-all text-sm font-medium">
              View Publishing Packages <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 bg-vellum">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
            <span className="text-copper text-sm font-body tracking-[0.25em] uppercase mb-4 block">Common Questions</span>
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-[#0F0F0F]">ISBN FAQs</h2>
          </motion.div>
          <div className="space-y-3">
            {faqs.map((faq, i) => <FAQItem key={i} q={faq.q} a={faq.a} index={i} />)}
          </div>
        </div>
      </section>

      <InternalLinks
        title="Related Services & Resources"
        links={[
          { label: 'Book Publishing', path: '/bookpublishing' },
          { label: 'Publishing Packages', path: '/publishingpackages' },
          { label: 'How to Publish a Book', path: '/howtopublishabook' },
          { label: 'Book Printing', path: '/bookprinting' },
          { label: 'Book Editing', path: '/bookediting' },
          { label: 'Self Publishing SA', path: '/selfpublishingsouthafrica' },
          { label: 'Blog', path: '/blog' },
          { label: 'Get a Quote', path: '/getquote' },
        ]}
        light
      />
      <CTASection
        title="Ready to Publish Your Book?"
        description="Get ISBN registration included as standard with all our publishing packages. Let us handle the paperwork while you focus on your writing."
      />
    </>
  );
}