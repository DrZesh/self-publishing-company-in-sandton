import { formatDimension } from "@/lib/unitConversion";

export default function DimensionsTable({ specs, unit = 'mm' }) {
  if (!specs) return null;
  const fmt = (v) => formatDimension(v, unit);
  const u = unit === 'in' ? '"' : unit;
  const barcodeMarginX = specs.trimWidth - specs.safeMargin - 50.8;
  const barcodeMarginY = specs.trimHeight - specs.safeMargin - 30.48;

  const rows = [
    { num: 1, desc: 'Full Cover', w: fmt(specs.fullWidth), h: fmt(specs.fullHeight) },
    { num: 2, desc: 'Front Cover', w: fmt(specs.frontCoverWidth), h: fmt(specs.trimHeight) },
    { num: 3, desc: 'Safe Area', w: fmt(Math.max(specs.trimWidth - 2 * specs.safeMargin, 0)), h: fmt(Math.max(specs.trimHeight - 2 * specs.safeMargin, 0)) },
    { num: 4, desc: 'Bleed', w: fmt(specs.bleed), h: fmt(specs.bleed) },
    { num: 5, desc: 'Margin', w: fmt(specs.safeMargin), h: fmt(specs.safeMargin) },
    { num: 6, desc: 'Spine', w: fmt(specs.spineWidth), h: fmt(specs.trimHeight) },
    { num: 7, desc: 'Spine Safe Area', w: specs.spineWidth > 3.2 ? fmt(specs.spineWidth - 3.2) : '—', h: specs.spineWidth > 3.2 ? fmt(specs.trimHeight - 2 * specs.safeMargin) : '—' },
    { num: 8, desc: 'Spine Margin', w: specs.spineWidth > 1.6 ? '1.6' : '—', h: specs.spineWidth > 1.6 ? '1.6' : '—' },
    { num: 9, desc: 'Barcode Margin', w: barcodeMarginX > 0 ? fmt(barcodeMarginX) : '—', h: barcodeMarginY > 0 ? fmt(barcodeMarginY) : '—' },
  ];

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="border-b border-gray-200">
            <th className="text-left py-2 px-2 font-semibold text-gray-700 text-xs w-8">#</th>
            <th className="text-left py-2 px-2 font-semibold text-gray-700 text-xs">Description</th>
            <th className="text-right py-2 px-2 font-semibold text-gray-700 text-xs">Width ({u})</th>
            <th className="text-right py-2 px-2 font-semibold text-gray-700 text-xs">Height ({u})</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.num} className="border-b border-gray-100 hover:bg-gray-50/50">
              <td className="py-1.5 px-2 text-gray-400 text-xs font-mono">{row.num}</td>
              <td className="py-1.5 px-2 text-gray-700 text-xs">{row.desc}</td>
              <td className="py-1.5 px-2 text-right text-gray-900 text-xs font-mono">{row.w}</td>
              <td className="py-1.5 px-2 text-right text-gray-900 text-xs font-mono">{row.h}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}