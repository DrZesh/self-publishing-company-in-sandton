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
    bestFor: 'Simple board books, very short picture books, board-style early readers',
  },
  {
    name: 'Standard',
    pageCount: '21-35 pages',
    bestFor: 'Standard picture books, short story books for ages 3-7',
  },
  {
    name: 'Extended',
    pageCount: '36-60 pages',
    bestFor: 'Longer picture books, early chapter books, educational content',
  },
  {
    name: 'Premium',
    pageCount: '61-80 pages',
    bestFor: 'Full-length children\'s books, illustrated readers, premium gift books',
  },
];

const faqs = [
  {
    q: 'Can I print fewer than 100 copies of a 21 x 21 cm book?',
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
    a: 'Yes, we also print children\'s books in 15 x 15 cm and 20 x 20 cm. For other custom sizes, request a quote.',
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
    className="p-8 rounded-2xl border-2 border-copper/20 bg-white"
    style={{ boxShadow: '0 10px 40px rgba(184,115,51,0.08)' }}
  >
    <h3 className="font-heading text-2xl font-bold text-[#0F0F0F] mb-2">{pkg.name}</h3>
    <p className="text-copper text-sm font-semibold mb-6">{pkg.pageCount}</p>

    <div className="mb-6 space-y-2">
      <p className="text-2xl font-bold text-copper">Pricing to be confirmed</p>
      <p className="text-[#0F0F0F]/60 text-sm">Contact us for current rates</p>
    </div>

    <div className="mb-6 space-y-2">
      <p className="text-[#0F0F0F]/70 text-xs font-semibold uppercase">Includes:</p>
      {['21 x 21 pages', 'Full colour', 'Gloss cover', 'Saddle stitch'].map((feature, i) => (
        <div key={i} className="flex items-center gap-2 text-[#0F0F0F]/70 text-sm">
          <CheckCircle2 className="w-4 h-4 text-green-600" />
          {feature}
        </div>
      ))}
    </div>

    <p className="mb-6 p-3 rounded-lg bg-[#0F0F0F]/5 text-[#0F0F0F]/70 text-sm">
      <span className="font-semibold">Best for:</span> {pkg.bestFor}
    </p>

    <Link
      to="/getquote"
      className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 bg-copper text-white font-medium rounded-full hover:bg-copper/90 transition-all"
    >
      Request a Quote
      <ArrowRight className="w-4 h-4" />
    </Link>
  </motion.div>
);

export default function ChildrensBooks21x21() {
  return (
    <div>
      <PageMeta
        title="21 x 21 cm Children's Book Printing South Africa | Creative Books SA"
        description="Premium children's book printing in 21 x 21 cm format. Full colour, gloss cover, saddle stitched. Quality South African printing with nationwide delivery."
        keywords="children's book printing, 21x21 book printing, children's book printing South Africa, square format children's books"
        canonical="https://www.creativebookssa.co.za/printing/childrensbooks/ChildrensBooks21x21"
      />

      {/* Hero */}
      <section className="relative min-h-[50vh] flex items-center pt-20 bg-[#060504]">
        <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at 25% 60%, rgba(184,115,51,0.18) 0%, transparent 55%)' }} />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-20">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
            <h1 className="font-heading text-4xl md:text-5xl font-bold text-white mb-4 leading-tight">
              21 x 21 cm Children's Book Printing in South Africa
            </h1>
            <p className="text-white/60 text-lg font-body max-w-2xl mb-8">
              Premium full-colour, saddle-stitched children's books printed in Johannesburg and delivered nationwide.
            </p>
            <Link to="/getquote" className="inline-flex items-center justify-center gap-2 px-8 py-3 bg-copper text-white font-medium rounded-full hover:bg-copper/90 transition-all">
              Get a Custom Quote
              <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Intro Section */}
      <section className="py-16 lg:py-24 bg-vellum">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
            <h2 className="font-heading text-3xl font-bold text-[#0F0F0F] mb-6">Bring Your Children's Story to Life</h2>
            <p className="text-[#0F0F0F]/70 font-body text-lg leading-relaxed mb-6">
              The 21 x 21 cm square format is the largest in our children's book printing range, offering a premium book experience. Large enough for full-bleed artwork and generous illustrations, yet still manageable for young readers. Perfect for gift books, deluxe editions, and special projects. At Creative Books SA, we print children's books in 21 x 21 cm with full-colour interiors, vibrant gloss covers, and durable saddle-stitch binding.
            </p>
            <p className="text-[#0F0F0F]/70 font-body text-lg leading-relaxed">
              Every book is printed on quality 90 gsm full-colour paper that brings illustrations to life. Saddle stitching (where the book is folded and stapled along the spine) is the industry-standard binding for thinner children's books — it lies flat for easy reading, holds up to repeated use, and keeps production costs low so you can print at scale.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-16 lg:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-center mb-16">
            <div className="inline-block p-3 rounded-lg bg-blue-50 border border-blue-200 mb-8">
              <p className="text-blue-900 text-sm font-semibold">Pricing for 21 x 21 cm is being finalised. Contact us for current rates.</p>
            </div>
            <h2 className="font-heading text-3xl font-bold text-[#0F0F0F] mb-4">Pricing</h2>
            <p className="text-[#0F0F0F]/60 font-body text-lg max-w-2xl mx-auto">
              All packages include 21 x 21 cm format, full-colour interior printing, gloss cover finish, and saddle stitch binding.
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
          <h2 className="font-heading text-3xl font-bold text-[#0F0F0F] mb-12 text-center">Why Choose 21 x 21 cm for Your Children's Book?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: 'Luxurious Illustration Canvas',
                text: 'The largest format in our range. Provides maximum space for full-bleed artwork, detailed illustrations, and immersive visual storytelling.',
              },
              {
                title: 'Premium Gift-Book Quality',
                text: 'The 21 x 21 cm size conveys quality and makes a strong impression. Ideal for special occasions, collector editions, and high-end picture books.',
              },
              {
                title: 'Still Affordable with Saddle Stitch',
                text: 'Despite the larger size, saddle-stitch binding keeps costs manageable. Perfect for authors who want premium presentation without excessive expenses.',
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
              '21 x 21 cm trim size',
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
              'A print-ready interior PDF, set up at 216 x 216 mm (21 x 21 cm trim plus 3 mm bleed on all sides)',
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
              { size: '15 x 15 cm', desc: 'Most popular children\'s book size. Compact, easy for little hands, and affordable to start. From R40 per book at 100 copies.', path: '/printing/childrensbooks/ChildrensBooks15x15' },
              { size: '20 x 20 cm', desc: 'Medium square format. More space for detailed illustrations and longer text. Ideal for picture books for ages 4-9.', path: '/printing/childrensbooks/ChildrensBooks20x20' },
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
    </div>
  );
}