import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import AdminLayout from '@/components/admin/AdminLayout';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  FileText, Receipt, CreditCard, TrendingUp, AlertTriangle,
  CheckCircle, Clock, Plus, Search, ChevronRight, DollarSign,
  BarChart3, Download, Eye, Send
} from 'lucide-react';

const QUOTE_STATUS_COLORS = {
  'Draft': 'bg-gray-100 text-gray-600',
  'Sent': 'bg-blue-100 text-blue-700',
  'Delivered': 'bg-sky-100 text-sky-700',
  'Opened': 'bg-purple-100 text-purple-700',
  'Viewed': 'bg-violet-100 text-violet-700',
  'Accepted': 'bg-green-100 text-green-700',
  'Declined': 'bg-red-100 text-red-700',
  'Expired': 'bg-gray-200 text-gray-500',
};

const INV_STATUS_COLORS = {
  'Draft': 'bg-gray-100 text-gray-600',
  'Sent': 'bg-blue-100 text-blue-700',
  'Viewed': 'bg-purple-100 text-purple-700',
  'Partially Paid': 'bg-amber-100 text-amber-700',
  'Paid': 'bg-green-100 text-green-700',
  'Overdue': 'bg-red-100 text-red-700',
  'Cancelled': 'bg-gray-200 text-gray-500',
  'Refunded': 'bg-rose-100 text-rose-700',
};

const PAY_STATUS_COLORS = {
  'Pending': 'bg-yellow-100 text-yellow-700',
  'Confirmed': 'bg-green-100 text-green-700',
  'Refunded': 'bg-rose-100 text-rose-700',
};

const TABS = [
  { key: 'overview', label: 'Overview', icon: BarChart3 },
  { key: 'quotes', label: 'Quotes', icon: FileText },
  { key: 'invoices', label: 'Invoices', icon: Receipt },
  { key: 'payments', label: 'Payments', icon: CreditCard },
];

function KpiCard({ label, value, sub, color, bg, icon: Icon }) {
  return (
    <div className={`${bg} rounded-xl border border-gray-100 p-4`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs text-gray-500 mb-1">{label}</p>
          <p className={`text-2xl font-bold ${color}`}>{value}</p>
          {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
        </div>
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${bg}`}>
          <Icon className={`w-5 h-5 ${color}`} />
        </div>
      </div>
    </div>
  );
}

export default function AdminFinance() {
  const [activeTab, setActiveTab] = useState('overview');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const { data: quotes = [], isLoading: qLoading } = useQuery({
    queryKey: ['quotes'],
    queryFn: () => base44.entities.Quote.list('-created_date', 300),
  });
  const { data: invoices = [], isLoading: iLoading } = useQuery({
    queryKey: ['invoices'],
    queryFn: () => base44.entities.Invoice.list('-created_date', 300),
  });
  const { data: payments = [], isLoading: pLoading } = useQuery({
    queryKey: ['payments'],
    queryFn: () => base44.entities.Payment.list('-created_date', 300),
  });
  const { data: contacts = [] } = useQuery({
    queryKey: ['contacts'],
    queryFn: () => base44.entities.Contact.list('-created_date', 500),
  });

  const contactMap = Object.fromEntries(contacts.map(c => [c.id, c]));

  // Finance KPIs
  const totalRevenue = payments.filter(p => p.status === 'Confirmed').reduce((s, p) => s + (p.amount || 0), 0);
  const pendingInvoices = invoices.filter(i => ['Sent', 'Partially Paid'].includes(i.status));
  const overdueInvoices = invoices.filter(i => i.status === 'Overdue');
  const outstandingBalance = [...pendingInvoices, ...overdueInvoices].reduce((s, i) => s + (i.balance_due || 0), 0);
  const acceptedQuotes = quotes.filter(q => q.status === 'Accepted').length;
  const sentQuotes = quotes.filter(q => !['Draft'].includes(q.status)).length;
  const conversionRate = sentQuotes > 0 ? Math.round((acceptedQuotes / sentQuotes) * 100) : 0;

  const filterDocs = (docs) => {
    const q = search.toLowerCase();
    return docs.filter(d => {
      const contact = contactMap[d.contact_id];
      const matchSearch = !q || d.quote_number?.toLowerCase().includes(q) || d.invoice_number?.toLowerCase().includes(q) || contact?.full_name?.toLowerCase().includes(q) || d.book_title?.toLowerCase().includes(q);
      const matchStatus = !statusFilter || d.status === statusFilter;
      return matchSearch && matchStatus;
    });
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Finance Centre</h1>
            <p className="text-sm text-gray-500 mt-0.5">Quotes, invoices, payments &amp; financial overview</p>
          </div>
          <div className="flex gap-2">
            <Link to="/admin/quotes/new">
              <Button variant="outline" className="gap-2 text-sm">
                <Plus className="w-4 h-4" /> New Quote
              </Button>
            </Link>
            <Link to="/admin/invoices">
              <Button className="gap-2 bg-[#B87333] hover:bg-[#A06828] text-white text-sm">
                <Plus className="w-4 h-4" /> New Invoice
              </Button>
            </Link>
          </div>
        </div>

        {/* KPI Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <KpiCard label="Total Revenue" value={`R${totalRevenue.toLocaleString()}`} color="text-green-700" bg="bg-green-50" icon={DollarSign} />
          <KpiCard label="Outstanding" value={`R${outstandingBalance.toLocaleString()}`} color="text-orange-600" bg="bg-orange-50" icon={AlertTriangle} />
          <KpiCard label="Overdue Invoices" value={overdueInvoices.length} color="text-red-600" bg="bg-red-50" icon={Clock} />
          <KpiCard label="Quotes Sent" value={sentQuotes} color="text-blue-600" bg="bg-blue-50" icon={FileText} />
          <KpiCard label="Quotes Accepted" value={acceptedQuotes} color="text-emerald-600" bg="bg-emerald-50" icon={CheckCircle} />
          <KpiCard label="Conversion Rate" value={`${conversionRate}%`} color="text-[#B87333]" bg="bg-orange-50" icon={TrendingUp} />
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-gray-100 rounded-xl p-1 w-fit overflow-x-auto">
          {TABS.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.key}
                onClick={() => { setActiveTab(tab.key); setSearch(''); setStatusFilter(''); }}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${activeTab === tab.key ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* ── OVERVIEW ── */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Recent quotes */}
            <div className="bg-white rounded-xl border border-gray-100 p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900 text-sm flex items-center gap-2"><FileText className="w-4 h-4 text-blue-500" /> Recent Quotes</h3>
                <Link to="/admin/quotes" className="text-xs text-[#B87333] hover:underline flex items-center gap-1">All <ChevronRight className="w-3 h-3" /></Link>
              </div>
              <div className="space-y-2">
                {quotes.slice(0, 6).map(q => (
                  <div key={q.id} className="flex items-center justify-between py-1.5 border-b border-gray-50 last:border-0">
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-gray-800 truncate">{contactMap[q.contact_id]?.full_name || '—'}</p>
                      <p className="text-[10px] text-gray-400">{q.quote_number} · R{(q.total || 0).toLocaleString()}</p>
                    </div>
                    <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ml-2 flex-shrink-0 ${QUOTE_STATUS_COLORS[q.status] || 'bg-gray-100 text-gray-600'}`}>{q.status}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Overdue invoices */}
            <div className="bg-white rounded-xl border border-gray-100 p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900 text-sm flex items-center gap-2"><Receipt className="w-4 h-4 text-orange-500" /> Needs Payment</h3>
                <Link to="/admin/invoices" className="text-xs text-[#B87333] hover:underline flex items-center gap-1">All <ChevronRight className="w-3 h-3" /></Link>
              </div>
              <div className="space-y-2">
                {invoices.filter(i => ['Overdue', 'Sent', 'Partially Paid'].includes(i.status)).slice(0, 6).map(inv => (
                  <div key={inv.id} className="flex items-center justify-between py-1.5 border-b border-gray-50 last:border-0">
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-gray-800 truncate">{contactMap[inv.contact_id]?.full_name || '—'}</p>
                      <p className="text-[10px] text-gray-400">{inv.invoice_number} · R{(inv.balance_due || inv.total || 0).toLocaleString()} due</p>
                    </div>
                    <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ml-2 flex-shrink-0 ${INV_STATUS_COLORS[inv.status] || 'bg-gray-100 text-gray-600'}`}>{inv.status}</span>
                  </div>
                ))}
                {invoices.filter(i => ['Overdue', 'Sent', 'Partially Paid'].includes(i.status)).length === 0 && (
                  <p className="text-xs text-gray-400 text-center py-4">No outstanding invoices 🎉</p>
                )}
              </div>
            </div>

            {/* Recent payments */}
            <div className="bg-white rounded-xl border border-gray-100 p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900 text-sm flex items-center gap-2"><CreditCard className="w-4 h-4 text-green-500" /> Recent Payments</h3>
                <Link to="/admin/payments" className="text-xs text-[#B87333] hover:underline flex items-center gap-1">All <ChevronRight className="w-3 h-3" /></Link>
              </div>
              <div className="space-y-2">
                {payments.slice(0, 6).map(p => {
                  const contact = contactMap[p.contact_id];
                  return (
                    <div key={p.id} className="flex items-center justify-between py-1.5 border-b border-gray-50 last:border-0">
                      <div className="min-w-0">
                        <p className="text-xs font-medium text-gray-800 truncate">{contact?.full_name || '—'}</p>
                        <p className="text-[10px] text-gray-400">{p.payment_method} · {p.payment_date}</p>
                      </div>
                      <span className="text-xs font-bold text-green-700">R{(p.amount || 0).toLocaleString()}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ── QUOTES TAB ── */}
        {activeTab === 'quotes' && (
          <div className="space-y-4">
            <div className="flex gap-3 flex-wrap">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input placeholder="Search quotes..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
              </div>
              <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white">
                <option value="">All Statuses</option>
                {Object.keys(QUOTE_STATUS_COLORS).map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              <Link to="/admin/quotes/new">
                <Button className="gap-2 bg-[#B87333] hover:bg-[#A06828] text-white"><Plus className="w-4 h-4" /> New Quote</Button>
              </Link>
            </div>
            <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
              {qLoading ? <div className="p-8 text-center text-gray-400">Loading...</div> : (
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b border-gray-100">
                    <tr>{['Quote #', 'Client', 'Book Title', 'Amount', 'Status', 'Date', 'Actions'].map(h => (
                      <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                    ))}</tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {filterDocs(quotes).map(q => (
                      <tr key={q.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3 font-mono text-xs font-semibold text-gray-700">{q.quote_number}</td>
                        <td className="px-4 py-3 text-sm text-gray-700">{contactMap[q.contact_id]?.full_name || '—'}</td>
                        <td className="px-4 py-3 text-xs text-gray-500 truncate max-w-[140px]">{q.book_title || '—'}</td>
                        <td className="px-4 py-3 font-semibold text-gray-900">R{(q.total || 0).toLocaleString()}</td>
                        <td className="px-4 py-3"><span className={`text-xs font-medium px-2 py-0.5 rounded-full ${QUOTE_STATUS_COLORS[q.status] || 'bg-gray-100 text-gray-600'}`}>{q.status}</span></td>
                        <td className="px-4 py-3 text-xs text-gray-400">{q.created_date ? new Date(q.created_date).toLocaleDateString('en-ZA') : '—'}</td>
                        <td className="px-4 py-3">
                          <Link to={`/admin/quotes/${q.id}`}>
                            <Button variant="ghost" size="sm"><Eye className="w-4 h-4" /></Button>
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

        {/* ── INVOICES TAB ── */}
        {activeTab === 'invoices' && (
          <div className="space-y-4">
            <div className="flex gap-3 flex-wrap">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input placeholder="Search invoices..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
              </div>
              <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white">
                <option value="">All Statuses</option>
                {Object.keys(INV_STATUS_COLORS).map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              <Link to="/admin/invoices">
                <Button className="gap-2 bg-[#B87333] hover:bg-[#A06828] text-white"><Plus className="w-4 h-4" /> New Invoice</Button>
              </Link>
            </div>
            <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
              {iLoading ? <div className="p-8 text-center text-gray-400">Loading...</div> : (
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b border-gray-100">
                    <tr>{['Invoice #', 'Client', 'Total', 'Paid', 'Balance', 'Status', 'Due Date'].map(h => (
                      <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                    ))}</tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {filterDocs(invoices).map(inv => (
                      <tr key={inv.id} className={`hover:bg-gray-50 transition-colors ${inv.status === 'Overdue' ? 'bg-red-50/30' : ''}`}>
                        <td className="px-4 py-3 font-mono text-xs font-semibold text-gray-700">{inv.invoice_number}</td>
                        <td className="px-4 py-3 text-sm text-gray-700">{contactMap[inv.contact_id]?.full_name || '—'}</td>
                        <td className="px-4 py-3 font-semibold">R{(inv.total || 0).toLocaleString()}</td>
                        <td className="px-4 py-3 text-green-700">R{(inv.amount_paid || 0).toLocaleString()}</td>
                        <td className={`px-4 py-3 font-semibold ${(inv.balance_due || 0) > 0 ? 'text-red-600' : 'text-gray-400'}`}>R{(inv.balance_due || 0).toLocaleString()}</td>
                        <td className="px-4 py-3"><span className={`text-xs font-medium px-2 py-0.5 rounded-full ${INV_STATUS_COLORS[inv.status] || 'bg-gray-100 text-gray-600'}`}>{inv.status}</span></td>
                        <td className="px-4 py-3 text-xs text-gray-400">{inv.due_date || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

        {/* ── PAYMENTS TAB ── */}
        {activeTab === 'payments' && (
          <div className="space-y-4">
            <div className="flex gap-3 flex-wrap">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input placeholder="Search payments..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
              </div>
              <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white">
                <option value="">All Statuses</option>
                {Object.keys(PAY_STATUS_COLORS).map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
              {pLoading ? <div className="p-8 text-center text-gray-400">Loading...</div> : (
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b border-gray-100">
                    <tr>{['Client', 'Amount', 'Method', 'Reference', 'Date', 'Status', 'Proof'].map(h => (
                      <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                    ))}</tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {payments.filter(p => {
                      const q = search.toLowerCase();
                      const contact = contactMap[p.contact_id];
                      return !q || contact?.full_name?.toLowerCase().includes(q) || p.reference?.toLowerCase().includes(q);
                    }).filter(p => !statusFilter || p.status === statusFilter).map(p => (
                      <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3 text-sm text-gray-700">{contactMap[p.contact_id]?.full_name || '—'}</td>
                        <td className="px-4 py-3 font-bold text-green-700">R{(p.amount || 0).toLocaleString()}</td>
                        <td className="px-4 py-3 text-xs text-gray-500">{p.payment_method}</td>
                        <td className="px-4 py-3 text-xs font-mono text-gray-500">{p.reference || '—'}</td>
                        <td className="px-4 py-3 text-xs text-gray-400">{p.payment_date}</td>
                        <td className="px-4 py-3"><span className={`text-xs font-medium px-2 py-0.5 rounded-full ${PAY_STATUS_COLORS[p.status] || 'bg-gray-100 text-gray-600'}`}>{p.status}</span></td>
                        <td className="px-4 py-3">
                          {p.proof_url
                            ? <a href={p.proof_url} target="_blank" rel="noreferrer" className="text-xs text-blue-600 hover:underline flex items-center gap-1"><Download className="w-3 h-3" /> View</a>
                            : <span className="text-xs text-gray-300">—</span>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}