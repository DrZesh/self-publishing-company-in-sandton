import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BookOpen, PenLine, Palette, AlignLeft, Ghost, Baby, Tablet, Globe, ArrowRight } from 'lucide-react';

const services = [
  { icon: BookOpen, title: 'Book Printing',                       desc: 'Professional paperback book printing for authors, publishers, schools, churches, businesses and organisations.',          label: 'View Book Printing',      to: '/bookprinting' },
  { icon: PenLine,  title: 'Book Editing and Proofreading',       desc: 'Improve grammar, clarity, sentence flow, consistency and readability before publishing.',                                label: 'View Editing Services',   to: '/bookediting' },
  { icon: Palette,  title: 'Book Cover Design',                   desc: 'Create a professional book cover that attracts readers and matches your genre.',                                         label: 'View Cover Design',       to: '/bookcoverdesign' },
  { icon: AlignLeft,title: 'Typesetting and Layout',              desc: 'Turn your manuscript into a clean, professional and print-ready book interior.',                                         label: 'View Typesetting',        to: '/typesetting' },
  { icon: Ghost,    title: 'Ghostwriting and Writing Support',     desc: 'Get help turning your ideas, story or message into structured written content.',                                        label: 'View Ghostwriting',       to: '/ghostwriting' },
  { icon: Baby,     title: "Children's Book Illustration",        desc: "Bring children's stories to life with character development, scenery and visual storytelling.",                          label: "View Children's Books",   to: '/childrensbookpublishing' },
  { icon: Tablet,   title: 'Ebook Publishing',                    desc: 'Prepare your book for digital readers and online publishing platforms.',                                                label: 'View Ebook Services',     to: '/ebookpublishing' },
  { icon: Globe,    title: 'Author Website Design',               desc: 'Build a professional online presence for your book and author brand.',                                                  label: 'View Website Design',     to: '/authorwebsites' },
];

export default function CoreServices() {
  return (
    <section className="relative py-24 lg:py-32 overflow-hidden" style={{ background: 'linear-gradient(135deg, #f8f9fb 0%, #eef1f7 50%, #f4f6fa 100%)' }}>
      {/* Subtle glass orbs for depth */}
      <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(184,149,91,0.06) 0%, transparent 70%)', filter: 'blur(60px)' }} />
      <div className="absolute -bottom-20 -left-20 w-80 h-80 rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(100,120,200,0.07) 0%, transparent 70%)', filter: 'blur(60px)' }} />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-14"
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
          <div className="mt-6 h-px w-full" style={{ background: 'linear-gradient(90deg, #B8955B, rgba(184,149,91,0.1))' }} />
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {services.map((svc, i) => {
            const Icon = svc.icon;
            return (
              <motion.div
                key={svc.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.07, duration: 0.5 }}
                whileHover={{ y: -6, transition: { duration: 0.2 } }}
                className="relative flex flex-col p-6 group overflow-hidden"
                style={{
                  background: 'rgba(255,255,255,0.72)',
                  backdropFilter: 'blur(20px)',
                  WebkitBackdropFilter: 'blur(20px)',
                  border: '1px solid rgba(255,255,255,0.9)',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.07), 0 1px 0 rgba(255,255,255,1) inset',
                }}
              >
                {/* Specular top highlight */}
                <div className="absolute top-0 left-0 right-0 h-px"
                  style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,1), transparent)' }} />
                {/* Hover accent */}
                <div className="absolute top-0 left-0 right-0 h-0.5 scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"
                  style={{ background: 'linear-gradient(90deg, #B8955B, rgba(184,149,91,0.3))' }} />

                <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-5"
                  style={{
                    background: 'rgba(255,255,255,0.8)',
                    border: '1px solid rgba(0,0,0,0.07)',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,1)',
                    backdropFilter: 'blur(8px)',
                  }}>
                  <Icon className="w-5 h-5 text-[#0B1220] group-hover:text-[#B8955B] transition-colors" strokeWidth={1.5} />
                </div>
                <h3 className="font-heading text-sm font-bold text-[#0B1220] mb-2 leading-snug">{svc.title}</h3>
                <p className="text-[#2B2B2B]/55 text-xs font-body leading-relaxed flex-1 mb-5">{svc.desc}</p>
                <div className="h-px w-full mb-4" style={{ background: 'rgba(0,0,0,0.06)' }} />
                <Link
                  to={svc.to}
                  className="inline-flex items-center gap-2 text-xs font-medium text-[#0B1220] hover:text-[#B8955B] transition-colors group/link"
                >
                  {svc.label}
                  <ArrowRight className="w-3.5 h-3.5 group-hover/link:translate-x-1 transition-transform" />
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}