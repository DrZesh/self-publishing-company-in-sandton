import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Star } from 'lucide-react';

const pkgs = [
  {
    name: 'Full Publishing Packages A5',
    desc: 'A complete publishing solution for authors who want a professional A5 book package with editing, design and print.',
    label: 'View A5 Packages',
    to: '/publishingpackages/a5',
    featured: false,
    tag: 'A5 Format',
  },
  {
    name: 'Full Publishing Packages 6×9',
    desc: 'Ideal for novels, memoirs, business books, non-fiction books and inspirational titles in the popular 6×9 format.',
    label: 'View 6×9 Packages',
    to: '/publishingpackages/6x9',
    featured: true,
    tag: 'Most Popular',
  },
  {
    name: 'Mini Publishing Packages',
    desc: 'A simpler package option for authors who need selected publishing support without committing to a full package.',
    label: 'View Mini Packages',
    to: '/publishingpackages/mini',
    featured: false,
    tag: 'Starter',
  },
];

export default function PublishingPackagesSection() {
  return (
    <section className="py-20 lg:py-28 bg-[#101826]" aria-labelledby="packages-heading">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <span className="text-[#B8955B] text-xs font-body tracking-[0.25em] uppercase mb-3 block">Publishing Packages</span>
          <h2 id="packages-heading" className="font-heading text-3xl md:text-4xl font-bold text-white mb-4">
            Publishing Packages for Every Stage of Your Book Journey
          </h2>
          <p className="text-white/55 max-w-2xl mx-auto font-body text-base leading-relaxed">
            Choose a publishing package that matches your book size, budget and production needs.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {pkgs.map((pkg, i) => (
            <motion.div
              key={pkg.name}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              whileHover={{ y: -5, transition: { duration: 0.25 } }}
              className={`relative rounded-2xl p-8 flex flex-col border ${
                pkg.featured
                  ? 'border-[#B8955B]/60 bg-[#B8955B]/8'
                  : 'border-white/10 bg-white/5'
              }`}
            >
              {pkg.featured && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-[#B8955B] text-white text-xs font-medium rounded-full">
                    <Star className="w-3 h-3 fill-white" />
                    {pkg.tag}
                  </span>
                </div>
              )}
              {!pkg.featured && (
                <span className="text-[#B8955B]/70 text-xs font-body tracking-widest uppercase mb-3 block">{pkg.tag}</span>
              )}
              {pkg.featured && <div className="mb-8" />}
              <h3 className="font-heading text-xl font-bold text-white mb-3 leading-snug">{pkg.name}</h3>
              <p className="text-white/55 font-body text-sm leading-relaxed flex-1 mb-8">{pkg.desc}</p>
              <Link
                to={pkg.to}
                className={`inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full font-medium text-sm transition-all group ${
                  pkg.featured
                    ? 'bg-[#B8955B] text-white hover:bg-[#B8955B]/90 shadow-lg shadow-[#B8955B]/25'
                    : 'border border-white/20 text-white hover:border-[#B8955B] hover:text-[#B8955B]'
                }`}
              >
                {pkg.label}
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mt-10"
        >
          <Link
            to="/getquote"
            className="text-sm text-[#B8955B] hover:text-white transition-colors font-body underline underline-offset-4"
          >
            Not sure which package suits your book? Request a custom quote →
          </Link>
        </motion.div>
      </div>
    </section>
  );
}