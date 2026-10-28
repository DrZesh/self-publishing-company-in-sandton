import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { platform } from '@/api/platformClient';
import { toast } from 'sonner';
import { Plus, Trash2, Zap, ToggleLeft, ToggleRight } from 'lucide-react';

const TRIGGERS = [
  'project_created','project_approved','stage_changed','no_update_2_days',
  'payment_confirmed','proof_sent','proof_approved','client_no_response',
  'project_completed','files_received','files_required',
];
const ACTIONS = ['send_email','send_whatsapp','notify_admin','create_task','update_status','add_note','send_reminder','stop_automation'];
const TRIGGER_LABELS = {
  project_created: 'Project Created', project_approved: 'Project Approved',
  stage_changed: 'Stage Changed', no_update_2_days: 'No Update (2 Days)',
  payment_confirmed: 'Payment Confirmed', proof_sent: 'Proof Sent',
  proof_approved: 'Proof Approved', client_no_response: 'Client No Response',
  project_completed: 'Project Completed', files_received: 'Files Received', files_required: 'Files Required',
};
const ACTION_LABELS = {
  send_email: '📧 Send Email', send_whatsapp: '💬 WhatsApp', notify_admin: '🔔 Notify Admin',
  create_task: '✅ Create Task', update_status: '🔄 Update Status', add_note: '📝 Add Note',
  send_reminder: '⏰ Send Reminder', stop_automation: '🛑 Stop Automation',
};
const TRIGGER_COLORS = {
  project_created: '#6366f1', project_approved: '#16a34a', stage_changed: '#0ea5e9',
  no_update_2_days: '#f59e0b', payment_confirmed: '#16a34a', proof_sent: '#8b5cf6',
  proof_approved: '#16a34a', client_no_response: '#ef4444', project_completed: '#B87333',
  files_received: '#0ea5e9', files_required: '#f59e0b',
};

const BLANK = { name: '', trigger: 'stage_changed', trigger_stage: '', action: 'send_email', delay_minutes: 0, is_active: true, requires_approval: true };

export default function AutomationRulesTab() {
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(BLANK);
  const setF = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const { data: rules = [], isLoading } = useQuery({
    queryKey: ['automation-rules'],
    queryFn: () => platform.entities.AutomationRule.list('sort_order', 100),
  });

  const { data: templates = [] } = useQuery({
    queryKey: ['message-templates'],
    queryFn: () => platform.entities.MessageTemplate.list('name', 100),
  });

  const toggle = useMutation({
    mutationFn: ({ id, val }) => platform.entities.AutomationRule.update(id, { is_active: val }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['automation-rules'] }),
  });

  const remove = useMutation({
    mutationFn: (id) => platform.entities.AutomationRule.delete(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['automation-rules'] }); toast.success('Rule deleted'); },
  });

  const create = useMutation({
    mutationFn: () => platform.entities.AutomationRule.create({ ...form, sort_order: rules.length }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['automation-rules'] }); setShowForm(false); setForm(BLANK); toast.success('Rule created'); },
  });

  const activeCount = rules.filter(r => r.is_active).length;

  if (isLoading) return <div className="p-12 text-center text-gray-400">Loading rules…</div>;

  return (
    <div className="space-y-5">
      {/* Stats strip */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Total Rules', value: rules.length, color: '#6366f1' },
          { label: 'Active', value: activeCount, color: '#16a34a' },
          { label: 'Paused', value: rules.length - activeCount, color: '#94a3b8' },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-xl border border-gray-100 p-3 text-center">
            <p style={{ color: s.color }} className="text-2xl font-bold">{s.value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Add rule button */}
      <div className="flex justify-between items-center">
        <h3 className="text-sm font-bold text-gray-900">Automation Rules</h3>
        <button onClick={() => { setShowForm(true); setForm(BLANK); }}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-[#B87333] hover:bg-[#A06828] text-white text-xs font-bold rounded-lg transition-colors">
          <Plus className="w-3.5 h-3.5" /> New Rule
        </button>
      </div>

      {/* New rule form */}
      {showForm && (
        <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-5 space-y-4">
          <h4 className="text-sm font-bold text-indigo-900 flex items-center gap-2"><Zap className="w-4 h-4" /> New Automation Rule</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="md:col-span-2">
              <label className="text-xs font-bold text-gray-600 uppercase tracking-wide mb-1 block">Rule Name *</label>
              <input value={form.name} onChange={e => setF('name', e.target.value)} placeholder="e.g. Send Welcome Email on Project Created"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-indigo-400" />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-600 uppercase tracking-wide mb-1 block">Trigger (WHEN)</label>
              <select value={form.trigger} onChange={e => setF('trigger', e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white outline-none">
                {TRIGGERS.map(t => <option key={t} value={t}>{TRIGGER_LABELS[t] || t}</option>)}
              </select>
            </div>
            {form.trigger === 'stage_changed' && (
              <div>
                <label className="text-xs font-bold text-gray-600 uppercase tracking-wide mb-1 block">Specific Stage (optional)</label>
                <input value={form.trigger_stage} onChange={e => setF('trigger_stage', e.target.value)} placeholder="e.g. Editing"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-indigo-400" />
              </div>
            )}
            <div>
              <label className="text-xs font-bold text-gray-600 uppercase tracking-wide mb-1 block">Action (DO)</label>
              <select value={form.action} onChange={e => setF('action', e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white outline-none">
                {ACTIONS.map(a => <option key={a} value={a}>{ACTION_LABELS[a] || a}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-bold text-gray-600 uppercase tracking-wide mb-1 block">Template (optional)</label>
              <select value={form.template_id || ''} onChange={e => setF('template_id', e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white outline-none">
                <option value="">— No template —</option>
                {templates.map(t => <option key={t.id} value={t.id}>{t.name} ({t.channel})</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-bold text-gray-600 uppercase tracking-wide mb-1 block">Delay (minutes)</label>
              <input type="number" min="0" value={form.delay_minutes} onChange={e => setF('delay_minutes', Number(e.target.value))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-indigo-400" />
            </div>
          </div>
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 cursor-pointer text-sm text-gray-700">
              <input type="checkbox" checked={form.requires_approval} onChange={e => setF('requires_approval', e.target.checked)} className="accent-indigo-600" />
              Requires admin approval before sending
            </label>
            <label className="flex items-center gap-2 cursor-pointer text-sm text-gray-700">
              <input type="checkbox" checked={form.is_active} onChange={e => setF('is_active', e.target.checked)} className="accent-green-600" />
              Active
            </label>
          </div>
          <div className="flex gap-2">
            <button onClick={() => create.mutate()} disabled={!form.name || create.isPending}
              className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-sm font-bold rounded-lg transition-colors">
              {create.isPending ? 'Creating…' : '✓ Create Rule'}
            </button>
            <button onClick={() => setShowForm(false)} className="px-4 py-2 bg-white border border-gray-200 text-gray-600 text-sm rounded-lg hover:bg-gray-50">
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Rules list */}
      {rules.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 p-12 text-center">
          <Zap className="w-10 h-10 text-gray-200 mx-auto mb-3" />
          <p className="text-gray-400 text-sm">No automation rules yet — create your first rule above</p>
        </div>
      ) : (
        <div className="space-y-3">
          {rules.map(rule => {
            const tc = TRIGGER_COLORS[rule.trigger] || '#64748b';
            return (
              <div key={rule.id} style={{ opacity: rule.is_active ? 1 : 0.6 }}
                className="bg-white rounded-xl border border-gray-100 p-4 flex items-start gap-3">
                {/* Trigger badge */}
                <div style={{ background: tc + '18', border: `1px solid ${tc}40`, borderRadius: 10, padding: '6px 10px', flexShrink: 0 }}>
                  <p style={{ color: tc }} className="text-[10px] font-bold uppercase tracking-wide">{TRIGGER_LABELS[rule.trigger] || rule.trigger}</p>
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-gray-900">{rule.name}</p>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    <span className="text-xs text-gray-500">{ACTION_LABELS[rule.action] || rule.action}</span>
                    {rule.trigger_stage && <span className="text-[10px] bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full font-medium">Stage: {rule.trigger_stage}</span>}
                    {rule.requires_approval && <span className="text-[10px] bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full font-medium">Needs approval</span>}
                    {rule.delay_minutes > 0 && <span className="text-[10px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">+{rule.delay_minutes}m delay</span>}
                    {rule.run_count > 0 && <span className="text-[10px] text-gray-400">Ran {rule.run_count}×</span>}
                  </div>
                </div>

                {/* Toggle + delete */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button onClick={() => toggle.mutate({ id: rule.id, val: !rule.is_active })} title={rule.is_active ? 'Pause' : 'Activate'}>
                    {rule.is_active
                      ? <ToggleRight className="w-6 h-6 text-green-500 hover:text-green-700" />
                      : <ToggleLeft className="w-6 h-6 text-gray-300 hover:text-gray-400" />}
                  </button>
                  <button onClick={() => remove.mutate(rule.id)} className="p-1 hover:bg-red-50 rounded-lg text-gray-300 hover:text-red-500 transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}