import { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { X } from 'lucide-react';

export default function PaymentModal({ contacts, invoices, payment, onClose, onSaved }) {
  const [form, setForm] = useState({
    contact_id: payment?.contact_id || '',
    invoice_id: payment?.invoice_id || '',
    amount: payment?.amount || '',
    payment_date: payment?.payment_date || new Date().toISOString().split('T')[0],
    payment_method: payment?.payment_method || 'EFT',
    reference: payment?.reference || '',
    status: payment?.status || 'Confirmed',
    notes: payment?.notes || '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const set = (key, value) => setForm(current => ({ ...current, [key]: value }));

  const filteredInvoices = form.contact_id
    ? invoices.filter(invoice => invoice.contact_id === form.contact_id)
    : invoices;

  const handleSave = async () => {
    if (!form.contact_id || !form.invoice_id || !form.amount) return;

    setSaving(true);
    setError('');

    try {
      const data = { ...form, amount: Number.parseFloat(form.amount) || 0 };

      if (payment) {
        await base44.entities.Payment.update(payment.id, data);
      } else {
        await base44.entities.Payment.create(data);
      }

      onSaved();
    } catch (saveError) {
      console.error('Failed to save payment:', saveError);
      setError(saveError.message || 'Unable to save payment.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-lg font-bold text-gray-900">Record Payment</h2>
          <button onClick={onClose}><X className="w-5 h-5 text-gray-400" /></button>
        </div>
        <div className="p-6 space-y-4">
          {error && <div className="p-3 rounded-lg border border-red-200 bg-red-50 text-sm text-red-700">{error}</div>}

          <div>
            <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1 block">Client *</label>
            <select value={form.contact_id} onChange={event => set('contact_id', event.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white">
              <option value="">Select client...</option>
              {contacts.map(contact => <option key={contact.id} value={contact.id}>{contact.full_name}</option>)}
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1 block">Invoice *</label>
            <select value={form.invoice_id} onChange={event => set('invoice_id', event.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white">
              <option value="">Select invoice...</option>
              {filteredInvoices.map(invoice => (
                <option key={invoice.id} value={invoice.id}>
                  {invoice.invoice_number} · R {(invoice.balance_due || invoice.total || 0).toLocaleString()} due
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1 block">Amount (R) *</label>
              <Input type="number" value={form.amount} onChange={event => set('amount', event.target.value)} placeholder="0.00" />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1 block">Payment Date</label>
              <Input type="date" value={form.payment_date} onChange={event => set('payment_date', event.target.value)} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1 block">Method</label>
              <select value={form.payment_method} onChange={event => set('payment_method', event.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white">
                {['EFT', 'Cash', 'Card', 'PayFast', 'Other'].map(method => <option key={method} value={method}>{method}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1 block">Reference</label>
              <Input value={form.reference} onChange={event => set('reference', event.target.value)} placeholder="Transaction ref" />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1 block">Notes</label>
            <textarea value={form.notes} onChange={event => set('notes', event.target.value)} rows={2} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm resize-none" placeholder="Optional notes..." />
          </div>
        </div>
        <div className="flex gap-3 p-6 border-t">
          <Button variant="outline" onClick={onClose} className="flex-1">Cancel</Button>
          <Button onClick={handleSave} disabled={saving || !form.contact_id || !form.invoice_id || !form.amount} className="flex-1 bg-[#B87333] hover:bg-[#A06828] text-white">
            {saving ? 'Saving...' : 'Record Payment'}
          </Button>
        </div>
      </div>
    </div>
  );
}
