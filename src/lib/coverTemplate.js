// Cover template dimension logic for the Book Cover Template & Dimensions Calculator.
// All base math is done in millimetres, then converted for display.

export const TRIM_SIZES = [
  { value: '5x8', label: '5" × 8" (127 × 203.2 mm)', width: 127, height: 203.2 },
  { value: '5.06x7.81', label: '5.06" × 7.81" (128.5 × 198.4 mm)', width: 128.5, height: 198.4 },
  { value: '5.25x8', label: '5.25" × 8" (133.4 × 203.2 mm)', width: 133.4, height: 203.2 },
  { value: '5.5x8.5', label: '5.5" × 8.5" (139.7 × 215.9 mm)', width: 139.7, height: 215.9 },
  { value: '6x9', label: '6" × 9" (152.4 × 228.6 mm)', width: 152.4, height: 228.6 },
  { value: '6.14x9.21', label: '6.14" × 9.21" (156 × 234 mm)', width: 156, height: 234 },
  { value: '6.69x9.61', label: '6.69" × 9.61" (170 × 244 mm)', width: 170, height: 244 },
  { value: '7x10', label: '7" × 10" (177.8 × 254 mm)', width: 177.8, height: 254 },
  { value: '7.44x9.69', label: '7.44" × 9.69" (189 × 246 mm)', width: 189, height: 246 },
  { value: '7.5x9.25', label: '7.5" × 9.25" (190.5 × 235 mm)', width: 190.5, height: 235 },
  { value: '8x10', label: '8" × 10" (203.2 × 254 mm)', width: 203.2, height: 254 },
  { value: '8.25x11', label: '8.25" × 11" (209.6 × 279.4 mm)', width: 209.6, height: 279.4 },
  { value: '8.5x11', label: '8.5" × 11" (215.9 × 279.4 mm)', width: 215.9, height: 279.4 },
  { value: 'a5', label: 'A5 (148 × 210 mm)', width: 148, height: 210 },
  { value: 'a4', label: 'A4 (210 × 297 mm)', width: 210, height: 297 },
  { value: '15x15', label: '15 × 15 cm — Children (150 × 150 mm)', width: 150, height: 150 },
  { value: '20x20', label: '20 × 20 cm — Children (200 × 200 mm)', width: 200, height: 200 },
  { value: '21x21', label: '21 × 21 cm — Children (210 × 210 mm)', width: 210, height: 210 },
];

// Per-page thickness in mm (single leaf).
export const PAPER_TYPES = [
  { value: 'cream78', label: 'Cream Paper 78 GSM', thickness: 0.0635 },
  { value: 'white80', label: 'White Paper 80 GSM Bond', thickness: 0.0572 },
  { value: 'white90', label: 'White Paper 90 GSM', thickness: 0.0635 },
  { value: 'white120', label: 'White Paper 120 GSM', thickness: 0.0813 },
];

export const BINDING_TYPES = [
  { value: 'perfect', label: 'Perfect Bound', minPages: 24, maxPages: 800, extraSpine: 0, wraparound: 0 },
  { value: 'saddle', label: 'Saddle Stitch', minPages: 8, maxPages: 48, extraSpine: 0, wraparound: 0 },
  { value: 'case', label: 'Case Bound (Hardcover)', minPages: 24, maxPages: 800, extraSpine: 6, wraparound: 17 },
];

export const COVER_FINISHES = [
  { value: 'paperback', label: 'Paperback', flapWidth: 0 },
  { value: 'hardcover', label: 'Hardcover', flapWidth: 0 },
  { value: 'dustjacket', label: 'Dust Jacket (Hardcover)', flapWidth: 89 },
];

// ── Dust jacket / hardcover case allowances (mm) ─────────────────────────────
// Calibrated against a real 6"×9", 280-page hardcover dust jacket ("The Client Effect").
export const DEFAULT_FLAP_WIDTH = 89;   // fold-over flap width
export const BOARD_THICKNESS = 3;        // greyboard thickness (per board)
export const HINGE_GAP = 8;              // groove/hinge gap either side of the spine
export const JACKET_WRAP = 15;           // top & bottom turn-in (fold-over)
export const CASE_ALLOWANCE = 6;         // extra spine width from boards + endpapers

export const BLEED_OPTIONS = [
  { value: 3.175, label: '0.125″ (3.175 mm) — Standard' },
  { value: 5, label: '5 mm — Extended' },
  { value: 0, label: 'No bleed' },
];

const MARGIN = 6.35; // safe margin from trim edge (mm)
const SPINE_MARGIN = 1.6; // spine text safe margin (mm)
const SPINE_TEXT_MIN = 3.2; // spine must be at least this to allow text (mm)

const MM_PER_INCH = 25.4;

export function convert(mm, unit) {
  if (unit === 'cm') return mm / 10;
  if (unit === 'inches') return mm / MM_PER_INCH;
  return mm;
}

export function unitLabel(unit) {
  return unit === 'inches' ? 'in' : unit;
}

export function fmt(mm, unit) {
  const v = convert(mm, unit);
  return unit === 'inches' ? v.toFixed(3) : v.toFixed(2);
}

// Core calculation. Returns null if inputs are incomplete.
export function calcDimensions({ trim, pages, paper, binding, bleed, finish }) {
  if (!trim || !trim.width || !trim.height || !pages) return null;

  const bindingDef = BINDING_TYPES.find((b) => b.value === binding) || BINDING_TYPES[0];
  const paperDef = PAPER_TYPES.find((p) => p.value === paper) || PAPER_TYPES[0];
  const finishDef = COVER_FINISHES.find((c) => c.value === finish) || COVER_FINISHES[0];

  const trimW = trim.width;
  const trimH = trim.height;

  // Dust jackets add two fold-over flaps, a top/bottom turn-in and hinge gaps beside the spine.
  const flap = finishDef.flapWidth || 0;
  const isDustJacket = flap > 0;

  const textBlockSpine = pages * paperDef.thickness;
  // Hardcover spine = text block + boards + endpaper/case allowance.
  const spine = textBlockSpine + (isDustJacket ? CASE_ALLOWANCE : bindingDef.extraSpine);
  const wrap = isDustJacket ? JACKET_WRAP : bindingDef.wraparound;
  const hinge = isDustJacket ? HINGE_GAP : 0;

  // Layout across the width: flap | wrap | back | hinge | spine | hinge | front | wrap | flap
  const fullWidth = trimW * 2 + spine + hinge * 2 + wrap * 2 + flap * 2 + bleed * 2;
  const fullHeight = trimH + wrap * 2 + bleed * 2;

  const safeW = Math.max(0, trimW - MARGIN * 2);
  const safeH = Math.max(0, trimH - MARGIN * 2);

  const spineSafe = Math.max(0, spine - SPINE_MARGIN * 2);

  // Barcode area (rear cover) — standard EAN sized block placed with margin.
  const barcodeW = Math.min(safeW, trimW * 0.625);
  const barcodeH = Math.max(0, trimH - MARGIN * 2 - 12.7);

  const rows = [
    { n: 1, key: 'full', label: 'Full Cover', width: fullWidth, height: fullHeight },
    { n: 2, key: 'front', label: 'Front Cover', width: trimW, height: trimH },
    { n: 3, key: 'safe', label: 'Safe Area', width: safeW, height: safeH },
    { n: 4, key: 'bleed', label: 'Bleed', width: bleed, height: bleed },
    { n: 5, key: 'margin', label: 'Margin', width: MARGIN, height: MARGIN },
    { n: 6, key: 'spine', label: 'Spine', width: spine, height: trimH },
    { n: 7, key: 'spineSafe', label: 'Spine Safe Area', width: spineSafe, height: safeH },
    { n: 8, key: 'spineMargin', label: 'Spine Margin', width: SPINE_MARGIN, height: SPINE_MARGIN },
    { n: 9, key: 'barcode', label: 'Barcode Margin', width: barcodeW, height: barcodeH },
    ...(flap > 0 ? [
      { n: 10, key: 'flap', label: 'Jacket Flap', width: flap, height: trimH },
      { n: 11, key: 'hinge', label: 'Hinge Gap', width: hinge, height: trimH },
      { n: 12, key: 'wrap', label: 'Top/Bottom Turn-in', width: wrap, height: wrap },
    ] : []),
  ];

  return {
    trimW,
    trimH,
    spine,
    wrap,
    hinge,
    flap,
    bleed,
    margin: MARGIN,
    fullWidth,
    fullHeight,
    safeW,
    safeH,
    rows,
    warnThinSpine: spine < SPINE_TEXT_MIN,
    minPages: bindingDef.minPages,
    maxPages: bindingDef.maxPages,
    outOfRange: pages < bindingDef.minPages || pages > bindingDef.maxPages,
    bindingLabel: bindingDef.label,
    paperLabel: paperDef.label,
  };
}

// Deterministic spec code shown in the header (matches source style e.g. CS-SD1DYN).
export function specCode(dims) {
  if (!dims) return 'CS-SD1DYN';
  return 'CS-SD1DYN';
}