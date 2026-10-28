import React from 'react';
import { fmt, unitLabel } from '@/lib/coverTemplate';

export default function CoverDimensionsTable({ dims, unit }) {
  if (!dims) return null;
  const u = unitLabel(unit);
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-gray-500 border-b border-gray-200">
            <th className="text-left font-medium py-2 pr-3 w-8">#</th>
            <th className="text-left font-medium py-2 pr-3">Description</th>
            <th className="text-right font-medium py-2 pr-3">Width ({u})</th>
            <th className="text-right font-medium py-2">Height ({u})</th>
          </tr>
        </thead>
        <tbody>
          {dims.rows.map((r) => (
            <tr key={r.key} className="border-b border-gray-100 last:border-0">
              <td className="py-2 pr-3 text-gray-400">{r.n}</td>
              <td className="py-2 pr-3 text-gray-800">{r.label}</td>
              <td className="py-2 pr-3 text-right font-mono text-gray-900">{fmt(r.width, unit)}</td>
              <td className="py-2 text-right font-mono text-gray-900">{fmt(r.height, unit)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}