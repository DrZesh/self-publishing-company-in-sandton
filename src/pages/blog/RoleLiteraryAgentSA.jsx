import React from 'react';
import BlogArticlePage from './BlogArticlePage';

const article = {
  url: '/whatistheroleliteraryagentinsouthafrica',
  title: "What's the Role of a Literary Agent in South Africa?",
  description: "What literary agents do in South Africa, how they are paid, whether you need one, and how South African authors can work with international agents for global rights.",
  category: 'Publishing Tips',
  readTime: '6 min read',
  datePublished: '2026-02-05',
  sections: [
    { heading: null, text: "Literary agents are less common in South Africa than in UK and US publishing markets. Understanding what a literary agent does — and doesn't do — will help you decide whether pursuing representation is right for you." },
    { heading: 'What a Literary Agent Does', text: "A literary agent evaluates manuscripts for commercial viability; prepares and pitches submissions to publishers; negotiates publishing contracts; manages the business relationship with your publisher; sells subsidiary rights; provides career guidance; and acts as a buffer between author and publisher." },
    { heading: 'How Agents Are Paid in South Africa', text: "Agents work on commission — typically 15% of domestic deals and 20% of international or subsidiary rights deals. They are paid only when you are paid. Any agent who charges an upfront reading fee is operating outside standard industry ethics — avoid them." },
    { heading: 'Do You Need an Agent in South Africa?', text: "Not necessarily. Many South African publishers accept unagented submissions directly, and for authors focused on the local market, direct submission is perfectly viable. If you're self-publishing through Creative Books SA, you don't need an agent at all — you deal directly with their team and retain all rights and revenue yourself." },
    { heading: 'South African Authors and International Agents', text: "If your work has genuine international market potential, querying UK or US agents is worth pursuing. Several South African authors are represented by UK or US literary agents for their international rights, while managing their local publication independently." },
  ],
  ctaText: "No agent required. Self-publish directly with Creative Books SA and keep full control over your book and earnings.",
  faqs: [
    { q: 'Do I need a literary agent to publish in South Africa?', a: "Not necessarily. Many South African publishers accept direct submissions. For self-publishing, no agent is needed." },
    { q: 'How do literary agents in South Africa get paid?', a: "Commission-based: typically 15% on domestic deals and 20% on international rights. Never pay an upfront reading fee — this is a red flag." },
    { q: 'Can South African authors query international literary agents?', a: "Yes. If your work has international commercial potential, querying UK or US agents for international rights can be worthwhile alongside managing local publication independently." },
  ],
  relatedLinks: [
    { label: 'How to Find a Literary Agent', path: '/howtofindliteraryagentinsouthafrica' },
    { label: 'Self Publishing South Africa', path: '/selfpublishingsouthafrica' },
    { label: 'Self Publishing Packages', path: '/selfpublishingpackagesinsouthafrica' },
    { label: 'Request a Quote', path: '/getquote' },
  ],
};

export default function RoleLiteraryAgentSA() {
  return <BlogArticlePage article={article} />;
}