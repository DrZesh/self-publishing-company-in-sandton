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

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const filteredInvoices = form.contact_id ? invoices.filter(i => i.contact_id === form.contact_id) : invoices;

  const handleSave = async () => {
    if (!form.contact_id || !form.invoice_id || !form.amount) return;
    setSaving(true);
    const data = { ...form, amount: parseFloat(form.amount) || 0 };

    if (payment) {
      await base44.entities.Payment.update(payment.id, data);
    } else {
      await base44.entities.Payment.create(data);
      // Update invoice amount_paid and balance_due
      const inv = invoices.find(i => i.id === form.invoice_id);
      if (inv) {
        const newAmountPaid = (inv.amount_paid || 0) + data.amount;
        const newBalance = Math.max(0, (inv.total || 0) - newAmountPaid);
        const newStatus = newBalance <= 0 ? 'Paid' : newAmountPaid > 0 ? 'Partially Paid' : inv.status;
        await base44.entities.Invoice.update(inv.id, { amount_paid: newAmountPaid, balance_due: newBalance, status: newStatus });
      }
    }
    setSaving(false);
    onSaved();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-lg font-bold text-gray-900">Record Payment</h2>
          <button onClick={onClose}><X className="w-5 h-5 text-gray-400" /></button>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1 block">Client *</label>
            <select value={form.contact_id} onChange={e => set('contact_id', e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white">
              <option value="">Select client...</option>
              {contacts.map(c => <option key={c.id} value={c.id}>{c.full_name}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1 block">Invoice *</label>
            <select value={form.invoice_id} onChange={e => set('invoice_id', e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white">
              <option value="">Select invoice...</option>
              {filteredInvoices.map(i => <option key={i.id} value={i.id}>{i.invoice_number} — R {(i.balance_due || i.total || 0).toLocaleString()} due</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1 block">Amount (R) *</label>
              <Input type="number" value={form.amount} onChange={e => set('amount', e.target.value)} placeholder="0.00" />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1 block">Payment Date</label>
              <Input type="date" value={form.payment_date} onChange={e => set('payment_date', e.target.value)} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1 block">Method</label>
              <select value={form.payment_method} onChange={e => set('payment_method', e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white">
                {['EFT', 'Cash', 'Card', 'PayFast', 'Other'].map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1 block">Reference</label>
              <Input value={form.reference} onChange={e => set('reference', e.target.value)} placeholder="Transaction ref" />
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1 block">Notes</label>
            <textarea value={form.notes} onChange={e => set('notes', e.target.value)} rows={2} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm resize-none" placeholder="Optional notes..." />
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