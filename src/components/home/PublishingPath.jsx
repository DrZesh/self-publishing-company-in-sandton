import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Printer, PenLine, Package, Tablet, ArrowRight } from 'lucide-react';

const paths = [
  {
    icon: Printer,
    title: 'I Need to Print My Book',
    desc: 'For authors with a completed manuscript or print-ready files who need professional physical copies.',
    label: 'View Book Printing',
    to: '/bookprinting',
    accent: '#101826',
  },
  {
    icon: PenLine,
    title: 'I Need Help Preparing My Manuscript',
    desc: 'For authors who need editing, proofreading, manuscript evaluation or writing support.',
    label: 'View Editing Services',
    to: '/bookediting',
    accent: '#B8955B',
  },
  {
    icon: Package,
    title: 'I Need a Complete Publishing Package',
    desc: 'For authors who want editing, cover design, layout and printing support combined.',
    label: 'View Publishing Packages',
    to: '/publishingpackages',
    accent: '#101826',
  },
  {
    icon: Tablet,
    title: 'I Need to Publish Online',
    desc: 'For authors who need ebook formatting, Amazon publishing support or an author website.',
    label: 'View Ebook and Website Services',
    to: '/ebookpublishing',
    accent: '#B8955B',
  },
];

export default function PublishingPath() {
  return (
    <section className="py-20 lg:py-28 bg-[#F8F5EF]" aria-labelledby="path-heading">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <span className="text-[#B8955B] text-xs font-body tracking-[0.25em] uppercase mb-3 block">Your Publishing Journey</span>
          <h2 id="path-heading" className="font-heading text-3xl md:text-4xl font-bold text-[#101826] mb-4">
            Choose the Right Publishing Support for Your Book
          </h2>
          <p className="text-[#2B2B2B]/60 max-w-2xl mx-auto font-body text-base leading-relaxed">
            Every author's journey is different. Choose the option that best matches where you are in your publishing process.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {paths.map((p, i) => {
            const Icon = p.icon;
            return (
              <motion.div
                key={p.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                whileHover={{ y: -4, transition: { duration: 0.25 } }}
                className="bg-white rounded-2xl p-7 flex flex-col shadow-sm border border-[#E8D8B8]/60 group"
              >
                <div className="w-12 h-12 rounded-xl bg-[#B8955B]/10 flex items-center justify-center mb-5 group-hover:bg-[#B8955B]/20 transition-colors">
                  <Icon className="w-6 h-6 text-[#B8955B]" />
                </div>
                <h3 className="font-heading text-base font-bold text-[#101826] mb-3 leading-snug">{p.title}</h3>
                <p className="text-sm text-[#2B2B2B]/60 font-body leading-relaxed flex-1 mb-6">{p.desc}</p>
                <Link
                  to={p.to}
                  className="inline-flex items-center gap-2 text-sm font-medium text-[#B8955B] hover:text-[#101826] transition-colors group/link"
                >
                  {p.label}
                  <ArrowRight className="w-4 h-4 group-hover/link:translate-x-1 transition-transform" />
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}