import React from 'react';
import { TrendingUp, TrendingDown, DollarSign, CheckCircle, Clock, XCircle, FileText } from 'lucide-react';

const METRIC_STYLES = {
  default: { bg: 'from-slate-50 to-white', border: 'border-slate-200', text: 'text-slate-900', iconBg: 'bg-slate-100', iconColor: 'text-slate-600' },
  success: { bg: 'from-emerald-50 to-white', border: 'border-emerald-200', text: 'text-emerald-700', iconBg: 'bg-emerald-100', iconColor: 'text-emerald-600' },
  warning: { bg: 'from-amber-50 to-white', border: 'border-amber-200', text: 'text-amber-700', iconBg: 'bg-amber-100', iconColor: 'text-amber-600' },
  danger: { bg: 'from-red-50 to-white', border: 'border-red-200', text: 'text-red-700', iconBg: 'bg-red-100', iconColor: 'text-red-600' },
  primary: { bg: 'from-blue-50 to-white', border: 'border-blue-200', text: 'text-blue-700', iconBg: 'bg-blue-100', iconColor: 'text-blue-600' },
};

function TrendIndicator({ value, prefix = '' }) {
  if (value === null || value === undefined) return null;
  const isPositive = value >= 0;
  return (
    <div className={`flex items-center gap-1 text-xs font-medium ${isPositive ? 'text-emerald-600' : 'text-red-600'}`}>
      {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
      {prefix}{Math.abs(value)}%
    </div>
  );
}

export default function QuoteKpiCards({ metrics, loading }) {
  if (loading) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="rounded-xl p-4 bg-white border border-gray-200 animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-20 mb-2"></div>
            <div className="h-8 bg-gray-200 rounded w-full mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-16"></div>
          </div>
        ))}
      </div>
    );
  }

  const cards = [
    {
      label: 'Total Value',
      value: `R ${metrics?.total_value?.toLocaleString('en-ZA', { minimumFractionDigits: 2 }) || '0.00'}`,
      trend: metrics?.total_value_trend,
      icon: DollarSign,
      style: 'default',
    },
    {
      label: 'Accepted',
      value: `R ${metrics?.accepted_value?.toLocaleString('en-ZA', { minimumFractionDigits: 2 }) || '0.00'}`,
      trend: metrics?.accepted_trend,
      icon: CheckCircle,
      style: 'success',
    },
    {
      label: 'Pending',
      value: metrics?.pending_count || 0,
      subtext: 'awaiting response',
      icon: Clock,
      style: 'warning',
    },
    {
      label: 'Win Rate',
      value: `${metrics?.win_rate || 0}%`,
      trend: metrics?.win_rate_trend,
      icon: TrendingUp,
      style: 'primary',
    },
    {
      label: 'Expired',
      value: metrics?.expired_count || 0,
      subtext: 'needs follow-up',
      icon: XCircle,
      style: 'danger',
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
      {cards.map(card => {
        const Icon = card.icon;
        const styles = METRIC_STYLES[card.style];
        return (
          <div key={card.label} className={`rounded-xl p-4 bg-gradient-to-br ${styles.bg} border ${styles.border} shadow-sm hover:shadow-md transition-shadow`}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">{card.label}</span>
              <div className={`w-8 h-8 rounded-lg ${styles.iconBg} flex items-center justify-center`}>
                <Icon className={`w-4 h-4 ${styles.iconColor}`} />
              </div>
            </div>
            <div className={`text-xl font-bold ${styles.text} mb-1`}>{card.value}</div>
            {card.subtext && <div className="text-xs text-gray-400">{card.subtext}</div>}
            {card.trend !== undefined && <TrendIndicator value={card.trend} />}
          </div>
        );
      })}
    </div>
  );
}