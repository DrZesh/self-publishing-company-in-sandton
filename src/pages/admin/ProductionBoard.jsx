import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import AdminLayout from '@/components/admin/AdminLayout';
import { AlertTriangle, RefreshCw } from 'lucide-react';

const PRODUCTION_STAGES = [
  'Manuscript Received',
  'Editing',
  'Proofreading',
  'Typesetting',
  'Cover Design',
  'Client Approval',
  'Changes Requested',
  'Final Approval Received',
  'Sample Print Queued',
  'Sample Print Completed',
  'Mass Production Started',
  'Ready for Collection',
];

const STAGE_COLORS = {
  'Manuscript Received': '#6366f1',
  'Editing': '#f59e0b',
  'Proofreading': '#f97316',
  'Typesetting': '#8b5cf6',
  'Cover Design': '#ec4899',
  'Client Approval': '#3b82f6',
  'Changes Requested': '#ef4444',
  'Final Approval Received': '#10b981',
  'Sample Print Queued': '#14b8a6',
  'Sample Print Completed': '#06b6d4',
  'Mass Production Started': '#0ea5e9',
  'Ready for Collection': '#22c55e',
};

function ProjectCard({ project, contact, onStageChange }) {
  const isAtRisk = project.is_at_risk;
  const daysSinceChange = project.stage_changed_at
    ? Math.floor((Date.now() - new Date(project.stage_changed_at)) / 86400000)
    : null;
  const isStale = daysSinceChange !== null && daysSinceChange > 7;

  return (
    <div className={`bg-white rounded-xl border p-3 shadow-sm hover:shadow-md transition-all cursor-pointer ${isAtRisk ? 'border-red-300' : isStale ? 'border-orange-200' : 'border-gray-100'}`}>
      <div className="flex items-start justify-between gap-1 mb-1.5">
        <p className="text-sm font-semibold text-gray-900 leading-tight truncate">{project.book_title}</p>
        {isAtRisk && <AlertTriangle className="w-3.5 h-3.5 text-red-500 flex-shrink-0 mt-0.5" />}
      </div>
      {contact && <p className="text-xs text-gray-500 truncate">{contact.full_name}</p>}
      <div className="flex items-center justify-between mt-2">
        <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-semibold ${project.payment_status === 'Fully Paid' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
          {project.payment_status}
        </span>
        {isStale && (
          <span className="text-[10px] text-orange-500 font-medium">{daysSinceChange}d in stage</span>
        )}
      </div>
      {project.deadline && (
        <p className="text-[10px] text-gray-400 mt-1">
          Deadline: {new Date(project.deadline).toLocaleDateString('en-ZA')}
        </p>
      )}
      {/* Move stage buttons */}
      <div className="flex gap-1 mt-2">
        <select
          className="text-[10px] border border-gray-200 rounded px-1 py-0.5 flex-1 bg-white"
          value={project.stage}
          onChange={e => onStageChange(project.id, e.target.value)}
          onClick={e => e.stopPropagation()}
        >
          {PRODUCTION_STAGES.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>
    </div>
  );
}

export default function ProductionBoard() {
  const queryClient = useQueryClient();
  const [autoRefresh, setAutoRefresh] = useState(true);

  const { data: projects = [], isLoading } = useQuery({
    queryKey: ['projects-production'],
    queryFn: () => base44.entities.Project.list('-stage_changed_at', 500),
    refetchInterval: autoRefresh ? 30000 : false,
  });

  const { data: contacts = [] } = useQuery({
    queryKey: ['contacts'],
    queryFn: () => base44.entities.Contact.list('-created_date', 500),
  });

  const contactMap = Object.fromEntries(contacts.map(c => [c.id, c]));

  const updateStage = useMutation({
    mutationFn: ({ id, stage }) => base44.entities.Project.update(id, { stage, stage_changed_at: new Date().toISOString() }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['projects-production'] }),
  });

  const productionProjects = projects.filter(p => PRODUCTION_STAGES.includes(p.stage));

  return (
    <AdminLayout>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Production Board</h1>
            <p className="text-sm text-gray-500 mt-0.5">Live view of all active production projects</p>
          </div>
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 text-xs text-gray-500 cursor-pointer">
              <input type="checkbox" checked={autoRefresh} onChange={e => setAutoRefresh(e.target.checked)} className="accent-[#B87333]" />
              Auto-refresh (30s)
            </label>
            <button onClick={() => queryClient.invalidateQueries({ queryKey: ['projects-production'] })}
              className="p-2 hover:bg-gray-100 rounded-lg border border-gray-200">
              <RefreshCw className="w-4 h-4 text-gray-500" />
            </button>
          </div>
        </div>

        {/* KPIs */}
        <div className="flex items-center gap-4 flex-wrap">
          <div className="bg-white rounded-xl border border-gray-100 px-4 py-2.5 text-center">
            <p className="text-xl font-bold text-gray-900">{productionProjects.length}</p>
            <p className="text-xs text-gray-500">In Production</p>
          </div>
          <div className="bg-red-50 rounded-xl border border-red-100 px-4 py-2.5 text-center">
            <p className="text-xl font-bold text-red-600">{productionProjects.filter(p => p.is_at_risk).length}</p>
            <p className="text-xs text-red-600">At Risk</p>
          </div>
          <div className="bg-orange-50 rounded-xl border border-orange-100 px-4 py-2.5 text-center">
            <p className="text-xl font-bold text-orange-600">{productionProjects.filter(p => p.stage_changed_at && Math.floor((Date.now() - new Date(p.stage_changed_at)) / 86400000) > 7).length}</p>
            <p className="text-xs text-orange-600">Stale (&gt;7 days)</p>
          </div>
          <div className="bg-green-50 rounded-xl border border-green-100 px-4 py-2.5 text-center">
            <p className="text-xl font-bold text-green-600">{projects.filter(p => p.stage === 'Ready for Collection').length}</p>
            <p className="text-xs text-green-600">Ready for Collection</p>
          </div>
        </div>

        {/* Kanban board */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-4 border-[#B87333]/20 border-t-[#B87333] rounded-full animate-spin" />
          </div>
        ) : (
          <div className="overflow-x-auto pb-4">
            <div className="flex gap-4 min-w-max">
              {PRODUCTION_STAGES.map(stage => {
                const stageProjects = productionProjects.filter(p => p.stage === stage);
                const color = STAGE_COLORS[stage];
                return (
                  <div key={stage} className="w-60 flex-shrink-0">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: color }} />
                      <p className="text-xs font-semibold text-gray-700 leading-tight">{stage}</p>
                      <span className="ml-auto text-xs font-bold bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded-full">{stageProjects.length}</span>
                    </div>
                    <div className="space-y-2 min-h-[100px] p-2 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                      {stageProjects.length === 0 && (
                        <div className="text-center py-6 text-xs text-gray-300">Empty</div>
                      )}
                      {stageProjects.map(p => (
                        <ProjectCard
                          key={p.id}
                          project={p}
                          contact={contactMap[p.contact_id]}
                          onStageChange={(id, stage) => updateStage.mutate({ id, stage })}
                        />
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}