import React from 'react';
import ServicePageTemplate from '../../components/shared/ServicePageTemplate';
import PageMeta from '../../components/shared/PageMeta';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { serviceSchema, faqSchema, breadcrumbSchema } from '../../lib/seo/schemas';

const faqs = [
  { question: 'What services do publishing companies in South Africa offer?', answer: 'Most publishing companies in South Africa offer editing, cover design, typesetting, ISBN registration, printing, and distribution. Creative Books SA offers all these services under one roof with transparent pricing.' },
  { question: 'What publishing companies actually do', answer: 'A publishing company helps move a book from manuscript to finished product. In a traditional model, the publisher may acquire rights, edit the book, design it, print it and distribute it. In a self-publishing support model, the author pays for specific services and keeps more control over the book, the files and the selling process.' },
  { question: 'How much does it cost to publish a book in South Africa?', answer: 'Publishing costs range from R4,999 for a Mini Package to R24,999+ for a Premium Package including developmental editing, premium cover design, hardcover printing, Amazon KDP setup and an author website.' },
  { question: 'Do I keep the rights to my book?', answer: 'Yes. At Creative Books SA, you retain 100% of your intellectual property rights and royalties. We are a service-based publishing company, not a traditional publisher.' },
  { question: 'Can I publish without a traditional publisher?', answer: 'Yes. Self-publishing allows authors to produce and sell their books independently, provided the manuscript is properly edited, designed and printed.' },
  { question: 'Should I pay a company to publish my book?', answer: 'You can pay for professional publishing services such as editing, cover design, layout and printing. The key is to understand exactly what you are buying and whether you keep control of your rights and files.' },
  { question: 'Do you help first-time authors in South Africa?', answer: 'Absolutely. Most of our clients are first-time authors. We guide you through every step from manuscript to printed book and distribution.' },
  { question: 'How long does publishing take in South Africa?', answer: 'Depending on the package, the full publishing process takes 4–12 weeks from manuscript submission to printed books.' },
];

const schema = {
  '@context': 'https://schema.org',
  '@graph': [
    serviceSchema({
      name: 'Book Publishing South Africa',
      description: 'Professional book publishing services in South Africa including editing, cover design, typesetting, ISBN registration, printing and distribution.',
      url: '/publishingcompaniessouthafrica',
      areaServed: 'South Africa',
    }),
    faqSchema(faqs),
    breadcrumbSchema([
      { name: 'Home', path: '/' },
      { name: 'Publishing Companies South Africa', path: '/publishingcompaniessouthafrica' },
    ]),
  ],
};

export default function PublishingCompaniesSouthAfrica() {
  return (
    <>
      <PageMeta
        title="Publishing Companies in South Africa | Creative Books SA"
        description="Compare book publishing companies in South Africa — what each offers, how packages are structured, and what to ask before signing with a publisher."
        keywords="publishing companies in South Africa, book publishers South Africa, self publishing South Africa, best publishing company South Africa, book publishing services"
        canonical="https://www.creativebooks.co.za/publishingcompaniessouthafrica"
        schema={schema}
      />
      <ServicePageTemplate
        heroImage="https://media.base44.com/images/public/69fb173eeab1ba78da6eab45/5741d046a_generated_c8e794a5.png"
        subtitle="Publishing Companies South Africa"
        title="Publishing Companies in South Africa"
        description="Creative Books SA is one of South Africa's most trusted publishing companies. We help authors across South Africa publish, print, edit, and design books professionally — with full rights retention, transparent pricing, and expert support from Johannesburg."
        features={[
          { title: 'Full-Service Book Publishing', description: 'From manuscript to printed book — editing, design, typesetting, ISBN registration, printing and distribution in one place.' },
          { title: '100% Author Rights Retained', description: 'You keep 100% of your intellectual property rights and royalties. We are a service provider, not a rights holder.' },
          { title: 'Professional Book Editing', description: 'Expert proofreading, copy editing, developmental editing and manuscript evaluation by qualified South African editors.' },
          { title: 'Cover Design & Typesetting', description: 'Award-winning cover designs and interior layout that give your book a professional, market-ready look.' },
          { title: 'ISBN Registration Included', description: 'We handle ISBN registration with the National Library of South Africa on your behalf, included in all packages.' },
          { title: 'Local & International Distribution', description: 'Get your book onto Takealot, Amazon, local bookstores, and global online retailers.' },
        ]}
        processSteps={[
          { title: 'Free Consultation', description: 'Share your manuscript and goals. We assess your project and recommend the best publishing approach.' },
          { title: 'Choose Your Package', description: 'Select from Mini, Standard, or Premium publishing packages based on your needs and budget.' },
          { title: 'Professional Production', description: 'Our team handles editing, design, typesetting, and printing with regular milestone updates.' },
          { title: 'Publish & Distribute', description: 'Your book is printed, ISBN-registered, and made available through South African and international channels.' },
        ]}
        faqs={faqs}
        relatedLinks={[
          { label: 'Book Publishers South Africa', path: '/bookpublisherssouthafrica' },
          { label: 'Book Publishing', path: '/bookpublishing' },
          { label: 'Self Publishing SA', path: '/selfpublishingsouthafrica' },
          { label: 'Publishing Packages', path: '/publishingpackages' },
          { label: 'Book Printing JHB', path: '/bookprintingjohannesburg' },
          { label: 'Book Editing', path: '/bookediting' },
          { label: 'Book Cover Design', path: '/bookcoverdesign' },
          { label: 'ISBN Registration', path: '/isbnregistration' },
          { label: 'Best Publishers SA', path: '/bestpublishingcompaniesinsouthafrica' },
          { label: 'Self Publishing Packages', path: '/selfpublishingpackagesinsouthafrica' },
          { label: 'Get a Quote', path: '/getquote' },
        ]}
        ctaTitle="Work With a Trusted South African Publishing Company"
        ctaDescription="Get a free consultation and personalised publishing quote from Creative Books SA today."
      >
        {/* Editorial guide content from merged page */}
        <section className="py-16 lg:py-24 bg-vellum">
          <div className="max-w-4xl mx-auto px-4 sm:px-6">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-10">
              <span className="text-copper text-xs font-body bg-copper/10 px-3 py-1 rounded-full mb-4 inline-block">Publishing Guide</span>
              <h2 className="font-heading text-3xl md:text-4xl font-bold text-[#0F0F0F] mt-4 mb-4">
                How to Choose the Right Publishing Company in South Africa
              </h2>
            </motion.div>

            <div className="space-y-10">
              <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
                <p className="text-[#0F0F0F]/70 leading-[1.8] font-body text-lg">
                  Searching for publishing companies in South Africa usually means one thing: your book idea is no longer just sitting quietly in your laptop. It is starting to make noise. Maybe the manuscript is finished, maybe it is halfway there. Either way, you are at the point where you need professional guidance.
                </p>
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
                <h3 className="font-heading text-2xl font-bold text-[#0F0F0F] mb-4">Traditional publishing vs assisted self-publishing</h3>
                <p className="text-[#0F0F0F]/70 leading-[1.8] font-body mb-4">
                  Traditional publishing can be valuable, but it is selective and slow. A manuscript may be rejected for reasons that have nothing to do with quality. Assisted self-publishing is different — it gives authors a practical route to produce a professional book without waiting years for approval.
                </p>
                <p className="text-[#0F0F0F]/70 leading-[1.8] font-body">
                  For many South African authors, assisted self-publishing is more realistic. A pastor with a devotional book, a business coach with a leadership guide, a poet with a finished collection or a parent with a children's story may need production support more than a gatekeeper.
                </p>
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
                <h3 className="font-heading text-2xl font-bold text-[#0F0F0F] mb-4">How to compare publishing quotes</h3>
                <p className="text-[#0F0F0F]/70 leading-[1.8] font-body mb-4">
                  When comparing publishing companies, do not only look at the total price. Look at what the price includes. A cheaper quote may exclude editing, printed copies, cover revisions, eBook conversion or consultation.
                </p>
                <p className="text-[#0F0F0F]/70 leading-[1.8] font-body">
                  A strong quote should tell you the book size, number of pages allowed, number of printed copies, type of paper, whether the cover is front only or full cover, whether editing is included, how many revision rounds apply and what final files you receive.
                </p>
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
                <h3 className="font-heading text-2xl font-bold text-[#0F0F0F] mb-4">What authors should own</h3>
                <p className="text-[#0F0F0F]/70 leading-[1.8] font-body mb-4">
                  Authors should understand who owns the manuscript, the ISBN account, the final print-ready files and the online publishing account. A good publishing arrangement should not leave the author locked out of their own book.
                </p>
                <p className="text-[#0F0F0F]/70 leading-[1.8] font-body">
                  At minimum, authors should keep copies of the print-ready interior PDF, the full print cover PDF, the high-resolution front cover image and the eBook file if one was created.
                </p>
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
                <h3 className="font-heading text-2xl font-bold text-[#0F0F0F] mb-4">Signs of a trustworthy publishing company</h3>
                <p className="text-[#0F0F0F]/70 leading-[1.8] font-body mb-4">
                  A trustworthy publishing company should be easy to understand before it is easy to pay. The website should explain services clearly, show what authors can expect and make it possible to ask questions without pressure.
                </p>
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
                <h3 className="font-heading text-2xl font-bold text-[#0F0F0F] mb-4">Red flags authors should avoid</h3>
                <p className="text-[#0F0F0F]/70 leading-[1.8] font-body">
                  Authors should be careful with any company that promises guaranteed bestseller status, instant bookstore placement or effortless riches from a first book. Publishing can create opportunity, but the author still needs a clear audience, a polished product and a selling plan.
                </p>
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                className="p-8 rounded-2xl bg-gradient-to-br from-copper/10 to-copper/5 border border-copper/20">
                <h3 className="font-heading text-2xl font-bold text-[#0F0F0F] mb-4">Ready to choose the right publishing partner?</h3>
                <p className="text-[#0F0F0F]/70 font-body mb-6">
                  Creative Books SA offers transparent publishing packages with editing, design, layout and printing. Get a clear quote that matches your book's needs.
                </p>
                <Link to="/getquote" className="inline-flex items-center gap-2 px-6 py-3 bg-copper text-white rounded-full font-medium hover:bg-copper/90 transition-all">
                  Request a Publishing Quote <ArrowRight className="w-4 h-4" />
                </Link>
              </motion.div>
            </div>
          </div>
        </section>
      </ServicePageTemplate>
    </>
  );
}