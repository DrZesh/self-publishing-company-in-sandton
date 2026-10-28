import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { platform } from '@/api/platformClient';
import { Download, Loader2 } from 'lucide-react';
import NoIndexMeta from '@/components/shared/NoIndexMeta';

export default function InvoiceView() {
  const { id, token } = useParams();
  const [invoice, setInvoice] = useState(null);
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [generatingPdf, setGeneratingPdf] = useState(false);
  const invoiceRef = useRef(null);

  useEffect(() => {
    platform.functions.invoke('invoiceActions', { action: 'get_public', invoice_id: id, token })
      .then(res => {
        if (res.data?.invoice) {
          setInvoice(res.data.invoice);
          setCompany(res.data.company || {});
        } else {
          setError('Invoice not found or link is invalid.');
        }
      })
      .catch(() => setError('Failed to load invoice.'))
      .finally(() => setLoading(false));
  }, [id, token]);

  const handleDownloadPdf = async () => {
    if (!invoiceRef.current) return;
    setGeneratingPdf(true);
    try {
      const html2canvas = (await import('html2canvas')).default;
      const jsPDF = (await import('jspdf')).default;
      const canvas = await html2canvas(invoiceRef.current, { scale: 2, useCORS: true, backgroundColor: '#ffffff' });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const imgWidth = canvas.width * 0.264583;
      const imgHeight = canvas.height * 0.264583;
      const ratio = pdfWidth / imgWidth;
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, imgHeight * ratio);
      pdf.save(`Invoice-${invoice.invoice_number}.pdf`);
    } finally {
      setGeneratingPdf(false);
    }
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
        <h2 className="text-xl font-bold text-[#1A1208] mb-2">Invoice Not Found</h2>
        <p className="text-black/50 text-sm">{error}</p>
      </div>
    </div>
  );

  const contact = invoice.contact_snapshot || {};
  const companyName = company?.company_name || 'Creative Books SA';
  const companyEmail = company?.email || 'info@creativebooks.co.za';
  const companyPhone = company?.phone || '';
  const companyVat = company?.vat_number || '';
  const companyAddress = company?.physical_address || '';
  const companyLogo = company?.logo_url || '';
  const footerNote = company?.document_footer_note || `${companyName} · www.creativebooks.co.za`;
  const banking = invoice.banking_details?.trim() || '';
  const lineItems = (invoice.line_items || []).filter(i => i.description?.trim());

  const STATUS_STYLES = {
    Paid: 'bg-emerald-100 text-emerald-700',
    Overdue: 'bg-red-100 text-red-700',
    'Partially Paid': 'bg-yellow-100 text-yellow-700',
    Sent: 'bg-blue-100 text-blue-700',
    Draft: 'bg-gray-100 text-gray-600',
  };

  return (
    <div className="min-h-screen bg-[#f8f7f4] py-10 px-4 print:bg-white print:py-0">
      <NoIndexMeta title="Invoice | Creative Books SA" />
      {/* Download button */}
      <div className="max-w-3xl mx-auto mb-4 flex justify-end print:hidden">
        <button onClick={handleDownloadPdf} disabled={generatingPdf}
          className="flex items-center gap-2 px-4 py-2.5 bg-white border border-black/15 text-black/60 rounded-xl text-sm font-semibold hover:bg-[#f8f7f4] disabled:opacity-50 shadow-sm">
          {generatingPdf ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
          {generatingPdf ? 'Generating PDF…' : 'Download PDF'}
        </button>
      </div>

      <div ref={invoiceRef} className="max-w-3xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden print:shadow-none print:rounded-none">

        {/* Header */}
        <div className="bg-[#1A1208] px-10 py-8 print:py-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              {companyLogo ? (
                <img src={companyLogo} alt={companyName} className="h-10 object-contain mb-2" />
              ) : (
                <div className="text-[#B87333] font-bold text-2xl tracking-wide">{companyName}</div>
              )}
              <div className="text-white/50 text-xs mt-1">{companyEmail}</div>
              {companyPhone && <div className="text-white/30 text-xs">{companyPhone}</div>}
              {companyVat && <div className="text-white/30 text-xs">VAT Reg: {companyVat}</div>}
            </div>
            <div className="text-right flex-shrink-0">
              <div className="text-[#B87333] text-xs uppercase tracking-widest mb-1">Invoice</div>
              <div className="text-white text-2xl font-bold">{invoice.invoice_number}</div>
              {invoice.issue_date && <div className="text-white/40 text-xs mt-1">Issued: {new Date(invoice.issue_date).toLocaleDateString('en-ZA')}</div>}
              {invoice.due_date && <div className="text-white/40 text-xs">Due: {new Date(invoice.due_date).toLocaleDateString('en-ZA')}</div>}
            </div>
          </div>
        </div>

        {/* Status banner */}
        {invoice.status && (
          <div className="px-10 py-2 border-b border-black/5 flex items-center justify-between">
            <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${STATUS_STYLES[invoice.status] || 'bg-gray-100 text-gray-600'}`}>
              {invoice.status}
            </span>
            {invoice.status === 'Overdue' && (
              <span className="text-xs text-red-600 font-medium">Payment overdue — please settle at your earliest convenience</span>
            )}
          </div>
        )}

        {/* Bill To */}
        <div className="px-10 py-6 border-b border-black/5">
          <div className="text-xs font-semibold text-[#B87333] uppercase tracking-wide mb-2">Bill To</div>
          <div className="text-lg font-bold text-[#1A1208]">{contact.full_name}</div>
          {contact.company && <div className="text-sm text-black/60 font-medium">{contact.company}</div>}
          {contact.billing_address && <div className="text-sm text-black/50 whitespace-pre-line">{contact.billing_address}</div>}
          {contact.email && <div className="text-sm text-black/50">{contact.email}</div>}
          {contact.vat_number && <div className="text-sm text-black/50">VAT: {contact.vat_number}</div>}
        </div>

        {/* Line Items */}
        <div className="px-10 py-6">
          {invoice.book_title && (
            <p className="text-sm text-black/60 mb-4">Re: <span className="font-semibold text-[#1A1208]">{invoice.book_title}</span></p>
          )}
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
                  <td className="px-4 py-3 text-sm text-right text-black/60">R {Number(item.unit_price || 0).toFixed(2)}</td>
                  <td className="px-4 py-3 text-sm text-right font-semibold text-[#1A1208]">R {Number(item.line_total || 0).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Totals */}
          <div className="mt-4 max-w-xs ml-auto space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-black/50">Subtotal (excl. VAT)</span>
              <span>R {Number(invoice.subtotal || 0).toFixed(2)}</span>
            </div>
            {invoice.include_vat !== false && (
              <div className="flex justify-between text-sm">
                <span className="text-black/50">VAT ({invoice.vat_rate || 15}%)</span>
                <span>R {Number(invoice.vat_amount || 0).toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between text-lg font-bold pt-2 border-t-2 border-[#B87333]">
              <span className="text-[#1A1208]">TOTAL DUE</span>
              <span className="text-[#B87333]">R {Number(invoice.total || 0).toFixed(2)}</span>
            </div>
            {(invoice.amount_paid || 0) > 0 && (
              <>
                <div className="flex justify-between text-sm text-emerald-600">
                  <span>Amount Paid</span>
                  <span>R {Number(invoice.amount_paid).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm font-bold">
                  <span className="text-black/60">Balance Due</span>
                  <span className="text-[#B87333]">R {Number(invoice.balance_due || 0).toFixed(2)}</span>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Banking Details */}
        {banking && (
          <div className="px-10 pb-5">
            <div className="bg-blue-50 border-l-4 border-blue-400 rounded-r-xl p-4">
              <div className="text-xs font-bold text-blue-700 uppercase tracking-wide mb-2">Banking Details</div>
              <div className="text-sm text-blue-900 whitespace-pre-line">{banking}</div>
            </div>
          </div>
        )}

        {/* Payment Terms */}
        {invoice.payment_terms && (
          <div className="px-10 pb-4">
            <div className="text-xs text-black/40 italic">{invoice.payment_terms}</div>
          </div>
        )}

        {/* Notes */}
        {invoice.notes && (
          <div className="px-10 pb-6">
            <div className="bg-[#faf8f4] rounded-xl p-4">
              <div className="text-xs font-semibold text-[#B87333] uppercase tracking-wide mb-1">Notes</div>
              <div className="text-sm text-black/60 whitespace-pre-line">{invoice.notes}</div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="px-10 py-4 text-center border-t border-black/5">
          <div className="text-xs text-black/30">{footerNote}</div>
          {companyAddress && <div className="text-xs text-black/20 mt-0.5">{companyAddress}</div>}
        </div>
      </div>
    </div>
  );
}