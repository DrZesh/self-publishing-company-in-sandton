import React from 'react';
import PageMeta from '../components/shared/PageMeta';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Clock, ArrowRight } from 'lucide-react';
import CTASection from '../components/shared/CTASection';
import InternalLinks from '../components/shared/InternalLinks';

const articleData = {
  '/howmuchdoesitcosttopublishabook': {
    title: 'How Much Does It Cost to Publish a Book?',
    category: 'Publishing Tips',
    readTime: '8 min read',
    content: [
      { heading: 'Understanding Publishing Costs', text: 'Publishing a book in South Africa involves several cost components: editing, cover design, typesetting, ISBN registration, printing, and distribution. The total investment varies based on your manuscript\'s length, complexity, and the services you choose.' },
      { heading: 'Editing Costs', text: 'Professional editing is essential. Proofreading typically costs R30–R50 per page, copy editing R40–R60 per page, and developmental editing R50–R80 per page. For a 200-page manuscript, editing costs range from R6,000 to R16,000.' },
      { heading: 'Design & Layout Costs', text: 'Cover design ranges from R2,500 for a standard design to R6,000+ for premium or illustrated covers. Interior typesetting costs R2,000–R5,000 depending on complexity.' },
      { heading: 'Printing Costs', text: 'Printing costs depend on page count, paper type, cover type, and quantity. A 200-page A5 softcover book costs approximately R45–R65 per copy for 100 copies, with significant savings on larger runs.' },
      { heading: 'Publishing Packages', text: 'At Creative Books SA, our packages bundle these services for better value. Mini Package from R4,999, Standard from R12,999, and Premium from R24,999. Each package is designed to provide complete publishing solutions at different investment levels.' },
    ],
  },
  '/how-to-get-an-isbn-for-your-book': {
    title: 'How to Get an ISBN in South Africa',
    category: 'Publishing Tips',
    readTime: '5 min read',
    content: [
      { heading: 'What is an ISBN?', text: 'An ISBN (International Standard Book Number) is a 13-digit unique identifier for books. It is essential for selling through bookstores, online retailers, and libraries.' },
      { heading: 'The Registration Process', text: 'In South Africa, ISBNs are issued by the National Library of South Africa (NLSA). You need to register as a publisher first, then apply for ISBNs for each edition of your book.' },
      { heading: 'Let Us Handle It', text: 'Creative Books SA handles ISBN registration as part of all our publishing packages. We manage the paperwork, follow up with the NLSA, and ensure your book is properly listed in national databases.' },
    ],
  },
  '/howtowriteabook': {
    title: 'How to Write a Book: A Complete Guide',
    category: 'Writing Tips',
    readTime: '12 min read',
    content: [
      { heading: 'Finding Your Story', text: 'Every great book starts with a compelling idea. Whether fiction or non-fiction, clarify your central message or story before you begin writing.' },
      { heading: 'Creating an Outline', text: 'An outline serves as your book\'s roadmap. Break your book into chapters, define key points for each, and plan your narrative arc.' },
      { heading: 'The Writing Process', text: 'Set a daily word count goal and write consistently. Don\'t edit as you write — get the first draft down, then revise. Most authors find 500–1,000 words per day is sustainable.' },
      { heading: 'Revision and Editing', text: 'After completing your first draft, take a break, then revise with fresh eyes. Once you\'ve done your best, hire a professional editor to take your manuscript to the next level.' },
    ],
  },
  '/bookprintingcosts': {
    title: 'Book Printing Costs in South Africa',
    category: 'Printing Guides',
    readTime: '6 min read',
    content: [
      { heading: 'Factors Affecting Cost', text: 'Book printing costs depend on page count, trim size, paper type, cover finish, binding type, and quantity. Understanding these factors helps you budget effectively.' },
      { heading: 'Price Estimates', text: 'A standard 200-page A5 softcover with cream paper costs approximately R45–R65 per copy for 100 copies. Hardcover adds R30–R50 per copy. Full-colour printing costs significantly more than black-and-white.' },
    ],
  },
  '/bestpublishingcompanyinsouthafrica': {
    title: 'Best Publishing Company in South Africa',
    category: 'Publishing Tips',
    readTime: '7 min read',
    content: [
      { heading: 'What to Look For', text: 'The best publishing company for you depends on your goals, budget, and the type of book you\'re publishing. Look for transparent pricing, quality work samples, author testimonials, and a clear process.' },
      { heading: 'Why Creative Books SA', text: 'With over 15 years of experience, 500+ published books, and a 98% author satisfaction rate, Creative Books SA is one of South Africa\'s most trusted publishing partners.' },
    ],
  },
  '/selfpublishingvstraditionalpublishing': {
    title: 'Self Publishing vs Traditional Publishing',
    category: 'Publishing Tips',
    readTime: '9 min read',
    content: [
      { heading: 'Traditional Publishing', text: 'Traditional publishers accept manuscripts, handle production and distribution, and pay royalties. However, acceptance rates are very low (less than 1%), the process takes 1–2 years, and authors give up significant rights and royalties.' },
      { heading: 'Self Publishing', text: 'Self-publishing gives authors full control over their book, timeline, pricing, and royalties. With professional support from companies like Creative Books SA, self-published books can match or exceed the quality of traditionally published books.' },
    ],
  },
  '/howtosellabookinsouthafrica': {
    title: 'How to Sell a Book in South Africa',
    category: 'Publishing Tips',
    readTime: '10 min read',
    content: [
      { heading: 'Distribution Channels', text: 'Key channels for South African authors include Takealot, Amazon, local bookstores (Exclusive Books, CNA), online direct sales, and author events.' },
      { heading: 'Marketing Strategies', text: 'Build an author platform through social media, email marketing, book launches, and media coverage. Connect with book clubs and literary communities.' },
    ],
  },
  '/howtomakeabookcover': {
    title: 'How to Make a Book Cover That Sells',
    category: 'Publishing Tips',
    readTime: '6 min read',
    content: [
      { heading: 'Design Principles', text: 'Your cover must communicate genre, create emotional impact, and be legible at thumbnail size. Study bestsellers in your genre for design cues.' },
      { heading: 'Professional vs DIY', text: 'While tools like Canva exist, professional cover design is one of the best investments for your book. A great cover dramatically increases sales potential.' },
    ],
  },
  '/bookeditingexplained': {
    title: 'Book Editing Explained: What You Need to Know',
    category: 'Editing Guides',
    readTime: '5 min read',
    content: [
      { heading: 'Types of Editing', text: 'Developmental editing addresses structure, plot, and overall content. Copy editing focuses on grammar, style, and consistency. Proofreading is the final check for typos and formatting errors.' },
      { heading: 'When to Get Each Type', text: 'Start with developmental editing if your manuscript needs structural work. Copy editing is essential for all manuscripts. Proofreading should be the very last step before printing.' },
    ],
  },
};

export default function BlogArticle() {
  const location = useLocation();
  const article = articleData[location.pathname];

  if (!article) return null;

  const metaMap = {
    '/howmuchdoesitcosttopublishabook': {
      title: 'How Much Does It Cost to Publish a Book?',
      description: 'Complete breakdown of book publishing costs in South Africa — editing, design, printing, ISBN, distribution and marketing.',
    },
    '/how-to-get-an-isbn-for-your-book': {
      title: 'How to Get an ISBN for Your Book | South Africa Guide',
      description: 'Step-by-step guide to getting an ISBN in South Africa — free registration via the National Library, plus tips on barcodes.',
    },
  };
  const pageMeta = metaMap[location.pathname];

  return (
    <div>
      {pageMeta && (
        <PageMeta
          title={pageMeta.title}
          description={pageMeta.description}
          canonical={`https://www.creativebookssa.co.za${location.pathname}`}
        />
      )}
      {/* Hero */}
      <section className="relative pt-32 pb-16 bg-obsidian">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}>
            <Link to="/blog" className="inline-flex items-center gap-2 text-copper text-sm font-body mb-6 hover:underline">
              <ArrowLeft className="w-4 h-4" /> Back to Blog
            </Link>
            <span className="text-copper text-xs font-body bg-copper/10 px-3 py-1 rounded-full">{article.category}</span>
            <h1 className="font-heading text-3xl md:text-4xl lg:text-5xl font-bold text-white mt-4 mb-4">{article.title}</h1>
            <p className="flex items-center gap-2 text-white/50 text-sm font-body"><Clock className="w-4 h-4" /> {article.readTime}</p>
          </motion.div>
        </div>
      </section>

      {/* Content */}
      <section className="py-16 bg-vellum">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <div className="space-y-10">
            {article.content.map((section, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
                <h2 className="font-heading text-2xl font-bold text-[#0F0F0F] mb-4">{section.heading}</h2>
                <p className="text-[#0F0F0F]/70 leading-[1.8] font-body">{section.text}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <InternalLinks
        title="Related Articles & Services"
        links={[
          { label: 'Book Publishing', path: '/book-publishing' },
          { label: 'Book Printing', path: '/book-printing' },
          { label: 'Book Editing', path: '/book-editing' },
          { label: 'Publishing Packages', path: '/publishingpackages/a5' },
          { label: 'Get a Quote', path: '/getquote' },
          { label: 'Blog', path: '/blog' },
        ]}
        light
      />
      <CTASection />
    </div>
  );
}