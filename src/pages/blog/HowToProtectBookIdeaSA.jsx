import React from 'react';
import BlogArticlePage from './BlogArticlePage';

const article = {
  url: '/howtoprotectmybookideabeforepublishinginsouthafrica',
  title: 'How Do I Protect My Book Idea Before Publishing in South Africa?',
  description: "What South African copyright law says about protecting your book idea — practical steps for authors, retaining copyright when self-publishing, and what to do before signing a contract.",
  category: 'Publishing Tips',
  readTime: '6 min read',
  datePublished: '2026-02-05',
  sections: [
    { heading: null, text: "Worrying about someone stealing your book idea is one of the most common concerns among first-time authors. Here's what intellectual property law actually says in South Africa — and what practical steps you can take." },
    { heading: 'Copyright in South Africa: The Basics', text: "Under South African law (the Copyright Act 98 of 1978, as amended), copyright in a literary work arises automatically at the moment the work is written down or recorded. You do not need to register copyright, apply for it, or pay a fee. As the author, you own the copyright from the moment of creation." },
    { heading: 'Retaining Copyright When Self-Publishing', text: "When you self-publish through Creative Books SA, you retain full copyright in your work at all times. Creative Books SA charges a once-off service fee for production and you retain all intellectual property rights. This is a critical distinction from traditional publishing contracts that may license significant rights to the publisher." },
    { heading: 'Practical Protection Steps', text: "Keep dated drafts of your manuscript as evidence of when you created the work. Send yourself a copy of your manuscript by email — the timestamp serves as a record. Sign a Non-Disclosure Agreement (NDA) before sharing your manuscript with editors or collaborators. Never share your manuscript publicly online before it is protected." },
    { heading: 'When You Sign a Publishing Contract', text: "When you sign a publishing contract, you grant the publisher a licence to publish your work — you do not transfer copyright ownership unless the contract specifically says so. Always retain copyright. Resist any contract that asks you to permanently assign copyright to the publisher." },
  ],
  ctaText: "Self-publish with Creative Books SA and retain full copyright and control over your book at all times.",
  faqs: [
    { q: 'How do I protect my book idea in South Africa?', a: "Copyright arises automatically when you write your work down. Keep dated drafts, use NDAs when sharing, and retain copyright in any publishing agreement." },
    { q: 'Do I need to register copyright in South Africa?', a: "No. Copyright in a literary work arises automatically when the work is created and recorded in material form. No registration or payment is required." },
    { q: 'Can a publisher take ownership of my book?', a: "Only if you sign a contract that permanently assigns copyright. Always retain copyright and only licence publishing rights. With Creative Books SA self-publishing, you retain all rights." },
  ],
  relatedLinks: [
    { label: 'Copyright FAQs for Authors', path: '/copyrightfaqsforauthors' },
    { label: 'ISBN Registration', path: '/isbnregistration' },
    { label: 'Self Publishing Packages', path: '/selfpublishingpackagesinsouthafrica' },
    { label: 'Request a Quote', path: '/getquote' },
  ],
};

export default function HowToProtectBookIdeaSA() {
  return <BlogArticlePage article={article} />;
}