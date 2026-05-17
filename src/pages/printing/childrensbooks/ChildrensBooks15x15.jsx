import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import PageMeta from '../../../components/shared/PageMeta';
import CTASection from '../../../components/shared/CTASection';
import InternalLinks from '../../../components/shared/InternalLinks';

const packages = [
  {
    name: 'Starter',
    pageCount: '10-20 pages',
    pricePerBook: 40,
    minCopies: 100,
    minOrderTotal: 4000,
    features: ['10 to 20 pages', 'Full colour', 'Gloss cover', 'Saddle stitch'],
    bestFor: 'Simple board books, very short picture books, board-style early readers',
    orderLink: 'mailto:info@creativebookssa.co.za?subject=Order%3A%2015x15%20Children%27s%20Book%20Printing%20-%20Starter%20%2810-20%20pages%29&body=Hi%20Creative%20Books%20SA%2C%0A%0AI%27d%20like%20to%20order%20the%20following%20children%27s%20book%20printing%20package%3A%0A%0APACKAGE%3A%2015%20x%2015%20cm%20Starter%0APAGES%3A%2010%20to%2020%0APRICE%20PER%20BOOK%3A%20R40%0AMINIMUM%20COPIES%3A%20100%0AMINIMUM%20ORDER%20TOTAL%3A%20R4%2C000%0AINCLUDES%3A%20Full%20colour%2C%20gloss%20cover%2C%20saddle%20stitch%0A%0A---%0AMY%20DETAILS%3A%0AName%3A%20%0APhone%3A%20%0ABook%20title%3A%20%0AExact%20page%20count%3A%20%0ANumber%20of%20copies%3A%20%0AIs%20your%20book%20typeset%20and%20print-ready%3F%20%0AAny%20notes%3A%20%0A%0AThank%20you%2C'
  },
  {
    name: 'Standard',
    pageCount: '21-35 pages',
    pricePerBook: 60,
    minCopies: 100,
    minOrderTotal: 6000,
    features: ['21 to 35 pages', 'Full colour', 'Gloss cover', 'Saddle stitch'],
    bestFor: 'Standard picture books, short story books for ages 3-7',
    orderLink: 'mailto:info@creativebookssa.co.za?subject=Order%3A%2015x15%20Children%27s%20Book%20Printing%20-%20Standard%20%2821-35%20pages%29&body=Hi%20Creative%20Books%20SA%2C%0A%0AI%27d%20like%20to%20order%20the%20following%20children%27s%20book%20printing%20package%3A%0A%0APACKAGE%3A%2015%20x%2015%20cm%20Standard%0APAGES%3A%2021%20to%2035%0APRICE%20PER%20BOOK%3A%20R60%0AMINIMUM%20COPIES%3A%20100%0AMINIMUM%20ORDER%20TOTAL%3A%20R6%2C000%0AINCLUDES%3A%20Full%20colour%2C%20gloss%20cover%2C%20saddle%20stitch%0A%0A---%0AMY%20DETAILS%3A%0AName%3A%20%0APhone%3A%20%0ABook%20title%3A%20%0AExact%20page%20count%3A%20%0ANumber%20of%20copies%3A%20%0AIs%20your%20book%20typeset%20and%20print-ready%3F%20%0AAny%20notes%3A%20%0A%0AThank%20you%2C'
  },
  {
    name: 'Extended',
    pageCount: '36-60 pages',
    pricePerBook: 78,
    minCopies: 100,
    minOrderTotal: 7800,
    features: ['36 to 60 pages', 'Full colour', 'Gloss cover', 'Saddle stitch'],
    bestFor: 'Longer picture books, early chapter books, educational content',
    orderLink: 'mailto:info@creativebookssa.co.za?subject=Order%3A%2015x15%20Children%27s%20Book%20Printing%20-%20Extended%20%2836-60%20pages%29&body=Hi%20Creative%20Books%20SA%2C%0A%0AI%27d%20like%20to%20order%20the%20following%20children%27s%20book%20printing%20package%3A%0A%0APACKAGE%3A%2015%20x%2015%20cm%20Extended%0APAGES%3A%2036%20to%2060%0APRICE%20PER%20BOOK%3A%20R78%0AMINIMUM%20COPIES%3A%20100%0AMINIMUM%20ORDER%20TOTAL%3A%20R7%2C800%0AINCLUDES%3A%20Full%20colour%2C%20gloss%20cover%2C%20saddle%20stitch%0A%0A---%0AMY%20DETAILS%3A%0AName%3A%20%0APhone%3A%20%0ABook%20title%3A%20%0AExact%20page%20count%3A%20%0ANumber%20of%20copies%3A%20%0AIs%20your%20book%20typeset%20and%20print-ready%3F%20%0AAny%20notes%3A%20%0A%0AThank%20you%2C'
  },
  {
    name: 'Premium',
    pageCount: '61-80 pages',
    pricePerBook: 130,
    minCopies: 100,
    minOrderTotal: 13000,
    features: ['61 to 80 pages', 'Full colour', 'Gloss cover', 'Saddle stitch'],
    bestFor: 'Full-length children\'s books, illustrated readers, premium gift books',
    orderLink: 'mailto:info@creativebookssa.co.za?subject=Order%3A%2015x15%20Children%27s%20Book%20Printing%20-%20Premium%20%2861-80%20pages%29&body=Hi%20Creative%20Books%20SA%2C%0A%0AI%27d%20like%20to%20order%20the%20following%20children%27s%20book%20printing%20package%3A%0A%0APACKAGE%3A%2015%20x%2015%20cm%20Premium%0APAGES%3A%2061%20to%2080%0APRICE%20PER%20BOOK%3A%20R130%0AMINIMUM%20COPIES%3A%20100%0AMINIMUM%20ORDER%20TOTAL%3A%20R13%2C000%0AINCLUDES%3A%20Full%20colour%2C%20gloss%20cover%2C%20saddle%20stitch%0A%0A---%0AMY%20DETAILS%3A%0AName%3A%20%0APhone%3A%20%0ABook%20title%3A%20%0AExact%20page%20count%3A%20%0ANumber%20of%20copies%3A%20%0AIs%20your%20book%20typeset%20and%20print-ready%3F%20%0AAny%20notes%3A%20%0A%0AThank%20you%2C'
  },
];

const faqs = [
  {
    q: 'Can I print fewer than 100 copies of a 15 x 15 cm book?',
    a: 'For smaller print runs, see our Mini Publishing Package which includes 5 printed copies, or request a custom quote for a smaller children\'s book run.',
  },
  {
    q: 'What page counts work with saddle stitching?',
    a: 'Saddle stitch requires page counts in multiples of 4. So your book must have 8, 12, 16, 20, 24, 28, 32, 36, 40, 44, 48, 52, 56, 60, 64, 68, 72, 76, or 80 pages. If you\'re unsure how to plan this, request a free consultation.',
  },
  {
    q: 'Do you offer illustration services for children\'s books?',
    a: 'Our Children\'s Book Packages include illustration services. See the Children\'s Book Packages page for full pricing and details.',
  },
  {
    q: 'What if my book has more than 80 pages?',
    a: 'Books over 80 pages require perfect binding or hardcover instead of saddle stitch. Request a custom quote and we\'ll provide pricing for your specific page count.',
  },
  {
    q: 'Can I print my book in other sizes?',
    a: 'Yes, we also print children\'s books in 20 x 20 cm and 21 x 21 cm. For other custom sizes, request a quote.',
  },
  {
    q: 'How long does printing take?',
    a: 'Production typically takes 2 weeks from when we receive your print-ready files. Delivery within South Africa is usually 2 to 5 working days after production.',
  },
  {
    q: 'Do you ship outside South Africa?',
    a: 'International shipping is available on request. Costs depend on destination and order weight.',
  },
  {
    q: 'Can I use the same cover design for different book sizes?',
    a: 'No. Each book size requires a cover designed at its exact dimensions. Use our Cover Size Calculator to get the right measurements.',
  },
  {
    q: 'Can I order more than 100 copies?',
    a: 'Yes. The 100-copy minimum is the entry point. Larger orders are welcomed and may qualify for better per-copy rates. Request a quote with your target quantity for tailored pricing.',
  },
];

const PricingCard = ({ pkg }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    className="p-8 rounded-2xl border border-white/20 backdrop-blur-xl"
    style={{
      background: 'rgba(255, 255, 255, 0.08)',
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
    }}
  >
    <h3 className="font-heading text-2xl font-bold text-white mb-2">{pkg.name}</h3>
    <p className="text-copper text-sm font-semibold mb-6">{pkg.pageCount}</p>

    <div className="mb-6 space-y-2">
      <p className="text-4xl font-bold text-copper">R{pkg.pricePerBook}</p>
      <p className="text-white/60 text-sm">per book at {pkg.minCopies} copies</p>
      <p className="text-white/80 text-sm font-semibold">Minimum order: R{pkg.minOrderTotal.toLocaleString()}</p>
    </div>

    <div className="mb-6 space-y-2">
      <p className="text-white/70 text-xs font-semibold uppercase">Includes:</p>
      {pkg.features.map((feature, i) => (
        <div key={i} className="flex items-center gap-2 text-white/70 text-sm">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          {feature}
        </div>
      ))}
    </div>

    <p className="mb-6 p-3 rounded-lg backdrop-blur-sm border border-white/10 text-white/70 text-sm"
      style={{ background: 'rgba(255, 255, 255, 0.05)' }}>
      <span className="font-semibold">Best for:</span> {pkg.bestFor}
    </p>

    <div className="space-y-2">
      <Link
        to="/getquote"
        className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 bg-copper text-white font-medium rounded-full hover:bg-copper/90 transition-all"
      >
        Get a Custom Quote
        <ArrowRight className="w-4 h-4" />
      </Link>
      <a
        href={pkg.orderLink}
        className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 border-2 border-copper text-copper font-medium rounded-full hover:bg-copper/5 transition-all text-sm"
      >
        Order This Package As-Is
        <ArrowRight className="w-4 h-4" />
      </a>
    </div>
  </motion.div>
);

export default function ChildrensBooks15x15() {
  return (
    <div>
      <PageMeta
        title="15 x 15 cm Children's Book Printing South Africa | Creative Books SA"
        description="Children's book printing in 15 x 15 cm format. Full colour, gloss cover, saddle stitched. From R40 per book at 100 copies. Quality SA printing with nationwide delivery."
        keywords="children's book printing, 15x15 book printing, children's book printing South Africa, square format children's books"
        canonical="https://www.creativebooks.co.za/printing/childrensbooks/ChildrensBooks15x15"
      />

      {/* Hero */}
      <section className="relative min-h-[50vh] flex items-center pt-20 bg-[#060504]">
        <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at 25% 60%, rgba(184,115,51,0.18) 0%, transparent 55%)' }} />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-20">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
            <h1 className="font-heading text-4xl md:text-5xl font-bold text-white mb-4 leading-tight">
              15 x 15 cm Children's Book Printing in South Africa
            </h1>
            <p className="text-white/60 text-lg font-body max-w-2xl mb-8">
              Full-colour, saddle-stitched children's books printed in Johannesburg and delivered nationwide. From R40 per book at 100 copies.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/getquote" className="inline-flex items-center justify-center gap-2 px-8 py-3 bg-copper text-white font-medium rounded-full hover:bg-copper/90 transition-all">
                Get a Custom Quote
                <ArrowRight className="w-4 h-4" />
              </Link>
              <a href={packages[0].orderLink} className="inline-flex items-center justify-center gap-2 px-8 py-3 border-2 border-white text-white font-medium rounded-full hover:border-copper hover:text-copper transition-all">
                Email Now
                <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Intro Section */}
      <section className="py-16 lg:py-24 bg-vellum">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
            <h2 className="font-heading text-3xl font-bold text-[#0F0F0F] mb-6">Bring Your Children's Story to Life</h2>
            <p className="text-[#0F0F0F]/70 font-body text-lg leading-relaxed mb-6">
              The 15 x 15 cm square format is one of the most popular sizes for children's books in South Africa. Compact, easy for little hands to hold, and ideal for picture books, bedtime stories, early readers, and educational content. At Creative Books SA, we print children's books in 15 x 15 cm with full-colour interiors, vibrant gloss covers, and durable saddle-stitch binding.
            </p>
            <p className="text-[#0F0F0F]/70 font-body text-lg leading-relaxed">
              Every book is printed on quality 90 gsm full-colour paper that brings illustrations to life. Saddle stitching (where the book is folded and stapled along the spine) is the industry-standard binding for thinner children's books — it lies flat for easy reading, holds up to repeated use, and keeps production costs low so you can print at scale.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-16 lg:py-24 bg-[#060504]">
        <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at 75% 40%, rgba(184,115,51,0.12) 0%, transparent 55%)' }} />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative">
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-center mb-16">
            <h2 className="font-heading text-3xl font-bold text-white mb-4">Pricing</h2>
            <p className="text-white/60 font-body text-lg max-w-2xl mx-auto">
              All packages include 15 x 15 cm format, full-colour interior printing, gloss cover finish, and saddle stitch binding.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {packages.map((pkg, i) => (
              <PricingCard key={i} pkg={pkg} />
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 lg:py-24 bg-vellum">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <h2 className="font-heading text-3xl font-bold text-[#0F0F0F] mb-12 text-center">Why Choose 15 x 15 cm for Your Children's Book?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: 'Perfect for Little Hands',
                text: 'The 15 x 15 cm size is small enough for young readers to hold comfortably on their own. Ideal for ages 2 to 7.',
              },
              {
                title: 'Great for Illustrations',
                text: 'The square format gives illustrators a balanced canvas for full-page and double-page spread artwork. Your illustrations have room to breathe.',
              },
              {
                title: 'Affordable to Start',
                text: 'Print just 100 copies to test the market or supply your first wave of readers. From R4,000 total order, no large upfront commitment needed.',
              },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="p-8 rounded-xl bg-white border border-copper/10"
              >
                <h3 className="font-heading text-xl font-bold text-copper mb-3">{item.title}</h3>
                <p className="text-[#0F0F0F]/70 font-body">{item.text}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* What's Included */}
      <section className="py-16 lg:py-24 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <h2 className="font-heading text-3xl font-bold text-[#0F0F0F] mb-8">What's Included in Every Order</h2>
          <ul className="space-y-4 font-body text-[#0F0F0F]/70">
            {[
              '15 x 15 cm trim size',
              'Full-colour interior printing on 90 gsm paper',
              'Gloss-laminated cover for durability and shine',
              'Saddle stitch binding (industry standard for picture books)',
              'Print-ready file checking',
              'Nationwide delivery across South Africa',
              'Production turnaround: 2 weeks from print-ready file approval',
            ].map((item, i) => (
              <li key={i} className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* What You Need */}
      <section className="py-16 lg:py-24 bg-vellum">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <h2 className="font-heading text-3xl font-bold text-[#0F0F0F] mb-8">What You Need to Provide</h2>
          <ol className="space-y-4 font-body text-[#0F0F0F]/70">
            {[
              'A print-ready interior PDF, set up at 156 x 156 mm (15 x 15 cm trim plus 3 mm bleed on all sides)',
              'A print-ready cover PDF including front, back, and any spine area required',
              'All artwork in CMYK colour mode at 300 DPI',
              'Page count must be a multiple of 4 (saddle stitch requirement: 8, 12, 16, 20, 24, 28, 32 pages, etc.)',
              'Confirmed number of copies (minimum 100)',
            ].map((item, i) => (
              <li key={i} className="flex items-start gap-3">
                <span className="font-bold text-copper flex-shrink-0">{i + 1}.</span>
                <span>{item}</span>
              </li>
            ))}
          </ol>
          <p className="mt-8 p-4 rounded-lg bg-copper/10 border border-copper/20 text-[#0F0F0F]/70">
            If you don't have print-ready files yet, we can help. See our <Link to="/bookcoverdesign" className="text-copper font-semibold hover:underline">Book Cover Design</Link>, <Link to="/typesetting" className="text-copper font-semibold hover:underline">Book Typesetting</Link>, and <Link to="/childrensbookpackages" className="text-copper font-semibold hover:underline">Children's Book Packages</Link> services. Also check the <Link to="/resources/CoverSizeCalculator" className="text-copper font-semibold hover:underline">Cover Size Calculator</Link> for exact cover dimensions.
          </p>
        </div>
      </section>

      {/* Saddle Stitch Explained */}
      <section className="py-16 lg:py-24 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <h2 className="font-heading text-3xl font-bold text-[#0F0F0F] mb-8">Saddle Stitch Binding Explained</h2>
          <p className="text-[#0F0F0F]/70 font-body text-lg leading-relaxed">
            Saddle stitching means your book is folded down the middle and held together with two or three wire staples along the spine. It's the most common binding for children's picture books because it allows the book to lie completely flat when open, making it easier for kids and parents to read together. Saddle-stitched books are durable, lightweight, and cost-effective to produce. The only limitation is page count: saddle stitch works best from 8 to 80 pages. For books longer than 80 pages, perfect binding or hardcover is recommended.
          </p>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 lg:py-24 bg-vellum">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <h2 className="font-heading text-3xl font-bold text-[#0F0F0F] mb-12 text-center">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <details key={i} className="group border border-[#0F0F0F]/10 rounded-lg p-4 hover:border-copper/40 transition-all">
                <summary className="flex items-center justify-between cursor-pointer font-medium text-[#0F0F0F]">
                  {faq.q}
                  <span className="group-open:rotate-180 transition-transform">▼</span>
                </summary>
                <p className="mt-3 text-[#0F0F0F]/70 font-body text-sm">{faq.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Other Sizes */}
      <section className="py-16 lg:py-24 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <h2 className="font-heading text-3xl font-bold text-[#0F0F0F] mb-12 text-center">Children's Book Sizes</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[
              { size: '20 x 20 cm', desc: 'Medium square format. More space for detailed illustrations and longer text. Ideal for picture books for ages 4-9.', path: '/printing/childrensbooks/ChildrensBooks20x20' },
              { size: '21 x 21 cm', desc: 'Large premium square format. Generous canvas for full-bleed illustrations and gift-book quality.', path: '/printing/childrensbooks/ChildrensBooks21x21' },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="p-8 rounded-xl bg-vellum border border-copper/10"
              >
                <h3 className="font-heading text-xl font-bold text-[#0F0F0F] mb-3">{item.size}</h3>
                <p className="text-[#0F0F0F]/70 font-body mb-6">{item.desc}</p>
                <Link to={item.path} className="inline-flex items-center gap-2 text-copper font-semibold hover:underline">
                  View {item.size} Pricing
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Need Help */}
      <section className="py-16 lg:py-24 bg-vellum">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <h2 className="font-heading text-3xl font-bold text-[#0F0F0F] mb-8 text-center">Need Help Preparing Your Book?</h2>
          <p className="text-[#0F0F0F]/70 font-body text-center mb-12 max-w-2xl mx-auto">
            Not sure where to start? Creative Books SA offers full publishing support for children's authors, from manuscript to printed book.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { title: "Children's Book Packages", desc: 'Complete packages including illustration, layout, cover design, and printing', path: '/childrensbookpackages' },
              { title: 'Book Cover Design', desc: 'Custom children\'s book cover design from R3,850', path: '/bookcoverdesign' },
              { title: 'Book Typesetting', desc: 'Professional layout from R10.50 per page', path: '/typesetting' },
            ].map((item, i) => (
              <Link
                key={i}
                to={item.path}
                className="p-6 rounded-xl bg-white border border-copper/20 hover:border-copper/50 transition-all group"
              >
                <h3 className="font-heading font-bold text-[#0F0F0F] mb-2 group-hover:text-copper transition-colors">{item.title}</h3>
                <p className="text-[#0F0F0F]/70 font-body text-sm">{item.desc}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <InternalLinks
        links={[
          { label: 'Children\'s Book Printing', path: '/printing/childrensbooks' },
          { label: 'Children\'s Book Packages', path: '/childrensbookpackages' },
          { label: 'Book Cover Design', path: '/bookcoverdesign' },
          { label: 'Book Typesetting', path: '/typesetting' },
          { label: 'Get a Quote', path: '/getquote' },
        ]}
      />

      <CTASection
        title="Ready to Print Your Children's Book?"
        description="Get a free quote within 24 hours. Tell us about your book and we'll send you a tailored proposal with no obligation."
      />

      {/* Schema Markup */}
      <script type="application/ld+json">{`
{
  "@context": "https://schema.org",
  "@type": "Service",
  "name": "15 x 15 cm Children's Book Printing",
  "serviceType": "Children's Book Printing",
  "provider": {
    "@type": "Organization",
    "name": "Creative Books SA",
    "url": "https://creativebooks.co.za"
  },
  "areaServed": {
    "@type": "Country",
    "name": "South Africa"
  },
  "description": "Full-colour children's book printing in 15 x 15 cm format with gloss cover and saddle stitch binding. Minimum 100 copies.",
  "offers": [
    {
      "@type": "Offer",
      "name": "Starter Package (10-20 pages)",
      "price": "40",
      "priceCurrency": "ZAR",
      "priceSpecification": {
        "@type": "UnitPriceSpecification",
        "price": "40",
        "priceCurrency": "ZAR",
        "unitText": "per book",
        "eligibleQuantity": {
          "@type": "QuantitativeValue",
          "minValue": 100
        }
      }
    },
    {
      "@type": "Offer",
      "name": "Standard Package (21-35 pages)",
      "price": "60",
      "priceCurrency": "ZAR",
      "priceSpecification": {
        "@type": "UnitPriceSpecification",
        "price": "60",
        "priceCurrency": "ZAR",
        "unitText": "per book",
        "eligibleQuantity": {
          "@type": "QuantitativeValue",
          "minValue": 100
        }
      }
    },
    {
      "@type": "Offer",
      "name": "Extended Package (36-60 pages)",
      "price": "78",
      "priceCurrency": "ZAR",
      "priceSpecification": {
        "@type": "UnitPriceSpecification",
        "price": "78",
        "priceCurrency": "ZAR",
        "unitText": "per book",
        "eligibleQuantity": {
          "@type": "QuantitativeValue",
          "minValue": 100
        }
      }
    },
    {
      "@type": "Offer",
      "name": "Premium Package (61-80 pages)",
      "price": "130",
      "priceCurrency": "ZAR",
      "priceSpecification": {
        "@type": "UnitPriceSpecification",
        "price": "130",
        "priceCurrency": "ZAR",
        "unitText": "per book",
        "eligibleQuantity": {
          "@type": "QuantitativeValue",
          "minValue": 100
        }
      }
    }
  ]
}
      `}</script>
    </div>
  );
}