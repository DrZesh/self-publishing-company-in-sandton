// Master pricing database extracted from Creative Books SA website
// This is the single source of truth for all pricing

export const MASTER_PRICING = {
  printing: {
    a5_cream: [
      { pageRange: '50-100', copies: 100, price: 5500, unit: 'per_order' },
      { pageRange: '115-150', copies: 100, price: 6250, unit: 'per_order' },
      { pageRange: '160-200', copies: 100, price: 7500, unit: 'per_order' },
      { pageRange: '210-250', copies: 100, price: 8750, unit: 'per_order' },
      { pageRange: '260-300', copies: 100, price: 9600, unit: 'per_order' },
      { pageRange: '310-350', copies: 100, price: 11500, unit: 'per_order' },
      { pageRange: '360-400', copies: 100, price: 12500, unit: 'per_order' },
    ],
    a5_white: [
      { pageRange: '50-100', copies: 100, price: 5200, unit: 'per_order' },
      { pageRange: '115-150', copies: 100, price: 5950, unit: 'per_order' },
      { pageRange: '160-200', copies: 100, price: 7200, unit: 'per_order' },
      { pageRange: '210-250', copies: 100, price: 8450, unit: 'per_order' },
      { pageRange: '260-300', copies: 100, price: 9300, unit: 'per_order' },
      { pageRange: '310-350', copies: 100, price: 11200, unit: 'per_order' },
      { pageRange: '360-400', copies: 100, price: 12200, unit: 'per_order' },
    ],
    '6x9_cream': [
      { pageRange: '50-100', copies: 100, price: 6200, unit: 'per_order' },
      { pageRange: '115-150', copies: 100, price: 6950, unit: 'per_order' },
      { pageRange: '160-200', copies: 100, price: 8200, unit: 'per_order' },
      { pageRange: '210-250', copies: 100, price: 9450, unit: 'per_order' },
      { pageRange: '260-300', copies: 100, price: 10300, unit: 'per_order' },
      { pageRange: '310-350', copies: 100, price: 12200, unit: 'per_order' },
      { pageRange: '360-400', copies: 100, price: 13200, unit: 'per_order' },
    ],
    '6x9_white': [
      { pageRange: '50-100', copies: 100, price: 5900, unit: 'per_order' },
      { pageRange: '115-150', copies: 100, price: 6650, unit: 'per_order' },
      { pageRange: '160-200', copies: 100, price: 7900, unit: 'per_order' },
      { pageRange: '210-250', copies: 100, price: 9150, unit: 'per_order' },
      { pageRange: '260-300', copies: 100, price: 10000, unit: 'per_order' },
      { pageRange: '310-350', copies: 100, price: 11900, unit: 'per_order' },
      { pageRange: '360-400', copies: 100, price: 12900, unit: 'per_order' },
    ],
    // Children's books - custom quote required
    children_15x15: { type: 'custom', message: 'Custom quote based on page count and full-colour requirements' },
    children_20x20: { type: 'custom', message: 'Custom quote based on page count and full-colour requirements' },
    children_21x21: { type: 'custom', message: 'Custom quote based on page count and full-colour requirements' },
    hardcover: { type: 'custom', message: 'Custom quote required' },
  },
  design: {
    book_cover: [
      { packageName: 'Starter', price: 3850, description: 'Front cover only, flat design' },
      { packageName: 'Standard', price: 5500, description: 'Front cover + back + spine' },
      { packageName: 'Premium', price: 7700, description: 'Front + back + spine + concept development' },
      { packageName: 'Full Design', price: 11000, description: 'Complete wrap-around design with concepts' },
    ],
    typesetting: [
      { price: 10.50, unit: 'per_page', description: 'Standard typesetting' },
      { price: 15.40, unit: 'per_page', description: 'Complex formatting with images/tables' },
    ],
  },
  editing: {
    proofreading: [
      { price: 0.04, unit: 'per_word', description: 'Proofreading' },
    ],
    copy_editing: [
      { price: 0.08, unit: 'per_word', description: 'Copy editing' },
    ],
    academic_editing: [
      { price: 0.12, unit: 'per_word', description: 'Academic/thesis editing' },
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

  const basePrice = tier.price;
  const multiplier = QUANTITY_MULTIPLIERS[copies] || 1;
  const totalPrice = Math.round(basePrice * multiplier);
  const perCopyPrice = Math.round(totalPrice / copies);

  return {
    type: 'standard',
    basePrice,
    totalPrice,
    perCopyPrice,
    multiplier,
  };
}