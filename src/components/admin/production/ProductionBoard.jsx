import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Package, AlertTriangle, CheckCircle, Clock, MoreVertical, 
  Play, Pause, Trash2, Edit, Download, Plus 
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const STATUS_COLORS = {
  'Queued': 'bg-blue-100 text-blue-700 border-blue-200',
  'In Progress': 'bg-amber-100 text-amber-700 border-amber-200',
  'Quality Check': 'bg-purple-100 text-purple-700 border-purple-200',
  'Completed': 'bg-green-100 text-green-700 border-green-200',
  'On Hold': 'bg-gray-100 text-gray-700 border-gray-200',
  'Cancelled': 'bg-red-100 text-red-700 border-red-200',
};

const PRIORITY_COLORS = {
  'Low': 'bg-slate-100 text-slate-700',
  'Normal': 'bg-blue-100 text-blue-700',
  'High': 'bg-orange-100 text-orange-700',
  'Urgent': 'bg-red-100 text-red-700',
};

export default function ProductionBoard({ jobs, isLoading, onJobClick, onExport }) {
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');

  const filteredJobs = jobs.filter(job => {
    if (filter !== 'all' && job.status !== filter) return false;
    if (search && !job.job_number?.toLowerCase().includes(search.toLowerCase()) &&
        !job.book_title?.toLowerCase().includes(search.toLowerCase())) {
      return false;
    }
    return true;
  });

  const stats = {
    total: jobs.length,
    queued: jobs.filter(j => j.status === 'Queued').length,
    inProgress: jobs.filter(j => j.status === 'In Progress').length,
    qualityCheck: jobs.filter(j => j.status === 'Quality Check').length,
    completed: jobs.filter(j => j.status === 'Completed').length,
    overdue: jobs.filter(j => {
      if (!j.deadline) return false;
      return new Date(j.deadline) < new Date() && j.status !== 'Completed';
    }).length,
  };

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="flex gap-2 flex-wrap">
          <Button
            variant={filter === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('all')}
          >
            All ({stats.total})
          </Button>
          <Button
            variant={filter === 'Queued' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('Queued')}
          >
            Queued ({stats.queued})
          </Button>
          <Button
            variant={filter === 'In Progress' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('In Progress')}
          >
            In Progress ({stats.inProgress})
          </Button>
          <Button
            variant={filter === 'Quality Check' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('Quality Check')}
          >
            Quality Check ({stats.qualityCheck})
          </Button>
          <Button
            variant={filter === 'Completed' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('Completed')}
          >
            Completed ({stats.completed})
          </Button>
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Search jobs..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
          />
          <Button variant="outline" size="sm" onClick={onExport}>
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button size="sm">
            <Plus className="w-4 h-4 mr-2" />
            New Job
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-gray-500">Total Jobs</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-blue-600">{stats.queued}</div>
            <p className="text-xs text-gray-500">Queued</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-amber-600">{stats.inProgress}</div>
            <p className="text-xs text-gray-500">In Progress</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-purple-600">{stats.qualityCheck}</div>
            <p className="text-xs text-gray-500">Quality Check</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
            <p className="text-xs text-gray-500">Completed</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-red-600">{stats.overdue}</div>
            <p className="text-xs text-gray-500">Overdue</p>
          </CardContent>
        </Card>
      </div>

      {/* Jobs Table */}
      <Card>
        <CardHeader>
          <CardTitle>Production Jobs</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-gray-500">Loading...</div>
          ) : filteredJobs.length === 0 ? (
            <div className="text-center py-8 text-gray-500">No jobs found</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 text-sm font-semibold">Job Number</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold">Book Title</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold">Type</th>
                    <th className="text-right py-3 px-4 text-sm font-semibold">Qty</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold">Status</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold">Priority</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold">Deadline</th>
                    <th className="text-right py-3 px-4 text-sm font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredJobs.map((job) => (
                    <tr key={job.id} className="border-b hover:bg-gray-50 cursor-pointer" onClick={() => onJobClick(job)}>
                      <td className="py-3 px-4 text-sm font-medium">{job.job_number}</td>
                      <td className="py-3 px-4 text-sm">{job.book_title || '-'}</td>
                      <td className="py-3 px-4 text-sm">{job.job_type}</td>
                      <td className="py-3 px-4 text-sm text-right">{job.quantity}</td>
                      <td className="py-3 px-4">
                        <Badge className={STATUS_COLORS[job.status] || 'bg-gray-100 text-gray-700'}>
                          {job.status}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        <Badge className={PRIORITY_COLORS[job.priority] || 'bg-gray-100 text-gray-700'}>
                          {job.priority}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-sm">
                        {job.deadline ? new Date(job.deadline).toLocaleDateString('en-ZA') : '-'}
                        {job.deadline && new Date(job.deadline) < new Date() && job.status !== 'Completed' && (
                          <AlertTriangle className="w-3 h-3 text-red-500 inline ml-1" />
                        )}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => onJobClick(job)}>
                              <Edit className="w-4 h-4 mr-2" />
                              View / Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Play className="w-4 h-4 mr-2" />
                              Start Job
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Pause className="w-4 h-4 mr-2" />
                              Pause
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-red-600">
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}