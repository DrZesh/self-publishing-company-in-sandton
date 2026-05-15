import React from 'react';
import LongTailArticlePage from '../../../components/seo/LongTailArticlePage';
import { faqSchema, breadcrumbSchema, articleSchema } from '../../../lib/seo/schemas';

const faqs = [
  { question: 'How much does it cost to print 100 books?', answer: 'Printing 100 copies of a 200-page A5 softcover book costs approximately R4,500–R6,500 (R45–R65 per copy). Hardcover costs more — approximately R8,000–R12,000 for 100 copies.' },
  { question: 'Is it cheaper to print more books?', answer: 'Yes. Book printing follows economies of scale — the more copies you print, the lower the per-unit cost. Printing 500 copies typically reduces the per-copy cost by 30–50% compared to 100 copies.' },
  { question: 'What is the cheapest book printing option in South Africa?', answer: 'Softcover (perfect binding) with black and white interior on 80gsm cream or white paper is the most affordable option. A 200-page A5 softcover can cost as little as R35–R45 per copy at 200+ copies.' },
  { question: 'Does full-colour interior printing cost more?', answer: 'Yes. Full-colour interior printing costs significantly more than black and white — typically 3–5× more per page. For a children\'s book, expect R80–R150 per copy for 100 copies.' },
  { question: 'What affects the cost of printing a book?', answer: 'The main factors are: page count, book size, paper type, binding type (softcover vs hardcover), interior colour (B&W vs full colour), cover lamination, and quantity. All of these affect the final per-unit price.' },
];

export default function HowMuchDoesBookPrintingCost() {
  const schema = {
    '@context': 'https://schema.org',
    '@graph': [
      articleSchema({ title: 'How Much Does Book Printing Cost in South Africa?', description: 'Complete pricing guide for book printing in South Africa.', datePublished: '2025-01-01', url: '/howmuchdoesbookprintingcost' }),
      faqSchema(faqs),
      breadcrumbSchema([{ name: 'Home', path: '/' }, { name: 'Resources', path: '/blog' }, { name: 'Book Printing Costs', path: '/howmuchdoesbookprintingcost' }]),
    ],
  };

  return (
    <LongTailArticlePage
      metaTitle="How Much Does Book Printing Cost in South Africa?"
      metaDescription="Book printing costs in South Africa explained. Pricing for paperback, hardcover, A5 and 6x9 — plus what affects the price."
      metaKeywords="book printing cost South Africa, how much does book printing cost, book printing prices South Africa, A5 printing cost, hardcover printing cost"
      canonical="https://www.creativebookssa.co.za/howmuchdoesbookprintingcost"
      schema={schema}
      subtitle="Book Printing Pricing Guide"
      h1="How Much Does Book Printing Cost in South Africa?"
      intro="Book printing costs in South Africa depend on several factors. This guide breaks down the pricing for every common book type, size, and format so you can budget accurately for your project."
      sections={[
        {
          heading: 'Key Factors That Affect Book Printing Cost',
          body: 'Before looking at specific prices, it\'s important to understand what drives book printing costs in South Africa:',
          list: [
            'Page count — more pages means more paper and more printing time',
            'Book size — larger formats use more paper per page',
            'Paper type — coated glossy paper costs more than uncoated cream or white',
            'Binding type — hardcover costs more than softcover',
            'Interior colour — full-colour interior costs 3–5× more than black and white',
            'Cover lamination — matte lamination is slightly more expensive than gloss',
            'Quantity — more copies = lower per-unit cost',
          ],
        },
        {
          heading: 'A5 Softcover Book Printing Costs',
          body: 'A5 softcover is the most popular and affordable book format in South Africa. Black and white interior on cream paper, perfect binding with laminated cover.',
          table: {
            headers: ['Page Count', '50 Copies', '100 Copies', '250 Copies', '500 Copies'],
            rows: [
              ['100 pages', 'R60–R80', 'R40–R55', 'R30–R42', 'R25–R35'],
              ['200 pages', 'R80–R110', 'R50–R70', 'R38–R52', 'R30–R42'],
              ['300 pages', 'R100–R140', 'R65–R90', 'R48–R65', 'R38–R52'],
              ['400 pages', 'R120–R165', 'R78–R105', 'R58–R78', 'R45–R62'],
            ],
          },
          cta: 'Get a precise A5 printing quote',
        },
        {
          heading: 'A5 Hardcover Book Printing Costs',
          body: 'Hardcover case binding adds a premium look and durability. Prices shown are for black and white interior with dust jacket.',
          table: {
            headers: ['Page Count', '50 Copies', '100 Copies', '250 Copies'],
            rows: [
              ['200 pages', 'R140–R180', 'R90–R125', 'R65–R90'],
              ['300 pages', 'R165–R215', 'R105–R150', 'R78–R108'],
              ['400 pages', 'R190–R250', 'R120–R170', 'R90–R125'],
            ],
          },
        },
        {
          heading: '6×9 Book Printing Costs (Trade Paperback)',
          body: '6×9 is the standard Amazon KDP size. Slightly larger than A5, costs are similar.',
          table: {
            headers: ['Page Count', '50 Copies', '100 Copies', '250 Copies'],
            rows: [
              ['200 pages', 'R85–R115', 'R55–R75', 'R40–R55'],
              ['300 pages', 'R110–R145', 'R68–R95', 'R50–R70'],
            ],
          },
        },
        {
          heading: "Children's Book Printing Costs (Full Colour)",
          body: "Full-colour printing on coated paper for children's picture books. Prices are per copy for the stated quantity.",
          table: {
            headers: ['Size / Pages', '50 Copies', '100 Copies', '250 Copies'],
            rows: [
              ['15×15cm / 24pp', 'R120–R160', 'R80–R110', 'R58–R80'],
              ['20×20cm / 32pp', 'R145–R190', 'R95–R130', 'R68–R95'],
              ['21×21cm / 32pp', 'R155–R200', 'R100–R140', 'R72–R100'],
            ],
          },
          cta: "Get a children's book printing quote",
        },
        {
          heading: 'How to Reduce Your Book Printing Cost',
          body: 'There are several ways to reduce your per-copy printing cost without sacrificing quality:',
          list: [
            'Print more copies — economies of scale significantly reduce per-unit cost',
            'Use 80gsm cream paper instead of 100gsm white',
            'Choose softcover instead of hardcover for your main run',
            'Use black and white interior for text-heavy books',
            'Avoid full bleed on every page — it uses more ink',
            'Plan your page count to avoid waste (books print in sections of 8 or 16 pages)',
          ],
          cta: 'Talk to our team about cost-saving options',
        },
        {
          heading: 'Additional Costs to Budget For',
          body: 'Beyond printing, budget for these additional costs if you need them:',
          table: {
            headers: ['Service', 'Typical Cost'],
            rows: [
              ['Typesetting & Layout', 'R1,500–R4,500'],
              ['Cover Design', 'R1,500–R4,500'],
              ['Proofreading', 'R0.02–R0.05 per word'],
              ['Copy Editing', 'R0.04–R0.08 per word'],
              ['ISBN Registration', 'R300–R500'],
              ['Physical Proof Copy', 'R250–R500'],
            ],
          },
        },
      ]}
      faqs={faqs}
      relatedLinks={[
        { label: 'Book Printing Johannesburg', path: '/bookprintingjohannesburg' },
        { label: 'A5 Book Printing', path: '/printing/a5' },
        { label: '6×9 Book Printing', path: '/printing/6x9' },
        { label: 'Hardcover Printing', path: '/printing/hardcover' },
        { label: 'How to Print a Book', path: '/howtoprintabookinsouthafrica' },
        { label: 'Best Book Size Guide', path: '/bestbooksizeforselfpublishing' },
        { label: 'Book Printing Packages', path: '/bookprintingpackages' },
        { label: 'Get a Quote', path: '/getquote' },
      ]}
      ctaTitle="Get an Accurate Printing Quote"
      ctaDescription="Tell us your specs and get a precise, no-obligation printing quote within 24 hours."
    />
  );
}