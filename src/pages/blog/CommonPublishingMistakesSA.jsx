import React from 'react';
import BlogArticlePage from './BlogArticlePage';

const article = {
  url: '/mostcommonpublishingmistakesbysouthafricanauthors',
  title: 'Common Publishing Mistakes by South African Authors',
  description: 'Most common publishing mistakes South African authors make — publishing too early, vanity presses, bad covers, no marketing plan and skipping editing.',
  category: 'Publishing Tips',
  readTime: '7 min read',
  datePublished: '2026-02-05',
  sections: [
    { heading: null, text: "The path to publication is littered with preventable mistakes. Learning from what others have done wrong can save you time, money, and heartbreak." },
    { heading: 'Mistake 1: Submitting or Publishing Too Early', text: "The single most common mistake. Authors, excited by the completion of a first draft, try to publish before the manuscript is truly ready. Revise thoroughly, get feedback, revise again — and only then engage a production partner like Creative Books SA to begin the professional production process." },
    { heading: 'Mistake 2: Falling for Vanity Presses', text: "South Africa has numerous companies that charge authors to publish while delivering poor quality. Research any publisher who contacts you unsolicited or whose pricing is not transparent. Creative Books SA publishes all pricing on their website for full transparency before you commit." },
    { heading: 'Mistake 3: Neglecting the Cover', text: "Self-published authors who invest in writing and editing but then try to save money on cover design undermine their entire investment. The cover is the book's face. Creative Books SA's professional covers start at R1,650 — a small investment that dramatically affects sales. View <a href='/book-cover-design'>cover options</a>." },
    { heading: 'Mistake 4: Having No Marketing Plan', text: "Getting published is the beginning, not the end. Authors who have no audience, no email list, and no marketing strategy before launch will struggle. Start building your platform before the manuscript is finished." },
    { heading: 'Mistake 5: Not Getting Professional Editing', text: "Grammar checkers and well-meaning friends are not substitutes for professional editing. Unedited books damage your reputation and are obvious to readers. Creative Books SA's <a href='/book-editing'>editing services</a> start at R0.25 per word." },
    { heading: 'Mistake 6: Not Understanding Your Agreement', text: "Always read and understand what you're signing or agreeing to. With Creative Books SA, the terms are clear: once-off fees, no ongoing royalties, and you retain all rights and revenue." },
  ],
  ctaText: "Avoid the mistakes that hold back most South African authors. Publish professionally with Creative Books SA from the start.",
  faqs: [
    { q: 'What is the most common publishing mistake South African authors make?', a: "Publishing too early — before the manuscript has been properly revised, beta-read, and professionally edited." },
    { q: 'How do I avoid vanity presses in South Africa?', a: "Look for transparent pricing published on the company website, a clear portfolio of completed books, and no unsolicited contact promising guaranteed success." },
    { q: 'Why is cover design so important for self-published books?', a: "The cover is the book's most powerful marketing tool. Readers judge quality by the cover before reading a single word. Amateur covers signal low production values." },
  ],
  relatedLinks: [
    { label: 'Do Publishers Charge Authors', path: '/dosouthafricanpublisherschargeauthors' },
    { label: 'Book Cover Design', path: '/book-cover-design' },
    { label: 'Book Editing Services', path: '/book-editing' },
    { label: 'Self Publishing Packages', path: '/self-publishing-packages-in-south-africa' },
    { label: 'Request a Quote', path: '/getquote' },
  ],
};

export default function CommonPublishingMistakesSA() {
  return <BlogArticlePage article={article} />;
}