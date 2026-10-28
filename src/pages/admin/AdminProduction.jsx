import React, { useState, useEffect } from 'react';
import { platform } from '@/api/platformClient';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import AdminLayout from '@/components/admin/AdminLayout';
import { toast } from 'sonner';
import { 
  Plus, Search, Filter, Download, Upload, AlertTriangle, CheckCircle, 
  Clock, Settings, TrendingUp, Package, FileText, Calendar, User,
  MoreVertical, Edit2, Trash2, Eye, Play, Pause, AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ProductionJobModal from '@/components/admin/production/ProductionJobModal';
import ProductionBoard from '@/components/admin/production/ProductionBoard';
import MaterialsInventory from '@/components/admin/production/MaterialsInventory';
import PurchaseOrders from '@/components/admin/production/PurchaseOrders';

const STATUS_COLORS = {
  'Queued': 'bg-blue-100 text-blue-700',
  'In Progress': 'bg-amber-100 text-amber-700',
  'Quality Check': 'bg-purple-100 text-purple-700',
  'Completed': 'bg-green-100 text-green-700',
  'On Hold': 'bg-gray-100 text-gray-700',
  'Cancelled': 'bg-red-100 text-red-700',
};

const PRIORITY_COLORS = {
  'Low': 'bg-gray-100 text-gray-600',
  'Normal': 'bg-blue-100 text-blue-600',
  'High': 'bg-orange-100 text-orange-600',
  'Urgent': 'bg-red-100 text-red-600',
};

export default function AdminProduction() {
  const [activeTab, setActiveTab] = useState('jobs');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showJobModal, setShowJobModal] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);

  // Fetch production jobs
  const { data: jobs, isLoading, refetch } = useQuery({
    queryKey: ['production-jobs'],
    queryFn: async () => {
      const res = await platform.functions.invoke('manageProductionJobs', {
        action: 'list',
        limit: 200,
      });
      return res.data.jobs || [];
    },
  });

  // Fetch dashboard metrics
  const { data: metrics } = useQuery({
    queryKey: ['production-metrics'],
    queryFn: async () => {
      const res = await platform.functions.invoke('manageProductionJobs', {
        action: 'dashboard',
      });
      return res.data.metrics || {};
    },
  });

  const filteredJobs = (jobs || []).filter(job => {
    if (statusFilter && job.status !== statusFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        job.job_number?.toLowerCase().includes(q) ||
        job.book_title?.toLowerCase().includes(q) ||
        job.assigned_operator?.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Production Management</h1>
            <p className="text-sm text-gray-500 mt-1">
              Track print jobs, materials, and supplier orders
            </p>
          </div>
          <Button onClick={() => { setSelectedJob(null); setShowJobModal(true); }} className="gap-2">
            <Plus className="w-4 h-4" />
            New Production Job
          </Button>
        </div>

        {/* Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Jobs</CardTitle>
              <Package className="w-4 h-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics?.total_jobs || 0}</div>
              <p className="text-xs text-gray-500 mt-1">All time</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Jobs</CardTitle>
              <Play className="w-4 h-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics?.active_jobs || 0}</div>
              <p className="text-xs text-gray-500 mt-1">In progress or queued</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed This Month</CardTitle>
              <CheckCircle className="w-4 h-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics?.completed_this_month || 0}</div>
              <p className="text-xs text-gray-500 mt-1">This month</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Overdue</CardTitle>
              <AlertTriangle className="w-4 h-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics?.overdue || 0}</div>
              <p className="text-xs text-gray-500 mt-1">Past deadline</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="jobs" className="gap-2">
              <Package className="w-4 h-4" />
              Production Jobs
            </TabsTrigger>
            <TabsTrigger value="materials" className="gap-2">
              <Package className="w-4 h-4" />
              Materials Inventory
            </TabsTrigger>
            <TabsTrigger value="purchase-orders" className="gap-2">
              <FileText className="w-4 h-4" />
              Purchase Orders
            </TabsTrigger>
          </TabsList>

          <TabsContent value="jobs" className="space-y-4">
            <ProductionBoard 
              jobs={filteredJobs}
              isLoading={isLoading}
              onJobClick={(job) => { setSelectedJob(job); setShowJobModal(true); }}
              onExport={async () => {
                const res = await platform.functions.invoke('exportData', {
                  action: 'export_production',
                  format: 'csv',
                });
                // Download CSV
                const blob = await res.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'production_jobs.csv';
                a.click();
                toast.success('Production jobs exported');
              }}
            />
          </TabsContent>

          <TabsContent value="materials" className="space-y-4">
            <MaterialsInventory onRefetch={() => {}} />
          </TabsContent>

          <TabsContent value="purchase-orders" className="space-y-4">
            <PurchaseOrders onRefetch={() => {}} />
          </TabsContent>
        </Tabs>
      </div>

      {showJobModal && (
        <ProductionJobModal
          job={selectedJob}
          onClose={() => { setShowJobModal(false); setSelectedJob(null); refetch(); }}
        />
      )}
    </AdminLayout>
  );
}