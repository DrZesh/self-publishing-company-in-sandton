import React from 'react';
import { TrendingUp, AlertCircle, Clock, CheckCircle } from 'lucide-react';

const GLASS = {
  background: 'rgba(255,255,255,0.7)',
  backdropFilter: 'blur(24px)',
  border: '1px solid rgba(255,255,255,0.3)',
  boxShadow: '0 8px 32px rgba(0,0,0,0.08)'
};

export default function InvoiceAnalytics({ invoices }) {
  // Calculate analytics
  const totalRevenue = invoices.reduce((sum, inv) => sum + (inv.total || 0), 0);
  const totalCollected = invoices.filter(i => i.status === 'Paid').reduce((sum, inv) => sum + (inv.total || 0), 0);
  const totalOutstanding = invoices.filter(i => !['Paid', 'Cancelled'].includes(i.status)).reduce((sum, inv) => sum + (inv.balance_due || 0), 0);
  
  // Monthly breakdown
  const monthlyData = invoices.reduce((acc, inv) => {
    const month = new Date(inv.created_date).toLocaleString('default', { month: 'short', year: '2-digit' });
    if (!acc[month]) acc[month] = { total: 0, paid: 0, count: 0 };
    acc[month].total += inv.total || 0;
    acc[month].count += 1;
    if (inv.status === 'Paid') acc[month].paid += inv.total || 0;
    return acc;
  }, {});

  // Top clients
  const clientTotals = invoices.reduce((acc, inv) => {
    const clientName = inv.contact_snapshot?.full_name || 'Unknown';
    if (!acc[clientName]) acc[clientName] = { total: 0, count: 0, paid: 0 };
    acc[clientName].total += inv.total || 0;
    acc[clientName].count += 1;
    if (inv.status === 'Paid') acc[clientName].paid += inv.total || 0;
    return acc;
  }, {});

  const topClients = Object.entries(clientTotals)
    .sort((a, b) => b[1].total - a[1].total)
    .slice(0, 5);

  // Status breakdown
  const statusBreakdown = invoices.reduce((acc, inv) => {
    acc[inv.status] = (acc[inv.status] || 0) + 1;
    return acc;
  }, {});

  const collectionRate = totalRevenue > 0 ? ((totalCollected / totalRevenue) * 100).toFixed(1) : 0;
  const avgInvoiceValue = invoices.length > 0 ? totalRevenue / invoices.length : 0;

  return (
    <div className="space-y-6">
      {/* Header with Back Button */}
      <div className="flex items-center gap-3 mb-4">
        <button onClick={() => window.history.back()} className="p-2 hover:bg-gray-100 rounded-xl transition-colors" title="Back to Invoices">
          <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </button>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Invoice Analytics</h2>
          <p className="text-sm text-gray-500 mt-1">Financial insights and performance metrics</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="rounded-2xl p-5" style={GLASS}>
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2.5 rounded-xl bg-blue-50">
              <TrendingUp className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide">Collection Rate</p>
              <p className="text-2xl font-bold text-gray-900">{collectionRate}%</p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl p-5" style={GLASS}>
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2.5 rounded-xl bg-purple-50">
              <CheckCircle className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide">Avg Invoice Value</p>
              <p className="text-2xl font-bold text-gray-900">R {avgInvoiceValue.toLocaleString('en-ZA', { minimumFractionDigits: 2 })}</p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl p-5" style={GLASS}>
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2.5 rounded-xl bg-orange-50">
              <Clock className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide">Outstanding</p>
              <p className="text-2xl font-bold text-gray-900">R {totalOutstanding.toLocaleString('en-ZA', { minimumFractionDigits: 2 })}</p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl p-5" style={GLASS}>
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2.5 rounded-xl bg-green-50">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide">Total Collected</p>
              <p className="text-2xl font-bold text-gray-900">R {totalCollected.toLocaleString('en-ZA', { minimumFractionDigits: 2 })}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Status Breakdown */}
      <div className="rounded-2xl p-6 bg-white border border-gray-200">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Invoice Status Breakdown</h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {Object.entries(statusBreakdown).map(([status, count]) => (
            <div key={status} className="text-center p-4 bg-gray-50 rounded-xl">
              <p className="text-2xl font-bold text-gray-900">{count}</p>
              <p className="text-xs text-gray-600 mt-1">{status}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Top Clients */}
      <div className="rounded-2xl p-6 bg-white border border-gray-200">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Top 5 Clients by Revenue</h3>
        <div className="space-y-3">
          {topClients.map(([client, data], idx) => (
            <div key={client} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-sm">
                  {idx + 1}
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{client}</p>
                  <p className="text-xs text-gray-600">{data.count} invoices</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold text-gray-900">R {data.total.toLocaleString('en-ZA', { minimumFractionDigits: 2 })}</p>
                <p className="text-xs text-green-600">{data.paid > 0 ? `R ${data.paid.toLocaleString('en-ZA', { minimumFractionDigits: 2 })} collected` : 'Unpaid'}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Monthly Trend */}
      <div className="rounded-2xl p-6 bg-white border border-gray-200">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Monthly Invoice Trend</h3>
        <div className="space-y-3">
          {Object.entries(monthlyData).slice(-6).map(([month, data]) => (
            <div key={month} className="flex items-center gap-4">
              <div className="w-16 text-sm font-medium text-gray-700">{month}</div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-3 bg-gray-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-blue-500 rounded-full"
                      style={{ width: `${(data.paid / data.total) * 100}%` }}
                    />
                  </div>
                  <span className="text-xs text-gray-600 w-20 text-right">
                    {data.paid > 0 ? `${((data.paid / data.total) * 100).toFixed(0)}% collected` : 'Unpaid'}
                  </span>
                </div>
                <div className="flex justify-between mt-1 text-xs text-gray-600">
                  <span>R {data.total.toLocaleString()}</span>
                  <span>{data.count} invoices</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};