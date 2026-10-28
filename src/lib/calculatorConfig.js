// Configuration + core dimension math for the Book Cover Template & Dimensions Calculator.
// All base math is in millimetres.

export const DEFAULT_SETTINGS = {
  bleed: 3.175,        // 0.125"
  safeMargin: 6.35,    // 0.25"
  spineMargin: 1.6,
  wrap: 17,            // hardcover turn-in
  hinge: 8,            // hardcover hinge gap
  defaultFlapWidth: 89, // dust jacket flap
  barcodeWidthFactor: 0.625,
};

// Trim sizes in mm.
export const BOOK_SIZES = {
  '5x8': { label: '5" × 8" (127 × 203.2 mm)', width: 127, height: 203.2 },
  '5.06x7.81': { label: '5.06" × 7.81" (128.5 × 198.4 mm)', width: 128.5, height: 198.4 },
  '5.25x8': { label: '5.25" × 8" (133.4 × 203.2 mm)', width: 133.4, height: 203.2 },
  '5.5x8.5': { label: '5.5" × 8.5" (139.7 × 215.9 mm)', width: 139.7, height: 215.9 },
  '6x9': { label: '6" × 9" (152.4 × 228.6 mm)', width: 152.4, height: 228.6 },
  '6.14x9.21': { label: '6.14" × 9.21" (156 × 234 mm)', width: 156, height: 234 },
  '6.69x9.61': { label: '6.69" × 9.61" (170 × 244 mm)', width: 170, height: 244 },
  '7x10': { label: '7" × 10" (177.8 × 254 mm)', width: 177.8, height: 254 },
  '7.5x9.25': { label: '7.5" × 9.25" (190.5 × 235 mm)', width: 190.5, height: 235 },
  '8x10': { label: '8" × 10" (203.2 × 254 mm)', width: 203.2, height: 254 },
  '8.5x11': { label: '8.5" × 11" (215.9 × 279.4 mm)', width: 215.9, height: 279.4 },
  'a5': { label: 'A5 (148 × 210 mm)', width: 148, height: 210 },
  'a4': { label: 'A4 (210 × 297 mm)', width: 210, height: 297 },
  '15x15': { label: '15 × 15 cm — Children (150 × 150 mm)', width: 150, height: 150 },
  '20x20': { label: '20 × 20 cm — Children (200 × 200 mm)', width: 200, height: 200 },
  '21x21': { label: '21 × 21 cm — Children (210 × 210 mm)', width: 210, height: 210 },
  'custom': { label: 'Custom size…', width: 152.4, height: 228.6 },
};

// Per-page thickness factor (single leaf, mm).
export const PAPER_CONFIG = {
  'cream_78': { label: 'Cream Paper 78 GSM', factor: 0.0635 },
  'white_80': { label: 'White Paper 80 GSM Bond', factor: 0.0572 },
  'white_90': { label: 'White Paper 90 GSM', factor: 0.0635 },
  'white_120': { label: 'White Paper 120 GSM', factor: 0.0813 },
  'custom': { label: 'Custom paper thickness…', factor: 0.06 },
};

export const BINDING_TYPES = {
  'perfect': { label: 'Perfect Bound', minPages: 24, maxPages: 800, pageMultiple: 2 },
  'saddle': { label: 'Saddle Stitch', minPages: 8, maxPages: 48, pageMultiple: 4 },
  'case': { label: 'Case Bound (Hardcover)', minPages: 24, maxPages: 800, pageMultiple: 2 },
};

export const COVER_TYPES = {
  'paperback': { label: 'Paperback' },
  'hardcover': { label: 'Hardcover' },
  'dustjacket': { label: 'Dust Jacket' },
};

// Which bindings are valid for each cover finish.
export const COVER_BINDING_MATRIX = {
  'paperback': ['perfect', 'saddle'],
  'hardcover': ['case'],
  'dustjacket': ['case'],
};

// Core calculation — returns a flat specs object consumed by the table, wireframe and PDF.
export function calculateSpecs({
  bookSize, pageCount, paperType, bindingType, coverType,
  bleed, safeMargin, customBleed, customWidth, customHeight, customSpineFactor,
  manualSpine, customFlapWidth, wrap, hinge, readingDirection,
}) {
  const size = BOOK_SIZES[bookSize] || BOOK_SIZES['6x9'];
  const paper = PAPER_CONFIG[paperType] || PAPER_CONFIG['cream_78'];

  const trimW = bookSize === 'custom' ? Number(customWidth) : size.width;
  const trimH = bookSize === 'custom' ? Number(customHeight) : size.height;

  const factor = paperType === 'custom' && customSpineFactor ? Number(customSpineFactor) : paper.factor;
  const effectiveBleed = customBleed != null ? Number(customBleed) : Number(bleed);
  const margin = Number(safeMargin);

  const isHardcover = coverType === 'hardcover' || coverType === 'dustjacket';
  const wrapMm = isHardcover ? Number(wrap ?? DEFAULT_SETTINGS.wrap) : 0;
  const hingeMm = coverType === 'hardcover' ? Number(hinge ?? DEFAULT_SETTINGS.hinge) : 0;
  const flapW = coverType === 'dustjacket' ? Number(customFlapWidth ?? DEFAULT_SETTINGS.defaultFlapWidth) : 0;

  let spine = manualSpine != null ? Number(manualSpine) : pageCount * factor;
  if (isHardcover) spine += 6; // board thickness allowance

  const fullWidth = trimW * 2 + spine + wrapMm * 2 + hingeMm * 2 + flapW * 2 + effectiveBleed * 2;
  const fullHeight = trimH + wrapMm * 2 + effectiveBleed * 2;

  const safeW = Math.max(0, trimW - margin * 2);
  const safeH = Math.max(0, trimH - margin * 2);
  const spineSafe = Math.max(0, spine - DEFAULT_SETTINGS.spineMargin * 2);

  const barcodeW = Math.min(safeW, trimW * DEFAULT_SETTINGS.barcodeWidthFactor);
  const barcodeH = Math.max(0, trimH - margin * 2 - 12.7);

  return {
    coverType, bookSize, bindingType, paperType, pageCount,
    paperThicknessFactor: factor,
    trimW, trimH, spine, bleed: effectiveBleed, safeMargin: margin,
    // Aliases consumed by DimensionsTable / CoverWireframe (which expect *Width/*Height keys):
    trimWidth: trimW, trimHeight: trimH, spineWidth: spine, frontCoverWidth: trimW,
    fullWidth, fullHeight, safeW, safeH, spineSafe,
    hardcoverSafe: 16,
    wrap: wrapMm, hinge: hingeMm, flapWidth: flapW, readingDirection,
    barcodeW, barcodeH,
    warnThinSpine: spine < 3.2,
    rows: [
      { n: 1, key: 'full', label: 'Full Cover', width: fullWidth, height: fullHeight },
      { n: 2, key: 'front', label: 'Front Cover', width: trimW, height: trimH },
      { n: 3, key: 'safe', label: 'Safe Area', width: safeW, height: safeH },
      { n: 4, key: 'bleed', label: 'Bleed', width: effectiveBleed, height: effectiveBleed },
      { n: 5, key: 'margin', label: 'Margin', width: margin, height: margin },
      { n: 6, key: 'spine', label: 'Spine', width: spine, height: trimH },
      { n: 7, key: 'spineSafe', label: 'Spine Safe Area', width: spineSafe, height: safeH },
      { n: 8, key: 'spineMargin', label: 'Spine Margin', width: DEFAULT_SETTINGS.spineMargin, height: DEFAULT_SETTINGS.spineMargin },
      { n: 9, key: 'barcode', label: 'Barcode Margin', width: barcodeW, height: barcodeH },
      ...(flapW > 0 ? [{ n: 10, key: 'flap', label: 'Flap', width: flapW, height: trimH }] : []),
      ...(wrapMm > 0 ? [{ n: 11, key: 'wrap', label: 'Wrap / Turn-in', width: wrapMm, height: wrapMm }] : []),
    ],
  };
}