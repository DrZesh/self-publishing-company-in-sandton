import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  BookOpen, Printer, PenLine, Palette, AlignLeft, BookMarked,
  BookCopy, FileText, BookText, Feather, Heart, Cross,
  Globe, Smartphone, Hash, Package, ArrowRight
} from 'lucide-react';

const services = [
  {
    icon: BookOpen,
    title: 'Self Publishing',
    desc: 'Publish your book on your terms. Keep 100% of your rights and royalties with our complete self-publishing service.',
    link: '/selfpublishing',
    aria: 'Self publishing services South Africa',
  },
  {
    icon: Printer,
    title: 'Book Printing',
    desc: 'Professional offset and digital book printing in Johannesburg. Hardcover, softcover, full-colour and black & white.',
    link: '/bookprinting',
    aria: 'Book printing services South Africa',
  },
  {
    icon: PenLine,
    title: 'Book Editing',
    desc: 'Expert proofreading, copy editing, and developmental editing by South Africa\'s most experienced book editors.',
    link: '/bookediting',
    aria: 'Book editing services South Africa',
  },
  {
    icon: Palette,
    title: 'Book Cover Design',
    desc: 'Award-quality cover design that commands attention. Three custom concepts, unlimited revisions, print and digital ready.',
    link: '/bookcoverdesign',
    aria: 'Book cover design services South Africa',
  },
  {
    icon: AlignLeft,
    title: 'Layout & Typesetting',
    desc: 'Beautifully typeset interiors that meet international publishing standards for print and digital formats.',
    link: '/typesetting',
    aria: 'Book typesetting and layout design',
  },
  {
    icon: BookMarked,
    title: "Children's Book Publishing",
    desc: 'Full-colour children\'s book publishing with illustration coordination, age-appropriate design, and quality printing.',
    link: '/childrensbookpublishing',
    aria: "Children's book publishing South Africa",
  },
  {
    icon: BookCopy,
    title: 'Hardcover Printing',
    desc: 'Premium hardcover book printing for prestige editions, commemorative books, and corporate gifts.',
    link: '/hardcoverprinting',
    aria: 'Hardcover book printing South Africa',
  },
  {
    icon: FileText,
    title: 'A5 Book Printing',
    desc: 'The most popular South African book format. Perfect for novels, poetry, memoirs, and general non-fiction.',
    link: '/a5bookprinting',
    aria: 'A5 book printing South Africa',
  },
  {
    icon: BookText,
    title: '6×9 Book Printing',
    desc: 'The international trade standard for Amazon KDP and global distribution. Ideal for business books.',
    link: '/6x9bookprinting',
    aria: '6x9 book printing South Africa',
  },
  {
    icon: Feather,
    title: 'Poetry Publishing',
    desc: 'Beautifully crafted poetry collections with thoughtful typesetting, cover design, and print and digital options.',
    link: '/poetrypublishing',
    aria: 'Poetry book publishing South Africa',
  },
  {
    icon: Heart,
    title: 'Memoir Publishing',
    desc: 'Preserve your life story. Professional memoir writing assistance, editing, design, and full publishing support.',
    link: '/memoirpublishing',
    aria: 'Memoir publishing South Africa',
  },
  {
    icon: Cross,
    title: 'Christian Book Publishing',
    desc: 'Publish your faith-based book with sensitivity and excellence. Specialised design and distribution for Christian titles.',
    link: '/christianbookpublishing',
    aria: 'Christian book publishing South Africa',
  },
  {
    icon: Globe,
    title: 'Author Website Design',
    desc: 'Professional author websites that build your brand, grow your readership, and help you sell more books online.',
    link: '/authorwebsites',
    aria: 'Author website design South Africa',
  },
  {
    icon: Smartphone,
    title: 'Ebook Formatting',
    desc: 'Professionally formatted ePub and Kindle files ready for Amazon KDP, Apple Books, and global ebook platforms.',
    link: '/ebookformatting',
    aria: 'Ebook formatting services South Africa',
  },
  {
    icon: Hash,
    title: 'ISBN Assistance',
    desc: 'We handle your ISBN registration, barcode generation, and national book registration so you can focus on writing.',
    link: '/isbnregistration',
    aria: 'ISBN registration South Africa',
  },
  {
    icon: Package,
    title: 'Publishing Packages',
    desc: 'All-inclusive publishing packages from R4,999. Editing, design, print, and distribution — one price, zero stress.',
    link: '/publishingpackages',
    aria: 'Book publishing packages South Africa',
  },
];

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] } },
};

export default function ServicesGrid() {
  return (
    <section className="py-24 lg:py-32 bg-vellum" aria-labelledby="services-heading">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">

        {/* Section heading */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="inline-block text-copper text-xs font-mono tracking-[0.3em] uppercase mb-4">
            Our Services
          </span>
          <h2 id="services-heading" className="font-heading text-4xl md:text-5xl font-bold text-[#0F0F0F] mb-5 leading-tight">
            Our Publishing and<br className="hidden sm:block" /> Printing Services
          </h2>
          <p className="text-[#0F0F0F]/55 text-base font-body max-w-2xl mx-auto leading-relaxed">
            Explore our professional self-publishing, book printing, editing, design, and author support services created to help authors publish with confidence.
          </p>
        </motion.div>

        {/* Cards grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-60px' }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
        >
          {services.map((svc) => (
            <ServiceCard key={svc.title} svc={svc} />
          ))}
        </motion.div>
      </div>
    </section>
  );
}

function ServiceCard({ svc }) {
  const Icon = svc.icon;

  return (
    <motion.article variants={cardVariants}>
      <Link
        to={svc.link}
        aria-label={svc.aria}
        className="group flex flex-col h-full p-8 rounded-2xl transition-all duration-300 hover:-translate-y-1"
        style={{
          background: 'rgba(255,255,255,0.55)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid rgba(184,115,51,0.12)',
          boxShadow: '0 4px 24px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.8)',
          minHeight: '280px',
        }}
        onMouseEnter={e => {
          e.currentTarget.style.background = 'rgba(255,255,255,0.75)';
          e.currentTarget.style.border = '1px solid rgba(184,115,51,0.4)';
          e.currentTarget.style.boxShadow = '0 16px 48px rgba(0,0,0,0.1), 0 0 0 0 transparent, inset 0 1px 0 rgba(255,255,255,0.9)';
        }}
        onMouseLeave={e => {
          e.currentTarget.style.background = 'rgba(255,255,255,0.55)';
          e.currentTarget.style.border = '1px solid rgba(184,115,51,0.12)';
          e.currentTarget.style.boxShadow = '0 4px 24px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.8)';
        }}
      >
        {/* Icon */}
        <div
          className="w-14 h-14 rounded-xl flex items-center justify-center mb-6 transition-colors duration-300 group-hover:bg-copper/15"
          style={{ background: 'rgba(184,115,51,0.08)' }}
          aria-hidden="true"
        >
          <Icon className="w-6 h-6 text-copper" />
        </div>

        {/* Title */}
        <h3 className="font-heading text-[1.05rem] font-semibold text-[#0F0F0F] mb-2 leading-snug group-hover:text-copper transition-colors duration-200">
          {svc.title}
        </h3>

        {/* Description */}
        <p className="text-[#0F0F0F]/55 text-sm font-body leading-relaxed flex-1 mb-7">
          {svc.desc}
        </p>

        {/* Learn More */}
        <span className="inline-flex items-center gap-1.5 text-copper text-xs font-mono tracking-widest uppercase font-medium group-hover:gap-2.5 transition-all duration-200">
          Learn More
          <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
        </span>
      </Link>
    </motion.article>
  );
}