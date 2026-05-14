import React from 'react';
import BlogArticlePage from './BlogArticlePage';

const article = {
  url: '/dosouthafricanauthorsneedinternationaldistribution',
  title: 'Do South African Authors Need International Distribution?',
  description: "When international distribution matters for South African authors — digital distribution via Amazon KDP, physical distribution via IngramSpark, and when to focus locally.",
  category: 'Publishing Tips',
  readTime: '6 min read',
  datePublished: '2026-02-05',
  sections: [
    { heading: null, text: "For many South African authors, the dream of having their book available worldwide is compelling. Here's what you need to know." },
    { heading: 'Why International Distribution Matters', text: "South Africa's domestic book market is limited in size. For authors writing in English — particularly in commercially popular genres — international distribution opens up much larger markets, especially the UK, USA, and Australia." },
    { heading: 'Digital Distribution: The Easiest Route', text: "Creative Books SA's eBook packages prepare your manuscript for Amazon KDP, allowing South African authors to publish eBooks and print-on-demand paperbacks to a global audience. Their eBook package starts at R6,500 and includes layout and conversion for up to 150 pages. View <a href='/ebookpublishing'>eBook options</a>." },
    { heading: 'Physical Book Distribution', text: "For physical books, Creative Books SA produces print-ready files that can be submitted to international print-on-demand platforms like IngramSpark, which places your book in the catalogues of thousands of international bookshops and libraries." },
    { heading: 'When International Distribution Is Not the Priority', text: "If your book is deeply rooted in South African stories, culture, or vernacular — or if it targets the South African school market — domestic distribution and direct sales channels may be far more valuable than international reach. Focus your energy on the market most likely to buy your book." },
  ],
  ctaText: "Prepare your book for both local and international distribution. Request a quote from Creative Books SA today.",
  faqs: [
    { q: 'Do South African authors need international distribution?', a: "It depends on your genre and audience. English-language commercial fiction and non-fiction benefit from international reach via Amazon KDP. Locally focused content may perform better through direct domestic channels." },
    { q: 'How can South African authors reach international readers?', a: "Through Amazon KDP eBooks and print-on-demand, and through print-ready files submitted to IngramSpark for placement in international bookshop catalogues." },
  ],
  relatedLinks: [
    { label: 'eBook Publishing', path: '/ebookpublishing' },
    { label: 'Book Printing', path: '/bookprinting' },
    { label: 'Self Publishing South Africa', path: '/selfpublishingsouthafrica' },
    { label: 'Request a Quote', path: '/getquote' },
  ],
};

export default function DoAuthorsNeedInternationalDistribution() {
  return <BlogArticlePage article={article} />;
}