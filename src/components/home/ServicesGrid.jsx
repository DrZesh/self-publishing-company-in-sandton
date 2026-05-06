import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BookOpen, Printer, PenLine, Palette, Globe, Users, ArrowRight } from 'lucide-react';
import SectionHeading from '../shared/SectionHeading';

const services = [
  {
    icon: BookOpen,
    title: 'Book Publishing',
    description: 'Complete publishing solutions from manuscript to marketplace. Self-publishing and full-service packages available.',
    link: '/bookpublishing',
  },
  {
    icon: Printer,
    title: 'Book Printing',
    description: 'High-quality offset and digital printing in Johannesburg. Hardcover, softcover, and specialty formats.',
    link: '/bookprinting',
  },
  {
    icon: PenLine,
    title: 'Editing Services',
    description: 'Professional proofreading, copy editing, manuscript evaluation, and academic editing by expert editors.',
    link: '/bookediting',
  },
  {
    icon: Palette,
    title: 'Design Services',
    description: 'Stunning book cover design, typesetting, layout, and formatting that captures your vision.',
    link: '/bookcoverdesign',
  },
  {
    icon: Globe,
    title: 'eBook Publishing',
    description: 'Publish on Amazon KDP, Kindle, and global platforms. Full digital formatting and distribution.',
    link: '/ebookpublishing',
  },
  {
    icon: Users,
    title: 'Ghostwriting',
    description: 'Professional ghostwriters for memoirs, biographies, business books, and Christian literature.',
    link: '/ghostwriting',
  },
];

export default function ServicesGrid() {
  return (
    <section className="py-20 lg:py-28 bg-vellum">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <SectionHeading
          subtitle="Our Services"
          title="Everything You Need to Publish"
          description="From first draft to final print, we provide the complete publishing ecosystem for South African authors."
        />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service, i) => {
            const Icon = service.icon;
            return (
              <motion.div
                key={service.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
              >
                <Link to={service.link} className="group block bg-white p-8 rounded-2xl border border-[#0F0F0F]/5 shadow-sm hover:shadow-lg hover:border-copper/20 transition-all h-full">
                  <div className="w-12 h-12 rounded-xl bg-copper/10 flex items-center justify-center mb-6 group-hover:bg-copper/20 transition-colors">
                    <Icon className="w-6 h-6 text-copper" />
                  </div>
                  <h3 className="font-heading text-xl font-semibold text-[#0F0F0F] mb-3">{service.title}</h3>
                  <p className="text-sm text-[#0F0F0F]/60 leading-relaxed mb-4 font-body">{service.description}</p>
                  <span className="inline-flex items-center gap-1 text-sm text-copper font-medium font-body group-hover:gap-2 transition-all">
                    Learn More <ArrowRight className="w-3 h-3" />
                  </span>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}