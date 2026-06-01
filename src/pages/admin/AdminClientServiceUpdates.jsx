import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import AdminLayout from '@/components/admin/AdminLayout';
import { Plus, Search, Filter, RefreshCw, Settings, List, Send, Eye, Edit3,
         ChevronDown, CheckCircle, Clock, XCircle, Mail } from 'lucide-react';
import { toast } from 'sonner';
import StatCards from '@/components/admin/clientservice/StatCards';
import ProjectModal from '@/components/admin/clientservice/ProjectModal';
import StageUpdateModal from '@/components/admin/clientservice/StageUpdateModal';
import ProjectDetail from '@/components/admin/clientservice/ProjectDetail';
import WorkflowSettings from '@/components/admin/clientservice/WorkflowSettings';
import { STATUS_COLORS, SERVICE_COLORS, SERVICE_TYPES } from '@/components/admin/clientservice/WORKFLOWS';

// ─── Glass panel ──────────────────────────────────────────────────────────────
function Glass({ children, className = '' }) {
  return (
    <div className={`rounded-2xl border border-white/60 backdrop-blur-xl ${className}`}
      style={{ background: 'rgba(255,255,255,0.72)', boxShadow: '0 4px 20px rgba(0,0,0,0.06), 0 0 0 1px rgba(255,255,255,0.8)' }}>
      {children}
    </div>
  );
}

// ─── Stage badge ──────────────────────────────────────────────────────────────
function StageBadge({ label }) {
  if (!label) return <span className="text-xs text-slate-400">—</span>;
  return (
    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-semibold bg-blue-100 text-blue-700 border border-blue-200 whitespace-nowrap">
      {label}
    </span>
  );
}

// ─── Project row ──────────────────────────────────────────────────────────────
function ProjectRow({ project, emailStats, onView, onEdit, onUpdateStage }) {
  const sc = STATUS_COLORS[project.status] || STATUS_COLORS.active;
  const svc = SERVICE_COLORS[project.service_type] || SERVICE_COLORS['Book Printing'];
  const failedCount = emailStats?.failed || 0;
  const sentCount = emailStats?.total || 0;

  return (
    <tr className="group hover:bg-blue-50/30 transition-colors cursor-pointer" onClick={() => onView(project)}>
      <td className="px-4 py-3">
        <div>
          <p className="text-sm font-semibold text-slate-800 group-hover:text-blue-700 transition-colors">{project.client_name}</p>
          <p className="text-xs text-slate-400 truncate max-w-[160px]">{project.client_email}</p>
        </div>
      </td>
      <td className="px-4 py-3 hidden md:table-cell">
        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-semibold border ${svc.bg} ${svc.text} ${svc.border}`}>
          {project.service_type}
        </span>
      </td>
      <td className="px-4 py-3">
        <p className="text-sm text-slate-700 font-medium truncate max-w-[160px]">{project.project_title}</p>
      </td>
      <td className="px-4 py-3 hidden lg:table-cell">
        <StageBadge label={project.current_stage_label} />
      </td>
      <td className="px-4 py-3 hidden sm:table-cell">
        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold border ${sc.bg} ${sc.text} ${sc.border}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${sc.dot}`} />
          {project.status?.replace('_', ' ')}
        </span>
      </td>
      <td className="px-4 py-3 hidden xl:table-cell">
        <div className="flex items-center gap-1.5">
          {failedCount > 0 ? (
            <span className="flex items-center gap-1 text-[10px] font-semibold text-red-600 bg-red-50 px-2 py-0.5 rounded-full border border-red-100">
              <XCircle className="w-3 h-3" />{failedCount} failed
            </span>
          ) : sentCount > 0 ? (
            <span className="flex items-center gap-1 text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
              <CheckCircle className="w-3 h-3" /> {sentCount} sent
            </span>
          ) : (
            <span className="text-xs text-slate-300">No emails</span>
          )}
        </div>
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
          <button onClick={() => onUpdateStage(project)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-bold text-white rounded-lg transition-all hover:scale-105 whitespace-nowrap"
            style={{ background: 'linear-gradient(135deg,#B87333,#d4944a)', boxShadow: '0 2px 8px rgba(184,115,51,0.3)' }}>
            <Send className="w-3 h-3" /> Update Stage
          </button>
          <button onClick={() => onEdit(project)}
            className="p-1.5 rounded-lg border border-slate-200 text-slate-400 hover:text-blue-600 hover:border-blue-200 hover:bg-blue-50 transition-all">
            <Edit3 className="w-3.5 h-3.5" />
          </button>
        </div>
      </td>
    </tr>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function AdminClientServiceUpdates() {
  const qc = useQueryClient();
  const [tab, setTab] = useState('projects');
  const [search, setSearch] = useState('');
  const [filterService, setFilterService] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [stageProject, setStageProject] = useState(null);
  const [viewProject, setViewProject] = useState(null);

  const { data: projects = [], isLoading: loadingProjects } = useQuery({
    queryKey: ['client-service-projects'],
    queryFn: () => base44.entities.ClientServiceProject.list('-updated_date', 100),
    staleTime: 30000,
  });

  const { data: emailLogs = [] } = useQuery({
    queryKey: ['service-email-logs'],
    queryFn: () => base44.entities.ServiceEmailLog.list('-sent_at', 200),
    staleTime: 30000,
  });

  // Pre-compute email stats per project O(n) once, O(1) lookup per row
  const emailStatsByProject = useMemo(() => {
    const map = {};
    for (const log of emailLogs) {
      if (!map[log.project_id]) map[log.project_id] = { total: 0, failed: 0 };
      const s = map[log.project_id];
      if (log.status === 'failed') s.failed++; else s.total++;
    }
    return map;
  }, [emailLogs]);

  const refresh = () => {
    qc.invalidateQueries({ queryKey: ['client-service-projects'] });
    qc.invalidateQueries({ queryKey: ['service-email-logs'] });
    if (viewProject) {
      const updated = projects.find(p => p.id === viewProject.id);
      if (updated) setViewProject(updated);
    }
  };

  const handleProjectSaved = (saved) => {
    qc.invalidateQueries({ queryKey: ['client-service-projects'] });
  };

  const handleStageUpdated = () => {
    qc.invalidateQueries({ queryKey: ['client-service-projects'] });
    qc.invalidateQueries({ queryKey: ['service-email-logs'] });
  };

  const filtered = useMemo(() => projects.filter(p => {
    if (filterService !== 'all' && p.service_type !== filterService) return false;
    if (filterStatus !== 'all' && p.status !== filterStatus) return false;
    if (search) {
      const q = search.toLowerCase();
      return p.client_name?.toLowerCase().includes(q) ||
        p.client_email?.toLowerCase().includes(q) ||
        p.project_title?.toLowerCase().includes(q);
    }
    return true;
  }), [projects, filterService, filterStatus, search]);

  // Update viewProject when projects data refreshes
  const currentViewProject = useMemo(
    () => viewProject ? (projects.find(p => p.id === viewProject.id) || viewProject) : null,
    [viewProject, projects]
  );

  return (
    <AdminLayout>
      <div className="min-h-screen -m-6 lg:-m-7 p-6 lg:p-8" style={{ background: 'linear-gradient(135deg, #f0f4ff 0%, #f8faff 40%, #eef3ff 100%)' }}>
        <div className="max-w-[1400px] mx-auto space-y-6">

          {/* ── Header ── */}
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-2xl font-black text-slate-800 tracking-tight">Client Service Updates</h1>
              <p className="text-sm text-slate-400 mt-0.5">Manage projects, track stages, and send automated client updates</p>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={refresh} className="p-2.5 rounded-xl border border-white/60 hover:bg-white/80 transition-all" style={{ background: 'rgba(255,255,255,0.72)' }}>
                <RefreshCw className="w-4 h-4 text-slate-500" />
              </button>
              <button onClick={() => { setEditingProject(null); setShowProjectModal(true); }}
                className="flex items-center gap-2 px-4 py-2.5 text-sm font-bold text-white rounded-xl transition-all hover:scale-105"
                style={{ background: 'linear-gradient(135deg,#B87333,#d4944a)', boxShadow: '0 4px 15px rgba(184,115,51,0.3)' }}>
                <Plus className="w-4 h-4" /> New Project
              </button>
            </div>
          </div>

          {/* ── Tabs ── */}
          <div className="flex items-center gap-1 p-1 rounded-2xl border border-white/60 w-fit" style={{ background: 'rgba(255,255,255,0.72)' }}>
            {[{ key: 'projects', label: 'Projects', icon: List }, { key: 'settings', label: 'Workflow Settings', icon: Settings }].map(t => {
              const Icon = t.icon;
              return (
                <button key={t.key} onClick={() => setTab(t.key)}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all"
                  style={tab === t.key ? { background: 'linear-gradient(135deg,#B87333,#d4944a)', color: 'white', boxShadow: '0 2px 10px rgba(184,115,51,0.3)' } : { color: '#64748b' }}>
                  <Icon className="w-4 h-4" />{t.label}
                </button>
              );
            })}
          </div>

          {tab === 'settings' ? (
            <WorkflowSettings />
          ) : (
            <>
              {/* ── Stat Cards ── */}
              <StatCards projects={projects} emailLogs={emailLogs} />

              {/* ── Filters ── */}
              <Glass className="p-4">
                <div className="flex flex-wrap items-center gap-3">
                  <div className="relative flex-1 min-w-[200px]">
                    <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400 pointer-events-none" />
                    <input value={search} onChange={e => setSearch(e.target.value)}
                      placeholder="Search by client, email, or project..."
                      className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 bg-white/80 transition-all" />
                  </div>
                  <div className="relative">
                    <select value={filterService} onChange={e => setFilterService(e.target.value)}
                      className="appearance-none border border-slate-200 rounded-xl px-4 py-2.5 pr-8 text-sm focus:outline-none focus:border-blue-400 bg-white/80 font-medium text-slate-600 transition-all">
                      <option value="all">All Services</option>
                      {SERVICE_TYPES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                    <ChevronDown className="absolute right-2.5 top-3 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                  </div>
                  <div className="relative">
                    <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
                      className="appearance-none border border-slate-200 rounded-xl px-4 py-2.5 pr-8 text-sm focus:outline-none focus:border-blue-400 bg-white/80 font-medium text-slate-600 transition-all">
                      <option value="all">All Statuses</option>
                      <option value="active">Active</option>
                      <option value="on_hold">On Hold</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                    <ChevronDown className="absolute right-2.5 top-3 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                  </div>
                  <span className="text-xs text-slate-400 ml-auto">{filtered.length} project{filtered.length !== 1 ? 's' : ''}</span>
                </div>
              </Glass>

              {/* ── Project Table ── */}
              <Glass className="overflow-hidden">
                {loadingProjects ? (
                  <div className="space-y-3 p-5">
                    {[...Array(5)].map((_, i) => <div key={i} className="h-14 bg-slate-100/60 rounded-xl animate-pulse" />)}
                  </div>
                ) : filtered.length === 0 ? (
                  <div className="py-20 text-center">
                    <div className="text-5xl mb-4">📋</div>
                    <p className="text-sm font-semibold text-slate-500">No projects found</p>
                    <p className="text-xs text-slate-300 mt-1">Create your first project to get started.</p>
                    <button onClick={() => setShowProjectModal(true)}
                      className="mt-4 flex items-center gap-2 px-5 py-2.5 text-sm font-bold text-white rounded-xl mx-auto transition-all"
                      style={{ background: 'linear-gradient(135deg,#B87333,#d4944a)' }}>
                      <Plus className="w-4 h-4" /> New Project
                    </button>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-slate-100" style={{ background: 'rgba(248,250,252,0.8)' }}>
                          <th className="px-4 py-3 text-left text-[10px] font-bold text-slate-400 uppercase tracking-wider">Client</th>
                          <th className="px-4 py-3 text-left text-[10px] font-bold text-slate-400 uppercase tracking-wider hidden md:table-cell">Service</th>
                          <th className="px-4 py-3 text-left text-[10px] font-bold text-slate-400 uppercase tracking-wider">Project</th>
                          <th className="px-4 py-3 text-left text-[10px] font-bold text-slate-400 uppercase tracking-wider hidden lg:table-cell">Current Stage</th>
                          <th className="px-4 py-3 text-left text-[10px] font-bold text-slate-400 uppercase tracking-wider hidden sm:table-cell">Status</th>
                          <th className="px-4 py-3 text-left text-[10px] font-bold text-slate-400 uppercase tracking-wider hidden xl:table-cell">Emails</th>
                          <th className="px-4 py-3 text-left text-[10px] font-bold text-slate-400 uppercase tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                        {filtered.map(p => (
                          <ProjectRow
                            key={p.id}
                            project={p}
                            emailStats={emailStatsByProject[p.id]}
                            onView={proj => setViewProject(proj)}
                            onEdit={proj => { setEditingProject(proj); setShowProjectModal(true); }}
                            onUpdateStage={proj => setStageProject(proj)}
                          />
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </Glass>
            </>
          )}
        </div>
      </div>

      {/* ── Modals ── */}
      {showProjectModal && (
        <ProjectModal
          project={editingProject}
          onClose={() => { setShowProjectModal(false); setEditingProject(null); }}
          onSaved={handleProjectSaved}
        />
      )}

      {stageProject && (
        <StageUpdateModal
          project={stageProject}
          onClose={() => setStageProject(null)}
          onUpdated={handleStageUpdated}
        />
      )}

      {currentViewProject && (
        <ProjectDetail
          project={currentViewProject}
          emailLogs={emailLogs.filter(e => e.project_id === currentViewProject.id)}
          onClose={() => setViewProject(null)}
          onUpdated={handleStageUpdated}
          onOpenStageModal={() => { setStageProject(currentViewProject); }}
        />
      )}
    </AdminLayout>
  );
}