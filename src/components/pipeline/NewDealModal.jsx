import { useState } from 'react';
import { platform } from '@/api/platformClient';
import { toast } from 'sonner';
import { CheckCircle, Plus } from 'lucide-react';

const PACKAGE_TYPES = ['Full publishing', 'Editing only', 'Cover + layout', 'Typesetting', 'Print run', 'Other'];

const STAGE_OPTIONS = [
  { label: 'Inquiry',   pipeline_stage: 'New Enquiry' },
  { label: 'Quotation', pipeline_stage: 'Quote Sent' },
];

const field = (label, required) => (
  <label style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: 5 }}>
    {label}{required && <span style={{ color: '#e11d48', marginLeft: 2 }}>*</span>}
  </label>
);

const inputStyle = { width: '100%', border: '1px solid #e7e8f0', borderRadius: 8, padding: '8px 12px', fontSize: 13, boxSizing: 'border-box', outline: 'none', fontFamily: 'inherit' };

export default function NewDealModal({ onClose, onCreated }) {
  const [form, setForm] = useState({
    full_name: '',
    email: '',
    phone: '',
    book_title: '',
    pipeline_value: '',
    stage: 'New Enquiry',
    package_type: '',
    pipeline_owner: '',
  });
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const valid = form.full_name.trim() && form.email.trim();

  const handleSave = async () => {
    if (!valid) return;
    setSaving(true);
    await platform.entities.Contact.create({
      full_name: form.full_name.trim(),
      email: form.email.trim(),
      phone: form.phone.trim() || undefined,
      book_title: form.book_title.trim() || undefined,
      pipeline_value: form.pipeline_value ? Number(form.pipeline_value) : undefined,
      pipeline_stage: form.stage,
      package_type: form.package_type || undefined,
      pipeline_owner: form.pipeline_owner.trim() || undefined,
      pipeline_stage_changed_at: new Date().toISOString(),
      lifecycle_stage: 'lead',
    });
    setSaving(false);
    setDone(true);
    toast.success(`Deal created for ${form.full_name}`);
    setTimeout(() => { onCreated(); onClose(); }, 1200);
  };

  return (
    <div
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', zIndex: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}
      onClick={onClose}
    >
      <div
        style={{ background: '#fff', borderRadius: 18, boxShadow: '0 24px 64px rgba(0,0,0,0.3)', maxWidth: 500, width: '100%', padding: 28, maxHeight: '90vh', overflowY: 'auto' }}
        onClick={e => e.stopPropagation()}
      >
        {done ? (
          <div style={{ textAlign: 'center', padding: '32px 0' }}>
            <CheckCircle style={{ width: 52, height: 52, color: '#16a34a', margin: '0 auto 12px' }} />
            <p style={{ fontWeight: 700, fontSize: 18, color: '#1e1e2e' }}>Deal Created!</p>
            <p style={{ fontSize: 13, color: '#64748b', marginTop: 4 }}>It will appear on the board momentarily.</p>
          </div>
        ) : (
          <>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 22 }}>
              <div>
                <h2 style={{ fontWeight: 700, fontSize: 18, color: '#1e1e2e', margin: 0 }}>New Deal</h2>
                <p style={{ fontSize: 12, color: '#94a3b8', margin: '3px 0 0' }}>Create a contact and add them to the pipeline</p>
              </div>
              <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 22, color: '#94a3b8', lineHeight: 1 }}>✕</button>
            </div>

            {/* Form */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {/* Name + Email */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  {field('Full Name', true)}
                  <input value={form.full_name} onChange={e => set('full_name', e.target.value)} placeholder="Jane Smith" style={inputStyle} />
                </div>
                <div>
                  {field('Email', true)}
                  <input type="email" value={form.email} onChange={e => set('email', e.target.value)} placeholder="jane@email.com" style={inputStyle} />
                </div>
              </div>

              {/* Phone + Book title */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  {field('Phone')}
                  <input value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="082 000 0000" style={inputStyle} />
                </div>
                <div>
                  {field('Book Title')}
                  <input value={form.book_title} onChange={e => set('book_title', e.target.value)} placeholder="e.g. My Memoir" style={inputStyle} />
                </div>
              </div>

              {/* Value + Stage */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  {field('Deal Value (R)')}
                  <input type="number" value={form.pipeline_value} onChange={e => set('pipeline_value', e.target.value)} placeholder="0" style={inputStyle} />
                </div>
                <div>
                  {field('Starting Stage')}
                  <select value={form.stage} onChange={e => set('stage', e.target.value)} style={{ ...inputStyle, color: '#374151' }}>
                    {STAGE_OPTIONS.map(s => <option key={s.pipeline_stage} value={s.pipeline_stage}>{s.label}</option>)}
                  </select>
                </div>
              </div>

              {/* Package + Owner */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  {field('Package Type')}
                  <select value={form.package_type} onChange={e => set('package_type', e.target.value)} style={{ ...inputStyle, color: form.package_type ? '#374151' : '#94a3b8' }}>
                    <option value="">Select…</option>
                    {PACKAGE_TYPES.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
                <div>
                  {field('Owner')}
                  <input value={form.pipeline_owner} onChange={e => set('pipeline_owner', e.target.value)} placeholder="Assigned to…" style={inputStyle} />
                </div>
              </div>
            </div>

            {/* Footer */}
            <div style={{ display: 'flex', gap: 10, marginTop: 22 }}>
              <button onClick={onClose} style={{ flex: 1, padding: '11px 0', border: '1px solid #e7e8f0', borderRadius: 9, fontSize: 13, background: '#fff', cursor: 'pointer', color: '#374151' }}>
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving || !valid}
                style={{ flex: 2, padding: '11px 0', background: '#4f46e5', color: '#fff', border: 'none', borderRadius: 9, fontSize: 13, fontWeight: 700, cursor: valid ? 'pointer' : 'not-allowed', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, opacity: (!valid || saving) ? 0.5 : 1 }}
              >
                <Plus style={{ width: 15, height: 15 }} />
                {saving ? 'Creating…' : 'Create Deal'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}