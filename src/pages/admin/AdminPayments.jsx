import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import AdminLayout from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Search, DollarSign, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import PaymentModal from '@/components/admin/payments/PaymentModal';

const METHOD_COLORS = {
  EFT: 'bg-blue-100 text-blue-700',
  Cash: 'bg-green-100 text-green-700',
  Card: 'bg-purple-100 text-purple-700',
  PayFast: 'bg-orange-100 text-orange-700',
  Other: 'bg-gray-100 text-gray-600',
};

const STATUS_COLORS = {
  Confirmed: 'bg-green-100 text-green-700',
  Pending: 'bg-yellow-100 text-yellow-700',
  Refunded: 'bg-red-100 text-red-700',
};

export default function AdminPayments() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [methodFilter, setMethodFilter] = useState('');
  const [showModal, setShowModal] = useState(false);

  const { data: payments = [], isLoading } = useQuery({
    queryKey: ['payments'],
    queryFn: () => base44.entities.Payment.list('-payment_date', 200),
  });

  const { data: contacts = [] } = useQuery({
    queryKey: ['contacts'],
    queryFn: () => base44.entities.Contact.list('-created_date', 500),
  });

  const { data: invoices = [] } = useQuery({
    queryKey: ['invoices'],
    queryFn: () => base44.entities.Invoice.list('-created_date', 500),
  });

  const contactMap = Object.fromEntries(contacts.map(c => [c.id, c]));
  const invoiceMap = Object.fromEntries(invoices.map(i => [i.id, i]));

  const filtered = payments.filter(p => {
    const q = search.toLowerCase();
    const contact = contactMap[p.contact_id];
    const invoice = invoiceMap[p.invoice_id];
    const matchSearch = !q || contact?.full_name?.toLowerCase().includes(q) || invoice?.invoice_number?.toLowerCase().includes(q) || p.reference?.toLowerCase().includes(q);
    const matchMethod = !methodFilter || p.payment_method === methodFilter;
    return matchSearch && matchMethod;
  });

  const totalConfirmed = payments.filter(p => p.status === 'Confirmed').reduce((sum, p) => sum + (p.amount || 0), 0);
  const totalThisMonth = payments.filter(p => {
    const d = new Date(p.payment_date);
    const now = new Date();
    return p.status === 'Confirmed' && d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }).reduce((sum, p) => sum + (p.amount || 0), 0);

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Payments</h1>
            <p className="text-sm text-gray-500 mt-0.5">Track all client payments and receipts</p>
          </div>
          <Button onClick={() => setShowModal(true)} className="gap-2 bg-[#B87333] hover:bg-[#A06828] text-white">
            <Plus className="w-4 h-4" /> Record Payment
          </Button>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl border border-gray-100 p-4">
            <p className="text-xs text-gray-500">Total Payments</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{payments.length}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 p-4">
            <p className="text-xs text-gray-500">Total Confirmed</p>
            <p className="text-2xl font-bold text-green-600 mt-1">R {totalConfirmed.toLocaleString()}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 p-4">
            <p className="text-xs text-gray-500">This Month</p>
            <p className="text-2xl font-bold text-blue-600 mt-1">R {totalThisMonth.toLocaleString()}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 p-4">
            <p className="text-xs text-gray-500">Pending</p>
            <p className="text-2xl font-bold text-yellow-600 mt-1">{payments.filter(p => p.status === 'Pending').length}</p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-[220px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input placeholder="Search by client, invoice #, reference…" value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
          </div>
          <select value={methodFilter} onChange={e => setMethodFilter(e.target.value)} className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white">
            <option value="">All Methods</option>
            {Object.keys(METHOD_COLORS).map(m => <option key={m} value={m}>{m}</option>)}
          </select>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          {isLoading ? (
            <div className="p-12 text-center text-gray-400">Loading payments…</div>
          ) : filtered.length === 0 ? (
            <div className="p-12 text-center">
              <DollarSign className="w-10 h-10 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No payments found</p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  {['Date', 'Client', 'Invoice', 'Amount', 'Method', 'Reference', 'Status', 'Proof'].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map(payment => {
                  const contact = contactMap[payment.contact_id];
                  const invoice = invoiceMap[payment.invoice_id];
                  return (
                    <tr key={payment.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 text-gray-600">
                        {payment.payment_date ? new Date(payment.payment_date).toLocaleDateString('en-ZA') : '—'}
                      </td>
                      <td className="px-4 py-3 font-medium text-gray-900">{contact?.full_name || '—'}</td>
                      <td className="px-4 py-3 font-mono text-xs text-gray-600">{invoice?.invoice_number || '—'}</td>
                      <td className="px-4 py-3 font-bold text-gray-900">R {(payment.amount || 0).toLocaleString()}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${METHOD_COLORS[payment.payment_method] || 'bg-gray-100 text-gray-600'}`}>
                          {payment.payment_method}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-500 font-mono text-xs">{payment.reference || '—'}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[payment.status] || 'bg-gray-100'}`}>
                          {payment.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {payment.proof_url ? (
                          <a href={payment.proof_url} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline text-xs">View</a>
                        ) : (
                          <span className="text-gray-300 text-xs">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {showModal && (
        <PaymentModal
          contacts={contacts}
          invoices={invoices}
          onClose={() => setShowModal(false)}
          onSaved={() => { queryClient.invalidateQueries({ queryKey: ['payments'] }); setShowModal(false); }}
        />
      )}
    </AdminLayout>
  );
}