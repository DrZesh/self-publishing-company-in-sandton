// Maps public route paths to their lazy page-chunk importers.
// Hovering a nav link fires the matching import so the code is
// already downloaded (and often ready) by the time the user clicks —
// this removes the loading flash on navigation.
const importers = {
  '/': () => import('@/pages/Home'),
  '/aboutus': () => import('@/pages/About'),
  '/contact': () => import('@/pages/Contact'),
  '/getquote': () => import('@/pages/GetQuote'),
  '/faq': () => import('@/pages/FAQ'),
  '/book': () => import('@/pages/BookAppointment'),
  '/blog': () => import('@/pages/Blog'),
  '/portfolio': () => import('@/pages/Portfolio'),
  '/book-publishing': () => import('@/pages/services/BookPublishing'),
  '/self-publishing-packages-in-south-africa': () => import('@/pages/services/SelfPublishingPackages'),
  '/publishingpackages/mini': () => import('@/pages/publishing/MiniPackages'),
  '/publishingpackages/a5': () => import('@/pages/publishing/FullPackagesA5'),
  '/publishingpackages/6x9': () => import('@/pages/publishing/FullPackages6x9'),
  '/ebook-publishing': () => import('@/pages/services/EbookPublishing'),
  '/ebookformatting': () => import('@/pages/services/EbookPublishing'),
  '/printing/a5': () => import('@/pages/printing/PrintingA5.jsx'),
  '/printing/6x9': () => import('@/pages/printing/Printing6x9.jsx'),
  '/printing/hardcover': () => import('@/pages/printing/PrintingHardcover.jsx'),
  '/printing/childrensbooks': () => import('@/pages/printing/PrintingChildrensBooks'),
  '/book-printing': () => import('@/pages/services/BookPrinting'),
  '/book-editing': () => import('@/pages/services/BookEditing'),
  '/proofreading': () => import('@/pages/services/Proofreading'),
  '/academicediting': () => import('@/pages/services/AcademicEditing'),
  '/thesisediting': () => import('@/pages/services/ThesisEditing'),
  '/dissertationediting': () => import('@/pages/services/DissertationEditing'),
  '/book-cover-design': () => import('@/pages/services/BookCoverDesign'),
  '/annualreportdesignsandton': () => import('@/pages/AnnualReportDesign'),
  '/typesetting': () => import('@/pages/services/BookTypesetting'),
  '/author-websites': () => import('@/pages/services/AuthorWebsites'),
  '/ghostwriting': () => import('@/pages/services/Ghostwriting'),
  '/memoirwriting': () => import('@/pages/services/MemoirWriting'),
  '/biographywriting': () => import('@/pages/services/BiographyWriting'),
  '/christianbookwriting': () => import('@/pages/services/ChristianBookWriting'),
  '/calculator': () => import('@/pages/calculator/index.jsx'),
  '/resources/CoverSizeCalculator': () => import('@/pages/resources/CoverSizeCalculator'),
  '/barcode-generator': () => import('@/pages/BarcodeGenerator'),
  '/how-to-get-an-isbn-in-south-africa': () => import('@/pages/resources/ISBNRegistration'),
  '/publishingguide': () => import('@/pages/resources/CompletePublishingGuide'),
};

const done = new Set();

export function prefetchRoute(path) {
  if (!path || done.has(path)) return;
  const importer = importers[path];
  if (!importer) return;
  done.add(path);
  importer();
}