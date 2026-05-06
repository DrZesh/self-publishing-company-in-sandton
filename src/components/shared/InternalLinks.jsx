import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

export default function InternalLinks({ title = "Related Services", links = [], light = false }) {
  if (!links.length) return null;

  return (
    <section className={`relative py-16 overflow-hidden ${light ? 'bg-vellum' : 'bg-[#060504]'}`}>
      {/* Ambient glow for dark theme */}
      {!light && (
        <motion.div
          animate={{ opacity: [0.05, 0.1, 0.05] }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-0 left-1/3 w-64 h-64 rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(184,115,51,0.2) 0%, transparent 60%)', filter: 'blur(50px)' }}
        />
      )}

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6">
        <motion.h3
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className={`font-heading text-xl font-semibold mb-8 flex items-center gap-3 ${light ? 'text-[#0F0F0F]' : 'text-white'}`}
        >
          <span className="w-8 h-px bg-copper" />
          {title}
        </motion.h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {links.map((link, i) => (
            <motion.div
              key={link.path}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.04 }}
            >
              <Link
                 to={link.path}
                 title={`Learn more about ${link.label}`}
                 className="group flex items-center justify-between p-4 rounded-xl transition-all"
                 style={light ? {
                   background: 'rgba(255,255,255,0.9)',
                   backdropFilter: 'blur(12px)',
                   border: '1px solid rgba(0,0,0,0.06)',
                 } : {
                   background: 'rgba(10, 8, 6, 0.6)',
                   backdropFilter: 'blur(12px)',
                   border: '1px solid rgba(184, 115, 51, 0.08)',
                 }}
               >
                 <span className={`text-sm font-body transition-colors ${light ? 'text-[#0F0F0F]/80 group-hover:text-copper' : 'text-white/70 group-hover:text-copper'}`}>
                   {link.label}
                 </span>
                 <ArrowRight className="w-3 h-3 text-copper opacity-0 translate-x-[-4px] group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
               </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}