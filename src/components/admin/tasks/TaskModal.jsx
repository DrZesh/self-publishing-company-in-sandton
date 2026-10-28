import { useState } from 'react';
import { platform } from '@/api/platformClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { X } from 'lucide-react';

const TASK_TYPES = [
  'Quote Follow-up', 'Payment Follow-up', 'Contract Reminder', 'Client Approval',
  'Production Deadline', 'Collection Reminder', 'Reprint Follow-up', 'Review Request', 'General'
];

export default function TaskModal({ contacts, task, onClose, onSaved }) {
  const [form, setForm] = useState({
    title: task?.title || '',
    task_type: task?.task_type || 'General',
    contact_id: task?.contact_id || '',
    due_date: task?.due_date ? task.due_date.split('T')[0] : '',
    priority: task?.priority || 'Medium',
    status: task?.status || 'Pending',
    assigned_to: task?.assigned_to || '',
    notes: task?.notes || '',
  });
  const [saving, setSaving] = useState(false);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSave = async () => {
    if (!form.title || !form.due_date) return;
    setSaving(true);
    const data = { ...form, due_date: new Date(form.due_date).toISOString() };
    if (task) await platform.entities.Task.update(task.id, data);
    else await platform.entities.Task.create(data);
    setSaving(false);
    onSaved();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-lg font-bold text-gray-900">{task ? 'Edit Task' : 'New Task'}</h2>
          <button onClick={onClose}><X className="w-5 h-5 text-gray-400" /></button>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1 block">Title *</label>
            <Input value={form.title} onChange={e => set('title', e.target.value)} placeholder="Task title" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1 block">Task Type</label>
              <select value={form.task_type} onChange={e => set('task_type', e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white">
                {TASK_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1 block">Priority</label>
              <select value={form.priority} onChange={e => set('priority', e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white">
                {['Low', 'Medium', 'High', 'Urgent'].map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1 block">Client</label>
              <select value={form.contact_id} onChange={e => set('contact_id', e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white">
                <option value="">No client</option>
                {contacts.map(c => <option key={c.id} value={c.id}>{c.full_name}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1 block">Due Date *</label>
              <Input type="date" value={form.due_date} onChange={e => set('due_date', e.target.value)} />
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1 block">Assigned To</label>
            <Input value={form.assigned_to} onChange={e => set('assigned_to', e.target.value)} placeholder="Staff email" />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1 block">Notes</label>
            <textarea value={form.notes} onChange={e => set('notes', e.target.value)} rows={3} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm resize-none" placeholder="Optional notes..." />
          </div>
        </div>
        <div className="flex gap-3 p-6 border-t">
          <Button variant="outline" onClick={onClose} className="flex-1">Cancel</Button>
          <Button onClick={handleSave} disabled={saving || !form.title || !form.due_date} className="flex-1 bg-[#B87333] hover:bg-[#A06828] text-white">
            {saving ? 'Saving...' : 'Save Task'}
          </Button>
        </div>
      </div>
    </div>
  );
}