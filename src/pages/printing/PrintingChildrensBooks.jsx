import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import Breadcrumbs from '../../components/shared/Breadcrumbs';
import CTASection from '../../components/shared/CTASection';
import InternalLinks from '../../components/shared/InternalLinks';
import PageMeta from '../../components/shared/PageMeta';

const sizes = [
  { label: '15 x 15 cm', path: '/printing/childrensbooks/ChildrensBooks15x15', description: 'Our most popular children\'s book size. Compact, easy for little hands, and affordable to start. From R40 per book at 100 copies.' },
  { label: '20 x 20 cm', path: '/printing/childrensbooks/ChildrensBooks20x20', description: 'Medium square format. More space for detailed illustrations and longer text. Ideal for picture books for ages 4-9.' },
  { label: '21 x 21 cm', path: '/printing/childrensbooks/ChildrensBooks21x21', description: 'Large premium square format. Generous canvas for full-bleed illustrations and gift-book quality. Premium feel for special editions.' },
];

export default function PrintingChildrensBooks() {
  return (
    <div>
      <PageMeta
        title="Children's Book Printing in Johannesburg"
        description="Full-colour children's book printing in 15×15, 20×20 and 21×21cm formats. Saddle-stitch or perfect binding. Perfect for picture books and stories."
        canonical="https://www.creativebooks.co.za/printing/childrensbooks"
      />
      {/* Hero */}
      <section className="relative min-h-[50vh] flex items-center pt-20 bg-obsidian">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 30% 60%, #B87333 0%, transparent 50%)' }} />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-20">
          <Breadcrumbs light items={[{ label: 'Printing', path: '/printing/a5' }, { label: "Children's Book Printing", path: '/printing/childrensbooks' }]} />
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }} className="max-w-2xl mt-4">
            <span className="text-copper text-sm font-body font-medium tracking-[0.25em] uppercase mb-4 block">Book Printing</span>
            <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">Children's Book Printing in Johannesburg</h1>
            <p className="text-white/60 text-lg leading-relaxed font-body mb-8">
              Vibrant full-colour children's book printing on thick, durable paper. Choose your ideal size below to get started.
            </p>
            <Link to="/getquote" className="group inline-flex items-center gap-2 px-7 py-3.5 bg-copper text-white font-medium rounded-full hover:bg-copper/90 transition-all shadow-lg shadow-copper/20">
              Get a Free Quote <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Size Selection */}
      <section className="py-20 lg:py-28 bg-vellum">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
            <span className="text-copper text-sm font-body tracking-[0.25em] uppercase mb-4 block">Select Your Size</span>
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-[#0F0F0F]">Choose Your Children's Book Size</h2>
            <p className="text-[#0F0F0F]/50 font-body mt-3 max-w-xl mx-auto">Select the format that works best for your children's book. Each size includes full-colour printing, gloss cover, and saddle stitch binding.</p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {sizes.map((size, i) => (
              <motion.div
                key={size.path}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <Link to={size.path}
                  className="group block bg-white rounded-2xl p-8 border border-[#0F0F0F]/5 shadow-sm hover:border-copper/40 hover:shadow-md transition-all h-full">
                  <div className="w-14 h-14 rounded-xl bg-copper/10 flex items-center justify-center mb-5 group-hover:bg-copper/20 transition-colors">
                    <span className="text-copper font-heading font-bold text-xs text-center leading-tight">{size.label.replace(' × ', '×')}</span>
                  </div>
                  <h3 className="font-heading text-lg font-semibold text-[#0F0F0F] mb-2 group-hover:text-copper transition-colors">{size.label}</h3>
                  <p className="text-sm text-[#0F0F0F]/60 font-body leading-relaxed mb-4">{size.description}</p>
                  <span className="inline-flex items-center gap-1 text-copper text-sm font-body font-medium">
                    View Details <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </span>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <InternalLinks links={[
        { label: 'A5 Printing', path: '/printing/a5' },
        { label: '6x9 Printing', path: '/printing/6x9' },
        { label: 'Hardcover Printing', path: '/printing/hardcover' },
        { label: "Children's Book Publishing", path: '/childrensbookpublishing' },
        { label: 'Book Cover Design', path: '/bookcoverdesign' },
        { label: 'Get a Quote', path: '/getquote' },
      ]} light />
      <CTASection title="Ready to Print Your Children's Book?" description="Get a free children's book printing quote tailored to your size and quantity requirements." />
    </div>
  );
}