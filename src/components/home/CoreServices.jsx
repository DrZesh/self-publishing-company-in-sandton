import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, useMotionValue, useTransform, useSpring } from 'framer-motion';
import { BookOpen, PenLine, Palette, AlignLeft, Ghost, Baby, Tablet, Globe, ArrowRight } from 'lucide-react';

const services = [
  { icon: BookOpen,  title: 'Book Printing',                   desc: 'Professional paperback book printing for authors, publishers, schools, churches, businesses and organisations.', label: 'View Book Printing',         to: '/bookprinting',           accent: '#B8955B' },
  { icon: PenLine,   title: 'Book Editing & Proofreading',     desc: 'Improve grammar, clarity, sentence flow, consistency and readability before publishing.',                       label: 'View Editing Services',      to: '/bookediting',            accent: '#7B9EE0' },
  { icon: Palette,   title: 'Book Cover Design',               desc: 'Create a professional book cover that attracts readers and matches your genre.',                                label: 'View Cover Design',          to: '/bookcoverdesign',        accent: '#E07B9E' },
  { icon: AlignLeft, title: 'Typesetting and Layout',          desc: 'Turn your manuscript into a clean, professional and print-ready book interior.',                                label: 'View Typesetting',           to: '/typesetting',            accent: '#7BE0C0' },
  { icon: Ghost,     title: 'Ghostwriting Support',            desc: 'Get help turning your ideas, story or message into structured written content.',                               label: 'View Ghostwriting',          to: '/ghostwriting',           accent: '#C07BE0' },
  { icon: Baby,      title: "Children's Book Illustration",   desc: "Bring children's stories to life with character development, scenery and visual storytelling.",                label: "View Children's Books",      to: '/childrensbookpublishing',accent: '#E0B87B' },
  { icon: Tablet,    title: 'Ebook Publishing',               desc: 'Prepare your book for digital readers and online publishing platforms.',                                        label: 'View Ebook Services',        to: '/ebookpublishing',        accent: '#7BC8E0' },
  { icon: Globe,     title: 'Author Website Design',          desc: 'Build a professional online presence for your book and author brand.',                                          label: 'View Website Design',        to: '/authorwebsites',         accent: '#9EE07B' },
];

function GlassCard({ svc, i }) {
  const Icon = svc.icon;
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const rotateX = useSpring(useTransform(y, [-60, 60], [12, -12]), { stiffness: 300, damping: 30 });
  const rotateY = useSpring(useTransform(x, [-60, 60], [-12, 12]), { stiffness: 300, damping: 30 });
  const glowX = useTransform(x, [-60, 60], [0, 100]);
  const glowY = useTransform(y, [-60, 60], [0, 100]);

  function handleMouse(e) {
    const rect = e.currentTarget.getBoundingClientRect();
    x.set(e.clientX - rect.left - rect.width / 2);
    y.set(e.clientY - rect.top - rect.height / 2);
  }
  function handleLeave() {
    x.set(0);
    y.set(0);
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 40, scale: 0.95 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true }}
      transition={{ delay: i * 0.08, duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
      style={{ perspective: 800 }}
      className="relative"
      onMouseMove={handleMouse}
      onMouseLeave={handleLeave}
    >
      <motion.div
        style={{ rotateX, rotateY, transformStyle: 'preserve-3d' }}
        className="relative flex flex-col p-7 group overflow-hidden h-full"
        whileHover={{ scale: 1.02 }}
        transition={{ duration: 0.2 }}
        style={{
          background: 'rgba(255,255,255,0.55)',
          backdropFilter: 'blur(28px)',
          WebkitBackdropFilter: 'blur(28px)',
          border: '1px solid rgba(255,255,255,0.85)',
          boxShadow: '0 20px 60px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,1), inset 0 -1px 0 rgba(0,0,0,0.04)',
          borderRadius: '20px',
        }}
      >
        {/* Dynamic spotlight that follows mouse */}
        <motion.div
          className="absolute inset-0 pointer-events-none rounded-[20px] opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          style={{
            background: `radial-gradient(circle at ${glowX}% ${glowY}%, ${svc.accent}22 0%, transparent 60%)`,
          }}
        />

        {/* Top specular glass edge */}
        <div className="absolute top-0 left-6 right-6 h-px rounded-full"
          style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,1), transparent)' }} />

        {/* Accent bottom glow on hover */}
        <div className="absolute bottom-0 left-0 right-0 h-0.5 scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-center rounded-b-[20px]"
          style={{ background: `linear-gradient(90deg, transparent, ${svc.accent}, transparent)` }} />

        {/* 3D floating icon orb */}
        <motion.div
          style={{ translateZ: 20 }}
          className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6 relative overflow-hidden"
          whileHover={{ scale: 1.12, rotate: 5 }}
          transition={{ duration: 0.3 }}
        >
          {/* Orb background */}
          <div className="absolute inset-0 rounded-2xl"
            style={{
              background: `linear-gradient(135deg, ${svc.accent}18 0%, ${svc.accent}08 100%)`,
              border: `1px solid ${svc.accent}30`,
              boxShadow: `inset 0 1px 0 rgba(255,255,255,0.8), 0 4px 16px ${svc.accent}20`,
            }} />
          {/* Inner shine */}
          <div className="absolute top-0 left-0 right-0 h-1/2 rounded-t-2xl"
            style={{ background: 'linear-gradient(180deg, rgba(255,255,255,0.6) 0%, transparent 100%)' }} />
          <Icon className="relative z-10 w-6 h-6 transition-colors duration-300" strokeWidth={1.5}
            style={{ color: svc.accent }} />
        </motion.div>

        {/* Accent dot */}
        <div className="absolute top-6 right-6 w-2 h-2 rounded-full opacity-40"
          style={{ background: svc.accent, boxShadow: `0 0 8px ${svc.accent}` }} />

        <h3 className="font-heading text-base font-bold text-[#0B1220] mb-2.5 leading-snug">{svc.title}</h3>
        <p className="text-[#2B2B2B]/55 text-xs font-body leading-relaxed flex-1 mb-6">{svc.desc}</p>

        {/* Divider */}
        <div className="h-px w-full mb-4" style={{ background: 'linear-gradient(90deg, transparent, rgba(0,0,0,0.08), transparent)' }} />

        <Link
          to={svc.to}
          className="inline-flex items-center gap-2 text-xs font-semibold transition-colors duration-200 group/link"
          style={{ color: svc.accent }}
        >
          {svc.label}
          <motion.span whileHover={{ x: 4 }} className="inline-flex">
            <ArrowRight className="w-3.5 h-3.5" />
          </motion.span>
        </Link>
      </motion.div>
    </motion.div>
  );
}

export default function CoreServices() {
  return (
    <section className="relative py-24 lg:py-32 overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #f0f4ff 0%, #e8edf8 40%, #f4f0ff 80%, #f0f4ff 100%)' }}>

      {/* Background orbs */}
      <div className="absolute -top-40 -right-40 w-[500px] h-[500px] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(184,149,91,0.08) 0%, transparent 65%)', filter: 'blur(80px)' }} />
      <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(120,100,220,0.08) 0%, transparent 65%)', filter: 'blur(80px)' }} />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(ellipse, rgba(100,160,240,0.05) 0%, transparent 70%)', filter: 'blur(60px)' }} />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-16"
        >
          <span className="text-[#B8955B] text-xs tracking-[0.3em] uppercase font-body block mb-4">What We Do</span>
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
            <h2 className="font-heading text-3xl md:text-4xl lg:text-5xl font-bold text-[#0B1220] leading-tight max-w-2xl">
              Complete Self-Publishing and<br className="hidden md:block" /> Book Production Services
            </h2>
            <p className="text-[#2B2B2B]/60 font-body text-sm leading-relaxed max-w-sm">
              Creative Books SA supports authors at every stage of the book production journey, from manuscript preparation to printed copies and digital publishing.
            </p>
          </div>
          <div className="mt-6 h-px w-full" style={{ background: 'linear-gradient(90deg, #B8955B, rgba(184,149,91,0.05))' }} />
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {services.map((svc, i) => (
            <GlassCard key={svc.title} svc={svc} i={i} />
          ))}
        </div>
      </div>
    </section>
  );
}