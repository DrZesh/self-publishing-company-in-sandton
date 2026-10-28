import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  BookOpen, Printer, PenLine, Palette, AlignLeft, BookMarked,
  BookCopy, Globe, Smartphone
} from 'lucide-react';

const services = [
  {
    icon: BookOpen,
    title: 'Self Publishing',
    desc: 'Complete self-publishing solutions with professional guidance. Retain 100% rights and royalties. From manuscript to market in 8-12 weeks.',
    link: '/self-publishing-south-africa',
    aria: 'Self publishing services South Africa',
  },
  {
    icon: Printer,
    title: 'Book Printing',
    desc: 'Certified offset and digital printing in Johannesburg. Hardcover, softcover, specialty formats. ISO-certified quality. Competitive pricing at scale.',
    link: '/book-printing',
    aria: 'Book printing services South Africa',
  },
  {
    icon: PenLine,
    title: 'Book Editing',
    desc: 'Comprehensive editing services—developmental, line editing, copy editing, and proofreading. Industry-certified editors. 20+ years combined experience.',
    link: '/book-editing',
    aria: 'Book editing services South Africa',
  },
  {
    icon: Palette,
    title: 'Book Cover Design',
    desc: 'Professional cover design that increases sales. Custom concepts, market-tested visuals, print and digital optimization. Unlimited revisions.',
    link: '/book-cover-design',
    aria: 'Book cover design services South Africa',
  },
  {
    icon: AlignLeft,
    title: 'Layout & Typesetting',
    desc: 'Professional interior design meeting international publishing standards. Print-ready and digital-optimized. Fast turnaround without compromising quality.',
    link: '/typesetting',
    aria: 'Book typesetting and layout design',
  },
  {
    icon: BookMarked,
    title: "Children's Book Publishing",
    desc: 'Specialized children\'s publishing with illustration coordination, pedagogical design, color-separation expertise, and premium printing.',
    link: '/childrensbookpackages',
    aria: "Children's book publishing South Africa",
  },
  {
    icon: BookCopy,
    title: 'Hardcover Printing',
    desc: 'Premium hardcover production for prestige publications, commemorative editions, and corporate gifts. Cloth covers, custom finishes available.',
    link: '/printing/hardcover',
    aria: 'Hardcover book printing South Africa',
  },
  {
    icon: Globe,
    title: 'Author Website Design',
    desc: 'Purpose-built author platforms for discoverability and sales. Mobile-responsive, SEO-optimized, integrated e-commerce and newsletter tools.',
    link: '/author-websites',
    aria: 'Author website design South Africa',
  },
  {
    icon: Smartphone,
    title: 'Ebook Formatting',
    desc: 'Professional ePub and Kindle formatting for Amazon KDP, Apple Books, Takealot, and global platforms. Full DRM compatibility support.',
    link: '/ebookformatting',
    aria: 'Ebook formatting services South Africa',
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
    <section className="py-24 lg:py-32 relative overflow-hidden" aria-labelledby="services-heading"
      style={{ background: 'linear-gradient(160deg, #0F0F0F 0%, #1a1208 50%, #0F0F0F 100%)' }}
    >
      {/* Ambient glow orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(184,115,51,0.12) 0%, transparent 65%)', filter: 'blur(60px)' }} />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(184,115,51,0.08) 0%, transparent 65%)', filter: 'blur(50px)' }} />
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
          <h2 id="services-heading" className="font-heading text-4xl md:text-5xl font-bold text-white mb-5 leading-tight">
            Our Publishing and<br className="hidden sm:block" /> Printing Services
          </h2>
          <p className="text-white/45 text-base font-body max-w-2xl mx-auto leading-relaxed">
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
            <motion.div key={svc.title} variants={cardVariants}>
              <Link to={svc.link} className="block h-full">
                <ServiceCard svc={svc} />
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

function ServiceCard({ svc }) {
   const Icon = svc.icon;

   return (
     <article>
      <div
        className="group flex flex-col h-full p-8 rounded-2xl transition-all duration-300 relative overflow-hidden"
        style={{
          background: 'rgba(255,255,255,0.03)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          border: '1px solid rgba(184,115,51,0.18)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.06)',
          minHeight: '300px',
        }}
        onMouseEnter={e => {
          e.currentTarget.style.background = 'rgba(184,115,51,0.06)';
          e.currentTarget.style.border = '1px solid rgba(184,115,51,0.5)';
          e.currentTarget.style.boxShadow = '0 20px 60px rgba(0,0,0,0.5), 0 0 30px rgba(184,115,51,0.12), inset 0 1px 0 rgba(255,255,255,0.1)';
        }}
        onMouseLeave={e => {
          e.currentTarget.style.background = 'rgba(255,255,255,0.03)';
          e.currentTarget.style.border = '1px solid rgba(184,115,51,0.18)';
          e.currentTarget.style.boxShadow = '0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.06)';
        }}
      >
        {/* Scan-line shimmer overlay */}
        <div className="absolute inset-0 opacity-[0.025] pointer-events-none"
          style={{ backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.5) 2px, rgba(255,255,255,0.5) 3px)', backgroundSize: '100% 3px' }} />

        {/* Top-right corner glow accent */}
        <div className="absolute top-0 right-0 w-24 h-24 rounded-bl-full pointer-events-none opacity-20 group-hover:opacity-40 transition-opacity duration-300"
          style={{ background: 'radial-gradient(circle at top right, rgba(184,115,51,0.6) 0%, transparent 70%)' }} />

        {/* Icon */}
        <div
          className="w-14 h-14 rounded-xl flex items-center justify-center mb-6 transition-all duration-300 group-hover:scale-110"
          style={{
            background: 'linear-gradient(135deg, rgba(184,115,51,0.2) 0%, rgba(184,115,51,0.08) 100%)',
            border: '1px solid rgba(184,115,51,0.3)',
            boxShadow: '0 4px 16px rgba(184,115,51,0.15)',
          }}
          aria-hidden="true"
        >
          <Icon className="w-6 h-6 text-copper" />
        </div>

        {/* Title */}
        <h3 className="font-heading text-[1.05rem] font-semibold text-white mb-2 leading-snug group-hover:text-copper transition-colors duration-200">
          {svc.title}
        </h3>

        {/* Description */}
        <p className="text-white/45 text-sm font-body leading-relaxed flex-1">
          {svc.desc}
        </p>
        </div>
        </article>
        );
        }