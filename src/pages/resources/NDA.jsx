import React from 'react';
import PageMeta from '../../components/shared/PageMeta';
import { motion } from 'framer-motion';
import { FileText, Download, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

export default function NDA() {
  const pdfUrl = 'https://media.base44.com/files/public/69fb173eeab1ba78da6eab45/d79924247_NDA-Creative-Books-2026-.pdf';

  return (
    <div>
      <PageMeta
        title="NDA"
        description="Our standard NDA protects authors' manuscripts and ideas during the publishing process. Read the terms before submitting confidential material."
        canonical="https://www.creativebooks.co.za/nda"
      />

      {/* Hero */}
      <section className="relative pt-32 pb-20 bg-obsidian">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="text-center max-w-2xl mx-auto">
            <span className="text-copper text-sm font-body tracking-[0.25em] uppercase mb-4 block">Legal Documents</span>
            <h1 className="font-heading text-4xl md:text-5xl font-bold text-white mb-6">NDA</h1>
            <p className="text-white/60 text-lg leading-relaxed font-body">
              Protect your intellectual property and confidential information with Creative Books SA's Non-Disclosure Agreement template.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Content */}
      <section className="py-20 bg-vellum">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-white rounded-2xl border border-[#0F0F0F]/5 shadow-sm p-12 mb-12"
          >
            {/* PDF Preview Card */}
            <div className="flex items-start gap-8 mb-10">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-24 w-24 rounded-xl bg-copper/10">
                  <FileText className="h-12 w-12 text-copper" />
                </div>
              </div>
              <div className="flex-grow">
                <h2 className="font-heading text-2xl font-bold text-[#0F0F0F] mb-2">
                  Creative Books SA NDA Template
                </h2>
                <p className="text-[#0F0F0F]/60 font-body text-base mb-4 leading-relaxed">
                  This Non-Disclosure Agreement (NDA) is designed to protect all confidential information, intellectual property, and creative materials shared between Creative Books SA and our clients. It covers manuscripts, book concepts, illustrations, cover designs, marketing ideas, and related creative content.
                </p>
                <div className="space-y-2 text-sm text-[#0F0F0F]/50 font-body mb-6">
                  <p>• <strong>File Type:</strong> PDF</p>
                  <p>• <strong>Applicable Jurisdiction:</strong> South Africa</p>
                  <p>• <strong>Purpose:</strong> Confidentiality & Intellectual Property Protection</p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <motion.a
                href={pdfUrl}
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full font-medium text-white transition-all"
                style={{
                  background: 'linear-gradient(135deg, #B87333 0%, #9a6030 100%)',
                  boxShadow: '0 8px 24px rgba(184,115,51,0.3)',
                }}
              >
                <Download className="w-5 h-5" />
                Download PDF
              </motion.a>
              <motion.a
                href={pdfUrl}
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full font-medium transition-all"
                style={{
                  background: 'rgba(184,115,51,0.1)',
                  color: '#B87333',
                  border: '1.5px solid rgba(184,115,51,0.3)',
                }}
              >
                <ExternalLink className="w-5 h-5" />
                View Online
              </motion.a>
            </div>
          </motion.div>

          {/* Document Details */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-white rounded-2xl border border-[#0F0F0F]/5 shadow-sm p-12"
          >
            <h3 className="font-heading text-xl font-bold text-[#0F0F0F] mb-6">What This NDA Covers</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              <div>
                <h4 className="font-semibold text-[#0F0F0F] mb-3 text-sm tracking-[0.1em] uppercase">Confidential Information Includes:</h4>
                <ul className="space-y-2 text-sm text-[#0F0F0F]/60 font-body">
                  <li>✓ Manuscripts, drafts, and outlines</li>
                  <li>✓ Book titles, concepts, and creative ideas</li>
                  <li>✓ Artwork, illustrations, and photography</li>
                  <li>✓ Publishing strategies and marketing plans</li>
                  <li>✓ Client data and related communications</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold text-[#0F0F0F] mb-3 text-sm tracking-[0.1em] uppercase">Our Obligations:</h4>
                <ul className="space-y-2 text-sm text-[#0F0F0F]/60 font-body">
                  <li>✓ Highest degree of care and discretion</li>
                  <li>✓ Use only for publishing services</li>
                  <li>✓ No unauthorized disclosure to third parties</li>
                  <li>✓ Secure digital and physical storage</li>
                  <li>✓ Return or delete materials on request</li>
                </ul>
              </div>
            </div>

            <div className="pt-8 border-t border-[#0F0F0F]/10">
              <p className="text-[#0F0F0F]/60 font-body text-sm leading-relaxed">
                This NDA remains in force indefinitely with respect to all Confidential Information disclosed and is governed by South African law. For questions about the agreement or to request modifications, please contact our team directly.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative py-16 bg-obsidian">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h3 className="font-heading text-2xl font-bold text-white mb-4">Ready to Work With Us?</h3>
            <p className="text-white/60 font-body text-base mb-8 max-w-2xl mx-auto">
              Sign our NDA and let's start your publishing journey with complete confidentiality and trust.
            </p>
            <Link
              to="/getquote"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-full font-medium text-white transition-all"
              style={{
                background: '#B87333',
                boxShadow: '0 8px 24px rgba(184,115,51,0.3)',
              }}
            >
              Get a Free Quote
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
}