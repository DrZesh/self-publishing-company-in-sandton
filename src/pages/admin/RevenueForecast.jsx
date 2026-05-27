import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import AdminLayout from '@/components/admin/AdminLayout';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from 'recharts';
import { TrendingUp, Loader2 } from 'lucide-react';

function getMonthKey(dateStr) {
  const d = new Date(dateStr);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}
function monthLabel(key) {
  const [y, m] = key.split('-');
  return new Date(Number(y), Number(m) - 1).toLocaleDateString('en-ZA', { month: 'short', year: '2-digit' });
}

export default function RevenueForecast() {
  const [aiInsight, setAiInsight] = useState('');
  const [loadingAI, setLoadingAI] = useState(false);

  const { data: invoices = [] } = useQuery({
    queryKey: ['invoices'],
    queryFn: () => base44.entities.Invoice.list('-created_date', 500),
  });
  const { data: projects = [] } = useQuery({
    queryKey: ['projects'],
    queryFn: () => base44.entities.Project.list('-created_date', 500),
  });
  const { data: quotes = [] } = useQuery({
    queryKey: ['quotes'],
    queryFn: () => base44.entities.Quote.list('-created_date', 200),
  });

  // Build monthly revenue from invoices
  const monthMap = {};
  invoices.forEach(inv => {
    const key = getMonthKey(inv.created_date || new Date());
    if (!monthMap[key]) monthMap[key] = { month: key, revenue: 0, paid: 0, outstanding: 0 };
    monthMap[key].revenue += inv.total || 0;
    monthMap[key].paid += inv.amount_paid || 0;
    monthMap[key].outstanding += inv.balance_due || 0;
  });

  const chartData = Object.entries(monthMap)
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-12)
    .map(([key, val]) => ({ ...val, label: monthLabel(key) }));

  // Forecast: simple average of last 3 months projected forward
  const last3 = chartData.slice(-3);
  const avgRevenue = last3.length ? last3.reduce((s, m) => s + m.revenue, 0) / last3.length : 0;
  const forecastData = [0, 1, 2].map(i => {
    const d = new Date();
    d.setMonth(d.getMonth() + i + 1);
    return {
      label: d.toLocaleDateString('en-ZA', { month: 'short', year: '2-digit' }),
      forecast: Math.round(avgRevenue * (1 + i * 0.05)),
    };
  });

  const totalRevenue = invoices.reduce((s, i) => s + (i.amount_paid || 0), 0);
  const totalOutstanding = invoices.reduce((s, i) => s + (i.balance_due || 0), 0);
  const pipelineValue = projects.reduce((s, p) => s + (p.project_value || 0), 0);
  const pendingQuoteValue = quotes.filter(q => ['Sent', 'Opened', 'Viewed'].includes(q.status)).reduce((s, q) => s + (q.total || 0), 0);

  const loadAIInsight = async () => {
    setLoadingAI(true);
    const summary = {
      total_collected: totalRevenue,
      total_outstanding: totalOutstanding,
      pipeline_value: pipelineValue,
      pending_quotes_value: pendingQuoteValue,
      avg_monthly_revenue: Math.round(avgRevenue),
      months_of_data: chartData.length,
      top_months: chartData.slice(-3).map(m => ({ month: m.label, revenue: m.revenue })),
      unpaid_invoices: invoices.filter(i => (i.balance_due || 0) > 0).length,
    };
    const { insight } = await base44.integrations.Core.InvokeLLM({
      prompt: `You are a financial advisor for Creative Books SA, a South African publishing company. Analyse this revenue data and provide 3-5 actionable insights in bullet points. Be specific about what they should do to improve cash flow, follow up on outstanding payments, and grow revenue.\n\nData: ${JSON.stringify(summary)}`,
      response_json_schema: { type: 'object', properties: { insight: { type: 'string' } } },
    });
    setAiInsight(insight);
    setLoadingAI(false);
  };

  return (
    <AdminLayout>
      <div className="space-y-6 max-w-6xl mx-auto">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Revenue Forecast</h1>
            <p className="text-sm text-gray-500 mt-0.5">Historical revenue, outstanding balances, and AI-powered forecast</p>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Total Collected', value: `R ${totalRevenue.toLocaleString()}`, color: 'text-green-600', bg: 'bg-green-50 border-green-100' },
            { label: 'Outstanding', value: `R ${totalOutstanding.toLocaleString()}`, color: 'text-orange-600', bg: 'bg-orange-50 border-orange-100' },
            { label: 'Pipeline Value', value: `R ${pipelineValue.toLocaleString()}`, color: 'text-blue-600', bg: 'bg-blue-50 border-blue-100' },
            { label: 'Pending Quotes', value: `R ${pendingQuoteValue.toLocaleString()}`, color: 'text-purple-600', bg: 'bg-purple-50 border-purple-100' },
          ].map(k => (
            <div key={k.label} className={`rounded-xl border p-4 ${k.bg}`}>
              <p className="text-xs text-gray-500">{k.label}</p>
              <p className={`text-2xl font-bold mt-1 ${k.color}`}>{k.value}</p>
            </div>
          ))}
        </div>

        {/* Revenue chart */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">Monthly Revenue (Last 12 Months)</h2>
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#B87333" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#B87333" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="label" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `R${(v/1000).toFixed(0)}k`} />
              <Tooltip formatter={v => `R ${Number(v).toLocaleString()}`} />
              <Area type="monotone" dataKey="revenue" stroke="#B87333" fill="url(#revGrad)" strokeWidth={2} name="Invoiced" />
              <Area type="monotone" dataKey="paid" stroke="#22c55e" fill="none" strokeWidth={2} strokeDasharray="4 2" name="Collected" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Forecast */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-4 h-4 text-[#B87333]" />
            <h2 className="text-sm font-semibold text-gray-700">3-Month Revenue Forecast</h2>
            <span className="text-xs text-gray-400 ml-1">(based on 3-month trend + 5% growth)</span>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={forecastData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="label" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `R${(v/1000).toFixed(0)}k`} />
              <Tooltip formatter={v => `R ${Number(v).toLocaleString()}`} />
              <Bar dataKey="forecast" fill="#B87333" radius={[6, 6, 0, 0]} name="Forecast" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* AI Insight */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-gray-700">AI Revenue Insights</h2>
            <button onClick={loadAIInsight} disabled={loadingAI}
              className="flex items-center gap-2 px-4 py-2 bg-[#B87333] hover:bg-[#A06828] text-white rounded-xl text-xs font-semibold transition-colors disabled:opacity-50">
              {loadingAI ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : '✨'}
              {loadingAI ? 'Analysing...' : 'Generate AI Insights'}
            </button>
          </div>
          {aiInsight ? (
            <div className="bg-amber-50 border border-amber-100 rounded-xl p-4">
              <p className="text-sm text-amber-900 whitespace-pre-wrap">{aiInsight}</p>
            </div>
          ) : (
            <p className="text-sm text-gray-400 text-center py-6">Click "Generate AI Insights" to get personalised revenue analysis and recommendations.</p>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}