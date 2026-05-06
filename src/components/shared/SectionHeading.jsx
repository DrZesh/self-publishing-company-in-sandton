import React from 'react';
import { motion } from 'framer-motion';

export default function SectionHeading({ subtitle, title, description, light = false, center = true }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.7 }}
      className={`${center ? 'text-center' : ''} max-w-3xl ${center ? 'mx-auto' : ''} mb-12 lg:mb-16`}
    >
      {subtitle && (
        <span className="text-copper text-sm font-body font-medium tracking-[0.25em] uppercase mb-4 block">
          {subtitle}
        </span>
      )}
      <h2 className={`font-heading text-3xl md:text-4xl lg:text-5xl font-bold leading-tight mb-4 ${
        light ? 'text-white' : 'text-[#0F0F0F]'
      }`}>
        {title}
      </h2>
      {description && (
        <p className={`text-base lg:text-lg leading-relaxed font-body ${
          light ? 'text-white/60' : 'text-[#0F0F0F]/60'
        }`}>
          {description}
        </p>
      )}
    </motion.div>
  );
}