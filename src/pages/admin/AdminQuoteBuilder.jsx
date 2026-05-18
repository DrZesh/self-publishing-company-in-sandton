import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import AdminLayout from '@/components/admin/AdminLayout';
import { Plus, Trash2, Send, Save, Eye, ArrowLeft, ChevronDown, X } from 'lucide-react';
import { toast } from 'sonner';

const DEFAULT_TERMS = `Payment is due within 14 days of invoice date.
Banking Details:
Bank: FNB | Account Name: Creative Books SA
Account Number: 62XXXXXXXXX | Branch Code: 250655
Reference: Your Quote Number`;

function ContactSearch({ contacts, value, onChange }) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState('');
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const filtered = contacts.filter(c => !q || c.full_name?.toLowerCase().includes(q.toLowerCase()) || c.email?.toLowerCase().includes(q.toLowerCase()));
  const selected = contacts.find(c => c.id === value);

  return (
    <div ref={ref} className="relative">
      <button type="button" onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-3 py-2.5 border border-black/15 rounded-xl text-sm focus:outline-none focus:border-[#B87333] bg-white text-left">
        {selected ? (
          <div>
            <div className="font-semibold text-[#1A1208]">{selected.full_name}</div>
            <div className="text-xs text-black/40">{selected.email}</div>
          </div>
        ) : <span className="text-black/40">Select a contact…</span>}
        <ChevronDown className="w-4 h-4 text-black/30 flex-shrink-0" />
      </button>
      {open && (
        <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-white border border-black/10 rounded-xl shadow-xl overflow-hidden">
          <div className="p-2 border-b border-black/8">
            <input autoFocus value={q} onChange={e => setQ(e.target.value)} placeholder="Search contacts…"
              className="w-full px-3 py-2 text-sm border border-black/10 rounded-lg focus:outline-none focus:border-[#B87333]" />
          </div>
          <div className="max-h-60 overflow-y-auto">
            {filtered.slice(0, 20).map(c => (
              <button key={c.id} type="button" onClick={() => { onChange(c.id); setOpen(false); setQ(''); }}
                className="w-full text-left px-4 py-3 hover:bg-[#faf8f4] transition-colors border-b border-black/5 last:border-0">
                <div className="font-medium text-sm text-[#1A1208]">{c.full_name}</div>
                <div className="text-xs text-black/40">{c.email}{c.phone ? ` · ${c.phone}` : ''}</div>
              </button>
            ))}
            {filtered.length === 0 && <div className="px-4 py-6 text-center text-sm text-black/40">No contacts found</div>}
          </div>
        </div>
      )}
    </div>
  );
}

export default function AdminQuoteBuilder() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isNew = id === 'new';

  const [contacts, setContacts] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [sending, setSending] = useState(false);

  const [contactId, setContactId] = useState('');
  const [validUntil, setValidUntil] = useState(new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0]);
  const [includeVat, setIncludeVat] = useState(true);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [notes, setNotes] = useState('');
  const [terms, setTerms] = useState(DEFAULT_TERMS);
  const [lineItems, setLineItems] = useState([{ description: '', quantity: 1, unit_price: 0, line_total: 0, service_id: null }]);
  const [quote, setQuote] = useState(null);

  useEffect(() => {
    Promise.all([
      base44.entities.Contact.list('-created_date', 500),
      base44.entities.QuoteService.filter({ is_active: true }),
    ]).then(([cs, svs]) => {
      setContacts(cs);
      setServices(svs);
    });

    if (!isNew) {
      Promise.all([
        base44.entities.Quote.filter({ id }),
        base44.entities.QuoteLineItem.filter({ quote_id: id }),
      ]).then(([qs, items]) => {
        if (!qs.length) { navigate('/admin/quotes'); return; }
        const q = qs[0];
        setQuote(q);
        setContactId(q.contact_id || '');
        setValidUntil(q.valid_until || '');
        setIncludeVat(q.include_vat !== false);
        setDiscountAmount(q.discount_amount || 0);
        setNotes(q.notes || '');
        setTerms(q.terms || DEFAULT_TERMS);
        items.sort((a, b) => a.sort_order - b.sort_order);
        setLineItems(items.length ? items : [{ description: '', quantity: 1, unit_price: 0, line_total: 0 }]);
        setLoading(false);
      });
    }
  }, [id, isNew, navigate]);

  const updateLine = (idx, field, val) => {
    setLineItems(prev => prev.map((item, i) => {
      if (i !== idx) return item;
      const updated = { ...item, [field]: val };
      if (field === 'quantity' || field === 'unit_price') {
        const qty = field === 'quantity' ? Number(val) : Number(item.quantity);
        const price = field === 'unit_price' ? Number(val) : Number(item.unit_price);
        updated.line_total = parseFloat((qty * price).toFixed(2));
      }
      return updated;
    }));
  };

  const applyService = (idx, svcId) => {
    const svc = services.find(s => s.id === svcId);
    if (!svc) return;
    setLineItems(prev => prev.map((item, i) => {
      if (i !== idx) return item;
      const price = svc.default_price || 0;
      return { ...item, service_id: svcId, description: svc.default_description || svc.name, unit_price: price, line_total: parseFloat((item.quantity * price).toFixed(2)) };
    }));
  };

  const addLine = () => setLineItems(prev => [...prev, { description: '', quantity: 1, unit_price: 0, line_total: 0, service_id: null }]);
  const removeLine = (idx) => setLineItems(prev => prev.filter((_, i) => i !== idx));

  const subtotal = lineItems.reduce((s, i) => s + (Number(i.line_total) || 0), 0);
  const disc = Number(discountAmount) || 0;
  const taxable = subtotal - disc;
  const vat = includeVat ? taxable * 0.15 : 0;
  const total = taxable + vat;

  const buildPayload = () => ({
    contact_id: contactId, valid_until: validUntil, include_vat: includeVat,
    discount_amount: disc, notes, terms,
    line_items: lineItems.map(({ description, quantity, unit_price, line_total, service_id }) => ({ description, quantity: Number(quantity), unit_price: Number(unit_price), line_total: Number(line_total), service_id })),
  });

  const handleSave = async () => {
    if (!contactId) { toast.error('Please select a contact'); return; }
    setSaving(true);
    const payload = buildPayload();
    if (isNew) {
      const res = await base44.functions.invoke('quoteActions', { action: 'create', ...payload });
      if (res.data?.quote) {
        toast.success('Quote saved as draft');
        navigate(`/admin/quotes/${res.data.quote.id}`, { replace: true });
      }
    } else {
      const res = await base44.functions.invoke('quoteActions', { action: 'update', quote_id: id, ...payload });
      if (res.data?.quote) { setQuote(res.data.quote); toast.success('Quote updated'); }
    }
    setSaving(false);
  };

  const handleSend = async () => {
    if (!contactId) { toast.error('Please select a contact'); return; }
    setSending(true);
    let qId = id;
    if (isNew || quote?.status === 'Draft') {
      const payload = buildPayload();
      const saveRes = await base44.functions.invoke('quoteActions', { action: isNew ? 'create' : 'update', ...(isNew ? {} : { quote_id: id }), ...payload });
      if (saveRes.data?.quote) { qId = saveRes.data.quote.id; setQuote(saveRes.data.quote); }
    }
    const res = await base44.functions.invoke('quoteActions', { action: 'send', quote_id: qId });
    if (res.data?.success) {
      toast.success('Quote sent to client!');
      setQuote(q => ({ ...q, status: 'Sent' }));
      if (isNew) navigate(`/admin/quotes/${qId}`, { replace: true });
    } else {
      toast.error('Failed to send quote');
    }
    setSending(false);
  };

  const viewLink = quote ? `/quote/view/${quote.id}/${quote.view_token}` : null;

  if (loading) return (
    <AdminLayout>
      <div className="space-y-4 max-w-4xl mx-auto">
        {[...Array(4)].map((_, i) => <div key={i} className="h-20 bg-black/5 rounded-2xl animate-pulse" />)}
      </div>
    </AdminLayout>
  );

  const selectedContact = contacts.find(c => c.id === contactId);

  return (
    <AdminLayout>
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Link to="/admin/quotes" className="p-2 hover:bg-black/5 rounded-lg"><ArrowLeft className="w-5 h-5" /></Link>
            <div>
              <h1 className="text-2xl font-bold text-[#1A1208]">{isNew ? 'New Quote' : quote?.quote_number}</h1>
              {quote?.status && (
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                  quote.status === 'Accepted' ? 'bg-emerald-100 text-emerald-700' :
                  quote.status === 'Sent' ? 'bg-blue-100 text-blue-700' :
                  quote.status === 'Viewed' ? 'bg-purple-100 text-purple-700' :
                  quote.status === 'Declined' ? 'bg-red-100 text-red-700' :
                  'bg-gray-100 text-gray-600'
                }`}>{quote.status}</span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {viewLink && (
              <a href={viewLink} target="_blank" rel="noreferrer"
                className="flex items-center gap-2 px-3 py-2 border border-black/15 rounded-xl text-sm font-medium hover:bg-black/5">
                <Eye className="w-4 h-4" /> Preview
              </a>
            )}
            <button onClick={handleSave} disabled={saving}
              className="flex items-center gap-2 px-3 py-2 border border-black/15 rounded-xl text-sm font-medium hover:bg-black/5 disabled:opacity-50">
              <Save className="w-4 h-4" /> {saving ? 'Saving…' : 'Save Draft'}
            </button>
            <button onClick={handleSend} disabled={sending || ['Accepted','Declined'].includes(quote?.status)}
              className="flex items-center gap-2 px-4 py-2 bg-[#B87333] text-white rounded-xl text-sm font-semibold hover:bg-[#a06428] disabled:opacity-50 transition-colors">
              <Send className="w-4 h-4" /> {sending ? 'Sending…' : 'Send Quote'}
            </button>
          </div>
        </div>

        <div className="space-y-5">
          <div className="bg-white rounded-2xl border border-black/8 p-6 shadow-sm">
            <h2 className="text-sm font-bold text-black/60 uppercase tracking-wide mb-4">Client & Quote Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-black/50 uppercase tracking-wide mb-1.5">Bill To *</label>
                <ContactSearch contacts={contacts} value={contactId} onChange={setContactId} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-black/50 uppercase tracking-wide mb-1.5">Valid Until</label>
                <input type="date" value={validUntil} onChange={e => setValidUntil(e.target.value)}
                  className="w-full px-3 py-2.5 border border-black/15 rounded-xl text-sm focus:outline-none focus:border-[#B87333]" />
              </div>
            </div>
            {selectedContact && (
              <div className="mt-4 p-3 bg-[#faf8f4] rounded-xl text-sm text-black/60 space-y-0.5">
                <div className="font-semibold text-[#1A1208]">{selectedContact.full_name}</div>
                {selectedContact.email && <div>{selectedContact.email}</div>}
                {selectedContact.phone && <div>{selectedContact.phone}</div>}
                {selectedContact.book_title && <div className="text-[#B87333]">📖 {selectedContact.book_title}</div>}
              </div>
            )}
          </div>

          <div className="bg-white rounded-2xl border border-black/8 p-6 shadow-sm">
            <h2 className="text-sm font-bold text-black/60 uppercase tracking-wide mb-4">Line Items</h2>
            <div className="space-y-3">
              <div className="grid grid-cols-12 gap-2 text-xs font-semibold text-black/40 uppercase tracking-wide px-1">
                <div className="col-span-5">Description</div>
                <div className="col-span-2 text-center">Qty</div>
                <div className="col-span-2 text-right">Unit Price</div>
                <div className="col-span-2 text-right">Total</div>
                <div className="col-span-1" />
              </div>
              {lineItems.map((item, idx) => (
                <div key={idx} className="grid grid-cols-12 gap-2 items-start">
                  <div className="col-span-5">
                    {services.length > 0 && (
                      <select value={item.service_id || ''} onChange={e => applyService(idx, e.target.value)}
                        className="w-full px-2 py-1.5 mb-1 border border-black/10 rounded-lg text-xs text-black/50 focus:outline-none focus:border-[#B87333] bg-white">
                        <option value="">— Select service —</option>
                        {services.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                      </select>
                    )}
                    <input value={item.description} onChange={e => updateLine(idx, 'description', e.target.value)}
                      placeholder="Description…"
                      className="w-full px-3 py-2 border border-black/15 rounded-xl text-sm focus:outline-none focus:border-[#B87333]" />
                  </div>
                  <div className="col-span-2">
                    <input type="number" value={item.quantity} onChange={e => updateLine(idx, 'quantity', e.target.value)} min="0"
                      className="w-full px-3 py-2 border border-black/15 rounded-xl text-sm text-center focus:outline-none focus:border-[#B87333]" />
                  </div>
                  <div className="col-span-2">
                    <input type="number" value={item.unit_price} onChange={e => updateLine(idx, 'unit_price', e.target.value)} min="0" step="0.01"
                      className="w-full px-3 py-2 border border-black/15 rounded-xl text-sm text-right focus:outline-none focus:border-[#B87333]" />
                  </div>
                  <div className="col-span-2">
                    <div className="px-3 py-2 bg-[#faf8f4] rounded-xl text-sm text-right font-semibold text-[#1A1208]">
                      R {Number(item.line_total).toFixed(2)}
                    </div>
                  </div>
                  <div className="col-span-1 flex justify-center pt-2">
                    {lineItems.length > 1 && (
                      <button onClick={() => removeLine(idx)} className="p-1 hover:bg-red-50 rounded-lg text-red-400">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
              <button onClick={addLine} className="flex items-center gap-2 text-[#B87333] text-sm font-semibold hover:bg-[#faf8f4] px-3 py-2 rounded-xl transition-colors">
                <Plus className="w-4 h-4" /> Add Line Item
              </button>
            </div>

            <div className="mt-6 pt-4 border-t border-black/8">
              <div className="max-w-xs ml-auto space-y-2">
                <div className="flex justify-between text-sm"><span className="text-black/50">Subtotal</span><span className="font-medium">R {subtotal.toFixed(2)}</span></div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-black/50">Discount (R)</span>
                  <input type="number" value={discountAmount} onChange={e => setDiscountAmount(e.target.value)} min="0" step="0.01"
                    className="w-24 px-2 py-1 border border-black/15 rounded-lg text-sm text-right focus:outline-none focus:border-[#B87333]" />
                </div>
                <div className="flex items-center justify-between text-sm">
                  <label className="flex items-center gap-2 text-black/50 cursor-pointer">
                    <input type="checkbox" checked={includeVat} onChange={e => setIncludeVat(e.target.checked)} className="rounded" />
                    VAT (15%)
                  </label>
                  <span className="font-medium">R {vat.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-base font-bold pt-2 border-t border-black/10">
                  <span className="text-[#1A1208]">TOTAL</span>
                  <span className="text-[#B87333]">R {total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="bg-white rounded-2xl border border-black/8 p-6 shadow-sm">
              <label className="block text-sm font-bold text-black/60 uppercase tracking-wide mb-3">Notes to Client</label>
              <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={4}
                placeholder="Any notes to include on the quote…"
                className="w-full px-3 py-2.5 border border-black/15 rounded-xl text-sm focus:outline-none focus:border-[#B87333] resize-none" />
            </div>
            <div className="bg-white rounded-2xl border border-black/8 p-6 shadow-sm">
              <label className="block text-sm font-bold text-black/60 uppercase tracking-wide mb-3">Payment Terms</label>
              <textarea value={terms} onChange={e => setTerms(e.target.value)} rows={4}
                className="w-full px-3 py-2.5 border border-black/15 rounded-xl text-sm focus:outline-none focus:border-[#B87333] resize-none" />
            </div>
          </div>

          {viewLink && (
            <div className="bg-[#faf8f4] rounded-2xl border border-[#B87333]/20 p-4 flex items-center gap-3">
              <div className="flex-1">
                <div className="text-xs font-semibold text-black/50 uppercase tracking-wide mb-1">Public Quote Link</div>
                <div className="text-sm text-[#B87333] font-mono break-all">{window.location.origin}{viewLink}</div>
              </div>
              <button onClick={() => { navigator.clipboard.writeText(window.location.origin + viewLink); toast.success('Link copied!'); }}
                className="px-3 py-2 bg-[#B87333] text-white rounded-xl text-xs font-semibold whitespace-nowrap">
                Copy Link
              </button>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}