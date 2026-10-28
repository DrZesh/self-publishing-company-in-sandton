import React, { useState, useEffect } from 'react';
import { platform } from '@/api/platformClient';
import { toast } from 'sonner';
import { X, Plus, Trash2, ChevronUp, ChevronDown, Settings, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const STEP_TYPES = [
  'update_entity',
  'send_email',
  'send_whatsapp',
  'create_task',
  'create_document',
  'create_invoice',
  'move_stage',
  'assign_user',
  'wait',
  'condition',
  'webhook',
  'run_function',
];

const TRIGGER_TYPES = [
  'entity_create',
  'entity_update',
  'stage_change',
  'status_change',
  'manual',
  'scheduled',
];

const ENTITIES = [
  'Contact',
  'Quote',
  'Invoice',
  'Project',
  'ProductionJob',
  'Material',
  'PurchaseOrder',
  'Payment',
  'Document',
];

export default function WorkflowBuilderModal({ template, onClose }) {
  const [formData, setFormData] = useState({
    template_name: template?.template_name || '',
    description: template?.description || '',
    category: template?.category || 'Custom',
    trigger_type: template?.trigger_type || 'entity_create',
    trigger_entity: template?.trigger_entity || 'Contact',
    trigger_conditions: template?.trigger_conditions || [],
    steps: template?.steps || [],
    is_active: template?.is_active ?? true,
    is_public: template?.is_public ?? false,
  });

  const [currentStepIndex, setCurrentStepIndex] = useState(null);
  const [showStepForm, setShowStepForm] = useState(false);

  const handleSave = async () => {
    try {
      const action = template ? 'update_template' : 'create_template';
      const res = await platform.functions.invoke('manageWorkflows', {
        action,
        workflow_id: template?.id,
        data: formData,
      });

      if (res.data.success) {
        toast.success(template ? 'Workflow updated' : 'Workflow created');
        onClose();
      }
    } catch (error) {
      toast.error(error.message || 'Failed to save workflow');
    }
  };

  const addStep = () => {
    const newStep = {
      step_number: formData.steps.length + 1,
      step_name: 'New Step',
      step_type: 'update_entity',
      action_config: {},
      conditions: [],
      is_parallel: false,
    };
    setFormData({
      ...formData,
      steps: [...formData.steps, newStep],
    });
    setCurrentStepIndex(formData.steps.length);
    setShowStepForm(true);
  };

  const updateStep = (index, updates) => {
    const newSteps = [...formData.steps];
    newSteps[index] = { ...newSteps[index], ...updates };
    setFormData({ ...formData, steps: newSteps });
  };

  const deleteStep = (index) => {
    const newSteps = formData.steps.filter((_, i) => i !== index);
    newSteps.forEach((step, i) => {
      step.step_number = i + 1;
    });
    setFormData({ ...formData, steps: newSteps });
  };

  const moveStep = (index, direction) => {
    if ((direction === 'up' && index === 0) || 
        (direction === 'down' && index === formData.steps.length - 1)) {
      return;
    }
    const newSteps = [...formData.steps];
    const temp = newSteps[index];
    const swapIndex = direction === 'up' ? index - 1 : index + 1;
    newSteps[index] = newSteps[swapIndex];
    newSteps[swapIndex] = temp;
    newSteps.forEach((step, i) => {
      step.step_number = i + 1;
    });
    setFormData({ ...formData, steps: newSteps });
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{template ? 'Edit Workflow' : 'Create Workflow'}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Basic Info */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Workflow Name</label>
              <Input
                value={formData.template_name}
                onChange={(e) => setFormData({ ...formData, template_name: e.target.value })}
                placeholder="e.g., Quote to Invoice Automation"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Category</label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData({ ...formData, category: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Client Onboarding">Client Onboarding</SelectItem>
                  <SelectItem value="Quote to Invoice">Quote to Invoice</SelectItem>
                  <SelectItem value="Production">Production</SelectItem>
                  <SelectItem value="Quality Control">Quality Control</SelectItem>
                  <SelectItem value="Delivery">Delivery</SelectItem>
                  <SelectItem value="Custom">Custom</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Description</label>
            <Textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe what this workflow does..."
              rows={2}
            />
          </div>

          {/* Trigger Configuration */}
          <div className="border rounded-lg p-4 bg-gray-50">
            <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Trigger Configuration
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Trigger Type</label>
                <Select
                  value={formData.trigger_type}
                  onValueChange={(value) => setFormData({ ...formData, trigger_type: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TRIGGER_TYPES.map(type => (
                      <SelectItem key={type} value={type}>{type.replace(/_/g, ' ').toUpperCase()}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Trigger Entity</label>
                <Select
                  value={formData.trigger_entity}
                  onValueChange={(value) => setFormData({ ...formData, trigger_entity: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ENTITIES.map(entity => (
                      <SelectItem key={entity} value={entity}>{entity}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Workflow Steps */}
          <div className="border rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold">Workflow Steps</h3>
              <Button onClick={addStep} size="sm" className="gap-2">
                <Plus className="w-4 h-4" />
                Add Step
              </Button>
            </div>

            {formData.steps.length === 0 ? (
              <div className="text-center py-8 text-gray-500 text-sm">
                No steps yet. Click "Add Step" to create your first workflow step.
              </div>
            ) : (
              <div className="space-y-2">
                {formData.steps.map((step, index) => (
                  <div key={index} className="flex items-center gap-2 p-3 border rounded-lg bg-white">
                    <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-sm font-bold">
                      {step.step_number}
                    </div>
                    <div className="flex-1">
                      <div className="font-medium">{step.step_name}</div>
                      <div className="text-xs text-gray-500">{step.step_type}</div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => moveStep(index, 'up')}
                        disabled={index === 0}
                      >
                        <ChevronUp className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => moveStep(index, 'down')}
                        disabled={index === formData.steps.length - 1}
                      >
                        <ChevronDown className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setCurrentStepIndex(index);
                          setShowStepForm(true);
                        }}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteStep(index)}
                        className="text-red-600"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Settings */}
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.is_active}
                onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                className="rounded"
              />
              <span className="text-sm">Active</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.is_public}
                onChange={(e) => setFormData({ ...formData, is_public: e.target.checked })}
                className="rounded"
              />
              <span className="text-sm">Public (available to all users)</span>
            </label>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave} className="gap-2">
            Save Workflow
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}