import React from 'react';
import LongTailArticlePage from '../../../components/seo/LongTailArticlePage';
import { faqSchema, breadcrumbSchema, articleSchema } from '../../../lib/seo/schemas';

const faqs = [
  { question: 'Which is better, A5 or 6×9 for a South African author?', answer: 'If your primary market is South Africa, A5 is the better choice. If you plan to sell on Amazon internationally, 6×9 is recommended as it is the Amazon KDP standard.' },
  { question: 'Is 6×9 bigger than A5?', answer: 'Yes. 6×9 inches (152×229mm) is slightly taller and slightly wider than A5 (148×210mm). The difference is subtle but noticeable when comparing printed books side by side.' },
  { question: 'Can I print in both A5 and 6×9?', answer: 'Yes. We recommend printing your South African retail run in A5 and using Amazon KDP for your 6×9 international edition. We help set up both versions.' },
  { question: 'Does A5 or 6×9 cost more to print?', answer: '6×9 is slightly more expensive to print than A5 due to the larger page area. Typically 8–12% more per copy for the same page count.' },
  { question: 'What is the difference in pages between A5 and 6×9?', answer: 'A 60,000-word novel fits approximately 200–230 pages in A5. The same manuscript in 6×9 fits approximately 190–220 pages — marginally fewer pages because of the slightly larger page area.' },
];

export default function A5vs6x9BookPrinting() {
  const schema = {
    '@context': 'https://schema.org',
    '@graph': [
      articleSchema({ title: 'A5 vs 6×9 Book Printing — Which Size is Right?', description: 'Detailed comparison of A5 and 6×9 book printing formats.', datePublished: '2025-01-01', url: '/a5vs6x9bookprinting' }),
      faqSchema(faqs),
      breadcrumbSchema([{ name: 'Home', path: '/' }, { name: 'Resources', path: '/blog' }, { name: 'A5 vs 6×9', path: '/a5vs6x9bookprinting' }]),
    ],
  };

  return (
    <LongTailArticlePage
      metaTitle="A5 vs 6x9 Book Size | Which Should You Choose?"
      metaDescription="A5 vs 6x9 book size compared — pros, cons, costs and which is best for your novel, memoir or non-fiction book."
      metaKeywords="A5 vs 6x9 book printing, A5 or 6x9 for self publishing, book size comparison, A5 vs trade paperback, Amazon KDP size South Africa"
      canonical="https://www.creativebookssa.co.za/a5vs6x9bookprinting"
      schema={schema}
      subtitle="Book Size Comparison"
      h1="A5 vs 6×9 Book Printing — Which Size is Right?"
      intro="Two of the most popular book sizes in South Africa are A5 and 6×9 inches. They look similar, but serve different purposes. This guide helps you decide which format is right for your publishing goals."
      sections={[
        {
          heading: 'Side-by-Side Comparison',
          body: 'Here is a direct comparison of A5 and 6×9 across the most important factors:',
          table: {
            headers: ['Factor', 'A5', '6×9 Inch'],
            rows: [
              ['Dimensions', '148 × 210mm', '152 × 229mm'],
              ['South African popularity', '★★★★★', '★★★★☆'],
              ['Amazon KDP compatible', 'No', 'Yes'],
              ['International standard', 'No', 'Yes'],
              ['Printing cost', 'Lower', 'Slightly higher (+8–12%)'],
              ['Pages per 60k words', '200–230', '190–220'],
              ['Best for', 'SA retail, local authors', 'Amazon, international'],
            ],
          },
        },
        {
          heading: 'When to Choose A5',
          body: 'Choose A5 if your primary goal is selling in South Africa — in bookshops, at literary events, on your own website, or directly to readers. A5 is the format South African readers are most familiar with and booksellers expect from local titles.',
          list: [
            'You are selling primarily in South Africa',
            'Your book will be stocked in SA bookshops',
            'You want the most cost-effective print run',
            'You are writing fiction, poetry, memoir, or local non-fiction',
            'You want the most familiar SA reading experience',
          ],
          cta: 'Get an A5 book printing quote',
        },
        {
          heading: 'When to Choose 6×9',
          body: 'Choose 6×9 if you plan to sell your book internationally, list it on Amazon KDP, or target an audience that reads a lot of US and UK published books. Business books, leadership titles, and entrepreneurship books do particularly well in 6×9.',
          list: [
            'You are publishing on Amazon KDP',
            'Your audience is international or reads US/UK business books',
            'You want the standard trade paperback used globally',
            'You write business, leadership, or entrepreneurship titles',
            'You want parity with international professional titles',
          ],
          cta: 'Get a 6×9 book printing quote',
        },
        {
          heading: 'Can You Print in Both?',
          body: 'Many authors print an A5 edition for the South African market and use Amazon KDP for an automated 6×9 print-on-demand edition for international sales. We help authors set up both versions, and we also format and upload your book to Amazon KDP as part of our digital publishing services.',
          cta: 'Learn about our Amazon KDP publishing service',
        },
        {
          heading: 'Cost Comparison for 100 Copies',
          body: 'Here is a pricing comparison for 100 copies of a 200-page softcover book in each format:',
          table: {
            headers: ['Format', 'Cost Per Copy', 'Total (100 copies)', 'Difference'],
            rows: [
              ['A5 Softcover', 'R50–R65', 'R5,000–R6,500', 'Baseline'],
              ['6×9 Softcover', 'R55–R72', 'R5,500–R7,200', '+~10%'],
              ['A5 Hardcover', 'R85–R115', 'R8,500–R11,500', '+70%'],
              ['6×9 Hardcover', 'R90–R125', 'R9,000–R12,500', '+80%'],
            ],
          },
          cta: 'Get a precise quote for your book',
        },
      ]}
      faqs={faqs}
      relatedLinks={[
        { label: 'A5 Book Printing', path: '/printing/a5' },
        { label: '6×9 Book Printing', path: '/printing/6x9' },
        { label: 'Best Book Size Guide', path: '/bestbooksizeforselfpublishing' },
        { label: 'Book Printing Costs', path: '/howmuchdoesbookprintingcost' },
        { label: 'Amazon KDP Publishing', path: '/amazonkdp' },
        { label: 'Hardcover vs Paperback', path: '/hardcovervspaperbackprinting' },
        { label: 'Get a Quote', path: '/getquote' },
      ]}
      ctaTitle="Get Quotes for Both Formats"
      ctaDescription="We'll send you A5 and 6×9 side-by-side quotes so you can compare and decide with confidence."
    />
  );
}