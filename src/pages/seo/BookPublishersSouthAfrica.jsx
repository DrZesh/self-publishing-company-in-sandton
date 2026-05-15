import React from 'react';
import ServicePageTemplate from '../../components/shared/ServicePageTemplate';
import PageMeta from '../../components/shared/PageMeta';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { serviceSchema, faqSchema, breadcrumbSchema } from '../../lib/seo/schemas';

const faqs = [
  { question: 'Who are the best book publishers in South Africa?', answer: 'Creative Books SA is one of South Africa\'s leading self-publishing companies, offering full-service publishing including editing, cover design, typesetting, printing, and distribution. We are based in Johannesburg and serve authors nationwide.' },
  { question: 'Do book publishers in South Africa accept new authors?', answer: 'Some traditional publishers are selective and may have submission guidelines. Self-publishing companies like Creative Books SA are more accessible — authors pay for production services and keep full control.' },
  { question: 'Do book publishers in South Africa help with editing?', answer: 'Yes. Creative Books SA provides professional proofreading, copy editing, developmental editing, and manuscript evaluation as part of our publishing packages.' },
  { question: 'How do I find a book publisher in South Africa?', answer: 'Search for publishers who offer transparent pricing, full-service support, and allow authors to retain their rights. Creative Books SA ticks all these boxes — contact us for a free consultation.' },
  { question: 'Can a self-published book look professional?', answer: 'Yes. A self-published book can look professional when it has strong editing, proper typesetting, a genre-appropriate cover and quality printing.' },
  { question: 'Do South African publishers handle ISBN registration?', answer: 'Yes. We handle ISBN registration with the National Library of South Africa on your behalf, included in all publishing packages.' },
  { question: 'Do I keep my rights when self-publishing?', answer: 'In most self-publishing service arrangements, the author keeps the rights. At Creative Books SA, you retain 100% of your intellectual property rights. Always confirm this before signing or paying with any publisher.' },
  { question: 'Can South African publishers distribute my book internationally?', answer: 'Yes. We distribute to Amazon KDP, Takealot, Apple Books, Google Play Books, and global retail platforms.' },
];

const schema = {
  '@context': 'https://schema.org',
  '@graph': [
    serviceSchema({
      name: 'Book Publishers South Africa',
      description: 'Professional book publishing services from one of South Africa\'s top publishers. Editing, design, printing and distribution with full author rights retention.',
      url: '/bookpublisherssouthafrica',
      areaServed: 'South Africa',
    }),
    faqSchema(faqs),
    breadcrumbSchema([
      { name: 'Home', path: '/' },
      { name: 'Book Publishers South Africa', path: '/bookpublisherssouthafrica' },
    ]),
  ],
};

export default function BookPublishersSouthAfrica() {
  return (
    <>
      <PageMeta
        title="Book Publishers in South Africa | Publish Your Book Professionally"
        description="Leading book publishers in South Africa. Full-service publishing for fiction, non-fiction, memoirs and children's books. Authors retain 100% rights. Free consultation."
        keywords="book publishers South Africa, book publishers in South Africa, publishing company South Africa, South African book publishers, publish a book South Africa"
        canonical="https://www.creativebookssa.co.za/bookpublisherssouthafrica"
        schema={schema}
      />
      <ServicePageTemplate
        heroImage="https://media.base44.com/images/public/69fb173eeab1ba78da6eab45/5741d046a_generated_c8e794a5.png"
        subtitle="Book Publishers South Africa"
        title="Book Publishers in South Africa"
        description="Creative Books SA is one of South Africa's most experienced book publishers, offering full-service publishing for authors nationwide. From manuscript evaluation and professional editing to cover design, typesetting, printing, and global distribution — we bring your book to life while you keep 100% of your rights."
        features={[
          { title: 'Full-Service Publishing', description: 'Editing, design, typesetting, printing, ISBN, and distribution all handled under one roof in Johannesburg.' },
          { title: '100% Author Rights', description: 'We are a service publisher — you own your book entirely, including all rights and royalties.' },
          { title: 'Expert South African Editors', description: 'Qualified editors with deep knowledge of South African language, culture, and publishing standards.' },
          { title: 'Professional Book Cover Design', description: 'Market-ready cover designs that compete on shelves and online platforms across South Africa and globally.' },
          { title: 'ISBN & Legal Registration', description: 'Full NLSA ISBN registration and legal deposit management included in all publishing packages.' },
          { title: 'SA & International Distribution', description: 'Books distributed to Takealot, Amazon, Apple Books, Google Play, and major South African retailers.' },
        ]}
        processSteps={[
          { title: 'Free Manuscript Review', description: 'Submit your manuscript and receive honest feedback, a project scope assessment, and package recommendation.' },
          { title: 'Editing & Proofreading', description: 'Professional editing to polish your manuscript to publishing standards.' },
          { title: 'Cover Design & Interior Layout', description: 'Beautiful cover art and professional interior typesetting for print and digital formats.' },
          { title: 'Print, Register & Distribute', description: 'Your book is printed, ISBN-registered, and launched across South African and international channels.' },
        ]}
        faqs={faqs}
        relatedLinks={[
          { label: 'Publishing Companies SA', path: '/publishingcompaniessouthafrica' },
          { label: 'Self Publishing SA', path: '/selfpublishingsouthafrica' },
          { label: 'Publishing Packages', path: '/publishingpackages' },
          { label: 'Book Printing JHB', path: '/bookprintingjohannesburg' },
          { label: 'Best Publishers SA', path: '/bestpublishingcompaniesinsouthafrica' },
          { label: 'Book Editing', path: '/bookediting' },
          { label: 'ISBN Registration', path: '/isbnregistration' },
          { label: 'Get a Quote', path: '/getquote' },
        ]}
        ctaTitle="Publish Your Book With South Africa's Trusted Publishers"
        ctaDescription="Get a free consultation and personalised quote from Creative Books SA — South Africa's premier book publishing company."
      >
        {/* Editorial guide content from merged page */}
        <section className="py-16 lg:py-24 bg-vellum">
          <div className="max-w-4xl mx-auto px-4 sm:px-6">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-10">
              <span className="text-copper text-xs font-body bg-copper/10 px-3 py-1 rounded-full mb-4 inline-block">Publishing Guide</span>
              <h2 className="font-heading text-3xl md:text-4xl font-bold text-[#0F0F0F] mt-4 mb-4">
                What First-Time Authors Should Know About Book Publishers in South Africa
              </h2>
            </motion.div>

            <div className="space-y-10">
              <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
                <p className="text-[#0F0F0F]/70 leading-[1.8] font-body text-lg mb-6">
                  Looking for book publishers in South Africa can feel exciting and confusing at the same time. You have written something important, and now you want the right people to help you turn it into a professional book. That is a serious step. It is also the stage where many authors discover that publishing has more moving parts than they expected.
                </p>
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
                <h3 className="font-heading text-2xl font-bold text-[#0F0F0F] mb-4">The different types of book publishers</h3>
                <p className="text-[#0F0F0F]/70 leading-[1.8] font-body mb-4">
                  Traditional book publishers usually select manuscripts, invest in production and pay authors royalties from sales. Because they carry the financial risk, they are selective. They may focus on specific genres, commercial potential or educational markets. A self-publishing service provider works differently. The author pays for production services and usually keeps more control over the book.
                </p>
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
                <h3 className="font-heading text-2xl font-bold text-[#0F0F0F] mb-4">What a professional publishing process should include</h3>
                <p className="text-[#0F0F0F]/70 leading-[1.8] font-body mb-4">
                  A professional process normally begins with manuscript assessment or editing. After that comes layout and typesetting, cover design, ISBN placement, print-ready PDF preparation, proof checking and printing. If the author also wants an eBook, the book must be converted into a suitable digital format.
                </p>
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
                <h3 className="font-heading text-2xl font-bold text-[#0F0F0F] mb-4">Bookstore expectations</h3>
                <p className="text-[#0F0F0F]/70 leading-[1.8] font-body mb-4">
                  Many new authors believe that a publisher automatically gets the book into every major bookstore. In reality, bookstore distribution is competitive and not guaranteed. Shops consider demand, genre, pricing, discount structures, returns and whether the book already has an audience.
                </p>
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
                <h3 className="font-heading text-2xl font-bold text-[#0F0F0F] mb-4">The honest truth about royalties</h3>
                <p className="text-[#0F0F0F]/70 leading-[1.8] font-body mb-4">
                  Many authors hear the word royalties and imagine automatic monthly income. In reality, royalties depend on sales, platform fees, print costs, distribution terms and pricing. In a self-publishing service model, it may be better for the author to pay for production services upfront and keep control of future earnings.
                </p>
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                className="mt-8 p-8 rounded-2xl bg-gradient-to-br from-copper/10 to-copper/5 border border-copper/20">
                <h3 className="font-heading text-2xl font-bold text-[#0F0F0F] mb-4">Comparing book publishers in South Africa?</h3>
                <p className="text-[#0F0F0F]/70 font-body mb-6">
                  Creative Books SA provides transparent publishing services with clear quotes. Understand the full production process before you commit.
                </p>
                <Link to="/getquote" className="inline-flex items-center gap-2 px-6 py-3 bg-copper text-white rounded-full font-medium hover:bg-copper/90 transition-all">
                  Request a Quote <ArrowRight className="w-4 h-4" />
                </Link>
              </motion.div>
            </div>
          </div>
        </section>
      </ServicePageTemplate>
    </>
  );
}