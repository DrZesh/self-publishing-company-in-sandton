import React, { useMemo } from 'react';
import { computeLayout } from '@/lib/coverLayout';

const COVER_FRONT = '#1a365d';
const COVER_BACK  = '#2a4a6b';
const SPINE_COLOR = '#0f2440';
const BLEED_BG    = '#e2e8f0';
const SAFE_STROKE = 'rgba(255,255,255,0.35)';
const FOLD_STROKE = 'rgba(0,0,0,0.25)';
const MARKER_BG   = '#1a1a1a';
const TEXT_LIGHT  = '#94a3b8';
const TEXT_DARK   = '#475569';

function fmt(v, d) { return v.toFixed(d || 1); }

export default function CoverWireframe({ specs, mode, showBarcode }) {
  const L = useMemo(() => {
    if (!specs || specs.fullWidth <= 0) return null;
    return computeLayout({
      coverType: specs.coverType, binding: specs.bindingType, trimW: specs.trimWidth, trimH: specs.trimHeight,
      spine: specs.spineWidth, bleed: specs.bleed, wrap: specs.wrap || 0, hinge: specs.hinge || 0,
      flap: specs.flapWidth || 0, safe: specs.safeMargin, hardcoverSafe: specs.hardcoverSafe || 16,
      rtl: specs.readingDirection === "rtl", barcodeW: 50.8, barcodeH: 30.48,
      showBarcode: showBarcode !== false, showSafe: true, displayUnit: 'mm',
    });
  }, [specs, showBarcode]);

  if (!L) return null;

  const pad = 70;
  const vw = 860;
  const scale = (vw - pad * 2) / L.fullW;
  const vh = L.fullH * scale + pad * 2 + 50;

  const tx = (x) => pad + x * scale;
  const ty = (y) => pad + y * scale;
  const tw = (w) => w * scale;
  const th = (h) => h * scale;

  const frontPanel = L.panels.find((p) => p.role === 'frontCover') || L.panels.find((p) => p.role === 'panel');
  const backPanel = L.panels.find((p) => p.role === 'backCover');
  const spinePanel = L.panels.find((p) => p.role === 'spine');

  const getPanelFill = (role) => {
    if (role === 'spine') return SPINE_COLOR;
    if (role === 'frontCover') return COVER_FRONT;
    if (role === 'backCover') return COVER_BACK;
    if (role === 'flap') return '#334155';
    if (role === 'wrap') return '#1e293b';
    if (role === 'hinge') return '#1e293b';
    return '#1e293b';
  };

  const marks = [];
  marks.push({ n: 1, cx: tx(L.fullW / 2), cy: ty(L.fullH) + 26, lx: tx(L.fullW / 2), ly: ty(L.fullH) + 16, label: 'Full Cover' });
  if (frontPanel) {
    marks.push({ n: 2, cx: tx(frontPanel.x + frontPanel.w / 2), cy: ty(frontPanel.y) - 18, lx: tx(frontPanel.x + frontPanel.w / 2), ly: ty(frontPanel.y), label: 'Front Cover' });
  }
  if (frontPanel && L.safeRects.length) {
    const sf = L.safeRects.find((s) => { const cx = s.x + s.w / 2; return cx >= frontPanel.x && cx <= frontPanel.x + frontPanel.w; });
    if (sf) marks.push({ n: 3, cx: tx(sf.x + sf.w), cy: ty(sf.y + sf.h) + 16, lx: tx(sf.x + sf.w), ly: ty(sf.y + sf.h), label: 'Safe Area' });
  }
  marks.push({ n: 4, cx: tx(0) + tw(specs.bleed) + 6, cy: ty(0) - 14, lx: tx(0) + tw(specs.bleed), ly: ty(0), label: `Bleed ${fmt(specs.bleed)}mm` });
  if (frontPanel) marks.push({ n: 5, cx: tx(frontPanel.x + specs.safeMargin), cy: ty(frontPanel.y) - 16, lx: tx(frontPanel.x + specs.safeMargin), ly: ty(frontPanel.y), label: `Margin ${fmt(specs.safeMargin)}mm` });
  if (spinePanel && spinePanel.w > 1) marks.push({ n: 6, cx: tx(spinePanel.x + spinePanel.w / 2), cy: ty(spinePanel.y) - 14, lx: tx(spinePanel.x + spinePanel.w / 2), ly: ty(spinePanel.y), label: 'Spine' });
  if (spinePanel && spinePanel.w > 3.2) marks.push({ n: 7, cx: tx(spinePanel.x + spinePanel.w / 2), cy: ty(spinePanel.y + spinePanel.h) + 14, lx: tx(spinePanel.x + spinePanel.w / 2), ly: ty(spinePanel.y + spinePanel.h), label: 'Spine Safe' });
  if (spinePanel && spinePanel.w > 1.6) marks.push({ n: 8, cx: tx(spinePanel.x) - 16, cy: ty(spinePanel.y + spinePanel.h / 2), lx: tx(spinePanel.x), ly: ty(spinePanel.y + spinePanel.h / 2), label: 'Spine Margin' });
  if (L.barcode && backPanel) marks.push({ n: 9, cx: tx(L.barcode.x + L.barcode.w), cy: ty(L.barcode.y + L.barcode.h + 12), lx: tx(L.barcode.x + L.barcode.w), ly: ty(L.barcode.y + L.barcode.h), label: 'Barcode' });

  return (
    <svg width="100%" viewBox={`0 0 ${vw} ${vh}`} style={{ fontFamily: 'Inter, sans-serif', display: 'block' }}>
      <rect x={tx(0) + 4} y={ty(0) + 4} width={tw(L.fullW)} height={th(L.fullH)} fill="rgba(0,0,0,0.12)" rx={2} ry={2} />
      <rect x={tx(0)} y={ty(0)} width={tw(L.fullW)} height={th(L.fullH)} fill={BLEED_BG} rx={2} ry={2} />
      {L.panels.map((p, i) => (
        <rect key={`p${i}`} x={tx(p.x)} y={ty(p.y)} width={tw(p.w)} height={th(p.h)} fill={getPanelFill(p.role)}
          rx={p.role === 'frontCover' || p.role === 'backCover' ? 0.5 : 0} />
      ))}
      {L.foldLines.map((f, i) => (
        <line key={`f${i}`} x1={tx(f.x)} y1={ty(0)} x2={tx(f.x)} y2={ty(L.fullH)} stroke={FOLD_STROKE} strokeWidth={0.5} />
      ))}
      {L.safeRects.map((s, i) => s.w > 0 && s.h > 0 ? (
        <rect key={`s${i}`} x={tx(s.x)} y={ty(s.y)} width={tw(s.w)} height={th(s.h)} fill="none" stroke={SAFE_STROKE} strokeWidth={0.5} strokeDasharray="4 5" />
      ) : null)}
      {L.panels.filter(p => p.role === 'frontCover' || p.role === 'backCover' || p.role === 'panel').map((p, i) => (
        <g key={`sc${i}`}>
          <line x1={tx(p.x)} y1={ty(p.y) - 8} x2={tx(p.x + p.w)} y2={ty(p.y) - 8} stroke="#0f172a" strokeWidth={0.5} />
          <text x={tx(p.x + p.w / 2)} y={ty(p.y) - 10} textAnchor="middle" fontSize={7} fill="#0f172a">✂ ✂</text>
        </g>
      ))}
      {frontPanel && (
        <g>
          <text x={tx(frontPanel.x + frontPanel.w / 2)} y={ty(frontPanel.y + frontPanel.h * 0.35)} textAnchor="middle" fontSize={12} fontWeight="bold" fill="#ffffff" letterSpacing="1">YOUR TITLE HERE</text>
          <line x1={tx(frontPanel.x + frontPanel.w * 0.25)} y1={ty(frontPanel.y + frontPanel.h * 0.40)} x2={tx(frontPanel.x + frontPanel.w * 0.75)} y2={ty(frontPanel.y + frontPanel.h * 0.40)} stroke="#ffffff" strokeWidth={0.5} strokeOpacity={0.4} />
          <text x={tx(frontPanel.x + frontPanel.w / 2)} y={ty(frontPanel.y + frontPanel.h * 0.46)} textAnchor="middle" fontSize={8} fill="#ffffff" fillOpacity={0.6} fontStyle="italic">Author Name</text>
        </g>
      )}
      {spinePanel && spinePanel.w > 3 && (
        <g>
          <text x={tx(spinePanel.x + spinePanel.w / 2)} y={ty(spinePanel.y + spinePanel.h * 0.48)} textAnchor="middle" fontSize={Math.min(7, spinePanel.w * scale * 0.18)} fill="#ffffff" fontStyle="italic"
            transform={`rotate(-90, ${tx(spinePanel.x + spinePanel.w / 2)}, ${ty(spinePanel.y + spinePanel.h * 0.48)})`}>TITLE</text>
        </g>
      )}
      {L.barcode && (
        <g>
          <rect x={tx(L.barcode.x)} y={ty(L.barcode.y)} width={tw(L.barcode.w)} height={th(L.barcode.h)} fill="rgba(255,255,255,0.9)" rx={1} />
          {Array.from({ length: 14 }).map((_, i) => (
            <line key={`bar${i}`} x1={tx(L.barcode.x) + tw(L.barcode.w) * 0.05 + i * tw(L.barcode.w) * 0.065} y1={ty(L.barcode.y) + th(L.barcode.h) * 0.08}
              x2={tx(L.barcode.x) + tw(L.barcode.w) * 0.05 + i * tw(L.barcode.w) * 0.065} y2={ty(L.barcode.y) + th(L.barcode.h) * 0.72}
              stroke="#1a1a1a" strokeWidth={i % 3 === 0 ? 1.8 : (i % 2 ? 0.8 : 0.4)} />
          ))}
          <text x={tx(L.barcode.x) + tw(L.barcode.w) / 2} y={ty(L.barcode.y) + th(L.barcode.h) - 4} textAnchor="middle" fontSize={5} fill={TEXT_DARK}>ISBN 000-0-0000000-0-0</text>
        </g>
      )}
      <line x1={tx(0)} y1={ty(L.fullH) + 10} x2={tx(L.fullW)} y2={ty(L.fullH) + 10} stroke={TEXT_DARK} strokeWidth={0.4} />
      <line x1={tx(0)} y1={ty(L.fullH) + 8} x2={tx(0)} y2={ty(L.fullH) + 12} stroke={TEXT_DARK} strokeWidth={0.5} />
      <line x1={tx(L.fullW)} y1={ty(L.fullH) + 8} x2={tx(L.fullW)} y2={ty(L.fullH) + 12} stroke={TEXT_DARK} strokeWidth={0.5} />
      <text x={tx(L.fullW / 2)} y={ty(L.fullH) + 22} textAnchor="middle" fontSize={7} fill={TEXT_DARK} fontWeight="600">{fmt(L.fullW)} mm</text>
      {spinePanel && spinePanel.w > 1 && (
        <g>
          <line x1={tx(spinePanel.x)} y1={ty(spinePanel.y) - 10} x2={tx(spinePanel.x + spinePanel.w)} y2={ty(spinePanel.y) - 10} stroke={TEXT_DARK} strokeWidth={0.4} />
          <line x1={tx(spinePanel.x)} y1={ty(spinePanel.y) - 12} x2={tx(spinePanel.x)} y2={ty(spinePanel.y) - 8} stroke={TEXT_DARK} strokeWidth={0.5} />
          <line x1={tx(spinePanel.x + spinePanel.w)} y1={ty(spinePanel.y) - 12} x2={tx(spinePanel.x + spinePanel.w)} y2={ty(spinePanel.y) - 8} stroke={TEXT_DARK} strokeWidth={0.5} />
          <text x={tx(spinePanel.x + spinePanel.w / 2)} y={ty(spinePanel.y) - 14} textAnchor="middle" fontSize={6} fill={TEXT_DARK} fontWeight="600">{fmt(spinePanel.w)}mm</text>
        </g>
      )}
      {frontPanel && (
        <g>
          <line x1={tx(frontPanel.x)} y1={ty(frontPanel.y) - 6} x2={tx(frontPanel.x + frontPanel.w)} y2={ty(frontPanel.y) - 6} stroke={TEXT_DARK} strokeWidth={0.4} />
          <text x={tx(frontPanel.x + frontPanel.w / 2)} y={ty(frontPanel.y) - 8} textAnchor="middle" fontSize={6} fill={TEXT_DARK} fontWeight="600">{fmt(frontPanel.w)}mm</text>
        </g>
      )}
      {marks.map((m, i) => (
        <line key={`ll${i}`} x1={m.cx} y1={m.cy} x2={m.lx} y2={m.ly} stroke={MARKER_BG} strokeWidth={0.4} />
      ))}
      {marks.map((m, i) => {
        const dx = m.cx - m.lx;
        const dy = m.cy - m.ly;
        let lx, textAnchor;
        if (Math.abs(dx) > Math.abs(dy)) { lx = dx > 0 ? m.cx + 10 : m.cx - 10; textAnchor = dx > 0 ? 'start' : 'end'; }
        else { lx = m.cx + 10; textAnchor = 'start'; }
        const ly = m.cy + 2.5;
        return (
          <g key={`mk${i}`}>
            <circle cx={m.cx} cy={m.cy} r={7} fill={MARKER_BG} />
            <text x={m.cx} y={m.cy + 1} textAnchor="middle" dominantBaseline="middle" fill="#fff" fontSize={7} fontWeight="bold">{m.n}</text>
            <text x={lx} y={ly} textAnchor={textAnchor} dominantBaseline="middle" fill="#ffffff" fontSize={6.5} fontWeight="500">{m.label}</text>
          </g>
        );
      })}
      <text x={vw / 2} y={vh - 10} textAnchor="middle" fontSize={8} fill={TEXT_LIGHT} fontStyle="italic">
        Image for reference only — covers are shown with realistic colour and measurement overlays
      </text>
    </svg>
  );
}