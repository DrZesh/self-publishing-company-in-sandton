import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { X, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const TRIGGERS = [
  { value: 'project_created', label: 'Project Created' },
  { value: 'project_approved', label: 'Project Approved' },
  { value: 'stage_changed', label: 'Stage Changed' },
  { value: 'no_update_2_days', label: 'No Update for 2 Days' },
  { value: 'payment_confirmed', label: 'Payment Confirmed' },
  { value: 'proof_sent', label: 'Proof Sent' },
  { value: 'proof_approved', label: 'Proof Approved' },
  { value: 'files_received', label: 'Files Received' },
  { value: 'project_completed', label: 'Project Completed' },
  { value: 'client_no_response', label: 'Client No Response' },
];

const ACTIONS = [
  { value: 'send_email', label: 'Send Email' },
  { value: 'send_whatsapp', label: 'Send WhatsApp' },
  { value: 'notify_admin', label: 'Notify Admin' },
  { value: 'create_task', label: 'Create Task' },
  { value: 'add_note', label: 'Add Note' },
  { value: 'stop_automation', label: 'Stop Automation' },
];

const DEFAULT_CONDITIONS = {
  only_if_automation_enabled: true,
  skip_if_do_not_contact: true,
  skip_if_unsubscribed: true,
  require_email_exists: true,
  only_if_active: false,
  skip_if_already_sent: true,
};

export default function RuleModal({ rule, onClose, onSaved }) {
  const isEdit = !!rule?.id;
  const [form, setForm] = useState({
    name: '', trigger: 'stage_changed', action: 'send_email',
    template_id: '', template_name: '', requires_approval: false,
    delay_minutes: 0, is_active: true, trigger_stage: '',
    conditions: DEFAULT_CONDITIONS,
  });
  const [saving, setSaving] = useState(false);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const setCond = (k, v) => setForm(f => ({ ...f, conditions: { ...f.conditions, [k]: v } }));

  const { data: templates = [] } = useQuery({
    queryKey: ['message-templates-all'],
    queryFn: () => base44.entities.MessageTemplate.filter({ channel: 'email', is_active: true }),
  });

  useEffect(() => {
    if (rule) setForm({
      name: rule.name || '',
      trigger: rule.trigger || 'stage_changed',
      action: rule.action || 'send_email',
      template_id: rule.template_id || '',
      template_name: rule.template_name || '',
      requires_approval: rule.requires_approval || false,
      delay_minutes: rule.delay_minutes || 0,
      is_active: rule.is_active !== false,
      trigger_stage: rule.trigger_stage || '',
      conditions: { ...DEFAULT_CONDITIONS, ...(rule.conditions || {}) },
    });
  }, [rule]);

  const handleSave = async () => {
    if (!form.name || !form.trigger || !form.action) { toast.error('Name, trigger, and action are required'); return; }
    setSaving(true);
    const selectedTemplate = templates.find(t => t.id === form.template_id);
    const data = { ...form, template_name: selectedTemplate?.name || form.template_name };
    if (isEdit) await base44.entities.AutomationRule.update(rule.id, data);
    else await base44.entities.AutomationRule.create(data);
    setSaving(false);
    toast.success(isEdit ? 'Rule updated' : 'Rule created');
    onSaved();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 overflow-auto">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl flex flex-col max-h-[95vh]">
        <div className="flex items-center justify-between p-5 border-b flex-shrink-0">
          <h2 className="font-bold text-gray-900 text-lg">{isEdit ? 'Edit Rule' : 'New Automation Rule'}</h2>
          <Button variant="ghost" size="icon" onClick={onClose}><X className="w-4 h-4" /></Button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          <div>
            <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1 block">Rule Name *</label>
            <Input value={form.name} onChange={e => set('name', e.target.value)} placeholder="e.g. Send Welcome on Project Created" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1 block">WHEN (Trigger) *</label>
              <select value={form.trigger} onChange={e => set('trigger', e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white">
                {TRIGGERS.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1 block">THEN (Action) *</label>
              <select value={form.action} onChange={e => set('action', e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white">
                {ACTIONS.map(a => <option key={a.value} value={a.value}>{a.label}</option>)}
              </select>
            </div>
          </div>

          {form.trigger === 'stage_changed' && (
            <div>
              <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1 block">Only when stage changes TO (optional)</label>
              <Input value={form.trigger_stage} onChange={e => set('trigger_stage', e.target.value)} placeholder="e.g. Client Approval (leave blank for any stage)" />
            </div>
          )}

          {(form.action === 'send_email' || form.action === 'send_whatsapp') && (
            <div>
              <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1 block">Using Template</label>
              <select value={form.template_id} onChange={e => set('template_id', e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white">
                <option value="">— Select a template —</option>
                {templates.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </div>
          )}

          <div>
            <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2 block">Conditions</label>
            <div className="bg-gray-50 rounded-xl p-3 space-y-2">
              {[
                ['only_if_automation_enabled', 'Only if project automation is enabled'],
                ['skip_if_do_not_contact', 'Skip if client is marked Do Not Contact'],
                ['skip_if_unsubscribed', 'Skip if client has unsubscribed'],
                ['require_email_exists', 'Require client email to exist'],
                ['only_if_active', 'Skip if project is Completed'],
                ['skip_if_already_sent', 'Skip if same message already sent (dedup)'],
              ].map(([key, label]) => (
                <label key={key} className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={!!form.conditions[key]} onChange={e => setCond(key, e.target.checked)} className="w-3.5 h-3.5 accent-[#B87333]" />
                  <span className="text-sm text-gray-700">{label}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1 block">Delay (minutes)</label>
              <Input type="number" min="0" value={form.delay_minutes} onChange={e => set('delay_minutes', Number(e.target.value))} />
            </div>
            <div className="flex flex-col gap-2 pt-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.requires_approval} onChange={e => set('requires_approval', e.target.checked)} className="w-4 h-4 accent-[#B87333]" />
                <span className="text-sm text-gray-700">Requires admin approval before sending</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.is_active} onChange={e => set('is_active', e.target.checked)} className="w-4 h-4 accent-[#B87333]" />
                <span className="text-sm text-gray-700">Active</span>
              </label>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 p-5 border-t flex-shrink-0">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave} disabled={saving} className="bg-[#B87333] hover:bg-[#A06828] text-white gap-2">
            {saving && <Loader2 className="w-4 h-4 animate-spin" />}
            {saving ? 'Saving...' : isEdit ? 'Save Changes' : 'Create Rule'}
          </Button>
        </div>
      </div>
    </div>
  );
}