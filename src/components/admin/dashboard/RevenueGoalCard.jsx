import React, { useState } from 'react';
import { Target, Edit2, Check } from 'lucide-react';

const STORAGE_KEY = 'cb_monthly_revenue_target';

export default function RevenueGoalCard({ metrics, loading }) {
  const [target, setTarget] = useState(() => {
    return parseInt(localStorage.getItem(STORAGE_KEY) || '150000', 10);
  });
  const [editing, setEditing] = useState(false);
  const [editVal, setEditVal] = useState(target);

  const saveTarget = () => {
    const v = parseInt(editVal, 10) || 150000;
    setTarget(v);
    localStorage.setItem(STORAGE_KEY, String(v));
    setEditing(false);
  };

  if (loading) return <div className="h-32 bg-black/5 rounded-2xl animate-pulse mb-6" />;

  const revenue = metrics?.revenueThisMonth || 0;
  const pct = Math.min(100, Math.round((revenue / target) * 100));
  const remaining = Math.max(0, target - revenue);

  return (
    <div className="rounded-xl p-5 mb-6 text-white" style={{ background: 'linear-gradient(135deg, #1A3C34 0%, #2D6A4F 100%)' }}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Target className="w-5 h-5 text-white/80" />
          <span className="text-sm font-semibold">Monthly Revenue Goal</span>
        </div>
        {editing ? (
          <div className="flex items-center gap-2">
            <span className="text-sm text-white/80">R</span>
            <input
              type="number"
              value={editVal}
              onChange={e => setEditVal(e.target.value)}
              className="w-24 px-2 py-1 rounded-lg text-sm text-[#1A1208] font-bold focus:outline-none"
              autoFocus
              onKeyDown={e => e.key === 'Enter' && saveTarget()}
            />
            <button onClick={saveTarget} className="p-1 hover:bg-white/20 rounded"><Check className="w-4 h-4" /></button>
          </div>
        ) : (
          <button onClick={() => { setEditVal(target); setEditing(true); }} className="p-1 hover:bg-white/20 rounded">
            <Edit2 className="w-4 h-4 text-white/70" />
          </button>
        )}
      </div>

      <div className="flex items-end justify-between mb-3">
        <div>
          <div className="text-3xl font-bold">R{revenue.toLocaleString()}</div>
          <div className="text-sm text-white/70">of R{target.toLocaleString()} target</div>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold">{pct}%</div>
          <div className="text-xs text-white/70">{pct >= 100 ? '🎉 Target hit!' : `R${remaining.toLocaleString()} to go`}</div>
        </div>
      </div>

      <div className="h-2 bg-white/20 rounded-full overflow-hidden">
        <div
          className="h-full bg-white rounded-full transition-all duration-700"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}