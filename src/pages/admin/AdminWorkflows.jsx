import React, { useState, useEffect } from 'react';
import { platform } from '@/api/platformClient';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import AdminLayout from '@/components/admin/AdminLayout';
import { toast } from 'sonner';
import { Plus, Search, Play, Pause, Trash2, Edit, Copy, Download, Settings, Activity, CheckCircle, XCircle, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import WorkflowBuilderModal from '@/components/admin/workflows/WorkflowBuilderModal';
import WorkflowTemplateList from '@/components/admin/workflows/WorkflowTemplateList';
import WorkflowExecutionLog from '@/components/admin/workflows/WorkflowExecutionLog';

const STATUS_COLORS = {
  'Pending': 'bg-gray-100 text-gray-700',
  'Running': 'bg-blue-100 text-blue-700',
  'Completed': 'bg-green-100 text-green-700',
  'Failed': 'bg-red-100 text-red-700',
  'Paused': 'bg-amber-100 text-amber-700',
  'Cancelled': 'bg-gray-100 text-gray-700',
};

export default function AdminWorkflows() {
  const [activeTab, setActiveTab] = useState('templates');
  const [showBuilderModal, setShowBuilderModal] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');

  // Fetch workflow templates
  const { data: templates, isLoading, refetch } = useQuery({
    queryKey: ['workflow-templates'],
    queryFn: async () => {
      const res = await platform.functions.invoke('manageWorkflows', {
        action: 'list_templates',
      });
      return res.data.templates || [];
    },
  });

  // Fetch workflow statistics
  const { data: stats } = useQuery({
    queryKey: ['workflow-statistics'],
    queryFn: async () => {
      const res = await platform.functions.invoke('manageWorkflows', {
        action: 'statistics',
      });
      return res.data.stats || {};
    },
  });

  const filteredTemplates = (templates || []).filter(template => {
    if (categoryFilter && template.category !== categoryFilter) return false;
    if (search && !template.template_name?.toLowerCase().includes(search.toLowerCase())) {
      return false;
    }
    return true;
  });

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Workflow Automation</h1>
            <p className="text-sm text-gray-500 mt-1">
              Build and manage automated workflows with conditional logic
            </p>
          </div>
          <Button onClick={() => { setSelectedTemplate(null); setShowBuilderModal(true); }} className="gap-2">
            <Plus className="w-4 h-4" />
            New Workflow
          </Button>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Executions</CardTitle>
              <Activity className="w-4 h-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.total_executions || 0}</div>
              <p className="text-xs text-gray-500 mt-1">All workflows</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
              <CheckCircle className="w-4 h-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.success_rate ? `${stats.success_rate.toFixed(1)}%` : '0%'}</div>
              <p className="text-xs text-gray-500 mt-1">Average success rate</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Running Now</CardTitle>
              <Play className="w-4 h-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.running || 0}</div>
              <p className="text-xs text-gray-500 mt-1">Active executions</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Duration</CardTitle>
              <Clock className="w-4 h-4 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats?.average_duration ? `${(stats.average_duration / 60).toFixed(1)}m` : '0m'}
              </div>
              <p className="text-xs text-gray-500 mt-1">Per execution</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="templates" className="gap-2">
              <Settings className="w-4 h-4" />
              Templates
            </TabsTrigger>
            <TabsTrigger value="executions" className="gap-2">
              <Activity className="w-4 h-4" />
              Execution History
            </TabsTrigger>
          </TabsList>

          <TabsContent value="templates" className="space-y-4">
            <WorkflowTemplateList
              templates={filteredTemplates}
              isLoading={isLoading}
              search={search}
              setSearch={setSearch}
              categoryFilter={categoryFilter}
              setCategoryFilter={setCategoryFilter}
              onEdit={(template) => { setSelectedTemplate(template); setShowBuilderModal(true); }}
              onDuplicate={async (templateId) => {
                const res = await platform.functions.invoke('manageWorkflows', {
                  action: 'duplicate_template',
                  workflow_id: templateId,
                });
                if (res.data.success) {
                  toast.success('Workflow duplicated');
                  refetch();
                }
              }}
              onExport={async (templateId) => {
                const res = await platform.functions.invoke('manageWorkflows', {
                  action: 'export_template',
                  workflow_id: templateId,
                });
                const dataStr = JSON.stringify(res.data.export, null, 2);
                const blob = new Blob([dataStr], { type: 'application/json' });
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `workflow-${templateId}.json`;
                a.click();
                toast.success('Workflow exported');
              }}
              onTest={async (templateId) => {
                const res = await platform.functions.invoke('manageWorkflows', {
                  action: 'test_workflow',
                  workflow_id: templateId,
                });
                console.log('Test result:', res.data.simulation);
                toast.info(`Workflow simulation: ${res.data.simulation.total_steps} steps, ~${res.data.simulation.estimated_duration}min`);
              }}
              onDelete={async (templateId) => {
                if (confirm('Are you sure you want to delete this workflow template?')) {
                  const res = await platform.functions.invoke('manageWorkflows', {
                    action: 'delete_template',
                    workflow_id: templateId,
                  });
                  if (res.data.success) {
                    toast.success('Workflow deleted');
                    refetch();
                  }
                }
              }}
            />
          </TabsContent>

          <TabsContent value="executions" className="space-y-4">
            <WorkflowExecutionLog onRefetch={() => {}} />
          </TabsContent>
        </Tabs>
      </div>

      {showBuilderModal && (
        <WorkflowBuilderModal
          template={selectedTemplate}
          onClose={() => { setShowBuilderModal(false); setSelectedTemplate(null); refetch(); }}
        />
      )}
    </AdminLayout>
  );
}