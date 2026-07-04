import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import AdminLayout from '@/components/admin/AdminLayout';
import { Plus, Eye, Copy, Send, Search, Receipt } from 'lucide-react';
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
  const [convertingId, setConvertingId] = useState(null);
  const navigate = useNavigate();

  const loadQuotes = async () => {
    const [quoteData, contactData] = await Promise.all([
      base44.entities.Quote.list('-created_date', 200),
      base44.entities.Contact.list('-created_date', 500),
    ]);

    setQuotes(quoteData);
    setContacts(Object.fromEntries(contactData.map(contact => [contact.id, contact])));
  };

  useEffect(() => {
    loadQuotes()
      .catch(error => {
        console.error('Failed to load quotes:', error);
        toast.error('Failed to load quotes');
      })
      .finally(() => setLoading(false));
  }, []);

  const handleDuplicate = async quoteId => {
    try {
      const result = await base44.functions.invoke('quoteActions', {
        action: 'duplicate',
        quote_id: quoteId,
      });

      if (result.data?.quote) {
        setQuotes(previous => [result.data.quote, ...previous]);
        toast.success('Quote duplicated');
        navigate(`/admin/quotes/new?quote_id=${result.data.quote.id}`);
      }
    } catch (error) {
      toast.error(error.message || 'Failed to duplicate quote');
    }
  };

  const handleSend = async quote => {
    const email = quote.contact_snapshot?.email;
    if (!email) {
      toast.error('No email address on this contact. Please update the contact first.');
      return;
    }

    if (!confirm(`Send quote ${quote.quote_number} to ${email}?`)) return;

    setSendingId(quote.id);

    try {
      const result = await base44.functions.invoke('quoteActions', {
        action: 'send',
        quote_id: quote.id,
      });

      if (result.data?.success) {
        setQuotes(previous => previous.map(item => item.id === quote.id
          ? { ...item, status: 'Sent', sent_at: new Date().toISOString() }
          : item));
        toast.success(`Quote ${quote.quote_number} sent to ${email}`);
      } else {
        toast.error(result.data?.error || 'Failed to send quote.');
      }
    } catch (error) {
      toast.error(error.message || 'Failed to send quote.');
    } finally {
      setSendingId(null);
    }
  };

  const handleConvertToInvoice = async quote => {
    setConvertingId(quote.id);

    try {
      const result = await base44.functions.invoke('quoteActions', {
        action: 'convert_to_invoice',
        quote_id: quote.id,
      });

      if (result.data?.invoice) {
        toast.success(`Invoice ${result.data.invoice.invoice_number} is ready`);
        navigate('/admin/invoices');
      }
    } catch (error) {
      toast.error(error.message || 'Failed to create invoice from quote');
    } finally {
      setConvertingId(null);
    }
  };

  const statuses = ['Draft', 'Sent', 'Delivered', 'Opened', 'Viewed', 'Accepted', 'Declined', 'Expired'];

  const exportColumns = [
    { key: 'quote_number', label: 'Quote Number' },
    { key: '_contact_name', label: 'Client Name', render: quote => contacts[quote.contact_id]?.full_name || quote.contact_snapshot?.full_name || '' },
    { key: '_contact_email', label: 'Client Email', render: quote => contacts[quote.contact_id]?.email || quote.contact_snapshot?.email || '' },
    { key: 'book_title', label: 'Book Title' },
    { key: 'status', label: 'Status' },
    { key: 'total', label: 'Total (R)' },
    { key: 'valid_until', label: 'Valid Until' },
    { key: 'created_date', label: 'Created Date', render: quote => quote.created_date ? new Date(quote.created_date).toLocaleDateString('en-ZA') : '' },
  ];

  const importFields = [
    { key: 'contact_email', label: 'Client Email', required: true },
    { key: 'book_title', label: 'Book Title' },
    { key: 'total', label: 'Total (R)' },
    { key: 'valid_until', label: 'Valid Until (YYYY-MM-DD)' },
    { key: 'notes', label: 'Notes' },
  ];

  const handleImportQuotes = async rows => {
    let created = 0;
    let failed = 0;
    const allContacts = await base44.entities.Contact.list('-created_date', 500);
    const byEmail = Object.fromEntries(
      allContacts
        .filter(contact => contact.email)
        .map(contact => [contact.email.toLowerCase(), contact])
    );

    for (const row of rows) {
      const email = row['Client Email']?.toLowerCase();
      if (!email) {
        failed += 1;
        continue;
      }

      try {
        const contact = byEmail[email];
        if (!contact) throw new Error('Contact not found');

        const total = row['Total (R)'] ? Number(row['Total (R)']) : 0;
        await base44.entities.Quote.create({
          quote_number: `Q-IMP-${Date.now().toString().slice(-6)}-${created + 1}`,
          contact_id: contact.id,
          contact_snapshot: {
            full_name: contact.full_name,
            email: contact.email,
            phone: contact.phone,
            company: contact.company,
          },
          book_title: row['Book Title'] || '',
          total,
          subtotal: total,
          valid_until: row['Valid Until (YYYY-MM-DD)'] || null,
          notes: row['Notes'] || '',
          status: 'Draft',
        });
        created += 1;
      } catch {
        failed += 1;
      }
    }

    if (created > 0) await loadQuotes();
    return { created, failed };
  };

  const filtered = quotes.filter(quote => {
    if (statusFilter !== 'all' && quote.status !== statusFilter) return false;

    if (search) {
      const query = search.toLowerCase();
      const contact = contacts[quote.contact_id];
      return quote.quote_number?.toLowerCase().includes(query)
        || quote.contact_snapshot?.full_name?.toLowerCase().includes(query)
        || contact?.full_name?.toLowerCase().includes(query);
    }

    return true;
  });

  const totals = {
    all: quotes.length,
    ...Object.fromEntries(statuses.map(status => [status, quotes.filter(quote => quote.status === status).length])),
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
              exportColumns={exportColumns}
              exportFilename="quotes.csv"
              importFields={importFields}
              onImport={handleImportQuotes}
              entityLabel="quotes"
            />
            <Link to="/admin/quotes/new" className="flex items-center gap-2 px-4 py-2.5 bg-[#B87333] text-white rounded-xl text-sm font-semibold hover:bg-[#a06428] transition-colors">
              <Plus className="w-4 h-4" /> New Quote
            </Link>
          </div>
        </div>

        <div className="flex gap-2 flex-wrap mb-4">
          <button onClick={() => setStatusFilter('all')} className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${statusFilter === 'all' ? 'bg-[#1A1208] text-white' : 'bg-white border border-black/10 text-black/60 hover:border-[#B87333]'}`}>
            All ({totals.all})
          </button>
          {statuses.map(status => (
            <button key={status} onClick={() => setStatusFilter(status)} className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${statusFilter === status ? 'bg-[#B87333] text-white' : 'bg-white border border-black/10 text-black/60 hover:border-[#B87333]'}`}>
              {status} ({totals[status] || 0})
            </button>
          ))}
        </div>

        <div className="relative mb-6">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-black/30" />
          <input value={search} onChange={event => setSearch(event.target.value)} placeholder="Search by quote number or contact name…" className="w-full pl-9 pr-4 py-2.5 border border-black/10 rounded-xl text-sm focus:outline-none focus:border-[#B87333] bg-white" />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Total Value', value: `R ${quotes.reduce((sum, quote) => sum + Number(quote.total || 0), 0).toLocaleString('en-ZA', { minimumFractionDigits: 2 })}` },
            { label: 'Accepted', value: `R ${quotes.filter(quote => quote.status === 'Accepted').reduce((sum, quote) => sum + Number(quote.total || 0), 0).toLocaleString('en-ZA', { minimumFractionDigits: 2 })}` },
            { label: 'Pending', value: quotes.filter(quote => ['Sent', 'Viewed'].includes(quote.status)).length },
            { label: 'Win Rate', value: quotes.filter(quote => ['Accepted', 'Declined'].includes(quote.status)).length ? `${Math.round(quotes.filter(quote => quote.status === 'Accepted').length / quotes.filter(quote => ['Accepted', 'Declined'].includes(quote.status)).length * 100)}%` : '—' },
          ].map(card => (
            <div key={card.label} className="bg-white rounded-2xl border border-black/8 p-4 shadow-sm">
              <div className="text-xs text-black/40 font-semibold uppercase tracking-wide mb-1">{card.label}</div>
              <div className="text-xl font-bold text-[#1A1208]">{card.value}</div>
            </div>
          ))}
        </div>

        {loading ? (
          <div className="space-y-2">{[...Array(5)].map((_, index) => <div key={index} className="h-14 bg-black/5 rounded-xl animate-pulse" />)}</div>
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
                  <th className="px-4 py-3 w-32" />
                </tr>
              </thead>
              <tbody>
                {filtered.map(quote => {
                  const contact = contacts[quote.contact_id] || quote.contact_snapshot || {};
                  const isExpired = quote.status === 'Sent' && quote.valid_until && new Date(quote.valid_until) < new Date();

                  return (
                    <tr key={quote.id} className="border-b border-black/5 hover:bg-[#faf8f4] transition-colors">
                      <td className="px-4 py-3">
                        <Link to={`/admin/quotes/new?quote_id=${quote.id}`} className="font-bold text-[#B87333] hover:underline">{quote.quote_number}</Link>
                        {quote.mode === 'premium' && <span className="ml-1.5 text-[10px] px-1.5 py-0.5 bg-[#B87333]/10 text-[#B87333] rounded font-semibold">Premium</span>}
                      </td>
                      <td className="px-4 py-3">
                        <Link to={`/admin/contacts/detail?id=${quote.contact_id}`} className="font-medium text-[#1A1208] hover:text-[#B87333] hover:underline" onClick={event => event.stopPropagation()}>{contact.full_name || '—'}</Link>
                        <div className="text-xs text-black/40">{contact.email || ''}</div>
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell text-xs text-black/60 max-w-[160px] truncate">{quote.book_title || contact.book_title || '—'}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold ${STATUS_COLORS[isExpired ? 'Expired' : quote.status] || 'bg-gray-100 text-gray-600'}`}>
                          {isExpired ? 'Expired' : quote.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right font-semibold text-[#1A1208]">R {Number(quote.total || 0).toLocaleString('en-ZA', { minimumFractionDigits: 2 })}</td>
                      <td className="px-4 py-3 text-xs text-black/50 hidden lg:table-cell">{quote.valid_until || '—'}</td>
                      <td className="px-4 py-3 text-xs text-black/40 hidden xl:table-cell">{new Date(quote.created_date).toLocaleDateString('en-ZA')}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1 justify-end">
                          <Link to={`/admin/quotes/new?quote_id=${quote.id}`} title="View or edit" className="p-1.5 hover:bg-black/5 rounded-lg"><Eye className="w-4 h-4 text-black/40" /></Link>
                          {quote.status === 'Draft' && (
                            <button onClick={() => handleSend(quote)} title="Send quote" disabled={sendingId === quote.id} className="p-1.5 hover:bg-black/5 rounded-lg disabled:opacity-50">
                              {sendingId === quote.id ? <div className="w-4 h-4 border-2 border-emerald-500/30 border-t-emerald-600 rounded-full animate-spin" /> : <Send className="w-4 h-4 text-emerald-600" />}
                            </button>
                          )}
                          {['Sent', 'Viewed'].includes(quote.status) && (
                            <button onClick={() => handleSend(quote)} title="Resend quote" disabled={sendingId === quote.id} className="p-1.5 hover:bg-black/5 rounded-lg disabled:opacity-50">
                              {sendingId === quote.id ? <div className="w-4 h-4 border-2 border-blue-400/30 border-t-blue-500 rounded-full animate-spin" /> : <Send className="w-4 h-4 text-blue-500" />}
                            </button>
                          )}
                          {quote.status === 'Accepted' && (
                            <button onClick={() => handleConvertToInvoice(quote)} title="Create invoice" disabled={convertingId === quote.id} className="p-1.5 hover:bg-black/5 rounded-lg disabled:opacity-50">
                              {convertingId === quote.id ? <div className="w-4 h-4 border-2 border-amber-400/30 border-t-amber-600 rounded-full animate-spin" /> : <Receipt className="w-4 h-4 text-amber-600" />}
                            </button>
                          )}
                          <button onClick={() => handleDuplicate(quote.id)} title="Duplicate" className="p-1.5 hover:bg-black/5 rounded-lg"><Copy className="w-4 h-4 text-black/40" /></button>
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
