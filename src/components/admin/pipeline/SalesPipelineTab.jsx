import { useState, useMemo, useEffect, useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import { Plus, Settings, ChevronDown, Search, Filter, RefreshCw } from 'lucide-react';
import PipelineStats from './PipelineStats';
import PipelineKanban from './PipelineKanban';
import DealModal from './DealModal';
import PipelineManager from './PipelineManager';
import { WORKFLOWS, SERVICE_TYPES } from '@/components/admin/clientservice/WORKFLOWS';

const DEFAULT_TEMPLATES = [
  {
    id: 'tpl_standard', name: 'Standard Sales Pipeline', is_default: true,
    stages: [
      { key: 'enquiry', label: 'Enquiry', color: '#6366f1', order: 0 },
      { key: 'quote_sent', label: 'Quote Sent', color: '#3b82f6', order: 1 },
      { key: 'follow_up', label: 'Follow Up', color: '#f59e0b', order: 2 },
      { key: 'negotiation', label: 'Negotiation', color: '#f97316', order: 3 },
      { key: 'won', label: 'Won', color: '#10b981', isWon: true, order: 4 },
      { key: 'lost', label: 'Lost', color: '#ef4444', isLost: true, order: 5 },
    ],
  },
  {
    id: 'tpl_book', name: 'Book Publishing Pipeline', is_default: true,
    stages: [
      { key: 'new_author', label: 'New Author', color: '#8b5cf6', order: 0 },
      { key: 'consultation', label: 'Consultation', color: '#6366f1', order: 1 },
      { key: 'quote', label: 'Quote Sent', color: '#3b82f6', order: 2 },
      { key: 'contract', label: 'Contract', color: '#f59e0b', order: 3 },
      { key: 'payment', label: 'Payment Received', color: '#f97316', order: 4 },
      { key: 'won', label: 'Won', color: '#10b981', isWon: true, order: 5 },
      { key: 'lost', label: 'Lost', color: '#ef4444', isLost: true, order: 6 },
    ],
  },
  {
    id: 'tpl_quick', name: 'Quick Close', is_default: true,
    stages: [
      { key: 'lead', label: 'Lead', color: '#6366f1', order: 0 },
      { key: 'demo', label: 'Demo / Meeting', color: '#3b82f6', order: 1 },
      { key: 'proposal', label: 'Proposal', color: '#f59e0b', order: 2 },
      { key: 'won', label: 'Won', color: '#10b981', isWon: true, order: 3 },
      { key: 'lost', label: 'Lost', color: '#ef4444', isLost: true, order: 4 },
    ],
  },
];

function Glass({ children, className = '' }) {
  return (
    <div className={`rounded-2xl border border-white/60 ${className}`}
      style={{ background: 'rgba(255,255,255,0.72)', backdropFilter: 'blur(20px)', boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>
      {children}
    </div>
  );
}

// Prompt for service type if missing before creating a project
function ServiceTypePrompt({ deal, onConfirm, onCancel }) {
  const [serviceType, setServiceType] = useState(deal.service_type || '');
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      <div className="relative bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm border border-white/60">
        <h3 className="text-base font-bold text-slate-800 mb-2">Select Service Type</h3>
        <p className="text-sm text-slate-500 mb-4">
          This deal has no service type set. Please select one so the correct workflow can be loaded for the new project.
        </p>
        <select value={serviceType} onChange={e => setServiceType(e.target.value)}
          className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-blue-400 mb-4 bg-white">
          <option value="">— Select Service —</option>
          {SERVICE_TYPES.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <div className="flex gap-2">
          <button onClick={onCancel} className="flex-1 py-2.5 text-sm text-slate-500 hover:bg-slate-100 rounded-xl transition-colors">Cancel</button>
          <button onClick={() => serviceType && onConfirm(serviceType)} disabled={!serviceType}
            className="flex-1 py-2.5 text-sm font-bold text-white rounded-xl disabled:opacity-40 transition-all"
            style={{ background: 'linear-gradient(135deg,#B87333,#d4944a)' }}>
            Create Project
          </button>
        </div>
      </div>
    </div>
  );
}

export default function SalesPipelineTab() {
  const qc = useQueryClient();
  const [activePipelineId, setActivePipelineId] = useState(null);
  const [showManager, setShowManager] = useState(false);
  const [dealModal, setDealModal] = useState(null); // {deal, defaultStageKey}
  const [search, setSearch] = useState('');
  const [filterService, setFilterService] = useState('all');
  const [filterAssigned, setFilterAssigned] = useState('');
  const [servicePrompt, setServicePrompt] = useState(null); // deal needing service type

  const { data: pipelines = [] } = useQuery({
    queryKey: ['sales-pipelines'],
    queryFn: () => base44.entities.SalesPipeline.list('-created_date', 50),
    staleTime: 30000,
  });

  const { data: customTemplates = [] } = useQuery({
    queryKey: ['pipeline-templates'],
    queryFn: () => base44.entities.PipelineTemplate.list('-created_date', 50),
    staleTime: 60000,
  });

  const allTemplates = useMemo(() => [...DEFAULT_TEMPLATES, ...customTemplates], [customTemplates]);

  // Auto-select first pipeline
  useEffect(() => {
    if (pipelines.length > 0 && !activePipelineId) {
      setActivePipelineId(pipelines[0].id);
    }
  }, [pipelines, activePipelineId]);

  const activePipeline = useMemo(
    () => pipelines.find(p => p.id === activePipelineId) || null,
    [pipelines, activePipelineId]
  );

  const { data: allDeals = [] } = useQuery({
    queryKey: ['pipeline-deals', activePipelineId],
    queryFn: () => activePipelineId
      ? base44.entities.PipelineDeal.filter({ pipeline_id: activePipelineId }, '-updated_date', 200)
      : [],
    enabled: !!activePipelineId,
    staleTime: 15000,
  });

  const filteredDeals = useMemo(() => allDeals.filter(d => {
    if (filterService !== 'all' && d.service_type !== filterService) return false;
    if (filterAssigned && d.assigned_team_member !== filterAssigned) return false;
    if (search) {
      const q = search.toLowerCase();
      return (d.client_name?.toLowerCase().includes(q) ||
        d.client_email?.toLowerCase().includes(q) ||
        d.project_title?.toLowerCase().includes(q));
    }
    return true;
  }), [allDeals, filterService, filterAssigned, search]);

  const refreshDeals = () => qc.invalidateQueries({ queryKey: ['pipeline-deals', activePipelineId] });
  const refreshPipelines = () => qc.invalidateQueries({ queryKey: ['sales-pipelines'] });
  const refreshTemplates = () => qc.invalidateQueries({ queryKey: ['pipeline-templates'] });

  // ── Auto-create project when deal moves to Won ──────────────────────────────
  const createProjectFromDeal = useCallback(async (deal, serviceType) => {
    // Prevent duplicate creation
    if (deal.linked_project_id) return;

    const workflows = WORKFLOWS;
    const workflow = workflows[serviceType];
    if (!workflow || workflow.length === 0) {
      toast.error('No workflow found for: ' + serviceType);
      return;
    }
    const firstStage = workflow[0];

    try {
      const user = await base44.auth.me();
      const project = await base44.entities.ClientServiceProject.create({
        client_name: deal.client_name,
        client_email: deal.client_email || '',
        client_phone: deal.client_phone || '',
        service_type: serviceType,
        project_title: deal.project_title || deal.client_name,
        status: 'active',
        current_stage_key: firstStage.key,
        current_stage_label: firstStage.label,
        welcome_email_sent: false,
        total_emails_sent: 0,
        stage_history: [{
          stage_key: firstStage.key,
          stage_label: firstStage.label,
          updated_at: new Date().toISOString(),
          updated_by: user?.email || 'Pipeline (Auto)',
          email_sent: false,
        }],
      });

      await base44.entities.PipelineDeal.update(deal.id, {
        linked_project_id: project.id,
        project_created_at: new Date().toISOString(),
        project_created_by: user?.email || 'auto',
        project_creation_failed: false,
        project_creation_error: '',
        service_type: serviceType,
      });

      qc.invalidateQueries({ queryKey: ['client-service-projects'] });
      refreshDeals();
      toast.success(`✅ Project created for ${deal.client_name}. Send the intro email manually from Client Service Updates.`);
    } catch (err) {
      await base44.entities.PipelineDeal.update(deal.id, {
        project_creation_failed: true,
        project_creation_error: err.message,
      });
      refreshDeals();
      toast.error('Project creation failed: ' + err.message);
    }
  }, [qc]);

  const handleDragEnd = useCallback(async (result) => {
    const { source, destination, draggableId } = result;
    if (!destination || source.droppableId === destination.droppableId) return;

    const deal = allDeals.find(d => d.id === draggableId);
    if (!deal) return;

    const newStageKey = destination.droppableId;
    const wonStage = activePipeline?.stages?.find(s => s.isWon);
    const lostStage = activePipeline?.stages?.find(s => s.isLost);

    const updateData = { stage_key: newStageKey };
    if (wonStage && newStageKey === wonStage.key) updateData.won_at = new Date().toISOString();
    if (lostStage && newStageKey === lostStage.key) updateData.lost_at = new Date().toISOString();

    // Optimistic update in cache
    qc.setQueryData(['pipeline-deals', activePipelineId], prev =>
      (prev || []).map(d => d.id === draggableId ? { ...d, stage_key: newStageKey } : d)
    );

    await base44.entities.PipelineDeal.update(draggableId, updateData);

    // Auto-create project on Won
    if (wonStage && newStageKey === wonStage.key && !deal.linked_project_id) {
      const updatedDeal = { ...deal, stage_key: newStageKey };
      if (!updatedDeal.service_type) {
        setServicePrompt(updatedDeal);
      } else {
        await createProjectFromDeal(updatedDeal, updatedDeal.service_type);
      }
    }
  }, [allDeals, activePipeline, activePipelineId, qc, createProjectFromDeal]);

  const handleRetryProject = useCallback(async (deal) => {
    if (!deal.service_type) {
      setServicePrompt(deal);
    } else {
      await createProjectFromDeal(deal, deal.service_type);
    }
  }, [createProjectFromDeal]);

  const stages = useMemo(
    () => [...(activePipeline?.stages || [])].sort((a, b) => a.order - b.order),
    [activePipeline]
  );

  const assignedMembers = useMemo(() => {
    const set = new Set(allDeals.filter(d => d.assigned_team_member).map(d => d.assigned_team_member));
    return Array.from(set);
  }, [allDeals]);

  if (pipelines.length === 0) {
    return (
      <div className="space-y-6">
        {showManager && (
          <PipelineManager pipelines={pipelines} templates={allTemplates}
            onClose={() => setShowManager(false)}
            onPipelinesChanged={refreshPipelines}
            onTemplatesChanged={refreshTemplates}
          />
        )}
        <div className="text-center py-24">
          <div className="text-6xl mb-4">🚀</div>
          <h3 className="text-lg font-bold text-slate-700 mb-2">No pipelines yet</h3>
          <p className="text-sm text-slate-400 mb-6">Create your first sales pipeline to start tracking deals.</p>
          <button onClick={() => setShowManager(true)}
            className="flex items-center gap-2 px-6 py-3 text-sm font-bold text-white rounded-xl mx-auto"
            style={{ background: 'linear-gradient(135deg,#B87333,#d4944a)' }}>
            <Plus className="w-4 h-4" /> Create Pipeline
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Top bar */}
      <div className="flex flex-wrap items-center gap-3 justify-between">
        <div className="flex items-center gap-2 flex-wrap">
          {/* Pipeline selector */}
          <div className="relative">
            <select value={activePipelineId || ''} onChange={e => setActivePipelineId(e.target.value)}
              className="appearance-none border border-slate-200 rounded-xl pl-4 pr-8 py-2.5 text-sm font-semibold focus:outline-none focus:border-blue-400 bg-white/80 text-slate-700 transition-all">
              {pipelines.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
            <ChevronDown className="absolute right-2.5 top-3 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
          </div>
          <button onClick={() => setShowManager(true)}
            className="flex items-center gap-1.5 px-3 py-2.5 text-sm font-semibold text-slate-600 rounded-xl border border-slate-200 hover:bg-white/80 hover:border-slate-300 transition-all"
            style={{ background: 'rgba(255,255,255,0.72)' }}>
            <Settings className="w-4 h-4" /> Manage
          </button>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={refreshDeals} className="p-2.5 rounded-xl border border-white/60 hover:bg-white/80 transition-all"
            style={{ background: 'rgba(255,255,255,0.72)' }}>
            <RefreshCw className="w-4 h-4 text-slate-500" />
          </button>
          <button onClick={() => setDealModal({ deal: null, defaultStageKey: stages[0]?.key })}
            className="flex items-center gap-2 px-4 py-2.5 text-sm font-bold text-white rounded-xl transition-all hover:scale-105"
            style={{ background: 'linear-gradient(135deg,#B87333,#d4944a)', boxShadow: '0 4px 15px rgba(184,115,51,0.3)' }}>
            <Plus className="w-4 h-4" /> New Deal
          </button>
        </div>
      </div>

      {/* Stats */}
      {activePipeline && <PipelineStats deals={allDeals} pipeline={activePipeline} />}

      {/* Filters */}
      <Glass className="p-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[180px]">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400 pointer-events-none" />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search client, email, project..."
              className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-400 bg-white/80 transition-all" />
          </div>
          <div className="relative">
            <select value={filterService} onChange={e => setFilterService(e.target.value)}
              className="appearance-none border border-slate-200 rounded-xl px-4 py-2.5 pr-8 text-sm focus:outline-none focus:border-blue-400 bg-white/80 font-medium text-slate-600">
              <option value="all">All Services</option>
              {SERVICE_TYPES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <ChevronDown className="absolute right-2.5 top-3 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
          </div>
          {assignedMembers.length > 0 && (
            <div className="relative">
              <select value={filterAssigned} onChange={e => setFilterAssigned(e.target.value)}
                className="appearance-none border border-slate-200 rounded-xl px-4 py-2.5 pr-8 text-sm focus:outline-none focus:border-blue-400 bg-white/80 font-medium text-slate-600">
                <option value="">All Members</option>
                {assignedMembers.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
              <ChevronDown className="absolute right-2.5 top-3 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
            </div>
          )}
          <span className="text-xs text-slate-400 ml-auto">{filteredDeals.length} deal{filteredDeals.length !== 1 ? 's' : ''}</span>
        </div>
      </Glass>

      {/* Kanban board */}
      {activePipeline && stages.length > 0 && (
        <PipelineKanban
          pipeline={activePipeline}
          deals={filteredDeals}
          onDragEnd={handleDragEnd}
          onDealClick={deal => setDealModal({ deal, defaultStageKey: deal.stage_key })}
          onAddDeal={stageKey => setDealModal({ deal: null, defaultStageKey: stageKey })}
        />
      )}

      {/* Modals */}
      {showManager && (
        <PipelineManager
          pipelines={pipelines}
          templates={allTemplates}
          onClose={() => setShowManager(false)}
          onPipelinesChanged={refreshPipelines}
          onTemplatesChanged={refreshTemplates}
        />
      )}

      {dealModal && activePipeline && (
        <DealModal
          deal={dealModal.deal ? { ...dealModal.deal, stage_key: dealModal.deal.stage_key || dealModal.defaultStageKey } : { stage_key: dealModal.defaultStageKey }}
          pipeline={activePipeline}
          stages={stages}
          onClose={() => setDealModal(null)}
          onSaved={() => refreshDeals()}
          onRetryProject={handleRetryProject}
        />
      )}

      {servicePrompt && (
        <ServiceTypePrompt
          deal={servicePrompt}
          onConfirm={async (serviceType) => {
            const deal = servicePrompt;
            setServicePrompt(null);
            await createProjectFromDeal(deal, serviceType);
          }}
          onCancel={() => setServicePrompt(null)}
        />
      )}
    </div>
  );
}