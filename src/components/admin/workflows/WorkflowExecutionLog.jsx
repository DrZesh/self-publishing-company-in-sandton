import React, { useState, useEffect } from 'react';
import { platform } from '@/api/platformClient';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Activity, CheckCircle, XCircle, Clock, Play, Pause, AlertCircle } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const STATUS_COLORS = {
  'Pending': 'bg-gray-100 text-gray-700',
  'Running': 'bg-blue-100 text-blue-700',
  'Completed': 'bg-green-100 text-green-700',
  'Failed': 'bg-red-100 text-red-700',
  'Paused': 'bg-amber-100 text-amber-700',
  'Cancelled': 'bg-gray-100 text-gray-700',
};

export default function WorkflowExecutionLog({ onRefetch }) {
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');

  const { data: executions, isLoading, refetch } = useQuery({
    queryKey: ['workflow-executions'],
    queryFn: async () => {
      const res = await platform.functions.invoke('manageWorkflows', {
        action: 'list_executions',
        limit: 100,
      });
      return res.data.executions || [];
    },
  });

  const filteredExecutions = (executions || []).filter(exec => {
    if (filter !== 'all' && exec.status !== filter) return false;
    if (search && !exec.workflow_name?.toLowerCase().includes(search.toLowerCase()) &&
        !exec.execution_id?.toLowerCase().includes(search.toLowerCase())) {
      return false;
    }
    return true;
  });

  const stats = {
    total: executions?.length || 0,
    completed: executions?.filter(e => e.status === 'Completed').length || 0,
    failed: executions?.filter(e => e.status === 'Failed').length || 0,
    running: executions?.filter(e => e.status === 'Running').length || 0,
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
            variant={filter === 'Running' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('Running')}
          >
            Running ({stats.running})
          </Button>
          <Button
            variant={filter === 'Completed' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('Completed')}
          >
            Completed ({stats.completed})
          </Button>
          <Button
            variant={filter === 'Failed' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('Failed')}
          >
            Failed ({stats.failed})
          </Button>
        </div>
        <input
          type="text"
          placeholder="Search executions..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
        />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-gray-500">Total</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-blue-600">{stats.running}</div>
            <p className="text-xs text-gray-500">Running</p>
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
            <div className="text-2xl font-bold text-red-600">{stats.failed}</div>
            <p className="text-xs text-gray-500">Failed</p>
          </CardContent>
        </Card>
      </div>

      {/* Execution List */}
      <Card>
        <CardHeader>
          <CardTitle>Execution History</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-gray-500">Loading...</div>
          ) : filteredExecutions.length === 0 ? (
            <div className="text-center py-8 text-gray-500">No executions found</div>
          ) : (
            <div className="space-y-2">
              {filteredExecutions.map((exec) => (
                <div key={exec.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                  <div className="flex items-center gap-4 flex-1">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      exec.status === 'Completed' ? 'bg-green-100' :
                      exec.status === 'Failed' ? 'bg-red-100' :
                      exec.status === 'Running' ? 'bg-blue-100' : 'bg-gray-100'
                    }`}>
                      {exec.status === 'Completed' ? <CheckCircle className="w-5 h-5 text-green-600" /> :
                       exec.status === 'Failed' ? <XCircle className="w-5 h-5 text-red-600" /> :
                       exec.status === 'Running' ? <Play className="w-5 h-5 text-blue-600" /> :
                       <Activity className="w-5 h-5 text-gray-600" />}
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold">{exec.workflow_name}</div>
                      <div className="text-sm text-gray-500">
                        {exec.trigger_entity_name} • {exec.execution_id}
                      </div>
                      <div className="text-xs text-gray-400 mt-1">
                        Started: {exec.started_at ? new Date(exec.started_at).toLocaleString('en-ZA') : 'N/A'}
                        {exec.duration_seconds && ` • Duration: ${(exec.duration_seconds / 60).toFixed(1)}m`}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <Badge className={STATUS_COLORS[exec.status] || 'bg-gray-100 text-gray-700'}>
                      {exec.status}
                    </Badge>
                    <div className="text-sm text-gray-500">
                      Step {exec.current_step}/{exec.total_steps}
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <Activity className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          View Details
                        </DropdownMenuItem>
                        {exec.status === 'Running' && (
                          <DropdownMenuItem className="text-amber-600">
                            <Pause className="w-4 h-4 mr-2" />
                            Pause
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem className="text-red-600">
                          Cancel
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}