import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, ShieldCheck, Clock } from 'lucide-react';
import PageMeta from '../shared/PageMeta';

const OTHER_DOCS = [
  { title: 'Privacy Policy', to: '/privacy-policy' },
  { title: 'Cookie Policy', to: '/cookie-policy' },
  { title: 'Terms & Conditions', to: '/terms-and-conditions' },
  { title: 'Refunds & Returns', to: '/refunds-and-returns' },
  { title: 'PAIA Manual', to: '/paia-manual' },
  { title: 'Website Disclaimer', to: '/disclaimer' },
];

/**
 * Reusable layout for all legal / compliance pages.
 * Obsidian hero banner (matching Contact), copper (#B87333) accents,
 * a card content column with a sticky "Other documents" sidebar,
 * fully responsive + print-friendly. Uses the site's existing font stack.
 */
export default function LegalPage({
  title,
  subtitle,
  lastUpdated,
  summary,
  children,
  metaTitle,
  metaDescription,
  canonical,
}) {
  return (
    <div className="bg-vellum text-neutral-800 print:bg-white">
      <PageMeta
        title={metaTitle || `${title} | Creative Books SA`}
        description={metaDescription}
        canonical={canonical}
      />

      {/* Hero banner — matches Contact page */}
      <section className="relative pt-32 pb-20 bg-obsidian overflow-hidden print:hidden">
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-copper/10 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -left-24 w-96 h-96 rounded-full bg-copper/5 blur-3xl pointer-events-none" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-2xl mx-auto"
          >
            <span className="text-copper text-sm font-body tracking-[0.25em] uppercase mb-4 block">
              Legal &amp; Compliance
            </span>
            <h1 className="font-heading text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">{title}</h1>
            {subtitle && (
              <p className="text-white/60 text-lg leading-relaxed font-body">{subtitle}</p>
            )}
            {lastUpdated && (
              <p className="mt-6 inline-flex items-center gap-2 text-sm text-white/50 font-body">
                <Clock className="w-4 h-4 text-copper" /> Last updated: {lastUpdated}
              </p>
            )}
          </motion.div>
        </div>
      </section>

      {/* Content */}
      <section className="py-14 sm:py-20 print:py-4">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <Link
            to="/legal"
            className="inline-flex items-center gap-2 text-sm font-medium text-[#B87333] hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#B87333] rounded print:hidden"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Legal &amp; Compliance
          </Link>

          <div className="mt-6 grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Main document */}
            <article className="lg:col-span-8">
              <div className="bg-white rounded-2xl border border-[#0F0F0F]/5 shadow-sm p-6 sm:p-10 print:border-0 print:shadow-none print:p-0">
                {summary && <LegalCallout>{summary}</LegalCallout>}
                <div className={`legal-body space-y-10 leading-relaxed text-[15px] sm:text-base ${summary ? 'mt-10' : ''}`}>
                  {children}
                </div>
              </div>
            </article>

            {/* Sidebar */}
            <aside className="lg:col-span-4 print:hidden">
              <div className="lg:sticky lg:top-28 space-y-5">
                <div className="bg-white rounded-2xl border border-[#0F0F0F]/5 shadow-sm p-6">
                  <h2 className="flex items-center gap-2 text-sm font-body font-semibold uppercase tracking-wider text-neutral-500 mb-4">
                    <ShieldCheck className="w-4 h-4 text-copper" /> Other Documents
                  </h2>
                  <ul className="space-y-1">
                    {OTHER_DOCS.filter((d) => d.title !== title).map((d) => (
                      <li key={d.to}>
                        <Link
                          to={d.to}
                          className="flex items-center justify-between rounded-lg px-3 py-2.5 text-sm font-body text-neutral-700 hover:bg-[#B87333]/5 hover:text-[#B87333] transition-colors group"
                        >
                          {d.title}
                          <ArrowLeft className="w-3.5 h-3.5 rotate-180 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="rounded-2xl bg-obsidian p-6 text-center">
                  <p className="text-white/70 text-sm font-body leading-relaxed mb-4">
                    Questions about our policies? We&rsquo;re happy to help.
                  </p>
                  <Link
                    to="/contact"
                    className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-copper text-white rounded-full font-medium text-sm hover:bg-copper/90 transition-colors"
                  >
                    Contact Us
                  </Link>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </section>
    </div>
  );
}

/* ── Building blocks ─────────────────────────────────────────────── */

export function LegalSection({ number, title, children }) {
  return (
    <section className="scroll-mt-24">
      <h2 className="text-xl sm:text-2xl font-bold text-neutral-900 border-l-4 border-[#B87333] pl-3">
        {number ? `${number}. ${title}` : title}
      </h2>
      <div className="mt-4 space-y-4">{children}</div>
    </section>
  );
}

export function LegalSubheading({ children }) {
  return (
    <h3 className="text-lg font-semibold text-[#B87333] mt-6">{children}</h3>
  );
}

export function LegalParagraph({ children }) {
  return <p className="text-neutral-700 leading-relaxed">{children}</p>;
}

export function LegalList({ items }) {
  return (
    <ul className="list-disc pl-6 space-y-2 text-neutral-700 marker:text-[#B87333]">
      {items.map((item, i) => (
        <li key={i} className="leading-relaxed">{item}</li>
      ))}
    </ul>
  );
}

/** Definition list: array of { term, description } */
export function LegalDefinitions({ items }) {
  return (
    <ul className="space-y-3">
      {items.map((item, i) => (
        <li key={i} className="leading-relaxed text-neutral-700">
          <span className="font-semibold text-neutral-900">{item.term}</span>{' '}
          {item.description}
        </li>
      ))}
    </ul>
  );
}

export function LegalCallout({ children, className = '' }) {
  return (
    <div
      className={`rounded-lg border-l-4 border-[#B87333] bg-[#B87333]/5 px-5 py-4 space-y-3 text-neutral-700 leading-relaxed ${className}`}
    >
      {children}
    </div>
  );
}

export function LegalContactBlock({ children }) {
  return (
    <div className="rounded-lg border border-neutral-200 bg-neutral-50 px-5 py-4 text-neutral-700 leading-relaxed space-y-1">
      {children}
    </div>
  );
}

export function LegalTable({ headers, rows }) {
  return (
    <div className="overflow-x-auto -mx-1">
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr>
            {headers.map((h, i) => (
              <th
                key={i}
                className="text-left font-semibold text-neutral-900 border-b-2 border-[#B87333] px-3 py-2"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, ri) => (
            <tr key={ri} className="border-b border-neutral-200">
              {row.map((cell, ci) => (
                <td key={ci} className="px-3 py-2 align-top text-neutral-700">{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}