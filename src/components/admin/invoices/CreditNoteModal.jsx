import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, Save } from 'lucide-react';
import { platform } from '@/api/platformClient';
import { toast } from 'sonner';

const GLASS = {
  background: 'rgba(255,255,255,0.95)',
  backdropFilter: 'blur(24px)',
  border: '1px solid rgba(255,255,255,0.5)',
  boxShadow: '0 24px 64px rgba(0,0,0,0.15)'
};

export default function CreditNoteModal({ creditNote, invoice, onClose, onSaved }) {
  const [loading, setLoading] = useState(false);
  const [lineItems, setLineItems] = useState([]);
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    reason: '',
    notes: '',
  });

  useEffect(() => {
    if (creditNote) {
      setFormData({
        date: creditNote.date || new Date().toISOString().split('T')[0],
        reason: creditNote.reason || '',
        notes: creditNote.notes || '',
      });
      setLineItems(creditNote.line_items || []);
    } else if (invoice) {
      // Pre-populate with invoice line items (negative values)
      setLineItems((invoice.line_items || []).map(item => {
        return { ...item, line_total: -(item.line_total || 0) };
      }));
    }
  }, [creditNote, invoice]);

  const addLineItem = () => {
    setLineItems([...lineItems, { description: '', quantity: 1, unit_price: 0, line_total: 0 }]);
  };

  const removeLineItem = (index) => {
    setLineItems(lineItems.filter((_, i) => i !== index));
  };

  const updateLineItem = (index, field, value) => {
    const updated = [...lineItems];
    updated[index] = { ...updated[index], [field]: value };
    
    if (field === 'quantity' || field === 'unit_price') {
      const qty = field === 'quantity' ? value : updated[index].quantity;
      const price = field === 'unit_price' ? value : updated[index].unit_price;
      updated[index].line_total = -(Math.abs(Number(qty)) * Math.abs(Number(price)));
    }
    
    setLineItems(updated);
  };

  const calculateTotals = () => {
    const subtotal = lineItems.reduce((sum, item) => sum + (Number(item.line_total) || 0), 0);
    const vatAmount = subtotal * 0.15; // Assuming 15% VAT
    const total = subtotal + vatAmount;
    return { subtotal, vat_amount: vatAmount, total };
  };

  const handleSave = async () => {
    if (!invoice) {
      toast.error('No invoice selected');
      return;
    }
    if (lineItems.length === 0) {
      toast.error('Please add at least one line item');
      return;
    }
    if (!formData.reason) {
      toast.error('Please provide a reason for the credit note');
      return;
    }

    setLoading(true);
    try {
      const totals = calculateTotals();
      const contact = await platform.entities.Contact.get(invoice.contact_id);
      
      const creditNoteData = {
        invoice_id: invoice.id,
        invoice_number: invoice.invoice_number,
        contact_id: invoice.contact_id,
        contact_snapshot: invoice.contact_snapshot,
        date: formData.date,
        reason: formData.reason,
        line_items: lineItems,
        subtotal: totals.subtotal,
        vat_rate: 15,
        vat_amount: totals.vat_amount,
        total: totals.total,
      };

      if (creditNote) {
        await platform.entities.CreditNote.update(creditNote.id, creditNoteData);
        toast.success('Credit note updated');
      } else {
        // Get next credit note number
        const existing = await platform.entities.CreditNote.list('-created_date', 1);
        const nextNum = existing.length 
          ? `CN-${String(parseInt(existing[0].credit_note_number.replace('CN-', '')) + 1).padStart(4, '0')}`
          : 'CN-0001';
        
        await platform.entities.CreditNote.create({
          ...creditNoteData,
          credit_note_number: nextNum,
        });
        toast.success('Credit note created');
      }
      
      onSaved?.();
    } catch (error) {
      toast.error(error.message || 'Failed to save credit note');
    } finally {
      setLoading(false);
    }
  };

  const totals = calculateTotals();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-3xl" style={GLASS}>
        <div className="sticky top-0 z-10 flex items-center justify-between p-6 bg-white/80 backdrop-blur border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {creditNote ? 'Edit Credit Note' : 'Create Credit Note'}
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              {invoice ? `For invoice ${invoice.invoice_number}` : ''}
            </p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
            <X className="w-6 h-6 text-gray-500" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Reason */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Reason for Credit Note *</label>
            <select
              value={formData.reason}
              onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            >
              <option value="">Select a reason</option>
              <option value="Cancelled order">Cancelled order</option>
              <option value="Returned goods">Returned goods</option>
              <option value="Pricing error">Pricing error</option>
              <option value="Damaged goods">Damaged goods</option>
              <option value="Service issue">Service issue</option>
              <option value="Overpayment">Overpayment</option>
              <option value="Other">Other</option>
            </select>
          </div>

          {/* Date */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Credit Note Date</label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            />
          </div>

          {/* Line Items */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="block text-sm font-semibold text-gray-700">Line Items</label>
              <button
                onClick={addLineItem}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors text-sm font-medium"
              >
                <Plus className="w-4 h-4" /> Add Item
              </button>
            </div>

            <div className="space-y-3">
              {lineItems.map((item, index) => (
                <div key={index} className="flex gap-3 items-start p-4 bg-white rounded-xl border border-gray-200">
                  <div className="flex-1">
                    <input
                      type="text"
                      value={item.description}
                      onChange={(e) => updateLineItem(index, 'description', e.target.value)}
                      placeholder="Description"
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm"
                    />
                  </div>
                  <div className="w-24">
                    <input
                      type="number"
                      value={Math.abs(item.quantity || 1)}
                      onChange={(e) => updateLineItem(index, 'quantity', parseFloat(e.target.value) || 1)}
                      placeholder="Qty"
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm"
                    />
                  </div>
                  <div className="w-32">
                    <input
                      type="number"
                      value={Math.abs(item.unit_price || 0)}
                      onChange={(e) => updateLineItem(index, 'unit_price', parseFloat(e.target.value) || 0)}
                      placeholder="Price"
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm"
                    />
                  </div>
                  <div className="w-32">
                    <div className="px-3 py-2 bg-red-50 rounded-lg border border-red-200 text-sm font-medium text-red-700">
                      -R {Math.abs(item.line_total || 0).toLocaleString('en-ZA', { minimumFractionDigits: 2 })}
                    </div>
                  </div>
                  <button
                    onClick={() => removeLineItem(index)}
                    className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Totals */}
          <div className="flex justify-end">
            <div className="w-full max-w-sm space-y-3 p-4 bg-red-50 rounded-xl border border-red-200">
              <div className="flex justify-between text-sm">
                <span className="text-red-800">Subtotal:</span>
                <span className="font-medium text-red-900">-R {Math.abs(totals.subtotal).toLocaleString('en-ZA', { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-red-800">VAT (15%):</span>
                <span className="font-medium text-red-900">-R {Math.abs(totals.vat_amount).toLocaleString('en-ZA', { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between text-lg font-bold pt-3 border-t border-red-200">
                <span className="text-red-900">Total Credit:</span>
                <span className="text-red-600">-R {Math.abs(totals.total).toLocaleString('en-ZA', { minimumFractionDigits: 2 })}</span>
              </div>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Notes (Optional)</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={3}
              className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
              placeholder="Additional notes..."
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-6 border-t border-gray-200">
            <button
              onClick={onClose}
              className="px-6 py-3 text-gray-700 font-medium hover:bg-gray-100 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={loading}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              <Save className="w-5 h-5" />
              {loading ? 'Saving...' : (creditNote ? 'Update Credit Note' : 'Create Credit Note')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}