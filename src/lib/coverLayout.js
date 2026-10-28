// Derives panel geometry, fold lines, safe zones and barcode box from computed specs.
// All coordinates are in millimetres, origin at the top-left of the full cover (incl. bleed).

export function buildLayout(specs) {
  if (!specs) return null;
  const { trimW, trimH, spine, bleed, safeMargin, wrap, hinge, flapWidth, fullWidth, fullHeight, readingDirection } = specs;

  const top = bleed + wrap;
  let x = bleed;

  const panels = [];
  const foldLines = [];

  // Left flap (dust jacket)
  if (flapWidth > 0) {
    panels.push({ key: 'flapBack', label: 'Back Flap', x, y: top, width: flapWidth, height: trimH });
    x += flapWidth;
    foldLines.push({ x, from: top, to: top + trimH, kind: 'fold' });
  }

  x += wrap;

  // Back cover
  const backX = x;
  panels.push({ key: 'back', label: 'Back Cover', x: backX, y: top, width: trimW, height: trimH });
  x += trimW;

  // Hinge before spine (hardcover)
  if (hinge > 0) { foldLines.push({ x, from: top, to: top + trimH, kind: 'hinge' }); x += hinge; }

  // Spine
  const spineX = x;
  foldLines.push({ x: spineX, from: top, to: top + trimH, kind: 'fold' });
  panels.push({ key: 'spine', label: 'Spine', x: spineX, y: top, width: spine, height: trimH });
  x += spine;
  foldLines.push({ x, from: top, to: top + trimH, kind: 'fold' });

  // Hinge after spine (hardcover)
  if (hinge > 0) { foldLines.push({ x, from: top, to: top + trimH, kind: 'hinge' }); x += hinge; }

  // Front cover
  const frontX = x;
  panels.push({ key: 'front', label: 'Front Cover', x: frontX, y: top, width: trimW, height: trimH });
  x += trimW;

  x += wrap;

  // Right flap (dust jacket)
  if (flapWidth > 0) {
    foldLines.push({ x, from: top, to: top + trimH, kind: 'fold' });
    panels.push({ key: 'flapFront', label: 'Front Flap', x, y: top, width: flapWidth, height: trimH });
  }

  const safeZones = [
    { key: 'backSafe', x: backX + safeMargin, y: top + safeMargin, width: Math.max(0, trimW - safeMargin * 2), height: Math.max(0, trimH - safeMargin * 2) },
    { key: 'frontSafe', x: frontX + safeMargin, y: top + safeMargin, width: Math.max(0, trimW - safeMargin * 2), height: Math.max(0, trimH - safeMargin * 2) },
  ];

  // Barcode box on the back cover (opposite the reading direction so it never clashes with the fold)
  const barcodeW = specs.barcodeW || Math.min(trimW - safeMargin * 2, trimW * 0.625);
  const barcodeH = 26; // mm — standard EAN block height incl. text
  const barcodeBox = {
    x: readingDirection === 'rtl' ? frontX + safeMargin : backX + safeMargin,
    y: top + trimH - safeMargin - barcodeH,
    width: barcodeW,
    height: barcodeH,
  };

  return { panels, foldLines, safeZones, barcodeBox, top, spineX, frontX, backX, fullWidth, fullHeight };
}

// Wireframe-oriented layout. Returns geometry keyed for CoverWireframe:
// { fullW, fullH, panels[{role,x,y,w,h}], foldLines[{x}], safeRects[{x,y,w,h}], barcode }.
export function computeLayout({
  coverType, binding, trimW, trimH, spine, bleed, wrap = 0, hinge = 0, flap = 0,
  safe, hardcoverSafe = 16, rtl = false, barcodeW = 50.8, barcodeH = 30.48,
  showBarcode = true, showSafe = true,
}) {
  const top = bleed + wrap;
  const fullH = trimH + wrap * 2 + bleed * 2;

  // Build the horizontal panel sequence (back → spine → front), with flaps/wrap/hinge.
  const seq = [];
  if (flap > 0) seq.push({ role: 'flap', w: flap });
  if (wrap > 0) seq.push({ role: 'wrap', w: wrap });
  seq.push({ role: 'backCover', w: trimW });
  if (hinge > 0) seq.push({ role: 'hinge', w: hinge });
  seq.push({ role: 'spine', w: spine });
  if (hinge > 0) seq.push({ role: 'hinge', w: hinge });
  seq.push({ role: 'frontCover', w: trimW });
  if (wrap > 0) seq.push({ role: 'wrap', w: wrap });
  if (flap > 0) seq.push({ role: 'flap', w: flap });

  const innerW = seq.reduce((a, p) => a + p.w, 0);
  const fullW = innerW + bleed * 2;

  const panels = [];
  const foldLines = [];
  let x = bleed;
  seq.forEach((p) => {
    panels.push({ role: p.role, x, y: top, w: p.w, h: trimH });
    if (p.role === 'spine' || p.role === 'hinge' || p.role === 'wrap' || p.role === 'flap') {
      foldLines.push({ x });
      foldLines.push({ x: x + p.w });
    }
    x += p.w;
  });

  const isHard = coverType === 'hardcover' || coverType === 'dustjacket';
  const usableSafe = isHard ? hardcoverSafe : safe;

  const safeRects = showSafe
    ? panels
        .filter((p) => p.role === 'frontCover' || p.role === 'backCover')
        .map((p) => ({
          x: p.x + usableSafe, y: p.y + usableSafe,
          w: Math.max(0, p.w - usableSafe * 2), h: Math.max(0, p.h - usableSafe * 2),
        }))
    : [];

  let barcode = null;
  if (showBarcode) {
    const target = panels.find((p) => p.role === (rtl ? 'frontCover' : 'backCover'));
    if (target) {
      barcode = {
        x: target.x + usableSafe,
        y: target.y + target.h - usableSafe - barcodeH,
        w: Math.min(barcodeW, target.w - usableSafe * 2),
        h: barcodeH,
      };
    }
  }

  return { fullW, fullH, panels, foldLines, safeRects, barcode };
}