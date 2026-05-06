import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import PageMeta from '../shared/PageMeta';
import FAQSection from '../shared/FAQSection';
import CTASection from '../shared/CTASection';
import InternalLinks from '../shared/InternalLinks';

function TableBlock({ headers, rows }) {
  return (
    <div className="overflow-x-auto my-6 rounded-xl" style={{ border: '1px solid rgba(184,115,51,0.15)' }}>
      <table className="w-full text-sm font-body">
        <thead>
          <tr style={{ background: 'rgba(184,115,51,0.08)' }}>
            {headers.map((h, i) => (
              <th key={i} className="px-4 py-3 text-left text-copper font-semibold">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, ri) => (
            <tr key={ri} className={ri % 2 === 0 ? 'bg-white' : 'bg-[#F9F7F2]'}>
              {row.map((cell, ci) => (
                <td key={ci} className="px-4 py-3 text-[#0F0F0F]/80">{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function LongTailArticlePage({
  metaTitle, metaDescription, metaKeywords, canonical, schema,
  subtitle, h1, intro, sections = [], faqs = [], relatedLinks = [],
  ctaTitle, ctaDescription,
}) {
  return (
    <div>
      <PageMeta title={metaTitle} description={metaDescription} keywords={metaKeywords} canonical={canonical} schema={schema} />

      {/* Hero */}
      <section className="relative min-h-[45vh] flex items-center pt-20 bg-[#060504]">
        <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at 25% 60%, rgba(184,115,51,0.18) 0%, transparent 55%)' }} />
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 py-20">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6" style={{ background: 'rgba(184,115,51,0.1)', border: '1px solid rgba(184,115,51,0.2)' }}>
              <span className="text-copper text-sm font-medium">{subtitle}</span>
            </div>
            <h1 className="font-heading text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4 leading-tight">{h1}</h1>
            {intro && <p className="text-white/60 text-lg font-body leading-relaxed">{intro}</p>}
          </motion.div>
        </div>
      </section>

      {/* Article Body */}
      <section className="py-16 lg:py-20 bg-vellum">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="space-y-12">
            {sections.map((section, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
              >
                <h2 className="font-heading text-2xl font-bold text-[#0F0F0F] mb-4">{section.heading}</h2>
                {section.body && <p className="text-[#0F0F0F]/75 font-body leading-relaxed mb-4">{section.body}</p>}
                {section.list && (
                  <ul className="space-y-2 mb-4">
                    {section.list.map((item, li) => (
                      <li key={li} className="flex items-start gap-3 text-[#0F0F0F]/75 font-body">
                        <span className="w-1.5 h-1.5 rounded-full bg-copper mt-2 shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                )}
                {section.table && <TableBlock headers={section.table.headers} rows={section.table.rows} />}
                {section.cta && (
                  <Link to="/getquote" className="inline-flex items-center gap-2 text-copper font-medium text-sm hover:gap-3 transition-all">
                    {section.cta} <ArrowRight className="w-4 h-4" />
                  </Link>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {faqs.length > 0 && <FAQSection faqs={faqs} light />}
      <InternalLinks links={relatedLinks} title="Related Resources" light />
      <CTASection title={ctaTitle} description={ctaDescription} />
    </div>
  );
}