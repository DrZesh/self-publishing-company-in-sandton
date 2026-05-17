import React from 'react';
import PageMeta from '../components/shared/PageMeta';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, BookOpen, Users, Award, Heart } from 'lucide-react';
import SectionHeading from '../components/shared/SectionHeading';
import CTASection from '../components/shared/CTASection';

const values = [
  { icon: BookOpen, title: 'Excellence', description: 'Every book we publish meets the highest standards of quality in editing, design, and print.' },
  { icon: Users, title: 'Partnership', description: 'We work alongside our authors as partners, not just service providers.' },
  { icon: Award, title: 'Integrity', description: 'Transparent pricing, honest timelines, and authors always retain their rights.' },
  { icon: Heart, title: 'Passion', description: 'We are passionate about stories and believe every voice deserves to be heard.' },
];

export default function About() {
  return (
    <div>
      <PageMeta
        title="About Creative Books SA | Premium SA Publishing Company"
        description="Meet Creative Books SA — a Johannesburg-based publishing house helping South African authors self-publish with cinematic quality and care."
        canonical="https://www.creativebooks.co.za/aboutus"
      />
      {/* Hero */}
      <section className="relative min-h-[60vh] flex items-center pt-20">
        <div className="absolute inset-0">
          <img src="https://media.base44.com/images/public/69fb173eeab1ba78da6eab45/6adea615f_generated_9d9037e5.png" alt="Books and publishing materials at Creative Books SA Johannesburg office" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0F0F0F]/95 via-[#0F0F0F]/80 to-[#0F0F0F]/60" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-20 lg:py-28">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl">
            <span className="text-copper text-sm font-body tracking-[0.25em] uppercase mb-4 block">About Us</span>
            <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
              About Creative Books SA
            </h1>
            <p className="text-white/60 text-lg leading-relaxed font-body">
              Founded in Johannesburg, Creative Books SA has spent over 15 years transforming manuscripts into beautifully published books for authors across South Africa and beyond.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Story */}
      <section className="py-20 lg:py-28 bg-vellum">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
              <SectionHeading
                subtitle="Our Story"
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
            </motion.div>
            <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }}>
              <img src="https://media.base44.com/images/public/69fb173eeab1ba78da6eab45/ab1a9cc57_generated_1cd0c953.png" alt="Creative Books SA team members at work in Johannesburg" className="rounded-2xl shadow-xl w-full" />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 lg:py-28 bg-obsidian">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <SectionHeading subtitle="Our Values" title="What We Stand For" light />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((v, i) => {
              const Icon = v.icon;
              return (
                <motion.div key={v.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                  className="bg-white/5 border border-white/10 rounded-2xl p-8 text-center">
                  <Icon className="w-10 h-10 text-copper mx-auto mb-4" />
                  <h3 className="font-heading text-lg font-semibold text-white mb-2">{v.title}</h3>
                  <p className="text-sm text-white/50 leading-relaxed font-body">{v.description}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      <CTASection title="Ready to Start Your Journey?" description="Connect with our publishing experts for a free consultation and personalised quote." />
    </div>
  );
}