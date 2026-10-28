import { useState } from 'react';
import { Link } from 'react-router-dom';
import { platform } from '@/api/platformClient';
import { Button } from '@/components/ui/button';
import { X, Edit2, Send, Eye, Loader2, Copy, FileText } from 'lucide-react';
import { toast } from 'sonner';

const STATUS_COLORS = {
  Draft:     'bg-gray-100 text-gray-600',
  Sent:      'bg-blue-100 text-blue-700',
  Delivered: 'bg-indigo-100 text-indigo-700',
  Opened:    'bg-sky-100 text-sky-700',
  Viewed:    'bg-purple-100 text-purple-700',
  Accepted:  'bg-green-100 text-green-700',
  Declined:  'bg-red-100 text-red-700',
  Expired:   'bg-orange-100 text-orange-700',
};

export default function QuoteDetailPanel({ quote, contact, onClose, onUpdated, onDuplicate }) {
  const [sending, setSending] = useState(false);
  const [duplicating, setDuplicating] = useState(false);
  const [converting, setConverting] = useState(false);

  const email = quote.contact_snapshot?.email || contact?.email;
  const isExpired = quote.status === 'Sent' && quote.valid_until && new Date(quote.valid_until) < new Date();
  const displayStatus = isExpired ? 'Expired' : quote.status;

  const handleSend = async (isResend = false) => {
    if (!email) { toast.error('No email on this contact — update the contact first.'); return; }
    if (!confirm(`${isResend ? 'Resend' : 'Send'} quote ${quote.quote_number} to ${email}?`)) return;
    setSending(true);
    try {
      const res = await platform.functions.invoke('quoteActions', { action: 'send', quote_id: quote.id });
      if (res.data?.success) {
        toast.success(`✅ Quote ${quote.quote_number} ${isResend ? 'resent' : 'sent'} to ${email}`);
        onUpdated();
      } else {
        toast.error(res.data?.error || 'Failed to send quote.');
      }
    } catch (err) {
      toast.error(err?.response?.data?.error || err.message || 'Failed to send quote.');
    } finally {
      setSending(false);
    }
  };

  const handleDuplicate = async () => {
    setDuplicating(true);
    try {
      const res = await platform.functions.invoke('quoteActions', { action: 'duplicate', quote_id: quote.id });
      if (res.data?.quote) {
        toast.success('Quote duplicated');
        onDuplicate(res.data.quote);
        onClose();
      }
    } catch (err) {
      toast.error('Failed to duplicate quote.');
    } finally {
      setDuplicating(false);
    }
  };

  const handleConvertToInvoice = async () => {
    if (quote.status !== 'Accepted') {
      toast.error('Only accepted quotes can be converted.');
      return;
    }
    if (!confirm('Are you sure you want to convert this quote to an invoice?')) return;
    setConverting(true);
    try {
      const res = await platform.functions.invoke('quoteActions', { action: 'convert_to_invoice', quote_id: quote.id });
      if (res.data?.success) {
        toast.success('Quote converted to invoice successfully!');
        onUpdated();
      } else {
        toast.error(res.data?.error || 'Failed to convert quote.');
      }
    } catch (err) {
      toast.error(err.message || 'Failed to convert quote.');
    } finally {
      setConverting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="relative w-full max-w-xl bg-white h-full overflow-y-auto shadow-2xl">

        {/* Header */}
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between z-10">
          <div>
            <p className="font-mono text-sm text-gray-500">{quote.quote_number}</p>
            <h2 className="font-bold text-gray-900">{contact?.full_name || quote.contact_snapshot?.full_name || '—'}</h2>
          </div>
          <div className="flex items-center gap-2">
            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${STATUS_COLORS[displayStatus] || 'bg-gray-100 text-gray-600'}`}>{displayStatus}</span>
            <Link to={`/admin/quotes/${quote.id}`}>
              <Button variant="outline" size="sm"><Edit2 className="w-4 h-4" /></Button>
            </Link>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5 text-gray-500" /></button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Financial summary */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-gray-50 rounded-xl p-3 text-center col-span-2">
              <p className="text-xs text-gray-500">Total Value</p>
              <p className="text-lg font-bold text-gray-900">R {Number(quote.total || 0).toLocaleString('en-ZA', { minimumFractionDigits: 2 })}</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-3 text-center">
              <p className="text-xs text-gray-500">VAT</p>
              <p className="text-lg font-bold text-gray-700">R {Number(quote.vat_amount || 0).toLocaleString('en-ZA', { minimumFractionDigits: 2 })}</p>
            </div>
          </div>

          {/* Meta */}
          <div className="flex flex-wrap gap-4 text-sm text-gray-600">
            {quote.book_title && <div><span className="text-xs text-gray-400 block">Book Title</span>{quote.book_title}</div>}
            {quote.valid_until && (
              <div>
                <span className="text-xs text-gray-400 block">Valid Until</span>
                <span className={isExpired ? 'text-red-600 font-medium' : ''}>{new Date(quote.valid_until).toLocaleDateString('en-ZA')}</span>
              </div>
            )}
            {quote.sent_at && <div><span className="text-xs text-gray-400 block">Sent</span>{new Date(quote.sent_at).toLocaleDateString('en-ZA')}</div>}
            {quote.accepted_at && <div><span className="text-xs text-gray-400 block">Accepted</span>{new Date(quote.accepted_at).toLocaleDateString('en-ZA')}</div>}
          </div>

          {/* Contact */}
          {(contact || quote.contact_snapshot) && (
            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-xs font-semibold text-gray-500 mb-2">Client</p>
              <Link to={`/admin/contacts/detail?id=${quote.contact_id}`} className="font-medium text-gray-900 hover:text-[#B87333] hover:underline">
                {contact?.full_name || quote.contact_snapshot?.full_name}
              </Link>
              <p className="text-sm text-gray-500">{email}</p>
              {(contact?.company || quote.contact_snapshot?.company) && (
                <p className="text-sm text-gray-500">{contact?.company || quote.contact_snapshot?.company}</p>
              )}
            </div>
          )}

          {/* Line Items */}
          {(quote.line_items?.length > 0) && (
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-2">Line Items</h3>
              <div className="border border-gray-100 rounded-xl overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-left px-4 py-2 text-xs text-gray-500">Description</th>
                      <th className="text-right px-4 py-2 text-xs text-gray-500">Qty</th>
                      <th className="text-right px-4 py-2 text-xs text-gray-500">Unit</th>
                      <th className="text-right px-4 py-2 text-xs text-gray-500">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {quote.line_items.filter(i => i.description).map((item, i) => (
                      <tr key={i}>
                        <td className="px-4 py-2">{item.description}</td>
                        <td className="px-4 py-2 text-right">{item.quantity}</td>
                        <td className="px-4 py-2 text-right">R {Number(item.unit_price || 0).toFixed(2)}</td>
                        <td className="px-4 py-2 text-right font-medium">R {Number(item.line_total || 0).toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-gray-50 border-t border-gray-100 text-sm">
                    <tr><td colSpan={3} className="px-4 py-2 text-right text-gray-500">Subtotal</td><td className="px-4 py-2 text-right font-semibold">R {Number(quote.subtotal || 0).toFixed(2)}</td></tr>
                    {quote.include_vat !== false && <tr><td colSpan={3} className="px-4 py-2 text-right text-gray-400">VAT ({quote.vat_rate || 15}%)</td><td className="px-4 py-2 text-right text-gray-500">R {Number(quote.vat_amount || 0).toFixed(2)}</td></tr>}
                    {(quote.discount_amount || 0) > 0 && <tr><td colSpan={3} className="px-4 py-2 text-right text-gray-400">Discount</td><td className="px-4 py-2 text-right text-gray-500">-R {Number(quote.discount_amount).toFixed(2)}</td></tr>}
                    <tr><td colSpan={3} className="px-4 py-2 text-right font-bold">Total</td><td className="px-4 py-2 text-right font-bold text-[#B87333]">R {Number(quote.total || 0).toFixed(2)}</td></tr>
                  </tfoot>
                </table>
              </div>
            </div>
          )}

          {quote.notes && (
            <div className="bg-gray-50 rounded-xl p-3">
              <p className="text-xs font-semibold text-gray-500 mb-1">Notes</p>
              <p className="text-sm text-gray-700">{quote.notes}</p>
            </div>
          )}

          {/* Actions */}
          <div className="grid grid-cols-2 gap-3">
            {(quote.status === 'Draft') && (
              <Button onClick={() => handleSend(false)} disabled={sending} variant="outline" className="col-span-2 gap-2">
                {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                {sending ? 'Sending…' : 'Send Quote'}
              </Button>
            )}
            {(['Sent', 'Viewed', 'Opened', 'Delivered'].includes(quote.status)) && (
              <Button onClick={() => handleSend(true)} disabled={sending} variant="outline" className="col-span-2 gap-2 border-blue-300 text-blue-700 hover:bg-blue-50">
                {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                {sending ? 'Sending…' : 'Resend Quote'}
              </Button>
            )}
            <Button onClick={handleDuplicate} disabled={duplicating} variant="outline" className="gap-2">
              {duplicating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Copy className="w-4 h-4" />}
              {duplicating ? 'Duplicating…' : 'Duplicate'}
            </Button>
            <Link to={`/admin/quotes/${quote.id}`} className="flex items-center justify-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50">
              <Edit2 className="w-4 h-4" /> Edit Quote
            </Link>
            {quote.view_token && (
              <a href={`/quote/view/${quote.id}/${quote.view_token}`} target="_blank"
                className="flex items-center justify-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 col-span-2">
                <Eye className="w-4 h-4" /> Client View Link
              </a>
            )}
            {quote.converted_to_invoice_id && (
              <Link to={`/admin/invoices?id=${quote.converted_to_invoice_id}`}
                className="flex items-center justify-center gap-2 px-4 py-2 border border-green-300 rounded-lg text-sm font-medium text-green-700 hover:bg-green-50 col-span-2">
                <FileText className="w-4 h-4" /> View Converted Invoice
              </Link>
            )}
            {quote.status === 'Accepted' && !quote.converted_to_invoice_id && (
              <Button onClick={handleConvertToInvoice} disabled={converting} variant="outline" className="col-span-2 gap-2 border-green-300 text-green-700 hover:bg-green-50">
                {converting ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />}
                {converting ? 'Converting…' : 'Convert to Invoice'}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}