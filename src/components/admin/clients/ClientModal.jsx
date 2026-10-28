import React, { useState } from 'react';
import { X } from 'lucide-react';

const FIELD = ({ label, children }) => (
  <div>
    <label className="block text-xs font-semibold text-black/50 uppercase tracking-wide mb-1.5">{label}</label>
    {children}
  </div>
);

const inp = "w-full px-3 py-2.5 border border-black/15 rounded-xl text-sm focus:outline-none focus:border-[#B87333]";

export default function ClientModal({ client, onClose, onSave }) {
  const [form, setForm] = useState({
    full_name: client?.full_name || '',
    contact_person: client?.contact_person || '',
    email: client?.email || '',
    phone: client?.phone || '',
    company: client?.company || '',
    billing_address: client?.billing_address || '',
    vat_number: client?.vat_number || '',
    lifecycle_stage: client?.lifecycle_stage || 'customer',
    description: client?.description || '',
  });
  const [saving, setSaving] = useState(false);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSave = async () => {
    if (!form.full_name || !form.email) return;
    setSaving(true);
    await onSave(form);
    setSaving(false);
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="sticky top-0 bg-white border-b border-black/8 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-[#1A1208]">{client ? 'Edit Client' : 'New Client'}</h2>
          <button onClick={onClose} className="p-2 hover:bg-black/5 rounded-lg"><X className="w-5 h-5" /></button>
        </div>
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <FIELD label="Client Name *">
              <input value={form.full_name} onChange={e => set('full_name', e.target.value)} className={inp} placeholder="Jane Smith" />
            </FIELD>
            <FIELD label="Contact Person">
              <input value={form.contact_person} onChange={e => set('contact_person', e.target.value)} className={inp} placeholder="Accounts Manager" />
            </FIELD>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <FIELD label="Email *">
              <input type="email" value={form.email} onChange={e => set('email', e.target.value)} className={inp} placeholder="jane@example.com" />
            </FIELD>
            <FIELD label="Phone">
              <input value={form.phone} onChange={e => set('phone', e.target.value)} className={inp} placeholder="+27 82 000 0000" />
            </FIELD>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <FIELD label="Company">
              <input value={form.company} onChange={e => set('company', e.target.value)} className={inp} placeholder="Company name" />
            </FIELD>
            <FIELD label="VAT Number (optional)">
              <input value={form.vat_number} onChange={e => set('vat_number', e.target.value)} className={inp} placeholder="4123456789" />
            </FIELD>
          </div>
          <FIELD label="Billing Address">
            <textarea value={form.billing_address} onChange={e => set('billing_address', e.target.value)} rows={2}
              className={inp + " resize-none"} placeholder="123 Main Street, Sandton, 2196" />
          </FIELD>
          <FIELD label="Status">
            <select value={form.lifecycle_stage} onChange={e => set('lifecycle_stage', e.target.value)} className={inp}>
              {['subscriber','lead','customer','repeat_customer','past_customer'].map(s => (
                <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>
              ))}
            </select>
          </FIELD>
          <FIELD label="Notes">
            <textarea value={form.description} onChange={e => set('description', e.target.value)} rows={2}
              className={inp + " resize-none"} placeholder="Internal notes…" />
          </FIELD>
          <div className="flex gap-3 pt-2">
            <button onClick={handleSave} disabled={saving || !form.full_name || !form.email}
              className="flex-1 py-3 bg-[#B87333] text-white rounded-xl font-semibold text-sm hover:bg-[#a06428] disabled:opacity-50 transition-colors">
              {saving ? 'Saving…' : client ? 'Save Changes' : 'Create Client'}
            </button>
            <button onClick={onClose} className="px-5 py-3 border border-black/15 text-black/60 rounded-xl font-semibold text-sm hover:bg-black/5">Cancel</button>
          </div>
        </div>
      </div>
    </div>
  );
}