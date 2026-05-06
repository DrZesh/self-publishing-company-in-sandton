import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Clock, Tag } from 'lucide-react';
import SectionHeading from '../components/shared/SectionHeading';
import CTASection from '../components/shared/CTASection';

const categories = [
  { label: 'All', path: '/blog' },
  { label: 'Publishing Tips', path: '/publishingtips' },
  { label: 'Writing Tips', path: '/writingtips' },
  { label: 'Printing Guides', path: '/printingguides' },
  { label: 'Editing Guides', path: '/editingguides' },
  { label: 'Author Success Stories', path: '/authorsuccessstories' },
];

const articles = [
  { title: 'How Much Does It Cost to Publish a Book in South Africa?', excerpt: 'A detailed breakdown of publishing costs in South Africa, from editing to printing to distribution.', category: 'Publishing Tips', path: '/howmuchdoesitcosttopublishabook', readTime: '8 min' },
  { title: 'How to Get an ISBN in South Africa', excerpt: 'Step-by-step guide to registering your ISBN with the National Library of South Africa.', category: 'Publishing Tips', path: '/howtogetanisbn', readTime: '5 min' },
  { title: 'How to Write a Book: A Complete Guide', excerpt: 'From first idea to finished manuscript — practical tips for aspiring authors.', category: 'Writing Tips', path: '/howtowriteabook', readTime: '12 min' },
  { title: 'Book Printing Costs in South Africa', excerpt: 'Understanding the factors that affect book printing costs and how to get the best value.', category: 'Printing Guides', path: '/bookprintingcosts', readTime: '6 min' },
  { title: 'Best Publishing Company in South Africa', excerpt: 'What to look for when choosing a publishing company and how to find the right fit.', category: 'Publishing Tips', path: '/bestpublishingcompanyinsouthafrica', readTime: '7 min' },
  { title: 'Self Publishing vs Traditional Publishing', excerpt: 'Pros and cons of self-publishing versus traditional publishing for South African authors.', category: 'Publishing Tips', path: '/selfpublishingvstraditionalpublishing', readTime: '9 min' },
  { title: 'How to Sell a Book in South Africa', excerpt: 'Distribution channels, marketing strategies, and sales tips for South African authors.', category: 'Publishing Tips', path: '/howtosellabookinsouthafrica', readTime: '10 min' },
  { title: 'How to Make a Book Cover', excerpt: 'Design principles and tips for creating a book cover that sells.', category: 'Publishing Tips', path: '/howtomakeabookcover', readTime: '6 min' },
  { title: 'Book Editing Explained', excerpt: 'Understanding the different types of editing and when you need each one.', category: 'Editing Guides', path: '/bookeditingexplained', readTime: '5 min' },
];

export default function Blog() {
  const location = useLocation();
  const currentPath = location.pathname;
  const isCategory = categories.some(c => c.path === currentPath && c.path !== '/blog');
  const categoryName = categories.find(c => c.path === currentPath)?.label;

  const filteredArticles = isCategory
    ? articles.filter(a => a.category === categoryName)
    : articles;

  return (
    <div>
      {/* Hero */}
      <section className="relative pt-32 pb-16 bg-obsidian">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="text-center max-w-2xl mx-auto">
            <span className="text-copper text-sm font-body tracking-[0.25em] uppercase mb-4 block">Blog</span>
            <h1 className="font-heading text-4xl md:text-5xl font-bold text-white mb-6">
              {isCategory ? categoryName : 'Publishing Insights & Guides'}
            </h1>
            <p className="text-white/60 text-lg leading-relaxed font-body">
              Expert advice on publishing, writing, printing, editing, and book marketing in South Africa.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-6 bg-vellum border-b border-[#0F0F0F]/5 sticky top-20 z-40 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex gap-2 overflow-x-auto pb-2">
            {categories.map((cat) => (
              <Link key={cat.path} to={cat.path}
                className={`px-4 py-2 rounded-full text-sm whitespace-nowrap transition-all ${
                  currentPath === cat.path
                    ? 'bg-copper text-white'
                    : 'bg-white border border-[#0F0F0F]/10 text-[#0F0F0F]/60 hover:border-copper/30'
                }`}>
                {cat.label}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Articles Grid */}
      <section className="py-16 bg-vellum">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredArticles.map((article, i) => (
              <motion.div
                key={article.path}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
              >
                <Link to={article.path}
                  className="group block bg-white p-6 rounded-2xl border border-[#0F0F0F]/5 shadow-sm hover:shadow-lg hover:border-copper/20 transition-all h-full">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-xs text-copper font-body font-medium bg-copper/10 px-2.5 py-1 rounded-full">{article.category}</span>
                    <span className="flex items-center gap-1 text-xs text-[#0F0F0F]/40 font-body">
                      <Clock className="w-3 h-3" /> {article.readTime}
                    </span>
                  </div>
                  <h3 className="font-heading text-lg font-semibold text-[#0F0F0F] mb-3 group-hover:text-copper transition-colors">{article.title}</h3>
                  <p className="text-sm text-[#0F0F0F]/60 leading-relaxed font-body mb-4">{article.excerpt}</p>
                  <span className="inline-flex items-center gap-1 text-sm text-copper font-medium font-body group-hover:gap-2 transition-all">
                    Read More <ArrowRight className="w-3 h-3" />
                  </span>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <CTASection />
    </div>
  );
}