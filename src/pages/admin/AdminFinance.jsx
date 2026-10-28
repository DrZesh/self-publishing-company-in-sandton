import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { platform } from '@/api/platformClient';
import AdminLayout from '@/components/admin/AdminLayout';
import { Link } from 'react-router-dom';
import { FileText, Receipt, CreditCard, TrendingUp, AlertTriangle, CheckCircle, Clock, Plus, Search, ChevronRight, DollarSign, BarChart3, Download, Eye } from 'lucide-react';
import RevenueHealthWidget from '@/components/admin/finance/RevenueHealthWidget';

const QUOTE_STATUS = { Draft: 'bg-white/10 text-white/50 border-white/20', Sent: 'bg-blue-500/20 text-blue-200 border-blue-400/30', Delivered: 'bg-sky-500/20 text-sky-200 border-sky-400/30', Opened: 'bg-purple-500/20 text-purple-200 border-purple-400/30', Viewed: 'bg-violet-500/20 text-violet-200 border-violet-400/30', Accepted: 'bg-green-500/20 text-green-200 border-green-400/30', Declined: 'bg-red-500/20 text-red-200 border-red-400/30', Expired: 'bg-white/10 text-white/40 border-white/15' };
const INV_STATUS = { Draft: 'bg-white/10 text-white/50 border-white/20', Sent: 'bg-blue-500/20 text-blue-200 border-blue-400/30', Viewed: 'bg-purple-500/20 text-purple-200 border-purple-400/30', 'Partially Paid': 'bg-amber-500/20 text-amber-200 border-amber-400/30', Paid: 'bg-green-500/20 text-green-200 border-green-400/30', Overdue: 'bg-red-500/20 text-red-200 border-red-400/30', Cancelled: 'bg-white/10 text-white/40', Refunded: 'bg-rose-500/20 text-rose-200 border-rose-400/30' };
const PAY_STATUS = { Pending: 'bg-yellow-500/20 text-yellow-200 border-yellow-400/30', Confirmed: 'bg-green-500/20 text-green-200 border-green-400/30', Refunded: 'bg-rose-500/20 text-rose-200 border-rose-400/30' };

const TABS = [{ key: 'overview', label: 'Overview', icon: BarChart3 }, { key: 'quotes', label: 'Quotes', icon: FileText }, { key: 'invoices', label: 'Invoices', icon: Receipt }, { key: 'payments', label: 'Payments', icon: CreditCard }];

const GLASS = { background: 'rgba(0,0,0,0.25)', backdropFilter: 'blur(24px)', border: '1px solid rgba(255,255,255,0.15)', boxShadow: '0 8px 40px rgba(0,0,0,0.25)' };
const HEAD  = { background: 'rgba(0,0,0,0.2)', borderBottom: '1px solid rgba(255,255,255,0.1)' };

export default function AdminFinance() {
  const [activeTab, setActiveTab] = useState('overview');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const { data: quotes = [], isLoading: qLoading } = useQuery({ queryKey: ['quotes'], queryFn: () => platform.entities.Quote.list('-created_date', 300) });
  const { data: invoices = [], isLoading: iLoading } = useQuery({ queryKey: ['invoices'], queryFn: () => platform.entities.Invoice.list('-created_date', 300) });
  const { data: payments = [], isLoading: pLoading } = useQuery({ queryKey: ['payments'], queryFn: () => platform.entities.Payment.list('-created_date', 300) });
  const { data: contacts = [] } = useQuery({ queryKey: ['contacts'], queryFn: () => platform.entities.Contact.list('-created_date', 500) });

  const contactMap = Object.fromEntries(contacts.map(c => [c.id, c]));

  const totalRevenue = payments.filter(p => p.status === 'Confirmed').reduce((s, p) => s + (p.amount || 0), 0);
  const outstandingBalance = invoices.filter(i => ['Sent', 'Partially Paid', 'Overdue'].includes(i.status)).reduce((s, i) => s + (i.balance_due || 0), 0);
  const overdueInvoices = invoices.filter(i => i.status === 'Overdue');
  const acceptedQuotes = quotes.filter(q => q.status === 'Accepted').length;
  const sentQuotes = quotes.filter(q => !['Draft'].includes(q.status)).length;
  const conversionRate = sentQuotes > 0 ? Math.round((acceptedQuotes / sentQuotes) * 100) : 0;

  const filterDocs = (docs) => {
    const q = search.toLowerCase();
    return docs.filter(d => {
      const contact = contactMap[d.contact_id];
      return (!q || d.quote_number?.toLowerCase().includes(q) || d.invoice_number?.toLowerCase().includes(q) || contact?.full_name?.toLowerCase().includes(q) || d.book_title?.toLowerCase().includes(q))
        && (!statusFilter || d.status === statusFilter);
    });
  };

  const kpis = [
    { label: 'Total Revenue', value: `R${totalRevenue.toLocaleString()}`, color: 'text-green-300', icon: DollarSign },
    { label: 'Outstanding', value: `R${outstandingBalance.toLocaleString()}`, color: 'text-orange-300', icon: AlertTriangle },
    { label: 'Overdue Invoices', value: overdueInvoices.length, color: 'text-red-300', icon: Clock },
    { label: 'Quotes Sent', value: sentQuotes, color: 'text-blue-300', icon: FileText },
    { label: 'Quotes Accepted', value: acceptedQuotes, color: 'text-green-300', icon: CheckCircle },
    { label: 'Conversion Rate', value: `${conversionRate}%`, color: 'text-orange-300', icon: TrendingUp },
  ];

  return (
    <AdminLayout>
      <div className="min-h-screen -m-6 p-6 relative" style={{ backgroundImage: `url(https://images.unsplash.com/photo-1614851099511-773084f6911d?w=1600&q=80)`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
        <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, rgba(100,120,200,0.55) 0%, rgba(180,100,200,0.45) 50%, rgba(100,160,220,0.5) 100%)' }} />
        <div className="relative z-10 space-y-6">

          {/* Header */}
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <h1 className="text-2xl font-bold text-white drop-shadow">Finance Centre</h1>
              <p className="text-sm text-white/60 mt-0.5">Quotes, invoices, payments &amp; financial overview</p>
            </div>
            <div className="flex gap-2">
              <Link to="/admin/quotes/new" className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white/80 transition-colors" style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.15)' }}>
                <Plus className="w-4 h-4" /> New Quote
              </Link>
              <Link to="/admin/invoices" className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white transition-colors" style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.2)' }}>
                <Plus className="w-4 h-4" /> New Invoice
              </Link>
            </div>
          </div>

          {/* Revenue Health */}
          <RevenueHealthWidget />

          {/* KPI Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {kpis.map(k => {
              const Icon = k.icon;
              return (
                <div key={k.label} className="rounded-2xl p-4" style={GLASS}>
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-xs text-white/40 uppercase tracking-widest mb-1">{k.label}</p>
                      <p className={`text-xl font-bold ${k.color}`}>{k.value}</p>
                    </div>
                    <Icon className={`w-4 h-4 mt-0.5 ${k.color} opacity-60`} />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Tabs */}
          <div className="flex items-center space-x-1 rounded-xl p-1 w-fit" style={{ background: 'rgba(0,0,0,0.2)' }}>
            {TABS.map(tab => {
              const Icon = tab.icon;
              return (
                <button key={tab.key} onClick={() => { setActiveTab(tab.key); setSearch(''); setStatusFilter(''); }}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all whitespace-nowrap"
                  style={activeTab === tab.key ? { background: 'linear-gradient(135deg, #ec4899, #f97316)', color: '#fff', boxShadow: '0 2px 8px rgba(0,0,0,0.3)' } : { color: 'rgba(255,255,255,0.5)' }}>
                  <Icon className="w-4 h-4" />{tab.label}
                </button>
              );
            })}
          </div>

          {/* ── OVERVIEW ── */}
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {[
                { title: 'Recent Quotes', icon: FileText, iconColor: 'text-blue-300', link: '/admin/quotes', items: quotes.slice(0, 6).map(q => ({ id: q.id, name: contactMap[q.contact_id]?.full_name || '—', sub: `${q.quote_number} · R${(q.total || 0).toLocaleString()}`, status: q.status, statusMap: QUOTE_STATUS })) },
                { title: 'Needs Payment', icon: Receipt, iconColor: 'text-orange-300', link: '/admin/invoices', items: invoices.filter(i => ['Overdue', 'Sent', 'Partially Paid'].includes(i.status)).slice(0, 6).map(inv => ({ id: inv.id, name: contactMap[inv.contact_id]?.full_name || '—', sub: `${inv.invoice_number} · R${(inv.balance_due || inv.total || 0).toLocaleString()} due`, status: inv.status, statusMap: INV_STATUS })) },
                { title: 'Recent Payments', icon: CreditCard, iconColor: 'text-green-300', link: '/admin/payments', items: payments.slice(0, 6).map(p => ({ id: p.id, name: contactMap[p.contact_id]?.full_name || '—', sub: `${p.payment_method} · ${p.payment_date}`, status: `R${(p.amount || 0).toLocaleString()}`, statusMap: null })) },
              ].map(panel => {
                const Icon = panel.icon;
                return (
                  <div key={panel.title} className="rounded-2xl p-5" style={GLASS}>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold text-white text-sm flex items-center gap-2"><Icon className={`w-4 h-4 ${panel.iconColor}`} />{panel.title}</h3>
                      <Link to={panel.link} className="text-xs text-orange-300 hover:underline flex items-center gap-1">All <ChevronRight className="w-3 h-3" /></Link>
                    </div>
                    <div className="space-y-2">
                      {panel.items.length === 0 && <p className="text-xs text-white/30 text-center py-4">Nothing here 🎉</p>}
                      {panel.items.map(item => (
                        <div key={item.id} className="flex items-center justify-between py-1.5 border-b border-white/5 last:border-0">
                          <div className="min-w-0">
                            <p className="text-xs font-medium text-white truncate">{item.name}</p>
                            <p className="text-[10px] text-white/40">{item.sub}</p>
                          </div>
                          {item.statusMap ? (
                            <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ml-2 flex-shrink-0 border ${item.statusMap[item.status] || 'bg-white/10 text-white/50'}`}>{item.status}</span>
                          ) : (
                            <span className="text-xs font-bold text-green-300 ml-2 flex-shrink-0">{item.status}</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Shared filters for data tabs */}
          {activeTab !== 'overview' && (
            <div className="flex gap-3 flex-wrap">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                <input placeholder={`Search ${activeTab}...`} value={search} onChange={e => setSearch(e.target.value)} className="w-full rounded-xl pl-9 pr-3 py-2 text-sm text-white placeholder-white/30 outline-none" style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.15)' }} />
              </div>
              <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="rounded-xl px-3 py-2 text-sm text-white/80 outline-none" style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.15)' }}>
                <option value="" style={{ background: '#1e1e2e' }}>All Statuses</option>
                {Object.keys(activeTab === 'quotes' ? QUOTE_STATUS : activeTab === 'invoices' ? INV_STATUS : PAY_STATUS).map(s => <option key={s} value={s} style={{ background: '#1e1e2e' }}>{s}</option>)}
              </select>
              {activeTab === 'quotes' && <Link to="/admin/quotes/new" className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white" style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.2)' }}><Plus className="w-4 h-4" /> New Quote</Link>}
              {activeTab === 'invoices' && <Link to="/admin/invoices" className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white" style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.2)' }}><Plus className="w-4 h-4" /> New Invoice</Link>}
            </div>
          )}

          {/* ── QUOTES TAB ── */}
          {activeTab === 'quotes' && (
            <div className="rounded-2xl overflow-hidden" style={GLASS}>
              {qLoading ? <div className="p-8 text-center text-white/40">Loading...</div> : (
                <table className="w-full text-sm">
                  <thead><tr style={HEAD}>{['Quote #', 'Client', 'Book Title', 'Amount', 'Status', 'Date', 'Actions'].map(h => <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-white/40 uppercase tracking-wide">{h}</th>)}</tr></thead>
                  <tbody>
                    {filterDocs(quotes).map(q => (
                      <tr key={q.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                        <td className="px-4 py-3 font-mono text-xs font-semibold text-orange-300">{q.quote_number}</td>
                        <td className="px-4 py-3 text-sm text-white">{contactMap[q.contact_id]?.full_name || '—'}</td>
                        <td className="px-4 py-3 text-xs text-white/50 truncate max-w-[140px]">{q.book_title || '—'}</td>
                        <td className="px-4 py-3 font-semibold text-white">R{(q.total || 0).toLocaleString()}</td>
                        <td className="px-4 py-3"><span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${QUOTE_STATUS[q.status] || 'bg-white/10 text-white/50'}`}>{q.status}</span></td>
                        <td className="px-4 py-3 text-xs text-white/40">{q.created_date ? new Date(q.created_date).toLocaleDateString('en-ZA') : '—'}</td>
                        <td className="px-4 py-3"><Link to={`/admin/quotes/${q.id}`}><button className="p-1.5 hover:bg-white/10 rounded-lg"><Eye className="w-4 h-4 text-white/40" /></button></Link></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {/* ── INVOICES TAB ── */}
          {activeTab === 'invoices' && (
            <div className="rounded-2xl overflow-hidden" style={GLASS}>
              {iLoading ? <div className="p-8 text-center text-white/40">Loading...</div> : (
                <table className="w-full text-sm">
                  <thead><tr style={HEAD}>{['Invoice #', 'Client', 'Total', 'Paid', 'Balance', 'Status', 'Due Date'].map(h => <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-white/40 uppercase tracking-wide">{h}</th>)}</tr></thead>
                  <tbody>
                    {filterDocs(invoices).map(inv => (
                      <tr key={inv.id} className={`border-b border-white/5 transition-colors ${inv.status === 'Overdue' ? 'bg-red-500/10 hover:bg-red-500/15' : 'hover:bg-white/5'}`}>
                        <td className="px-4 py-3 font-mono text-xs font-semibold text-orange-300">{inv.invoice_number}</td>
                        <td className="px-4 py-3 text-sm text-white">{contactMap[inv.contact_id]?.full_name || '—'}</td>
                        <td className="px-4 py-3 font-semibold text-white">R{(inv.total || 0).toLocaleString()}</td>
                        <td className="px-4 py-3 text-green-300">R{(inv.amount_paid || 0).toLocaleString()}</td>
                        <td className={`px-4 py-3 font-semibold ${(inv.balance_due || 0) > 0 ? 'text-red-300' : 'text-white/30'}`}>R{(inv.balance_due || 0).toLocaleString()}</td>
                        <td className="px-4 py-3"><span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${INV_STATUS[inv.status] || 'bg-white/10 text-white/50'}`}>{inv.status}</span></td>
                        <td className="px-4 py-3 text-xs text-white/40">{inv.due_date || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {/* ── PAYMENTS TAB ── */}
          {activeTab === 'payments' && (
            <div className="rounded-2xl overflow-hidden" style={GLASS}>
              {pLoading ? <div className="p-8 text-center text-white/40">Loading...</div> : (
                <table className="w-full text-sm">
                  <thead><tr style={HEAD}>{['Client', 'Amount', 'Method', 'Reference', 'Date', 'Status', 'Proof'].map(h => <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-white/40 uppercase tracking-wide">{h}</th>)}</tr></thead>
                  <tbody>
                    {payments.filter(p => { const q = search.toLowerCase(); const contact = contactMap[p.contact_id]; return (!q || contact?.full_name?.toLowerCase().includes(q) || p.reference?.toLowerCase().includes(q)) && (!statusFilter || p.status === statusFilter); }).map(p => (
                      <tr key={p.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                        <td className="px-4 py-3 text-sm text-white">{contactMap[p.contact_id]?.full_name || '—'}</td>
                        <td className="px-4 py-3 font-bold text-green-300">R{(p.amount || 0).toLocaleString()}</td>
                        <td className="px-4 py-3 text-xs text-white/50">{p.payment_method}</td>
                        <td className="px-4 py-3 text-xs font-mono text-white/40">{p.reference || '—'}</td>
                        <td className="px-4 py-3 text-xs text-white/40">{p.payment_date}</td>
                        <td className="px-4 py-3"><span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${PAY_STATUS[p.status] || 'bg-white/10 text-white/50'}`}>{p.status}</span></td>
                        <td className="px-4 py-3">{p.proof_url ? <a href={p.proof_url} target="_blank" rel="noreferrer" className="text-xs text-blue-300 hover:underline flex items-center gap-1"><Download className="w-3 h-3" /> View</a> : <span className="text-xs text-white/20">—</span>}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}