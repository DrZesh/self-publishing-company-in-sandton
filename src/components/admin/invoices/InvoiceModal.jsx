import { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { X, Plus, Trash2 } from 'lucide-react';

const generateInvoiceNumber = () => {
  const year = new Date().getFullYear();
  const rand = String(Math.floor(Math.random() * 9000) + 1000);
  return `INV-${year}-${rand}`;
};

export default function InvoiceModal({ contacts, invoice, onClose, onSaved }) {
  const [form, setForm] = useState({
    contact_id: invoice?.contact_id || '',
    invoice_number: invoice?.invoice_number || generateInvoiceNumber(),
    book_title: invoice?.book_title || '',
    status: invoice?.status || 'Draft',
    due_date: invoice?.due_date || '',
    include_vat: invoice?.include_vat ?? true,
    vat_rate: invoice?.vat_rate ?? 15,
    payment_terms: invoice?.payment_terms || 'Payment due within 7 days of invoice date.',
    banking_details: invoice?.banking_details || '',
    notes: invoice?.notes || '',
  });

  const [lineItems, setLineItems] = useState(invoice?.line_items || [
    { description: '', quantity: 1, unit_price: 0, line_total: 0 }
  ]);
  const [saving, setSaving] = useState(false);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const updateLine = (idx, field, value) => {
    setLineItems(prev => prev.map((item, i) => {
      if (i !== idx) return item;
      const updated = { ...item, [field]: value };
      updated.line_total = (parseFloat(updated.quantity) || 0) * (parseFloat(updated.unit_price) || 0);
      return updated;
    }));
  };

  const addLine = () => setLineItems(prev => [...prev, { description: '', quantity: 1, unit_price: 0, line_total: 0 }]);
  const removeLine = (idx) => setLineItems(prev => prev.filter((_, i) => i !== idx));

  const subtotal = lineItems.reduce((sum, l) => sum + (l.line_total || 0), 0);
  const vatAmount = form.include_vat ? subtotal * (form.vat_rate / 100) : 0;
  const total = subtotal + vatAmount;

  const handleSave = async () => {
    if (!form.contact_id || !form.invoice_number) return;
    setSaving(true);
    const data = { ...form, line_items: lineItems, subtotal, vat_amount: vatAmount, total, balance_due: total - (invoice?.amount_paid || 0) };
    if (invoice) await base44.entities.Invoice.update(invoice.id, data);
    else await base44.entities.Invoice.create(data);
    setSaving(false);
    onSaved();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b sticky top-0 bg-white z-10">
          <h2 className="text-lg font-bold text-gray-900">{invoice ? 'Edit Invoice' : 'New Invoice'}</h2>
          <button onClick={onClose}><X className="w-5 h-5 text-gray-400" /></button>
        </div>
        <div className="p-6 space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1 block">Client *</label>
              <select value={form.contact_id} onChange={e => set('contact_id', e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white">
                <option value="">Select client...</option>
                {contacts.map(c => <option key={c.id} value={c.id}>{c.full_name}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1 block">Invoice Number</label>
              <Input value={form.invoice_number} onChange={e => set('invoice_number', e.target.value)} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1 block">Book Title</label>
              <Input value={form.book_title} onChange={e => set('book_title', e.target.value)} placeholder="Book title" />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1 block">Due Date</label>
              <Input type="date" value={form.due_date} onChange={e => set('due_date', e.target.value)} />
            </div>
          </div>

          {/* Line Items */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Line Items</label>
              <Button variant="outline" size="sm" onClick={addLine}><Plus className="w-3 h-3 mr-1" /> Add</Button>
            </div>
            <div className="border border-gray-200 rounded-xl overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left px-3 py-2 text-xs text-gray-500 font-semibold">Description</th>
                    <th className="text-right px-3 py-2 text-xs text-gray-500 font-semibold w-16">Qty</th>
                    <th className="text-right px-3 py-2 text-xs text-gray-500 font-semibold w-24">Unit Price</th>
                    <th className="text-right px-3 py-2 text-xs text-gray-500 font-semibold w-24">Total</th>
                    <th className="w-8"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {lineItems.map((item, idx) => (
                    <tr key={idx}>
                      <td className="px-3 py-2">
                        <input value={item.description} onChange={e => updateLine(idx, 'description', e.target.value)} className="w-full text-sm border-none outline-none bg-transparent" placeholder="Service description" />
                      </td>
                      <td className="px-3 py-2">
                        <input type="number" value={item.quantity} onChange={e => updateLine(idx, 'quantity', e.target.value)} className="w-full text-sm border-none outline-none bg-transparent text-right" />
                      </td>
                      <td className="px-3 py-2">
                        <input type="number" value={item.unit_price} onChange={e => updateLine(idx, 'unit_price', e.target.value)} className="w-full text-sm border-none outline-none bg-transparent text-right" />
                      </td>
                      <td className="px-3 py-2 text-right font-medium">R {(item.line_total || 0).toLocaleString()}</td>
                      <td className="px-3 py-2">
                        <button onClick={() => removeLine(idx)} className="text-gray-300 hover:text-red-400"><Trash2 className="w-4 h-4" /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Totals */}
          <div className="bg-gray-50 rounded-xl p-4 space-y-2">
            <div className="flex justify-between text-sm"><span className="text-gray-600">Subtotal</span><span className="font-medium">R {subtotal.toLocaleString()}</span></div>
            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 text-gray-600">
                <input type="checkbox" checked={form.include_vat} onChange={e => set('include_vat', e.target.checked)} className="rounded" />
                VAT ({form.vat_rate}%)
              </label>
              <span className="font-medium">R {vatAmount.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-base font-bold border-t pt-2"><span>Total</span><span className="text-[#B87333]">R {total.toLocaleString()}</span></div>
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1 block">Payment Terms</label>
            <textarea value={form.payment_terms} onChange={e => set('payment_terms', e.target.value)} rows={2} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm resize-none" />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1 block">Banking Details</label>
            <textarea value={form.banking_details} onChange={e => set('banking_details', e.target.value)} rows={3} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm resize-none" placeholder="Bank name, account number, branch code..." />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1 block">Notes</label>
            <textarea value={form.notes} onChange={e => set('notes', e.target.value)} rows={2} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm resize-none" placeholder="Additional notes..." />
          </div>
        </div>
        <div className="flex gap-3 p-6 border-t sticky bottom-0 bg-white">
          <Button variant="outline" onClick={onClose} className="flex-1">Cancel</Button>
          <Button onClick={handleSave} disabled={saving || !form.contact_id} className="flex-1 bg-[#B87333] hover:bg-[#A06828] text-white">
            {saving ? 'Saving...' : 'Save Invoice'}
          </Button>
        </div>
      </div>
    </div>
  );
}