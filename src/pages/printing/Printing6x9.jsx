import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import Breadcrumbs from '../../components/shared/Breadcrumbs';
import CTASection from '../../components/shared/CTASection';
import InternalLinks from '../../components/shared/InternalLinks';

export default function Printing6x9() {
  return (
    <div>
      {/* Hero */}
      <section className="relative min-h-[50vh] flex items-center pt-20 bg-obsidian">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 30% 60%, #B87333 0%, transparent 50%)' }} />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-20">
          <Breadcrumbs light items={[{ label: 'Printing', path: '/printing/a5' }, { label: '6x9 Printing', path: '/printing/6x9' }]} />
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }} className="max-w-2xl mt-4">
            <span className="text-copper text-sm font-body font-medium tracking-[0.25em] uppercase mb-4 block">Book Printing</span>
            <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">6x9 Printing</h1>
            <p className="text-white/60 text-lg leading-relaxed font-body mb-8">
              Standard 6×9 inch book printing — the preferred trade paperback size, compatible with Amazon KDP print-on-demand specifications.
            </p>
            <Link to="/getquote" className="group inline-flex items-center gap-2 px-7 py-3.5 bg-copper text-white font-medium rounded-full hover:bg-copper/90 transition-all shadow-lg shadow-copper/20">
              Get a Free Quote <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Placeholder content */}
      <section className="py-20 lg:py-28 bg-vellum">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="bg-white rounded-3xl p-12 border border-[#0F0F0F]/5 text-center shadow-sm">
            <div className="w-16 h-16 rounded-2xl bg-copper/10 flex items-center justify-center mx-auto mb-6">
              <span className="text-copper font-heading font-bold text-base">6×9</span>
            </div>
            <h2 className="font-heading text-2xl md:text-3xl font-bold text-[#0F0F0F] mb-4">6x9 Printing Content Coming Soon</h2>
            <p className="text-[#0F0F0F]/50 font-body max-w-lg mx-auto">
              Detailed specifications, pricing, and options for 6×9 book printing will be added here. Contact us for a personalised quote in the meantime.
            </p>
          </motion.div>
        </div>
      </section>

      <InternalLinks links={[
        { label: 'A5 Printing', path: '/printing/a5' },
        { label: 'Hardcover Printing', path: '/printing/hardcover' },
        { label: "Children's Book Printing", path: '/printing/childrensbooks' },
        { label: 'Book Printing Johannesburg', path: '/bookprintingjohannesburg' },
        { label: 'Amazon KDP', path: '/amazonkdp' },
        { label: 'Get a Quote', path: '/getquote' },
      ]} light />
      <CTASection title="Ready to Print Your 6x9 Book?" description="Get a free personalised 6×9 printing quote from our Johannesburg team within 24 hours." />
    </div>
  );
}