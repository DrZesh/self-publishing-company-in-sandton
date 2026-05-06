import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, Quote } from 'lucide-react';

const milestones = [
  { year: '2009', event: 'Founded in Johannesburg' },
  { year: '2013', event: '100th book published' },
  { year: '2017', event: 'Launched Amazon KDP services' },
  { year: '2021', event: '400+ authors served' },
  { year: '2024', event: '500+ books in print' },
];

const values = [
  { symbol: '🖋', title: 'Excellence', desc: 'Every book meets the highest standard of editing, design, and print.' },
  { symbol: '🤝', title: 'Partnership', desc: 'We work alongside authors as creative partners, not just vendors.' },
  { symbol: '⚖️', title: 'Integrity', desc: 'Transparent pricing, honest timelines, and full author rights — always.' },
  { symbol: '❤️', title: 'Passion', desc: 'We believe every voice deserves to be heard. Books change lives.' },
];

export default function AboutSection() {
  return (
    <section className="py-20 lg:py-28 bg-vellum relative overflow-hidden">
      {/* Subtle grid texture */}
      <div className="absolute inset-0 opacity-[0.015] pointer-events-none"
        style={{
          backgroundImage: 'linear-gradient(rgba(0,0,0,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.8) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }}
      />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6">
        {/* Main story block */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start mb-20">
          {/* Left */}
          <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
            <span className="text-copper text-sm font-body tracking-[0.3em] uppercase mb-4 block">Our Story</span>
            <h2 className="font-heading text-4xl md:text-5xl font-bold text-[#0F0F0F] mb-6 leading-tight">
              Born from a<br />
              <span className="text-gradient-copper">Love of Books</span>
            </h2>

            {/* Pull quote */}
            <div className="relative p-6 rounded-2xl mb-6"
              style={{ background: 'rgba(184,115,51,0.06)', border: '1px solid rgba(184,115,51,0.15)' }}>
              <Quote className="w-6 h-6 text-copper/40 mb-3" />
              <p className="font-heading text-lg text-[#0F0F0F]/80 italic leading-relaxed">
                "We believe that every South African author deserves access to world-class publishing — regardless of who they are or where they come from."
              </p>
              <div className="mt-3 text-sm text-copper font-body font-medium">— The Creative Books SA Team</div>
            </div>

            <div className="space-y-3 text-[#0F0F0F]/65 text-sm leading-relaxed font-body mb-6">
              <p>What started as a small printing workshop in Johannesburg has grown into one of South Africa's most trusted publishing houses — serving over 500 authors from every corner of the country.</p>
              <p>Our team of editors, designers, and printing specialists brings decades of combined experience. We understand the South African market and the unique needs of local authors writing local stories for local and global audiences.</p>
              <p>Today we offer a complete publishing ecosystem: from manuscript evaluation and professional editing to premium cover design, typesetting, printing, ISBN registration, and digital distribution worldwide.</p>
            </div>

            <Link to="/aboutus" className="group inline-flex items-center gap-2 text-copper font-medium font-body hover:gap-3 transition-all text-sm">
              Learn More About Us <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>

          {/* Right: Timeline */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            {/* Image */}
            <div className="relative mb-8">
              <motion.img
                initial={{ scale: 0.97 }}
                whileInView={{ scale: 1 }}
                viewport={{ once: true }}
                src="https://media.base44.com/images/public/69fb173eeab1ba78da6eab45/ab1a9cc57_generated_1cd0c953.png"
                alt="Creative Books SA publishing team in Johannesburg"
                className="rounded-2xl w-full shadow-lg"
              />
              <div className="absolute inset-0 rounded-2xl pointer-events-none"
                style={{ background: 'linear-gradient(to bottom, transparent 50%, rgba(249,247,242,0.4) 100%)' }} />
            </div>

            {/* Milestones */}
            <div className="relative pl-6" style={{ borderLeft: '2px solid rgba(184,115,51,0.2)' }}>
              {milestones.map((m, i) => (
                <motion.div
                  key={m.year}
                  initial={{ opacity: 0, x: 10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="relative mb-4 last:mb-0"
                >
                  <div className="absolute -left-[25px] w-3 h-3 rounded-full bg-copper" />
                  <div className="flex items-center gap-3">
                    <span className="text-copper font-heading font-bold text-sm">{m.year}</span>
                    <span className="text-[#0F0F0F]/60 font-body text-sm">{m.event}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Values */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {values.map((v, i) => (
            <motion.div
              key={v.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ y: -4, transition: { duration: 0.25 } }}
              className="p-6 rounded-2xl text-center bg-white shadow-sm cursor-default"
              style={{ border: '1px solid rgba(184,115,51,0.1)' }}
            >
              <div className="text-3xl mb-3">{v.symbol}</div>
              <h3 className="font-heading text-base font-semibold text-[#0F0F0F] mb-2">{v.title}</h3>
              <p className="text-sm text-[#0F0F0F]/55 leading-relaxed font-body">{v.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}