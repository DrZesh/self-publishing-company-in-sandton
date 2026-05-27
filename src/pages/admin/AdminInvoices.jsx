import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import AdminLayout from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Link } from 'react-router-dom';
import { Plus, Search, FileText, Download } from 'lucide-react';
import InvoiceModal from '@/components/admin/invoices/InvoiceModal';
import InvoiceDetailPanel from '@/components/admin/invoices/InvoiceDetailPanel';

const STATUS_COLORS = {
  'Draft': 'bg-gray-100 text-gray-600',
  'Sent': 'bg-blue-100 text-blue-700',
  'Viewed': 'bg-cyan-100 text-cyan-700',
  'Partially Paid': 'bg-yellow-100 text-yellow-700',
  'Paid': 'bg-green-100 text-green-700',
  'Overdue': 'bg-red-100 text-red-700',
  'Cancelled': 'bg-gray-200 text-gray-500',
  'Refunded': 'bg-purple-100 text-purple-700',
};

export default function AdminInvoices() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selected, setSelected] = useState(null);

  const { data: invoices = [], isLoading } = useQuery({
    queryKey: ['invoices'],
    queryFn: () => base44.entities.Invoice.list('-created_date', 200),
  });

  const { data: contacts = [] } = useQuery({
    queryKey: ['contacts'],
    queryFn: () => base44.entities.Contact.list('-created_date', 500),
  });

  const contactMap = Object.fromEntries(contacts.map(c => [c.id, c]));

  const filtered = invoices.filter(inv => {
    const q = search.toLowerCase();
    const contact = contactMap[inv.contact_id];
    const matchSearch = !q || inv.invoice_number?.toLowerCase().includes(q) || inv.book_title?.toLowerCase().includes(q) || contact?.full_name?.toLowerCase().includes(q);
    const matchStatus = !statusFilter || inv.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const totalOutstanding = invoices.filter(i => !['Paid', 'Cancelled', 'Refunded'].includes(i.status)).reduce((sum, i) => sum + (i.balance_due || 0), 0);
  const totalPaid = invoices.filter(i => i.status === 'Paid').reduce((sum, i) => sum + (i.total || 0), 0);
  const overdueCount = invoices.filter(i => i.status === 'Overdue').length;

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Invoices</h1>
            <p className="text-sm text-gray-500 mt-0.5">Generate and track client invoices</p>
          </div>
          <Button onClick={() => setShowModal(true)} className="gap-2 bg-[#B87333] hover:bg-[#A06828] text-white">
            <Plus className="w-4 h-4" /> New Invoice
          </Button>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl border border-gray-100 p-4">
            <p className="text-xs text-gray-500">Total Invoices</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{invoices.length}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 p-4">
            <p className="text-xs text-gray-500">Total Collected</p>
            <p className="text-2xl font-bold text-green-600 mt-1">R {totalPaid.toLocaleString()}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 p-4">
            <p className="text-xs text-gray-500">Outstanding</p>
            <p className="text-2xl font-bold text-orange-600 mt-1">R {totalOutstanding.toLocaleString()}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 p-4">
            <p className="text-xs text-gray-500">Overdue</p>
            <p className="text-2xl font-bold text-red-600 mt-1">{overdueCount}</p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-[220px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input placeholder="Search by invoice #, client, title…" value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
          </div>
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white">
            <option value="">All Statuses</option>
            {Object.keys(STATUS_COLORS).map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          {isLoading ? (
            <div className="p-12 text-center text-gray-400">Loading invoices…</div>
          ) : filtered.length === 0 ? (
            <div className="p-12 text-center">
              <FileText className="w-10 h-10 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No invoices found</p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  {['Invoice #', 'Client', 'Book Title', 'Total', 'Balance Due', 'Due Date', 'Status', ''].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map(inv => {
                  const contact = contactMap[inv.contact_id];
                  const isOverdue = inv.due_date && new Date(inv.due_date) < new Date() && !['Paid', 'Cancelled'].includes(inv.status);
                  return (
                    <tr key={inv.id} className="hover:bg-gray-50 transition-colors cursor-pointer" onClick={() => setSelected(inv)}>
                      <td className="px-4 py-3 font-mono text-sm text-gray-700">{inv.invoice_number}</td>
                      <td className="px-4 py-3"><Link to={`/admin/contacts/detail?id=${inv.contact_id}`} className="text-gray-700 hover:text-[#B87333] hover:underline" onClick={e => e.stopPropagation()}>{contact?.full_name || '—'}</Link></td>
                      <td className="px-4 py-3 text-gray-600">{inv.book_title || '—'}</td>
                      <td className="px-4 py-3 font-medium text-gray-900">R {(inv.total || 0).toLocaleString()}</td>
                      <td className={`px-4 py-3 font-medium ${(inv.balance_due || 0) > 0 ? 'text-orange-600' : 'text-gray-400'}`}>
                        R {(inv.balance_due || 0).toLocaleString()}
                      </td>
                      <td className={`px-4 py-3 text-sm ${isOverdue ? 'text-red-600 font-medium' : 'text-gray-600'}`}>
                        {inv.due_date ? new Date(inv.due_date).toLocaleDateString('en-ZA') : '—'}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[inv.status] || 'bg-gray-100 text-gray-600'}`}>
                          {inv.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <Button variant="ghost" size="sm" onClick={e => { e.stopPropagation(); setSelected(inv); }}>
                          <Download className="w-4 h-4" />
                        </Button>
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
        <InvoiceModal
          contacts={contacts}
          onClose={() => setShowModal(false)}
          onSaved={() => { queryClient.invalidateQueries({ queryKey: ['invoices'] }); setShowModal(false); }}
        />
      )}

      {selected && (
        <InvoiceDetailPanel
          invoice={selected}
          contact={contactMap[selected.contact_id]}
          onClose={() => setSelected(null)}
          onUpdated={() => { queryClient.invalidateQueries({ queryKey: ['invoices'] }); setSelected(null); }}
        />
      )}
    </AdminLayout>
  );
}