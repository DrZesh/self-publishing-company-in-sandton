import React from 'react';
import { fmt, unitLabel } from '@/lib/coverTemplate';

// Renders a realistic, to-scale cover spread with measurement overlays and cut marks.
export default function CoverTemplateVisual({ dims, unit }) {
  if (!dims) return null;

  const { fullWidth, fullHeight, trimW, trimH, spine, bleed, margin, wrap, flap = 0, hinge = 0 } = dims;

  // Scale the whole spread into a fixed viewport width.
  const VIEW_W = 760;
  const scale = VIEW_W / fullWidth;
  const VIEW_H = fullHeight * scale;

  const s = (mm) => mm * scale;

  // Layout: [bleed][ flap ][ wrap ][ back trim ][ hinge ][ spine ][ hinge ][ front trim ][ wrap ][ flap ][bleed]
  const contentTop = s(bleed + wrap);
  const contentLeft = s(bleed + flap + wrap);
  const trimTop = contentTop;
  const backX = contentLeft;
  const spineX = backX + s(trimW) + s(hinge);
  const frontX = spineX + s(spine) + s(hinge);
  const trimHpx = s(trimH);
  const trimWpx = s(trimW);
  const spineWpx = s(spine);
  const flapWpx = s(flap);

  const cut = 10; // cut mark length px
  const navy = '#1e3a5f';
  const navyDark = '#182f4d';

  const CutMark = ({ x, y }) => (
    <g stroke="#0f0f0f" strokeWidth="1">
      <line x1={x - cut} y1={y} x2={x + cut} y2={y} />
      <line x1={x} y1={y - cut} x2={x} y2={y + cut} />
    </g>
  );

  const Marker = ({ x, y, n }) => (
    <g>
      <circle cx={x} cy={y} r="9" fill="#0f0f0f" />
      <text x={x} y={y + 3} textAnchor="middle" fontSize="10" fill="#fff" fontWeight="700">{n}</text>
    </g>
  );

  const dim = (mm) => `${fmt(mm, unit)} ${unitLabel(unit)}`;

  return (
    <div className="w-full overflow-x-auto">
      <svg
        viewBox={`-30 -34 ${VIEW_W + 60} ${VIEW_H + 74}`}
        className="w-full h-auto"
        style={{ maxWidth: '100%' }}
        role="img"
        aria-label="Cover template with measurement overlays"
      >
        {/* Bleed area (full bleed rectangle) */}
        <rect x={0} y={0} width={VIEW_W} height={VIEW_H} fill={navyDark} />

        {/* Back + Front covers */}
        <rect x={backX} y={trimTop} width={trimWpx} height={trimHpx} fill={navy} />
        <rect x={frontX} y={trimTop} width={trimWpx} height={trimHpx} fill={navy} />

        {/* Spine */}
        <rect x={spineX} y={trimTop} width={spineWpx} height={trimHpx} fill={navyDark} stroke="rgba(255,255,255,0.25)" strokeWidth="0.75" />

        {/* Dust jacket flaps + fold lines */}
        {flap > 0 && (
          <g>
            {/* Back (left) flap */}
            <rect x={backX - flapWpx} y={trimTop} width={flapWpx} height={trimHpx} fill={navyDark} opacity="0.85" />
            <line x1={backX} y1={trimTop} x2={backX} y2={trimTop + trimHpx} stroke="rgba(255,255,255,0.35)" strokeWidth="0.75" strokeDasharray="3 3" />
            {/* Front (right) flap */}
            <rect x={frontX + trimWpx} y={trimTop} width={flapWpx} height={trimHpx} fill={navyDark} opacity="0.85" />
            <line x1={frontX + trimWpx} y1={trimTop} x2={frontX + trimWpx} y2={trimTop + trimHpx} stroke="rgba(255,255,255,0.35)" strokeWidth="0.75" strokeDasharray="3 3" />
            <text x={backX - flapWpx / 2} y={trimTop + trimHpx / 2} textAnchor="middle" fill="rgba(255,255,255,0.6)" fontSize="7" transform={`rotate(-90 ${backX - flapWpx / 2} ${trimTop + trimHpx / 2})`}>BACK FLAP</text>
            <text x={frontX + trimWpx + flapWpx / 2} y={trimTop + trimHpx / 2} textAnchor="middle" fill="rgba(255,255,255,0.6)" fontSize="7" transform={`rotate(-90 ${frontX + trimWpx + flapWpx / 2} ${trimTop + trimHpx / 2})`}>FRONT FLAP</text>
          </g>
        )}

        {/* Safe area (front) dashed */}
        <rect
          x={frontX + s(margin)} y={trimTop + s(margin)}
          width={Math.max(0, trimWpx - s(margin) * 2)} height={Math.max(0, trimHpx - s(margin) * 2)}
          fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="1" strokeDasharray="5 4"
        />
        {/* Safe area (back) dashed */}
        <rect
          x={backX + s(margin)} y={trimTop + s(margin)}
          width={Math.max(0, trimWpx - s(margin) * 2)} height={Math.max(0, trimHpx - s(margin) * 2)}
          fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="1" strokeDasharray="5 4"
        />

        {/* Spine fold lines */}
        <line x1={spineX} y1={trimTop} x2={spineX} y2={trimTop + trimHpx} stroke="rgba(255,255,255,0.35)" strokeWidth="0.75" strokeDasharray="3 3" />
        <line x1={frontX} y1={trimTop} x2={frontX} y2={trimTop + trimHpx} stroke="rgba(255,255,255,0.35)" strokeWidth="0.75" strokeDasharray="3 3" />

        {/* Front cover placeholder text */}
        <text x={frontX + trimWpx / 2} y={trimTop + trimHpx * 0.42} textAnchor="middle" fill="#fff" fontSize="15" fontWeight="700" letterSpacing="1">YOUR TITLE HERE</text>
        <text x={frontX + trimWpx / 2} y={trimTop + trimHpx * 0.52} textAnchor="middle" fill="rgba(255,255,255,0.75)" fontSize="9">Author Name</text>

        {/* Spine vertical title */}
        {spineWpx > 10 && (
          <text
            x={spineX + spineWpx / 2} y={trimTop + trimHpx / 2}
            textAnchor="middle" fill="rgba(255,255,255,0.8)" fontSize="8" fontWeight="600"
            transform={`rotate(-90 ${spineX + spineWpx / 2} ${trimTop + trimHpx / 2})`}
          >TITLE</text>
        )}

        {/* Barcode block (back cover, bottom-left) */}
        <g>
          <rect x={backX + s(margin)} y={trimTop + trimHpx - s(margin) - 32} width={72} height={26} fill="#fff" rx="1" />
          {[...Array(22)].map((_, i) => (
            <rect key={i} x={backX + s(margin) + 5 + i * 2.7} y={trimTop + trimHpx - s(margin) - 29} width={i % 3 === 0 ? 1.6 : 0.9} height={16} fill="#0f0f0f" />
          ))}
          <text x={backX + s(margin) + 36} y={trimTop + trimHpx - s(margin) - 9} textAnchor="middle" fontSize="5" fill="#0f0f0f">ISBN 000-0-0000000-0-0</text>
        </g>

        {/* Cut marks at four corners of trim area */}
        <CutMark x={backX} y={trimTop} />
        <CutMark x={frontX + trimWpx} y={trimTop} />
        <CutMark x={backX} y={trimTop + trimHpx} />
        <CutMark x={frontX + trimWpx} y={trimTop + trimHpx} />

        {/* Numbered markers */}
        <Marker x={0} y={-4} n={4} />
        <Marker x={spineX + spineWpx / 2} y={-4} n={6} />
        <Marker x={spineX + spineWpx / 2} y={4} n={8} />
        <Marker x={frontX + trimWpx / 2} y={-4} n={2} />
        <Marker x={frontX + trimWpx / 2} y={trimTop + trimHpx / 2} n={3} />
        <Marker x={backX + s(margin)} y={trimTop + trimHpx - s(margin) - 19} n={9} />
        <Marker x={backX} y={trimTop + trimHpx + 4} n={5} />
        <Marker x={VIEW_W / 2} y={VIEW_H + 4} n={1} />
        <Marker x={spineX + spineWpx / 2} y={trimTop + trimHpx * 0.7} n={7} />

        {/* Top width dimension for full cover */}
        <text x={VIEW_W / 2} y={VIEW_H + 22} textAnchor="middle" fontSize="9" fill="#0f0f0f" fontWeight="600">{dim(fullWidth)}</text>
        {/* Spine width label */}
        <text x={spineX + spineWpx / 2} y={-20} textAnchor="middle" fontSize="8" fill="#0f0f0f">{dim(spine)}</text>
        {/* Front width label */}
        <text x={frontX + trimWpx / 2} y={-20} textAnchor="middle" fontSize="8" fill="#0f0f0f">{dim(trimW)}</text>
      </svg>
      <p className="text-[11px] text-gray-400 text-center mt-2">
        Image for reference only — covers are shown with realistic colour and measurement overlays
      </p>
    </div>
  );
}