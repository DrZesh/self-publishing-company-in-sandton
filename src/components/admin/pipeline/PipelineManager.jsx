import { useState, useRef } from 'react';
import { X, Plus, Trash2, ChevronUp, ChevronDown, Save, Edit3, Trophy, XCircle, Copy, ToggleLeft, ToggleRight } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

const inputClass = "w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-blue-400 bg-white transition-all";

const COLORS = ['#6366f1', '#3b82f6', '#8b5cf6', '#f59e0b', '#f97316', '#10b981', '#ef4444', '#06b6d4', '#ec4899'];

function StageRow({ stage, idx, total, onChange, onRemove, onMove, onToggleWon, onToggleLost }) {
  const [editing, setEditing] = useState(false);
  const ref = useRef(null);

  const commit = () => {
    const val = ref.current?.value?.trim();
    if (val) onChange({ ...stage, label: val });
    setEditing(false);
  };

  return (
    <div className="flex items-center gap-2 p-2.5 rounded-xl border border-slate-100 bg-white hover:bg-slate-50/60 transition-colors">
      {/* Order controls */}
      <div className="flex flex-col gap-0.5">
        <button onClick={() => onMove(idx, -1)} disabled={idx === 0} className="p-0.5 rounded hover:bg-slate-100 disabled:opacity-20"><ChevronUp className="w-3 h-3 text-slate-400" /></button>
        <button onClick={() => onMove(idx, 1)} disabled={idx === total - 1} className="p-0.5 rounded hover:bg-slate-100 disabled:opacity-20"><ChevronDown className="w-3 h-3 text-slate-400" /></button>
      </div>

      {/* Color dot */}
      <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: stage.color || '#6366f1' }} />

      {/* Label */}
      <div className="flex-1 min-w-0">
        {editing ? (
          <div className="flex items-center gap-1">
            <input ref={ref} defaultValue={stage.label} className="flex-1 border border-blue-300 rounded-lg px-2 py-1 text-xs focus:outline-none" onKeyDown={e => e.key === 'Enter' && commit()} />
            <button onClick={commit} className="p-1 text-emerald-600 hover:bg-emerald-50 rounded"><Save className="w-3 h-3" /></button>
          </div>
        ) : (
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-semibold text-slate-700">{stage.label}</span>
            {stage.isWon && <span className="text-[9px] bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded-full font-bold">WON</span>}
            {stage.isLost && <span className="text-[9px] bg-red-100 text-red-700 px-1.5 py-0.5 rounded-full font-bold">LOST</span>}
            <button onClick={() => setEditing(true)} className="p-0.5 text-slate-300 hover:text-blue-500 rounded"><Edit3 className="w-3 h-3" /></button>
          </div>
        )}
      </div>

      {/* Won / Lost toggles */}
      <button title={stage.isWon ? 'Won (click to unset)' : 'Mark as Won'}
        onClick={() => onToggleWon(idx)}
        className={`p-1 rounded-lg transition-colors ${stage.isWon ? 'bg-emerald-100 text-emerald-600' : 'text-slate-300 hover:text-emerald-500 hover:bg-emerald-50'}`}>
        <Trophy className="w-3.5 h-3.5" />
      </button>
      <button title={stage.isLost ? 'Lost (click to unset)' : 'Mark as Lost'}
        onClick={() => onToggleLost(idx)}
        className={`p-1 rounded-lg transition-colors ${stage.isLost ? 'bg-red-100 text-red-500' : 'text-slate-300 hover:text-red-400 hover:bg-red-50'}`}>
        <XCircle className="w-3.5 h-3.5" />
      </button>

      <button onClick={() => { if (confirm('Remove this stage?')) onRemove(idx); }}
        className="p-1 text-slate-200 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
        <Trash2 className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

export default function PipelineManager({ pipelines, templates, onClose, onPipelinesChanged, onTemplatesChanged, initialView = 'list' }) {
  const [view, setView] = useState(initialView); // 'list' | 'edit' | 'new' | 'templates'
  const [editingPipeline, setEditingPipeline] = useState(null);
  const [stages, setStages] = useState([]);
  const [saving, setSaving] = useState(false);
  const nameRef = useRef(null);

  const startEdit = (pipeline) => {
    setEditingPipeline(pipeline);
    setStages(JSON.parse(JSON.stringify(pipeline.stages || [])));
    setView('edit');
  };

  const startNew = (fromTemplate = null) => {
    const baseStages = fromTemplate
      ? JSON.parse(JSON.stringify(fromTemplate.stages))
      : [
          { key: 'enquiry', label: 'Enquiry', color: '#6366f1', order: 0 },
          { key: 'won', label: 'Won', color: '#10b981', isWon: true, order: 1 },
          { key: 'lost', label: 'Lost', color: '#ef4444', isLost: true, order: 2 },
        ];
    setEditingPipeline(null);
    setStages(baseStages);
    setView('new');
  };

  const addStage = () => {
    const newS = {
      key: 'stage_' + Date.now(),
      label: 'New Stage',
      color: COLORS[stages.length % COLORS.length],
      order: stages.length,
    };
    setStages(s => [...s, newS]);
  };

  const updateStage = (idx, updated) => setStages(s => s.map((st, i) => i === idx ? updated : st));
  const removeStage = (idx) => setStages(s => s.filter((_, i) => i !== idx));

  const moveStage = (idx, dir) => {
    const arr = [...stages];
    const swap = idx + dir;
    if (swap < 0 || swap >= arr.length) return;
    [arr[idx], arr[swap]] = [arr[swap], arr[idx]];
    setStages(arr.map((s, i) => ({ ...s, order: i })));
  };

  const toggleWon = (idx) => {
    setStages(s => s.map((st, i) => ({
      ...st,
      isWon: i === idx ? !st.isWon : false,
    })));
  };

  const toggleLost = (idx) => {
    setStages(s => s.map((st, i) => ({
      ...st,
      isLost: i === idx ? !st.isLost : false,
    })));
  };

  const savePipeline = async () => {
    const name = nameRef.current?.value?.trim();
    if (!name) { toast.error('Pipeline name is required'); return; }
    if (!stages.some(s => s.isWon)) { toast.error('At least one stage must be marked as Won'); return; }
    setSaving(true);
    try {
      const data = { name, stages: stages.map((s, i) => ({ ...s, order: i })), is_active: true };
      if (editingPipeline) {
        await base44.entities.SalesPipeline.update(editingPipeline.id, data);
        toast.success('Pipeline saved');
      } else {
        await base44.entities.SalesPipeline.create(data);
        toast.success('Pipeline created');
      }
      onPipelinesChanged();
      setView('list');
    } catch (err) {
      toast.error('Save failed: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const deletePipeline = async (p) => {
    if (!confirm(`Delete pipeline "${p.name}"? All its deals will also be deleted.`)) return;
    await base44.entities.SalesPipeline.delete(p.id);
    onPipelinesChanged();
    toast.success('Pipeline deleted');
  };

  const duplicatePipeline = async (p) => {
    await base44.entities.SalesPipeline.create({
      name: p.name + ' (Copy)',
      stages: JSON.parse(JSON.stringify(p.stages)),
      is_active: true,
    });
    onPipelinesChanged();
    toast.success('Pipeline duplicated');
  };

  const saveAsTemplate = async (p) => {
    const name = prompt('Template name:', p.name + ' Template');
    if (!name) return;
    await base44.entities.PipelineTemplate.create({
      name,
      stages: JSON.parse(JSON.stringify(p.stages)),
      is_default: false,
    });
    onTemplatesChanged();
    toast.success('Saved as template');
  };

  const toggleActive = async (p) => {
    await base44.entities.SalesPipeline.update(p.id, { is_active: !p.is_active });
    onPipelinesChanged();
  };

  const deleteTemplate = async (t) => {
    if (!confirm(`Delete template "${t.name}"?`)) return;
    await base44.entities.PipelineTemplate.delete(t.id);
    onTemplatesChanged();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      <div className="relative w-full max-w-xl max-h-[92vh] overflow-y-auto rounded-3xl shadow-2xl border border-white/60 bg-white"
        onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-5 border-b border-slate-100 bg-white rounded-t-3xl">
          <div className="flex items-center gap-3">
            {(view === 'edit' || view === 'new') && (
              <button onClick={() => setView('list')} className="text-xs text-slate-400 hover:text-slate-700 px-2 py-1 rounded-lg hover:bg-slate-100">← Back</button>
            )}
            {view === 'templates' && (
              <button onClick={() => setView('list')} className="text-xs text-slate-400 hover:text-slate-700 px-2 py-1 rounded-lg hover:bg-slate-100">← Back</button>
            )}
            <h2 className="text-lg font-bold text-slate-800">
              {view === 'list' && 'Manage Pipelines'}
              {view === 'edit' && 'Edit Pipeline'}
              {view === 'new' && 'New Pipeline'}
              {view === 'templates' && 'Template Library'}
            </h2>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-xl flex items-center justify-center hover:bg-slate-100 transition-colors">
            <X className="w-4 h-4 text-slate-500" />
          </button>
        </div>

        <div className="p-6 space-y-4">

          {/* LIST */}
          {view === 'list' && (
            <>
              <div className="flex gap-2">
                <button onClick={() => startNew()} className="flex items-center gap-1.5 text-xs font-bold text-white px-3 py-2 rounded-xl"
                  style={{ background: 'linear-gradient(135deg,#B87333,#d4944a)' }}>
                  <Plus className="w-3.5 h-3.5" /> New Pipeline
                </button>
                <button onClick={() => setView('templates')} className="text-xs font-semibold text-slate-600 px-3 py-2 rounded-xl border border-slate-200 hover:bg-slate-50">
                  📋 Templates
                </button>
              </div>
              {pipelines.length === 0 && (
                <p className="text-sm text-slate-400 text-center py-6">No pipelines yet. Create your first one.</p>
              )}
              <div className="space-y-2">
                {pipelines.map(p => (
                  <div key={p.id} className="flex items-center gap-2 p-3 rounded-xl border border-slate-100 bg-slate-50/60 hover:bg-slate-100/60 transition-colors">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-700 truncate">{p.name}</p>
                      <p className="text-xs text-slate-400">{p.stages?.length || 0} stages · {p.is_active ? 'Active' : 'Inactive'}</p>
                    </div>
                    <button onClick={() => toggleActive(p)} title={p.is_active ? 'Deactivate' : 'Activate'} className="p-1.5 rounded-lg hover:bg-slate-200 transition-colors">
                      {p.is_active ? <ToggleRight className="w-4 h-4 text-emerald-500" /> : <ToggleLeft className="w-4 h-4 text-slate-400" />}
                    </button>
                    <button onClick={() => saveAsTemplate(p)} title="Save as template" className="p-1.5 rounded-lg text-slate-400 hover:text-violet-500 hover:bg-violet-50 transition-colors">
                      <Save className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => duplicatePipeline(p)} title="Duplicate" className="p-1.5 rounded-lg text-slate-400 hover:text-blue-500 hover:bg-blue-50 transition-colors">
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => startEdit(p)} className="p-1.5 rounded-lg text-slate-400 hover:text-blue-500 hover:bg-blue-50 transition-colors">
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => deletePipeline(p)} className="p-1.5 rounded-lg text-slate-300 hover:text-red-500 hover:bg-red-50 transition-colors">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* TEMPLATES */}
          {view === 'templates' && (
            <>
              <p className="text-xs text-slate-500">Start a new pipeline from a template, or manage your saved templates.</p>
              <div className="space-y-2">
                {templates.map(t => (
                  <div key={t.id || t.name} className="flex items-center gap-2 p-3 rounded-xl border border-slate-100 bg-slate-50/60">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold text-slate-700">{t.name}</p>
                        {t.is_default && <span className="text-[9px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded-full font-bold">DEFAULT</span>}
                      </div>
                      <p className="text-xs text-slate-400">{t.stages?.length} stages: {t.stages?.map(s => s.label).join(' → ')}</p>
                    </div>
                    <button onClick={() => { startNew(t); setView('new'); }}
                      className="text-xs font-semibold text-[#B87333] hover:text-[#a06428] px-2.5 py-1.5 rounded-lg hover:bg-amber-50 transition-colors">
                      Use
                    </button>
                    {!t.is_default && (
                      <button onClick={() => deleteTemplate(t)} className="p-1.5 rounded-lg text-slate-300 hover:text-red-500 hover:bg-red-50 transition-colors">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}

          {/* EDIT / NEW */}
          {(view === 'edit' || view === 'new') && (
            <>
              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1.5">Pipeline Name</label>
                <input ref={nameRef} defaultValue={editingPipeline?.name || ''} className={inputClass} placeholder="e.g. Book Publishing Pipeline" />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Stages</p>
                  <button onClick={addStage} className="flex items-center gap-1 text-xs font-bold text-[#B87333] hover:text-[#a06428] px-2 py-1 rounded-lg hover:bg-amber-50 transition-colors">
                    <Plus className="w-3.5 h-3.5" /> Add Stage
                  </button>
                </div>
                <div className="space-y-1.5">
                  {stages.map((stage, idx) => (
                    <StageRow key={stage.key} stage={stage} idx={idx} total={stages.length}
                      onChange={updated => updateStage(idx, updated)}
                      onRemove={() => removeStage(idx)}
                      onMove={(i, dir) => moveStage(i, dir)}
                      onToggleWon={() => toggleWon(idx)}
                      onToggleLost={() => toggleLost(idx)}
                    />
                  ))}
                </div>
                {!stages.some(s => s.isWon) && (
                  <p className="text-xs text-amber-600 mt-2 flex items-center gap-1">
                    ⚠️ Mark one stage as <strong>Won</strong> using the trophy icon.
                  </p>
                )}
              </div>

              <button onClick={savePipeline} disabled={saving}
                className="w-full flex items-center justify-center gap-2 py-3 text-sm font-bold text-white rounded-xl disabled:opacity-50 transition-all"
                style={{ background: 'linear-gradient(135deg,#B87333,#d4944a)' }}>
                {saving ? 'Saving...' : (editingPipeline ? 'Save Changes' : 'Create Pipeline')}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}