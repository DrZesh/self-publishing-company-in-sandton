import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { platform } from '@/api/platformClient';
import AdminLayout from '@/components/admin/AdminLayout';
import { Plus, Search, CheckCircle2, LayoutGrid, List } from 'lucide-react';
import TaskModal from '@/components/admin/tasks/TaskModal';
import TaskKanban from '@/components/admin/tasks/TaskKanban';
import { motion } from 'framer-motion';

const PRIORITY_CONFIG = {
  Low:    { dot: 'bg-blue-400',   pill: 'bg-blue-500/20 text-blue-200 border-blue-400/30' },
  Medium: { dot: 'bg-yellow-400', pill: 'bg-yellow-500/20 text-yellow-200 border-yellow-400/30' },
  High:   { dot: 'bg-orange-400', pill: 'bg-orange-500/20 text-orange-200 border-orange-400/30' },
  Urgent: { dot: 'bg-red-400',    pill: 'bg-red-500/20 text-red-200 border-red-400/30' },
};

const GLASS = {
  background: 'rgba(0,0,0,0.25)',
  backdropFilter: 'blur(24px)',
  border: '1px solid rgba(255,255,255,0.15)',
  boxShadow: '0 8px 40px rgba(0,0,0,0.25)',
};

export default function AdminTasks() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('Pending');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [viewMode, setViewMode] = useState('list'); // 'list' | 'kanban'
  const [editingTask, setEditingTask] = useState(null);

  const { data: tasks = [], isLoading } = useQuery({
    queryKey: ['tasks'],
    queryFn: () => platform.entities.Task.list('-due_date', 500),
  });

  const { data: contacts = [] } = useQuery({
    queryKey: ['contacts'],
    queryFn: () => platform.entities.Contact.list('-created_date', 500),
  });

  const updateTask = useMutation({
    mutationFn: ({ id, data }) => platform.entities.Task.update(id, data),
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
  const urgentCount  = tasks.filter(t => t.priority === 'Urgent' && t.status !== 'Done').length;
  const overdueCount = tasks.filter(t => t.due_date && new Date(t.due_date) < new Date() && t.status === 'Pending').length;
  const doneCount    = tasks.filter(t => t.status === 'Done').length;

  const markDone = (task) => updateTask.mutate({ id: task.id, data: { status: 'Done' } });

  const kpis = [
    { label: 'Pending',   value: pendingCount, color: 'text-white' },
    { label: 'Urgent',    value: urgentCount,  color: 'text-red-300' },
    { label: 'Overdue',   value: overdueCount, color: 'text-orange-300' },
    { label: 'Completed', value: doneCount,    color: 'text-green-300' },
  ];

  return (
    <AdminLayout>
      {/* Full-page gradient background matching calendar */}
      <div
        className="min-h-screen -m-6 p-6 relative"
        style={{
          backgroundImage: `url(https://images.unsplash.com/photo-1614851099511-773084f6911d?w=1600&q=80)`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, rgba(100,120,200,0.55) 0%, rgba(180,100,200,0.45) 50%, rgba(100,160,220,0.5) 100%)' }} />

        <div className="relative z-10 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white drop-shadow">Tasks &amp; Reminders</h1>
              <p className="text-sm text-white/60 mt-0.5">Stay on top of follow-ups, approvals, and deadlines</p>
            </div>
            <div className="flex items-center gap-2">
              {/* View toggle */}
              <div className="flex items-center rounded-xl p-1" style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.15)' }}>
                <button onClick={() => setViewMode('list')}
                  className="p-1.5 rounded-lg transition-all"
                  style={viewMode === 'list' ? { background: 'linear-gradient(135deg,#ec4899,#f97316)' } : {}}>
                  <List className="w-4 h-4 text-white" />
                </button>
                <button onClick={() => setViewMode('kanban')}
                  className="p-1.5 rounded-lg transition-all"
                  style={viewMode === 'kanban' ? { background: 'linear-gradient(135deg,#ec4899,#f97316)' } : {}}>
                  <LayoutGrid className="w-4 h-4 text-white" />
                </button>
              </div>
              <button
                onClick={() => { setEditingTask(null); setShowModal(true); }}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white transition-colors"
                style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.2)' }}
              >
                <Plus className="w-4 h-4" /> New Task
              </button>
            </div>
          </div>

          {/* KPI Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {kpis.map(k => (
              <div key={k.label} className="rounded-2xl p-4" style={GLASS}>
                <p className="text-xs text-white/50 uppercase tracking-widest">{k.label}</p>
                <p className={`text-3xl font-bold mt-1 ${k.color}`}>{k.value}</p>
              </div>
            ))}
          </div>

          {/* Status Tabs + Filters */}
          <div className="flex flex-wrap gap-3 items-center">
            <div className="flex items-center space-x-1 rounded-xl p-1" style={{ background: 'rgba(0,0,0,0.2)' }}>
              {['', 'Pending', 'In Progress', 'Done', 'Cancelled'].map(s => (
                <button
                  key={s || 'all'}
                  onClick={() => setStatusFilter(s)}
                  className="rounded-lg px-3 py-1.5 text-xs font-semibold transition-all"
                  style={statusFilter === s
                    ? { background: 'linear-gradient(135deg, #ec4899, #f97316)', color: '#fff', boxShadow: '0 2px 8px rgba(0,0,0,0.3)' }
                    : { color: 'rgba(255,255,255,0.55)' }}
                >
                  {s || 'All'}
                </button>
              ))}
            </div>

            {/* Search */}
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
              <input
                placeholder="Search tasks..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full rounded-xl pl-9 pr-3 py-2 text-sm text-white placeholder-white/30 outline-none focus:ring-1 focus:ring-white/20"
                style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.15)' }}
              />
            </div>

            {/* Priority filter */}
            <select
              value={priorityFilter}
              onChange={e => setPriorityFilter(e.target.value)}
              className="rounded-xl px-3 py-2 text-sm text-white/80 outline-none"
              style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.15)' }}
            >
              <option value="" style={{ background: '#1e1e2e' }}>All Priorities</option>
              {Object.keys(PRIORITY_CONFIG).map(p => <option key={p} value={p} style={{ background: '#1e1e2e' }}>{p}</option>)}
            </select>
          </div>

          {/* Kanban view */}
          {viewMode === 'kanban' && (
            <TaskKanban
              tasks={tasks}
              contactMap={contactMap}
              onEdit={(task) => { setEditingTask(task); setShowModal(true); }}
              onUpdate={() => queryClient.invalidateQueries({ queryKey: ['tasks'] })}
            />
          )}

          {/* Tasks List */}
          {viewMode === 'list' && <div className="space-y-2">
            {isLoading ? (
              <div className="p-12 text-center text-white/40">Loading tasks...</div>
            ) : filtered.length === 0 ? (
              <div className="rounded-3xl p-12 text-center" style={GLASS}>
                <CheckCircle2 className="w-10 h-10 text-white/20 mx-auto mb-3" />
                <p className="text-white/40">No tasks found</p>
              </div>
            ) : (
              filtered.map((task, idx) => {
                const contact = contactMap[task.contact_id];
                const isOverdue = task.due_date && new Date(task.due_date) < new Date() && task.status === 'Pending';
                const priority = PRIORITY_CONFIG[task.priority] || PRIORITY_CONFIG.Low;
                return (
                  <motion.div
                    key={task.id}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.03 }}
                    className="flex items-center gap-4 px-4 py-3 rounded-2xl"
                    style={{
                      background: isOverdue ? 'rgba(239,68,68,0.15)' : 'rgba(255,255,255,0.07)',
                      border: `1px solid ${isOverdue ? 'rgba(239,68,68,0.3)' : 'rgba(255,255,255,0.1)'}`,
                    }}
                  >
                    {/* Check button */}
                    <button
                      onClick={() => task.status !== 'Done' && markDone(task)}
                      className="flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all"
                      style={task.status === 'Done'
                        ? { borderColor: '#4ade80', background: '#4ade80' }
                        : { borderColor: 'rgba(255,255,255,0.3)' }}
                    >
                      {task.status === 'Done' && <CheckCircle2 className="w-4 h-4 text-white" />}
                    </button>

                    {/* Title + meta */}
                    <div className="flex-1 min-w-0">
                      <p className={`font-medium text-sm ${task.status === 'Done' ? 'line-through text-white/30' : 'text-white'}`}>
                        {task.title}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                        {contact && <span className="text-xs text-white/40">{contact.full_name}</span>}
                        {task.task_type && <span className="text-xs text-white/30">{task.task_type}</span>}
                      </div>
                    </div>

                    {/* Right badges */}
                    <div className="flex items-center gap-2 flex-shrink-0 flex-wrap justify-end">
                      {task.priority && (
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${priority.pill}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${priority.dot}`} />
                          {task.priority}
                        </span>
                      )}
                      <span className={`text-xs font-medium px-2 py-1 rounded-full ${isOverdue ? 'bg-red-500/20 text-red-300 border border-red-400/30' : 'text-white/40'}`}>
                        {task.due_date ? new Date(task.due_date).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short' }) : '—'}
                        {isOverdue && ' overdue'}
                      </span>
                      {task.assigned_to && (
                        <span className="text-xs px-2 py-1 rounded-full text-white/40" style={{ background: 'rgba(255,255,255,0.08)' }}>
                          {task.assigned_to.split('@')[0]}
                        </span>
                      )}
                    </div>
                  </motion.div>
                );
              })
            )}
          </div>}
        </div>
      </div>

      {showModal && (
        <TaskModal
          task={editingTask}
          contacts={contacts}
          onClose={() => { setShowModal(false); setEditingTask(null); }}
          onSaved={() => { queryClient.invalidateQueries({ queryKey: ['tasks'] }); setShowModal(false); setEditingTask(null); }}
        />
      )}
    </AdminLayout>
  );
}