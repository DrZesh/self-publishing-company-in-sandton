import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Clock, Award, Heart } from 'lucide-react';
import SectionHeading from '../shared/SectionHeading';

const reasons = [
  { icon: Shield, title: 'Author-First Approach', description: 'You retain 100% of your rights. We work for you, not the other way around.' },
  { icon: Clock, title: 'Fast Turnaround', description: 'Streamlined processes from manuscript to published book within weeks, not months.' },
  { icon: Award, title: 'Award-Winning Quality', description: 'Premium printing, expert editing, and world-class design for every project.' },
  { icon: Heart, title: 'South African Pride', description: 'Based in Johannesburg, serving authors across South Africa and internationally.' },
];

export default function WhyChooseUs({ bookImage }) {
  return (
    <section className="py-20 lg:py-28 bg-obsidian overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <SectionHeading
              subtitle="Why Creative Books SA"
              title="South Africa's Most Trusted Publishing Partner"
              description="For over 15 years, we've helped hundreds of authors turn their dreams into published reality."
              light
              center={false}
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {reasons.map((reason, i) => {
                const Icon = reason.icon;
                return (
                  <motion.div
                    key={reason.title}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className="bg-white/5 border border-white/10 rounded-xl p-6"
                  >
                    <Icon className="w-8 h-8 text-copper mb-3" />
                    <h3 className="font-heading text-base font-semibold text-white mb-2">{reason.title}</h3>
                    <p className="text-sm text-white/50 leading-relaxed font-body">{reason.description}</p>
                  </motion.div>
                );
              })}
            </div>
          </div>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="absolute -inset-4 bg-copper/10 rounded-3xl blur-2xl" />
            <img src={bookImage} alt="Premium book stack by Creative Books SA" className="relative rounded-2xl shadow-2xl w-full" />
          </motion.div>
        </div>
      </div>
    </section>
  );
}