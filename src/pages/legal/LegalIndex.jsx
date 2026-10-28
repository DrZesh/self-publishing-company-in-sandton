import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Shield, Cookie, FileText, RefreshCcw, FolderLock, Info, ArrowRight } from 'lucide-react';
import PageMeta from '@/components/shared/PageMeta';

const DOCS = [
  { title: 'Privacy Policy', to: '/privacy-policy', icon: Shield, desc: 'What we collect, why, who we share it with, and your rights.' },
  { title: 'Cookie Policy', to: '/cookie-policy', icon: Cookie, desc: 'The cookies the site uses and how to control them.' },
  { title: 'Terms & Conditions', to: '/terms-and-conditions', icon: FileText, desc: 'How quotes, orders, payment and liability work.' },
  { title: 'Refunds & Returns', to: '/refunds-and-returns', icon: RefreshCcw, desc: 'When returns, reprints and refunds apply.' },
  { title: 'PAIA Manual', to: '/paia-manual', icon: FolderLock, desc: 'What records we hold and how to request access.' },
  { title: 'Website Disclaimer', to: '/disclaimer', icon: Info, desc: 'Limits on the use of the site and its content.' },
];

export default function LegalIndex() {
  return (
    <div className="bg-vellum text-neutral-800">
      <PageMeta
        title="Legal & Compliance | Creative Books SA"
        description="Creative Books SA legal and compliance documents — Privacy Policy, Cookie Policy, Terms & Conditions, Refunds & Returns, PAIA Manual and Website Disclaimer."
        canonical="https://creativebooks.co.za/legal"
      />

      {/* Hero banner — matches Contact page */}
      <section className="relative pt-32 pb-20 bg-obsidian overflow-hidden">
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-copper/10 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -left-24 w-96 h-96 rounded-full bg-copper/5 blur-3xl pointer-events-none" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-2xl mx-auto"
          >
            <span className="text-copper text-sm font-body tracking-[0.25em] uppercase mb-4 block">Legal &amp; Compliance</span>
            <h1 className="font-heading text-4xl md:text-5xl font-bold text-white mb-6">Our Policies &amp; Legal Documents</h1>
            <p className="text-white/60 text-lg leading-relaxed font-body">
              In line with South African law. Read together, they explain how we work with you and how we handle your information.
            </p>
          </motion.div>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-14 sm:py-20">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {DOCS.map(({ title, to, icon: Icon, desc }) => (
            <Link
              key={to}
              to={to}
              className="group block rounded-2xl border border-[#0F0F0F]/5 bg-white p-6 shadow-sm transition-all hover:-translate-y-0.5 hover:border-[#B87333] hover:shadow-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#B87333]"
            >
              <div className="flex items-start gap-4">
                <span className="flex-shrink-0 flex items-center justify-center w-11 h-11 rounded-lg bg-[#B87333]/10 text-[#B87333]">
                  <Icon className="w-5 h-5" />
                </span>
                <div className="min-w-0">
                  <h2 className="text-lg font-semibold text-neutral-900 group-hover:text-[#B87333] transition-colors flex items-center gap-1">
                    {title}
                    <ArrowRight className="w-4 h-4 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                  </h2>
                  <p className="mt-1 text-sm text-neutral-600 leading-relaxed">{desc}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}