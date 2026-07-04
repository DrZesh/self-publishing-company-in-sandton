import { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus, Edit3, Trash2, ChevronUp, ChevronDown, Save, X, Mail } from 'lucide-react';
import { WORKFLOWS as DEFAULT_WORKFLOWS, SERVICE_TYPES } from './WORKFLOWS';
import { supabase } from '@/api/supabaseClient';
import { toast } from 'sonner';

function cloneDefaults() {
  return JSON.parse(JSON.stringify(DEFAULT_WORKFLOWS));
}

export default function WorkflowSettings() {
  const queryClient = useQueryClient();
  const [workflows, setWorkflows] = useState(cloneDefaults);
  const [activeService, setActiveService] = useState(SERVICE_TYPES[0]);
  const [editingStage, setEditingStage] = useState(null);
  const [editVal, setEditVal] = useState('');

  const { data: storedRows = [], isLoading } = useQuery({
    queryKey: ['client-service-workflows'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('client_service_workflows')
        .select('*')
        .order('service_type');
      if (error) throw error;
      return data || [];
    },
    staleTime: 30000,
  });

  useEffect(() => {
    const merged = cloneDefaults();
    storedRows.forEach(row => {
      if (Array.isArray(row.stages)) merged[row.service_type] = row.stages;
    });
    setWorkflows(merged);
  }, [storedRows]);

  const saveMutation = useMutation({
    mutationFn: async ({ serviceType, stages }) => {
      const { data: { user } } = await supabase.auth.getUser();
      const { error } = await supabase
        .from('client_service_workflows')
        .upsert({
          service_type: serviceType,
          stages,
          updated_by: user?.email || 'Admin',
        }, { onConflict: 'service_type' });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['client-service-workflows'] });
      toast.success('Workflow saved');
    },
    onError: error => toast.error(`Workflow save failed: ${error.message}`),
  });

  const save = (nextWorkflows) => {
    setWorkflows(nextWorkflows);
    saveMutation.mutate({
      serviceType: activeService,
      stages: nextWorkflows[activeService] || [],
    });
  };

  const stages = workflows[activeService] || [];

  const addStage = () => {
    const updated = { ...workflows };
    updated[activeService] = [...(updated[activeService] || []), {
      key: `custom_${Date.now()}`,
      label: 'New Stage',
      subject: 'Update on Your Project',
      defaultBody: 'We have an update on your project. We will be in touch shortly.',
    }];
    save(updated);
  };

  const removeStage = (idx) => {
    if (!confirm('Remove this stage?')) return;
    const updated = { ...workflows };
    updated[activeService] = stages.filter((_, i) => i !== idx);
    save(updated);
  };

  const moveStage = (idx, dir) => {
    const arr = [...stages];
    const swap = idx + dir;
    if (swap < 0 || swap >= arr.length) return;
    [arr[idx], arr[swap]] = [arr[swap], arr[idx]];
    save({ ...workflows, [activeService]: arr });
  };

  const startEdit = (idx, field) => {
    setEditingStage({ idx, field });
    setEditVal(stages[idx][field] || '');
  };

  const commitEdit = () => {
    if (!editingStage) return;
    const arr = stages.map((stage, index) => (
      index === editingStage.idx
        ? { ...stage, [editingStage.field]: editVal }
        : stage
    ));
    save({ ...workflows, [activeService]: arr });
    setEditingStage(null);
  };

  const resetToDefaults = () => {
    if (!confirm('Reset this workflow to defaults? Custom changes will be lost.')) return;
    const updated = {
      ...workflows,
      [activeService]: JSON.parse(JSON.stringify(DEFAULT_WORKFLOWS[activeService] || [])),
    };
    save(updated);
  };

  if (isLoading) {
    return <div className="p-10 text-center text-sm text-slate-400">Loading workflow settings…</div>;
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-white/60 p-5" style={{ background: 'rgba(255,255,255,0.72)', backdropFilter: 'blur(20px)', boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>
        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Select Service Workflow</p>
        <div className="flex flex-wrap gap-2">
          {SERVICE_TYPES.map(service => (
            <button key={service} onClick={() => setActiveService(service)}
              className={`px-3 py-2 rounded-xl text-xs font-semibold border transition-all ${
                activeService === service
                  ? 'border-[#B87333] text-[#B87333] bg-[#B87333]/10'
                  : 'border-slate-200 text-slate-500 hover:border-slate-300'
              }`}>{service}</button>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-white/60 overflow-hidden" style={{ background: 'rgba(255,255,255,0.72)', backdropFilter: 'blur(20px)', boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <div>
            <h3 className="font-bold text-slate-800 text-sm">{activeService}</h3>
            <p className="text-xs text-slate-400">{stages.length} stages · stored in Supabase</p>
          </div>
          <div className="flex gap-2">
            <button onClick={resetToDefaults} className="text-xs font-medium text-slate-500 hover:text-red-500 px-3 py-1.5 rounded-lg hover:bg-red-50 border border-slate-200 transition-colors">Reset Defaults</button>
            <button onClick={addStage} className="flex items-center gap-1.5 text-xs font-bold text-white px-3 py-1.5 rounded-lg transition-all"
              style={{ background: 'linear-gradient(135deg,#B87333,#d4944a)' }}>
              <Plus className="w-3.5 h-3.5" /> Add Stage
            </button>
          </div>
        </div>
        <div className="divide-y divide-slate-50">
          {stages.map((stage, idx) => (
            <div key={stage.key} className="px-5 py-4 hover:bg-slate-50/60 transition-colors">
              <div className="flex items-start gap-3">
                <div className="flex flex-col gap-1 flex-shrink-0 mt-1">
                  <button onClick={() => moveStage(idx, -1)} disabled={idx === 0} className="p-1 rounded hover:bg-slate-100 disabled:opacity-30 transition-colors"><ChevronUp className="w-3 h-3 text-slate-400" /></button>
                  <button onClick={() => moveStage(idx, 1)} disabled={idx === stages.length - 1} className="p-1 rounded hover:bg-slate-100 disabled:opacity-30 transition-colors"><ChevronDown className="w-3 h-3 text-slate-400" /></button>
                </div>
                <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-[10px] font-bold text-white mt-1" style={{ background: 'linear-gradient(135deg,#6366f1,#818cf8)' }}>{idx + 1}</div>
                <div className="flex-1 min-w-0 space-y-2">
                  {editingStage?.idx === idx && editingStage.field === 'label' ? (
                    <div className="flex items-center gap-2">
                      <input value={editVal} onChange={e => setEditVal(e.target.value)} className="flex-1 border border-blue-300 rounded-lg px-2 py-1 text-sm focus:outline-none" />
                      <button onClick={commitEdit} className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg"><Save className="w-3.5 h-3.5" /></button>
                      <button onClick={() => setEditingStage(null)} className="p-1.5 text-slate-400 hover:bg-slate-100 rounded-lg"><X className="w-3.5 h-3.5" /></button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-slate-700">{stage.label}</p>
                      <button onClick={() => startEdit(idx, 'label')} className="p-1 text-slate-400 hover:text-blue-500 rounded-lg hover:bg-blue-50"><Edit3 className="w-3 h-3" /></button>
                      {stage.isWelcome && <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-amber-100 text-amber-700">Welcome</span>}
                    </div>
                  )}

                  {editingStage?.idx === idx && editingStage.field === 'subject' ? (
                    <div className="flex items-center gap-2">
                      <input value={editVal} onChange={e => setEditVal(e.target.value)} className="flex-1 border border-blue-300 rounded-lg px-2 py-1 text-xs focus:outline-none" />
                      <button onClick={commitEdit} className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg"><Save className="w-3 h-3" /></button>
                      <button onClick={() => setEditingStage(null)} className="p-1.5 text-slate-400 hover:bg-slate-100 rounded-lg"><X className="w-3 h-3" /></button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider flex-shrink-0">Subject:</span>
                      <p className="text-xs text-slate-500 truncate flex-1">{stage.subject}</p>
                      <button onClick={() => startEdit(idx, 'subject')} className="p-1 text-slate-300 hover:text-blue-500 rounded-lg hover:bg-blue-50 flex-shrink-0"><Edit3 className="w-3 h-3" /></button>
                    </div>
                  )}

                  {editingStage?.idx === idx && editingStage.field === 'defaultBody' ? (
                    <div className="space-y-2">
                      <p className="text-[9px] font-bold text-blue-500 uppercase tracking-wider flex items-center gap-1"><Mail className="w-3 h-3" /> Email Body (HTML allowed)</p>
                      <textarea value={editVal} onChange={e => setEditVal(e.target.value)} rows={8}
                        className="w-full border border-blue-300 rounded-lg px-3 py-2 text-xs focus:outline-none resize-y font-mono" />
                      <div className="flex gap-2">
                        <button onClick={commitEdit} className="flex items-center gap-1.5 text-xs font-semibold text-white px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-600"><Save className="w-3 h-3" /> Save Body</button>
                        <button onClick={() => setEditingStage(null)} className="text-xs text-slate-400 hover:text-slate-600 px-3 py-1.5 rounded-lg hover:bg-slate-100">Cancel</button>
                      </div>
                    </div>
                  ) : (
                    <div className="group flex items-start gap-2 p-2 rounded-lg bg-slate-50 border border-slate-100">
                      <Mail className="w-3 h-3 text-slate-400 flex-shrink-0 mt-0.5" />
                      <p className="text-xs text-slate-400 flex-1 line-clamp-2 leading-relaxed">
                        {(stage.defaultBody || '').replace(/<[^>]+>/g, '').substring(0, 120)}{(stage.defaultBody || '').length > 120 ? '…' : ''}
                      </p>
                      <button onClick={() => startEdit(idx, 'defaultBody')} className="p-1 text-slate-300 hover:text-blue-500 rounded-lg hover:bg-blue-50 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"><Edit3 className="w-3 h-3" /></button>
                    </div>
                  )}
                </div>
                <button onClick={() => removeStage(idx)} className="p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg flex-shrink-0 transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
