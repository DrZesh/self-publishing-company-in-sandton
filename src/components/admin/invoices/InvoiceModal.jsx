import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, Copy, Save, Send, Download } from 'lucide-react';
import { platform } from '@/api/platformClient';
import { toast } from 'sonner';

const GLASS = { 
  background: 'rgba(255,255,255,0.95)', 
  backdropFilter: 'blur(24px)', 
  border: '1px solid rgba(255,255,255,0.5)',
  boxShadow: '0 24px 64px rgba(0,0,0,0.15)'
};

export default function InvoiceModal({ invoice, contacts, onClose, onSaved }) {
  const [loading, setLoading] = useState(false);
  const [selectedContact, setSelectedContact] = useState(null);
  const [lineItems, setLineItems] = useState([]);
  const [formData, setFormData] = useState({
    invoice_number: '',
    issue_date: new Date().toISOString().split('T')[0],
    due_date: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
    book_title: '',
    notes: '',
    payment_terms: 'Payment due within 7 days of invoice date.',
    include_vat: true,
    vat_rate: 15,
    status: 'Draft',
  });

  useEffect(() => {
    if (invoice) {
      setFormData({
        invoice_number: invoice.invoice_number || '',
        issue_date: invoice.issue_date || new Date().toISOString().split('T')[0],
        due_date: invoice.due_date || new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
        book_title: invoice.book_title || '',
        notes: invoice.notes || '',
        payment_terms: invoice.payment_terms || 'Payment due within 7 days of invoice date.',
        include_vat: invoice.include_vat !== false,
        vat_rate: invoice.vat_rate || 15,
        status: invoice.status || 'Draft',
      });
      setLineItems(invoice.line_items || []);
      setSelectedContact(invoice.contact_id);
    }
  }, [invoice]);

  const addLineItem = () => {
    setLineItems([...lineItems, { description: '', quantity: 1, unit_price: 0, line_total: 0 }]);
  };

  const removeLineItem = (index) => {
    setLineItems(lineItems.filter((_, i) => i !== index));
  };

  const duplicateLineItem = (index) => {
    setLineItems([...lineItems, { ...lineItems[index] }]);
  };

  const updateLineItem = (index, field, value) => {
    const updated = [...lineItems];
    updated[index] = { ...updated[index], [field]: value };
    
    // Auto-calculate line total
    if (field === 'quantity' || field === 'unit_price') {
      const qty = field === 'quantity' ? value : updated[index].quantity;
      const price = field === 'unit_price' ? value : updated[index].unit_price;
      updated[index].line_total = Number(qty) * Number(price);
    }
    
    setLineItems(updated);
  };

  const calculateTotals = () => {
    const subtotal = lineItems.reduce((sum, item) => sum + (Number(item.line_total) || 0), 0);
    const vatAmount = formData.include_vat ? subtotal * (formData.vat_rate / 100) : 0;
    const total = subtotal + vatAmount;
    return { subtotal, vat_amount: vatAmount, total };
  };

  const handleSave = async () => {
    if (!selectedContact) {
      toast.error('Please select a client');
      return;
    }
    if (lineItems.length === 0) {
      toast.error('Please add at least one line item');
      return;
    }

    setLoading(true);
    try {
      const totals = calculateTotals();
      
      const invoiceData = {
        ...formData,
        contact_id: selectedContact,
        line_items: lineItems,
        subtotal: totals.subtotal,
        vat_amount: totals.vat_amount,
        total: totals.total,
        balance_due: totals.total,
        amount_paid: 0,
      };

      const action = invoice ? 'update' : 'create';
      const payload = invoice 
        ? { action, invoice_id: invoice.id, ...invoiceData }
        : { action, ...invoiceData };

      const res = await platform.functions.invoke('invoiceActions', payload);
      
      if (res.data?.error) throw new Error(res.data.error);
      
      toast.success(invoice ? 'Invoice updated successfully' : 'Invoice created successfully');
      onSaved();
    } catch (error) {
      toast.error(error.message || 'Failed to save invoice');
    } finally {
      setLoading(false);
    }
  };

  const totals = calculateTotals();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div 
        className="w-full max-w-5xl max-h-[90vh] overflow-y-auto rounded-3xl"
        style={GLASS}
      >
        <div className="sticky top-0 z-10 flex items-center justify-between p-6 bg-white/80 backdrop-blur border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {invoice ? 'Edit Invoice' : 'Create New Invoice'}
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              {invoice ? `Invoice #${invoice.invoice_number}` : 'Generate a professional invoice'}
            </p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
            <X className="w-6 h-6 text-gray-500" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Client Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Client *</label>
              <select
                value={selectedContact || ''}
                onChange={(e) => setSelectedContact(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
              >
                <option value="">Select a client</option>
                {contacts.map(contact => (
                  <option key={contact.id} value={contact.id}>
                    {contact.full_name} {contact.company ? `(${contact.company})` : ''}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Book Title / Project</label>
              <input
                type="text"
                value={formData.book_title}
                onChange={(e) => setFormData({ ...formData, book_title: e.target.value })}
                placeholder="e.g., Novel Editing, Book Printing"
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
              />
            </div>
          </div>

          {/* Invoice Details */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Invoice Number</label>
              <input
                type="text"
                value={formData.invoice_number}
                onChange={(e) => setFormData({ ...formData, invoice_number: e.target.value })}
                placeholder="Auto-generated if empty"
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Invoice Date</label>
              <input
                type="date"
                value={formData.issue_date}
                onChange={(e) => setFormData({ ...formData, issue_date: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Due Date</label>
              <input
                type="date"
                value={formData.due_date}
                onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
              />
            </div>
          </div>

          {/* Line Items */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="block text-sm font-semibold text-gray-700">Line Items *</label>
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
                      value={item.quantity}
                      onChange={(e) => updateLineItem(index, 'quantity', parseFloat(e.target.value) || 0)}
                      placeholder="Qty"
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm"
                    />
                  </div>
                  <div className="w-32">
                    <input
                      type="number"
                      value={item.unit_price}
                      onChange={(e) => updateLineItem(index, 'unit_price', parseFloat(e.target.value) || 0)}
                      placeholder="Price"
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm"
                    />
                  </div>
                  <div className="w-32">
                    <div className="px-3 py-2 bg-gray-50 rounded-lg border border-gray-200 text-sm font-medium text-gray-900">
                      R {(item.line_total || 0).toLocaleString('en-ZA', { minimumFractionDigits: 2 })}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => duplicateLineItem(index)}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                      title="Duplicate"
                    >
                      <Copy className="w-4 h-4 text-gray-500" />
                    </button>
                    <button
                      onClick={() => removeLineItem(index)}
                      className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                      title="Remove"
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Totals */}
          <div className="flex justify-end">
            <div className="w-full max-w-sm space-y-3 p-4 bg-white rounded-xl border border-gray-200">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Subtotal:</span>
                <span className="font-medium">R {totals.subtotal.toLocaleString('en-ZA', { minimumFractionDigits: 2 })}</span>
              </div>
              {formData.include_vat && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">VAT ({formData.vat_rate}%):</span>
                  <span className="font-medium">R {totals.vat_amount.toLocaleString('en-ZA', { minimumFractionDigits: 2 })}</span>
                </div>
              )}
              <div className="flex justify-between text-lg font-bold pt-3 border-t border-gray-200">
                <span className="text-gray-900">Total:</span>
                <span className="text-blue-600">R {totals.total.toLocaleString('en-ZA', { minimumFractionDigits: 2 })}</span>
              </div>
            </div>
          </div>

          {/* Notes & Terms */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Notes (Visible to Client)</label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={3}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all resize-none"
                placeholder="Additional notes for the client..."
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Payment Terms</label>
              <textarea
                value={formData.payment_terms}
                onChange={(e) => setFormData({ ...formData, payment_terms: e.target.value })}
                rows={3}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all resize-none"
                placeholder="Payment terms and conditions..."
              />
            </div>
          </div>

          {/* VAT Toggle */}
          <div className="flex items-center gap-3 p-4 bg-white rounded-xl border border-gray-200">
            <input
              type="checkbox"
              id="include_vat"
              checked={formData.include_vat}
              onChange={(e) => setFormData({ ...formData, include_vat: e.target.checked })}
              className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
            />
            <label htmlFor="include_vat" className="text-sm font-medium text-gray-700">
              Include VAT ({formData.vat_rate}%)
            </label>
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
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="w-5 h-5" />
              {loading ? 'Saving...' : (invoice ? 'Update Invoice' : 'Create Invoice')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}