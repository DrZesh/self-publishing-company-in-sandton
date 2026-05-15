import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { ArrowRight, Printer, Book, PenTool, Palette, LayoutTemplate, Tablet } from 'lucide-react';

const services = [
  {
    name: 'Book Printing',
    description: 'Professional A5, 6×9, hardcover and children\'s book printing.',
    route: '/printing/a5',
    icon: Printer,
    accentColor: 'from-[#B8955B]/20 to-[#B8955B]/5',
  },
  {
    name: 'Book Publishing',
    description: 'Complete self-publishing packages for first-time authors.',
    route: '/selfpublishingpackagesinsouthafrica',
    icon: Book,
    accentColor: 'from-[#1a73e8]/20 to-[#1a73e8]/5',
  },
  {
    name: 'Book Editing',
    description: 'Developmental editing, copy editing and proofreading.',
    route: '/copyediting',
    icon: PenTool,
    accentColor: 'from-[#10b981]/20 to-[#10b981]/5',
  },
  {
    name: 'Book Cover Design',
    description: 'Custom, professional book cover design for your genre.',
    route: '/bookcoverdesign',
    icon: Palette,
    accentColor: 'from-[#8b5cf6]/20 to-[#8b5cf6]/5',
  },
  {
    name: 'Typesetting',
    description: 'Professional interior layout and typesetting.',
    route: '/typesetting',
    icon: LayoutTemplate,
    accentColor: 'from-[#f59e0b]/20 to-[#f59e0b]/5',
  },
  {
    name: 'Ebook Publishing',
    description: 'Ebook formatting and Amazon KDP setup.',
    route: '/ebookpublishing',
    icon: Tablet,
    accentColor: 'from-[#ec4899]/20 to-[#ec4899]/5',
  },
];

function GlassCard({ service, i }) {
  const ref = useRef(null);
  const [hovered, setHovered] = useState(false);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springConfig = { damping: 25, stiffness: 150 };
  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [6, -6]), springConfig);
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-6, 6]), springConfig);

  function handleMouseMove(e) {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseXFromCenter = e.clientX - rect.left - width / 2;
    const mouseYFromCenter = e.clientY - rect.top - height / 2;
    mouseX.set(mouseXFromCenter / width);
    mouseY.set(mouseYFromCenter / height);
  }

  function handleMouseLeave() {
    setHovered(false);
    mouseX.set(0);
    mouseY.set(0);
  }

  const Icon = service.icon;

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={handleMouseLeave}
      style={{
        rotateX,
        rotateY,
        transformStyle: 'preserve-3d',
      }}
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: i * 0.08, duration: 0.5 }}
      className="relative group"
    >
      <Link
        to={service.route}
        className="block h-full p-6 rounded-2xl transition-all duration-300"
        style={{
          background: `linear-gradient(135deg, rgba(255,255,255,0.85), rgba(255,255,255,0.65))`,
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.9)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,1)',
        }}
      >
        {/* Specular shine on hover */}
        <div
          className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse at 50% 0%, rgba(255,255,255,0.8) 0%, transparent 70%)',
          }}
        />

        {/* Ambient glow from accent */}
        <div
          className={`absolute -inset-0.5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none bg-gradient-to-br ${service.accentColor}`}
          style={{ filter: 'blur(24px)' }}
        />

        {/* Content */}
        <div className="relative z-10">
          <div
            className="w-12 h-12 rounded-xl mb-4 flex items-center justify-center"
            style={{
              background: 'rgba(255,255,255,0.9)',
              border: '1px solid rgba(0,0,0,0.06)',
              boxShadow: '0 4px 16px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,1)',
            }}
          >
            <Icon className="w-6 h-6" style={{ color: '#B8955B' }} strokeWidth={1.5} />
          </div>

          <h3 className="font-heading text-lg font-bold text-[#0B1220] mb-2">
            {service.name}
          </h3>

          <p className="text-[#2B2B2B]/60 font-body text-sm leading-relaxed mb-4">
            {service.description}
          </p>

          <div className="flex items-center gap-2 text-[#B8955B] text-sm font-medium font-body group/link">
            Learn more
            <ArrowRight className="w-4 h-4 group-hover/link:translate-x-1 transition-transform" />
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

export default function CoreServices() {
  return (
    <section id="our-services" className="relative py-24 lg:py-28 overflow-hidden" style={{ background: 'linear-gradient(135deg, #f8f9fb 0%, #eef1f7 100%)' }}>
      {/* Decorative background elements */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] pointer-events-none rounded-full"
        style={{ background: 'radial-gradient(ellipse, rgba(184,149,91,0.06) 0%, transparent 70%)', filter: 'blur(80px)' }} />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-16"
        >
          <span className="text-[#B8955B] text-xs tracking-[0.3em] uppercase font-body block mb-4">Our Services</span>
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <h2 className="font-heading text-3xl md:text-4xl lg:text-5xl font-bold text-[#0B1220] leading-tight">
              Complete Book Production<br />Under One Roof
            </h2>
            <p className="text-[#2B2B2B]/55 font-body text-sm max-w-xs leading-relaxed">
              From manuscript to finished book, we offer every service an author needs.
            </p>
          </div>
          <div className="mt-6 h-px" style={{ background: 'linear-gradient(90deg, #B8955B, rgba(184,149,91,0.08))' }} />
        </motion.div>

        {/* Services grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service, i) => (
            <GlassCard key={service.name} service={service} i={i} />
          ))}
        </div>
      </div>
    </section>
  );
}