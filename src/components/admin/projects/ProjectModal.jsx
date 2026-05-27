import { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { X } from 'lucide-react';

const STAGES = [
  'Enquiry Received', 'Quote Sent', 'Quote Accepted', 'Contract Sent', 'Contract Signed',
  'Payment Received', 'Manuscript Received', 'Editing', 'Proofreading', 'Typesetting',
  'Cover Design', 'Client Approval', 'Changes Requested', 'Final Approval Received',
  'Sample Print Queued', 'Sample Print Completed', 'Mass Production Started',
  'Ready for Collection', 'Courier Booked', 'Delivered', 'Completed'
];

const SERVICE_TYPES = [
  'Full Publishing Package', 'Printing Only', 'Editing Only', 'Cover Design Only',
  'Typesetting Only', 'Ebook', 'Ghostwriting', "Children's Book", 'Academic Editing', 'Custom'
];

export default function ProjectModal({ contacts, project, onClose, onSaved }) {
  const [form, setForm] = useState({
    contact_id: project?.contact_id || '',
    book_title: project?.book_title || '',
    author_name: project?.author_name || '',
    service_type: project?.service_type || 'Full Publishing Package',
    stage: project?.stage || 'Enquiry Received',
    deadline: project?.deadline || '',
    project_value: project?.project_value || '',
    payment_status: project?.payment_status || 'Unpaid',
    contract_status: project?.contract_status || 'Not Sent',
    assigned_manager: project?.assigned_manager || '',
    notes: project?.notes || '',
  });
  const [saving, setSaving] = useState(false);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSave = async () => {
    if (!form.contact_id || !form.book_title) return;
    setSaving(true);
    const data = { ...form, project_value: parseFloat(form.project_value) || 0, stage_changed_at: new Date().toISOString() };
    if (project) await base44.entities.Project.update(project.id, data);
    else await base44.entities.Project.create(data);
    setSaving(false);
    onSaved();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-lg font-bold text-gray-900">{project ? 'Edit Project' : 'New Project'}</h2>
          <button onClick={onClose}><X className="w-5 h-5 text-gray-400" /></button>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1 block">Client *</label>
            <select value={form.contact_id} onChange={e => set('contact_id', e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white">
              <option value="">Select client...</option>
              {contacts.map(c => <option key={c.id} value={c.id}>{c.full_name} — {c.email}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1 block">Book Title *</label>
            <Input value={form.book_title} onChange={e => set('book_title', e.target.value)} placeholder="Enter book title" />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1 block">Author Name</label>
            <Input value={form.author_name} onChange={e => set('author_name', e.target.value)} placeholder="Author name" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1 block">Service Type</label>
              <select value={form.service_type} onChange={e => set('service_type', e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white">
                {SERVICE_TYPES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1 block">Current Stage</label>
              <select value={form.stage} onChange={e => set('stage', e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white">
                {STAGES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1 block">Project Value (R)</label>
              <Input type="number" value={form.project_value} onChange={e => set('project_value', e.target.value)} placeholder="0.00" />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1 block">Deadline</label>
              <Input type="date" value={form.deadline} onChange={e => set('deadline', e.target.value)} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1 block">Payment Status</label>
              <select value={form.payment_status} onChange={e => set('payment_status', e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white">
                {['Unpaid', 'Deposit Paid', 'Partially Paid', 'Fully Paid', 'Overdue'].map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1 block">Contract Status</label>
              <select value={form.contract_status} onChange={e => set('contract_status', e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white">
                {['Not Sent', 'Sent', 'Signed', 'Expired'].map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1 block">Internal Notes</label>
            <textarea value={form.notes} onChange={e => set('notes', e.target.value)} rows={3} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm resize-none" placeholder="Internal notes..." />
          </div>
        </div>
        <div className="flex gap-3 p-6 border-t">
          <Button variant="outline" onClick={onClose} className="flex-1">Cancel</Button>
          <Button onClick={handleSave} disabled={saving || !form.contact_id || !form.book_title} className="flex-1 bg-[#B87333] hover:bg-[#A06828] text-white">
            {saving ? 'Saving...' : 'Save Project'}
          </Button>
        </div>
      </div>
    </div>
  );
}