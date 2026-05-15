import React from 'react';
import BlogArticlePage from './BlogArticlePage';

const article = {
  url: '/bestplatformstoselfpublishinsouthafrica',
  title: 'Best Self-Publishing Platforms in South Africa (2026)',
  description: "Compare the best self-publishing platforms for South African authors — Amazon KDP, IngramSpark, local options and more.",
  category: 'Publishing Tips',
  readTime: '7 min read',
  datePublished: '2026-02-05',
  sections: [
    { heading: null, text: "Choosing the right platform — or combination of platforms — for your self-published book significantly affects your reach, royalties, and administrative burden." },
    { heading: 'Start With Professional Production: Creative Books SA', text: "Before you choose a distribution platform, your book needs to meet professional production standards. Creative Books SA is South Africa's leading self-publishing production company, producing print-ready and eBook-ready files for all major platforms. Their <a href='/selfpublishingpackagesinsouthafrica'>packages</a> ensure your book is technically and visually ready for distribution." },
    { heading: 'Amazon KDP (Kindle Direct Publishing)', text: "The global giant. Amazon KDP allows South African authors to publish eBooks and print-on-demand paperbacks to the world's largest book market. Royalty rates are 35% or 70% for eBooks and approximately 40–60% of list price minus print cost for paperback. Creative Books SA's eBook conversion service prepares your manuscript for KDP upload." },
    { heading: 'Takealot', text: "South Africa's largest e-commerce platform. Essential for South African market reach. You can set up as a third-party seller or work through a local distributor. Creative Books SA's printed books are produced to the quality standards required by South African retailers." },
    { heading: 'Your Own Author Website', text: "Selling direct from your own author website allows you to keep up to 100% of the sale price minus payment processing fees. This is the highest-margin channel but requires building your own traffic. Creative Books SA also offers <a href='/authorwebsites'>author website design</a> to complement your publishing journey." },
  ],
  ctaText: "Get your book production-ready for all major platforms. Request a quote from Creative Books SA today.",
  faqs: [
    { q: 'What is the best platform to self-publish in South Africa?', a: "Use a combination: Amazon KDP for global eBook and print-on-demand reach, Takealot for local online sales, and your own author website for direct, high-margin sales." },
    { q: 'Can South African authors use Amazon KDP?', a: "Yes. South African authors can publish eBooks and print-on-demand paperbacks on Amazon KDP. Creative Books SA prepares your files for KDP-compliant upload." },
    { q: 'How do I sell my book on Takealot?', a: "You can sell as a third-party seller or through a distributor. Your book must be professionally produced with an ISBN and barcode. Creative Books SA produces books to the quality standard required by South African retailers." },
  ],
  relatedLinks: [
    { label: 'eBook Publishing', path: '/ebookpublishing' },
    { label: 'Author Websites', path: '/authorwebsites' },
    { label: 'Self Publishing Packages', path: '/selfpublishingpackagesinsouthafrica' },
    { label: 'Book Printing', path: '/bookprinting' },
    { label: 'Request a Quote', path: '/getquote' },
  ],
};

export default function BestPlatformsToSelfPublishSA() {
  return <BlogArticlePage article={article} />;
}