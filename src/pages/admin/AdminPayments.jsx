import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { platform } from '@/api/platformClient';
import AdminLayout from '@/components/admin/AdminLayout';
import { Plus, Search, DollarSign, Receipt } from 'lucide-react';
import PaymentModal from '@/components/admin/payments/PaymentModal';
import ReceiptDetailPanel from '@/components/admin/payments/ReceiptDetailPanel';

const METHOD_COLORS = {
  EFT:   'bg-blue-500/20 text-blue-200 border-blue-400/30',
  Cash:  'bg-green-500/20 text-green-200 border-green-400/30',
  Card:  'bg-purple-500/20 text-purple-200 border-purple-400/30',
  Other: 'bg-white/10 text-white/50 border-white/20',
};

const GLASS = { background: 'rgba(0,0,0,0.25)', backdropFilter: 'blur(24px)', border: '1px solid rgba(255,255,255,0.15)', boxShadow: '0 8px 40px rgba(0,0,0,0.25)' };
const ROW = { background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)' };
const HEAD = { background: 'rgba(0,0,0,0.2)', borderBottom: '1px solid rgba(255,255,255,0.1)' };

export default function AdminPayments() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [methodFilter, setMethodFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState(null);
  const [activeTab, setActiveTab] = useState('payments');

  const { data: payments = [], isLoading: loadingPayments } = useQuery({ queryKey: ['payments'], queryFn: () => platform.entities.Payment.list('-payment_date', 200) });
  const { data: receipts = [], isLoading: loadingReceipts } = useQuery({ queryKey: ['receipts'], queryFn: () => platform.entities.Receipt.list('-created_date', 200) });
  const { data: contacts = [] } = useQuery({ queryKey: ['contacts'], queryFn: () => platform.entities.Contact.list('-created_date', 500) });
  const { data: invoices = [] } = useQuery({ queryKey: ['invoices'], queryFn: () => platform.entities.Invoice.list('-created_date', 500) });

  const contactMap = Object.fromEntries(contacts.map(c => [c.id, c]));
  const invoiceMap = Object.fromEntries(invoices.map(i => [i.id, i]));
  const receiptMap = Object.fromEntries(receipts.map(r => [r.id, r]));

  const filteredPayments = payments.filter(p => {
    const q = search.toLowerCase();
    const contact = contactMap[p.contact_id];
    const invoice = invoiceMap[p.invoice_id];
    return (!q || contact?.full_name?.toLowerCase().includes(q) || invoice?.invoice_number?.toLowerCase().includes(q) || p.reference?.toLowerCase().includes(q) || p.payment_number?.toLowerCase().includes(q))
      && (!methodFilter || p.payment_method === methodFilter);
  });

  const filteredReceipts = receipts.filter(r => {
    const q = search.toLowerCase();
    const contact = contactMap[r.contact_id];
    return !q || contact?.full_name?.toLowerCase().includes(q) || r.receipt_number?.toLowerCase().includes(q) || r.invoice_number?.toLowerCase().includes(q);
  });

  const totalCollected = payments.reduce((s, p) => s + (p.amount || 0), 0);
  const totalThisMonth = payments.filter(p => { const d = new Date(p.payment_date); const n = new Date(); return d.getMonth() === n.getMonth() && d.getFullYear() === n.getFullYear(); }).reduce((s, p) => s + (p.amount || 0), 0);

  const handleSaved = (receipt) => {
    queryClient.invalidateQueries({ queryKey: ['payments'] });
    queryClient.invalidateQueries({ queryKey: ['invoices'] });
    queryClient.invalidateQueries({ queryKey: ['receipts'] });
    setShowModal(false);
    if (receipt) setSelectedReceipt(receipt);
  };

  const kpis = [
    { label: 'Total Payments', value: payments.length, color: 'text-white' },
    { label: 'Total Collected', value: `R ${totalCollected.toLocaleString()}`, color: 'text-green-300' },
    { label: 'This Month', value: `R ${totalThisMonth.toLocaleString()}`, color: 'text-blue-300' },
    { label: 'Receipts Issued', value: receipts.length, color: 'text-orange-300' },
  ];

  return (
    <AdminLayout>
      <div className="min-h-screen -m-6 p-6 relative" style={{ backgroundImage: `url(https://images.unsplash.com/photo-1614851099511-773084f6911d?w=1600&q=80)`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
        <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, rgba(100,120,200,0.55) 0%, rgba(180,100,200,0.45) 50%, rgba(100,160,220,0.5) 100%)' }} />
        <div className="relative z-10 space-y-6">

          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white drop-shadow">Payments &amp; Receipts</h1>
              <p className="text-sm text-white/60 mt-0.5">Record payments, generate receipts, and send acknowledgements</p>
            </div>
            <button onClick={() => setShowModal(true)} className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white transition-colors" style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.2)' }}>
              <Plus className="w-4 h-4" /> Record Payment
            </button>
          </div>

          {/* KPIs */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {kpis.map(k => (
              <div key={k.label} className="rounded-2xl p-4" style={GLASS}>
                <p className="text-xs text-white/50 uppercase tracking-widest">{k.label}</p>
                <p className={`text-2xl font-bold mt-1 ${k.color}`}>{k.value}</p>
              </div>
            ))}
          </div>

          {/* Tabs + Filters */}
          <div className="flex flex-wrap gap-3 items-center">
            <div className="flex items-center space-x-1 rounded-xl p-1" style={{ background: 'rgba(0,0,0,0.2)' }}>
              {['payments', 'receipts'].map(tab => (
                <button key={tab} onClick={() => setActiveTab(tab)} className="rounded-lg px-4 py-1.5 text-xs font-semibold capitalize transition-all"
                  style={activeTab === tab ? { background: 'linear-gradient(135deg, #ec4899, #f97316)', color: '#fff', boxShadow: '0 2px 8px rgba(0,0,0,0.3)' } : { color: 'rgba(255,255,255,0.55)' }}>
                  {tab}
                </button>
              ))}
            </div>
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
              <input placeholder="Search by client, invoice, reference…" value={search} onChange={e => setSearch(e.target.value)} className="w-full rounded-xl pl-9 pr-3 py-2 text-sm text-white placeholder-white/30 outline-none focus:ring-1 focus:ring-white/20" style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.15)' }} />
            </div>
            {activeTab === 'payments' && (
              <select value={methodFilter} onChange={e => setMethodFilter(e.target.value)} className="rounded-xl px-3 py-2 text-sm text-white/80 outline-none" style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.15)' }}>
                <option value="" style={{ background: '#1e1e2e' }}>All Methods</option>
                {Object.keys(METHOD_COLORS).map(m => <option key={m} value={m} style={{ background: '#1e1e2e' }}>{m}</option>)}
              </select>
            )}
          </div>

          {/* Payments Table */}
          {activeTab === 'payments' && (
            <div className="rounded-2xl overflow-hidden" style={GLASS}>
              {loadingPayments ? <div className="p-12 text-center text-white/40">Loading…</div>
                : filteredPayments.length === 0 ? <div className="p-12 text-center text-white/40">No payments found</div>
                : (
                  <table className="w-full text-sm">
                    <thead><tr style={HEAD}>
                      {['Pay #', 'Date', 'Client', 'Invoice', 'Amount', 'Method', 'Reference', 'Receipt'].map(h => (
                        <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-white/40 uppercase tracking-wide">{h}</th>
                      ))}
                    </tr></thead>
                    <tbody>
                      {filteredPayments.map(payment => {
                        const contact = contactMap[payment.contact_id];
                        const invoice = invoiceMap[payment.invoice_id];
                        const receipt = payment.receipt_id ? receiptMap[payment.receipt_id] : null;
                        return (
                          <tr key={payment.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                            <td className="px-4 py-3 font-mono text-xs text-white/40">{payment.payment_number || '—'}</td>
                            <td className="px-4 py-3 text-white/60">{payment.payment_date ? new Date(payment.payment_date).toLocaleDateString('en-ZA') : '—'}</td>
                            <td className="px-4 py-3 font-medium text-white">{contact?.full_name || '—'}</td>
                            <td className="px-4 py-3 font-mono text-xs text-white/50">{invoice?.invoice_number || '—'}</td>
                            <td className="px-4 py-3 font-bold text-green-300">R {Number(payment.amount || 0).toFixed(2)}</td>
                            <td className="px-4 py-3"><span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium border ${METHOD_COLORS[payment.payment_method] || 'bg-white/10 text-white/50'}`}>{payment.payment_method}</span></td>
                            <td className="px-4 py-3 text-white/40 font-mono text-xs">{payment.reference || '—'}</td>
                            <td className="px-4 py-3">{receipt ? <button onClick={() => setSelectedReceipt(receipt)} className="text-xs text-orange-300 hover:underline font-medium">{receipt.receipt_number}</button> : <span className="text-white/20 text-xs">—</span>}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                )}
            </div>
          )}

          {/* Receipts Table */}
          {activeTab === 'receipts' && (
            <div className="rounded-2xl overflow-hidden" style={GLASS}>
              {loadingReceipts ? <div className="p-12 text-center text-white/40">Loading…</div>
                : filteredReceipts.length === 0 ? <div className="p-12 text-center text-white/40">No receipts yet</div>
                : (
                  <table className="w-full text-sm">
                    <thead><tr style={HEAD}>
                      {['Receipt #', 'Date', 'Client', 'Invoice', 'Amount Paid', 'Balance After', 'Method', 'Ack. Sent'].map(h => (
                        <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-white/40 uppercase tracking-wide">{h}</th>
                      ))}
                    </tr></thead>
                    <tbody>
                      {filteredReceipts.map(r => {
                        const contact = contactMap[r.contact_id];
                        return (
                          <tr key={r.id} className="border-b border-white/5 hover:bg-white/5 cursor-pointer transition-colors" onClick={() => setSelectedReceipt(r)}>
                            <td className="px-4 py-3 font-mono text-sm font-semibold text-orange-300">{r.receipt_number}</td>
                            <td className="px-4 py-3 text-white/60">{r.payment_date ? new Date(r.payment_date).toLocaleDateString('en-ZA') : '—'}</td>
                            <td className="px-4 py-3 font-medium text-white">{r.contact_snapshot?.full_name || contact?.full_name || '—'}</td>
                            <td className="px-4 py-3 font-mono text-xs text-white/50">{r.invoice_number}</td>
                            <td className="px-4 py-3 font-bold text-green-300">R {Number(r.amount_paid || 0).toFixed(2)}</td>
                            <td className={`px-4 py-3 font-medium ${(r.balance_after || 0) <= 0 ? 'text-green-300' : 'text-orange-300'}`}>{(r.balance_after || 0) <= 0 ? 'Settled' : `R ${Number(r.balance_after).toFixed(2)}`}</td>
                            <td className="px-4 py-3"><span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium border ${METHOD_COLORS[r.payment_method] || 'bg-white/10 text-white/50'}`}>{r.payment_method}</span></td>
                            <td className="px-4 py-3 text-xs">{r.acknowledgement_sent_at ? <span className="text-green-300">✓ {new Date(r.acknowledgement_sent_at).toLocaleDateString('en-ZA')}</span> : <span className="text-white/30">—</span>}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                )}
            </div>
          )}
        </div>
      </div>

      {showModal && <PaymentModal contacts={contacts} invoices={invoices} onClose={() => setShowModal(false)} onSaved={handleSaved} />}
      {selectedReceipt && <ReceiptDetailPanel receipt={selectedReceipt} onClose={() => setSelectedReceipt(null)} onUpdated={() => { queryClient.invalidateQueries({ queryKey: ['receipts'] }); setSelectedReceipt(null); }} />}
    </AdminLayout>
  );
}