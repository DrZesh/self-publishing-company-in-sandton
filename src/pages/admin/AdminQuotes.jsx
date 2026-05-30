import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import AdminLayout from '@/components/admin/AdminLayout';
import { Plus, Eye, Copy, Send, Search } from 'lucide-react';
import CsvImportExport from '@/components/admin/CsvImportExport';
import { toast } from 'sonner';

const STATUS_COLORS = {
  Draft: 'bg-gray-100 text-gray-600',
  Sent: 'bg-blue-100 text-blue-700',
  Delivered: 'bg-indigo-100 text-indigo-700',
  Opened: 'bg-sky-100 text-sky-700',
  Viewed: 'bg-purple-100 text-purple-700',
  Accepted: 'bg-emerald-100 text-emerald-700',
  Declined: 'bg-red-100 text-red-700',
  Expired: 'bg-orange-100 text-orange-700',
};

export default function AdminQuotes() {
  const [quotes, setQuotes] = useState([]);
  const [contacts, setContacts] = useState({});
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [sendingId, setSendingId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    Promise.all([
      base44.entities.Quote.list('-created_date', 200),
      base44.entities.Contact.list('-created_date', 500),
    ]).then(([qs, cs]) => {
      setQuotes(qs);
      const map = {};
      cs.forEach(c => { map[c.id] = c; });
      setContacts(map);
    }).finally(() => setLoading(false));
  }, []);

  const handleDuplicate = async (quoteId) => {
    const res = await base44.functions.invoke('quoteActions', { action: 'duplicate', quote_id: quoteId });
    if (res.data?.quote) {
      setQuotes(prev => [res.data.quote, ...prev]);
      toast.success('Quote duplicated');
      navigate(`/admin/quotes/${res.data.quote.id}`);
    }
  };

  const handleSend = async (quote) => {
    const email = quote.contact_snapshot?.email;
    if (!email) {
      toast.error('No email address on this contact — please update the contact first.');
      return;
    }
    if (!confirm(`Send quote ${quote.quote_number} to ${email}?`)) return;
    setSendingId(quote.id);
    try {
      const res = await base44.functions.invoke('quoteActions', { action: 'send', quote_id: quote.id });
      if (res.data?.success) {
        setQuotes(prev => prev.map(q => q.id === quote.id ? { ...q, status: 'Sent', sent_at: new Date().toISOString() } : q));
        toast.success(`✅ Quote ${quote.quote_number} sent to ${email}`);
      } else {
        toast.error(res.data?.error || 'Failed to send quote. Please try again.');
      }
    } catch (err) {
      toast.error(err?.response?.data?.error || err.message || 'Failed to send quote.');
    } finally {
      setSendingId(null);
    }
  };

  const handleResend = async (quote) => {
    const email = quote.contact_snapshot?.email;
    if (!email) {
      toast.error('No email address on this contact — please update the contact first.');
      return;
    }
    if (!confirm(`Resend quote ${quote.quote_number} to ${email}?`)) return;
    setSendingId(quote.id);
    try {
      const res = await base44.functions.invoke('quoteActions', { action: 'send', quote_id: quote.id });
      if (res.data?.success) {
        setQuotes(prev => prev.map(q => q.id === quote.id ? { ...q, status: 'Sent' } : q));
        toast.success(`✅ Quote ${quote.quote_number} resent to ${email}`);
      } else {
        toast.error(res.data?.error || 'Failed to resend quote. Please try again.');
      }
    } catch (err) {
      toast.error(err?.response?.data?.error || err.message || 'Failed to resend quote.');
    } finally {
      setSendingId(null);
    }
  };

  const statuses = ['Draft', 'Sent', 'Delivered', 'Opened', 'Viewed', 'Accepted', 'Declined', 'Expired'];

  const EXPORT_COLS = [
    { key: 'quote_number', label: 'Quote Number' },
    { key: '_contact_name', label: 'Client Name', render: q => contacts[q.contact_id]?.full_name || q.contact_snapshot?.full_name || '' },
    { key: '_contact_email', label: 'Client Email', render: q => contacts[q.contact_id]?.email || q.contact_snapshot?.email || '' },
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
    const allContacts = await base44.entities.Contact.list('-created_date', 500);
    const byEmail = {};
    allContacts.forEach(c => { byEmail[c.email?.toLowerCase()] = c; });
    for (const row of rows) {
      const email = row['Client Email']?.toLowerCase();
      if (!email) { failed++; continue; }
      try {
        const contact = byEmail[email];
        const num = 'Q-IMP-' + Date.now().toString().slice(-6);
        await base44.entities.Quote.create({
          quote_number: num,
          contact_id: contact?.id || '',
          contact_snapshot: contact ? { full_name: contact.full_name, email: contact.email } : { email },
          book_title: row['Book Title'] || '',
          total: row['Total (R)'] ? Number(row['Total (R)']) : 0,
          subtotal: row['Total (R)'] ? Number(row['Total (R)']) : 0,
          valid_until: row['Valid Until (YYYY-MM-DD)'] || '',
          notes: row['Notes'] || '',
          status: 'Draft',
          line_items: [],
        });
        created++;
      } catch { failed++; }
    }
    if (created > 0) {
      const qs = await base44.entities.Quote.list('-created_date', 200);
      setQuotes(qs);
    }
    return { created, failed };
  };

  const filtered = quotes.filter(q => {
    if (statusFilter !== 'all' && q.status !== statusFilter) return false;
    if (search) {
      const s = search.toLowerCase();
      const c = contacts[q.contact_id];
      return q.quote_number?.toLowerCase().includes(s)
        || q.contact_snapshot?.full_name?.toLowerCase().includes(s)
        || c?.full_name?.toLowerCase().includes(s);
    }
    return true;
  });

  const totals = {
    all: quotes.length,
    ...Object.fromEntries(statuses.map(s => [s, quotes.filter(q => q.status === s).length])),
  };

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-[#1A1208]">Quotes</h1>
            <p className="text-sm text-black/50 mt-1">{quotes.length} total quotes</p>
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
            <Link to="/admin/quotes/new"
              className="flex items-center gap-2 px-4 py-2.5 bg-[#B87333] text-white rounded-xl text-sm font-semibold hover:bg-[#a06428] transition-colors">
              <Plus className="w-4 h-4" /> New Quote
            </Link>
          </div>
        </div>

        <div className="flex gap-2 flex-wrap mb-4">
          <button onClick={() => setStatusFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${statusFilter === 'all' ? 'bg-[#1A1208] text-white' : 'bg-white border border-black/10 text-black/60 hover:border-[#B87333]'}`}>
            All ({totals.all})
          </button>
          {statuses.map(s => (
            <button key={s} onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${statusFilter === s ? 'bg-[#B87333] text-white' : 'bg-white border border-black/10 text-black/60 hover:border-[#B87333]'}`}>
              {s} ({totals[s] || 0})
            </button>
          ))}
        </div>

        <div className="relative mb-6">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-black/30" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search by quote number or contact name…"
            className="w-full pl-9 pr-4 py-2.5 border border-black/10 rounded-xl text-sm focus:outline-none focus:border-[#B87333] bg-white" />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Total Value', value: `R ${quotes.reduce((s, q) => s + (q.total || 0), 0).toLocaleString('en-ZA', { minimumFractionDigits: 2 })}` },
            { label: 'Accepted', value: `R ${quotes.filter(q => q.status === 'Accepted').reduce((s, q) => s + (q.total || 0), 0).toLocaleString('en-ZA', { minimumFractionDigits: 2 })}` },
            { label: 'Pending', value: quotes.filter(q => ['Sent', 'Viewed'].includes(q.status)).length },
            { label: 'Win Rate', value: quotes.filter(q => ['Accepted','Declined'].includes(q.status)).length ? `${Math.round(quotes.filter(q => q.status === 'Accepted').length / quotes.filter(q => ['Accepted','Declined'].includes(q.status)).length * 100)}%` : '—' },
          ].map(card => (
            <div key={card.label} className="bg-white rounded-2xl border border-black/8 p-4 shadow-sm">
              <div className="text-xs text-black/40 font-semibold uppercase tracking-wide mb-1">{card.label}</div>
              <div className="text-xl font-bold text-[#1A1208]">{card.value}</div>
            </div>
          ))}
        </div>

        {loading ? (
          <div className="space-y-2">{[...Array(5)].map((_, i) => <div key={i} className="h-14 bg-black/5 rounded-xl animate-pulse" />)}</div>
        ) : filtered.length === 0 ? (
          <div className="py-20 text-center">
            <div className="text-4xl mb-3">📄</div>
            <p className="text-sm font-semibold text-black/50">No quotes found</p>
            <Link to="/admin/quotes/new" className="mt-3 inline-block text-[#B87333] text-sm font-semibold hover:underline">Create your first quote →</Link>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-black/8 shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[#F9F7F2] border-b border-black/8">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-black/40 uppercase tracking-wide">Quote #</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-black/40 uppercase tracking-wide">Contact</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-black/40 uppercase tracking-wide hidden md:table-cell">Book Title</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-black/40 uppercase tracking-wide">Status</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-black/40 uppercase tracking-wide">Total</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-black/40 uppercase tracking-wide hidden lg:table-cell">Valid Until</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-black/40 uppercase tracking-wide hidden xl:table-cell">Created</th>
                  <th className="px-4 py-3 w-28" />
                </tr>
              </thead>
              <tbody>
                {filtered.map(q => {
                  const contact = contacts[q.contact_id] || q.contact_snapshot || {};
                  const isExpired = q.status === 'Sent' && q.valid_until && new Date(q.valid_until) < new Date();
                  return (
                    <tr key={q.id} className="border-b border-black/5 hover:bg-[#faf8f4] transition-colors">
                      <td className="px-4 py-3">
                        <Link to={`/admin/quotes/${q.id}`} className="font-bold text-[#B87333] hover:underline">{q.quote_number}</Link>
                        {q.mode === 'premium' && <span className="ml-1.5 text-[10px] px-1.5 py-0.5 bg-[#B87333]/10 text-[#B87333] rounded font-semibold">Premium</span>}
                      </td>
                      <td className="px-4 py-3">
                        <Link to={`/admin/contacts/detail?id=${q.contact_id}`} className="font-medium text-[#1A1208] hover:text-[#B87333] hover:underline" onClick={e => e.stopPropagation()}>{contact.full_name || '—'}</Link>
                        <div className="text-xs text-black/40">{contact.email || ''}</div>
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell text-xs text-black/60 max-w-[160px] truncate">{q.book_title || contact.book_title || '—'}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold ${STATUS_COLORS[isExpired ? 'Expired' : q.status] || 'bg-gray-100 text-gray-600'}`}>
                          {isExpired ? 'Expired' : q.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right font-semibold text-[#1A1208]">R {Number(q.total || 0).toLocaleString('en-ZA', { minimumFractionDigits: 2 })}</td>
                      <td className="px-4 py-3 text-xs text-black/50 hidden lg:table-cell">{q.valid_until || '—'}</td>
                      <td className="px-4 py-3 text-xs text-black/40 hidden xl:table-cell">{new Date(q.created_date).toLocaleDateString('en-ZA')}</td>
                      <td className="px-4 py-3">
                      <div className="flex items-center gap-1 justify-end">
                        <Link to={`/admin/quotes/${q.id}`} title="View" className="p-1.5 hover:bg-black/5 rounded-lg"><Eye className="w-4 h-4 text-black/40" /></Link>
                        {q.status === 'Draft' && (
                          <button
                            onClick={() => handleSend(q)}
                            title="Send quote"
                            disabled={sendingId === q.id}
                            className="p-1.5 hover:bg-black/5 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {sendingId === q.id
                              ? <div className="w-4 h-4 border-2 border-emerald-500/30 border-t-emerald-600 rounded-full animate-spin" />
                              : <Send className="w-4 h-4 text-emerald-600" />}
                          </button>
                        )}
                        {(q.status === 'Sent' || q.status === 'Viewed') && (
                          <button
                            onClick={() => handleResend(q)}
                            title="Resend quote"
                            disabled={sendingId === q.id}
                            className="p-1.5 hover:bg-black/5 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {sendingId === q.id
                              ? <div className="w-4 h-4 border-2 border-blue-400/30 border-t-blue-500 rounded-full animate-spin" />
                              : <Send className="w-4 h-4 text-blue-400" />}
                          </button>
                        )}
                        <button onClick={() => handleDuplicate(q.id)} title="Duplicate" className="p-1.5 hover:bg-black/5 rounded-lg"><Copy className="w-4 h-4 text-black/40" /></button>
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
    </AdminLayout>
  );
}