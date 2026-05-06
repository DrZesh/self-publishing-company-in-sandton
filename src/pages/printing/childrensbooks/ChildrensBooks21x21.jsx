import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import Breadcrumbs from '../../../components/shared/Breadcrumbs';
import CTASection from '../../../components/shared/CTASection';
import InternalLinks from '../../../components/shared/InternalLinks';

export default function ChildrensBooks21x21() {
  return (
    <div>
      <section className="relative min-h-[50vh] flex items-center pt-20 bg-obsidian">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 30% 60%, #B87333 0%, transparent 50%)' }} />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-20">
          <Breadcrumbs light items={[
            { label: 'Printing', path: '/printing/a5' },
            { label: "Children's Book Printing", path: '/printing/childrensbooks' },
            { label: '21cm × 21cm', path: '/printing/childrensbooks/21cmx21cm' },
          ]} />
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }} className="max-w-2xl mt-4">
            <span className="text-copper text-sm font-body font-medium tracking-[0.25em] uppercase mb-4 block">Children's Book Printing</span>
            <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">Children's Book Printing 21cm × 21cm</h1>
            <p className="text-white/60 text-lg leading-relaxed font-body mb-8">
              Large-format 21cm × 21cm square printing for detailed illustrations, full-colour spreads, and premium children's picture books.
            </p>
            <Link to="/getquote" className="group inline-flex items-center gap-2 px-7 py-3.5 bg-copper text-white font-medium rounded-full hover:bg-copper/90 transition-all shadow-lg shadow-copper/20">
              Get a Free Quote <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>
        </div>
      </section>

      <section className="py-20 lg:py-28 bg-vellum">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="bg-white rounded-3xl p-12 border border-[#0F0F0F]/5 text-center shadow-sm">
            <div className="w-16 h-16 rounded-2xl bg-copper/10 flex items-center justify-center mx-auto mb-6">
              <span className="text-copper font-heading font-bold text-xs">21×21</span>
            </div>
            <h2 className="font-heading text-2xl md:text-3xl font-bold text-[#0F0F0F] mb-4">21cm × 21cm — Content Coming Soon</h2>
            <p className="text-[#0F0F0F]/50 font-body max-w-lg mx-auto">
              Specifications, paper options, binding types, and pricing for this size will be added here. Contact us for a personalised quote.
            </p>
          </motion.div>
        </div>
      </section>

      <InternalLinks links={[
        { label: "Children's Books — 15cm × 15cm", path: '/printing/childrensbooks/15cmx15cm' },
        { label: "Children's Books — 20cm × 20cm", path: '/printing/childrensbooks/20cmx20cm' },
        { label: "All Children's Book Printing", path: '/printing/childrensbooks' },
        { label: 'Book Cover Design', path: '/bookcoverdesign' },
        { label: 'Get a Quote', path: '/getquote' },
      ]} light />
      <CTASection title="Print Your 21cm × 21cm Children's Book" description="Get a personalised quote for your 21cm × 21cm children's book from our Johannesburg team." />
    </div>
  );
}