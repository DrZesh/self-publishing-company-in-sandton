import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { platform } from '@/api/platformClient';
import AdminLayout from '@/components/admin/AdminLayout';
import { Plus, Search, FileText, Eye, Send, Settings, Repeat, Bell, BarChart3, CheckSquare, MoreVertical, Edit2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import CsvImportExport from '@/components/admin/CsvImportExport';
import InvoiceModal from '@/components/admin/invoices/InvoiceModal';
import InvoiceDetailPanel from '@/components/admin/invoices/InvoiceDetailPanel';
import InvoiceKpiCards from '@/components/admin/invoices/InvoiceKpiCards';
import InvoiceAutomationSettings from '@/components/admin/invoices/InvoiceAutomationSettings';
import RecurringInvoiceModal from '@/components/admin/invoices/RecurringInvoiceModal';
import CreditNoteModal from '@/components/admin/invoices/CreditNoteModal';
import InvoiceAnalytics from '@/components/admin/invoices/InvoiceAnalytics';
import InvoiceBulkActions from '@/components/admin/invoices/InvoiceBulkActions';
import InvoiceSettings from '@/components/admin/invoices/InvoiceSettings';
import SendReminderModal from '@/components/admin/invoices/SendReminderModal';
import { toast } from 'sonner';

const STATUS_COLORS = {
  Draft: 'bg-gray-100 text-gray-700 border-gray-300',
  Sent: 'bg-blue-100 text-blue-700 border-blue-300',
  'Partially Paid': 'bg-yellow-100 text-yellow-700 border-yellow-300',
  Paid: 'bg-green-100 text-green-700 border-green-300',
  Overdue: 'bg-red-100 text-red-700 border-red-300',
};

const STATUSES = ['Draft', 'Sent', 'Partially Paid', 'Paid', 'Overdue'];

export default function AdminInvoices() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selected, setSelected] = useState(null);
  const [sendingId, setSendingId] = useState(null);
  const [showAutomation, setShowAutomation] = useState(false);
  const [showRecurring, setShowRecurring] = useState(false);
  const [showCreditNote, setShowCreditNote] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showReminder, setShowReminder] = useState(false);
  const [selectedInvoices, setSelectedInvoices] = useState([]);
  const [reminderInvoice, setReminderInvoice] = useState(null);

  const { data: invoices = [], isLoading } = useQuery({ queryKey: ['invoices'], queryFn: () => platform.entities.Invoice.list('-created_date', 200) });
  const { data: contacts = [] } = useQuery({ queryKey: ['contacts'], queryFn: () => platform.entities.Contact.list('-created_date', 500) });
  const contactMap = Object.fromEntries(contacts.map(c => [c.id, c]));

  const filtered = invoices.filter(inv => {
    const q = search.toLowerCase();
    const contact = contactMap[inv.contact_id];
    return (!q || inv.invoice_number?.toLowerCase().includes(q) || inv.book_title?.toLowerCase().includes(q) || contact?.full_name?.toLowerCase().includes(q))
      && (!statusFilter || inv.status === statusFilter);
  });

  const totalOutstanding = invoices.filter(i => !['Paid', 'Cancelled', 'Refunded'].includes(i.status)).reduce((s, i) => s + (i.balance_due || 0), 0);
  const totalPaid = invoices.filter(i => i.status === 'Paid').reduce((s, i) => s + (i.total || 0), 0);
  const overdueCount = invoices.filter(i => i.status === 'Overdue').length;

  const EXPORT_COLS = [
    { key: 'invoice_number', label: 'Invoice Number' },
    { key: '_client', label: 'Client Name', render: inv => contactMap[inv.contact_id]?.full_name || '' },
    { key: '_email', label: 'Client Email', render: inv => contactMap[inv.contact_id]?.email || '' },
    { key: 'book_title', label: 'Book Title' },
    { key: 'status', label: 'Status' },
    { key: 'total', label: 'Total (R)' },
    { key: 'amount_paid', label: 'Amount Paid (R)' },
    { key: 'balance_due', label: 'Balance Due (R)' },
    { key: 'due_date', label: 'Due Date' },
    { key: 'created_date', label: 'Created Date', render: inv => inv.created_date ? new Date(inv.created_date).toLocaleDateString('en-ZA') : '' },
  ];

  const IMPORT_FIELDS = [
    { key: 'contact_email', label: 'Client Email', required: true },
    { key: 'invoice_number', label: 'Invoice Number' },
    { key: 'book_title', label: 'Book Title' },
    { key: 'total', label: 'Total (R)' },
    { key: 'due_date', label: 'Due Date (YYYY-MM-DD)' },
    { key: 'notes', label: 'Notes' },
  ];

  const handleSendInvoice = async (invoice) => {
    const email = invoice.contact_snapshot?.email || contactMap[invoice.contact_id]?.email;
    if (!email) { toast.error('No email address on this contact — please update the contact first.'); return; }
    if (!confirm(`Send invoice ${invoice.invoice_number} to ${email}?`)) return;
    setSendingId(invoice.id);
    try {
      const res = await platform.functions.invoke('invoiceActions', { action: 'send', invoice_id: invoice.id });
      if (res.data?.success) { queryClient.invalidateQueries({ queryKey: ['invoices'] }); toast.success(`✅ Invoice ${invoice.invoice_number} sent to ${email}`); }
      else toast.error(res.data?.error || 'Failed to send invoice.');
    } catch (err) { toast.error(err?.response?.data?.error || err.message || 'Failed to send invoice.'); }
    finally { setSendingId(null); }
  };

  const handleImportInvoices = async (rows) => {
    let created = 0, failed = 0;
    try {
      const allContacts = await platform.entities.Contact.list('-created_date', 500);
      const byEmail = {};
      allContacts.forEach(c => { byEmail[c.email?.toLowerCase()] = c; });
      const isZohoFormat = rows[0] && ('Invoice Status' in rows[0] || 'Primary Contact EmailID' in rows[0]);
      if (!isZohoFormat) {
        for (const row of rows) {
          const email = (row['Client Email'] || row['email'] || '').toLowerCase().trim();
          const invoiceNum = (row['Invoice Number'] || row['invoice_number'] || '').trim();
          if (!email) { failed++; continue; }
          let contact = byEmail[email];
          if (!contact) { try { contact = await platform.entities.Contact.create({ full_name: row['Client Name'] || email.split('@')[0], email }); byEmail[email] = contact; } catch { failed++; continue; } }
          try {
            const existing = await platform.entities.Invoice.filter({ invoice_number: invoiceNum });
            if (existing?.length > 0) { failed++; continue; }
            const total = parseFloat(String(row['Total (R)'] || row['total'] || '0').replace(/,/g, '')) || 0;
            let dueDate = row['Due Date (YYYY-MM-DD)'] || row['due_date'] || null;
            if (dueDate) { const p = new Date(dueDate); dueDate = isNaN(p.getTime()) ? null : p.toISOString().split('T')[0]; }
            await platform.entities.Invoice.create({ invoice_number: invoiceNum || `INV-${Date.now()}`, contact_id: contact.id, book_title: row['Book Title'] || '', status: 'Sent', total, subtotal: total, vat_amount: 0, amount_paid: 0, balance_due: total, due_date: dueDate, notes: row['Notes'] || '', line_items: [{ description: row['Book Title'] || 'Service', quantity: 1, unit_price: total, line_total: total }], contact_snapshot: { full_name: contact.full_name, email } });
            created++;
          } catch { failed++; }
        }
      } else {
        const invoicesMap = new Map();
        for (const row of rows) { const n = (row['Invoice Number'] || row['Invoice ID'] || '').trim(); if (!n) continue; if (!invoicesMap.has(n)) invoicesMap.set(n, []); invoicesMap.get(n).push(row); }
        for (const [invNum, lineItems] of invoicesMap) {
          const firstRow = lineItems[0];
          const email = (firstRow['Primary Contact EmailID'] || firstRow['Email'] || '').toLowerCase().trim();
          if (!email) { failed++; continue; }
          let contact = byEmail[email];
          if (!contact) { try { contact = await platform.entities.Contact.create({ full_name: firstRow['Customer Name'] || email.split('@')[0], email, company: firstRow['Company Name'] || '' }); byEmail[email] = contact; } catch { failed++; continue; } }
          const total = parseFloat(String(firstRow['Total'] || '0').replace(/,/g, '')) || 0;
          const balance = parseFloat(String(firstRow['Balance'] || '0').replace(/,/g, '')) || 0;
          const items = lineItems.map(item => ({ description: item['Item Name'] || '', quantity: parseFloat(item['Quantity'] || '1'), unit_price: parseFloat(item['Item Price'] || '0'), line_total: parseFloat(item['Item Total'] || '0') }));
          await platform.entities.Invoice.create({ invoice_number: invNum, contact_id: contact.id, total, subtotal: items.reduce((s, i) => s + i.line_total, 0), vat_amount: total - items.reduce((s, i) => s + i.line_total, 0), amount_paid: total - balance, balance_due: balance, line_items: items, contact_snapshot: { full_name: contact.full_name, email } });
          created++;
        }
      }
      if (created > 0) queryClient.invalidateQueries({ queryKey: ['invoices'] });
      return { created, failed, errors: [] };
    } catch (error) { return { created: 0, failed: rows.length, errors: [{ error: error.message }] }; }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header - QuickBooks Style */}
        <div className="bg-gradient-to-r from-amber-700 to-amber-900 rounded-lg p-6 text-white shadow-md">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-2xl font-bold">Invoices</h1>
              <p className="text-sm text-white/90 mt-0.5">Generate and track client invoices</p>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <Button variant="outline" size="sm" onClick={() => setShowSettings(true)} className="text-white border-white/20 hover:bg-white/10">
                <Settings className="w-4 h-4" /> Settings
              </Button>
              <Button variant="outline" size="sm" onClick={() => setShowAnalytics(true)} className="text-white border-white/20 hover:bg-white/10">
                <BarChart3 className="w-4 h-4" /> Analytics
              </Button>
              {selectedInvoices.length > 0 && (
                <Button variant="outline" size="sm" onClick={() => setShowBulkActions(true)} className="text-white border-white/20 hover:bg-white/10">
                  <CheckSquare className="w-4 h-4" /> {selectedInvoices.length} Selected
                </Button>
              )}
              <Button variant="outline" size="sm" onClick={() => setShowAutomation(true)} className="text-white border-white/20 hover:bg-white/10">
                <Bell className="w-4 h-4" /> Automation
              </Button>
              <Button variant="outline" size="sm" onClick={() => setShowRecurring(true)} className="text-white border-white/20 hover:bg-white/10">
                <Repeat className="w-4 h-4" /> Recurring
              </Button>
              <CsvImportExport 
                data={filtered} 
                exportColumns={EXPORT_COLS} 
                exportFilename="invoices.csv" 
                importFields={IMPORT_FIELDS} 
                onImport={handleImportInvoices} 
                entityLabel="invoices" 
              />
              <Link to="/admin/invoices/new">
                <Button className="gap-2 bg-white text-amber-800 hover:bg-white/90 shadow-md">
                  <Plus className="w-4 h-4" /> New Invoice
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* KPI Cards - QuickBooks Style */}
        <InvoiceKpiCards invoices={invoices} />

        {/* Filters - QuickBooks Style */}
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="flex flex-wrap gap-3 items-center">
              <div className="relative flex-1 min-w-[280px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input 
                  placeholder="Search by invoice number or client name..." 
                  value={search} 
                  onChange={e => setSearch(e.target.value)} 
                  className="pl-9 h-10 border-gray-200 focus:border-amber-400"
                />
              </div>
              <select 
                value={statusFilter} 
                onChange={e => setStatusFilter(e.target.value)} 
                className="h-10 px-4 rounded-md border border-gray-200 text-sm text-gray-700 bg-white hover:border-amber-400 transition-colors focus:outline-none focus:ring-2 focus:ring-amber-100"
              >
                <option value="">All Statuses</option>
                {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              {(search || statusFilter) && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => { setSearch(''); setStatusFilter(''); }} 
                  className="text-gray-500 hover:text-gray-700"
                >
                  Clear all
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Invoices Table - QuickBooks Style */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          {isLoading ? (
            <div className="p-12 text-center text-gray-400">
              <div className="w-8 h-8 border-4 border-gray-200 border-t-amber-700 rounded-full animate-spin mx-auto mb-3"></div>
              Loading invoices…
            </div>
          ) : filtered.length === 0 ? (
            <div className="p-12 text-center text-gray-400">
              <div className="text-5xl mb-4">📄</div>
              <p className="text-lg font-semibold text-gray-700">No invoices found</p>
              <p className="text-sm text-gray-500 mt-1">Create your first invoice to get started</p>
              <Link to="/admin/invoices/new">
                <Button className="mt-4 gap-2 bg-amber-700 hover:bg-amber-800">
                  <Plus className="w-4 h-4" /> Create Invoice
                </Button>
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[900px]">
                <thead>
                  <tr className="border-b border-gray-200 bg-gradient-to-r from-amber-50 to-amber-100">
                    <th className="text-left px-6 py-3 text-xs font-semibold text-amber-800 uppercase tracking-wide">Invoice #</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-amber-800 uppercase tracking-wide">Client</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-amber-800 uppercase tracking-wide hidden md:table-cell">Book Title</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-amber-800 uppercase tracking-wide">Total</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-amber-800 uppercase tracking-wide">Balance Due</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-amber-800 uppercase tracking-wide hidden sm:table-cell">Due Date</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-amber-800 uppercase tracking-wide">Status</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-amber-800 uppercase tracking-wide">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filtered.map(inv => {
                    const contact = contactMap[inv.contact_id];
                    const isOverdue = inv.due_date && new Date(inv.due_date) < new Date() && !['Paid', 'Cancelled'].includes(inv.status);
                    return (
                      <tr key={inv.id} className="hover:bg-amber-50/50 transition-colors cursor-pointer group border-b border-gray-100 last:border-0" onClick={() => setSelected(inv)}>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-amber-700 hover:text-amber-900">{inv.invoice_number}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <Link to={`/admin/contacts/detail?id=${inv.contact_id}`} className="font-medium text-gray-900 hover:text-amber-700" onClick={e => e.stopPropagation()}>
                            {contact?.full_name || '—'}
                          </Link>
                          <div className="text-xs text-gray-500 truncate max-w-[150px]">{contact?.email || ''}</div>
                          {contact?.company && <div className="text-xs text-gray-400 truncate max-w-[150px]">{contact.company}</div>}
                        </td>
                        <td className="px-6 py-4 hidden md:table-cell">
                          <div className="text-gray-700 truncate max-w-[200px]">{inv.book_title || '—'}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="font-bold text-gray-900">R {(inv.total || 0).toLocaleString('en-ZA', { minimumFractionDigits: 2 })}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className={`font-medium ${(inv.balance_due || 0) > 0 ? 'text-red-600' : 'text-gray-500'}`}>
                            R {(inv.balance_due || 0).toLocaleString('en-ZA', { minimumFractionDigits: 2 })}
                          </div>
                        </td>
                        <td className="px-6 py-4 hidden sm:table-cell">
                          <div className={isOverdue ? 'text-red-600 font-medium' : 'text-gray-700'}>
                            {inv.due_date ? new Date(inv.due_date).toLocaleDateString('en-ZA') : '—'}
                          </div>
                          {isOverdue && <div className="text-xs text-red-500 mt-0.5">Overdue</div>}
                        </td>
                        <td className="px-6 py-4">
                          <Badge className={`${STATUS_COLORS[inv.status] || 'bg-gray-100 text-gray-700'} border-0 text-xs px-2.5 py-1 font-medium`}>
                            {inv.status}
                          </Badge>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity" onClick={e => e.stopPropagation()}>
                            {inv.status === 'Draft' && (
                              <button onClick={e => { e.stopPropagation(); handleSendInvoice(inv); }} disabled={sendingId === inv.id} className="p-2 hover:bg-green-100 rounded-md transition-colors" title="Send">
                                {sendingId === inv.id ? <div className="w-4 h-4 border-2 border-green-600 border-t-transparent rounded-full animate-spin" /> : <Send className="w-4 h-4 text-green-600" />}
                              </button>
                            )}
                            {['Sent', 'Partially Paid'].includes(inv.status) && (
                              <button onClick={e => { e.stopPropagation(); handleSendInvoice(inv); }} disabled={sendingId === inv.id} className="p-2 hover:bg-amber-100 rounded-md transition-colors" title="Resend">
                                {sendingId === inv.id ? <div className="w-4 h-4 border-2 border-amber-600 border-t-transparent rounded-full animate-spin" /> : <Send className="w-4 h-4 text-amber-600" />}
                              </button>
                            )}
                            <Link to={`/admin/invoices/${inv.id}`} onClick={e => e.stopPropagation()}>
                              <button className="p-2 hover:bg-gray-100 rounded-md transition-colors" title="Edit in Builder">
                                <Edit2 className="w-4 h-4 text-gray-600" />
                              </button>
                            </Link>
                            <button onClick={e => { e.stopPropagation(); setSelected(inv); }} className="p-2 hover:bg-gray-100 rounded-md transition-colors" title="View">
                              <Eye className="w-4 h-4 text-gray-600" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {showModal && <InvoiceModal contacts={contacts} onClose={() => setShowModal(false)} onSaved={() => { queryClient.invalidateQueries({ queryKey: ['invoices'] }); setShowModal(false); }} />}
      {selected && <InvoiceDetailPanel invoice={selected} contact={contactMap[selected.contact_id]} onClose={() => setSelected(null)} onUpdated={() => { queryClient.invalidateQueries({ queryKey: ['invoices'] }); setSelected(null); }} />}
      {showAutomation && <InvoiceAutomationSettings onClose={() => setShowAutomation(false)} onSaved={() => setShowAutomation(false)} />}
      {showRecurring && <RecurringInvoiceModal contacts={contacts} onClose={() => setShowRecurring(false)} onSaved={() => { queryClient.invalidateQueries({ queryKey: ['invoices'] }); setShowRecurring(false); }} />}
      {showAnalytics && <InvoiceAnalytics invoices={invoices} contacts={contacts} onClose={() => setShowAnalytics(false)} />}
      {showBulkActions && <InvoiceBulkActions invoiceIds={selectedInvoices} onClose={() => { setShowBulkActions(false); setSelectedInvoices([]); }} onCompleted={() => { queryClient.invalidateQueries({ queryKey: ['invoices'] }); setShowBulkActions(false); setSelectedInvoices([]); }} />}
      {showSettings && <InvoiceSettings onClose={() => setShowSettings(false)} onSaved={() => setShowSettings(false)} />}
      {showReminder && reminderInvoice && <SendReminderModal invoice={reminderInvoice} contact={contactMap[reminderInvoice.contact_id]} onClose={() => { setShowReminder(false); setReminderInvoice(null); }} onSent={() => { setShowReminder(false); setReminderInvoice(null); toast.success('Payment reminder sent!'); }} />}
    </AdminLayout>
  );
}