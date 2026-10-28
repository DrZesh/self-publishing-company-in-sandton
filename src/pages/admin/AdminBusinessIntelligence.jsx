import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { platform } from '@/api/platformClient';
import AdminLayout from '@/components/admin/AdminLayout';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend
} from 'recharts';
import { TrendingUp, Users, DollarSign, Target, ArrowUpRight, ArrowDownRight, Loader2, Percent, Clock } from 'lucide-react';
import { format, subMonths, startOfMonth, endOfMonth } from 'date-fns';

const COPPER = '#B87333';
const COLORS = ['#B87333', '#4299e1', '#48bb78', '#ed8936', '#9f7aea', '#e53e3e'];

const KPI = ({ icon: Icon, label, value, change, prefix = '', suffix = '', positive }) => (
  <div className="bg-white rounded-xl border border-gray-100 p-5">
    <div className="flex items-start justify-between">
      <div>
        <p className="text-sm text-gray-500 mb-1">{label}</p>
        <p className="text-2xl font-bold text-gray-900">{prefix}{typeof value === 'number' ? value.toLocaleString('en-ZA') : value}{suffix}</p>
      </div>
      <div className="w-10 h-10 rounded-xl bg-[#B87333]/10 flex items-center justify-center flex-shrink-0">
        <Icon className="w-5 h-5 text-[#B87333]" />
      </div>
    </div>
    {change !== undefined && (
      <div className={`flex items-center gap-1 mt-2 text-xs font-medium ${positive ? 'text-green-600' : 'text-red-500'}`}>
        {positive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
        {change}% vs last month
      </div>
    )}
  </div>
);

function useBI() {
  return useQuery({
    queryKey: ['bi-data'],
    queryFn: async () => {
      const [invoices, quotes, contacts, payments] = await Promise.all([
        platform.entities.Invoice.list('-created_date', 500),
        platform.entities.Quote.list('-created_date', 500),
        platform.entities.Contact.list('-created_date', 500),
        platform.entities.Payment.list('-payment_date', 500),
      ]);

      // Monthly revenue (last 6 months)
      const monthlyRevenue = [];
      for (let i = 5; i >= 0; i--) {
        const d = subMonths(new Date(), i);
        const label = format(d, 'MMM yy');
        const start = startOfMonth(d).toISOString();
        const end = endOfMonth(d).toISOString();
        const monthPayments = payments.filter(p => p.payment_date >= start.split('T')[0] && p.payment_date <= end.split('T')[0]);
        const revenue = monthPayments.reduce((s, p) => s + (p.amount || 0), 0);
        monthlyRevenue.push({ month: label, revenue });
      }

      // Quote funnel
      const total_quotes = quotes.length;
      const sent_quotes = quotes.filter(q => ['Sent', 'Viewed', 'Accepted', 'Converted'].includes(q.status)).length;
      const viewed_quotes = quotes.filter(q => ['Viewed', 'Accepted', 'Converted'].includes(q.status)).length;
      const accepted_quotes = quotes.filter(q => ['Accepted', 'Converted'].includes(q.status)).length;
      const quoteConversionRate = sent_quotes ? Math.round((accepted_quotes / sent_quotes) * 100) : 0;

      // Pipeline stage breakdown
      const stageCounts = {};
      contacts.forEach(c => {
        stageCounts[c.pipeline_stage || 'Unknown'] = (stageCounts[c.pipeline_stage || 'Unknown'] || 0) + 1;
      });
      const pipelineData = Object.entries(stageCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 8)
        .map(([name, value]) => ({ name, value }));

      // Lifecycle breakdown
      const lifeCycles = {};
      contacts.forEach(c => { lifeCycles[c.lifecycle_stage || 'lead'] = (lifeCycles[c.lifecycle_stage || 'lead'] || 0) + 1; });
      const lifecycleData = Object.entries(lifeCycles).map(([name, value]) => ({ name, value }));

      // Revenue by service
      const serviceRevenue = {};
      invoices.filter(i => i.status === 'Paid').forEach(i => {
        const key = i.book_title ? 'Projects' : 'General';
        (i.line_items || []).forEach(li => {
          serviceRevenue[key] = (serviceRevenue[key] || 0) + (li.line_total || 0);
        });
      });

      // Invoice health
      const paid = invoices.filter(i => i.status === 'Paid').length;
      const outstanding = invoices.filter(i => ['Sent', 'Partially Paid'].includes(i.status)).length;
      const overdue = invoices.filter(i => i.status === 'Overdue').length;
      const totalRevenue = payments.reduce((s, p) => s + (p.amount || 0), 0);
      const outstandingValue = invoices
        .filter(i => ['Sent', 'Partially Paid', 'Overdue'].includes(i.status))
        .reduce((s, i) => s + (i.balance_due || 0), 0);

      // Average deal size
      const paidInvoices = invoices.filter(i => i.status === 'Paid');
      const avgDeal = paidInvoices.length ? totalRevenue / paidInvoices.length : 0;

      // New contacts this month
      const thisMonth = startOfMonth(new Date()).toISOString();
      const newContacts = contacts.filter(c => (c.created_date || '') >= thisMonth).length;

      return {
        monthlyRevenue,
        totalRevenue,
        outstandingValue,
        avgDeal,
        quoteConversionRate,
        total_quotes,
        sent_quotes,
        viewed_quotes,
        accepted_quotes,
        pipelineData,
        lifecycleData,
        paid,
        outstanding,
        overdue,
        totalContacts: contacts.length,
        newContacts,
      };
    },
    staleTime: 60000,
  });
}

export default function AdminBusinessIntelligence() {
  const { data: bi, isLoading } = useBI();

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center py-24">
          <Loader2 className="w-8 h-8 animate-spin text-[#B87333]" />
        </div>
      </AdminLayout>
    );
  }

  const funnelData = [
    { stage: 'Created', count: bi.total_quotes },
    { stage: 'Sent', count: bi.sent_quotes },
    { stage: 'Viewed', count: bi.viewed_quotes },
    { stage: 'Accepted', count: bi.accepted_quotes },
  ];

  const invoiceHealthData = [
    { name: 'Paid', value: bi.paid },
    { name: 'Outstanding', value: bi.outstanding },
    { name: 'Overdue', value: bi.overdue },
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-[#B87333]" /> Business Intelligence
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">Revenue analytics, conversion funnels, and growth metrics</p>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <KPI icon={DollarSign} label="Total Revenue Collected" value={bi.totalRevenue} prefix="R " />
          <KPI icon={Target} label="Outstanding (Balance Due)" value={bi.outstandingValue} prefix="R " />
          <KPI icon={Percent} label="Quote Conversion Rate" value={bi.quoteConversionRate} suffix="%" />
          <KPI icon={Clock} label="Avg Deal Size" value={Math.round(bi.avgDeal)} prefix="R " />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <KPI icon={Users} label="Total Contacts" value={bi.totalContacts} />
          <KPI icon={Users} label="New This Month" value={bi.newContacts} />
          <KPI icon={TrendingUp} label="Paid Invoices" value={bi.paid} />
          <KPI icon={ArrowDownRight} label="Overdue Invoices" value={bi.overdue} />
        </div>

        {/* Monthly Revenue Chart */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <h2 className="text-base font-semibold text-gray-900 mb-4">Monthly Revenue (Last 6 Months)</h2>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={bi.monthlyRevenue} margin={{ top: 0, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={COPPER} stopOpacity={0.2} />
                  <stop offset="95%" stopColor={COPPER} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `R${(v/1000).toFixed(0)}k`} />
              <Tooltip formatter={v => [`R ${Number(v).toLocaleString('en-ZA')}`, 'Revenue']} />
              <Area type="monotone" dataKey="revenue" stroke={COPPER} strokeWidth={2} fill="url(#revenueGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Quote Conversion Funnel */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <h2 className="text-base font-semibold text-gray-900 mb-4">Quote Conversion Funnel</h2>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={funnelData} layout="vertical" margin={{ left: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis type="number" tick={{ fontSize: 11 }} />
                <YAxis type="category" dataKey="stage" tick={{ fontSize: 12 }} width={70} />
                <Tooltip />
                <Bar dataKey="count" fill={COPPER} radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
            <p className="text-sm text-center text-gray-500 mt-2">
              Conversion rate: <strong className="text-[#B87333]">{bi.quoteConversionRate}%</strong>
            </p>
          </div>

          {/* Invoice Health */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <h2 className="text-base font-semibold text-gray-900 mb-4">Invoice Health</h2>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={invoiceHealthData} cx="50%" cy="50%" innerRadius={55} outerRadius={80} dataKey="value" paddingAngle={3}>
                  {invoiceHealthData.map((_, i) => <Cell key={i} fill={['#48bb78', '#4299e1', '#e53e3e'][i]} />)}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Pipeline Breakdown */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <h2 className="text-base font-semibold text-gray-900 mb-4">Pipeline Stage Breakdown</h2>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={bi.pipelineData} margin={{ top: 0, right: 10, left: 0, bottom: 40 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} angle={-30} textAnchor="end" interval={0} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="value" fill={COPPER} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Lifecycle Breakdown */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <h2 className="text-base font-semibold text-gray-900 mb-4">Contact Lifecycle</h2>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={bi.lifecycleData} cx="50%" cy="50%" outerRadius={85} dataKey="value" label={({ name, percent }) => `${name} ${Math.round(percent * 100)}%`} labelLine={false}>
                  {bi.lifecycleData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}