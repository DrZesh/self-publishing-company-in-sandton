import { useState } from 'react';
import { platform } from '@/api/platformClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { X, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import ZohoBooksSync from '@/components/admin/ZohoBooksSync';

export default function PaymentModal({ contacts, invoices, payment, onClose, onSaved }) {
  const [form, setForm] = useState({
    contact_id: payment?.contact_id || '',
    invoice_id: payment?.invoice_id || '',
    amount: payment?.amount || '',
    payment_date: payment?.payment_date || new Date().toISOString().split('T')[0],
    payment_method: payment?.payment_method || 'EFT',
    reference: payment?.reference || '',
    notes: payment?.notes || '',
  });
  const [saving, setSaving] = useState(false);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const filteredInvoices = form.contact_id
    ? invoices.filter(i => i.contact_id === form.contact_id && !['Paid'].includes(i.status))
    : invoices.filter(i => !['Paid'].includes(i.status));

  const selectedInvoice = invoices.find(i => i.id === form.invoice_id);

  const handleSave = async () => {
    if (!form.contact_id || !form.invoice_id || !form.amount) {
      toast.error('Please fill in all required fields');
      return;
    }
    if (parseFloat(form.amount) <= 0) {
      toast.error('Amount must be greater than 0');
      return;
    }
    setSaving(true);
    try {
      const res = await platform.functions.invoke('paymentActions', {
        action: 'record',
        invoice_id: form.invoice_id,
        contact_id: form.contact_id,
        amount: parseFloat(form.amount),
        payment_date: form.payment_date,
        payment_method: form.payment_method,
        reference: form.reference,
        notes: form.notes,
      });
      if (res.data?.success) {
        toast.success(`Payment recorded — Receipt ${res.data.receipt?.receipt_number} generated`);
        onSaved(res.data.receipt);
      } else {
        toast.error(res.data?.error || 'Failed to record payment');
        setSaving(false);
      }
    } catch (e) {
      toast.error(e.message || 'Failed to record payment');
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Record Payment</h2>
            <p className="text-xs text-gray-400 mt-0.5">A receipt will be auto-generated</p>
          </div>
          <button onClick={onClose}><X className="w-5 h-5 text-gray-400" /></button>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1 block">Client *</label>
            <select value={form.contact_id} onChange={e => { set('contact_id', e.target.value); set('invoice_id', ''); }} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white">
              <option value="">Select client…</option>
              {contacts.map(c => <option key={c.id} value={c.id}>{c.full_name}</option>)}
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1 block">Invoice *</label>
            <select value={form.invoice_id} onChange={e => {
              const inv = invoices.find(i => i.id === e.target.value);
              set('invoice_id', e.target.value);
              if (inv) set('amount', (inv.balance_due || inv.total || 0).toString());
            }} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white">
              <option value="">Select invoice…</option>
              {filteredInvoices.map(i => (
                <option key={i.id} value={i.id}>
                  {i.invoice_number} — R {Number(i.balance_due || i.total || 0).toFixed(2)} due
                </option>
              ))}
            </select>
            {selectedInvoice && (
              <div className="mt-1.5 text-xs text-gray-500 flex gap-3">
                <span>Total: R {Number(selectedInvoice.total || 0).toFixed(2)}</span>
                <span>Paid: R {Number(selectedInvoice.amount_paid || 0).toFixed(2)}</span>
                <span className="text-orange-600 font-medium">Balance: R {Number(selectedInvoice.balance_due || 0).toFixed(2)}</span>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1 block">Amount (R) *</label>
              <Input type="number" value={form.amount} onChange={e => set('amount', e.target.value)} placeholder="0.00" min="0" step="0.01" />
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
                {['EFT', 'Card', 'Cash', 'Other'].map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1 block">Reference</label>
              <Input value={form.reference} onChange={e => set('reference', e.target.value)} placeholder="Transaction ref" />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1 block">Notes</label>
            <textarea value={form.notes} onChange={e => set('notes', e.target.value)} rows={2} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm resize-none" placeholder="Optional notes…" />
          </div>
        </div>

        {/* Zoho Books Sync - only show after payment is saved */}
        {payment && (
          <div className="px-6 pb-4">
            <ZohoBooksSync entityName="Payment" entityId={payment.id} entityData={payment} />
          </div>
        )}

        <div className="flex gap-3 p-6 border-t">
          <Button variant="outline" onClick={onClose} className="flex-1">Cancel</Button>
          <Button onClick={handleSave} disabled={saving} className="flex-1 bg-[#B87333] hover:bg-[#A06828] text-white">
            {saving ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Recording…</> : 'Record Payment'}
          </Button>
        </div>
      </div>
    </div>
  );
}