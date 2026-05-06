import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Check } from 'lucide-react';
import SectionHeading from '../shared/SectionHeading';

const packages = [
  {
    name: 'Mini Package',
    price: 'From R4,999',
    description: 'Perfect for first-time authors on a budget.',
    features: ['Manuscript formatting', 'Basic cover design', 'eBook conversion', 'ISBN registration'],
    link: '/minipublishingpackage',
    featured: false,
  },
  {
    name: 'Standard Package',
    price: 'From R12,999',
    description: 'Our most popular comprehensive publishing solution.',
    features: ['Professional editing', 'Custom cover design', 'Interior layout & typesetting', 'ISBN & barcode', 'Print-on-demand setup', 'eBook publishing'],
    link: '/publishingpackages',
    featured: true,
  },
  {
    name: 'Premium Package',
    price: 'From R24,999',
    description: 'Full-service publishing for ambitious authors.',
    features: ['Developmental editing', 'Premium cover design', 'Hardcover & softcover printing', 'Amazon KDP setup', 'Author website', 'Marketing consultation', 'Distribution network'],
    link: '/premiumpublishingpackage',
    featured: false,
  },
];

export default function PackagesPreview() {
  return (
    <section className="py-20 lg:py-28 bg-obsidian">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <SectionHeading
          subtitle="Publishing Packages"
          title="Flexible Packages for Every Author"
          description="Choose the publishing journey that fits your vision and budget."
          light
        />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {packages.map((pkg, i) => (
            <motion.div
              key={pkg.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15 }}
              className={`relative rounded-2xl p-8 ${
                pkg.featured
                  ? 'bg-copper/10 border-2 border-copper/30'
                  : 'bg-white/5 border border-white/10'
              }`}
            >
              {pkg.featured && (
                <div className="absolute -top-3 left-8 px-4 py-1 bg-copper text-white text-xs font-medium rounded-full">
                  Most Popular
                </div>
              )}
              <h3 className="font-heading text-xl font-bold text-white mb-1">{pkg.name}</h3>
              <p className="text-copper font-heading text-2xl font-bold mb-3">{pkg.price}</p>
              <p className="text-white/50 text-sm mb-6 font-body">{pkg.description}</p>
              <ul className="space-y-3 mb-8">
                {pkg.features.map((f) => (
                  <li key={f} className="flex items-start gap-3 text-sm text-white/70 font-body">
                    <Check className="w-4 h-4 text-copper shrink-0 mt-0.5" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link to={pkg.link}
                className={`group inline-flex items-center justify-center gap-2 w-full px-6 py-3.5 rounded-full font-medium text-sm transition-all ${
                  pkg.featured
                    ? 'bg-copper text-white hover:bg-copper/90 shadow-lg shadow-copper/20'
                    : 'border border-white/20 text-white hover:border-copper hover:text-copper'
                }`}>
                Learn More <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}