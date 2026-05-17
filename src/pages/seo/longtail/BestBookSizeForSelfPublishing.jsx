import React from 'react';
import LongTailArticlePage from '../../../components/seo/LongTailArticlePage';
import { faqSchema, breadcrumbSchema, articleSchema } from '../../../lib/seo/schemas';

const faqs = [
  { question: 'What is the most popular book size in South Africa?', answer: 'A5 (148×210mm) is the most popular book size in South Africa for novels, non-fiction, and memoirs. It is compact, cost-effective, and familiar to local readers.' },
  { question: 'What size is best for Amazon KDP?', answer: '6×9 inches (152×229mm) is the standard Amazon KDP size for trade paperbacks. If you plan to sell on Amazon, use 6×9 for your print edition.' },
  { question: 'What size is best for a children\'s book?', answer: '20×20cm is the most popular children\'s picture book size in South Africa. 15×15cm is ideal for board books, and 21×21cm for premium large-format picture books.' },
  { question: 'Does book size affect printing cost?', answer: 'Yes. Larger formats use more paper and cost more per copy. A5 is generally the most cost-effective size for novels and non-fiction.' },
  { question: 'Can I print in a custom size?', answer: 'Yes. We print custom sizes upon request. Custom sizes may have longer lead times and higher setup costs. Contact us to discuss your custom size requirements.' },
];

export default function BestBookSizeForSelfPublishing() {
  const schema = {
    '@context': 'https://schema.org',
    '@graph': [
      articleSchema({ title: 'Best Book Size for Self Publishing in South Africa', description: 'Complete guide to choosing the right book size for self-publishing.', datePublished: '2025-01-01', url: '/bestbooksizeforselfpublishing' }),
      faqSchema(faqs),
      breadcrumbSchema([{ name: 'Home', path: '/' }, { name: 'Resources', path: '/blog' }, { name: 'Best Book Size', path: '/bestbooksizeforselfpublishing' }]),
    ],
  };

  return (
    <LongTailArticlePage
      metaTitle="Best Book Size for Self-Publishing in South Africa"
      metaDescription="Which book size is best for self-publishing in South Africa? A5 vs 6×9, children's formats and genre recommendations — all in one guide."
      metaKeywords="best book size self publishing, book sizes South Africa, A5 vs 6x9, children's book sizes, novel size South Africa"
      canonical="https://www.creativebooks.co.za/bestbooksizeforselfpublishing"
      schema={schema}
      subtitle="Self Publishing Guide"
      h1="The Best Book Size for Self-Publishing"
      intro="Choosing the right book size is one of the most important decisions in the publishing process. The wrong size can make your book look unprofessional, cost more to produce, and reduce your profit margin."
      sections={[
        {
          heading: 'The Most Popular Book Sizes in South Africa',
          body: 'These are the book formats used most frequently by South African publishers and self-publishing authors:',
          table: {
            headers: ['Format', 'Dimensions', 'Best For', 'Local Popularity'],
            rows: [
              ['A5', '148 × 210mm', 'Novels, memoirs, non-fiction, poetry', '★★★★★'],
              ['6×9 Inch', '152 × 229mm', 'Business, Amazon KDP, trade paperback', '★★★★☆'],
              ['A4', '210 × 297mm', 'Workbooks, textbooks, manuals', '★★★☆☆'],
              ['Square 20×20cm', '200 × 200mm', "Children's picture books", '★★★★★'],
              ['Square 15×15cm', '150 × 150mm', "Children's board books", '★★★☆☆'],
              ['Square 21×21cm', '210 × 210mm', "Premium children's books", '★★★★☆'],
            ],
          },
        },
        {
          heading: 'A5 — The South African Standard',
          body: 'A5 (148×210mm / 5.83×8.27 inches) is the dominant book format in South African bookstores and is used for the majority of locally published novels, non-fiction, and poetry. It is compact, sits well on shelves, and is very cost-effective to print. If you are publishing primarily for the South African market, A5 is almost always the right choice.',
          list: [
            'Cost-effective — more copies per printing budget',
            'Familiar and trusted by South African readers',
            'Perfect for most fiction, non-fiction, and memoir',
            'Widely stocked in South African bookstores',
            'Great shelf presence at markets and literary events',
          ],
          cta: 'Get an A5 printing quote',
        },
        {
          heading: '6×9 — The International Standard',
          body: '6×9 inches (152×229mm) is the standard trade paperback size in the USA and the default format for Amazon KDP print-on-demand. If you plan to sell your book internationally on Amazon, or if your target audience is business professionals who are used to international non-fiction titles, 6×9 is the better choice.',
          list: [
            'Amazon KDP compatible — perfect for print-on-demand',
            'Standard for international business and non-fiction',
            'Familiar to readers of US and UK published books',
            'Slightly larger than A5 — more text visible per page',
            'Available in softcover and hardcover',
          ],
          cta: 'Get a 6×9 printing quote',
        },
        {
          heading: "Children's Book Sizes",
          body: "Children's books are almost always printed in square formats. The size determines the age group, illustration style, and production cost.",
          table: {
            headers: ['Size', 'Best Age Group', 'Common Use', 'Notes'],
            rows: [
              ['15×15cm', 'Ages 0–4', 'Board books, early readers', 'Compact, fits small hands'],
              ['20×20cm', 'Ages 3–8', 'Picture books', 'Most popular size in SA'],
              ['21×21cm', 'Ages 4–10', 'Premium picture books', 'Publisher-grade format'],
            ],
          },
          cta: "View children's book printing options",
        },
        {
          heading: 'How Book Size Affects Cost',
          body: 'Larger formats use more paper and cost more per copy. Here is a rough comparison of relative printing costs for a 200-page book at 100 copies:',
          table: {
            headers: ['Format', 'Relative Cost', 'Notes'],
            rows: [
              ['A5 Softcover', 'Lowest', 'Most cost-effective option'],
              ['6×9 Softcover', '+8–12%', 'Slightly more paper than A5'],
              ['A4 Softcover', '+35–50%', 'Significantly more paper'],
              ['Hardcover (any)', '+60–120%', 'Premium production cost'],
            ],
          },
        },
        {
          heading: 'Our Recommendation by Genre',
          body: 'Not sure which size is right for your book? Here is our recommendation by genre:',
          table: {
            headers: ['Genre', 'Recommended Size', 'Reason'],
            rows: [
              ['Novel / Fiction', 'A5', 'South African standard, cost-effective'],
              ['Memoir / Biography', 'A5', 'Personal, intimate feel'],
              ['Business / Non-Fiction', '6×9 or A5', '6×9 for Amazon; A5 for SA retail'],
              ['Poetry', 'A5', 'Classic literary format'],
              ["Children's Picture Book", '20×20cm', 'Most popular SA format'],
              ['Academic / Textbook', 'A5 or A4', 'A4 for workbooks; A5 for readers'],
              ['Cookbook', 'A4 or A5 Full Colour', 'A4 for photography'],
              ['Training Manual', 'A4', 'Wire-O binding recommended'],
            ],
          },
          cta: 'Talk to our team about the best size for your book',
        },
      ]}
      faqs={faqs}
      relatedLinks={[
        { label: 'A5 Book Printing', path: '/printing/a5' },
        { label: '6×9 Book Printing', path: '/printing/6x9' },
        { label: 'A5 vs 6×9 Comparison', path: '/a5vs6x9bookprinting' },
        { label: "Children's Book Printing", path: '/printing/childrensbooks' },
        { label: 'Book Printing Costs', path: '/howmuchdoesbookprintingcost' },
        { label: 'How to Print a Book', path: '/howtoprintabookinsouthafrica' },
        { label: 'Get a Quote', path: '/getquote' },
      ]}
      ctaTitle="Choose Your Book Size and Get a Quote"
      ctaDescription="Tell us your genre and requirements — we'll recommend the best format and send a competitive quote."
    />
  );
}