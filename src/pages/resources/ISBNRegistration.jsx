import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, ChevronDown, ChevronUp, BookOpen, Hash, Smartphone, FileText, MapPin, User, ArrowRight, ExternalLink, Globe, IdCard, Mail, Calendar, Store, Send } from 'lucide-react';
import { Link } from 'react-router-dom';
import CTASection from '../../components/shared/CTASection';
import InternalLinks from '../../components/shared/InternalLinks';
import PageMeta from '../../components/shared/PageMeta';
import PageHero from '../../components/shared/PageHero';

const NLSA_URL = 'https://isbn.nlsa.ac.za/isbn_request.php';

const steps = [
  {
    number: '01',
    icon: FileText,
    title: 'Step 1: Gather the Information You Need for Your ISBN Application',
    description: 'Have these details ready before you open the NLSA Self-publisher ISBN Request Form so you can finish it in one go:',
    details: [
      { icon: Globe, label: 'Country', note: "Where you're based" },
      { icon: IdCard, label: 'ID Number', note: 'Your 13-digit South African ID (SA residents only)' },
      { icon: IdCard, label: 'Passport Number', note: 'Only if you live outside South Africa' },
      { icon: BookOpen, label: 'Title of the Book', note: 'The full, final title of your book' },
      { icon: User, label: 'Author Full Name', note: 'Exactly as it will appear on the cover' },
      { icon: MapPin, label: 'Address', note: 'Street, suburb, city and postal code' },
      { icon: Smartphone, label: 'Author Contact', note: 'Your cell number, e.g. 0821234567' },
      { icon: Mail, label: 'Author Email', note: 'The NLSA sends your ISBN here, so check it carefully' },
      { icon: Hash, label: 'Format', note: 'eBook, softcover or hardcover (one format per application)' },
      { icon: Calendar, label: 'Estimated Publication Date', note: 'e.g. 2026-08-12' },
      { icon: Store, label: 'External Platforms', note: 'Where your book will be sold, e.g. Amazon, Takealot or your own website' },
    ],
  },
  {
    number: '02',
    icon: Send,
    title: 'Step 2: Apply for Your ISBN on the NLSA Website',
    description: 'Go to the official NLSA Self-publisher ISBN Request Form, fill in every required field (marked *) and click Submit Request.',
    apply: true,
  },
  {
    number: '03',
    icon: CheckCircle,
    title: 'Step 3: Receive Your ISBN and Add It to Your Book',
    description: 'After you submit your application, the NLSA reviews it and emails your ISBN to the address you gave. Once you have it:',
    tips: [
      'Match each ISBN to the right format. Your eBook, softcover and hardcover each have their own number.',
      'Add your ISBN to the copyright page and to the barcode on the back cover of print editions.',
      'Keep a record of your ISBN(s). Each one is permanently linked to that edition of your book.',
    ],
  },
];

const faqs = [
  { q: 'Who issues ISBNs in South Africa?', a: 'The National Library of South Africa (NLSA) is the official ISBN agency for South Africa.' },
  { q: 'Can I still apply for an ISBN by email?', a: 'No. ISBN applications are now submitted through the online form at isbn.nlsa.ac.za.' },
  { q: 'Do I need a separate ISBN for my eBook and paperback?', a: 'Yes. Each format (eBook, softcover, hardcover) needs its own ISBN and its own application.' },
  { q: "Can I apply if I don't live in South Africa?", a: 'Yes. The form accepts a passport number for applicants outside South Africa.' },
  { q: 'What do I do after I get my ISBN?', a: 'Print it on your copyright page and in the barcode on the back cover. Use the matching ISBN when you list the book on retailers like Amazon.' },
];

const faqSchema = {
  '@type': 'FAQPage',
  mainEntity: faqs.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
};

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
        <h3 className="font-heading text-[#0F0F0F] font-semibold text-base">{q}</h3>
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
  return (
    <>
      <PageMeta
        title="How to Get an ISBN in South Africa (NLSA Guide 2026)"
        canonical="https://creativebooks.co.za/how-to-get-an-isbn-in-south-africa"
        description="Apply for your ISBN online with the National Library of South Africa. See what the NLSA form asks for, how formats work and what happens next."
        keywords="how to get an ISBN in South Africa, NLSA ISBN application, self-publisher ISBN, ISBN South Africa"
        schema={faqSchema}
      />

      <PageHero
        icon={Hash}
        subtitle="ISBN South Africa"
        title="How to Get an ISBN in South Africa: A Step-by-Step Guide for Self-Publishers"
        titleHighlight=""
        description="An ISBN (International Standard Book Number) is the unique number that identifies your book in bookstores, libraries and online retailers such as Amazon. In South Africa, the National Library of South Africa (NLSA) issues ISBNs, and the application process is now handled online through the NLSA website instead of by email."
        primaryLabel="Let Us Handle It"
        primaryLink="/getquote"
        secondaryLabel="Publishing Packages"
        secondaryLink="/publishingpackages/a5"
      />

      <section className="py-20 lg:py-28 bg-vellum">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <p className="text-center text-[#0F0F0F]/70 font-body mb-12 max-w-2xl mx-auto leading-relaxed">
            This guide explains how to apply for an ISBN in South Africa, what the NLSA ISBN request form asks for, and what happens after you submit.
          </p>
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

                      {step.apply && (
                        <div className="space-y-5">
                          <a
                            href={NLSA_URL}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 px-6 py-3 bg-copper text-white rounded-full hover:bg-copper/90 transition-all text-sm font-medium"
                          >
                            Apply for your ISBN on the NLSA website <ExternalLink className="w-4 h-4" />
                          </a>
                          <div className="bg-obsidian rounded-2xl p-6">
                            <h3 className="font-heading text-lg font-bold text-white mb-2">One ISBN per format: important for self-publishers</h3>
                            <p className="text-white/70 font-body text-sm leading-relaxed">
                              The NLSA issues one ISBN per format per application. If your book will be published as an eBook, a softcover and a hardcover, you need to submit three separate applications, one for each format.
                            </p>
                          </div>
                          <p className="text-sm text-[#0F0F0F]/60 font-body italic">
                            Publishing through a registered company? Use the Commercial Publisher ISBN form on the NLSA website instead.
                          </p>
                        </div>
                      )}

                      {step.tips && (
                        <div className="space-y-3">
                          {step.tips.map((tip, j) => (
                            <div key={j} className="flex items-start gap-3">
                              <CheckCircle className="w-4 h-4 text-copper shrink-0 mt-0.5" />
                              <p className="text-sm text-[#0F0F0F]/70 font-body leading-relaxed">{tip}</p>
                            </div>
                          ))}
                          <div className="mt-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-vellum rounded-2xl p-5 border border-copper/20">
                            <div>
                              <h3 className="font-heading text-base font-bold text-[#0F0F0F]">Need a barcode for your back cover?</h3>
                              <p className="text-sm text-[#0F0F0F]/60 font-body mt-1">Once you have your ISBN, use our free ISBN Barcode Generator to create a print-ready barcode in seconds.</p>
                            </div>
                            <Link to="/barcode-generator" className="group shrink-0 inline-flex items-center gap-2 px-5 py-2.5 bg-copper text-white rounded-full hover:bg-copper/90 transition-all text-sm font-medium">
                              Free Barcode Generator <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </Link>
                          </div>
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

      <section className="py-20 bg-vellum border-t border-[#0F0F0F]/5">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
            <span className="text-copper text-sm font-body tracking-[0.25em] uppercase mb-4 block">Common Questions</span>
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-[#0F0F0F]">Frequently Asked Questions About ISBNs in South Africa</h2>
          </motion.div>
          <div className="space-y-3">
            {faqs.map((faq, i) => <FAQItem key={i} q={faq.q} a={faq.a} index={i} />)}
          </div>
        </div>
      </section>

      <section className="py-12 bg-obsidian">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="rounded-3xl border border-copper/20 bg-copper/5 p-8 text-center">
            <Hash className="w-8 h-8 text-copper mx-auto mb-4" />
            <h2 className="font-heading text-xl font-bold text-white mb-3">Need help publishing your book?</h2>
            <p className="text-white/60 font-body mb-6 max-w-xl mx-auto text-sm leading-relaxed">
              We handle ISBN registration, <Link to="/typesetting" className="text-copper hover:underline">typesetting</Link> and <Link to="/book-cover-design" className="text-copper hover:underline">cover design</Link> for South African authors.
            </p>
            <Link to="/getquote" className="group inline-flex items-center gap-2 px-6 py-3 bg-copper text-white rounded-full hover:bg-copper/90 transition-all text-sm font-medium">
              Get a Quote <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </section>

      <InternalLinks
        title="Related Services & Resources"
        links={[
          { label: 'Book Publishing', path: '/book-publishing' },
          { label: 'Publishing Packages', path: '/publishingpackages/a5' },
          { label: 'ISBN Barcode Generator', path: '/barcode-generator' },
          { label: 'Book Cover Design', path: '/book-cover-design' },
          { label: 'Typesetting', path: '/typesetting' },
          { label: 'Self Publishing SA', path: '/self-publishing-south-africa' },
          { label: 'Blog', path: '/blog' },
          { label: 'Get a Quote', path: '/getquote' },
        ]}
        light
      />
      <CTASection
        title="Ready to Publish Your Book?"
        description="Let us handle the ISBN paperwork, typesetting and cover design while you focus on your writing."
      />
    </>
  );
}
