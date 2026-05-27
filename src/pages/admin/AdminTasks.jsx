import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import AdminLayout from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Search, CheckCircle2, Clock, AlertCircle, Circle } from 'lucide-react';
import TaskModal from '@/components/admin/tasks/TaskModal';

const PRIORITY_COLORS = {
  Low: 'bg-gray-100 text-gray-600',
  Medium: 'bg-blue-100 text-blue-700',
  High: 'bg-orange-100 text-orange-700',
  Urgent: 'bg-red-100 text-red-700',
};

const STATUS_ICONS = {
  Pending: Clock,
  'In Progress': AlertCircle,
  Done: CheckCircle2,
  Cancelled: Circle,
};

export default function AdminTasks() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('Pending');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [showModal, setShowModal] = useState(false);

  const { data: tasks = [], isLoading } = useQuery({
    queryKey: ['tasks'],
    queryFn: () => base44.entities.Task.list('-due_date', 500),
  });

  const { data: contacts = [] } = useQuery({
    queryKey: ['contacts'],
    queryFn: () => base44.entities.Contact.list('-created_date', 500),
  });

  const updateTask = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Task.update(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['tasks'] }),
  });

  const contactMap = Object.fromEntries(contacts.map(c => [c.id, c]));

  const filtered = tasks.filter(t => {
    const q = search.toLowerCase();
    const contact = contactMap[t.contact_id];
    const matchSearch = !q || t.title?.toLowerCase().includes(q) || contact?.full_name?.toLowerCase().includes(q);
    const matchStatus = !statusFilter || t.status === statusFilter;
    const matchPriority = !priorityFilter || t.priority === priorityFilter;
    return matchSearch && matchStatus && matchPriority;
  });

  const pendingCount = tasks.filter(t => t.status === 'Pending').length;
  const urgentCount = tasks.filter(t => t.priority === 'Urgent' && t.status !== 'Done').length;
  const overdueCount = tasks.filter(t => t.due_date && new Date(t.due_date) < new Date() && t.status === 'Pending').length;
  const doneCount = tasks.filter(t => t.status === 'Done').length;

  const markDone = (task) => updateTask.mutate({ id: task.id, data: { status: 'Done' } });

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Tasks &amp; Reminders</h1>
            <p className="text-sm text-gray-500 mt-0.5">Stay on top of follow-ups, approvals, and deadlines</p>
          </div>
          <Button onClick={() => setShowModal(true)} className="gap-2 bg-[#B87333] hover:bg-[#A06828] text-white">
            <Plus className="w-4 h-4" /> New Task
          </Button>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl border border-gray-100 p-4">
            <p className="text-xs text-gray-500">Pending</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{pendingCount}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 p-4">
            <p className="text-xs text-gray-500">Urgent</p>
            <p className="text-2xl font-bold text-red-600 mt-1">{urgentCount}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 p-4">
            <p className="text-xs text-gray-500">Overdue</p>
            <p className="text-2xl font-bold text-orange-600 mt-1">{overdueCount}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 p-4">
            <p className="text-xs text-gray-500">Completed</p>
            <p className="text-2xl font-bold text-green-600 mt-1">{doneCount}</p>
          </div>
        </div>

        {/* Status Tabs */}
        <div className="flex gap-2 flex-wrap">
          {['', 'Pending', 'In Progress', 'Done', 'Cancelled'].map(s => (
            <button
              key={s || 'all'}
              onClick={() => setStatusFilter(s)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${statusFilter === s ? 'bg-[#B87333] text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}
            >
              {s || 'All Tasks'}
            </button>
          ))}
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-[220px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input placeholder="Search tasks..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
          </div>
          <select value={priorityFilter} onChange={e => setPriorityFilter(e.target.value)} className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white">
            <option value="">All Priorities</option>
            {Object.keys(PRIORITY_COLORS).map(p => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>

        {/* Tasks List */}
        <div className="space-y-2">
          {isLoading ? (
            <div className="p-12 text-center text-gray-400">Loading tasks...</div>
          ) : filtered.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-100 p-12 text-center">
              <CheckCircle2 className="w-10 h-10 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No tasks found</p>
            </div>
          ) : (
            filtered.map(task => {
              const contact = contactMap[task.contact_id];
              const isOverdue = task.due_date && new Date(task.due_date) < new Date() && task.status === 'Pending';
              return (
                <div key={task.id} className={`bg-white rounded-xl border p-4 flex items-center gap-4 transition-colors ${isOverdue ? 'border-red-200 bg-red-50/30' : 'border-gray-100 hover:border-gray-200'}`}>
                  <button
                    onClick={() => task.status !== 'Done' && markDone(task)}
                    className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${task.status === 'Done' ? 'border-green-500 bg-green-500' : 'border-gray-300 hover:border-green-400'}`}
                  >
                    {task.status === 'Done' && <CheckCircle2 className="w-4 h-4 text-white" />}
                  </button>
                  <div className="flex-1 min-w-0">
                    <p className={`font-medium text-sm ${task.status === 'Done' ? 'line-through text-gray-400' : 'text-gray-900'}`}>{task.title}</p>
                    <div className="flex items-center gap-3 mt-1">
                      {contact && <span className="text-xs text-gray-500">{contact.full_name}</span>}
                      {task.task_type && <span className="text-xs text-gray-400">{task.task_type}</span>}
                      {task.notes && <span className="text-xs text-gray-400 truncate">{task.notes}</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${PRIORITY_COLORS[task.priority] || 'bg-gray-100 text-gray-600'}`}>
                      {task.priority}
                    </span>
                    <span className={`text-xs font-medium ${isOverdue ? 'text-red-600' : 'text-gray-500'}`}>
                      {task.due_date ? new Date(task.due_date).toLocaleDateString('en-ZA') : '---'}
                      {isOverdue && ' (overdue)'}
                    </span>
                    {task.assigned_to && (
                      <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">{task.assigned_to.split('@')[0]}</span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {showModal && (
        <TaskModal
          contacts={contacts}
          onClose={() => setShowModal(false)}
          onSaved={() => { queryClient.invalidateQueries({ queryKey: ['tasks'] }); setShowModal(false); }}
        />
      )}
    </AdminLayout>
  );
}