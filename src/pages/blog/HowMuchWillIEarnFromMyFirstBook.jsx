import React from 'react';
import BlogArticlePage from './BlogArticlePage';

const article = {
  url: '/howmuchwilliearnfrommyfirstbook',
  title: 'How Much Will I Earn From My First Book?',
  description: 'Realistic first-book earnings for South African authors — royalty rates, print-run economics and what\'s typical for self-published vs traditional debuts.',
  category: 'Publishing Tips',
  readTime: '7 min read',
  datePublished: '2026-02-05',
  sections: [
    { heading: null, text: 'One of the most searched questions from aspiring South African authors — and one that deserves an honest answer. The reality of author income in South Africa is more complex than most people expect.' },
    { heading: 'Traditional Publishing Royalties in South Africa', text: 'If you publish with a traditional South African publisher, you can typically expect 10–12.5% royalty on the recommended retail price (RRP) for paperback, 12.5–15% for hardcover, and 25–50% for eBook sales. On a book priced at R260, a 10% royalty gives you R26 per copy.' },
    { heading: 'Self-Publishing: You Keep 100% of Your Profits', text: 'When you self-publish through Creative Books SA, you pay a once-off production fee and then retain every rand of your sales income. There are no ongoing royalty deductions. If your book retails at R250 and you sell 500 copies, R125,000 goes directly to you — not split with a publisher. On digital platforms, Amazon KDP pays 70% royalties on eBooks priced appropriately.' },
    { heading: 'Realistic First-Year Earnings', text: 'Most debut authors in South Africa earn relatively little from their first book in year one, regardless of route. The real financial advantage of self-publishing emerges when you have multiple titles, a growing audience, and direct sales channels. Use your first book to build your platform and reputation.' },
    { heading: 'Beyond Royalties: Other Income Streams', text: 'Successful South African authors supplement book income with speaking engagements, workshops, consulting, and online courses. A published book opens doors to this kind of income that far exceeds royalties — making the investment in a professional production through Creative Books SA a smart business decision.' },
  ],
  ctaText: 'Ready to self-publish and keep 100% of your earnings? Creative Books SA offers professional once-off publishing packages. Request a quote today.',
  faqs: [
    { q: 'How much do South African authors earn from royalties?', a: 'Traditional publishers typically pay 10–12.5% royalty on paperbacks. Self-published authors keep 100% of their sales income after the once-off production fee.' },
    { q: 'Is self-publishing more profitable than traditional publishing?', a: 'Self-publishing typically generates more income per copy sold, but only if you can reach your audience effectively. With Creative Books SA\'s packages, you keep all sales revenue after a once-off production investment.' },
    { q: 'What other income can authors earn beyond book sales?', a: 'Speaking engagements, workshops, consulting, and online courses are common income streams for South African authors. A published book is a credibility tool that opens these doors.' },
  ],
  relatedLinks: [
    { label: 'Self Publishing Packages', path: '/self-publishing-packages-in-south-africa' },
    { label: 'eBook Publishing', path: '/ebook-publishing' },
    { label: 'Self Publishing South Africa', path: '/self-publishing-south-africa' },
    { label: 'Request a Quote', path: '/getquote' },
  ],
};

export default function HowMuchWillIEarnFromMyFirstBook() {
  return <BlogArticlePage article={article} />;
}