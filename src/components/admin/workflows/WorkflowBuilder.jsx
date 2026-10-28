import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { X, Plus, Save, Play, Settings, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { platform } from '@/api/platformClient';

const STEP_TYPES = [
  { value: 'update_entity', label: 'Update Entity' },
  { value: 'send_email', label: 'Send Email' },
  { value: 'send_whatsapp', label: 'Send WhatsApp' },
  { value: 'create_task', label: 'Create Task' },
  { value: 'create_document', label: 'Create Document' },
  { value: 'create_invoice', label: 'Create Invoice' },
  { value: 'move_stage', label: 'Move Stage' },
  { value: 'assign_user', label: 'Assign User' },
  { value: 'wait', label: 'Wait/Delay' },
  { value: 'condition', label: 'Condition (If/Else)' },
  { value: 'webhook', label: 'Webhook' },
  { value: 'run_function', label: 'Run Function' },
];

export default function WorkflowBuilder({ template, onClose }) {
  const [formData, setFormData] = useState({
    template_name: template?.template_name || '',
    description: template?.description || '',
    category: template?.category || 'Custom',
    trigger_type: template?.trigger_type || 'manual',
    trigger_entity: template?.trigger_entity || 'Contact',
    trigger_conditions: template?.trigger_conditions || [],
    steps: template?.steps || [],
    is_active: template?.is_active ?? true,
    is_public: template?.is_public ?? false,
  });

  const [currentStep, setCurrentStep] = useState(null);
  const [showStepForm, setShowStepForm] = useState(false);

  const handleSave = async () => {
    try {
      if (!formData.template_name) {
        toast.error('Workflow name is required');
        return;
      }

      const action = template ? 'update_template' : 'create_template';
      const res = await platform.functions.invoke('manageWorkflows', {
        action,
        workflow_id: template?.id,
        data: formData,
      });

      if (res.data.success) {
        toast.success('Workflow saved successfully');
        onClose();
      }
    } catch (error) {
      toast.error('Failed to save workflow: ' + error.message);
    }
  };

  const handleTest = async () => {
    try {
      const res = await platform.functions.invoke('manageWorkflows', {
        action: 'test_workflow',
        workflow_id: template?.id,
      });

      if (res.data.simulation) {
        toast.success(`Workflow test: ${res.data.simulation.estimated_duration} min estimated`);
      }
    } catch (error) {
      toast.error('Test failed: ' + error.message);
    }
  };

  const addStep = () => {
    const newStep = {
      step_number: (formData.steps.length || 0) + 1,
      step_name: 'New Step',
      step_type: 'update_entity',
      action_config: {},
      conditions: [],
      is_parallel: false,
    };
    setFormData({
      ...formData,
      steps: [...(formData.steps || []), newStep],
    });
    setCurrentStep(newStep);
    setShowStepForm(true);
  };

  const updateStep = (index, updates) => {
    const newSteps = [...formData.steps];
    newSteps[index] = { ...newSteps[index], ...updates };
    setFormData({ ...formData, steps: newSteps });
  };

  const removeStep = (index) => {
    const newSteps = formData.steps.filter((_, i) => i !== index);
    setFormData({ ...formData, steps: newSteps });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              {template ? 'Edit Workflow' : 'Create Workflow'}
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Design automated workflows with conditional logic
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={handleTest} className="gap-2">
              <Play className="w-4 h-4" />
              Test
            </Button>
            <Button onClick={handleSave} className="gap-2">
              <Save className="w-4 h-4" />
              Save
            </Button>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left: Configuration */}
            <div className="space-y-4">
              <Card>
                <CardContent className="pt-6 space-y-4">
                  <div>
                    <label className="text-sm font-semibold mb-1 block">Workflow Name</label>
                    <Input
                      value={formData.template_name}
                      onChange={(e) => setFormData({ ...formData, template_name: e.target.value })}
                      placeholder="e.g., Quote Accepted Workflow"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-semibold mb-1 block">Description</label>
                    <Input
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Brief description..."
                    />
                  </div>
                  <div>
                    <label className="text-sm font-semibold mb-1 block">Category</label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    >
                      <option>Client Onboarding</option>
                      <option>Quote to Invoice</option>
                      <option>Production</option>
                      <option>Quality Control</option>
                      <option>Delivery</option>
                      <option>Custom</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-semibold mb-1 block">Trigger Type</label>
                    <select
                      value={formData.trigger_type}
                      onChange={(e) => setFormData({ ...formData, trigger_type: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    >
                      <option value="entity_create">Entity Create</option>
                      <option value="entity_update">Entity Update</option>
                      <option value="stage_change">Stage Change</option>
                      <option value="status_change">Status Change</option>
                      <option value="manual">Manual Trigger</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-semibold mb-1 block">Trigger Entity</label>
                    <select
                      value={formData.trigger_entity}
                      onChange={(e) => setFormData({ ...formData, trigger_entity: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    >
                      <option>Contact</option>
                      <option>Quote</option>
                      <option>Invoice</option>
                      <option>Project</option>
                      <option>ProductionJob</option>
                      <option>PurchaseOrder</option>
                    </select>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="is_active"
                      checked={formData.is_active}
                      onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                    />
                    <label htmlFor="is_active" className="text-sm">Active</label>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right: Steps Builder */}
            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-gray-900">Workflow Steps</h3>
                <Button onClick={addStep} size="sm" className="gap-2">
                  <Plus className="w-4 h-4" />
                  Add Step
                </Button>
              </div>

              {formData.steps?.length === 0 ? (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center">
                  <Settings className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No steps yet. Add your first step to build the workflow.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {formData.steps.map((step, index) => (
                    <div key={index} className="border rounded-lg p-4 bg-white">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <Badge variant="outline">Step {step.step_number}</Badge>
                          <span className="font-medium">{step.step_name}</span>
                          <Badge>{STEP_TYPES.find(t => t.value === step.step_type)?.label || step.step_type}</Badge>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setCurrentStep(step);
                              setShowStepForm(true);
                            }}
                          >
                            Edit
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeStep(index)}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                      {step.conditions?.length > 0 && (
                        <div className="text-xs text-gray-500 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          {step.conditions.length} condition(s)
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}