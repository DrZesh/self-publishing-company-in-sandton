import React from 'react';
import PageMeta from '../components/shared/PageMeta';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import FAQSection from '../components/shared/FAQSection';
import CTASection from '../components/shared/CTASection';

const faqCategories = [
  {
    title: 'Publishing',
    faqs: [
      { question: 'How much does it cost to publish a book in South Africa?', answer: 'Our publishing packages range from R4,999 to R24,999+, depending on services needed. We offer Mini, Standard, and Premium packages to suit different budgets. Contact us for a free personalised quote based on your specific manuscript.' },
      { question: 'Do I keep the rights to my book?', answer: 'Yes, absolutely. At Creative Books SA, authors retain 100% of their intellectual property rights. We are a publishing service provider — we help you publish, but the book remains entirely yours.' },
      { question: 'What is the difference between self-publishing and traditional publishing?', answer: 'With self-publishing through Creative Books SA, you maintain full control over your book, rights, and royalties. Traditional publishing involves submitting to publishers who decide if they want to publish your work and typically take a percentage of royalties.' },
      { question: 'How long does the publishing process take?', answer: 'The typical timeline is 4–12 weeks from manuscript submission to final printed copies, depending on the package chosen and the state of your manuscript. Rush services are available for time-sensitive projects.' },
    ]
  },
  {
    title: 'Printing',
    faqs: [
      { question: 'What book sizes do you offer?', answer: 'We print in all standard book sizes including A5 (148×210mm), 6×9 inches, A4, and custom sizes. Both softcover (perfect bound) and hardcover (case bound) options are available.' },
      { question: 'What is the minimum order quantity?', answer: 'Our minimum print run starts at just 50 copies. We also offer print-on-demand services for single copies. For bulk orders of 500+ copies, we offer significant volume discounts.' },
      { question: 'Do you offer cream and white paper options?', answer: 'Yes, we offer both cream (80gsm and 100gsm) and white (80gsm and 100gsm) paper options. Cream paper is popular for fiction and literary works, while white paper is preferred for full-colour children\'s books and workbooks.' },
    ]
  },
  {
    title: 'Editing',
    faqs: [
      { question: 'What types of editing do you offer?', answer: 'We offer proofreading, copy editing, line editing, developmental editing, manuscript evaluation, academic editing, thesis editing, and language editing. Each service addresses different aspects of manuscript quality.' },
      { question: 'How much does book editing cost?', answer: 'Editing rates depend on the type of editing and manuscript length. Proofreading starts from R30 per page, while developmental editing starts from R50 per page. Contact us for a precise quote based on your manuscript.' },
    ]
  },
  {
    title: 'Design & eBooks',
    faqs: [
      { question: 'Can you design my book cover?', answer: 'Yes, our professional designers create custom book covers tailored to your genre and vision. We provide multiple concepts, revisions, and final print-ready and digital-ready files.' },
      { question: 'Do you publish eBooks on Amazon?', answer: 'Yes, we handle complete Amazon KDP setup including eBook formatting, cover conversion, metadata optimisation, and account setup. We also publish on other platforms including Apple Books, Kobo, and more.' },
      { question: 'What is an ISBN and do I need one?', answer: 'An ISBN (International Standard Book Number) is a unique identifier for your book. It\'s required for selling through bookstores and online retailers. We handle ISBN registration with the National Library of South Africa as part of our publishing packages.' },
    ]
  },
];

const faqPageSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: faqCategories.flatMap(cat =>
    cat.faqs.map(faq => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    }))
  ),
};

export default function FAQ() {
  return (
    <div>
      <PageMeta
        title="Self-Publishing FAQ South Africa | Creative Books SA"
        description="Answers to common questions about self-publishing in South Africa — costs, ISBNs, royalties, timelines, printing and distribution."
        canonical="https://www.creativebookssa.co.za/faq"
        schema={faqPageSchema}
      />
      {/* Hero */}
      <section className="relative pt-32 pb-16 bg-obsidian">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="text-center max-w-2xl mx-auto">
            <span className="text-copper text-sm font-body tracking-[0.25em] uppercase mb-4 block">FAQ</span>
            <h1 className="font-heading text-4xl md:text-5xl font-bold text-white mb-6">Self-Publishing Questions, Answered</h1>
            <p className="text-white/60 text-lg leading-relaxed font-body">
              Everything you need to know about publishing, printing, editing, and design services in South Africa.
            </p>
          </motion.div>
        </div>
      </section>

      {/* FAQ Categories */}
      {faqCategories.map((cat, i) => (
        <FAQSection key={cat.title} title={cat.title + ' FAQ'} faqs={cat.faqs} light={i % 2 === 0} />
      ))}

      {/* Internal Links */}
      <section className="py-16 bg-obsidian">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="font-heading text-2xl font-bold text-white mb-4">Still Have Questions?</h2>
          <p className="text-white/60 font-body mb-8">Our team is ready to help with any publishing question.</p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/contact" className="px-6 py-3 bg-copper text-white rounded-full font-medium hover:bg-copper/90 transition-colors">Contact Us</Link>
            <Link to="/getquote" className="px-6 py-3 border border-white/20 text-white rounded-full hover:border-copper hover:text-copper transition-colors">Get a Quote</Link>
          </div>
        </div>
      </section>

      <CTASection />
    </div>
  );
}