import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, BookOpen } from 'lucide-react';

const featuredPosts = [
  {
    title: 'How Much Does It Cost to Publish a Book in South Africa?',
    excerpt: 'Real costs, real numbers — editing, cover design, layout, printing and ISBN broken down honestly for South African authors.',
    path: '/howmuchdoesitcosttopublishabook',
    tag: 'Publishing Costs',
  },
  {
    title: 'A Beginner\'s Guide to Self-Publishing in South Africa',
    excerpt: 'Everything you need to know about self-publishing — from manuscript to printed book — with local pricing and the truth about distribution.',
    path: '/abeginnersguide',
    tag: 'Getting Started',
  },
  {
    title: 'How to Get an ISBN for Your Book in South Africa',
    excerpt: 'Step-by-step guide to registering your ISBN through the National Library of South Africa — free, official, and required for retail.',
    path: '/how-to-get-an-isbn-for-your-book',
    tag: 'ISBN Guide',
  },
];

export default function FeaturedBlog() {
  return (
    <section className="relative py-20 lg:py-28 overflow-hidden bg-vellum">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <span className="text-copper text-sm font-body tracking-[0.25em] uppercase mb-3 block">Learn More</span>
          <h2 className="font-heading text-3xl md:text-4xl font-bold text-[#0F0F0F] mb-4">
            Self-Publishing Guides for South African Authors
          </h2>
          <p className="text-[#0F0F0F]/55 font-body max-w-xl mx-auto text-base">
            Practical advice on costs, ISBNs, printing, and the self-publishing process — written for SA authors.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          {featuredPosts.map((post, i) => (
            <motion.div
              key={post.path}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ y: -4, transition: { duration: 0.25 } }}
            >
              <Link
                to={post.path}
                className="group flex flex-col h-full p-7 rounded-2xl transition-all"
                style={{
                  background: 'rgba(255,255,255,0.9)',
                  border: '1px solid rgba(184,115,51,0.1)',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
                }}
              >
                <div className="flex items-center gap-2 mb-4">
                  <BookOpen className="w-4 h-4 text-copper" />
                  <span className="text-copper text-xs font-medium tracking-wide uppercase">{post.tag}</span>
                </div>
                <h3 className="font-heading text-base font-semibold text-[#0F0F0F] mb-3 leading-snug group-hover:text-copper transition-colors">
                  {post.title}
                </h3>
                <p className="text-[#0F0F0F]/55 text-sm font-body leading-relaxed flex-1 mb-5">
                  {post.excerpt}
                </p>
                <span className="inline-flex items-center gap-1.5 text-copper text-sm font-medium">
                  Read Article <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </span>
              </Link>
            </motion.div>
          ))}
        </div>

        <div className="text-center">
          <Link
            to="/blog"
            className="inline-flex items-center gap-2 px-7 py-3 rounded-full font-medium text-sm text-[#0F0F0F]/70 hover:text-copper transition-colors"
            style={{ border: '1px solid rgba(0,0,0,0.12)' }}
          >
            Read All Articles <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}