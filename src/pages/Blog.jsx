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
  // Existing articles
  { title: 'How Much Does It Cost to Publish a Book in South Africa?', excerpt: 'A detailed breakdown of publishing costs in South Africa, from editing to printing to distribution.', category: 'Publishing Tips', path: '/howmuchdoesitcosttopublishabook', readTime: '8 min' },
  { title: 'How to Get an ISBN in South Africa', excerpt: 'Step-by-step guide to registering your ISBN with the National Library of South Africa.', category: 'Publishing Tips', path: '/howtogetanisbn', readTime: '5 min' },
  { title: 'How to Write a Book: A Complete Guide', excerpt: 'From first idea to finished manuscript — practical tips for aspiring authors.', category: 'Writing Tips', path: '/howtowriteabook', readTime: '12 min' },
  { title: 'Book Printing Costs in South Africa', excerpt: 'Understanding the factors that affect book printing costs and how to get the best value.', category: 'Printing Guides', path: '/bookprintingcosts', readTime: '6 min' },
  { title: 'Best Publishing Company in South Africa', excerpt: 'What to look for when choosing a publishing company and how to find the right fit.', category: 'Publishing Tips', path: '/bestpublishingcompanyinsouthafrica', readTime: '7 min' },
  { title: 'Self Publishing vs Traditional Publishing', excerpt: 'Pros and cons of self-publishing versus traditional publishing for South African authors.', category: 'Publishing Tips', path: '/selfpublishingvstraditionalpublishing', readTime: '9 min' },
  { title: 'How to Sell a Book in South Africa', excerpt: 'Distribution channels, marketing strategies, and sales tips for South African authors.', category: 'Publishing Tips', path: '/howtosellabookinsouthafrica', readTime: '10 min' },
  { title: 'How to Make a Book Cover', excerpt: 'Design principles and tips for creating a book cover that sells.', category: 'Publishing Tips', path: '/howtomakeabookcover', readTime: '6 min' },
  { title: 'Book Editing Explained', excerpt: 'Understanding the different types of editing and when you need each one.', category: 'Editing Guides', path: '/bookeditingexplained', readTime: '5 min' },
  // New articles from content pack
  { title: 'Print on Demand Books in South Africa: What Authors Should Know Before Printing', excerpt: 'Understand how print on demand works, when it makes sense and when bulk printing is the better option for South African authors.', category: 'Printing Guides', path: '/printondemandbooksinsouthafrica', readTime: '7 min' },
  { title: 'How Much Does It Cost to Self Publish on Amazon Kindle?', excerpt: 'The real costs of publishing on Amazon Kindle — from editing and formatting to cover design and marketing.', category: 'Publishing Tips', path: '/howmuchdoesitcosttoselfpublishonamazonkindle', readTime: '7 min' },
  { title: 'Professional Copy Editing Services for Authors in South Africa', excerpt: 'What copy editing includes, how it differs from proofreading and why it matters before layout and printing.', category: 'Editing Guides', path: '/professionalcopyeditingservices', readTime: '7 min' },
  { title: 'What Is Ghostwriting and What Does a Ghostwriter Do?', excerpt: 'Understand what ghostwriting is, who needs a ghostwriter and how the process works for memoir, business and Christian books.', category: 'Writing Tips', path: '/whatisghostwriting', readTime: '7 min' },
  { title: 'Writing a Book Dedication: Meaning, Examples and Practical Tips', excerpt: 'Learn how to write a meaningful book dedication with examples for memoir, business, Christian and children\'s books.', category: 'Writing Tips', path: '/writingabookdedication', readTime: '5 min' },
  { title: 'Writing a Book Acknowledgment Page: Examples and Structure for Authors', excerpt: 'How to write a professional acknowledgment page with a clear structure and examples for South African authors.', category: 'Writing Tips', path: '/writingabookacknowledgment', readTime: '6 min' },
  { title: 'How to Decide a Name for Your Book: A Practical Guide for Authors', excerpt: 'Choose the right book title by matching it to your genre, message and target reader.', category: 'Writing Tips', path: '/howtonameyourbook', readTime: '6 min' },
  { title: 'How to Print Your Self Published Book in South Africa', excerpt: 'A complete step by step guide on how to prepare and print a book professionally in South Africa.', category: 'Printing Guides', path: '/howtoprintyourselfpublishedbookinsouthafrica', readTime: '8 min' },
  { title: "Children's Book Illustrations and Printing in South Africa", excerpt: "A guide for children's book authors on illustrations, layout, colour printing and professional production.", category: 'Printing Guides', path: '/childrensbookillustrationsprinting', readTime: '7 min' },
  { title: 'eBook vs Print Book Self Publishing: Which Option Is Better?', excerpt: 'Compare eBook and print book self publishing to decide which format suits your audience and sales strategy.', category: 'Publishing Tips', path: '/ebookvsprintbookselfpublishing', readTime: '7 min' },
  { title: 'How Long Does It Take to Self Publish a Book?', excerpt: 'Understand the realistic timeline for self publishing a book in South Africa, from manuscript to printing.', category: 'Publishing Tips', path: '/howlongdoesittaketoselfpublish', readTime: '6 min' },
  { title: 'How Much Does It Cost to Self Publish on Amazon?', excerpt: 'A complete guide to the real costs of self publishing on Amazon for South African authors.', category: 'Publishing Tips', path: '/howmuchdoesitcosttoselfpublishonamazon', readTime: '7 min' },
  { title: 'How to Become a Writer in South Africa Through Self Publishing', excerpt: 'A practical guide for aspiring writers on how to build a writing career through self publishing.', category: 'Writing Tips', path: '/howtobecomeawriterinsouthafrica', readTime: '7 min' },
  { title: 'ISBN Registration in South Africa: A Complete Guide for Authors', excerpt: 'Everything South African authors need to know about ISBN registration, who issues ISBNs and where they go.', category: 'Publishing Tips', path: '/isbnregistrationsouthafrica', readTime: '6 min' },
  { title: 'How to Get an ISBN for Your Book in South Africa', excerpt: 'A step by step guide on how to apply for an ISBN through the National Library of South Africa.', category: 'Publishing Tips', path: '/howtogetanisbnforyourbook', readTime: '6 min' },
  { title: "A Beginner's Guide to Self Publishing a Book in South Africa", excerpt: 'A complete beginner\'s guide covering writing, editing, cover design, ISBN, printing and selling your book.', category: 'Publishing Tips', path: '/abeginnersguide', readTime: '8 min' },
  { title: "How to Self Publish Children's Books in South Africa", excerpt: "A complete guide to self publishing a children's book covering age groups, illustrations, layout and colour printing.", category: 'Publishing Tips', path: '/howtoselfpublishchildrensbooks', readTime: '8 min' },
  { title: 'What Is Self Publishing? A Complete Guide for New Authors', excerpt: 'Understand what self publishing means, how it works and how South African authors can publish professionally.', category: 'Publishing Tips', path: '/whatisselfpublishing', readTime: '7 min' },
  { title: 'Copyright FAQs for Authors, Publishers and Self Publishers in South Africa', excerpt: 'Practical answers to common copyright questions covering ownership, protection, infringement and publishing rights in South Africa.', category: 'Publishing Tips', path: '/copyrightfaqsforauthors', readTime: '12 min' },
  { title: 'Questions to Ask a Publisher Before Publishing Your Book in South Africa', excerpt: 'The essential questions every South African author should ask any publisher or self publishing company before paying a deposit or signing paperwork.', category: 'Publishing Tips', path: '/questionstoaskapublisher', readTime: '14 min' },
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