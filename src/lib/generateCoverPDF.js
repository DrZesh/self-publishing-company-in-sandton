// Generates a print-ready, KDP-style cover template PDF at the exact full-cover dimensions.
import { jsPDF } from 'jspdf';
import { buildLayout } from '@/lib/coverLayout';
import { PAPER_CONFIG, BINDING_TYPES, COVER_TYPES } from '@/lib/calculatorConfig';

const MM_PER_IN = 25.4;
const mmToIn = (mm) => Number(mm) / MM_PER_IN;
const inStr = (mm, d = 3) => `${mmToIn(mm).toFixed(d)}"`;
const mmStr = (mm, d = 2) => `${Number(mm).toFixed(d)}mm`;

// Paper "colour" descriptor derived from the paper key.
function paperDescriptor(paperType) {
  const label = PAPER_CONFIG[paperType]?.label || 'White Paper';
  const isCream = /cream/i.test(label);
  return {
    colorLine: isCream ? 'Standard Color' : 'Premium Color',
    paperLine: isCream ? 'Cream Paper' : 'White Paper',
  };
}

export async function generateCoverPDFFromSpecs(specs, specId, checksum) {
  const fullWidth = Number(specs.fullWidth);
  const fullHeight = Number(specs.fullHeight);
  if (!fullWidth || !fullHeight) throw new Error('Invalid cover dimensions');

  const doc = new jsPDF({
    unit: 'mm',
    format: [fullWidth, fullHeight],
    orientation: fullWidth >= fullHeight ? 'landscape' : 'portrait',
  });

  const layout = buildLayout(specs);
  const trimW = Number(specs.trimW);
  const trimH = Number(specs.trimH);
  const spine = Number(specs.spine);
  const bleed = Number(specs.bleed);
  const paper = paperDescriptor(specs.paperType);
  const coverLabel = COVER_TYPES[specs.coverType]?.label || 'Paperback';
  const bindingLabel = BINDING_TYPES[specs.bindingType]?.label || '';
  const directionLabel = specs.readingDirection === 'rtl' ? 'Right to Left' : 'Left to Right';

  const backPanel = layout.panels.find((p) => p.key === 'back');
  const frontPanel = layout.panels.find((p) => p.key === 'front');
  const spinePanel = layout.panels.find((p) => p.key === 'spine');

  // ── Red / pink bleed area (full page) ─────────────────────────────
  doc.setFillColor(247, 179, 179);
  doc.rect(0, 0, fullWidth, fullHeight, 'F');

  // ── White live area (inside the bleed) ────────────────────────────
  doc.setFillColor(255, 255, 255);
  doc.rect(bleed, bleed, fullWidth - bleed * 2, fullHeight - bleed * 2, 'F');

  // ── Trim outline (solid black) around back+spine+front block ──────
  doc.setDrawColor(0, 0, 0);
  doc.setLineWidth(0.4);
  if (backPanel && frontPanel) {
    doc.rect(backPanel.x, backPanel.y, (frontPanel.x + frontPanel.width) - backPanel.x, backPanel.height);
  }

  // ── Spine fold lines (blue dashed) ────────────────────────────────
  doc.setDrawColor(37, 99, 235);
  doc.setLineWidth(0.35);
  doc.setLineDashPattern([3, 2], 0);
  layout.foldLines.forEach((f) => doc.line(f.x, f.from, f.x, f.to));
  doc.setLineDashPattern([], 0);

  // ── Red trim edge outline of whole page (dashed) ──────────────────
  doc.setDrawColor(220, 38, 38);
  doc.setLineWidth(0.3);
  doc.setLineDashPattern([2, 2], 0);
  doc.rect(bleed, bleed, fullWidth - bleed * 2, fullHeight - bleed * 2);
  doc.setLineDashPattern([], 0);

  // ══════════════════ FRONT COVER — spec title block ══════════════════
  if (frontPanel) {
    const cx = frontPanel.x + frontPanel.width / 2;
    let y = frontPanel.y + trimH * 0.18;
    doc.setTextColor(0, 0, 0);

    const line = (text, { bold = false, size = 13, gap = 6 } = {}) => {
      doc.setFont('helvetica', bold ? 'bold' : 'normal');
      doc.setFontSize(size);
      doc.text(text, cx, y, { align: 'center' });
      y += gap;
    };
    const block = (gap = 10) => { y += gap; };

    line(`${coverLabel} Book`, { bold: true, size: 15, gap: 6.5 });
    line(`Cover Template - ${directionLabel}`, { size: 13, gap: 6 });
    block(11);
    line(`${inStr(trimW, 2)} x ${inStr(trimH, 2)} Book`, { bold: true, size: 14, gap: 6.5 });
    line(`(${mmStr(trimW)} x ${mmStr(trimH)})`, { size: 13, gap: 6 });
    block(11);
    line(`${inStr(fullWidth)} x ${inStr(fullHeight)} Overall Dimensions`, { size: 13, gap: 6 });
    line(`(${mmStr(fullWidth)} x ${mmStr(fullHeight)})`, { size: 13, gap: 6 });
    block(11);
    line(`${inStr(spine)} Spine Width`, { size: 13, gap: 6 });
    line(`(${mmStr(spine)})`, { size: 13, gap: 6 });
    block(11);
    line(paper.colorLine, { size: 13, gap: 6 });
    line(`${specs.pageCount} Pages`, { size: 13, gap: 6 });
    line(paper.paperLine, { size: 13, gap: 6 });
  }

  // ══════════════════ BACK COVER — legend ══════════════════
  if (backPanel) {
    const lx = backPanel.x + Number(specs.safeMargin);
    let y = backPanel.y + trimH * 0.08;
    const legend = [
      ['Black Solid Line = Trim Size', 'This is where your book will be cut to produce the final trim size.'],
      ['Blue Dashed Line = Spine Fold', 'Fold placement may vary slightly.'],
      ['White Area = Live Area', 'Position logos, text, and essential images in this area.'],
      ['Red Area = Out of Live/Bleed', 'Your background artwork must fill the red area. Do not place logos, text, or essential images in the red area. If your artwork does not meet these requirements, it may be rejected.'],
      ['REMOVE THIS TEMPLATE LAYER FROM FINAL ARTWORK.', 'Whatever is visible in your digital artwork will also be visible in your printed artwork.'],
    ];
    const maxW = trimW - Number(specs.safeMargin) * 2;
    doc.setTextColor(0, 0, 0);
    legend.forEach(([head, body]) => {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9.5);
      doc.text(head, lx, y);
      y += 4.5;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      const wrapped = doc.splitTextToSize(body, maxW);
      doc.text(wrapped, lx, y);
      y += wrapped.length * 3.6 + 6;
    });
  }

  // ══════════════════ Barcode box (yellow) ══════════════════
  const b = layout.barcodeBox;
  if (b && b.width > 0) {
    const bw = 50.8; // 2.000"
    const bh = 30.48; // 1.200"
    const bx = b.x;
    const by = b.y + b.height - bh;
    doc.setFillColor(255, 242, 0);
    doc.rect(bx, by, bw, bh, 'F');
    doc.setTextColor(0, 0, 0);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    const cx = bx + bw / 2;
    doc.text('Barcode', cx, by + 10, { align: 'center' });
    doc.text('Location & Size', cx, by + 15, { align: 'center' });
    doc.text('2.000" x 1.200"', cx, by + 20, { align: 'center' });
    doc.text('(50.80mm x 30.48mm)', cx, by + 25, { align: 'center' });
  }

  // ══════════════════ Corner labels ══════════════════
  doc.setTextColor(150, 150, 150);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  const cornerLabel = (panel, name) => {
    if (!panel) return;
    const x = panel.x + Number(specs.safeMargin);
    const y = panel.y + panel.height - Number(specs.safeMargin) - 8;
    doc.text([name, `${inStr(trimW, 2)} x ${inStr(trimH, 2)}`, `(${mmStr(trimW)} x ${mmStr(trimH)})`], x, y);
  };
  cornerLabel(backPanel, 'Back Cover');
  // Front cover corner label — right aligned
  if (frontPanel) {
    const x = frontPanel.x + frontPanel.width - Number(specs.safeMargin);
    const y = frontPanel.y + frontPanel.height - Number(specs.safeMargin) - 8;
    doc.text([
      'Front Cover',
      `${inStr(trimW, 2)} x ${inStr(trimH, 2)}`,
      `(${mmStr(trimW)} x ${mmStr(trimH)})`,
    ], x, y, { align: 'right' });
  }

  // ══════════════════ Rotated spine width label ══════════════════
  if (spinePanel && spine >= 3) {
    doc.setTextColor(120, 120, 120);
    doc.setFontSize(6.5);
    const sx = spinePanel.x + spinePanel.width / 2;
    const sy = spinePanel.y + spinePanel.height * 0.72;
    doc.text(`Spine Width ${inStr(spine)} (${mmStr(spine)})`, sx, sy, { align: 'center', angle: 90 });
  }

  return doc.output('blob');
}