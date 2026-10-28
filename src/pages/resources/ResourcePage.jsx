import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, BookOpen, CheckCircle } from 'lucide-react';
import SectionHeading from '../../components/shared/SectionHeading';
import CTASection from '../../components/shared/CTASection';
import FAQSection from '../../components/shared/FAQSection';
import InternalLinks from '../../components/shared/InternalLinks';
import PageMeta from '../../components/shared/PageMeta';

const resourceData = {
  isbnregistration: {
    subtitle: 'ISBN South Africa',
    title: 'ISBN Registration in South Africa',
    description: 'Everything you need to know about getting an ISBN for your book in South Africa. We handle the complete registration process.',
    sections: [
      { heading: 'What is an ISBN?', content: 'An ISBN (International Standard Book Number) is a unique 13-digit identifier assigned to each edition of a book. It is required for selling books through bookstores, online retailers, and libraries in South Africa and internationally.' },
      { heading: 'How to Get an ISBN in South Africa', content: 'ISBNs in South Africa are issued by the National Library of South Africa (NLSA). The process involves completing an application form, providing publisher details, and submitting book metadata. Creative Books SA handles this entire process for our authors.' },
      { heading: 'ISBN Registration Process', content: 'The registration typically takes 2–4 weeks through the NLSA. Each format (softcover, hardcover, eBook) requires a separate ISBN. We ensure all your book formats are properly registered.' },
    ],
  },
  howtopublishabook: {
    subtitle: 'Publishing Guide',
    title: 'How to Publish a Book in South Africa',
    description: 'A comprehensive step-by-step guide to publishing your book in South Africa, from manuscript completion to distribution.',
    sections: [
      { heading: 'Step 1: Complete Your Manuscript', content: 'Before publishing, ensure your manuscript is complete and has been through at least one round of self-editing. A finished manuscript is the foundation of a successful book.' },
      { heading: 'Step 2: Professional Editing', content: 'Every manuscript needs professional editing. Start with a manuscript evaluation to identify major issues, then proceed to copy editing and proofreading for a polished final product.' },
      { heading: 'Step 3: Design & Layout', content: 'Professional cover design and interior typesetting are essential. Your cover is the first thing readers see — invest in a design that captures your book\'s essence.' },
      { heading: 'Step 4: ISBN & Registration', content: 'Register your ISBN with the National Library of South Africa. Each format (print, eBook) needs its own ISBN. Your publisher can handle this on your behalf.' },
      { heading: 'Step 5: Printing & Distribution', content: 'Choose between offset printing for larger runs or print-on-demand for flexibility. Set up distribution through online retailers and local bookstores.' },
    ],
  },
  publishingguide: {
    subtitle: 'Publishing Guide',
    title: 'The Complete Publishing Guide',
    description: 'Your comprehensive guide to understanding the book publishing process in South Africa, from manuscript to marketplace.',
    sections: [
      { heading: 'Understanding Publishing Options', content: 'South African authors have three main options: traditional publishing (submitting to publishers), self-publishing (managing the process yourself), and assisted publishing (using a company like Creative Books SA for professional support).' },
      { heading: 'Choosing the Right Package', content: 'Consider your budget, timeline, and goals. Mini packages suit simple projects, standard packages cover most needs, and premium packages provide the full professional experience.' },
    ],
  },
  printingguide: {
    subtitle: 'Book Printing Guide',
    title: 'Book Printing Guide',
    description: 'Everything you need to know about book printing — paper types, binding options, sizes, and how to prepare your files for print.',
    sections: [
      { heading: 'Paper Options', content: 'Choose between cream paper (best for novels and literary works) and white paper (ideal for children\'s books and illustrated works). Available in 80gsm and 100gsm weights.' },
      { heading: 'Binding Types', content: 'Perfect binding (softcover) is the most popular and affordable option. Case binding (hardcover) adds premium quality. Saddle-stitching suits thin booklets and workbooks.' },
    ],
  },
  editingguide: {
    subtitle: 'Editing Guide',
    title: 'Book Editing Guide',
    description: 'Understand the different types of editing and choose the right service for your manuscript.',
    sections: [
      { heading: 'Types of Editing', content: 'From developmental editing (structure and content) to proofreading (final error check), each type serves a specific purpose. Most manuscripts benefit from copy editing at minimum.' },
    ],
  },
  bookmarketingguide: {
    subtitle: 'Book Marketing',
    title: 'Book Marketing Guide',
    description: 'Learn effective strategies to market and sell your book in South Africa and internationally.',
    sections: [
      { heading: 'Building Your Author Platform', content: 'Start with a professional author website and social media presence. Build an email list and engage with readers in your genre community.' },
    ],
  },
};

export default function ResourcePage({ resourceKey }) {
  const data = resourceData[resourceKey];
  if (!data) return null;

  return (
    <div>
      <PageMeta
        title="Author Resources & Publishing Guides | Creative Books SA"
        description="Free resources for South African authors — publishing guides, templates, calculators and how-to articles. Everything needed to self-publish a book."
        canonical="https://www.creativebookssa.co.za/resources"
      />
      {/* Hero */}
      <section className="relative pt-32 pb-16 bg-obsidian">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="max-w-3xl mx-auto text-center">
            <span className="text-copper text-sm font-body tracking-[0.25em] uppercase mb-4 block">{data.subtitle}</span>
            <h1 className="font-heading text-4xl md:text-5xl font-bold text-white mb-6">{data.title}</h1>
            <p className="text-white/60 text-lg leading-relaxed font-body">{data.description}</p>
          </motion.div>
        </div>
      </section>

      {/* Content Sections */}
      <section className="py-20 bg-vellum">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <div className="space-y-12">
            {data.sections.map((section, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <h2 className="font-heading text-2xl font-bold text-[#0F0F0F] mb-4">{section.heading}</h2>
                <p className="text-[#0F0F0F]/70 leading-relaxed font-body">{section.content}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <InternalLinks
        title="Related Resources & Services"
        links={[
          { label: 'Book Publishing', path: '/book-publishing' },
          { label: 'Book Printing', path: '/book-printing' },
          { label: 'Book Editing', path: '/book-editing' },
          { label: 'Cover Design', path: '/book-cover-design' },
          { label: 'Publishing Guide', path: '/publishingguide' },
          { label: 'ISBN Registration', path: '/isbn' },
          { label: 'Blog', path: '/blog' },
          { label: 'Get a Quote', path: '/getquote' },
        ]}
        light
      />
      <CTASection />
    </div>
  );
}