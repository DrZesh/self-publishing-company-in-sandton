import React from 'react';
import { motion } from 'framer-motion';
import { Eye, UserCheck, Award, Lightbulb, Globe } from 'lucide-react';

const reasons = [
  {
    icon: Eye,
    title: 'Transparent Publishing Support',
    desc: 'You receive clear guidance and a quote based on the services your book needs.',
  },
  {
    icon: UserCheck,
    title: 'Author Control',
    desc: 'You remain in control of your book, your rights and your profits.',
  },
  {
    icon: Award,
    title: 'Professional Production Quality',
    desc: 'Your book is prepared with attention to editing, design, layout, print quality and final presentation.',
  },
  {
    icon: Lightbulb,
    title: 'Practical Guidance',
    desc: 'We help authors understand the publishing process, from manuscript preparation to finished copies.',
  },
  {
    icon: Globe,
    title: 'Local and International Appeal',
    desc: 'Creative Books SA gives authors a professional publishing experience with a standard that can compete beyond South Africa.',
  },
];

export default function WhyChooseUsNew() {
  return (
    <section className="py-20 lg:py-28 bg-white" aria-labelledby="why-heading">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-14 text-center"
        >
          <span className="text-[#B8955B] text-xs font-body tracking-[0.25em] uppercase mb-3 block">Our Promise</span>
          <h2 id="why-heading" className="font-heading text-3xl md:text-4xl font-bold text-[#101826]">
            Why Authors Choose Creative Books SA
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {reasons.map((r, i) => {
            const Icon = r.icon;
            return (
              <motion.div
                key={r.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.09, duration: 0.5 }}
                whileHover={{ y: -4, transition: { duration: 0.25 } }}
                className="flex gap-5 items-start p-6 rounded-2xl bg-[#F8F5EF] border border-[#E8D8B8]/50"
              >
                <div className="shrink-0 w-11 h-11 rounded-xl bg-white border border-[#E8D8B8]/60 flex items-center justify-center shadow-sm">
                  <Icon className="w-5 h-5 text-[#B8955B]" />
                </div>
                <div>
                  <h3 className="font-heading text-sm font-bold text-[#101826] mb-1.5">{r.title}</h3>
                  <p className="text-xs text-[#2B2B2B]/60 font-body leading-relaxed">{r.desc}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}