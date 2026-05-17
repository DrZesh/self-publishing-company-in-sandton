import React from 'react';
import BlogArticlePage from './BlogArticlePage';

const article = {
  url: '/howtogetyourbookreviewedbysouthafricanpublications',
  title: 'How to Get Your Book Reviewed in South Africa',
  description: 'How to get your book reviewed in South Africa — submitting to newspapers, BookStagram, Goodreads and SA media publications to drive real sales.',
  category: 'Publishing Tips',
  readTime: '6 min read',
  datePublished: '2026-02-05',
  sections: [
    { heading: null, text: "A well-placed book review can transform the trajectory of your title — generating bookshop orders, media interest, and word-of-mouth that no advertisement can replicate." },
    { heading: 'Who Reviews Books in South Africa?', text: "South Africa's literary review landscape includes: newspapers (Sunday Times Books, Mail & Guardian Books Supplement, Business Day); magazines (Woolworths TASTE, Destiny, Vrye Weekblad); and online platforms (LitNet, Book SA, The Con)." },
    { heading: 'How to Submit Your Book for Review', text: "Send a physical review copy with a personalised cover letter explaining why this book is relevant to their readership. Include a press release with key selling points and your author credentials. Target the specific reviewer by name. Send 6–10 weeks before your launch date. Your Creative Books SA printed books are production-quality and suitable for review copy distribution." },
    { heading: 'Goodreads and Digital Reviews', text: "Build a base of early reviews by sending advance copies to engaged readers from your email list before launch. Request honest reviews — never offer payment for reviews." },
    { heading: 'BookInfluencers and Bookstagram', text: "South African BookStagram and BookTok have grown substantially. Identify influential South African book accounts with engaged followings in your genre and offer a free copy in exchange for an honest review. The professional book mockups included in Creative Books SA packages are ideal for this kind of social media outreach." },
  ],
  ctaText: "Get your book print-ready for media and review copies. Request a quote from Creative Books SA today.",
  faqs: [
    { q: 'How do I get my book reviewed in South African newspapers?', a: "Send a review copy with a personalised cover letter and press release to the specific books editor 6–10 weeks before launch. Target Sunday Times, Mail & Guardian, and Business Day." },
    { q: 'How do I build early reviews for my self-published book?', a: "Send advance reader copies (ARCs) to engaged readers from your email list before launch. Request honest Goodreads and Amazon reviews from beta readers and early supporters." },
    { q: 'Who are South African book influencers?', a: "South African BookStagram and BookTok creators with engaged followings in your genre. Offer a free copy in exchange for an honest review." },
  ],
  relatedLinks: [
    { label: 'How to Market Your Book', path: '/howtomarketandsellyourselfpublishedbookinsouthafrica' },
    { label: 'How to Launch Your Book', path: '/howtolaunchyourbooksuccessfullyinsouthafrica' },
    { label: 'Author Websites', path: '/authorwebsites' },
    { label: 'Request a Quote', path: '/getquote' },
  ],
};

export default function HowToGetBookReviewedSA() {
  return <BlogArticlePage article={article} />;
}