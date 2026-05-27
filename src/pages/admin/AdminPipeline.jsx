import React, { useState, useEffect, useCallback } from 'react';
import { base44 } from '@/api/base44Client';
import AdminLayout from '@/components/admin/AdminLayout';
import PipelineStats from '@/components/pipeline/PipelineStats';
import PipelineFilters from '@/components/pipeline/PipelineFilters';
import KanbanBoard from '@/components/pipeline/KanbanBoard';
import PipelineListView from '@/components/pipeline/PipelineListView';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { Settings, ChevronDown } from 'lucide-react';

export default function AdminPipeline() {
  const [contacts, setContacts] = useState([]);
  const [history, setHistory] = useState([]);
  const [pipelines, setPipelines] = useState([]);
  const [selectedPipeline, setSelectedPipeline] = useState(null);
  const [showPipelineMenu, setShowPipelineMenu] = useState(false);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [view, setView] = useState('kanban');
  const [search, setSearch] = useState('');
  const [ownerFilter, setOwnerFilter] = useState('');

  const load = useCallback(async () => {
    const [me, allContacts, allHistory, allPipelines] = await Promise.all([
      base44.auth.me(),
      base44.entities.Contact.list('-updated_date', 500),
      base44.entities.PipelineStageHistory.list('-changed_at', 1000),
      base44.entities.Pipeline.list('-created_date', 50),
    ]);
    setUser(me);
    setContacts(allContacts);
    setHistory(allHistory);
    setPipelines(allPipelines);
    if (allPipelines.length > 0 && !selectedPipeline) {
      setSelectedPipeline(allPipelines[0]);
    }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleStageChange = async (contactId, newStage, lostReason) => {
    const contact = contacts.find(c => c.id === contactId);
    if (!contact) return;
    const prevStage = contact.pipeline_stage || 'Lead Contacted';
    const now = new Date().toISOString();

    // Optimistically update UI
    setContacts(prev => prev.map(c => c.id === contactId
      ? { ...c, pipeline_stage: newStage, pipeline_stage_changed_at: now, lost_reason: lostReason ?? c.lost_reason }
      : c
    ));

    try {
      const updateData = { pipeline_stage: newStage, pipeline_stage_changed_at: now };
      if (lostReason !== null) updateData.lost_reason = lostReason;
      await base44.entities.Contact.update(contactId, updateData);

      // Log history
      const historyEntry = await base44.entities.PipelineStageHistory.create({
        contact_id: contactId,
        from_stage: prevStage,
        to_stage: newStage,
        changed_at: now,
        changed_by: user?.email || 'admin',
        notes: lostReason || '',
      });
      setHistory(prev => [historyEntry, ...prev]);
      toast.success(`Moved to ${newStage}`);
    } catch (err) {
      // Revert on failure
      setContacts(prev => prev.map(c => c.id === contactId ? contact : c));
      toast.error('Failed to update stage');
    }
  };

  const owners = [...new Set(contacts.map(c => c.pipeline_owner).filter(Boolean))];

  const filtered = contacts.filter(c => {
    if (ownerFilter && c.pipeline_owner !== ownerFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      return c.full_name?.toLowerCase().includes(q) || c.book_title?.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <AdminLayout>
      <div className="max-w-full">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-[#1A1208]">Pipeline</h1>
            <p className="text-sm text-black/50 mt-1">Track every project from first enquiry through to delivery</p>
          </div>
          <div className="flex items-center gap-2">
            {/* Pipeline Selector */}
            {pipelines.length > 0 && (
              <div className="relative">
                <button
                  onClick={() => setShowPipelineMenu(v => !v)}
                  className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:border-[#B87333]/40 transition-colors"
                >
                  <span>{selectedPipeline?.name || 'Default Pipeline'}</span>
                  <ChevronDown className="w-4 h-4 text-gray-400" />
                </button>
                {showPipelineMenu && (
                  <div className="absolute right-0 top-11 z-20 bg-white border border-gray-200 rounded-xl shadow-lg p-2 min-w-52 space-y-0.5">
                    <button
                      onClick={() => { setSelectedPipeline(null); setShowPipelineMenu(false); }}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm hover:bg-gray-50 ${!selectedPipeline ? 'font-semibold text-[#B87333]' : 'text-gray-700'}`}
                    >
                      Default Stages
                    </button>
                    {pipelines.map(p => (
                      <button
                        key={p.id}
                        onClick={() => { setSelectedPipeline(p); setShowPipelineMenu(false); }}
                        className={`w-full text-left px-3 py-2 rounded-lg text-sm hover:bg-gray-50 ${selectedPipeline?.id === p.id ? 'font-semibold text-[#B87333]' : 'text-gray-700'}`}
                      >
                        {p.name}
                        <span className="text-xs text-gray-400 ml-1">({p.stages?.length || 0} stages)</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
            <Link to="/admin/pipeline-builder">
              <button className="flex items-center gap-2 px-4 py-2 bg-[#B87333] text-white rounded-xl text-sm font-medium hover:bg-[#A06828] transition-colors">
                <Settings className="w-4 h-4" /> Build Pipeline
              </button>
            </Link>
          </div>
        </div>

        {loading ? (
          <div className="space-y-4">
            <div className="grid grid-cols-4 gap-4">{[...Array(4)].map((_, i) => <div key={i} className="h-20 bg-black/5 rounded-2xl animate-pulse" />)}</div>
            <div className="h-12 bg-black/5 rounded-xl animate-pulse" />
            <div className="flex gap-3">{[...Array(7)].map((_, i) => <div key={i} className="w-60 h-64 bg-black/5 rounded-2xl animate-pulse flex-shrink-0" />)}</div>
          </div>
        ) : (
          <>
            <PipelineStats contacts={contacts} history={history} />
            <PipelineFilters
              search={search}
              onSearch={setSearch}
              ownerFilter={ownerFilter}
              onOwnerFilter={setOwnerFilter}
              owners={owners}
              view={view}
              onView={setView}
            />
            {view === 'kanban' ? (
              <KanbanBoard contacts={filtered} onStageChange={handleStageChange} customPipeline={selectedPipeline} />
            ) : (
              <PipelineListView contacts={filtered} onStageChange={handleStageChange} />
            )}
          </>
        )}
      </div>
    </AdminLayout>
  );
}