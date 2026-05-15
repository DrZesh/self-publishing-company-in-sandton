import React from 'react';
import PageMeta from '../components/shared/PageMeta';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Clock, Tag } from 'lucide-react';
import SectionHeading from '../components/shared/SectionHeading';
import CTASection from '../components/shared/CTASection';

const categories = [
  { label: 'All', path: '/blog' },
  { label: 'Publishing Tips', path: '/publishingtips' },
  { label: 'Writing Tips', path: '/writingtips' },
  { label: 'Printing Guides', path: '/printingguides' },
  { label: 'Editing Guides', path: '/editingguides' },
  { label: 'Author Success Stories', path: '/authorsuccessstories' },
];

const articles = [
  // Existing articles
  { title: 'How Much Does It Cost to Publish a Book in South Africa?', excerpt: 'A detailed breakdown of publishing costs in South Africa, from editing to printing to distribution.', category: 'Publishing Tips', path: '/howmuchdoesitcosttopublishabook', readTime: '8 min', image: 'https://images.unsplash.com/photo-1554774853-aae0a22c8aa4?w=600&q=80' },
  { title: 'How to Get an ISBN in South Africa', excerpt: 'Step-by-step guide to registering your ISBN with the National Library of South Africa.', category: 'Publishing Tips', path: '/howtogetanisbn', readTime: '5 min', image: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=600&q=80' },
  { title: 'How to Write a Book: A Complete Guide', excerpt: 'From first idea to finished manuscript — practical tips for aspiring authors.', category: 'Writing Tips', path: '/howtowriteabook', readTime: '12 min', image: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=600&q=80' },
  { title: 'Book Printing Costs in South Africa', excerpt: 'Understanding the factors that affect book printing costs and how to get the best value.', category: 'Printing Guides', path: '/bookprintingcosts', readTime: '6 min', image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80' },
  { title: 'Best Publishing Company in South Africa', excerpt: 'What to look for when choosing a publishing company and how to find the right fit.', category: 'Publishing Tips', path: '/bestpublishingcompanyinsouthafrica', readTime: '7 min', image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&q=80' },
  { title: 'Self Publishing vs Traditional Publishing', excerpt: 'Pros and cons of self-publishing versus traditional publishing for South African authors.', category: 'Publishing Tips', path: '/selfpublishingvstraditionalpublishing', readTime: '9 min', image: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=600&q=80' },
  { title: 'How to Sell a Book in South Africa', excerpt: 'Distribution channels, marketing strategies, and sales tips for South African authors.', category: 'Publishing Tips', path: '/howtosellabookinsouthafrica', readTime: '10 min', image: 'https://images.unsplash.com/photo-1553729459-efe14ef6055d?w=600&q=80' },
  { title: 'How to Make a Book Cover', excerpt: 'Design principles and tips for creating a book cover that sells.', category: 'Publishing Tips', path: '/howtomakeabookcover', readTime: '6 min', image: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&q=80' },
  { title: 'Book Editing Explained', excerpt: 'Understanding the different types of editing and when you need each one.', category: 'Editing Guides', path: '/bookeditingexplained', readTime: '5 min', image: 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=600&q=80' },
  // New articles from content pack
  { title: 'Print on Demand Books in South Africa: What Authors Should Know Before Printing', excerpt: 'Understand how print on demand works, when it makes sense and when bulk printing is the better option for South African authors.', category: 'Printing Guides', path: '/printondemandbooksinsouthafrica', readTime: '7 min', image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80' },
  { title: 'How Much Does It Cost to Self Publish on Amazon Kindle?', excerpt: 'The real costs of publishing on Amazon Kindle — from editing and formatting to cover design and marketing.', category: 'Publishing Tips', path: '/howmuchdoesitcosttoselfpublishonamazonkindle', readTime: '7 min', image: 'https://images.unsplash.com/photo-1491841573634-28140fc7ced7?w=600&q=80' },
  { title: 'Professional Copy Editing Services for Authors in South Africa', excerpt: 'What copy editing includes, how it differs from proofreading and why it matters before layout and printing.', category: 'Editing Guides', path: '/professionalcopyeditingservices', readTime: '7 min', image: 'https://images.unsplash.com/photo-1434030216411-0b793f4b6f62?w=600&q=80' },
  { title: 'What Is Ghostwriting and What Does a Ghostwriter Do?', excerpt: 'Understand what ghostwriting is, who needs a ghostwriter and how the process works for memoir, business and Christian books.', category: 'Writing Tips', path: '/whatisghostwriting', readTime: '7 min', image: 'https://images.unsplash.com/photo-1519791883288-dc8bd696e667?w=600&q=80' },
  { title: 'Writing a Book Dedication: Meaning, Examples and Practical Tips', excerpt: 'Learn how to write a meaningful book dedication with examples for memoir, business, Christian and children\'s books.', category: 'Writing Tips', path: '/writingabookdedication', readTime: '5 min', image: 'https://images.unsplash.com/photo-1471107340929-a87cd0f5b5f3?w=600&q=80' },
  { title: 'Writing a Book Acknowledgment Page: Examples and Structure for Authors', excerpt: 'How to write a professional acknowledgment page with a clear structure and examples for South African authors.', category: 'Writing Tips', path: '/writingabookacknowledgment', readTime: '6 min', image: 'https://images.unsplash.com/photo-1509021436665-8f07dbf5bf1d?w=600&q=80' },
  { title: 'How to Decide a Name for Your Book: A Practical Guide for Authors', excerpt: 'Choose the right book title by matching it to your genre, message and target reader.', category: 'Writing Tips', path: '/howtonameyourbook', readTime: '6 min', image: 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=600&q=80' },
  { title: 'How to Print Your Self Published Book in South Africa', excerpt: 'A complete step by step guide on how to prepare and print a book professionally in South Africa.', category: 'Printing Guides', path: '/howtoprintyourselfpublishedbookinsouthafrica', readTime: '8 min', image: 'https://images.unsplash.com/photo-1516979187457-637abb4f9353?w=600&q=80' },
  { title: "Children's Book Illustrations and Printing in South Africa", excerpt: "A guide for children's book authors on illustrations, layout, colour printing and professional production.", category: 'Printing Guides', path: '/childrensbookillustrationsprinting', readTime: '7 min', image: 'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=600&q=80' },
  { title: 'eBook vs Print Book Self Publishing: Which Option Is Better?', excerpt: 'Compare eBook and print book self publishing to decide which format suits your audience and sales strategy.', category: 'Publishing Tips', path: '/ebookvsprintbookselfpublishing', readTime: '7 min', image: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=600&q=80' },
  { title: 'How Long Does It Take to Self Publish a Book?', excerpt: 'Understand the realistic timeline for self publishing a book in South Africa, from manuscript to printing.', category: 'Publishing Tips', path: '/howlongdoesittaketoselfpublish', readTime: '6 min', image: 'https://images.unsplash.com/photo-1506784365847-bbad939e9335?w=600&q=80' },
  { title: 'How Much Does It Cost to Self Publish on Amazon?', excerpt: 'A complete guide to the real costs of self publishing on Amazon for South African authors.', category: 'Publishing Tips', path: '/howmuchdoesitcosttoselfpublishonamazon', readTime: '7 min', image: 'https://images.unsplash.com/photo-1598209494655-b8e4c5e66b64?w=600&q=80' },
  { title: 'How to Become a Writer in South Africa Through Self Publishing', excerpt: 'A practical guide for aspiring writers on how to build a writing career through self publishing.', category: 'Writing Tips', path: '/howtobecomeawriterinsouthafrica', readTime: '7 min', image: 'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=600&q=80' },
  { title: 'ISBN Registration in South Africa: A Complete Guide for Authors', excerpt: 'Everything South African authors need to know about ISBN registration, who issues ISBNs and where they go.', category: 'Publishing Tips', path: '/isbnregistrationsouthafrica', readTime: '6 min', image: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=600&q=80' },
  { title: 'How to Get an ISBN for Your Book in South Africa', excerpt: 'A step by step guide on how to apply for an ISBN through the National Library of South Africa.', category: 'Publishing Tips', path: '/howtogetanisbnforyourbook', readTime: '6 min', image: 'https://images.unsplash.com/photo-1457369804613-52c61a468e7d?w=600&q=80' },
  { title: "A Beginner's Guide to Self Publishing a Book in South Africa", excerpt: 'A complete beginner\'s guide covering writing, editing, cover design, ISBN, printing and selling your book.', category: 'Publishing Tips', path: '/abeginnersguide', readTime: '8 min', image: 'https://images.unsplash.com/photo-1532012197267-da84d127e765?w=600&q=80' },
  { title: "How to Self Publish Children's Books in South Africa", excerpt: "A complete guide to self publishing a children's book covering age groups, illustrations, layout and colour printing.", category: 'Publishing Tips', path: '/howtoselfpublishchildrensbooks', readTime: '8 min', image: 'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=600&q=80' },
  { title: 'What Is Self Publishing? A Complete Guide for New Authors', excerpt: 'Understand what self publishing means, how it works and how South African authors can publish professionally.', category: 'Publishing Tips', path: '/whatisselfpublishing', readTime: '7 min', image: 'https://images.unsplash.com/photo-1550399105-c4db5fb85c18?w=600&q=80' },
  { title: 'Copyright FAQs for Authors, Publishers and Self Publishers in South Africa', excerpt: 'Practical answers to common copyright questions covering ownership, protection, infringement and publishing rights in South Africa.', category: 'Publishing Tips', path: '/copyrightfaqsforauthors', readTime: '12 min', image: 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=600&q=80' },
  { title: 'Questions to Ask a Publisher Before Publishing Your Book in South Africa', excerpt: 'The essential questions every South African author should ask any publisher or self publishing company before paying a deposit or signing paperwork.', category: 'Publishing Tips', path: '/questionstoaskapublisher', readTime: '14 min', image: 'https://images.unsplash.com/photo-1521791136064-7986c2920216?w=600&q=80' },
  // New articles batch 2
  { title: 'How Do I Get My Book Published in South Africa?', excerpt: 'A step-by-step guide for South African authors on how to get a book published — from finishing your manuscript to choosing the right publishing route.', category: 'Publishing Tips', path: '/howdoigetmybookpublishedinsouthafrica', readTime: '9 min', image: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=600&q=80' },
  { title: 'Do South African Publishers Charge Authors to Publish?', excerpt: 'How to tell the difference between a legitimate publisher, a vanity press, and a professional self-publishing service in South Africa.', category: 'Publishing Tips', path: '/dosouthafricanpublisherschargeauthors', readTime: '6 min', image: 'https://images.unsplash.com/photo-1554774853-aae0a22c8aa4?w=600&q=80' },
  { title: 'How Much Will I Earn From My First Book in South Africa?', excerpt: 'An honest guide to author income — traditional royalties, self-publishing profits, and realistic first-year earnings for South African authors.', category: 'Publishing Tips', path: '/howmuchwilliearnfrommyfirstbook', readTime: '7 min', image: 'https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=600&q=80' },
  { title: "What's a Fair Book Deal for South African Authors?", excerpt: 'Understand standard royalty rates, rights clauses, and publishing contract terms in South Africa so you can negotiate with confidence.', category: 'Publishing Tips', path: '/whatisafairbookdealforsouthafricanauthors', readTime: '7 min', image: 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=600&q=80' },
  { title: 'Do I Need an Editor Before Publishing in South Africa?', excerpt: 'Why professional editing is essential before publishing — types of editing, what each costs, and how editing fits into your publishing package.', category: 'Editing Guides', path: '/doineedaneditorbeforepublishing', readTime: '6 min', image: 'https://images.unsplash.com/photo-1434030216411-0b793f4b6f62?w=600&q=80' },
  { title: 'How to Find a Literary Agent in South Africa', excerpt: 'What South African authors need to know about literary agents — when you need one, how to query, and when self-publishing is a better route.', category: 'Publishing Tips', path: '/howtofindliteraryagentinsouthafrica', readTime: '6 min', image: 'https://images.unsplash.com/photo-1521791136064-7986c2920216?w=600&q=80' },
  { title: "How Do I Publish a Children's Book in South Africa?", excerpt: "Everything South African authors need to know about publishing a children's book — market, illustrations, printing costs, and full-service production.", category: 'Publishing Tips', path: '/howtopublishachildrensbookinsouthafrica', readTime: '7 min', image: 'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=600&q=80' },
  { title: 'Can I Publish a Comic Book in South Africa?', excerpt: 'How South African comic creators and graphic novelists can self-publish — printing options, audience building, and professional production.', category: 'Publishing Tips', path: '/canipublishacomicbookinsouthafrica', readTime: '5 min', image: 'https://images.unsplash.com/photo-1602940659805-770d1932b9b7?w=600&q=80' },
  { title: 'How to Market and Sell Your Self-Published Book in South Africa', excerpt: 'Marketing and distribution strategies for self-published South African authors — from bookshops and Takealot to social media and eBook platforms.', category: 'Publishing Tips', path: '/howtomarketandsellyourselfpublishedbookinsouthafrica', readTime: '8 min', image: 'https://images.unsplash.com/photo-1553729459-efe14ef6055d?w=600&q=80' },
  { title: 'How Do South African Publishing Houses Find New Authors?', excerpt: 'How publishers discover new authors in South Africa — unsolicited submissions, literary competitions, social media, and going direct with self-publishing.', category: 'Publishing Tips', path: '/howdosouthafricanpublishinghousesfindnewauthors', readTime: '6 min', image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&q=80' },
  { title: 'What Freelance Professionals Do I Need to Self-Publish in South Africa?', excerpt: 'Every professional needed to self-publish a book in South Africa — and why a full-service provider like Creative Books SA saves time and money.', category: 'Publishing Tips', path: '/whatfreelanceprofessionalsdoineedtoselfpublish', readTime: '6 min', image: 'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=600&q=80' },
  { title: 'Is Selling 3,000 Copies of a Book Good in South Africa?', excerpt: "What 3,000 book sales means in South Africa — the financial picture for self-publishers and how it compares to traditional royalties.", category: 'Publishing Tips', path: '/isselling3000copiesofabookgoodinsouthafrica', readTime: '5 min', image: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=600&q=80' },
  { title: 'How Do I Know If My Book is Ready to Publish?', excerpt: 'A practical framework for South African authors to evaluate manuscript readiness — self-assessment checklist, professional benchmarks, and red flags.', category: 'Writing Tips', path: '/howdoiknowifmybookisreadytopublish', readTime: '6 min', image: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=600&q=80' },
  { title: 'What Publishing Jobs Are Available in South Africa?', excerpt: "A comprehensive guide to career paths in South Africa's publishing industry — editorial, design, production, sales, marketing, and rights roles.", category: 'Publishing Tips', path: '/whatpublishingjobsareavailableinsouthafrica', readTime: '6 min', image: 'https://images.unsplash.com/photo-1497032628192-86f99bcd76bc?w=600&q=80' },
  { title: 'How Long Does It Take to Get Published in South Africa?', excerpt: 'The realistic publishing timeline in South Africa — traditional publishing (12–30 months) vs self-publishing with Creative Books SA (3–4 months).', category: 'Publishing Tips', path: '/howlongdoesittaketogetpublishedinsouthafrica', readTime: '6 min', image: 'https://images.unsplash.com/photo-1506784365847-bbad939e9335?w=600&q=80' },
  { title: 'Do South African Publishers Provide Cover Design?', excerpt: 'Whether traditional publishers or self-publishing services handle cover design, and what makes a great book cover for the South African market.', category: 'Publishing Tips', path: '/dosouthafricanpublishersprovdecoverdesign', readTime: '5 min', image: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&q=80' },
  { title: "What is the 90/10 Rule for Authors and Royalties?", excerpt: "What the 90/10 rule means for authors, how it applies in South Africa, and how self-publishing changes the equation.", category: 'Publishing Tips', path: '/whatis9010ruleforauthorsandroyalties', readTime: '5 min', image: 'https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=600&q=80' },
  { title: 'How to Choose Between Multiple Book Publishing Offers in South Africa', excerpt: 'How to evaluate multiple publishing offers — what to compare beyond the advance, red flags to watch for, and when self-publishing is the better deal.', category: 'Publishing Tips', path: '/howtochoosebetweenmultiplebookpublishingoffers', readTime: '6 min', image: 'https://images.unsplash.com/photo-1554774853-aae0a22c8aa4?w=600&q=80' },
  { title: 'Can You Make a Living as a Self-Published Author in South Africa?', excerpt: "The honest reality of author income — what successful self-published authors have in common, the eBook advantage, and realistic income milestones.", category: 'Publishing Tips', path: '/canyoumakealivingasaselfpublishedauthorinsouthafrica', readTime: '7 min', image: 'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=600&q=80' },
  { title: 'What Should I Look for in a South African Publishing Contract?', excerpt: "A guide to South African publishing contract terms — royalties, rights, option clauses, reversion clauses, and what self-publishing avoids entirely.", category: 'Publishing Tips', path: '/whattolookforinsouthafricanpublishingcontract', readTime: '7 min', image: 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=600&q=80' },
  { title: 'How Do I Protect My Book Idea Before Publishing in South Africa?', excerpt: "What South African copyright law says about protecting your book — practical steps, retaining copyright when self-publishing, and what to watch for in contracts.", category: 'Publishing Tips', path: '/howtoprotectmybookideabeforepublishinginsouthafrica', readTime: '6 min', image: 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=600&q=80' },
  { title: 'Do South African Authors Need International Distribution?', excerpt: "When international distribution matters for South African authors — digital distribution via Amazon KDP, physical distribution, and when to focus locally.", category: 'Publishing Tips', path: '/dosouthafricanauthorsneedinternationaldistribution', readTime: '6 min', image: 'https://images.unsplash.com/photo-1526778548025-fa2f459cd5ce?w=600&q=80' },
  { title: 'How Much Should I Spend on Cover Design for My Book in South Africa?', excerpt: "What South African authors should budget for book cover design — pricing tiers, what to avoid, and why cover design is your most important investment.", category: 'Publishing Tips', path: '/howmuchdoispendonbookcoverdesigninsouthafrica', readTime: '5 min', image: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&q=80' },
  { title: 'What Are the Best Platforms to Self-Publish in South Africa?', excerpt: "The best self-publishing platforms for South African authors — Amazon KDP, Takealot, your own website, and why professional production comes first.", category: 'Publishing Tips', path: '/bestplatformstoselfpublishinsouthafrica', readTime: '7 min', image: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=600&q=80' },
  { title: 'How to Build an Author Platform Before Publishing Your First Book', excerpt: "How South African authors can build an audience before their first book launch — email lists, social media strategy, author websites, and the literary community.", category: 'Writing Tips', path: '/howtobuildanauthorplatformbeforepublishing', readTime: '7 min', image: 'https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=600&q=80' },
  { title: "What's the Difference Between Traditional and Self-Publishing Royalties in South Africa?", excerpt: "A clear comparison of traditional publishing royalties vs self-publishing income in South Africa — with real numbers.", category: 'Publishing Tips', path: '/traditionalvsselfpublishingroyaltiesinsouthafrica', readTime: '6 min', image: 'https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=600&q=80' },
  { title: "Can I Publish a Book in South Africa if English Isn't My First Language?", excerpt: "Publishing in South Africa's indigenous languages, writing in English as a second language, and how Creative Books SA supports multilingual authors.", category: 'Publishing Tips', path: '/canipublishabookinsouthafricaifenglishisnotmyfirstlanguage', readTime: '6 min', image: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=600&q=80' },
  { title: 'How Do I Find Beta Readers for My Book in South Africa?', excerpt: "Where to find beta readers in South Africa, how to work with them effectively, and the next steps after beta reading.", category: 'Writing Tips', path: '/howtofindbetrareadersformybookinsouthafrica', readTime: '5 min', image: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=600&q=80' },
  { title: 'What Taxes Do Self-Published Authors Pay in South Africa?', excerpt: "Tax obligations for self-published South African authors — income tax, deductible expenses, and when to get professional advice.", category: 'Publishing Tips', path: '/whattaxesdoselfpublishedauthorspayinsouthafrica', readTime: '6 min', image: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600&q=80' },
  { title: 'How to Get Your Book Reviewed by South African Publications', excerpt: "How to secure book reviews in South Africa — who reviews books, how to submit, Goodreads strategy, and working with book influencers.", category: 'Publishing Tips', path: '/howtogetyourbookreviewedbysouthafricanpublications', readTime: '6 min', image: 'https://images.unsplash.com/photo-1512438248247-f0f2a5a8b7f0?w=600&q=80' },
  { title: 'Should I Hire a Publishing Coach or Consultant in South Africa?', excerpt: "When a publishing coach adds value for South African authors — and when working with Creative Books SA gives you the strategic support you need.", category: 'Publishing Tips', path: '/shouldihirepublishingcoachinsouthafrica', readTime: '5 min', image: 'https://images.unsplash.com/photo-1521791136064-7986c2920216?w=600&q=80' },
  { title: 'What Are the Most Common Publishing Mistakes Made by South African Authors?', excerpt: "The most common and costly publishing mistakes South African authors make — and how to avoid them with professional support.", category: 'Publishing Tips', path: '/mostcommonpublishingmistadebysouthafricanauthors', readTime: '7 min', image: 'https://images.unsplash.com/photo-1516979187457-637abb4f9353?w=600&q=80' },
  { title: 'How to Launch Your Book Successfully in South Africa', excerpt: "A complete guide to launching a book in South Africa — timeline planning, venue selection, media outreach, and post-launch sustaining activities.", category: 'Publishing Tips', path: '/howtolaunchyourbooksuccessfullyinsouthafrica', readTime: '8 min', image: 'https://images.unsplash.com/photo-1492538368677-f6e0afe31dab?w=600&q=80' },
  { title: 'Can I Publish Multiple Genres Under the Same Author Name in South Africa?', excerpt: "Whether South African authors should use one name or pen names for different genres — strategic considerations and author brand building.", category: 'Writing Tips', path: '/canipublishmultiplegenresunderthesameauthorname', readTime: '5 min', image: 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=600&q=80' },
  { title: 'How Do Debut Authors Get Better Book Deals in South Africa?', excerpt: "How South African debut authors can strengthen their publishing position — platform building, literary awards, and when self-publishing is simply the better deal.", category: 'Publishing Tips', path: '/howdebutauthorsgetbetterbookdealsinsouthafrica', readTime: '6 min', image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&q=80' },
  { title: "What's the Role of a Literary Agent in South Africa?", excerpt: "What literary agents do in South Africa, how they are paid, whether you need one, and working with international agents for global rights.", category: 'Publishing Tips', path: '/whatistheroleliteraryagentinsouthafrica', readTime: '6 min', image: 'https://images.unsplash.com/photo-1521791136064-7986c2920216?w=600&q=80' },
  { title: 'How to Start Your Publishing Career From Zero Experience in South Africa', excerpt: "A roadmap for breaking into South African publishing — qualifications, internships, freelancing, publishing your own book, and community networking.", category: 'Publishing Tips', path: '/howtostartpublishingcareerfromzeroinsouthafrica', readTime: '7 min', image: 'https://images.unsplash.com/photo-1497032628192-86f99bcd76bc?w=600&q=80' },
];

export default function Blog() {
  const location = useLocation();
  // PageMeta is rendered unconditionally for the main /blog route
  const currentPath = location.pathname;
  const isCategory = categories.some(c => c.path === currentPath && c.path !== '/blog');
  const categoryName = categories.find(c => c.path === currentPath)?.label;

  const filteredArticles = isCategory
    ? articles.filter(a => a.category === categoryName)
    : articles;

  return (
    <div>
      <PageMeta
        title="Self-Publishing Blog South Africa | Creative Books SA"
        description="Expert guides on self-publishing, book marketing, editing and printing for South African authors. Practical advice from publishing professionals."
        canonical="https://www.creativebookssa.co.za/blog"
      />
      {/* Hero */}
      <section className="relative pt-32 pb-16 bg-obsidian">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="text-center max-w-2xl mx-auto">
            <span className="text-copper text-sm font-body tracking-[0.25em] uppercase mb-4 block">Blog</span>
            <h1 className="font-heading text-4xl md:text-5xl font-bold text-white mb-6">
              {isCategory ? categoryName : 'The Creative Books SA Blog'}
            </h1>
            <p className="text-white/60 text-lg leading-relaxed font-body">
              Expert advice on publishing, writing, printing, editing, and book marketing in South Africa.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-6 bg-vellum border-b border-[#0F0F0F]/5 sticky top-20 z-40 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex gap-2 overflow-x-auto pb-2">
            {categories.map((cat) => (
              <Link key={cat.path} to={cat.path}
                className={`px-4 py-2 rounded-full text-sm whitespace-nowrap transition-all ${
                  currentPath === cat.path
                    ? 'bg-copper text-white'
                    : 'bg-white border border-[#0F0F0F]/10 text-[#0F0F0F]/60 hover:border-copper/30'
                }`}>
                {cat.label}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Articles Grid */}
      <section className="py-16 bg-vellum">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredArticles.map((article, i) => (
              <motion.div
                key={article.path}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
              >
                <Link to={article.path}
                  className="group block bg-white rounded-2xl border border-[#0F0F0F]/5 shadow-sm hover:shadow-lg hover:border-copper/20 transition-all h-full overflow-hidden">
                  {article.image && (
                    <div className="w-full h-44 overflow-hidden">
                      <img
                        src={article.image}
                        alt={article.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                      />
                    </div>
                  )}
                  <div className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <span className="text-xs text-copper font-body font-medium bg-copper/10 px-2.5 py-1 rounded-full">{article.category}</span>
                      <span className="flex items-center gap-1 text-xs text-[#0F0F0F]/40 font-body">
                        <Clock className="w-3 h-3" /> {article.readTime}
                      </span>
                    </div>
                    <h3 className="font-heading text-lg font-semibold text-[#0F0F0F] mb-3 group-hover:text-copper transition-colors">{article.title}</h3>
                    <p className="text-sm text-[#0F0F0F]/60 leading-relaxed font-body mb-4">{article.excerpt}</p>
                    <span className="inline-flex items-center gap-1 text-sm text-copper font-medium font-body group-hover:gap-2 transition-all">
                      Read More <ArrowRight className="w-3 h-3" />
                    </span>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <CTASection />
    </div>
  );
}