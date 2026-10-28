import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { platform } from '@/api/platformClient';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import AdminLayout from '@/components/admin/AdminLayout';
import { Plus, Search, Send, Eye, Copy, FileText, TrendingUp, CheckCircle, XCircle, Clock, Filter, MoreVertical, Edit2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';
import QuoteDetailPanel from '@/components/admin/quotes/QuoteDetailPanel';
import CsvImportExport from '@/components/admin/CsvImportExport';

const STATUS_COLORS = {
  Draft: 'bg-gray-100 text-gray-700 border-gray-300',
  Sent: 'bg-blue-100 text-blue-700 border-blue-300',
  Delivered: 'bg-indigo-100 text-indigo-700 border-indigo-300',
  Opened: 'bg-sky-100 text-sky-700 border-sky-300',
  Viewed: 'bg-purple-100 text-purple-700 border-purple-300',
  Accepted: 'bg-green-100 text-green-700 border-green-300',
  Declined: 'bg-red-100 text-red-700 border-red-300',
  Expired: 'bg-orange-100 text-orange-700 border-orange-300',
  Converted: 'bg-teal-100 text-teal-700 border-teal-300',
  Paid: 'bg-emerald-100 text-emerald-700 border-emerald-300',
  Cancelled: 'bg-slate-100 text-slate-700 border-slate-300',
};

const STATUSES = ['Draft', 'Sent', 'Delivered', 'Opened', 'Viewed', 'Accepted', 'Declined', 'Expired', 'Converted', 'Paid', 'Cancelled'];

export default function AdminQuotes() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [dateRangeFilter, setDateRangeFilter] = useState('');
  const [selected, setSelected] = useState(null);
  const [sendingId, setSendingId] = useState(null);

  const { data: quotes = [], isLoading } = useQuery({
    queryKey: ['quotes'],
    queryFn: () => platform.entities.Quote.list('-created_date', 500),
  });

  const { data: contacts = [] } = useQuery({
    queryKey: ['contacts'],
    queryFn: () => platform.entities.Contact.list('-created_date', 500),
  });

  const contactMap = Object.fromEntries(contacts.map(c => [c.id, c]));

  const filtered = quotes.filter(q => {
    const s = search.toLowerCase();
    const c = contactMap[q.contact_id];
    const matchesSearch = !s || 
      q.quote_number?.toLowerCase().includes(s) || 
      q.book_title?.toLowerCase().includes(s) || 
      q.contact_snapshot?.full_name?.toLowerCase().includes(s) || 
      c?.full_name?.toLowerCase().includes(s);
    
    const matchesStatus = !statusFilter || q.status === statusFilter;
    
    let matchesDate = true;
    if (dateRangeFilter) {
      const now = new Date();
      const quoteDate = new Date(q.created_date);
      if (dateRangeFilter === 'today') matchesDate = quoteDate.toDateString() === now.toDateString();
      else if (dateRangeFilter === 'week') matchesDate = quoteDate >= new Date(now.setDate(now.getDate() - 7));
      else if (dateRangeFilter === 'month') matchesDate = quoteDate.getMonth() === now.getMonth() && quoteDate.getFullYear() === now.getFullYear();
    }
    
    return matchesSearch && matchesStatus && matchesDate;
  });

  const totalValue = quotes.reduce((s, q) => s + (q.total || 0), 0);
  const acceptedValue = quotes.filter(q => q.status === 'Accepted').reduce((s, q) => s + (q.total || 0), 0);
  const pendingCount = quotes.filter(q => ['Sent', 'Viewed', 'Opened', 'Delivered'].includes(q.status)).length;
  const acceptedCount = quotes.filter(q => q.status === 'Accepted').length;
  const declinedCount = quotes.filter(q => q.status === 'Declined').length;
  const closedCount = acceptedCount + declinedCount;
  const winRate = closedCount ? Math.round((acceptedCount / closedCount) * 100) : 0;

  const handleSend = async (quote, isResend = false, e) => {
    if (e) e.stopPropagation();
    const email = quote.contact_snapshot?.email || contactMap[quote.contact_id]?.email;
    if (!email) { toast.error('No email address on this contact — update the contact first.'); return; }
    if (!confirm(`${isResend ? 'Resend' : 'Send'} quote ${quote.quote_number} to ${email}?`)) return;
    setSendingId(quote.id);
    try {
      const res = await platform.functions.invoke('quoteActions', { action: 'send', quote_id: quote.id });
      if (res.data?.success) {
        queryClient.invalidateQueries({ queryKey: ['quotes'] });
        toast.success(`Quote ${quote.quote_number} ${isResend ? 'resent' : 'sent'} to ${email}`);
      } else {
        toast.error(res.data?.error || 'Failed to send quote.');
      }
    } catch (err) {
      toast.error(err?.response?.data?.error || err.message || 'Failed to send quote.');
    } finally {
      setSendingId(null);
    }
  };

  const handleDuplicate = async (quote, e) => {
    if (e) e.stopPropagation();
    const res = await platform.functions.invoke('quoteActions', { action: 'duplicate', quote_id: quote.id });
    if (res.data?.quote) {
      queryClient.invalidateQueries({ queryKey: ['quotes'] });
      toast.success('Quote duplicated');
      navigate(`/admin/quotes/${res.data.quote.id}`);
    }
  };

  const EXPORT_COLS = [
    { key: 'quote_number', label: 'Quote Number' },
    { key: '_contact_name', label: 'Client Name', render: q => contactMap[q.contact_id]?.full_name || q.contact_snapshot?.full_name || '' },
    { key: '_contact_email', label: 'Client Email', render: q => contactMap[q.contact_id]?.email || q.contact_snapshot?.email || '' },
    { key: 'book_title', label: 'Book Title' },
    { key: 'status', label: 'Status' },
    { key: 'total', label: 'Total (R)' },
    { key: 'valid_until', label: 'Valid Until' },
    { key: 'created_date', label: 'Created Date', render: q => q.created_date ? new Date(q.created_date).toLocaleDateString('en-ZA') : '' },
  ];

  const IMPORT_FIELDS = [
    { key: 'contact_email', label: 'Client Email', required: true },
    { key: 'book_title', label: 'Book Title' },
    { key: 'total', label: 'Total (R)' },
    { key: 'valid_until', label: 'Valid Until (YYYY-MM-DD)' },
    { key: 'notes', label: 'Notes' },
  ];

  const handleImportQuotes = async (rows) => {
    let created = 0, failed = 0;
    const errors = [];
    try {
      const allContacts = await platform.entities.Contact.list('-created_date', 500);
      const byEmail = {};
      allContacts.forEach(c => { byEmail[c.email?.toLowerCase()] = c; });
      const quotesMap = new Map();
      for (const row of rows) {
        const qn = (row['Estimate Number'] || row['Quote Number'] || '').trim();
        if (!qn) continue;
        if (!quotesMap.has(qn)) quotesMap.set(qn, []);
        quotesMap.get(qn).push(row);
      }
      for (const [quoteNum, lineItems] of quotesMap) {
        const firstRow = lineItems[0];
        let email = (firstRow['Primary Contact EmailID'] || firstRow['Customer Email'] || firstRow['Email'] || '').toLowerCase().trim();
        if (!email) { const n = firstRow['Customer Name'] || 'Unknown'; email = n.toLowerCase().replace(/[^a-z0-9]/g, '') + '@placeholder.local'; }
        let contact = byEmail[email];
        if (!contact) {
          try {
            contact = await platform.entities.Contact.create({ full_name: firstRow['Customer Name'] || email.split('@')[0], email, company: firstRow['Company Name'] || '', phone: firstRow['Phone'] || firstRow['Primary Contact Phone'] || '' });
            byEmail[email] = contact;
          } catch { failed++; continue; }
        }
        try {
          const existing = await platform.entities.Quote.filter({ quote_number: quoteNum });
          if (existing?.length > 0) { failed++; continue; }
          const total = parseFloat((firstRow['Total'] || firstRow['Amount'] || '0').replace(/,/g, '')) || 0;
          let validUntil = firstRow['Valid Until'] || firstRow['Expiry Date'] || null;
          if (validUntil) { const p = new Date(validUntil); validUntil = isNaN(p.getTime()) ? null : p.toISOString().split('T')[0]; }
          const items = lineItems.map(item => ({ description: item['Item Name'] || item['Description'] || 'Service', quantity: parseFloat(item['Quantity'] || '1'), unit_price: parseFloat(item['Rate'] || item['Item Price'] || '0'), line_total: parseFloat(item['Amount'] || item['Item Total'] || '0') }));
          const statusMap = { accepted: 'Accepted', declined: 'Declined', expired: 'Expired', sent: 'Sent', viewed: 'Viewed', opened: 'Opened', delivered: 'Delivered', draft: 'Draft' };
          const status = statusMap[(firstRow['Status'] || 'draft').toLowerCase()] || 'Draft';
          await platform.entities.Quote.create({ quote_number: quoteNum, contact_id: contact.id, book_title: firstRow['Project Name'] || firstRow['Subject'] || '', status, total, subtotal: total, valid_until: validUntil, notes: firstRow['Notes'] || firstRow['Terms'] || '', line_items: items, contact_snapshot: { full_name: firstRow['Customer Name'] || contact.full_name, email } });
          created++;
        } catch (error) { errors.push({ quote: quoteNum, error: error.message }); failed++; }
      }
      if (created > 0) queryClient.invalidateQueries({ queryKey: ['quotes'] });
      return { created, failed, errors: errors.slice(0, 20) };
    } catch (error) {
      return { created: 0, failed: rows.length, errors: [{ error: 'Import failed: ' + error.message }] };
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header - QuickBooks Style */}
        <div className="bg-gradient-to-r from-amber-700 to-amber-900 rounded-lg p-6 text-white shadow-md">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-2xl font-bold">Quotes & Estimates</h1>
              <p className="text-sm text-white/90 mt-0.5">Create, send, and track client quotes</p>
            </div>
            <div className="flex items-center gap-2">
              <CsvImportExport 
                data={filtered} 
                exportColumns={EXPORT_COLS} 
                exportFilename="quotes.csv" 
                importFields={IMPORT_FIELDS} 
                onImport={handleImportQuotes} 
                entityLabel="quotes" 
              />
              <Button onClick={() => navigate('/admin/quotes/new')} className="gap-2 bg-white text-amber-800 hover:bg-white/90 shadow-md">
                <Plus className="w-4 h-4" /> New Quote
              </Button>
            </div>
          </div>
        </div>

        {/* KPI Cards - QuickBooks Style */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="border-0 shadow-sm bg-gradient-to-br from-amber-50 to-amber-100">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-amber-700">Total Pipeline</p>
                  <p className="text-2xl font-bold text-amber-900 mt-1">R {totalValue.toLocaleString('en-ZA', { minimumFractionDigits: 2 })}</p>
                  <p className="text-xs text-amber-700 mt-1">All quotes</p>
                </div>
                <div className="w-12 h-12 rounded-full bg-amber-600 flex items-center justify-center shadow-lg">
                  <FileText className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm bg-gradient-to-br from-green-50 to-green-100">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-600">Accepted Revenue</p>
                  <p className="text-2xl font-bold text-green-900 mt-1">R {acceptedValue.toLocaleString('en-ZA', { minimumFractionDigits: 2 })}</p>
                  <p className="text-xs text-green-600 mt-1">{acceptedCount} quotes won</p>
                </div>
                <div className="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center shadow-lg">
                  <CheckCircle className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm bg-gradient-to-br from-orange-50 to-orange-100">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-orange-600">Pending</p>
                  <p className="text-2xl font-bold text-orange-900 mt-1">{pendingCount}</p>
                  <p className="text-xs text-orange-600 mt-1">Awaiting response</p>
                </div>
                <div className="w-12 h-12 rounded-full bg-orange-500 flex items-center justify-center shadow-lg">
                  <Clock className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm bg-gradient-to-br from-purple-50 to-purple-100">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-600">Win Rate</p>
                  <p className="text-2xl font-bold text-purple-900 mt-1">{winRate}%</p>
                  <p className="text-xs text-purple-600 mt-1">{acceptedCount} won / {declinedCount} lost</p>
                </div>
                <div className="w-12 h-12 rounded-full bg-purple-500 flex items-center justify-center shadow-lg">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters - QuickBooks Style */}
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="flex flex-wrap gap-3 items-center">
              <div className="relative flex-1 min-w-[280px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input 
                  placeholder="Search by quote number or client name..." 
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
              <select 
                value={dateRangeFilter} 
                onChange={e => setDateRangeFilter(e.target.value)} 
                className="h-10 px-4 rounded-md border border-gray-200 text-sm text-gray-700 bg-white hover:border-amber-400 transition-colors focus:outline-none focus:ring-2 focus:ring-amber-100"
              >
                <option value="">All Time</option>
                <option value="today">Today</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
              </select>
              {(search || statusFilter || dateRangeFilter) && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => { setSearch(''); setStatusFilter(''); setDateRangeFilter(''); }} 
                  className="text-gray-500 hover:text-gray-700"
                >
                  Clear all
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Quotes Table - QuickBooks Style */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          {isLoading ? (
            <div className="p-12 text-center text-gray-400">
              <div className="w-8 h-8 border-4 border-gray-200 border-t-amber-700 rounded-full animate-spin mx-auto mb-3"></div>
              Loading quotes…
            </div>
          ) : filtered.length === 0 ? (
            <div className="p-12 text-center text-gray-400">
              <div className="text-5xl mb-4">📄</div>
              <p className="text-lg font-semibold text-gray-700">No quotes found</p>
              <p className="text-sm text-gray-500 mt-1">Create your first quote to get started</p>
              <Button onClick={() => navigate('/admin/quotes/new')} className="mt-4 gap-2 bg-amber-700 hover:bg-amber-800">
                <Plus className="w-4 h-4" /> Create Quote
              </Button>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 bg-gradient-to-r from-amber-50 to-amber-100">
                  {['Quote #', 'Client', 'Amount', 'Status', 'Valid Until', 'Actions'].map(h => (
                    <th key={h} className="text-left px-6 py-3 text-xs font-semibold text-amber-800 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map(q => {
                  const contact = contactMap[q.contact_id] || q.contact_snapshot || {};
                  const isExpired = q.status === 'Sent' && q.valid_until && new Date(q.valid_until) < new Date();
                  const displayStatus = isExpired ? 'Expired' : q.status;
                  return (
                    <tr key={q.id} className="hover:bg-amber-50/50 transition-colors cursor-pointer group border-b border-gray-100 last:border-0" onClick={() => setSelected(q)}>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-amber-700 hover:text-amber-900">{q.quote_number}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900">{contact.full_name || '—'}</div>
                        <div className="text-xs text-gray-500">{contact.email || ''}</div>
                        {contact.company && <div className="text-xs text-gray-400">{contact.company}</div>}
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-bold text-gray-900">R {Number(q.total || 0).toLocaleString('en-ZA', { minimumFractionDigits: 2 })}</div>
                        {q.subtotal !== q.total && (
                          <div className="text-xs text-gray-500">Incl. VAT</div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <Badge className={`${STATUS_COLORS[displayStatus] || 'bg-gray-100 text-gray-700'} border-0 text-xs px-2.5 py-1 font-medium`}>
                          {displayStatus}
                        </Badge>
                      </td>
                      <td className="px-6 py-4">
                        <div className={isExpired ? 'text-red-600 font-medium' : 'text-gray-700'}>
                          {q.valid_until ? new Date(q.valid_until).toLocaleDateString('en-ZA') : '—'}
                        </div>
                        {isExpired && <div className="text-xs text-red-500 mt-0.5">Expired</div>}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
                          {q.status === 'Draft' && (
                            <button onClick={e => handleSend(q, false, e)} disabled={sendingId === q.id} className="p-2 hover:bg-green-100 rounded-md transition-colors" title="Send">
                              {sendingId === q.id ? <div className="w-4 h-4 border-2 border-green-600 border-t-transparent rounded-full animate-spin" /> : <Send className="w-4 h-4 text-green-600" />}
                            </button>
                          )}
                          {['Sent', 'Viewed', 'Opened', 'Delivered'].includes(q.status) && (
                            <button onClick={e => handleSend(q, true, e)} disabled={sendingId === q.id} className="p-2 hover:bg-amber-100 rounded-md transition-colors" title="Resend">
                              {sendingId === q.id ? <div className="w-4 h-4 border-2 border-amber-600 border-t-transparent rounded-full animate-spin" /> : <Send className="w-4 h-4 text-amber-600" />}
                            </button>
                          )}
                          <button onClick={e => { e.stopPropagation(); handleDuplicate(q, e); }} className="p-2 hover:bg-gray-100 rounded-md transition-colors" title="Duplicate">
                            <Copy className="w-4 h-4 text-gray-600" />
                          </button>
                          <button onClick={e => { e.stopPropagation(); window.open(`/quote/view/${q.id}/${q.view_token}`, '_blank'); }} className="p-2 hover:bg-gray-100 rounded-md transition-colors" title="View">
                            <Eye className="w-4 h-4 text-gray-600" />
                          </button>
                          <button onClick={e => { e.stopPropagation(); navigate(`/admin/quotes/${q.id}`); }} className="p-2 hover:bg-gray-100 rounded-md transition-colors" title="Edit">
                            <Edit2 className="w-4 h-4 text-gray-600" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {selected && (
        <QuoteDetailPanel
          quote={selected}
          contact={contactMap[selected.contact_id]}
          onClose={() => setSelected(null)}
          onUpdated={() => { queryClient.invalidateQueries({ queryKey: ['quotes'] }); setSelected(null); }}
          onDuplicate={handleDuplicate}
        />
      )}
    </AdminLayout>
  );
}