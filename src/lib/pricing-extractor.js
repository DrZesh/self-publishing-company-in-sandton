// Master pricing database extracted from Creative Books SA website
// This is the single source of truth for all pricing

export const MASTER_PRICING = {
  printing: {
    a5_cream: [
      { pageRange: '1-100', pricePerBook: 45, unit: 'per_book' },
      { pageRange: '115-150', pricePerBook: 51, unit: 'per_book' },
      { pageRange: '160-200', pricePerBook: 65, unit: 'per_book' },
      { pageRange: '215-300', pricePerBook: 78, unit: 'per_book' },
      { pageRange: '315-350', pricePerBook: 85, unit: 'per_book' },
      { pageRange: '360-400', pricePerBook: 96, unit: 'per_book' },
    ],
    a5_white: [
      { pageRange: '1-100', pricePerBook: 45, unit: 'per_book' },
      { pageRange: '115-150', pricePerBook: 51, unit: 'per_book' },
      { pageRange: '160-200', pricePerBook: 65, unit: 'per_book' },
      { pageRange: '215-300', pricePerBook: 78, unit: 'per_book' },
      { pageRange: '315-350', pricePerBook: 85, unit: 'per_book' },
      { pageRange: '360-400', pricePerBook: 96, unit: 'per_book' },
    ],
    '6x9_cream': [
      { pageRange: '1-100', pricePerBook: 45, unit: 'per_book' },
      { pageRange: '115-150', pricePerBook: 51, unit: 'per_book' },
      { pageRange: '160-200', pricePerBook: 65, unit: 'per_book' },
      { pageRange: '215-300', pricePerBook: 78, unit: 'per_book' },
      { pageRange: '315-350', pricePerBook: 85, unit: 'per_book' },
      { pageRange: '360-400', pricePerBook: 96, unit: 'per_book' },
    ],
    '6x9_white': [
      { pageRange: '1-100', pricePerBook: 45, unit: 'per_book' },
      { pageRange: '115-150', pricePerBook: 51, unit: 'per_book' },
      { pageRange: '160-200', pricePerBook: 65, unit: 'per_book' },
      { pageRange: '215-300', pricePerBook: 78, unit: 'per_book' },
      { pageRange: '315-350', pricePerBook: 85, unit: 'per_book' },
      { pageRange: '360-400', pricePerBook: 96, unit: 'per_book' },
    ],
    // Children's books - custom quote required
    children_15x15: { type: 'custom', message: 'Custom quote based on page count and full-colour requirements' },
    children_20x20: { type: 'custom', message: 'Custom quote based on page count and full-colour requirements' },
    children_21x21: { type: 'custom', message: 'Custom quote based on page count and full-colour requirements' },
    hardcover: { type: 'custom', message: 'Custom quote required' },
  },
  design: {
    book_cover: [
      { packageName: 'Authors Book Cover', price: 1700, description: 'Authors Book Cover' },
      { packageName: 'Stock Design Cover', price: 2150, description: 'Stock Design Cover' },
      { packageName: 'Illustrated Design Cover', price: 3650, description: 'Illustrated Design Cover' },
    ],
    typesetting: [
      { price: 10.5, unit: 'per_page', description: 'Basic typesetting' },
      { price: 12.5, unit: 'per_page', description: 'Standard typesetting' },
      { price: 19.5, unit: 'per_page', description: 'Premium layout' },
    ],
  },
  editing: {
    copy_editing: [
      { price: 0.25, unit: 'per_word', description: 'Copy editing' },
    ],
    line_edit: [
      { price: 0.40, unit: 'per_word', description: 'Line edit' },
    ],
    content_edit: [
      { price: 0.50, unit: 'per_word', description: 'Content edit' },
    ],
  },
  publishing: {
    mini_package: [
      { price: 2200, description: 'Mini Publishing Package (5 copies included)' },
    ],
    a5_publishing: [
      { packageName: 'Core', price: 5500, description: 'A5 Publishing - Core Package' },
      { packageName: 'Full', price: 11000, description: 'A5 Publishing - Full Package' },
    ],
    '6x9_publishing': [
      { packageName: 'Core', price: 5500, description: '6×9 Publishing - Core Package' },
      { packageName: 'Full', price: 11000, description: '6×9 Publishing - Full Package' },
    ],
  },
};

// Quantity multipliers for printing (based on 100 copies = 1x)
export const QUANTITY_MULTIPLIERS = {
  100: 1,
  150: 1.45,
  200: 1.85,
  250: 2.25,
  300: 2.6,
  400: 3.3,
  500: 4.0,
  1000: 7.5,
};

// Helper to get printing price
export function getPrintingPrice(size, paper, pages, copies = 100) {
  const key = `${size}_${paper}`;
  const tiers = MASTER_PRICING.printing[key];
  
  if (!tiers || tiers.type === 'custom') return { type: 'custom' };

  let tier = null;
  for (let t of tiers) {
    const [min, max] = t.pageRange.split('-').map(Number);
    if (pages >= min && pages <= max) {
      tier = t;
      break;
    }
  }

  if (!tier) return { type: 'custom' };

  const pricePerBook = tier.pricePerBook;
  const totalPrice = Math.round(pricePerBook * copies);

  return {
    type: 'standard',
    pricePerBook,
    totalPrice,
    perCopyPrice: pricePerBook,
  };
}