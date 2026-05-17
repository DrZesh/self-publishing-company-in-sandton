import React from 'react';
import PageMeta from '../../components/shared/PageMeta';
import { faqSchema } from '../../lib/seo/schemas';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

// Hero — same as home page
import HeroSlider from '../../components/home/HeroSlider';

// All home page sections
import TrustStrip from '../../components/home/TrustStrip';
import PublishingPath from '../../components/home/PublishingPath';
import CoreServices from '../../components/home/CoreServices';
import PublishingPackagesSection from '../../components/home/PublishingPackagesSection';
import CalculatorCTA from '../../components/home/CalculatorCTA';
import WhyChooseUsNew from '../../components/home/WhyChooseUsNew';
import BookTypes from '../../components/home/BookTypes';
import PublishingProcess from '../../components/home/PublishingProcess';
import LocationSEO from '../../components/home/LocationSEO';
import HomeFAQ from '../../components/home/HomeFAQ';
import FinalCTA from '../../components/home/FinalCTA';
import InternalLinks from '../../components/shared/InternalLinks';

const locationFaqs = [
  { question: 'Do you offer book printing in Johannesburg?', answer: 'Yes. Creative Books SA provides professional book printing services for authors and businesses in Johannesburg and throughout Gauteng.' },
  { question: 'What is the minimum print run?', answer: 'Our minimum order is 50 copies for offset printing. For print-on-demand, you can order as few as 1 copy.' },
  { question: 'How much does book printing cost?', answer: 'Pricing depends on page count, size, paper type, cover type, and quantity. A 200-page softcover A5 book starts from approximately R45 per copy for 100 copies. Request a detailed quote for your specs.' },
  { question: 'How fast is delivery to Johannesburg?', answer: 'Standard turnaround is 7–14 business days from proof approval. Rush printing (3–5 days) is available. We deliver to Johannesburg within 1–2 business days.' },
  { question: 'Can you help with layout before printing?', answer: 'Yes. We offer book layout and typesetting services to prepare your manuscript for professional printing.' },
  { question: 'Can you design my book cover before printing?', answer: 'Yes. Our book cover design team creates professional print-ready covers with front, spine, and back cover integration.' },
  { question: 'Can I print from a Word document?', answer: 'For professional book printing, a print-ready PDF is strongly recommended. Word files can shift between devices and may not preserve exact layout.' },
  { question: 'What is perfect binding?', answer: 'Perfect binding is a common paperback binding method where pages are glued into a printed cover. It is widely used for novels, memoirs, poetry books and non-fiction books.' },
  { question: 'Is cream paper better than white paper?', answer: 'Neither is automatically better. Cream paper is often comfortable for long reading, while white paper is useful for sharper visuals, workbooks and manuals.' },
  { question: 'How many copies should I print?', answer: 'This depends on your launch plan, audience size and budget. Many self-published authors start with a controlled quantity and reprint when demand is clearer.' },
];

export default function BookPrintingJohannesburg() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    'name': 'Book Printing Johannesburg',
    'description': 'Professional book printing services in Johannesburg, Gauteng. High-quality printing for authors and businesses.',
    'areaServed': 'Johannesburg, Gauteng, South Africa',
  };

  return (
    <div>
      <PageMeta
        title="Book Printing in Johannesburg | Competitive Prices"
        description="Professional book printing in Johannesburg — A5, 6×9, hardcover and children's formats. Cream or white paper, from 100 copies, fast turnaround."
        keywords="book printing Johannesburg, book printers Johannesburg, Johannesburg book printing, printing services Johannesburg, book publishing Johannesburg"
        canonical="https://www.creativebooks.co.za/bookprintingjohannesburg"
        schema={{ '@graph': [schema, faqSchema(locationFaqs)] }}
      />

      {/* 1. Hero */}
      <HeroSlider locationData={{ serviceType: 'Book Printing', city: 'Johannesburg', province: 'Gauteng' }} />

      {/* 2. Trust Strip */}
      <TrustStrip />

      {/* 3. Choose Your Publishing Path */}
      <PublishingPath />

      {/* 4. Core Services */}
      <CoreServices />

      {/* 5. Publishing Packages */}
      <PublishingPackagesSection />

      {/* 6. Book Printing Calculator CTA */}
      <CalculatorCTA />

      {/* 7. Why Choose Us */}
      <WhyChooseUsNew />

      {/* 8. Book Types */}
      <BookTypes />

      {/* 9. Publishing Process */}
      <PublishingProcess />

      {/* 10. Location SEO */}
      <LocationSEO />

      {/* 11. In-depth printing guide section */}
      <section className="py-16 lg:py-24 bg-vellum">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-10">
            <span className="text-copper text-xs font-body bg-copper/10 px-3 py-1 rounded-full mb-4 inline-block">Printing Guide</span>
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-[#0F0F0F] mt-4 mb-4">
              Book Printing in Johannesburg: What Self-Published Authors Need to Know
            </h2>
          </motion.div>

          <div className="space-y-10">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
              <p className="text-[#0F0F0F]/70 leading-[1.8] font-body text-lg">
                Book printing in Johannesburg is one of the final steps in the self-publishing journey, but it should never be treated as an afterthought. By the time a book goes to print, the manuscript should be edited, the layout should be approved, the cover should include the front, spine and back, and the final files should be print-ready.
              </p>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
              <h3 className="font-heading text-2xl font-bold text-[#0F0F0F] mb-4">What book printers need before production</h3>
              <p className="text-[#0F0F0F]/70 leading-[1.8] font-body">
                Before printing, the printer needs the final interior PDF and full cover PDF. The interior should already be typeset to the correct size, such as A5 or 6 x 9. The cover should be prepared as a full wraparound file with front cover, spine and back cover. If there is an ISBN barcode, it must be placed correctly before the file is approved.
              </p>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
              <h3 className="font-heading text-2xl font-bold text-[#0F0F0F] mb-4">Cream paper or white paper</h3>
              <p className="text-[#0F0F0F]/70 leading-[1.8] font-body">
                Cream paper is often used for novels, memoirs, poetry and longer reading books because it gives the pages a warmer tone. White paper is often better for workbooks, manuals, educational material and books with diagrams or images because it gives a cleaner and sharper look.
              </p>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
              <h3 className="font-heading text-2xl font-bold text-[#0F0F0F] mb-4">Black and white vs colour printing</h3>
              <p className="text-[#0F0F0F]/70 leading-[1.8] font-body">
                Black and white printing is usually the best choice for novels, poetry, memoirs, Christian books, self-help books and business books without image-heavy pages. Colour printing is useful for children's books, recipe books, art books, photo books and educational books where images carry meaning.
              </p>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
              <h3 className="font-heading text-2xl font-bold text-[#0F0F0F] mb-4">Why print-ready layout matters</h3>
              <p className="text-[#0F0F0F]/70 leading-[1.8] font-body">
                A professionally typeset book looks balanced. It has consistent margins, clean chapter openings, proper page numbers, controlled spacing and no awkward single lines sitting alone at the top or bottom of a page. These details may sound small, but readers feel them.
              </p>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
              <h3 className="font-heading text-2xl font-bold text-[#0F0F0F] mb-4">Mistakes that delay book printing</h3>
              <p className="text-[#0F0F0F]/70 leading-[1.8] font-body">
                The most common delays include unfinished editing, missing cover files, low-resolution images, wrong page size, missing ISBN, unclear colour requirements and late changes after approval. Late changes are especially dangerous because one small text change can shift the layout, which can change the page count, which can affect the spine.
              </p>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              className="p-8 rounded-2xl bg-gradient-to-br from-copper/10 to-copper/5 border border-copper/20">
              <h3 className="font-heading text-2xl font-bold text-[#0F0F0F] mb-4">Ready to print your book in Johannesburg?</h3>
              <p className="text-[#0F0F0F]/70 font-body mb-6">
                Creative Books SA offers professional book printing in Johannesburg with competitive pricing and quality production.
              </p>
              <Link to="/getquote" className="inline-flex items-center gap-2 px-6 py-3 bg-copper text-white rounded-full font-medium hover:bg-copper/90 transition-all">
                Request a Printing Quote <ArrowRight className="w-4 h-4" />
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 12. Internal Links */}
      <InternalLinks
        links={[
          { label: 'Book Printing', path: '/bookprinting' },
          { label: 'Book Layout & Typesetting', path: '/typesetting' },
          { label: 'Book Cover Design', path: '/bookcoverdesign' },
          { label: 'Self Publishing Packages', path: '/selfpublishingpackagesinsouthafrica' },
          { label: 'A5 Book Printing', path: '/printing/a5' },
          { label: 'Get a Quote', path: '/getquote' },
        ]}
        light
      />

      {/* 13. FAQ */}
      <HomeFAQ />

      {/* 14. Final CTA */}
      <FinalCTA />
    </div>
  );
}