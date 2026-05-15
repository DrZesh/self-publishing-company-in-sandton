import React from 'react';
import LongTailArticlePage from '../../../components/seo/LongTailArticlePage';
import { faqSchema, breadcrumbSchema, articleSchema } from '../../../lib/seo/schemas';

const faqs = [
  { question: 'What file format do I need to print a book in South Africa?', answer: 'You need a print-ready PDF (PDF/X-1a preferred) at 300 DPI with 3mm bleed on all sides. If you don\'t have a print-ready file, we offer typesetting and layout services.' },
  { question: 'How much does it cost to print a book in South Africa?', answer: 'A 200-page A5 softcover book costs approximately R45–R65 per copy for 100 copies. Hardcover and full-colour printing cost more. Contact us for a precise quote.' },
  { question: 'What is the minimum print run in South Africa?', answer: 'Minimum 50 copies for offset printing. Print-on-demand allows printing from a single copy.' },
  { question: 'How long does book printing take in South Africa?', answer: 'Standard turnaround is 7–14 business days. Rush printing (3–5 days) is available at additional cost.' },
  { question: 'Do I need an ISBN to print a book?', answer: 'You don\'t need an ISBN to print a book, but you need one to sell it through retailers, libraries, and online stores. We can register your ISBN for you.' },
];

export default function HowToPrintABook() {
  const schema = {
    '@context': 'https://schema.org',
    '@graph': [
      articleSchema({ title: 'How to Print a Book in South Africa', description: 'A complete step-by-step guide to printing your book in South Africa.', datePublished: '2025-01-01', url: '/howtoprintabookinsouthafrica' }),
      faqSchema(faqs),
      breadcrumbSchema([{ name: 'Home', path: '/' }, { name: 'Resources', path: '/blog' }, { name: 'How to Print a Book', path: '/howtoprintabookinsouthafrica' }]),
    ],
  };

  return (
    <LongTailArticlePage
      metaTitle="How to Print a Book in South Africa | Complete Guide"
      metaDescription="Everything you need to know about printing a book in South Africa. File prep, paper choices, binding options and pricing."
      metaKeywords="how to print a book South Africa, book printing guide, book printing process, print ready PDF book, book printing steps"
      canonical="https://www.creativebookssa.co.za/howtoprintabookinsouthafrica"
      schema={schema}
      subtitle="Book Printing Guide"
      h1="How to Print a Book in South Africa"
      intro="Printing a book in South Africa is simpler than most first-time authors expect. This guide walks you through every step — from preparing your files to collecting your finished books."
      sections={[
        {
          heading: 'Step 1 — Prepare Your Manuscript',
          body: 'Before printing, your manuscript must be typeset and laid out in a professional page design. This includes setting margins, choosing fonts, creating chapter headings, and formatting headers and footers. If your manuscript is in Microsoft Word, it needs to be converted to a print-ready layout. We offer professional typesetting and layout services.',
          list: [
            'Use professional typesetting software (InDesign, Affinity Publisher, or Vellum)',
            'Set inner margins wider than outer margins to account for the spine',
            'Use cream or white 80gsm/100gsm paper as your page size reference',
            'Include front matter (title page, copyright page, contents)',
            'Include back matter (bibliography, index, author bio)',
          ],
          cta: 'Get professional typesetting from R1,500',
        },
        {
          heading: 'Step 2 — Choose Your Book Size',
          body: 'The most popular book sizes in South Africa are A5 (148×210mm) for novels, memoirs, and non-fiction, and 6×9 inches (152×229mm) for trade paperbacks and Amazon KDP books. Children\'s books are typically square: 15×15cm, 20×20cm, or 21×21cm.',
          table: {
            headers: ['Format', 'Dimensions', 'Best For'],
            rows: [
              ['A5', '148 × 210mm', 'Novels, poetry, non-fiction, memoirs'],
              ['6×9 Inch', '152 × 229mm', 'Business, trade paperback, Amazon KDP'],
              ['A4', '210 × 297mm', 'Workbooks, manuals, textbooks'],
              ['15×15cm', '150 × 150mm', "Children's board books"],
              ['20×20cm', '200 × 200mm', "Children's picture books"],
              ['21×21cm', '210 × 210mm', "Premium children's picture books"],
            ],
          },
        },
        {
          heading: 'Step 3 — Choose Your Paper',
          body: 'Paper choice significantly affects the look, feel, and cost of your book. For novels and literary fiction, cream paper (80gsm or 100gsm) is recommended — it\'s warmer on the eyes and gives a premium literary feel. For illustrated books, children\'s books, and full-colour content, bright white coated paper (130gsm+) is best.',
          list: [
            'Cream 80gsm — most popular for novels, memoirs, poetry',
            'White 80gsm — clean and crisp for non-fiction and academic books',
            'White 100gsm — slightly heavier, used for quality trade books',
            'Coated 130gsm–170gsm — for full-colour children\'s books and cookbooks',
          ],
        },
        {
          heading: 'Step 4 — Choose Your Binding Type',
          body: 'The binding type determines how your book\'s pages are held together. Perfect binding (softcover) is the most common and affordable option for most books. Hardcover case binding is used for premium, gift, and collector editions.',
          table: {
            headers: ['Binding', 'Best For', 'Cost'],
            rows: [
              ['Perfect Binding (Softcover)', 'Most books — novels, non-fiction, manuals', 'Most affordable'],
              ['Case Binding (Hardcover)', 'Premium books, gifts, collector editions', 'Higher cost'],
              ['Wire-O / Spiral', 'Workbooks, manuals, cookbooks', 'Moderate cost'],
              ['Saddle Stitch', 'Booklets, magazines under 64 pages', 'Lowest cost'],
            ],
          },
          cta: 'Compare printing options and get a quote',
        },
        {
          heading: 'Step 5 — Prepare a Print-Ready PDF',
          body: 'Your finished book file must be submitted as a print-ready PDF. This means all fonts are embedded, images are 300 DPI, the document includes 3mm bleed on all sides, and crop marks are included. The colour mode should be CMYK for colour books. If you are unsure how to create a print-ready PDF, we can do it for you.',
          list: [
            'Export as PDF/X-1a or PDF/X-4',
            'Set resolution to 300 DPI for all images',
            'Add 3mm bleed on all four sides',
            'Embed all fonts',
            'Convert to CMYK for colour content',
            'Include crop marks and registration marks',
          ],
        },
        {
          heading: 'Step 6 — Get a Quote and Approve a Proof',
          body: 'Once your files are ready, submit them to us for a printing quote. We check your files for print compatibility at no charge and send a detailed quote within 24 hours. Before your full print run, we recommend ordering a physical proof copy — this lets you check the colours, paper, binding, and overall quality before committing to the full quantity.',
        },
        {
          heading: 'Book Printing Costs in South Africa',
          body: 'Book printing costs depend on page count, size, paper type, binding, quantity, and colour. Here is a general pricing guide:',
          table: {
            headers: ['Book Type', 'Pages', 'Quantity', 'Est. Cost Per Copy'],
            rows: [
              ['A5 Softcover (B&W)', '200 pages', '100 copies', 'R45–R65'],
              ['A5 Hardcover (B&W)', '200 pages', '100 copies', 'R80–R120'],
              ['6×9 Softcover (B&W)', '200 pages', '100 copies', 'R50–R75'],
              ['Children\'s Book (Full Colour)', '32 pages', '100 copies', 'R60–R100'],
              ['A4 Workbook', '100 pages', '100 copies', 'R55–R80'],
            ],
          },
          cta: 'Get an accurate printing quote for your book',
        },
      ]}
      faqs={faqs}
      relatedLinks={[
        { label: 'Book Printing Johannesburg', path: '/bookprintingjohannesburg' },
        { label: 'A5 Book Printing', path: '/printing/a5' },
        { label: '6×9 Book Printing', path: '/printing/6x9' },
        { label: 'Hardcover Printing', path: '/printing/hardcover' },
        { label: 'Book Printing Costs', path: '/howmuchdoesbookprintingcost' },
        { label: 'A5 vs 6×9 Comparison', path: '/a5vs6x9bookprinting' },
        { label: 'Typesetting Services', path: '/typesetting' },
        { label: 'ISBN Registration', path: '/isbnregistration' },
        { label: 'Get a Quote', path: '/getquote' },
      ]}
      ctaTitle="Ready to Print Your Book?"
      ctaDescription="Submit your specs and get a free printing quote from our Johannesburg team within 24 hours."
    />
  );
}