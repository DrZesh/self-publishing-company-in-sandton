// Millimetre-based unit conversion helpers shared across the calculator.

const MM_PER_INCH = 25.4;

export function convert(mm, unit) {
  const v = Number(mm) || 0;
  if (unit === 'cm') return v / 10;
  if (unit === 'inches' || unit === 'in') return v / MM_PER_INCH;
  return v;
}

export function unitLabel(unit) {
  return unit === 'inches' || unit === 'in' ? 'in' : unit;
}

export function fmt(mm, unit) {
  const v = convert(mm, unit);
  return (unit === 'inches' || unit === 'in') ? v.toFixed(3) : v.toFixed(2);
}

export function fmtWithUnit(mm, unit) {
  return `${fmt(mm, unit)} ${unitLabel(unit)}`;
}

// Unit toggle options used by UnitToggle.
export const UNIT_OPTIONS = [
  { value: 'mm', label: 'mm' },
  { value: 'cm', label: 'cm' },
  { value: 'in', label: 'in' },
];

// Formats a millimetre value into the target unit's number (no unit suffix).
export function formatDimension(mm, unit) {
  return fmt(mm, unit);
}