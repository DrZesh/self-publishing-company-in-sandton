import React from 'react';
import LongTailArticlePage from '../../../components/seo/LongTailArticlePage';
import { faqSchema, breadcrumbSchema, articleSchema } from '../../../lib/seo/schemas';

const faqs = [
  { question: 'Is hardcover or paperback better for self-publishing?', answer: 'It depends on your goals. Paperback is more affordable and best for most self-publishing runs. Hardcover is better for premium editions, gifts, commemoration books, and titles you want to sell at a higher price point.' },
  { question: 'How much more does hardcover cost than paperback?', answer: 'Hardcover typically costs 60–120% more per copy than paperback for the same book. A 200-page A5 softcover at R60 per copy would be R90–R130 in hardcover.' },
  { question: 'Can I print both softcover and hardcover editions?', answer: 'Yes. Many authors print a standard softcover run and a limited hardcover edition for launch events, gifts, or signed editions. We can produce both simultaneously.' },
  { question: 'Which sells better — hardcover or paperback?', answer: 'Paperback sells in higher volumes due to its lower retail price. Hardcover commands higher prices and works well for gifts, special editions, and premium titles. Many authors offer both.' },
  { question: 'What is the difference in durability between hardcover and paperback?', answer: 'Hardcover books are significantly more durable. Case binding with rigid boards protects the text block from damage. Paperback covers can crease, warp, or crack over time, especially with heavy use.' },
];

export default function HardcoverVsPaperback() {
  const schema = {
    '@context': 'https://schema.org',
    '@graph': [
      articleSchema({ title: 'Hardcover vs Paperback — Which is Right for Your Book?', description: 'Detailed comparison of hardcover and paperback book printing.', datePublished: '2025-01-01', url: '/hardcovervspaperbackprinting' }),
      faqSchema(faqs),
      breadcrumbSchema([{ name: 'Home', path: '/' }, { name: 'Resources', path: '/blog' }, { name: 'Hardcover vs Paperback', path: '/hardcovervspaperbackprinting' }]),
    ],
  };

  return (
    <LongTailArticlePage
      metaTitle="Hardcover vs Paperback Printing | Costs & Comparison"
      metaDescription="Hardcover vs paperback printing compared — production costs, retail pricing, durability and when each format makes sense for SA authors."
      metaKeywords="hardcover vs paperback, hardcover vs softcover, book binding comparison, should I print hardcover or paperback, book printing South Africa"
      canonical="https://www.creativebookssa.co.za/hardcovervspaperbackprinting"
      schema={schema}
      subtitle="Printing Format Comparison"
      h1="Hardcover vs Paperback: Which Is Right for Your Book?"
      intro="Should you print your book in hardcover or paperback? This is one of the most common questions we receive from self-publishing authors. The answer depends on your budget, goals, and reader expectations."
      sections={[
        {
          heading: 'Key Differences at a Glance',
          body: 'Here is a side-by-side comparison of hardcover and paperback (softcover) book printing:',
          table: {
            headers: ['Factor', 'Paperback (Softcover)', 'Hardcover'],
            rows: [
              ['Cover material', 'Flexible laminated card', 'Rigid boards (cloth, leatherette, or printed)'],
              ['Binding type', 'Perfect binding (glued spine)', 'Case binding (sewn or glued text block)'],
              ['Durability', 'Good', 'Excellent'],
              ['Production cost', 'Lower', '60–120% higher'],
              ['Typical retail price (200pp A5)', 'R120–R220', 'R280–R480'],
              ['Best for', 'Most books, mass market', 'Premium, gifts, collector editions'],
              ['Reader perception', 'Accessible, informal', 'Premium, authoritative'],
            ],
          },
        },
        {
          heading: 'When to Choose Paperback',
          body: 'Paperback (softcover) is the right choice for most self-publishing authors in South Africa. It is affordable to produce, easy to sell at a competitive retail price, and familiar to most South African book buyers.',
          list: [
            'You want to maximize the number of copies per budget',
            'You need a retail price below R200',
            'You are selling through bookshops and online stores',
            'You are printing 100+ copies for distribution',
            'Your book is a novel, memoir, non-fiction, or poetry collection',
          ],
          cta: 'Get a softcover printing quote',
        },
        {
          heading: 'When to Choose Hardcover',
          body: 'Hardcover printing is worth the extra investment in specific situations where the premium format adds value — either to the reader\'s experience or your selling price.',
          list: [
            'You are printing a commemorative or anniversary edition',
            'Your book is a gift or coffee table book',
            'You want to sell at a higher price point (R350+)',
            'You are printing a limited collector edition',
            'Your book is a business book for corporate gifting',
            'You are printing a children\'s book gift edition',
            'You want signed copies to sell at premium prices',
          ],
          cta: 'Get a hardcover printing quote',
        },
        {
          heading: 'Cost Comparison for 100 Copies',
          body: 'Using a 200-page A5 book as the example:',
          table: {
            headers: ['Format', 'Cost Per Copy', 'Total Cost', 'Retail Price', 'Gross Margin Per Copy'],
            rows: [
              ['Softcover', 'R55–R70', 'R5,500–R7,000', 'R150–R220', 'R80–R165'],
              ['Hardcover', 'R95–R130', 'R9,500–R13,000', 'R280–R450', 'R150–R355'],
            ],
          },
        },
        {
          heading: 'Printing Both Formats',
          body: 'A popular strategy for South African authors is to print a large softcover run for general distribution and a small hardcover run (50–100 copies) for signed/limited editions, book launches, corporate gifts, and premium sales. We frequently produce both formats simultaneously for the same title.',
          cta: 'Ask us about dual-format printing for your launch',
        },
        {
          heading: 'Hardcover Finishing Options',
          body: 'If you choose hardcover, these finishing options add further value and visual appeal:',
          list: [
            'Dust jacket — full-colour printed paper over the hardcover boards',
            'Cloth cover — traditional woven cloth with foil-stamped spine title',
            'Leatherette — premium faux-leather finish for luxury editions',
            'Foil stamping — gold or silver foil title and design on the cover',
            'Embossing — raised lettering or motif pressed into the cover',
            'Ribbon bookmark — sewn into the spine for reading convenience',
          ],
        },
      ]}
      faqs={faqs}
      relatedLinks={[
        { label: 'Hardcover Printing', path: '/printing/hardcover' },
        { label: 'A5 Book Printing', path: '/printing/a5' },
        { label: 'Book Printing Costs', path: '/howmuchdoesbookprintingcost' },
        { label: 'A5 vs 6×9', path: '/a5vs6x9bookprinting' },
        { label: 'Best Book Size Guide', path: '/bestbooksizeforselfpublishing' },
        { label: 'Get a Quote', path: '/getquote' },
      ]}
      ctaTitle="Compare Hardcover and Softcover Quotes"
      ctaDescription="Get side-by-side hardcover and softcover printing quotes so you can choose with confidence."
    />
  );
}