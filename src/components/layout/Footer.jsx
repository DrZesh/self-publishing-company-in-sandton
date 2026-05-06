import React from 'react';
import { Link } from 'react-router-dom';
import { Phone, Mail, MapPin, MessageCircle, ArrowUpRight } from 'lucide-react';
import { motion } from 'framer-motion';

const footerSilos = [
  {
    title: 'Publishing',
    links: [
      { label: 'Book Publishing', path: '/bookpublishing' },
      { label: 'Self Publishing SA', path: '/selfpublishingsouthafrica' },
      { label: 'Christian Book Publishing', path: '/christianbookpublishing' },
      { label: 'Memoir Publishing', path: '/memoirpublishing' },
      { label: 'Poetry Publishing', path: '/poetrypublishing' },
      { label: 'Business Book Publishing', path: '/businessbookpublishing' },
      { label: 'Publishers in South Africa', path: '/bookpublisherssouthafrica' },
      { label: 'Publishing Companies SA', path: '/publishingcompaniessouthafrica' },
      { label: 'Publishing Packages', path: '/publishingpackages' },
      { label: 'eBook Publishing', path: '/ebookpublishing' },
    ]
  },
  {
    title: 'Printing',
    links: [
      { label: 'Book Printing', path: '/bookprinting' },
      { label: 'Book Printing Johannesburg', path: '/bookprintingjohannesburg' },
      { label: 'A5 Book Printing', path: '/a5bookprinting' },
      { label: '6×9 Book Printing', path: '/6x9bookprinting' },
      { label: 'Hardcover Printing', path: '/hardcoverprinting' },
      { label: 'Softcover Printing', path: '/softcoverprinting' },
      { label: "Children's Book Printing", path: '/childrensbookprinting' },
      { label: 'Workbook Printing', path: '/workbookprinting' },
      { label: 'Comic Book Printing', path: '/comicbookprinting' },
      { label: 'Manual Printing', path: '/manualprinting' },
    ]
  },
  {
    title: 'Editing & Design',
    links: [
      { label: 'Annual Report Design Sandton', path: '/annualreportdesignsandton' },
      { label: 'Book Editing', path: '/bookediting' },
      { label: 'Technical Editing', path: '/technicalediting' },
      { label: 'Language Editing', path: '/languageediting' },
      { label: 'Proofreading Services SA', path: '/proofreadingservicessouthafrica' },
      { label: 'Book Cover Design', path: '/bookcoverdesign' },
      { label: 'Cover Design South Africa', path: '/bookcoverdesignsouthafrica' },
      { label: 'Ghostwriters South Africa', path: '/ghostwriterssouthafrica' },
    ]
  },
  {
    title: 'Resources',
    links: [
      { label: 'ISBN Registration', path: '/isbnregistration' },
      { label: 'Best Publishers SA', path: '/bestpublishingcompaniesinsouthafrica' },
      { label: 'How to Publish a Book', path: '/howtopublishabook' },
      { label: 'Blog', path: '/blog' },
      { label: 'FAQ', path: '/faq' },
    ]
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] } }
};

export default function Footer() {
  return (
    <footer className="relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 bg-[#060504]" />
      <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at 20% 0%, rgba(184,115,51,0.08) 0%, transparent 50%)' }} />
      <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at 80% 100%, rgba(184,115,51,0.05) 0%, transparent 40%)' }} />

      {/* Main Footer */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-16 lg:py-20">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-10"
        >
          {/* Brand Column */}
          <motion.div variants={itemVariants} className="lg:col-span-2">
            <div className="flex items-center gap-3 mb-6">
              <motion.div
                whileHover={{ scale: 1.05, rotate: 5 }}
                className="w-12 h-12 rounded-full bg-gradient-to-br from-copper to-[#8a5a2a] flex items-center justify-center shadow-lg shadow-copper/20"
              >
                <span className="text-white font-heading font-bold text-xl">C</span>
              </motion.div>
              <div>
                <span className="text-white font-heading text-lg font-semibold">Creative Books</span>
                <span className="text-copper text-xs block tracking-[0.3em] uppercase">South Africa</span>
              </div>
            </div>
            <p className="text-white/50 text-sm leading-relaxed mb-6 max-w-xs">
              South Africa's premier publishing company. We bring your story to life with professional publishing, printing, editing, and design services.
            </p>

            {/* Contact info with glass cards */}
            <div className="space-y-3 text-sm">
              <motion.a
                href="tel:+27000000000"
                whileHover={{ x: 4 }}
                className="flex items-center gap-3 p-3 rounded-xl text-white/70 hover:text-copper transition-all"
                style={{ background: 'rgba(184,115,51,0.05)', border: '1px solid rgba(184,115,51,0.1)' }}
              >
                <Phone className="w-4 h-4 text-copper" /> +27 (0) 00 000 0000
              </motion.a>
              <motion.a
                href="mailto:info@creativebookssa.co.za"
                whileHover={{ x: 4 }}
                className="flex items-center gap-3 p-3 rounded-xl text-white/70 hover:text-copper transition-all"
                style={{ background: 'rgba(184,115,51,0.05)', border: '1px solid rgba(184,115,51,0.1)' }}
              >
                <Mail className="w-4 h-4 text-copper" /> info@creativebookssa.co.za
              </motion.a>
              <motion.div
                whileHover={{ x: 4 }}
                className="flex items-center gap-3 p-3 rounded-xl text-white/70"
                style={{ background: 'rgba(184,115,51,0.05)', border: '1px solid rgba(184,115,51,0.1)' }}
              >
                <MapPin className="w-4 h-4 text-copper shrink-0" /> Johannesburg, Gauteng
              </motion.div>
            </div>
          </motion.div>

          {/* Silo Columns */}
          {footerSilos.map((silo, idx) => (
            <motion.div key={silo.title} variants={itemVariants}>
              <h4 className="text-white font-heading text-sm font-semibold mb-4 tracking-wider uppercase flex items-center gap-2">
                <span className="w-6 h-px bg-copper" />
                {silo.title}
              </h4>
              <ul className="space-y-2">
                {silo.links.map((link) => (
                  <li key={link.path}>
                    <Link
                      to={link.path}
                      className="group text-sm text-white/50 hover:text-copper transition-colors flex items-center gap-1"
                    >
                      {link.label}
                      <ArrowUpRight className="w-3 h-3 opacity-0 -translate-y-1 translate-x-1 group-hover:opacity-100 group-hover:translate-y-0 group-hover:translate-x-0 transition-all" />
                    </Link>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* Bottom Bar with glassmorphism */}
      <div className="relative" style={{ borderTop: '1px solid rgba(184,115,51,0.1)' }}>
        <div
          className="absolute inset-0"
          style={{ background: 'rgba(184,115,51,0.02)', backdropFilter: 'blur(8px)' }}
        />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <p className="text-white/40">&copy; {new Date().getFullYear()} Creative Books SA. All rights reserved.</p>
          <div className="flex items-center gap-6">
            {[
              { label: 'About', to: '/aboutus' },
              { label: 'Contact', to: '/contact' },
              { label: 'Get Quote', to: '/getquote' },
            ].map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className="text-white/40 hover:text-copper transition-colors relative group"
              >
                {item.label}
                <span className="absolute -bottom-1 left-0 w-full h-px bg-copper scale-x-0 group-hover:scale-x-100 transition-transform origin-left" />
              </Link>
            ))}
            <motion.a
              href="https://wa.me/27000000000"
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.2 }}
              className="text-white/40 hover:text-green-500 transition-colors"
            >
              <MessageCircle className="w-4 h-4" />
            </motion.a>
          </div>
        </div>
      </div>
    </footer>
  );
}