import React, { useState } from 'react';
import { X, Plus, Mail, Phone, Calendar, CheckCircle, Clock, Trash2, Save } from 'lucide-react';
import { platform } from '@/api/platformClient';
import { toast } from 'sonner';

const STAGE_COLORS = {
  blue: '#3b82f6',
  green: '#10b981',
  purple: '#8b5cf6',
  orange: '#f59e0b',
  red: '#ef4444',
  indigo: '#6366f1',
  pink: '#ec4899',
  teal: '#14b8a6'
};

const ACTION_TYPES = [
  { value: 'send_email', label: '📧 Send Email', icon: Mail },
  { value: 'send_whatsapp', label: '📱 Send WhatsApp', icon: Phone },
  { value: 'send_quote', label: '📄 Send Quote', icon: CheckCircle },
  { value: 'create_task', label: '📋 Create Task', icon: Calendar },
];

export default function PipelineBuilderModal({ onClose, onSaved }) {
  const [step, setStep] = useState(1);
  const [pipelineName, setPipelineName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedColor, setSelectedColor] = useState('blue');
  const [stages, setStages] = useState([]);
  const [currentStage, setCurrentStage] = useState({ name: '', color: 'blue' });
  const [showActionModal, setShowActionModal] = useState(false);
  const [currentStageIndex, setCurrentStageIndex] = useState(null);
  const [currentAction, setCurrentAction] = useState({
    action_type: 'send_email',
    action_name: '',
    template_id: '',
    delay_days: 0
  });
  const [saving, setSaving] = useState(false);

  const addStage = () => {
    if (!currentStage.name.trim()) {
      toast.error('Please enter a stage name');
      return;
    }
    setStages([...stages, { ...currentStage, id: `stage_${Date.now()}`, suggested_actions: [] }]);
    setCurrentStage({ name: '', color: 'blue' });
  };

  const removeStage = (index) => {
    setStages(stages.filter((_, i) => i !== index));
  };

  const addActionToStage = () => {
    if (!currentAction.action_name.trim()) {
      toast.error('Please enter an action name');
      return;
    }

    const updatedStages = [...stages];
    if (!updatedStages[currentStageIndex].suggested_actions) {
      updatedStages[currentStageIndex].suggested_actions = [];
    }
    updatedStages[currentStageIndex].suggested_actions.push({
      id: `action_${Date.now()}`,
      ...currentAction
    });
    setStages(updatedStages);
    setShowActionModal(false);
    setCurrentAction({ action_type: 'send_email', action_name: '', template_id: '', delay_days: 0 });
  };

  const removeAction = (stageIndex, actionIndex) => {
    const updatedStages = [...stages];
    updatedStages[stageIndex].suggested_actions = updatedStages[stageIndex].suggested_actions.filter(
      (_, i) => i !== actionIndex
    );
    setStages(updatedStages);
  };

  const handleSave = async () => {
    if (!pipelineName.trim()) {
      toast.error('Please enter a pipeline name');
      return;
    }
    if (stages.length === 0) {
      toast.error('Please add at least one stage');
      return;
    }

    setSaving(true);
    try {
      const res = await platform.functions.invoke('manageCustomPipeline', {
        action: 'create_pipeline',
        data: {
          pipeline_name: pipelineName,
          description,
          stages: stages.map((s, idx) => ({
            id: s.id,
            name: s.name,
            color: s.color,
            order: idx,
            suggested_actions: s.suggested_actions || []
          }))
        }
      });

      if (res.data?.success) {
        toast.success('Pipeline created successfully!');
        if (onSaved) {
          onSaved();
        } else {
          onClose();
        }
      } else {
        toast.error(res.data?.error || 'Failed to create pipeline');
      }
    } catch (error) {
      toast.error(error.message || 'Failed to create pipeline');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div 
        className="bg-white rounded-2xl max-w-5xl w-full mx-4 max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Create Custom Pipeline</h2>
            <p className="text-sm text-gray-500 mt-1">Design your own deal workflow with stages and automated actions</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
            <X className="w-6 h-6 text-gray-500" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Step 1: Pipeline Details */}
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Pipeline Name</label>
                <input
                  type="text"
                  value={pipelineName}
                  onChange={e => setPipelineName(e.target.value)}
                  placeholder="e.g., Book Publishing Pipeline"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
                <textarea
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="Describe what this pipeline is used for..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">Color Theme</label>
                <div className="flex gap-3 flex-wrap">
                  {Object.entries(STAGE_COLORS).map(([name, color]) => (
                    <button
                      key={name}
                      onClick={() => setSelectedColor(name)}
                      className={`w-12 h-12 rounded-xl border-2 transition-all ${
                        selectedColor === name ? 'border-gray-900 scale-110' : 'border-gray-200'
                      }`}
                      style={{ background: color }}
                    />
                  ))}
                </div>
              </div>

              <button
                onClick={() => setStep(2)}
                disabled={!pipelineName.trim()}
                className="w-full py-3 bg-amber-700 text-white rounded-xl font-semibold hover:bg-amber-800 disabled:opacity-50"
              >
                Next: Add Stages
              </button>
            </div>
          )}

          {/* Step 2: Add Stages */}
          {step === 2 && (
            <div className="space-y-6">
              <div className="bg-gray-50 rounded-xl p-4">
                <h3 className="text-sm font-bold text-gray-700 mb-3">Add Pipeline Stage</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <input
                    type="text"
                    value={currentStage.name}
                    onChange={e => setCurrentStage({ ...currentStage, name: e.target.value })}
                    placeholder="Stage name (e.g., Quote Sent)"
                    className="px-4 py-2 border border-gray-300 rounded-lg"
                  />
                  <select
                    value={currentStage.color}
                    onChange={e => setCurrentStage({ ...currentStage, color: e.target.value })}
                    className="px-4 py-2 border border-gray-300 rounded-lg"
                  >
                    {Object.entries(STAGE_COLORS).map(([name, color]) => (
                      <option key={name} value={name}>{name.charAt(0).toUpperCase() + name.slice(1)}</option>
                    ))}
                  </select>
                  <button
                    onClick={addStage}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center justify-center gap-2"
                  >
                    <Plus className="w-4 h-4" /> Add Stage
                  </button>
                </div>
              </div>

              {/* Stages List */}
              {stages.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-sm font-bold text-gray-700">Pipeline Stages ({stages.length})</h3>
                  {stages.map((stage, idx) => (
                    <div key={stage.id} className="bg-white border border-gray-200 rounded-xl p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div 
                            className="w-3 h-3 rounded-full" 
                            style={{ background: STAGE_COLORS[stage.color] }}
                          />
                          <span className="font-semibold text-gray-900">{stage.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              setCurrentStageIndex(idx);
                              setShowActionModal(true);
                            }}
                            className="text-xs px-3 py-1 bg-amber-100 text-amber-700 rounded-lg hover:bg-amber-200 flex items-center gap-1"
                          >
                            <Plus className="w-3 h-3" /> Add Action
                          </button>
                          <button
                            onClick={() => removeStage(idx)}
                            className="p-1 hover:bg-red-50 rounded-lg text-red-600"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Suggested Actions */}
                      {stage.suggested_actions && stage.suggested_actions.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-gray-100">
                          <div className="text-xs font-semibold text-gray-500 mb-2">SUGGESTED ACTIONS:</div>
                          <div className="flex flex-wrap gap-2">
                            {stage.suggested_actions.map((action, aIdx) => {
                              const ActionIcon = ACTION_TYPES.find(t => t.value === action.action_type)?.icon || Mail;
                              return (
                                <div key={action.id} className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 border border-blue-200 rounded-lg">
                                  <ActionIcon className="w-3 h-3 text-blue-600" />
                                  <span className="text-xs font-medium text-blue-900">{action.action_name}</span>
                                  {action.delay_days > 0 && (
                                    <span className="text-xs text-blue-600">({action.delay_days}d delay)</span>
                                  )}
                                  <button
                                    onClick={() => removeAction(idx, aIdx)}
                                    className="ml-1 hover:bg-blue-200 rounded p-0.5"
                                  >
                                    <Trash2 className="w-3 h-3 text-blue-600" />
                                  </button>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setStep(1)}
                  className="flex-1 py-3 bg-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-300"
                >
                  Back
                </button>
                <button
                  onClick={handleSave}
                  disabled={stages.length === 0 || saving}
                  className="flex-1 py-3 bg-amber-700 text-white rounded-xl font-semibold hover:bg-amber-800 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {saving ? <Clock className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                  Create Pipeline
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Action Modal */}
        {showActionModal && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={() => setShowActionModal(false)}>
            <div className="bg-white rounded-2xl max-w-md w-full mx-4 p-6" onClick={e => e.stopPropagation()}>
              <h3 className="text-lg font-bold text-gray-900 mb-4">Add Suggested Action</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Action Type</label>
                  <select
                    value={currentAction.action_type}
                    onChange={e => setCurrentAction({ ...currentAction, action_type: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  >
                    {ACTION_TYPES.map(type => (
                      <option key={type.value} value={type.value}>{type.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Action Name</label>
                  <input
                    type="text"
                    value={currentAction.action_name}
                    onChange={e => setCurrentAction({ ...currentAction, action_name: e.target.value })}
                    placeholder="e.g., Send Follow-up Email"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Delay (days after stage entry)</label>
                  <input
                    type="number"
                    value={currentAction.delay_days}
                    onChange={e => setCurrentAction({ ...currentAction, delay_days: parseInt(e.target.value) || 0 })}
                    min="0"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => setShowActionModal(false)}
                    className="flex-1 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={addActionToStage}
                    className="flex-1 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    Add Action
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}