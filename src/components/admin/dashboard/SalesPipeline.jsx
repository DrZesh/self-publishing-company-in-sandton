import React from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, AlertCircle } from 'lucide-react';

const STAGE_LABELS = {
  new: 'New',
  contacted: 'Contacted',
  qualified: 'Qualified',
  quoted: 'Quoted',
  negotiating: 'Negotiating',
};
const STAGES = Object.keys(STAGE_LABELS);

const LOSS_LABELS = {
  price: 'Price',
  timing: 'Timing',
  competitor: 'Competitor',
  no_response: 'No Response',
  not_a_fit: 'Not a Fit',
  other: 'Other',
};

function StageBar({ stage, data, maxValue }) {
  const widthPct = maxValue > 0 ? Math.max(8, (data.estimatedValue / maxValue) * 100) : 8;
  return (
    <div className="flex items-center gap-3 mb-3">
      <div className="w-24 text-xs font-semibold text-black/60 text-right shrink-0">{STAGE_LABELS[stage]}</div>
      <div className="flex-1 flex items-center gap-2">
        <div className="h-7 rounded-r-lg flex items-center px-3 transition-all"
          style={{
            width: `${widthPct}%`,
            background: 'linear-gradient(90deg, #B87333, #D4A574)',
            minWidth: 60,
          }}
        >
          <span className="text-white text-xs font-bold whitespace-nowrap">{data.count}</span>
        </div>
        <span className="text-xs text-black/50 whitespace-nowrap">
          R{(data.estimatedValue || 0).toLocaleString()}
        </span>
      </div>
    </div>
  );
}

export default function SalesPipeline({ pipeline, loading }) {
  if (loading) {
    return <div className="h-64 bg-black/5 rounded-2xl animate-pulse mb-6" />;
  }

  const byStage = pipeline?.byStage || {};
  const avgTime = pipeline?.avgTimeInStage || {};
  const lossReasons = pipeline?.lossReasons || {};
  const flags = pipeline?.attentionFlags || {};

  const maxValue = Math.max(...STAGES.map(s => byStage[s]?.estimatedValue || 0), 1);
  const totalLost = Object.values(lossReasons).reduce((s, v) => s + v, 0);

  const isEmpty = STAGES.every(s => !byStage[s]?.count);

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-base font-semibold text-gray-900">Sales Pipeline</h2>
          <p className="text-xs text-gray-400">Where every open deal stands</p>
        </div>
        <Link to="/admin/submissions" className="text-xs font-medium hover:underline" style={{ color: '#B87333' }}>View all leads →</Link>
      </div>

      {isEmpty ? (
        <div className="py-12 text-center">
          <div className="text-4xl mb-3">🚀</div>
          <p className="text-sm font-semibold text-black/50">Your pipeline is waiting to come to life.</p>
          <p className="text-xs text-black/30 mt-1 max-w-sm mx-auto">Once submissions convert to leads, your funnel appears here. Share your <a href="/calculator" className="text-[#B87333] underline">/calculator</a> or <a href="/getquote" className="text-[#B87333] underline">/getquote</a> pages to get started.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Funnel */}
          <div className="lg:col-span-3">
            <p className="text-xs font-semibold text-black/40 uppercase tracking-wide mb-4">Funnel by Stage</p>
            {STAGES.map(stage => (
              <StageBar key={stage} stage={stage} data={byStage[stage] || { count: 0, estimatedValue: 0 }} maxValue={maxValue} />
            ))}
          </div>

          {/* Intelligence */}
          <div className="lg:col-span-2 space-y-4">
            {/* Time in stage */}
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-xs font-semibold text-black/50 uppercase tracking-wide mb-3">Avg Days in Stage</p>
              {STAGES.map(stage => {
                const days = avgTime[stage] || 0;
                const flag = days > 14;
                return (
                  <div key={stage} className="flex items-center justify-between text-xs mb-2">
                    <span className="text-black/60">{STAGE_LABELS[stage]}</span>
                    <span className={`font-bold ${flag ? 'text-amber-500' : 'text-[#1A1208]'}`}>
                      {days}d {flag ? '⚠' : ''}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Loss reasons */}
            {totalLost > 0 && (
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-xs font-semibold text-black/50 uppercase tracking-wide mb-3">Loss Reasons</p>
                {Object.entries(lossReasons).map(([reason, count]) => (
                  <div key={reason} className="flex items-center justify-between text-xs mb-2">
                    <span className="text-black/60">{LOSS_LABELS[reason] || reason}</span>
                    <span className="font-bold text-red-500">{Math.round(count / totalLost * 100)}%</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Attention flags */}
      {(flags.quotedOldCount > 0 || flags.noOwnerCount > 0) && (
        <div className="mt-5 pt-5 border-t border-black/8 space-y-2">
          {flags.quotedOldCount > 0 && (
            <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 rounded-xl px-4 py-2.5 border border-red-100">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span><strong>{flags.quotedOldCount} leads</strong> in 'Quoted' stage &gt;7 days with no follow-up</span>
              <Link to="/admin/submissions" className="ml-auto text-xs underline shrink-0">View →</Link>
            </div>
          )}
          {flags.noOwnerCount > 0 && (
            <div className="flex items-center gap-2 text-sm text-amber-600 bg-amber-50 rounded-xl px-4 py-2.5 border border-amber-100">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span><strong>{flags.noOwnerCount} leads</strong> have no assigned owner</span>
              <Link to="/admin/submissions" className="ml-auto text-xs underline shrink-0">View →</Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}