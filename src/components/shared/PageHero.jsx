import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

export default function PageHero({
  icon: Icon,
  subtitle,
  title,
  titleHighlight,
  description,
  primaryLabel = "Get Started",
  primaryLink = "/getquote",
  secondaryLabel = "Contact Us",
  secondaryLink = "/contact",
  backgroundColor = "bg-obsidian"
}) {
  return (
    <section className={`relative pt-32 pb-20 ${backgroundColor} overflow-hidden`}>
      <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 20% 80%, #B87333 0%, transparent 50%)' }} />
      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 text-center">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
          {Icon && (
            <span className="inline-flex items-center gap-2 text-copper text-sm font-body tracking-[0.25em] uppercase mb-6">
              <Icon className="w-4 h-4" /> {subtitle}
            </span>
          )}
          {!Icon && subtitle && (
            <span className="inline-block text-copper text-sm font-body tracking-[0.25em] uppercase mb-6">{subtitle}</span>
          )}
          
          <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
            {title}
            {titleHighlight && (
              <>
                <br />
                <span className="text-gradient-copper">{titleHighlight}</span>
              </>
            )}
          </h1>
          
          <p className="text-white/60 text-lg leading-relaxed font-body max-w-2xl mx-auto mb-10">
            {description}
          </p>
          
          <div className="flex flex-wrap gap-4 justify-center">
            <Link to={primaryLink}
              className="group inline-flex items-center gap-2 px-7 py-3.5 bg-copper text-white font-medium rounded-full hover:bg-copper/90 transition-all shadow-lg shadow-copper/20">
              {primaryLabel}
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link to={secondaryLink}
              className="inline-flex items-center gap-2 px-7 py-3.5 border border-white/20 text-white rounded-full hover:border-copper hover:text-copper transition-all">
              {secondaryLabel}
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}