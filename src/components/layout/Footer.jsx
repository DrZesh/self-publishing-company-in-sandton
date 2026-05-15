import React from 'react';
import { Link } from 'react-router-dom';
import { Phone, Mail, MapPin, ArrowUpRight } from 'lucide-react';
import { motion } from 'framer-motion';

const footerSilos = [
  {
    title: 'Printing Services',
    links: [
      { label: 'Book Printing SA', path: '/bookprinting' },
      { label: 'A5 Book Printing', path: '/printing/a5' },
      { label: '6×9 Book Printing', path: '/printing/6x9' },
      { label: 'Hardcover Printing', path: '/printing/hardcover' },
      { label: 'Softcover Printing', path: '/softcoverprinting' },
      { label: "Children's Book Printing", path: '/printing/childrensbooks' },
      { label: 'Workbook Printing', path: '/workbookprinting' },
      { label: 'Novel Printing JHB', path: '/novelprintingjohannesburg' },
      { label: 'Cookbook Printing', path: '/cookbookprintingjohannesburg' },
      { label: 'Training Manual Printing', path: '/trainingmanualprintingjohannesburg' },
    ]
  },
  {
    title: 'Publishing Services',
    links: [
      { label: 'Book Publishing', path: '/bookpublishing' },
      { label: 'Self Publishing SA', path: '/selfpublishingsouthafrica' },
      { label: 'Publishing Packages', path: '/publishingpackages' },
      { label: 'eBook Publishing', path: '/ebookpublishing' },
      { label: 'Amazon KDP', path: '/amazonkdp' },
      { label: "Children's Book Publishing", path: '/childrensbookpublishing' },
      { label: 'Christian Book Publishing', path: '/christianbookpublishing' },
      { label: 'Memoir Publishing', path: '/memoirpublishing' },
      { label: 'Poetry Publishing', path: '/poetrypublishing' },
      { label: 'Business Book Publishing', path: '/businessbookpublishing' },
    ]
  },
  {
    title: 'Editing & Design',
    links: [
      { label: 'Book Editing', path: '/bookediting' },
      { label: 'Proofreading SA', path: '/proofreadingservicessouthafrica' },
      { label: 'Copy Editing', path: '/copyediting' },
      { label: 'Thesis Editing', path: '/thesisediting' },
      { label: 'Book Cover Design', path: '/bookcoverdesign' },
      { label: 'Book Typesetting', path: '/typesetting' },
      { label: 'Book Layout Design', path: '/booklayoutdesign' },
      { label: 'Ghostwriting', path: '/ghostwriting' },
      { label: 'Ghostwriters SA', path: '/ghostwriterssouthafrica' },
      { label: 'Annual Report Design', path: '/annualreportdesignsandton' },
    ]
  },
  {
    title: 'Book Sizes',
    links: [
      { label: 'A5 Format', path: '/printing/a5' },
      { label: '6×9 Format', path: '/printing/6x9' },
      { label: 'Hardcover', path: '/printing/hardcover' },
      { label: '15×15cm Square', path: '/printing/childrensbooks/15cmx15cm' },
      { label: '20×20cm Square', path: '/printing/childrensbooks/20cmx20cm' },
      { label: '21×21cm Square', path: '/printing/childrensbooks/21cmx21cm' },
      { label: 'A5 vs 6×9 Guide', path: '/a5vs6x9bookprinting' },
      { label: 'Best Book Size Guide', path: '/bestbooksizeforselfpublishing' },
      { label: 'Hardcover vs Paperback', path: '/hardcovervspaperbackprinting' },
      { label: 'Printing Cost Calculator', path: '/bookprintingcalculator' },
    ]
  },

  {
    title: 'Resources & Guides',
    links: [
      { label: 'How to Print a Book', path: '/howtoprintabookinsouthafrica' },
      { label: 'How to Self Publish', path: '/howtoselfpublishabook' },
      { label: 'Book Printing Costs', path: '/howmuchdoesbookprintingcost' },
      { label: 'Best Book Size Guide', path: '/bestbooksizeforselfpublishing' },
      { label: 'A5 vs 6×9', path: '/a5vs6x9bookprinting' },
      { label: 'Hardcover vs Paperback', path: '/hardcovervspaperbackprinting' },
      { label: 'ISBN Registration', path: '/isbnregistration' },
      { label: 'Publishing Guide', path: '/publishingguide' },
      { label: 'Blog', path: '/blog' },
      { label: 'FAQ', path: '/faq' },
    ]
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.05 } }
};
const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] } }
};

export default function Footer() {
  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  return (
    <footer className="relative overflow-hidden">
      <div className="absolute inset-0 bg-[#060504]" />
      <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at 20% 0%, rgba(184,115,51,0.08) 0%, transparent 50%)' }} />
      <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at 80% 100%, rgba(184,115,51,0.05) 0%, transparent 40%)' }} />

      {/* Main Footer */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-16 lg:py-20">
        <motion.div variants={containerVariants} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }}>

          {/* Brand Row */}
          <motion.div variants={itemVariants} className="flex flex-col md:flex-row md:items-start md:justify-between gap-8 pb-12 mb-12" style={{ borderBottom: '1px solid rgba(184,115,51,0.1)' }}>
            <div className="max-w-xs">
              <div className="flex items-center gap-3 mb-4">
                <motion.div whileHover={{ scale: 1.05, rotate: 5 }} className="w-12 h-12 rounded-full bg-gradient-to-br from-copper to-[#8a5a2a] flex items-center justify-center shadow-lg shadow-copper/20">
                  <span className="text-white font-heading font-bold text-xl">C</span>
                </motion.div>
                <div>
                  <span className="text-white font-heading text-lg font-semibold">Creative Books</span>
                  <span className="text-copper text-xs block tracking-[0.3em] uppercase">South Africa</span>
                </div>
              </div>
              <p className="text-white/50 text-sm leading-relaxed">
                South Africa's premier publishing and printing company. Professional book printing, publishing, editing, and design services from Johannesburg to Cape Town.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <motion.a href="tel:0105003331" whileHover={{ x: 4 }} className="flex items-center gap-3 p-3 rounded-xl text-white/70 hover:text-copper transition-all" style={{ background: 'rgba(184,115,51,0.05)', border: '1px solid rgba(184,115,51,0.1)' }}>
                 <Phone className="w-4 h-4 text-copper" /> <span className="text-sm">010 500 3331</span>
               </motion.a>
               <motion.a href="tel:+27842305393" whileHover={{ x: 4 }} className="flex items-center gap-3 p-3 rounded-xl text-white/70 hover:text-copper transition-all" style={{ background: 'rgba(184,115,51,0.05)', border: '1px solid rgba(184,115,51,0.1)' }}>
                 <Phone className="w-4 h-4 text-copper" /> <span className="text-sm">+27 84 230 5393</span>
               </motion.a>
               <motion.a href="mailto:info@creativebooks.co.za" whileHover={{ x: 4 }} className="flex items-center gap-3 p-3 rounded-xl text-white/70 hover:text-copper transition-all" style={{ background: 'rgba(184,115,51,0.05)', border: '1px solid rgba(184,115,51,0.1)' }}>
                 <Mail className="w-4 h-4 text-copper" /> <span className="text-sm">info@creativebooks.co.za</span>
               </motion.a>
              <motion.div whileHover={{ x: 4 }} className="flex items-center gap-3 p-3 rounded-xl text-white/70" style={{ background: 'rgba(184,115,51,0.05)', border: '1px solid rgba(184,115,51,0.1)' }}>
                <MapPin className="w-4 h-4 text-copper shrink-0" /> <span className="text-sm">Johannesburg, Gauteng</span>
              </motion.div>
            </div>
          </motion.div>

          {/* Silo Columns */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-8">
            {footerSilos.map((silo) => (
              <motion.div key={silo.title} variants={itemVariants}>
                <h4 className="text-white font-heading text-xs font-semibold mb-4 tracking-wider uppercase flex items-center gap-2">
                  <span className="w-4 h-px bg-copper" />
                  {silo.title}
                </h4>
                <ul className="space-y-1.5">
                  {silo.links.map((link) => (
                    <li key={link.path}>
                      <Link to={link.path} onClick={scrollToTop} className="group text-xs text-white/45 hover:text-copper transition-colors flex items-center gap-1">
                        {link.label}
                        <ArrowUpRight className="w-2.5 h-2.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </Link>
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Bottom Bar */}
      <div className="relative" style={{ borderTop: '1px solid rgba(184,115,51,0.1)' }}>
        <div className="absolute inset-0" style={{ background: 'rgba(184,115,51,0.02)', backdropFilter: 'blur(8px)' }} />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <p className="text-white/40">&copy; {new Date().getFullYear()} Creative Books SA. All rights reserved. Johannesburg, South Africa.</p>
          <div className="flex items-center gap-6">
            {[
              { label: 'About', to: '/aboutus' },
              { label: 'Portfolio', to: '/portfolio' },
              { label: 'Contact', to: '/contact' },
              { label: 'Get Quote', to: '/getquote' },
              { label: 'Printing Calculator', to: '/bookprintingcalculator' },
            ].map((item) => (
              <Link key={item.to} to={item.to} onClick={scrollToTop} className="text-white/40 hover:text-copper transition-colors">
                {item.label}
              </Link>
            ))}

          </div>
        </div>
      </div>
    </footer>
  );
}