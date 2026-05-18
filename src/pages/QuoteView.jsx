import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { CheckCircle, XCircle, Download, Loader2 } from 'lucide-react';

export default function QuoteView() {
  const { id, token } = useParams();
  const [quote, setQuote] = useState(null);
  const [lineItems, setLineItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [responding, setResponding] = useState(false);

  useEffect(() => {
    base44.functions.invoke('quoteActions', { action: 'get_public', quote_id: id, token })
      .then(res => {
        if (res.data?.quote) {
          setQuote(res.data.quote);
          setLineItems(res.data.line_items || []);
        } else {
          setError('Quote not found or link is invalid.');
        }
      })
      .catch(() => setError('Failed to load quote.'))
      .finally(() => setLoading(false));
  }, [id, token]);

  const handleRespond = async (response) => {
    if (!confirm(response === 'accept' ? 'Accept this quote?' : 'Decline this quote?')) return;
    setResponding(true);
    const res = await base44.functions.invoke('quoteActions', { action: 'respond', quote_id: id, token, response });
    if (res.data?.success) setQuote(res.data.quote);
    setResponding(false);
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#f8f7f4]">
      <Loader2 className="w-8 h-8 animate-spin text-[#B87333]" />
    </div>
  );

  if (error) return (
    <div className="min-h-screen flex items-center justify-center bg-[#f8f7f4]">
      <div className="text-center">
        <div className="text-4xl mb-3">😕</div>
        <h2 className="text-xl font-bold text-[#1A1208] mb-2">Quote Not Found</h2>
        <p className="text-black/50 text-sm">{error}</p>
      </div>
    </div>
  );

  const contact = quote.contact_snapshot || {};
  const isClosed = ['Accepted', 'Declined', 'Expired'].includes(quote.status);

  return (
    <div className="min-h-screen bg-[#f8f7f4] py-10 px-4 print:bg-white print:py-0">
      <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden print:shadow-none print:rounded-none">
        <div className="bg-[#1A1208] px-10 py-8 print:py-6">
          <div className="flex items-start justify-between">
            <div>
              <div className="text-[#B87333] font-bold text-2xl tracking-wide">CREATIVE BOOKS SA</div>
              <div className="text-white/50 text-xs mt-1">Professional Publishing Services</div>
              <div className="text-white/30 text-xs mt-0.5">info@creativebooks.co.za · www.creativebooks.co.za</div>
            </div>
            <div className="text-right">
              <div className="text-white/50 text-xs uppercase tracking-wide mb-1">Quote</div>
              <div className="text-white text-2xl font-bold">{quote.quote_number}</div>
              <div className="text-white/40 text-xs mt-1">Valid until {quote.valid_until}</div>
            </div>
          </div>
        </div>

        {quote.status === 'Accepted' && (
          <div className="bg-emerald-50 border-b border-emerald-100 px-10 py-3 flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-emerald-500" />
            <span className="text-emerald-700 font-semibold text-sm">You accepted this quote on {new Date(quote.accepted_at).toLocaleDateString('en-ZA')}</span>
          </div>
        )}
        {quote.status === 'Declined' && (
          <div className="bg-red-50 border-b border-red-100 px-10 py-3 flex items-center gap-2">
            <XCircle className="w-5 h-5 text-red-500" />
            <span className="text-red-700 font-semibold text-sm">You declined this quote</span>
          </div>
        )}

        <div className="px-10 py-6 border-b border-black/5">
          <div className="text-xs font-semibold text-[#B87333] uppercase tracking-wide mb-2">Prepared for</div>
          <div className="text-lg font-bold text-[#1A1208]">{contact.full_name}</div>
          {contact.email && <div className="text-sm text-black/50">{contact.email}</div>}
          {contact.phone && <div className="text-sm text-black/50">{contact.phone}</div>}
        </div>

        <div className="px-10 py-6">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-[#f8f7f4]">
                <th className="px-4 py-3 text-left text-xs font-semibold text-black/40 uppercase tracking-wide">Description</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-black/40 uppercase tracking-wide">Qty</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-black/40 uppercase tracking-wide">Unit Price</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-black/40 uppercase tracking-wide">Total</th>
              </tr>
            </thead>
            <tbody>
              {lineItems.map((item, idx) => (
                <tr key={idx} className="border-b border-black/5">
                  <td className="px-4 py-3 text-sm text-[#1A1208]">{item.description}</td>
                  <td className="px-4 py-3 text-sm text-center text-black/60">{item.quantity}</td>
                  <td className="px-4 py-3 text-sm text-right text-black/60">R {Number(item.unit_price).toFixed(2)}</td>
                  <td className="px-4 py-3 text-sm text-right font-semibold text-[#1A1208]">R {Number(item.line_total).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="mt-4 max-w-xs ml-auto space-y-2">
            <div className="flex justify-between text-sm"><span className="text-black/50">Subtotal</span><span>R {Number(quote.subtotal).toFixed(2)}</span></div>
            {quote.discount_amount > 0 && (
              <div className="flex justify-between text-sm"><span className="text-black/50">Discount</span><span className="text-red-600">- R {Number(quote.discount_amount).toFixed(2)}</span></div>
            )}
            {quote.include_vat && (
              <div className="flex justify-between text-sm"><span className="text-black/50">VAT ({quote.vat_rate}%)</span><span>R {Number(quote.vat_amount).toFixed(2)}</span></div>
            )}
            <div className="flex justify-between text-lg font-bold pt-2 border-t-2 border-[#B87333]">
              <span className="text-[#1A1208]">TOTAL</span>
              <span className="text-[#B87333]">R {Number(quote.total).toFixed(2)}</span>
            </div>
          </div>
        </div>

        {quote.notes && (
          <div className="px-10 pb-4">
            <div className="bg-[#faf8f4] rounded-xl p-4">
              <div className="text-xs font-semibold text-[#B87333] uppercase tracking-wide mb-2">Notes</div>
              <div className="text-sm text-black/60 whitespace-pre-line">{quote.notes}</div>
            </div>
          </div>
        )}

        {quote.terms && (
          <div className="px-10 pb-6">
            <div className="text-xs font-semibold text-black/40 uppercase tracking-wide mb-2">Payment Terms</div>
            <div className="text-xs text-black/50 whitespace-pre-line">{quote.terms}</div>
          </div>
        )}

        {!isClosed && (
          <div className="px-10 py-6 bg-[#f8f7f4] border-t border-black/5 print:hidden">
            <div className="flex flex-col sm:flex-row gap-3">
              <button onClick={() => handleRespond('accept')} disabled={responding}
                className="flex-1 flex items-center justify-center gap-2 py-3 bg-emerald-600 text-white rounded-xl font-semibold hover:bg-emerald-700 disabled:opacity-50 transition-colors">
                <CheckCircle className="w-5 h-5" /> Accept Quote
              </button>
              <button onClick={() => handleRespond('decline')} disabled={responding}
                className="flex-1 flex items-center justify-center gap-2 py-3 border-2 border-red-200 text-red-600 rounded-xl font-semibold hover:bg-red-50 disabled:opacity-50 transition-colors">
                <XCircle className="w-5 h-5" /> Decline
              </button>
              <button onClick={() => window.print()}
                className="flex items-center justify-center gap-2 px-5 py-3 border border-black/15 text-black/60 rounded-xl font-semibold hover:bg-white transition-colors">
                <Download className="w-4 h-4" /> Print / PDF
              </button>
            </div>
          </div>
        )}
        {isClosed && (
          <div className="px-10 py-4 bg-[#f8f7f4] border-t border-black/5 print:hidden flex justify-center">
            <button onClick={() => window.print()} className="flex items-center gap-2 px-5 py-2.5 border border-black/15 text-black/60 rounded-xl text-sm font-semibold hover:bg-white">
              <Download className="w-4 h-4" /> Download / Print
            </button>
          </div>
        )}

        <div className="px-10 py-4 text-center border-t border-black/5">
          <div className="text-xs text-black/30">Creative Books SA · Proudly South African · www.creativebooks.co.za</div>
        </div>
      </div>
    </div>
  );
}