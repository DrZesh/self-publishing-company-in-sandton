// Builds a persistable CoverSpec record from calculator form data and saves it.
import { platform } from '@/api/platformClient';
import { calculateSpecs } from '@/lib/calculatorConfig';
import { buildLayout } from '@/lib/coverLayout';

const SPEC_VERSION = 'v1';

function randomSpecId() {
  const chars = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
  let s = '';
  for (let i = 0; i < 6; i++) s += chars[Math.floor(Math.random() * chars.length)];
  return `CS-${s}`;
}

// Lightweight deterministic checksum of the key geometry fields.
function checksumOf(spec) {
  const key = [
    spec.coverType, spec.bookSize, spec.bindingType, spec.paperType, spec.pageCount,
    spec.trimWidth, spec.trimHeight, spec.spineWidth, spec.bleed, spec.safeMargin,
    spec.fullCoverWidth, spec.fullCoverHeight,
  ].join('|');
  let h = 0;
  for (let i = 0; i < key.length; i++) { h = (h << 5) - h + key.charCodeAt(i); h |= 0; }
  return (h >>> 0).toString(16).padStart(8, '0');
}

// Turns form data into { specs, coverSpec } — specs = full compute result, coverSpec = entity payload.
export function buildCoverSpec(formData) {
  const specs = calculateSpecs({
    bookSize: formData.bookSize, pageCount: formData.pageCount, paperType: formData.paperType,
    bindingType: formData.bindingType, coverType: formData.coverType, bleed: formData.bleed,
    safeMargin: formData.safeMargin, customBleed: formData.customBleed, customWidth: formData.customWidth,
    customHeight: formData.customHeight,
    customSpineFactor: formData.paperType === 'custom' ? formData.customSpineFactor : null,
    manualSpine: formData.useManualSpine ? formData.manualSpine : null,
    customFlapWidth: formData.customFlapWidth, wrap: formData.wrap, hinge: formData.hinge,
    readingDirection: formData.readingDirection,
  });

  const layout = buildLayout(specs);

  const round = (n) => Math.round((Number(n) || 0) * 100) / 100;

  const coverSpec = {
    specId: randomSpecId(),
    version: SPEC_VERSION,
    coverType: specs.coverType,
    bookSize: specs.bookSize,
    bindingType: specs.bindingType,
    paperType: specs.paperType,
    pageCount: Number(specs.pageCount),
    paperThicknessFactor: specs.paperThicknessFactor,
    trimWidth: round(specs.trimW),
    trimHeight: round(specs.trimH),
    spineWidth: round(specs.spine),
    bleed: round(specs.bleed),
    safeMargin: round(specs.safeMargin),
    fullCoverWidth: round(specs.fullWidth),
    fullCoverHeight: round(specs.fullHeight),
    flapWidth: round(specs.flapWidth),
    wrap: round(specs.wrap),
    hinge: round(specs.hinge),
    readingDirection: specs.readingDirection,
    panelsJson: JSON.stringify(layout?.panels || []),
    foldLinesJson: JSON.stringify(layout?.foldLines || []),
    safeZonesJson: JSON.stringify(layout?.safeZones || []),
    barcodeBoxJson: JSON.stringify(layout?.barcodeBox || {}),
  };
  coverSpec.checksum = checksumOf(coverSpec);

  return { specs, layout, coverSpec };
}

// Persists a CoverSpec record and returns the saved entity (with id).
export async function saveCoverSpec(coverSpec) {
  return platform.entities.CoverSpec.create(coverSpec);
}