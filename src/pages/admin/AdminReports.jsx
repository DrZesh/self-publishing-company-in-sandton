import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { platform } from '@/api/platformClient';
import AdminLayout from '@/components/admin/AdminLayout';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, TrendingDown, DollarSign, Users, FileText, CheckCircle, Clock, AlertTriangle, Download } from 'lucide-react';

const COPPER = '#B87333';
const COLORS = ['#B87333', '#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#84cc16'];

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

export default function AdminReports() {
  const [period, setPeriod] = useState('12m');

  const { data: invoices = [] } = useQuery({ queryKey: ['invoices'], queryFn: () => platform.entities.Invoice.list('-created_date', 500) });
  const { data: payments = [] } = useQuery({ queryKey: ['payments'], queryFn: () => platform.entities.Payment.list('-payment_date', 500) });
  const { data: projects = [] } = useQuery({ queryKey: ['projects'], queryFn: () => platform.entities.Project.list('-created_date', 500) });
  const { data: contacts = [] } = useQuery({ queryKey: ['contacts'], queryFn: () => platform.entities.Contact.list('-created_date', 500) });
  const { data: quotes = [] } = useQuery({ queryKey: ['quotes'], queryFn: () => platform.entities.Quote.list('-created_date', 500) });
  const { data: tasks = [] } = useQuery({ queryKey: ['tasks'], queryFn: () => platform.entities.Task.list('-due_date', 300) });

  const exportReportCsv = () => {
    const rows = [
      ['Metric', 'Value'],
      ['Total Revenue Collected', `R ${totalRevenue.toLocaleString()}`],
      ['Outstanding Balance', `R ${outstandingBalance.toLocaleString()}`],
      ['Active Projects', activeProjects],
      ['Quote Conversion Rate', `${conversionRate}%`],
      ['Total Contacts', contacts.length],
      ['Pending Tasks', pendingTasks],
      ['Overdue Invoices', overdueInvoices],
      ['Total Projects', projects.length],
      [],
      ['Month', 'Revenue', 'Invoices'],
      ...revenueByMonth.map(r => [r.month, r.revenue, r.invoices]),
    ];
    const csv = rows.map(r => r.join(',')).join('\n');
    const a = document.createElement('a');
    a.href = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv);
    a.download = `report_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  // ── Revenue by Month ──────────────────────────────────────────────────────
  const revenueByMonth = useMemo(() => {
    const now = new Date();
    const monthCount = period === '12m' ? 12 : period === '6m' ? 6 : 3;
    const result = [];
    for (let i = monthCount - 1; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const monthPayments = payments.filter(p => {
        const pd = p.payment_date || p.created_date;
        return pd && pd.startsWith(key) && p.status === 'Confirmed';
      });
      const revenue = monthPayments.reduce((s, p) => s + (p.amount || 0), 0);
      const invoiceCount = invoices.filter(inv => (inv.created_date || '').startsWith(key)).length;
      result.push({ month: MONTHS[d.getMonth()], revenue, invoices: invoiceCount });
    }
    return result;
  }, [payments, invoices, period]);

  // ── KPIs ──────────────────────────────────────────────────────────────────
  const totalRevenue = payments.filter(p => p.status === 'Confirmed').reduce((s, p) => s + (p.amount || 0), 0);
  const outstandingBalance = invoices.filter(i => !['Paid', 'Cancelled'].includes(i.status)).reduce((s, i) => s + (i.balance_due || 0), 0);
  const activeProjects = projects.filter(p => !['Completed', 'Delivered'].includes(p.stage)).length;
  const conversionRate = quotes.length > 0 ? Math.round((quotes.filter(q => q.status === 'Accepted').length / quotes.length) * 100) : 0;
  const pendingTasks = tasks.filter(t => t.status === 'Pending').length;
  const overdueInvoices = invoices.filter(i => i.due_date && new Date(i.due_date) < new Date() && !['Paid', 'Cancelled'].includes(i.status)).length;

  // ── Service Breakdown ─────────────────────────────────────────────────────
  const serviceBreakdown = useMemo(() => {
    const map = {};
    projects.forEach(p => {
      const key = p.service_type || 'Other';
      map[key] = (map[key] || 0) + 1;
    });
    return Object.entries(map).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
  }, [projects]);

  // ── Pipeline Stage Counts ─────────────────────────────────────────────────
  const stageData = useMemo(() => {
    const important = ['Editing', 'Typesetting', 'Cover Design', 'Client Approval', 'Mass Production Started', 'Ready for Collection', 'Completed'];
    const map = {};
    projects.forEach(p => {
      if (important.includes(p.stage)) map[p.stage] = (map[p.stage] || 0) + 1;
    });
    return important.filter(s => map[s]).map(stage => ({ stage: stage.replace(' Started', '').replace(' for', ''), count: map[stage] }));
  }, [projects]);

  // ── Quote Status Breakdown ────────────────────────────────────────────────
  const quoteStatusData = useMemo(() => {
    const map = {};
    quotes.forEach(q => { map[q.status] = (map[q.status] || 0) + 1; });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [quotes]);

  // ── Contact Growth ────────────────────────────────────────────────────────
  const contactGrowth = useMemo(() => {
    const now = new Date();
    const monthCount = period === '12m' ? 12 : period === '6m' ? 6 : 3;
    const result = [];
    for (let i = monthCount - 1; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const count = contacts.filter(c => (c.created_date || '').startsWith(key)).length;
      result.push({ month: MONTHS[d.getMonth()], contacts: count });
    }
    return result;
  }, [contacts, period]);

  // ── Payment Method Breakdown ──────────────────────────────────────────────
  const paymentMethodData = useMemo(() => {
    const map = {};
    payments.filter(p => p.status === 'Confirmed').forEach(p => {
      const key = p.payment_method || 'Other';
      map[key] = (map[key] || 0) + (p.amount || 0);
    });
    return Object.entries(map).map(([name, value]) => ({ name, value: Math.round(value) }));
  }, [payments]);

  const kpis = [
    { label: 'Total Revenue Collected', value: `R ${totalRevenue.toLocaleString()}`, icon: DollarSign, color: 'text-green-600', bg: 'bg-green-50' },
    { label: 'Outstanding Balance', value: `R ${outstandingBalance.toLocaleString()}`, icon: AlertTriangle, color: 'text-orange-600', bg: 'bg-orange-50' },
    { label: 'Active Projects', value: activeProjects, icon: Clock, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Quote Conversion Rate', value: `${conversionRate}%`, icon: TrendingUp, color: 'text-purple-600', bg: 'bg-purple-50' },
    { label: 'Total Contacts', value: contacts.length, icon: Users, color: 'text-indigo-600', bg: 'bg-indigo-50' },
    { label: 'Pending Tasks', value: pendingTasks, icon: CheckCircle, color: 'text-yellow-600', bg: 'bg-yellow-50' },
    { label: 'Overdue Invoices', value: overdueInvoices, icon: FileText, color: 'text-red-600', bg: 'bg-red-50' },
    { label: 'Total Projects', value: projects.length, icon: TrendingUp, color: 'text-teal-600', bg: 'bg-teal-50' },
  ];

  return (
    <AdminLayout>
      <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 40%, #0f3460 100%)' }}>
      <div className="space-y-7">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Reports &amp; Analytics</h1>
            <p className="text-sm text-white/50 mt-0.5">Business performance overview</p>
          </div>
          <div className="flex gap-2">
            {['3m', '6m', '12m'].map(p => (
              <button key={p} onClick={() => setPeriod(p)} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${period === p ? 'bg-[#B87333] text-white' : 'border border-white/20 text-white/60 hover:bg-white/10'}`}>
                {p === '3m' ? '3 Months' : p === '6m' ? '6 Months' : '12 Months'}
              </button>
            ))}
            <button onClick={exportReportCsv} className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border border-white/20 text-white/60 hover:bg-white/10 transition-colors">
              <Download className="w-4 h-4" /> Export CSV
            </button>
          </div>
        </div>

        {/* KPI Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {kpis.map(kpi => (
            <div key={kpi.label} className="rounded-xl p-4" style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)' }}>
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs text-white/60 leading-tight">{kpi.label}</p>
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.1)' }}>
                  <kpi.icon className={`w-4 h-4 ${kpi.color}`} />
                </div>
              </div>
              <p className={`text-2xl font-bold ${kpi.color}`}>{kpi.value}</p>
            </div>
          ))}
        </div>

        {/* Revenue Trend */}
        <div className="rounded-2xl p-6" style={{ background: 'rgba(255,255,255,0.07)', backdropFilter: 'blur(24px)', border: '1px solid rgba(255,255,255,0.12)' }}>
          <h2 className="text-base font-semibold text-white mb-5">Revenue Collected by Month</h2>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={revenueByMonth}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#9ca3af' }} />
              <YAxis tick={{ fontSize: 12, fill: '#9ca3af' }} tickFormatter={v => `R${(v/1000).toFixed(0)}k`} />
              <Tooltip formatter={v => [`R ${v.toLocaleString()}`, 'Revenue']} />
              <Bar dataKey="revenue" fill={COPPER} radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* 3 Column Charts */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Service Type Breakdown */}
          <div className="rounded-2xl p-5" style={{ background: 'rgba(255,255,255,0.07)', backdropFilter: 'blur(24px)', border: '1px solid rgba(255,255,255,0.12)' }}>
            <h2 className="text-sm font-semibold text-white mb-4">Projects by Service Type</h2>
            {serviceBreakdown.length === 0 ? (
              <p className="text-sm text-white/40 text-center py-8">No data yet</p>
            ) : (
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={serviceBreakdown} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={75} label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`} labelLine={false}>
                    {serviceBreakdown.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            )}
            <div className="space-y-1.5 mt-3">
              {serviceBreakdown.slice(0, 5).map((item, i) => (
                <div key={item.name} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
                    <span className="text-white/60 truncate max-w-[120px]">{item.name}</span>
                  </div>
                  <span className="font-medium text-white/80">{item.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Quote Conversion */}
          <div className="rounded-2xl p-5" style={{ background: 'rgba(255,255,255,0.07)', backdropFilter: 'blur(24px)', border: '1px solid rgba(255,255,255,0.12)' }}>
            <h2 className="text-sm font-semibold text-white mb-4">Quote Status Breakdown</h2>
            {quoteStatusData.length === 0 ? (
              <p className="text-sm text-white/40 text-center py-8">No data yet</p>
            ) : (
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={quoteStatusData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={75} label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`} labelLine={false}>
                    {quoteStatusData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            )}
            <div className="space-y-1.5 mt-3">
              {quoteStatusData.map((item, i) => (
                <div key={item.name} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
                    <span className="text-white/60">{item.name}</span>
                  </div>
                  <span className="font-medium text-white/80">{item.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Payment Methods */}
          <div className="rounded-2xl p-5" style={{ background: 'rgba(255,255,255,0.07)', backdropFilter: 'blur(24px)', border: '1px solid rgba(255,255,255,0.12)' }}>
            <h2 className="text-sm font-semibold text-white mb-4">Revenue by Payment Method</h2>
            {paymentMethodData.length === 0 ? (
              <p className="text-sm text-white/40 text-center py-8">No data yet</p>
            ) : (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={paymentMethodData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 11, fill: '#9ca3af' }} tickFormatter={v => `R${(v/1000).toFixed(0)}k`} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: '#6b7280' }} width={55} />
                  <Tooltip formatter={v => [`R ${v.toLocaleString()}`, 'Revenue']} />
                  <Bar dataKey="value" fill={COPPER} radius={[0, 6, 6, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Contact Growth */}
        <div className="rounded-2xl p-6" style={{ background: 'rgba(255,255,255,0.07)', backdropFilter: 'blur(24px)', border: '1px solid rgba(255,255,255,0.12)' }}>
          <h2 className="text-base font-semibold text-white mb-5">New Contacts per Month</h2>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={contactGrowth}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#9ca3af' }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: '#9ca3af' }} />
              <Tooltip formatter={v => [v, 'New Contacts']} contentStyle={{ background: '#1e293b', border: 'none', borderRadius: 8, color: '#fff' }} />
              <Line type="monotone" dataKey="contacts" stroke="#10b981" strokeWidth={2.5} dot={{ fill: '#10b981', r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Pipeline Stage Snapshot */}
        {stageData.length > 0 && (
          <div className="rounded-2xl p-6" style={{ background: 'rgba(255,255,255,0.07)', backdropFilter: 'blur(24px)', border: '1px solid rgba(255,255,255,0.12)' }}>
            <h2 className="text-base font-semibold text-white mb-5">Active Pipeline Snapshot</h2>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={stageData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis dataKey="stage" tick={{ fontSize: 11, fill: '#9ca3af' }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: '#9ca3af' }} />
                <Tooltip />
                <Bar dataKey="count" fill="#6366f1" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
      </div>
    </AdminLayout>
  );
}