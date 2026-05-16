// ============================================================
// CREATIVE BOOKS SA — CENTRALISED PRICING CONFIGURATION
// Single source of truth for all calculator prices.
// ============================================================

export const PRINTING = {
  a5: {
    '50-100':   5500,
    '115-150':  6250,
    '160-200':  7500,
    '210-250':  8750,
    '260-300':  9600,
    '310-350': 11500,
    '360-400': 12500,
  },
  '6x9': {
    '50-100':   6200,
    '115-150':  6950,
    '160-200':  8200,
    '210-250':  9450,
    '260-300': 10300,
    '310-350': 12200,
    '360-400': 13200,
  },
};

export const QTY_MULTIPLIERS = {
  100:  1.00,
  150:  1.45,
  200:  1.85,
  250:  2.25,
  300:  2.60,
  400:  3.30,
  500:  4.00,
  1000: 7.50,
};

export const COVER_DESIGN = {
  paperback: { authors: 1650, stock: 2150, illustrated: 3850 },
  ebook:     { authors: 1200, stock: 1700, illustrated: 3400 },
};

export const TYPESETTING = {
  basic:    10.50,
  standard: 12.50,
  premium:  19.50,
};

export const PACKAGES = {
  mini_bronze: { label: 'Mini Bronze',   price: 14250, maxWords: 30000, maxPages: 150, copies: 5,   size: 'any', includesEbook: false },
  mini_silver: { label: 'Mini Silver',   price: 16500, maxWords: 50000, maxPages: 250, copies: 5,   size: 'any', includesEbook: false },
  mini_gold:   { label: 'Mini Gold',     price: 20000, maxWords: 100000,maxPages: 350, copies: 5,   size: 'any', includesEbook: false },
  a5_bronze:   { label: 'Full A5 Bronze',price: 21000, maxWords: 37500, maxPages: 150, copies: 100, size: 'a5',  includesEbook: false },
  a5_silver:   { label: 'Full A5 Silver',price: 25500, maxWords: 50000, maxPages: 200, copies: 150, size: 'a5',  includesEbook: false },
  a5_gold:     { label: 'Full A5 Gold',  price: 35000, maxWords: 62500, maxPages: 250, copies: 200, size: 'a5',  includesEbook: true  },
  '6x9_bronze':{ label: 'Full 6×9 Bronze',price:22700, maxWords: 37500, maxPages: 150, copies: 100, size: '6x9', includesEbook: false },
  '6x9_silver':{ label: 'Full 6×9 Silver',price:27200, maxWords: 50000, maxPages: 200, copies: 150, size: '6x9', includesEbook: false },
  '6x9_gold':  { label: 'Full 6×9 Gold', price: 36700, maxWords: 62500, maxPages: 250, copies: 200, size: '6x9', includesEbook: true  },
  ebook_only:  { label: 'Ebook Package', price: 6500,  maxWords: 37500, maxPages: 150, copies: 0,   size: 'n/a', includesEbook: true  },
  paperback_pkg:{ label:'Paperback Package',price:8500, maxWords: 62500, maxPages: 250, copies: 0,   size: 'any', includesEbook: true  },
  plus_pkg:    { label: 'Plus Package',  price: 12500, maxWords: 87500, maxPages: 350, copies: 0,   size: 'any', includesEbook: true  },
};

export const EBOOK_PRICE = 6500;

// -----------------------------------------------------------
// HELPERS
// -----------------------------------------------------------

export function getPrintingTierKey(pages) {
  if (pages >= 50  && pages <= 100) return '50-100';
  if (pages >= 115 && pages <= 150) return '115-150';
  if (pages >= 160 && pages <= 200) return '160-200';
  if (pages >= 210 && pages <= 250) return '210-250';
  if (pages >= 260 && pages <= 300) return '260-300';
  if (pages >= 310 && pages <= 350) return '310-350';
  if (pages >= 360 && pages <= 400) return '360-400';
  return null;
}

export function getPrintingCost(size, pages, copies) {
  const tier = getPrintingTierKey(pages);
  if (!tier) return null;
  const base = PRINTING[size]?.[tier];
  if (!base) return null;
  const mult = QTY_MULTIPLIERS[copies] || null;
  if (!mult) return null;
  const total = Math.round(base * mult);
  return { total, perCopy: Math.round(total / copies), tier };
}

export function getTypesettingCost(tier, pages) {
  return Math.round((TYPESETTING[tier] || TYPESETTING.basic) * pages);
}

export function formatZAR(amount) {
  if (amount == null || isNaN(amount)) return 'R –';
  return 'R' + Math.round(amount).toLocaleString('en-ZA');
}

// -----------------------------------------------------------
// SMART PRICING ENGINE
// -----------------------------------------------------------

/**
 * Given the wizard answers, compute:
 *   pathA: best-fit package (or null if none fits)
 *   pathB: à la carte total
 *   recommendation: 'A' | 'B' | 'custom'
 */
export function computePricing(answers) {
  const {
    projectType,    // step1
    stage,          // step2
    pages,          // step3
    words,          // step3
    coverTier,      // step5: 'authors'|'stock'|'illustrated'|'premium'|null
    coverVariant,   // step5: 'paperback'|'ebook'|null (whether they need ebook cover)
    layoutTier,     // step6: 'basic'|'standard'|'premium'|null
    wantPrint,      // step7: true|false
    bookSize,       // step7a: 'a5'|'6x9'|'hardcover'
    copies,         // step7b: number
    wantEbook,      // step8: true|false
    extras,         // step9: array of strings
    ghostwriting,   // whether ghostwriting was selected (step2/4)
    editingType,    // step4
  } = answers;

  const hasCustomOnly = ghostwriting ||
    (extras || []).some(e => ['ghostwriting','memoir_writing','biography','christian_writing',
      'author_website','annual_report','childrens_book','hardcover','thesis_editing'].includes(e)) ||
    bookSize === 'hardcover';

  const lines = [];  // { label, sub, amount, custom }

  // --- PATH B (à la carte) ---

  // Cover
  if (coverTier && coverTier !== 'premium' && stage !== 'fully_designed') {
    const variant = coverVariant === 'ebook_only' ? 'ebook' : 'paperback';
    const price = COVER_DESIGN[variant]?.[coverTier];
    if (price) {
      const labels = { authors: "Author's Book Cover", stock: 'Stock Design Cover', illustrated: 'Illustrated Cover' };
      lines.push({ id: 'cover', label: 'Cover Design', sub: `${labels[coverTier]} (${variant})`, amount: price });
    }
    // ebook cover add-on if both needed
    if (coverVariant === 'both') {
      const ebookPrice = COVER_DESIGN.ebook?.[coverTier];
      const coverLabels = { authors: "Author's Book Cover", stock: 'Stock Design Cover', illustrated: 'Illustrated Cover' };
      if (ebookPrice) {
        lines.push({ id: 'cover_ebook', label: 'Ebook Cover (add-on)', sub: `${coverLabels[coverTier]} — ebook format`, amount: ebookPrice });
      }
    }
  } else if (coverTier === 'premium') {
    lines.push({ id: 'cover', label: 'Cover Design', sub: 'Premium / Specialty Cover', amount: null, custom: true });
  }

  // Typesetting
  if (layoutTier && stage !== 'fully_designed' && pages > 0) {
    const cost = getTypesettingCost(layoutTier, pages);
    const tierLabels = { basic: 'Basic Layout', standard: 'Standard Layout', premium: 'Premium Layout' };
    lines.push({ id: 'typeset', label: 'Typesetting', sub: `${tierLabels[layoutTier]} — ${pages} pages × ${formatZAR(TYPESETTING[layoutTier])}/page`, amount: cost });
  }

  // Printing
  if (wantPrint && bookSize !== 'hardcover') {
    const printResult = getPrintingCost(bookSize || 'a5', pages, copies || 100);
    if (printResult) {
      lines.push({ id: 'print', label: 'Book Printing', sub: `${copies} copies, ${(bookSize || 'a5').toUpperCase()}, ${pages} pages`, amount: printResult.total, perCopy: printResult.perCopy });
    } else {
      lines.push({ id: 'print', label: 'Book Printing', sub: 'Out of standard range', amount: null, custom: true });
    }
  } else if (bookSize === 'hardcover') {
    lines.push({ id: 'print', label: 'Hardcover Printing', sub: 'Custom quote required', amount: null, custom: true });
  }

  // Ebook
  if (wantEbook && stage !== 'ebook_only_ready') {
    lines.push({ id: 'ebook', label: 'Ebook Conversion', sub: 'Amazon Kindle ready', amount: EBOOK_PRICE });
  }

  // Editing (standalone — custom quote if not in package)
  if (editingType && stage !== 'already_edited' && stage !== 'fully_designed') {
    const editLabels = { proofread: 'Proofreading', copy: 'Copy Editing', developmental: 'Developmental Edit', full: 'Full Editing Package' };
    lines.push({ id: 'editing', label: editLabels[editingType] || 'Editing', sub: 'Custom quote — confirmed in formal proposal', amount: null, custom: true });
  }

  // Ghostwriting
  if (ghostwriting) {
    lines.push({ id: 'ghost', label: 'Ghostwriting', sub: 'Full ghostwriting service — custom quote required', amount: null, custom: true });
  }

  // Extras
  const EXTRA_LABELS = {
    author_website:     'Author Website',
    book_launch:        'Book Launch & Marketing Support',
    rollup_banner:      'Roll-up Banner Design & Print',
    book_trailer:       'Book Trailer Video',
    press_release:      'Press Release & Media Outreach',
    launch_event:       'Book Launch Event Planning',
    distribution:       'International Distribution Setup',
    isbn:               'ISBN Registration',
    audiobook:          'Audiobook Production',
    speaking_coaching:  'Speaking & Workshop Coaching',
  };
  (extras || []).forEach(e => {
    if (EXTRA_LABELS[e]) {
      lines.push({ id: `extra_${e}`, label: EXTRA_LABELS[e], sub: 'Custom quote — pricing TBC', amount: null, custom: true });
    }
  });

  const pathBTotal = lines.reduce((s, l) => s + (l.amount || 0), 0);

  // --- PATH A (best-fit package) ---
  let pathA = null;

  if (!hasCustomOnly && bookSize !== 'hardcover') {
    if (!wantPrint || stage === 'ebook_only_ready') {
      // Ebook only
      if (words <= 37500) pathA = PACKAGES.ebook_only;
      else if (words <= 62500) pathA = PACKAGES.paperback_pkg;
      else pathA = PACKAGES.plus_pkg;
    } else if (copies <= 10) {
      // Mini packages
      if (words <= 30000 && pages <= 150) pathA = PACKAGES.mini_bronze;
      else if (words <= 50000 && pages <= 250) pathA = PACKAGES.mini_silver;
      else if (words <= 100000 && pages <= 350) pathA = PACKAGES.mini_gold;
    } else {
      // Full packages
      const size = bookSize || 'a5';
      const prefix = size === 'a5' ? 'a5' : '6x9';
      if (words <= 37500 && pages <= 150) {
        pathA = PACKAGES[`${prefix}_bronze`];
      } else if (words <= 50000 && pages <= 200) {
        pathA = PACKAGES[`${prefix}_silver`];
      } else if (words <= 62500 && pages <= 250) {
        pathA = PACKAGES[`${prefix}_gold`];
      }
      // If copies > package copies, add overage printing cost
      if (pathA && copies > pathA.copies) {
        const overageCopies = copies - pathA.copies;
        const overageResult = getPrintingCost(size, pages, Math.min(overageCopies, 100));
        const overage = overageResult ? Math.round(overageResult.total * (overageCopies / 100)) : 0;
        pathA = { ...pathA, overageCost: overage, totalWithOverage: pathA.price + overage };
      }
    }
  }

  const pathATotal = pathA ? (pathA.totalWithOverage || pathA.price) : null;

  // Recommendation
  let recommendation = 'B';
  if (hasCustomOnly) {
    recommendation = 'custom';
  } else if (pathA && pathATotal <= pathBTotal) {
    recommendation = 'A';
  }

  return { lines, pathBTotal, pathA, pathATotal, recommendation, hasCustomOnly };
}