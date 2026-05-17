import React from 'react';
import BlogArticlePage from './BlogArticlePage';

const article = {
  url: '/traditionalvsselfpublishingroyaltiesinsouthafrica',
  title: 'Traditional vs Self-Publishing Royalties | True Earnings',
  description: 'Traditional vs self-publishing royalties in South Africa — real per-copy earnings compared, with numbers showing which route pays more and when.',
  category: 'Publishing Tips',
  readTime: '6 min read',
  datePublished: '2026-02-05',
  sections: [
    { heading: null, text: "Royalties are the author's share of revenue from book sales — but the structure, rates, and real-world returns differ dramatically between traditional and self-publishing." },
    { heading: 'Traditional Publishing Royalties: The Structure', text: "Traditional publishers typically offer: 10–12.5% of RRP or net receipts for paperback; 12.5–15% for hardcover; 25–50% for eBook. Example: a paperback at R280, 10% royalty = R28 per copy. On 1,000 copies sold, you earn R28,000." },
    { heading: 'Self-Publishing with Creative Books SA: You Keep 100%', text: "When you self-publish through Creative Books SA, you pay a once-off production fee and keep every rand of your sales income. Example: a self-published book at R280 × 1,000 copies = R280,000 in sales revenue, all to you. After a Creative Books SA Full Package Bronze investment of R21,000, net profit on 1,000 copies would be R259,000 vs R28,000 with a traditional publisher — a dramatic difference. View <a href='/selfpublishingpackagesinsouthafrica'>packages</a>." },
    { heading: 'The True Comparison: Total Return, Not Rate', text: "The higher revenue in self-publishing doesn't automatically translate to higher income if you can't sell the copies. Traditional publishers provide bookshop distribution, editorial teams, and marketing relationships. The right model depends on your ability to reach your audience independently." },
    { heading: 'Which Model Pays More?', text: "It depends entirely on execution. A self-published author selling 2,000 copies at 100% revenue through Creative Books SA will almost certainly earn more than a traditionally published author selling the same volume at 10% royalties. The key is professional production and marketing." },
  ],
  ctaText: "Keep 100% of your book revenue. Self-publish professionally with Creative Books SA — transparent once-off pricing, no royalty splits.",
  faqs: [
    { q: 'What are typical royalty rates in South African traditional publishing?', a: "10–12.5% of RRP for paperback, 12.5–15% for hardcover, and 25–50% for eBooks." },
    { q: 'How does self-publishing compare financially to traditional publishing?', a: "Self-publishing keeps 100% of revenue but requires your own marketing. A self-published author earning R280 per copy sells 1,000 copies for R280,000; a traditionally published author at 10% royalty earns R28,000 from the same sales." },
  ],
  relatedLinks: [
    { label: 'Self Publishing Packages', path: '/selfpublishingpackagesinsouthafrica' },
    { label: 'Self Publishing vs Traditional Publishing', path: '/selfpublishingvstraditionalpublishing' },
    { label: 'How Much Will I Earn', path: '/howmuchwilliearnfrommyfirstbook' },
    { label: 'Request a Quote', path: '/getquote' },
  ],
};

export default function TraditionalVsSelfPublishingRoyalties() {
  return <BlogArticlePage article={article} />;
}