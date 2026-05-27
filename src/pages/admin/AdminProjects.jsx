import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import AdminLayout from '@/components/admin/AdminLayout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Search, AlertTriangle, BookOpen, ChevronRight } from 'lucide-react';
import ProjectModal from '@/components/admin/projects/ProjectModal';
import ProjectDetailPanel from '@/components/admin/projects/ProjectDetailPanel';

const STAGE_COLORS = {
  'Enquiry Received': 'bg-slate-100 text-slate-700',
  'Quote Sent': 'bg-blue-100 text-blue-700',
  'Quote Accepted': 'bg-cyan-100 text-cyan-700',
  'Contract Sent': 'bg-purple-100 text-purple-700',
  'Contract Signed': 'bg-violet-100 text-violet-700',
  'Payment Received': 'bg-emerald-100 text-emerald-700',
  'Manuscript Received': 'bg-teal-100 text-teal-700',
  'Editing': 'bg-yellow-100 text-yellow-700',
  'Proofreading': 'bg-orange-100 text-orange-700',
  'Typesetting': 'bg-amber-100 text-amber-700',
  'Cover Design': 'bg-pink-100 text-pink-700',
  'Client Approval': 'bg-indigo-100 text-indigo-700',
  'Changes Requested': 'bg-red-100 text-red-700',
  'Final Approval Received': 'bg-green-100 text-green-700',
  'Sample Print Queued': 'bg-lime-100 text-lime-700',
  'Sample Print Completed': 'bg-green-100 text-green-700',
  'Mass Production Started': 'bg-teal-100 text-teal-700',
  'Ready for Collection': 'bg-emerald-100 text-emerald-700',
  'Courier Booked': 'bg-cyan-100 text-cyan-700',
  'Delivered': 'bg-green-100 text-green-700',
  'Completed': 'bg-gray-100 text-gray-600',
};

const PAYMENT_COLORS = {
  'Unpaid': 'bg-red-100 text-red-700',
  'Deposit Paid': 'bg-yellow-100 text-yellow-700',
  'Partially Paid': 'bg-orange-100 text-orange-700',
  'Fully Paid': 'bg-green-100 text-green-700',
  'Overdue': 'bg-red-200 text-red-800',
};

const PIPELINE_STAGES = [
  'Enquiry Received', 'Quote Sent', 'Quote Accepted', 'Contract Sent', 'Contract Signed',
  'Payment Received', 'Manuscript Received', 'Editing', 'Proofreading', 'Typesetting',
  'Cover Design', 'Client Approval', 'Changes Requested', 'Final Approval Received',
  'Sample Print Queued', 'Sample Print Completed', 'Mass Production Started',
  'Ready for Collection', 'Courier Booked', 'Delivered', 'Completed'
];

export default function AdminProjects() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [stageFilter, setStageFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selected, setSelected] = useState(null);

  const { data: projects = [], isLoading } = useQuery({
    queryKey: ['projects'],
    queryFn: () => base44.entities.Project.list('-created_date', 200),
  });

  const { data: contacts = [] } = useQuery({
    queryKey: ['contacts'],
    queryFn: () => base44.entities.Contact.list('-created_date', 500),
  });

  const contactMap = Object.fromEntries(contacts.map(c => [c.id, c]));

  const filtered = projects.filter(p => {
    const q = search.toLowerCase();
    const matchSearch = !q || p.book_title?.toLowerCase().includes(q) || p.author_name?.toLowerCase().includes(q) || contactMap[p.contact_id]?.full_name?.toLowerCase().includes(q);
    const matchStage = !stageFilter || p.stage === stageFilter;
    return matchSearch && matchStage;
  });

  const stageCounts = PIPELINE_STAGES.reduce((acc, s) => {
    acc[s] = projects.filter(p => p.stage === s).length;
    return acc;
  }, {});

  const activeCount = projects.filter(p => !['Completed', 'Delivered'].includes(p.stage)).length;
  const atRiskCount = projects.filter(p => p.is_at_risk).length;
  const readyCount = projects.filter(p => p.stage === 'Ready for Collection').length;

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Projects</h1>
            <p className="text-sm text-gray-500 mt-0.5">Full production pipeline for every book project</p>
          </div>
          <Button onClick={() => setShowModal(true)} className="gap-2 bg-[#B87333] hover:bg-[#A06828] text-white">
            <Plus className="w-4 h-4" /> New Project
          </Button>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Active Projects', value: activeCount, color: 'bg-blue-50 text-blue-700' },
            { label: 'At Risk', value: atRiskCount, color: 'bg-red-50 text-red-700' },
            { label: 'Ready for Collection', value: readyCount, color: 'bg-green-50 text-green-700' },
            { label: 'Total Projects', value: projects.length, color: 'bg-gray-50 text-gray-700' },
          ].map(card => (
            <div key={card.label} className="bg-white rounded-xl border border-gray-100 p-4">
              <p className="text-xs text-gray-500">{card.label}</p>
              <p className={`text-2xl font-bold mt-1 ${card.color.split(' ')[1]}`}>{card.value}</p>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-[220px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input placeholder="Search by title, author, client…" value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
          </div>
          <select value={stageFilter} onChange={e => setStageFilter(e.target.value)} className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white">
            <option value="">All Stages</option>
            {PIPELINE_STAGES.map(s => <option key={s} value={s}>{s} {stageCounts[s] > 0 ? `(${stageCounts[s]})` : ''}</option>)}
          </select>
        </div>

        {/* Projects Table */}
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          {isLoading ? (
            <div className="p-12 text-center text-gray-400">Loading projects…</div>
          ) : filtered.length === 0 ? (
            <div className="p-12 text-center">
              <BookOpen className="w-10 h-10 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No projects found</p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  {['Book Title', 'Client', 'Stage', 'Payment', 'Deadline', 'Value', ''].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map(project => {
                  const contact = contactMap[project.contact_id];
                  const isOverdue = project.deadline && new Date(project.deadline) < new Date() && !['Completed', 'Delivered'].includes(project.stage);
                  return (
                    <tr key={project.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 font-medium text-gray-900">
                        <div className="flex items-center gap-2">
                          {project.is_at_risk && <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0" />}
                          <span>{project.book_title}</span>
                        </div>
                        <div className="text-xs text-gray-400">{project.author_name}</div>
                      </td>
                      <td className="px-4 py-3 text-gray-600">{contact?.full_name || '—'}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${STAGE_COLORS[project.stage] || 'bg-gray-100 text-gray-600'}`}>
                          {project.stage}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${PAYMENT_COLORS[project.payment_status] || 'bg-gray-100 text-gray-600'}`}>
                          {project.payment_status}
                        </span>
                      </td>
                      <td className={`px-4 py-3 text-sm ${isOverdue ? 'text-red-600 font-medium' : 'text-gray-600'}`}>
                        {project.deadline ? new Date(project.deadline).toLocaleDateString('en-ZA') : '—'}
                        {isOverdue && <span className="block text-xs text-red-500">Overdue</span>}
                      </td>
                      <td className="px-4 py-3 text-gray-700 font-medium">
                        {project.project_value ? `R ${project.project_value.toLocaleString()}` : '—'}
                      </td>
                      <td className="px-4 py-3">
                        <Button variant="ghost" size="sm" onClick={() => setSelected(project)}>
                          <ChevronRight className="w-4 h-4" />
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {showModal && (
        <ProjectModal
          contacts={contacts}
          onClose={() => setShowModal(false)}
          onSaved={() => { queryClient.invalidateQueries({ queryKey: ['projects'] }); setShowModal(false); }}
        />
      )}

      {selected && (
        <ProjectDetailPanel
          project={selected}
          contact={contactMap[selected.contact_id]}
          onClose={() => setSelected(null)}
          onUpdated={() => { queryClient.invalidateQueries({ queryKey: ['projects'] }); setSelected(null); }}
        />
      )}
    </AdminLayout>
  );
}