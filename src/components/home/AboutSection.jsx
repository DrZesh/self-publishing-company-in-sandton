import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { BookOpen, Users, Award, Heart, ArrowRight } from 'lucide-react';
import SectionHeading from '../shared/SectionHeading';

const values = [
  { icon: BookOpen, title: 'Excellence', description: 'Every book we publish meets the highest standards of quality in editing, design, and print.' },
  { icon: Users, title: 'Partnership', description: 'We work alongside our authors as partners, not just service providers.' },
  { icon: Award, title: 'Integrity', description: 'Transparent pricing, honest timelines, and authors always retain their rights.' },
  { icon: Heart, title: 'Passion', description: 'We are passionate about stories and believe every voice deserves to be heard.' },
];

export default function AboutSection() {
  return (
    <section className="py-20 lg:py-28 bg-vellum">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Story */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center mb-20">
          <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
            <SectionHeading
              subtitle="About Us"
              title="Born from a Love of Books"
              description="Creative Books SA began with a simple belief: that every author in South Africa deserves access to world-class publishing services."
              center={false}
            />
            <div className="space-y-4 text-[#0F0F0F]/70 text-sm leading-relaxed font-body">
              <p>
                What started as a small printing workshop in Johannesburg has grown into one of South Africa's most trusted publishing houses. We have guided over 500 authors through the publishing process, from first-time writers to seasoned academics.
              </p>
              <p>
                Our team of editors, designers, and printing specialists brings decades of combined experience to every project. We understand the South African market and the unique needs of our authors.
              </p>
              <p>
                Today, we offer a complete publishing ecosystem — from manuscript evaluation and professional editing to cover design, typesetting, printing, ISBN registration, and digital distribution on platforms like Amazon KDP.
              </p>
            </div>
            <Link to="/aboutus" className="group inline-flex items-center gap-2 mt-8 text-copper font-medium font-body hover:gap-3 transition-all">
              Learn More About Us <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>
          <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }}>
            <img
              src="https://media.base44.com/images/public/69fb173eeab1ba78da6eab45/ab1a9cc57_generated_1cd0c953.png"
              alt="Creative Books SA team"
              className="rounded-2xl shadow-xl w-full"
            />
          </motion.div>
        </div>

        {/* Values */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {values.map((v, i) => {
            const Icon = v.icon;
            return (
              <motion.div
                key={v.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-white border border-[#0F0F0F]/5 rounded-2xl p-8 text-center shadow-sm"
              >
                <Icon className="w-10 h-10 text-copper mx-auto mb-4" />
                <h3 className="font-heading text-lg font-semibold text-[#0F0F0F] mb-2">{v.title}</h3>
                <p className="text-sm text-[#0F0F0F]/60 leading-relaxed font-body">{v.description}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}