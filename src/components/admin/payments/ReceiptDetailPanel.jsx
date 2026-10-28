import { useState } from 'react';
import { platform } from '@/api/platformClient';
import { Button } from '@/components/ui/button';
import { X, Send, Download, Loader2, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

const METHOD_COLORS = {
  EFT: 'bg-blue-100 text-blue-700',
  Cash: 'bg-green-100 text-green-700',
  Card: 'bg-purple-100 text-purple-700',
  Other: 'bg-gray-100 text-gray-600',
};

export default function ReceiptDetailPanel({ receipt, onClose, onUpdated }) {
  const [sending, setSending] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const handleSendAcknowledgement = async () => {
    const email = receipt.contact_snapshot?.email;
    if (!email) { toast.error('No email address on contact'); return; }
    if (!confirm(`Send receipt ${receipt.receipt_number} to ${email}?`)) return;
    setSending(true);
    try {
      const res = await platform.functions.invoke('paymentActions', { action: 'send_acknowledgement', receipt_id: receipt.id });
      if (res.data?.success) {
        toast.success('Receipt & acknowledgement emailed to client');
        onUpdated && onUpdated();
      } else {
        toast.error(res.data?.error || 'Failed to send');
      }
    } catch (e) {
      toast.error('Failed to send acknowledgement');
    } finally {
      setSending(false);
    }
  };

  const handleDownloadPdf = async () => {
    setDownloading(true);
    try {
      const res = await platform.functions.invoke('paymentActions', { action: 'get_receipt_pdf', receipt_id: receipt.id });
      if (res.data?.pdf_base64) {
        const binary = atob(res.data.pdf_base64);
        const bytes = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
        const blob = new Blob([bytes], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Receipt-${res.data.receipt_number}.pdf`;
        a.click();
        URL.revokeObjectURL(url);
      }
    } catch (e) {
      toast.error('Failed to generate PDF');
    } finally {
      setDownloading(false);
    }
  };

  const isFullySettled = (receipt.balance_after || 0) <= 0;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="relative w-full max-w-md bg-white h-full overflow-y-auto shadow-2xl">

        {/* Header */}
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between z-10">
          <div>
            <p className="font-mono text-sm text-gray-500">{receipt.receipt_number}</p>
            <h2 className="font-bold text-gray-900">{receipt.contact_snapshot?.full_name || '—'}</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5 text-gray-500" /></button>
        </div>

        <div className="p-6 space-y-5">
          {/* Status banner */}
          <div className={`rounded-xl p-4 text-center ${isFullySettled ? 'bg-emerald-50 border border-emerald-100' : 'bg-amber-50 border border-amber-100'}`}>
            <div className={`text-2xl font-bold mb-1 ${isFullySettled ? 'text-emerald-600' : 'text-amber-600'}`}>
              R {Number(receipt.amount_paid || 0).toFixed(2)}
            </div>
            <div className={`text-sm font-medium ${isFullySettled ? 'text-emerald-700' : 'text-amber-700'}`}>
              {isFullySettled ? '✓ Invoice Fully Settled' : 'Payment Received'}
            </div>
          </div>

          {/* Details */}
          <div className="bg-gray-50 rounded-xl p-4 space-y-3">
            {[
              { label: 'Receipt No.', value: receipt.receipt_number },
              { label: 'Invoice', value: receipt.invoice_number },
              { label: 'Date', value: receipt.payment_date ? new Date(receipt.payment_date).toLocaleDateString('en-ZA') : '—' },
              { label: 'Reference', value: receipt.reference || '—' },
            ].map(({ label, value }) => (
              <div key={label} className="flex justify-between text-sm">
                <span className="text-gray-500">{label}</span>
                <span className="text-gray-900 font-medium">{value}</span>
              </div>
            ))}
            <div className="flex justify-between text-sm items-center">
              <span className="text-gray-500">Method</span>
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${METHOD_COLORS[receipt.payment_method] || 'bg-gray-100'}`}>
                {receipt.payment_method}
              </span>
            </div>
          </div>

          {/* Invoice summary */}
          <div className="border border-gray-100 rounded-xl overflow-hidden">
            <div className="bg-gray-50 px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">Invoice Summary</div>
            <div className="p-4 space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-gray-500">Invoice Total</span><span>R {Number(receipt.invoice_total || 0).toFixed(2)}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Amount Paid (this)</span><span className="text-emerald-600 font-semibold">R {Number(receipt.amount_paid || 0).toFixed(2)}</span></div>
              <div className="flex justify-between font-semibold border-t pt-2">
                <span>Remaining Balance</span>
                <span className={isFullySettled ? 'text-emerald-600' : 'text-orange-600'}>
                  {isFullySettled ? 'Paid in full' : `R ${Number(receipt.balance_after).toFixed(2)}`}
                </span>
              </div>
            </div>
          </div>

          {/* Acknowledgement status */}
          {receipt.acknowledgement_sent_at && (
            <div className="flex items-center gap-2 text-xs text-emerald-600 bg-emerald-50 rounded-lg px-3 py-2">
              <CheckCircle className="w-4 h-4" />
              Acknowledgement sent {new Date(receipt.acknowledgement_sent_at).toLocaleDateString('en-ZA')}
            </div>
          )}

          {/* Actions */}
          <div className="space-y-2">
            <Button onClick={handleSendAcknowledgement} disabled={sending} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white gap-2">
              {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              {sending ? 'Sending…' : 'Send Acknowledgement Email'}
            </Button>
            <Button onClick={handleDownloadPdf} disabled={downloading} variant="outline" className="w-full gap-2">
              {downloading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
              {downloading ? 'Generating…' : 'Download Receipt PDF'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}