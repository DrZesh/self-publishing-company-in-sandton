import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import AdminLayout from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { Plus, GripVertical, Trash2, ChevronDown, ChevronRight, Check, Star, Layers, ArrowLeft, Save, Copy } from 'lucide-react';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';

const STAGE_COLORS = ['#3b82f6','#8b5cf6','#ec4899','#f59e0b','#10b981','#14b8a6','#f97316','#ef4444','#84cc16','#06b6d4','#B87333','#6366f1'];
const STAGE_ICONS = ['📥','💬','📋','📤','✍️','💰','📁','✏️','🎨','📐','🖨️','✅','🚚','⭐','❌'];

const TEMPLATES = {
  'Sales Pipeline': [
    { name: 'New Enquiry', color: '#3b82f6', icon: '📥' },
    { name: 'Information Requested', color: '#8b5cf6', icon: '💬' },
    { name: 'Quote in Progress', color: '#6366f1', icon: '📋' },
    { name: 'Quote Sent', color: '#ec4899', icon: '📤' },
    { name: 'Payment Pending', color: '#f59e0b', icon: '💰' },
    { name: 'Project Started', color: '#10b981', icon: '✅' },
    { name: 'Completed', color: '#14b8a6', icon: '⭐' },
    { name: 'Lost', color: '#ef4444', icon: '❌' },
  ],
  'Full Publishing Workflow': [
    { name: 'New Enquiry', color: '#3b82f6', icon: '📥' },
    { name: 'Quote Sent', color: '#8b5cf6', icon: '📤' },
    { name: 'Quote Accepted', color: '#6366f1', icon: '✍️' },
    { name: 'Contract Sent', color: '#ec4899', icon: '📋' },
    { name: 'Contract Signed', color: '#f59e0b', icon: '✅' },
    { name: 'Payment Received', color: '#10b981', icon: '💰' },
    { name: 'Manuscript Received', color: '#14b8a6', icon: '📁' },
    { name: 'Editing', color: '#f97316', icon: '✏️' },
    { name: 'Cover Design', color: '#ec4899', icon: '🎨' },
    { name: 'Typesetting', color: '#8b5cf6', icon: '📐' },
    { name: 'Proof Approval', color: '#f59e0b', icon: '👁️' },
    { name: 'Sample Print', color: '#B87333', icon: '🖨️' },
    { name: 'Mass Production', color: '#14b8a6', icon: '🏭' },
    { name: 'Ready for Collection', color: '#10b981', icon: '📦' },
    { name: 'Delivered', color: '#22c55e', icon: '🚚' },
    { name: 'Completed', color: '#16a34a', icon: '⭐' },
  ],
  'Printing Workflow': [
    { name: 'New Order', color: '#3b82f6', icon: '📥' },
    { name: 'Specs Confirmed', color: '#8b5cf6', icon: '📋' },
    { name: 'Files Received', color: '#f59e0b', icon: '📁' },
    { name: 'Proof Sent', color: '#f97316', icon: '📤' },
    { name: 'Proof Approved', color: '#10b981', icon: '✅' },
    { name: 'Sample Print', color: '#B87333', icon: '🖨️' },
    { name: 'Mass Production', color: '#14b8a6', icon: '🏭' },
    { name: 'Quality Check', color: '#6366f1', icon: '🔍' },
    { name: 'Ready for Collection', color: '#22c55e', icon: '📦' },
    { name: 'Delivered', color: '#16a34a', icon: '🚚' },
  ],
  'Contract Signing': [
    { name: 'Draft', color: '#6b7280', icon: '📄' },
    { name: 'Sent for Signature', color: '#3b82f6', icon: '📤' },
    { name: 'Opened', color: '#f59e0b', icon: '👁️' },
    { name: 'Signing Started', color: '#8b5cf6', icon: '✍️' },
    { name: 'Signed', color: '#10b981', icon: '✅' },
    { name: 'Declined', color: '#ef4444', icon: '❌' },
    { name: 'Archived', color: '#6b7280', icon: '🗃️' },
  ],
  'Invoice & Payment': [
    { name: 'Draft Invoice', color: '#6b7280', icon: '📄' },
    { name: 'Invoice Sent', color: '#3b82f6', icon: '📤' },
    { name: 'Viewed', color: '#f59e0b', icon: '👁️' },
    { name: 'Partial Payment', color: '#f97316', icon: '💸' },
    { name: 'Fully Paid', color: '#10b981', icon: '✅' },
    { name: 'Overdue', color: '#ef4444', icon: '⚠️' },
  ],
};

function newStage(order) {
  return {
    id: crypto.randomUUID(),
    name: 'New Stage',
    color: STAGE_COLORS[order % STAGE_COLORS.length],
    icon: '📌',
    order,
    checklist: [],
    requirements: [],
    assigned_to: '',
  };
}

export default function AdminPipelineBuilder() {
  const qc = useQueryClient();
  const [selectedId, setSelectedId] = useState(null);
  const [expandedStage, setExpandedStage] = useState(null);
  const [saving, setSaving] = useState(false);
  const [showNewForm, setShowNewForm] = useState(false);
  const [newName, setNewName] = useState('');
  const [newType, setNewType] = useState('sales');
  const [showTemplates, setShowTemplates] = useState(false);

  const { data: pipelines = [], isLoading } = useQuery({
    queryKey: ['pipelines'],
    queryFn: () => base44.entities.Pipeline.list('-created_date', 100),
  });

  const [editData, setEditData] = useState(null);
  const selected = pipelines.find(p => p.id === selectedId);

  const selectPipeline = (p) => {
    setSelectedId(p.id);
    setEditData({ name: p.name, description: p.description || '', stages: p.stages ? [...p.stages] : [], pipeline_type: p.pipeline_type || 'custom' });
    setExpandedStage(null);
  };

  const setStages = (fn) => setEditData(d => ({ ...d, stages: typeof fn === 'function' ? fn(d.stages) : fn }));

  const addStage = () => setStages(s => [...s, newStage(s.length)]);

  const removeStage = (id) => setStages(s => s.filter(st => st.id !== id).map((st, i) => ({ ...st, order: i })));

  const updateStage = (id, key, val) => setStages(s => s.map(st => st.id === id ? { ...st, [key]: val } : st));

  const addChecklistItem = (id) => {
    const item = window.prompt('Checklist item:');
    if (item) updateStage(id, 'checklist', [...(editData.stages.find(s => s.id === id)?.checklist || []), item]);
  };

  const removeChecklistItem = (stageId, idx) => {
    const stage = editData.stages.find(s => s.id === stageId);
    updateStage(stageId, 'checklist', stage.checklist.filter((_, i) => i !== idx));
  };

  const handleDragEnd = (result) => {
    if (!result.destination) return;
    const stages = [...editData.stages];
    const [moved] = stages.splice(result.source.index, 1);
    stages.splice(result.destination.index, 0, moved);
    setStages(stages.map((s, i) => ({ ...s, order: i })));
  };

  const handleSave = async () => {
    if (!editData || !selectedId) return;
    setSaving(true);
    await base44.entities.Pipeline.update(selectedId, editData);
    qc.invalidateQueries({ queryKey: ['pipelines'] });
    setSaving(false);
    toast.success('Pipeline saved');
  };

  const handleCreate = async (stages = []) => {
    if (!newName.trim()) return;
    const p = await base44.entities.Pipeline.create({
      name: newName,
      pipeline_type: newType,
      stages: stages.map((s, i) => ({ ...newStage(i), ...s, id: crypto.randomUUID() })),
      is_active: true,
    });
    qc.invalidateQueries({ queryKey: ['pipelines'] });
    setShowNewForm(false);
    setNewName('');
    selectPipeline({ ...p, stages: p.stages || [] });
    toast.success('Pipeline created');
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this pipeline?')) return;
    await base44.entities.Pipeline.delete(id);
    qc.invalidateQueries({ queryKey: ['pipelines'] });
    if (selectedId === id) { setSelectedId(null); setEditData(null); }
  };

  const applyTemplate = (tplName) => {
    const tpl = TEMPLATES[tplName];
    if (!editData) return;
    setEditData(d => ({ ...d, stages: tpl.map((s, i) => ({ ...newStage(i), ...s, id: crypto.randomUUID() })) }));
    setShowTemplates(false);
    toast.success(`Template "${tplName}" applied`);
  };

  return (
    <AdminLayout>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link to="/admin/pipeline">
            <Button variant="outline" size="sm"><ArrowLeft className="w-4 h-4 mr-1" />Pipeline</Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Pipeline Builder</h1>
            <p className="text-sm text-gray-500">Create and customise your workflow pipelines</p>
          </div>
        </div>

        <div className="flex gap-5" style={{ minHeight: '70vh' }}>
          {/* ── LEFT: Pipeline List ─────────────────────────────────────────── */}
          <div className="w-72 flex-shrink-0 space-y-2">
            <Button onClick={() => setShowNewForm(v => !v)} className="w-full bg-[#B87333] hover:bg-[#A06828] text-white gap-2">
              <Plus className="w-4 h-4" /> New Pipeline
            </Button>

            {showNewForm && (
              <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-3">
                <Input value={newName} onChange={e => setNewName(e.target.value)} placeholder="Pipeline name" autoFocus />
                <select value={newType} onChange={e => setNewType(e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white">
                  {['sales','printing','editing','cover_design','typesetting','full_publishing','ghostwriting','author_website','contract','invoice','delivery','custom'].map(t => (
                    <option key={t} value={t}>{t.replace(/_/g,' ')}</option>
                  ))}
                </select>
                <p className="text-xs text-gray-400">Or start from a template:</p>
                <div className="space-y-1 max-h-40 overflow-y-auto">
                  {Object.keys(TEMPLATES).map(tpl => (
                    <button key={tpl} onClick={() => handleCreate(TEMPLATES[tpl])} className="w-full text-left text-xs px-3 py-2 rounded-lg hover:bg-[#B87333]/10 text-gray-700 border border-gray-100">
                      <Copy className="w-3 h-3 inline mr-1.5 text-[#B87333]" />{tpl}
                    </button>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Button size="sm" onClick={() => handleCreate()} className="flex-1 bg-[#B87333] hover:bg-[#A06828] text-white">Create Blank</Button>
                  <Button size="sm" variant="outline" onClick={() => setShowNewForm(false)} className="flex-1">Cancel</Button>
                </div>
              </div>
            )}

            {isLoading ? <div className="h-40 bg-gray-100 rounded-xl animate-pulse" /> : (
              <div className="space-y-1">
                {pipelines.map(p => (
                  <div
                    key={p.id}
                    onClick={() => selectPipeline(p)}
                    className={`flex items-center justify-between px-4 py-3 rounded-xl cursor-pointer border transition-all ${selectedId === p.id ? 'bg-[#B87333]/10 border-[#B87333]/40 text-[#B87333]' : 'bg-white border-gray-100 hover:border-gray-200 text-gray-700'}`}
                  >
                    <div>
                      <p className="font-semibold text-sm">{p.name}</p>
                      <p className="text-xs text-gray-400">{p.stages?.length || 0} stages · {p.pipeline_type?.replace(/_/g,' ')}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      {p.is_default && <Star className="w-3 h-3 text-amber-500" />}
                      <button onClick={e => { e.stopPropagation(); handleDelete(p.id); }} className="p-1 hover:bg-red-50 rounded text-gray-300 hover:text-red-400">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
                {pipelines.length === 0 && (
                  <div className="text-center py-8 text-gray-400 text-sm bg-white rounded-xl border border-gray-100">
                    <Layers className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                    No pipelines yet
                  </div>
                )}
              </div>
            )}
          </div>

          {/* ── RIGHT: Stage Editor ─────────────────────────────────────────── */}
          {editData ? (
            <div className="flex-1 min-w-0 space-y-4">
              {/* Pipeline Info */}
              <div className="bg-white rounded-2xl border border-gray-100 p-5">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1 block">Pipeline Name</label>
                    <Input value={editData.name} onChange={e => setEditData(d => ({ ...d, name: e.target.value }))} />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1 block">Type</label>
                    <select value={editData.pipeline_type} onChange={e => setEditData(d => ({ ...d, pipeline_type: e.target.value }))} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white h-9">
                      {['sales','printing','editing','cover_design','typesetting','full_publishing','ghostwriting','author_website','contract','invoice','delivery','custom'].map(t => (
                        <option key={t} value={t}>{t.replace(/_/g,' ')}</option>
                      ))}
                    </select>
                  </div>
                  <div className="col-span-2">
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1 block">Description</label>
                    <Input value={editData.description} onChange={e => setEditData(d => ({ ...d, description: e.target.value }))} placeholder="Optional description..." />
                  </div>
                </div>

                <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => setShowTemplates(v => !v)} className="gap-1">
                      <Copy className="w-3.5 h-3.5" /> Apply Template
                    </Button>
                    {showTemplates && (
                      <div className="absolute z-10 mt-8 bg-white border border-gray-200 rounded-xl shadow-lg p-2 space-y-1 w-52">
                        {Object.keys(TEMPLATES).map(tpl => (
                          <button key={tpl} onClick={() => applyTemplate(tpl)} className="w-full text-left text-sm px-3 py-2 rounded-lg hover:bg-gray-50">
                            {tpl}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  <Button onClick={handleSave} disabled={saving} className="bg-[#B87333] hover:bg-[#A06828] text-white gap-2">
                    <Save className="w-4 h-4" /> {saving ? 'Saving...' : 'Save Pipeline'}
                  </Button>
                </div>
              </div>

              {/* Stages */}
              <div className="bg-white rounded-2xl border border-gray-100 p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-gray-900">Stages ({editData.stages.length})</h3>
                  <Button size="sm" onClick={addStage} className="bg-[#B87333] hover:bg-[#A06828] text-white gap-1">
                    <Plus className="w-3.5 h-3.5" /> Add Stage
                  </Button>
                </div>

                {editData.stages.length === 0 ? (
                  <div className="text-center py-10 text-gray-400">
                    <p className="text-sm">No stages yet. Add a stage or apply a template.</p>
                  </div>
                ) : (
                  <DragDropContext onDragEnd={handleDragEnd}>
                    <Droppable droppableId="stages">
                      {(provided) => (
                        <div ref={provided.innerRef} {...provided.droppableProps} className="space-y-2">
                          {editData.stages.map((stage, idx) => (
                            <Draggable key={stage.id} draggableId={stage.id} index={idx}>
                              {(prov) => (
                                <div ref={prov.innerRef} {...prov.draggableProps} className="border border-gray-100 rounded-xl overflow-hidden select-none">
                                  {/* Stage Row */}
                                  <div className="flex items-center gap-3 px-4 py-3 bg-gray-50">
                                    <span {...prov.dragHandleProps} className="cursor-grab active:cursor-grabbing text-gray-300 hover:text-gray-500">
                                      <GripVertical className="w-4 h-4" />
                                    </span>
                                    <div className="w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center text-sm border-2" style={{ borderColor: stage.color, background: stage.color + '20' }}>
                                      {stage.icon}
                                    </div>
                                    <div className="flex-1">
                                      <Input
                                        value={stage.name}
                                        onChange={e => updateStage(stage.id, 'name', e.target.value)}
                                        className="h-7 text-sm font-semibold border-0 bg-transparent p-0 focus-visible:ring-0"
                                      />
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                      {/* Color picker */}
                                      <div className="relative">
                                        <div className="w-5 h-5 rounded-full cursor-pointer border-2 border-white shadow-sm" style={{ background: stage.color }} />
                                        <input type="color" value={stage.color} onChange={e => updateStage(stage.id, 'color', e.target.value)} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                                      </div>
                                      {/* Icon picker */}
                                      <select value={stage.icon} onChange={e => updateStage(stage.id, 'icon', e.target.value)} className="text-sm bg-transparent border-0 cursor-pointer p-0 focus:outline-none w-8">
                                        {STAGE_ICONS.map(ic => <option key={ic} value={ic}>{ic}</option>)}
                                      </select>
                                      <button onClick={() => setExpandedStage(expandedStage === stage.id ? null : stage.id)} className="p-1 hover:bg-gray-200 rounded">
                                        {expandedStage === stage.id ? <ChevronDown className="w-3.5 h-3.5 text-gray-500" /> : <ChevronRight className="w-3.5 h-3.5 text-gray-500" />}
                                      </button>
                                      <button onClick={() => removeStage(stage.id)} className="p-1 hover:bg-red-50 rounded text-gray-300 hover:text-red-400">
                                        <Trash2 className="w-3.5 h-3.5" />
                                      </button>
                                    </div>
                                  </div>

                                  {/* Expanded Details */}
                                  {expandedStage === stage.id && (
                                    <div className="px-4 pb-4 pt-3 border-t border-gray-100 bg-white space-y-3">
                                      <div>
                                        <label className="text-xs font-semibold text-gray-500 uppercase mb-1 block">Assigned To</label>
                                        <Input value={stage.assigned_to || ''} onChange={e => updateStage(stage.id, 'assigned_to', e.target.value)} placeholder="Staff email or name" className="h-8 text-sm" />
                                      </div>
                                      <div>
                                        <div className="flex items-center justify-between mb-1">
                                          <label className="text-xs font-semibold text-gray-500 uppercase">Checklist Items</label>
                                          <button onClick={() => addChecklistItem(stage.id)} className="text-xs text-[#B87333] hover:underline">+ Add</button>
                                        </div>
                                        <div className="space-y-1">
                                          {(stage.checklist || []).map((item, i) => (
                                            <div key={i} className="flex items-center gap-2 text-sm text-gray-700">
                                              <Check className="w-3 h-3 text-green-500 flex-shrink-0" />
                                              <span className="flex-1">{item}</span>
                                              <button onClick={() => removeChecklistItem(stage.id, i)} className="text-gray-300 hover:text-red-400"><Trash2 className="w-3 h-3" /></button>
                                            </div>
                                          ))}
                                          {(stage.checklist || []).length === 0 && <p className="text-xs text-gray-300 italic">No checklist items</p>}
                                        </div>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              )}
                            </Draggable>
                          ))}
                          {provided.placeholder}
                        </div>
                      )}
                    </Droppable>
                  </DragDropContext>
                )}
              </div>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center text-gray-400">
                <Layers className="w-16 h-16 mx-auto mb-4 text-gray-200" />
                <h3 className="text-lg font-semibold text-gray-600 mb-1">Select a Pipeline to Edit</h3>
                <p className="text-sm">Or create a new one to get started</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}