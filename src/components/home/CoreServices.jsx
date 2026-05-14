import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BookOpen, PenLine, Image, Layout, Ghost, Baby, Tablet, Globe, ArrowRight } from 'lucide-react';

const services = [
  {
    icon: BookOpen,
    title: 'Book Printing',
    desc: 'Professional paperback book printing for authors, publishers, schools, churches, businesses and organisations.',
    label: 'View Book Printing',
    to: '/bookprinting',
  },
  {
    icon: PenLine,
    title: 'Book Editing and Proofreading',
    desc: 'Improve grammar, clarity, sentence flow, consistency and readability before publishing.',
    label: 'View Editing Services',
    to: '/bookediting',
  },
  {
    icon: Image,
    title: 'Book Cover Design',
    desc: 'Create a professional book cover that attracts readers and matches your genre.',
    label: 'View Cover Design',
    to: '/bookcoverdesign',
  },
  {
    icon: Layout,
    title: 'Typesetting and Layout',
    desc: 'Turn your manuscript into a clean, professional and print-ready book interior.',
    label: 'View Typesetting',
    to: '/typesetting',
  },
  {
    icon: Ghost,
    title: 'Ghostwriting and Writing Support',
    desc: 'Get help turning your ideas, story or message into structured written content.',
    label: 'View Ghostwriting',
    to: '/ghostwriting',
  },
  {
    icon: Baby,
    title: "Children's Book Illustration",
    desc: "Bring children's stories to life with character development, scenery and visual storytelling.",
    label: "View Children's Books",
    to: '/childrensbookpublishing',
  },
  {
    icon: Tablet,
    title: 'Ebook Publishing',
    desc: 'Prepare your book for digital readers and online publishing platforms.',
    label: 'View Ebook Services',
    to: '/ebookpublishing',
  },
  {
    icon: Globe,
    title: 'Author Website Design',
    desc: 'Build a professional online presence for your book and author brand.',
    label: 'View Website Design',
    to: '/authorwebsites',
  },
];

export default function CoreServices() {
  return (
    <section className="py-20 lg:py-28 bg-white" aria-labelledby="services-heading">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-14"
        >
          <span className="text-[#B8955B] text-xs font-body tracking-[0.25em] uppercase mb-3 block">What We Do</span>
          <h2 id="services-heading" className="font-heading text-3xl md:text-4xl font-bold text-[#101826] mb-4 max-w-2xl">
            Complete Self-Publishing and Book Production Services
          </h2>
          <p className="text-[#2B2B2B]/60 max-w-2xl font-body text-base leading-relaxed">
            Creative Books SA supports authors at every stage of the book production journey, from manuscript preparation to printed copies and digital publishing.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {services.map((svc, i) => {
            const Icon = svc.icon;
            return (
              <motion.div
                key={svc.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.07, duration: 0.5 }}
                whileHover={{ y: -4, transition: { duration: 0.25 } }}
                className="bg-[#F8F5EF] rounded-2xl p-6 flex flex-col border border-[#E8D8B8]/50 group"
              >
                <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center mb-4 shadow-sm border border-[#E8D8B8]/60 group-hover:border-[#B8955B]/40 transition-colors">
                  <Icon className="w-5 h-5 text-[#B8955B]" />
                </div>
                <h3 className="font-heading text-sm font-bold text-[#101826] mb-2 leading-snug">{svc.title}</h3>
                <p className="text-xs text-[#2B2B2B]/60 font-body leading-relaxed flex-1 mb-4">{svc.desc}</p>
                <Link
                  to={svc.to}
                  className="inline-flex items-center gap-1.5 text-xs font-medium text-[#B8955B] hover:text-[#101826] transition-colors group/link"
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