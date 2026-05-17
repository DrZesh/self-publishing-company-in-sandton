import React from 'react';
import BlogArticlePage from './BlogArticlePage';

const article = {
  url: '/howtofindliteraryagentinsouthafrica',
  title: 'How to Find a Literary Agent in South Africa',
  description: 'How to find a literary agent in South Africa — do you need one, how to write a query letter, and when self-publishing is the smarter route.',
  category: 'Publishing Tips',
  readTime: '6 min read',
  datePublished: '2026-02-05',
  sections: [
    { heading: null, text: 'Literary agents are rare in South Africa compared to publishing markets like the UK or USA. Here\'s what you need to know about finding a literary agent as a South African author — and when it may not be necessary.' },
    { heading: 'Do You Need a Literary Agent in South Africa?', text: 'Many South African publishers accept unagented submissions directly. If your goal is to self-publish with a professional service like Creative Books SA, you don\'t need an agent at all — you deal directly with their team. If you have international ambitions and want to break into major UK or US publishers, an agent becomes more valuable.' },
    { heading: 'How to Query a Literary Agent', text: 'A query letter should be no longer than one page, include a compelling one-paragraph pitch for your book, state your genre, word count, and comparable titles, and be specifically addressed to the agent. Research each agent thoroughly before querying — know what they represent and what they\'re currently seeking.' },
    { heading: 'Building Your Case Before You Query', text: 'Agents are more likely to take on an author with a compelling, market-ready manuscript, an existing platform or audience, and prior publication credits. If your work has won a local literary award or competition, that is worth highlighting.' },
    { heading: 'Self-Publishing as an Alternative Route', text: 'For many South African authors, the simplest path to market is self-publishing directly with Creative Books SA — no agent required, no submission waiting period, and you retain full ownership of your work. <a href="/getquote">Request a quote</a> to get started.' },
  ],
  ctaText: 'Skip the waiting game. Self-publish professionally with Creative Books SA and get your book to market on your own terms.',
  faqs: [
    { q: 'Do I need a literary agent to publish in South Africa?', a: 'Not necessarily. Many South African publishers accept direct unagented submissions. For self-publishing, no agent is needed at all.' },
    { q: 'How do I write a query letter for a South African publisher?', a: 'Keep it to one page. Include a compelling one-paragraph pitch, your genre, word count, and comparable titles. Address it specifically to the relevant editor or agent.' },
    { q: 'What do literary agents charge in South Africa?', a: 'Legitimate agents work on commission — typically 15% of domestic deals and 20% of international deals. Never pay an upfront reading fee.' },
  ],
  relatedLinks: [
    { label: 'Self Publishing South Africa', path: '/selfpublishingsouthafrica' },
    { label: 'Book Publishing', path: '/bookpublishing' },
    { label: 'Self Publishing Packages', path: '/selfpublishingpackagesinsouthafrica' },
    { label: 'Request a Quote', path: '/getquote' },
  ],
};

export default function HowToFindALiteraryAgentSA() {
  return <BlogArticlePage article={article} />;
}