import React from 'react';
import { ExternalLink } from 'lucide-react';

function InsightCard({ emoji, title, subtitle, rows, columns, emptyMsg }) {
  if (!rows || rows.length === 0) return null;
  return (
    <div className="bg-white rounded-2xl border border-black/8 shadow-sm overflow-hidden">
      <div className="p-5 border-b border-black/5">
        <div className="text-base font-bold text-[#1A1208]">{emoji} {title}</div>
        <div className="text-xs text-black/40 mt-0.5">{subtitle}</div>
      </div>
      <div className="divide-y divide-black/5">
        {rows.length === 0 ? (
          <div className="p-4 text-sm text-black/30 text-center">{emptyMsg}</div>
        ) : rows.map((row, i) => (
          <div key={i} className="px-5 py-3 flex items-start gap-3">
            <div className="flex-1 min-w-0">
              {columns.map(col => (
                <div key={col.key} className={col.label ? 'mb-0.5' : ''}>
                  {col.label && <span className="text-xs text-black/40 mr-1">{col.label}:</span>}
                  <span className={col.className || 'text-sm text-[#1A1208] font-medium'}>{col.render ? col.render(row) : row[col.key]}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function GscSmartInsights({ insights }) {
  if (!insights) return null;
  const { quickWins = [], highImpLowCtr = [], risingQueries = [] } = insights;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <InsightCard
        emoji="🎯" title="Quick Win Opportunities"
        subtitle="Queries on page 2 (pos 11–20) with 100+ impressions — small SEO improvements could push to page 1."
        rows={quickWins}
        columns={[
          { key: 'query', className: 'text-sm font-semibold text-[#1A1208]' },
          { key: 'position', label: 'Position', render: r => `#${r.position.toFixed(0)}`, className: 'text-xs text-amber-600' },
          { key: 'impressions', label: 'Impressions', render: r => r.impressions.toLocaleString(), className: 'text-xs text-black/60' },
          { key: 'estimatedExtraClicks', label: 'Est. extra clicks at pos 5', render: r => `+${Math.max(0, r.estimatedExtraClicks)} if ranked #5`, className: 'text-xs text-emerald-600' },
        ]}
        emptyMsg="No quick wins found — all ranking queries are either page 1 or have low impressions."
      />
      <InsightCard
        emoji="💎" title="High Impressions, Low CTR"
        subtitle="Queries shown 500+ times but clicked <1% — title tag or meta description likely needs work."
        rows={highImpLowCtr}
        columns={[
          { key: 'query', className: 'text-sm font-semibold text-[#1A1208]' },
          { key: 'impressions', label: 'Impressions', render: r => r.impressions.toLocaleString(), className: 'text-xs text-black/60' },
          { key: 'ctr', label: 'CTR', render: r => `${(r.ctr * 100).toFixed(2)}%`, className: 'text-xs text-red-500' },
        ]}
        emptyMsg="No high-impression, low-CTR queries found."
      />
      {risingQueries.length > 0 && (
        <InsightCard
          emoji="📈" title="Rising Queries"
          subtitle="Queries with clicks up >50% vs prior period — trending topics to lean into."
          rows={risingQueries}
          columns={[
            { key: 'query', className: 'text-sm font-semibold text-[#1A1208]' },
            { key: 'clicks', label: 'Clicks', render: r => `${r.clicks} (+${r.pctChange}%)`, className: 'text-xs text-emerald-600' },
          ]}
          emptyMsg="No rising queries detected yet."
        />
      )}
    </div>
  );
}