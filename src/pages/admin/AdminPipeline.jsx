import { useSearchParams } from 'react-router-dom';
import PublishingPipelineBoard from '@/components/admin/pipeline/PublishingPipelineBoard';
import React, { useState, useCallback, useEffect } from 'react';
import { platform } from '@/api/platformClient';
import AdminLayout from '@/components/admin/AdminLayout';
import { toast } from 'sonner';
import { Sparkles, AlertTriangle, Settings2, Plus, Search, X, Edit2, ArrowRight, CheckCircle, Mail, Phone, ExternalLink, BookOpen, Calendar, TrendingUp, User, MessageSquare, History, MoveRight, Loader2, Upload, Settings, Grid, List, Columns, Minimize2, Maximize2, DollarSign, Eye, EyeOff, Layers } from 'lucide-react';
import NewDealModal from '@/components/pipeline/NewDealModal';
import WorkflowPanel from '@/components/admin/workflow/WorkflowPanel';
import PipelineSettingsModal from '@/components/admin/pipeline/PipelineSettingsModal';
import PipelineBuilderModal from '@/components/admin/pipeline/PipelineBuilderModal';

// ── Stage config ──────────────────────────────────────────────────────────────
const STAGES = [
  { id: 'New Enquiry', label: 'New Enquiry', color: '#6366f1', prob: 0.10, active: true },
  { id: 'Reviewed by Admin', label: 'Reviewed', color: '#8b5cf6', prob: 0.20, active: true },
  { id: 'Quote Required', label: 'Quote Required', color: '#a855f7', prob: 0.30, active: true },
  { id: 'Quote Sent', label: 'Quote Sent', color: '#0ea5e9', prob: 0.50, active: true },
  { id: 'Quote Viewed', label: 'Quote Viewed', color: '#06b6d4', prob: 0.60, active: true },
  { id: 'Quote Accepted', label: 'Quote Accepted', color: '#10b981', prob: 0.75, active: true },
  { id: 'NDA Required', label: 'NDA Required', color: '#f59e0b', prob: 0.80, active: true },
  { id: 'NDA Sent', label: 'NDA Sent', color: '#f97316', prob: 0.85, active: true },
  { id: 'NDA Signed', label: 'NDA Signed', color: '#16a34a', prob: 0.90, active: true },
  { id: 'Invoice Required', label: 'Invoice Required', color: '#eab308', prob: 0.92, active: true },
  { id: 'Invoice Sent', label: 'Invoice Sent', color: '#84cc16', prob: 0.95, active: true },
  { id: 'Payment Pending', label: 'Payment Pending', color: '#d97706', prob: 0.98, active: true },
  { id: 'Payment Received', label: 'Payment Received', color: '#16a34a', prob: 1,    active: false },
  { id: 'Project Active', label: 'Project Active', color: '#2563eb', prob: 1,    active: false },
  { id: 'Completed', label: 'Completed', color: '#4b5563', prob: 1,    active: false },
  { id: 'Archived', label: 'Archived', color: '#6b7280', prob: 0,    active: false },
  { id: 'Lost',      label: 'Lost',      color: '#e11d48', prob: 0,    active: false },
  { id: 'Ghosted',   label: 'Ghosted',   color: '#64748b', prob: 0,    active: false },
];

function mapStage(contact) {
  return contact.pipeline_stage || 'New Enquiry';
}

const PRIORITY_MAP = {
  High:   { label: 'High',   color: '#e11d48', rank: 3 },
  Medium: { label: 'Medium', color: '#f59e0b', rank: 2 },
  Low:    { label: 'Low',    color: '#94a3b8', rank: 1 },
};
function getPriority(contact) {
  if (contact.deal_priority && PRIORITY_MAP[contact.deal_priority]) return PRIORITY_MAP[contact.deal_priority];
  const v = contact.pipeline_value || 0;
  if (v >= 50000) return { label: 'High',   color: '#e11d48', rank: 3 };
  if (v >= 10000) return { label: 'Medium', color: '#f59e0b', rank: 2 };
  return                 { label: 'Low',    color: '#94a3b8', rank: 1 };
}

function getDaysInStage(contact) {
  const d = contact.pipeline_stage_changed_at || contact.updated_date || contact.created_date;
  if (!d) return 0;
  return Math.floor((Date.now() - new Date(d)) / 86400000);
}

function fmtRand(v) {
  if (!v) return 'R0';
  if (v >= 1000000) return `R${(v / 1000000).toFixed(1)}M`;
  if (v >= 1000) return `R${Math.round(v / 1000)}K`;
  return `R${v.toLocaleString('en-ZA')}`;
}
function fmtRandFull(v) {
  if (!v) return 'R0';
  return 'R' + Math.round(v).toLocaleString('en-ZA');
}
function initials(name) {
  if (!name) return '?';
  return name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase();
}
const AVATAR_COLORS = ['#6366f1','#0ea5e9','#f59e0b','#16a34a','#e11d48','#8b5cf6','#ec4899'];
function avatarColor(name) {
  let h = 0;
  for (let i = 0; i < (name || '').length; i++) h = (h * 31 + name.charCodeAt(i)) & 0xffffffff;
  return AVATAR_COLORS[Math.abs(h) % AVATAR_COLORS.length];
}

function toContactStage(newStage, lostReason) {
    if (newStage === 'Lost')      return { pipeline_stage: 'Lost', lost_reason: lostReason || 'Did not proceed' };
    if (newStage === 'Ghosted')   return { pipeline_stage: 'Lost', lost_reason: 'Ghosted' };
    return { pipeline_stage: newStage, lost_reason: '' };
}

function DealCard({ contact, isTop, onMove, onSelect }) {
  const stage = mapStage(contact);
  const days = getDaysInStage(contact);
  const stalled = days > 7;
  const pri = getPriority(contact);
  const [menuOpen, setMenuOpen] = useState(false);
  const prob = contact.probability != null
    ? contact.probability
    : Math.round((STAGES.find(s => s.id === stage)?.prob ?? 0.2) * 100);
  
  // Check if workflow exists for this contact
  const hasWorkflow = contact.pipeline_stage && contact.pipeline_stage !== 'New Enquiry';

  const submissionTime = contact.created_date 
    ? new Date(contact.created_date).toLocaleString('en-ZA', { 
        month: 'short', 
        day: 'numeric', 
        hour: '2-digit', 
        minute: '2-digit' 
      })
    : null;

  return (
    <div
      className="deal-card"
      onClick={() => onSelect(contact)}
      style={{
        background: '#ffffff',
        borderRadius: 12,
        border: '1px solid #e5e7eb',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
        overflow: 'hidden',
        position: 'relative',
        marginBottom: 8,
        cursor: 'pointer',
        transition: 'all 0.2s ease',
      }}
    >
      <div style={{ padding: '10px 10px 10px 12px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 6 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flex: 1, minWidth: 0 }}>
            <div style={{ width: 24, height: 24, borderRadius: '50%', background: avatarColor(contact.full_name), display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, fontWeight: 700, color: '#fff', flexShrink: 0 }}>
              {initials(contact.full_name)}
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontWeight: 600, fontSize: 12, color: '#1f2937', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{contact.full_name}</div>
              {contact.book_title && (
                <div style={{ fontSize: 10, color: '#6b7280', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>📖 {contact.book_title}</div>
              )}
            </div>
          </div>
          <div style={{ position: 'relative', flexShrink: 0, marginLeft: 4 }}>
            <button onClick={e => { e.stopPropagation(); setMenuOpen(o => !o); }}
              style={{ padding: '2px 4px', fontSize: 14, color: '#94a3b8', background: 'none', border: 'none', cursor: 'pointer', lineHeight: 1 }}>···</button>
            {menuOpen && (
              <div style={{ position: 'absolute', right: 0, top: 20, background: '#fff', border: '1px solid #e7e8f0', borderRadius: 8, boxShadow: '0 4px 16px rgba(0,0,0,0.12)', zIndex: 50, minWidth: 130, padding: 4, maxHeight: '200px', overflowY: 'auto' }}>
                {STAGES.filter(s => s.id !== stage).map(s => (
                  <button key={s.id}
                    onClick={e => { e.stopPropagation(); setMenuOpen(false); onMove(contact.id, s.id); }}
                    style={{ display: 'block', width: '100%', textAlign: 'left', padding: '5px 8px', fontSize: 11, color: '#374151', background: 'none', border: 'none', cursor: 'pointer', borderRadius: 4 }}
                    onMouseEnter={e => e.currentTarget.style.background = '#f5f6fa'}
                    onMouseLeave={e => e.currentTarget.style.background = 'none'}
                  >
                    <span style={{ display: 'inline-block', width: 6, height: 6, borderRadius: '50%', background: s.color, marginRight: 4 }} />
                    {s.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div style={{ fontFamily: 'monospace', fontWeight: 800, fontSize: 18, color: '#1f2937', marginBottom: 6, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
           {fmtRandFull(contact.pipeline_value)}
         </div>

        <div style={{ marginBottom: 6 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
            <span style={{ fontSize: 9, color: '#9ca3af' }}>Win probability</span>
            <span style={{ fontSize: 9, fontWeight: 700, color: prob >= 60 ? '#34d399' : prob >= 30 ? '#fbbf24' : '#f87171' }}>{prob}%</span>
          </div>
          <div style={{ height: 4, background: '#e5e7eb', borderRadius: 4, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${prob}%`, background: `linear-gradient(90deg, ${prob >= 60 ? '#10b981' : prob >= 30 ? '#f59e0b' : '#ef4444'}, ${prob >= 60 ? '#34d399' : prob >= 30 ? '#fbbf24' : '#f87171'})`, borderRadius: 4, transition: 'width 0.3s' }} />
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexWrap: 'wrap', marginBottom: 6 }}>
          {contact.package_type && (
            <span style={{ 
              background: '#ede9fe', 
              color: '#5b21b6', 
              fontSize: 8, 
              fontWeight: 700, 
              padding: '2px 6px', 
              borderRadius: 12,
              border: '1px solid #c4b5fd',
              whiteSpace: 'nowrap',
            }}>{contact.package_type}</span>
          )}
          <span style={{ display: 'flex', alignItems: 'center', gap: 2, fontSize: 9, color: pri.color, fontWeight: 600 }}>
            <span style={{ width: 5, height: 5, borderRadius: '50%', background: pri.color, display: 'inline-block' }} />
            {pri.label}
          </span>
          {stalled ? (
            <span style={{ 
              background: 'rgba(245, 158, 11, 0.15)', 
              color: '#fbbf24', 
              fontSize: 8, 
              fontWeight: 700, 
              padding: '2px 6px', 
              borderRadius: 12, 
              display: 'flex', 
              alignItems: 'center', 
              gap: 2,
              border: '1px solid rgba(245, 158, 11, 0.3)',
              whiteSpace: 'nowrap',
            }}>
              <AlertTriangle style={{ width: 7, height: 7 }} /> {days}d
            </span>
          ) : (
            <span style={{ fontSize: 9, color: '#9ca3af', whiteSpace: 'nowrap' }}>{days}d</span>
          )}
        </div>

        {submissionTime && (
          <div style={{ fontSize: 8, color: '#9ca3af', display: 'flex', alignItems: 'center', gap: 3, marginBottom: 4 }}>
            <Calendar style={{ width: 8, height: 8 }} />
            <span style={{ whiteSpace: 'nowrap' }}>{submissionTime.split(',')[0]}</span>
          </div>
        )}

        {hasWorkflow && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 2, fontSize: 8, color: '#10b981', fontWeight: 600, marginTop: 4 }}>
            <CheckCircle style={{ width: 8, height: 8 }} />
            Workflow Active
          </div>
        )}
        
        {contact._linked_pipeline_deal_id && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 2, fontSize: 8, color: '#6366f1', fontWeight: 600, marginTop: 4 }}>
            <TrendingUp style={{ width: 8, height: 8 }} />
            Linked to Sales Pipeline
          </div>
        )}
      </div>
    </div>
  );
}

function LegacyPipeline({ switcher }) {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [ownerFilter, setOwnerFilter] = useState('');
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [accentColor, setAccentColor] = useState('#4f46e5');
  const [selectedContact, setSelectedContact] = useState(null);
  const [showWorkflow, setShowWorkflow] = useState(false);
  const [layoutMode, setLayoutMode] = useState('kanban'); // 'kanban', 'list', 'compact'
  const [columnWidth, setColumnWidth] = useState(280);
  const [showStageTotals, setShowStageTotals] = useState(true);
  const [cardDensity, setCardDensity] = useState('comfortable'); // 'compact', 'comfortable'
  const [showPipelineBuilder, setShowPipelineBuilder] = useState(false);
  const [showContactPicker, setShowContactPicker] = useState(false);
  const [contactPickerSearch, setContactPickerSearch] = useState('');
  const [customPipelines, setCustomPipelines] = useState([]);
  const [viewingPipeline, setViewingPipeline] = useState(null);

  const loadCustomPipelines = useCallback(async () => {
    try {
      const res = await platform.functions.invoke('manageCustomPipeline', { action: 'list_pipelines' });
      setCustomPipelines(res.data?.pipelines || []);
    } catch (e) { /* silent */ }
  }, []);

  const load = useCallback(async () => {
    const all = await platform.entities.Contact.list('-updated_date', 500);
    setContacts(all);
    setLoading(false);
  }, []);

  useEffect(() => { load(); loadCustomPipelines(); }, [load, loadCustomPipelines]);

  const handleMove = async (contactId, newStage) => {
    const contact = contacts.find(c => c.id === contactId);
    if (!contact) return;

    const updates = toContactStage(newStage);
    await platform.entities.Contact.update(contactId, { ...updates, pipeline_stage_changed_at: new Date().toISOString() });

    setContacts(prev => prev.map(c => c.id === contactId ? { ...c, ...updates, _pipelineStageOverride: newStage } : c));
    toast.success(`Moved to ${newStage}`);
  };

  const handleUpdate = (contactId, updates) => {
    setContacts(prev => prev.map(c => c.id === contactId ? { ...c, ...updates } : c));
    setSelectedContact(prev => prev ? { ...prev, ...updates } : prev);
  };

  function getEffectiveStage(c) {
    return c._pipelineStageOverride || mapStage(c);
  }

  const owners = [...new Set(contacts.map(c => c.pipeline_owner).filter(Boolean))];

  const filtered = contacts.filter(c => {
    if (ownerFilter && c.pipeline_owner !== ownerFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      return c.full_name?.toLowerCase().includes(q) || c.book_title?.toLowerCase().includes(q);
    }
    return true;
  });

  const byStage = {};
  STAGES.forEach(s => { byStage[s.id] = []; });
  filtered.forEach(c => { 
    const st = getEffectiveStage(c);
    if (!byStage[st]) {
        // Find a stage that includes this as a substring
        const parentStage = STAGES.find(s => s.id.includes(st));
        if (parentStage) {
            byStage[parentStage.id].push(c);
        } else {
            if (!byStage['New Enquiry']) byStage['New Enquiry'] = [];
            byStage['New Enquiry'].push(c);
        }
    } else {
        byStage[st].push(c);
    }
  });

  STAGES.filter(s => s.active).forEach(s => {
    if (byStage[s.id]) {
        byStage[s.id].sort((a, b) => {
          const pa = getPriority(a).rank, pb = getPriority(b).rank;
          if (pb !== pa) return pb - pa;
          return (b.pipeline_value || 0) - (a.pipeline_value || 0);
        });
    }
  });

  const openContacts = STAGES.filter(s => s.active).flatMap(s => byStage[s.id] || []);
  const openPipeline = openContacts.reduce((s, c) => s + (c.pipeline_value || 0), 0);
  const weightedForecast = openContacts.reduce((s, c) => s + (c.pipeline_value || 0) * (STAGES.find(st => st.id === getEffectiveStage(c))?.prob ?? 0), 0);
  const wonCount = (byStage['Payment Received']?.length || 0) + (byStage['Project Active']?.length || 0) + (byStage['Completed']?.length || 0);
  const lostCount = (byStage['Lost']?.length || 0) + (byStage['Ghosted']?.length || 0);
  const winRate = (wonCount + lostCount) > 0 ? Math.round((wonCount / (wonCount + lostCount)) * 100) : 0;

  return (
    <AdminLayout>
      <div style={{ minHeight: '100%', margin: '-24px -24px -24px', padding: '0 0 32px', background: 'linear-gradient(135deg, #F4F5F7 0%, #FFFFFF 100%)', position: 'relative' }}>
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div className="px-5 pt-4">{switcher}</div>
          {/* Header */}
          <div style={{ background: '#ffffff', borderBottom: '1px solid #e5e7eb', padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
            <div>
              <h1 style={{ fontSize: 20, fontWeight: 700, color: '#1e1e2e', margin: 0, fontFamily: 'var(--font-heading)' }}>Deals Pipeline</h1>
              <p style={{ fontSize: 12, color: '#6b7280', margin: '4px 0 0' }}>
                {new Date().toLocaleDateString('en-ZA', { month: 'short', year: 'numeric' })} · {filtered.length} deals · 
                <span style={{ color: '#10b981', fontWeight: 600 }}> Auto-syncing to Sales Pipeline</span>
              </p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              <button onClick={() => setSettingsOpen(true)}
                style={{ height: 32, padding: '0 12px', background: '#f3f4f6', color: '#374151', border: '1px solid #d1d5db', borderRadius: 6, fontSize: 11, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
                <Settings style={{ width: 12, height: 12 }} /> Layout
              </button>
              <button onClick={() => setShowPipelineBuilder(true)}
                style={{ height: 32, padding: '0 12px', background: '#8b5cf6', color: '#fff', border: 'none', borderRadius: 6, fontSize: 11, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
                <Settings2 style={{ width: 12, height: 12 }} /> Custom Pipeline
              </button>
               <button onClick={() => { setContactPickerSearch(''); setShowContactPicker(true); }}
                style={{ height: 32, padding: '0 12px', background: accentColor, color: '#fff', border: 'none', borderRadius: 6, fontSize: 11, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, whiteSpace: 'nowrap' }}>
                <Sparkles style={{ width: 12, height: 12 }} /> New Workflow
              </button>
            </div>
          </div>

          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: 80 }}>
              <div style={{ width: 32, height: 32, border: '4px solid rgba(255,255,255,0.1)', borderTop: `4px solid ${accentColor}`, borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
            </div>
          ) : (
            <div style={{ padding: '16px 20px 0' }}>
              <div style={{ 
                display: 'flex', 
                gap: 12, 
                overflowX: 'auto', 
                paddingBottom: 16, 
                alignItems: 'flex-start',
                scrollSnapType: 'x mandatory',
                WebkitOverflowScrolling: 'touch',
              }}>
                {STAGES.map(stage => {
                  const cards = byStage[stage.id] || [];
                  const colTotal = cards.reduce((s, c) => s + (c.pipeline_value || 0), 0);
                  if (!stage.active && cards.length === 0) return null;

                  return (
                    <div key={stage.id} style={{ 
                      minWidth: columnWidth,
                      maxWidth: columnWidth + 40,
                      flex: `0 0 ${columnWidth}px`,
                      scrollSnapAlign: 'start',
                      display: 'flex', 
                      flexDirection: 'column', 
                      background: stage.active ? 'linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)' : '#ffffff',
                      borderRadius: 10, 
                      border: '1px solid #e5e7eb',
                      boxShadow: stage.active ? '0 2px 8px rgba(0,0,0,0.08)' : '0 1px 4px rgba(0,0,0,0.04)',
                      overflow: 'hidden'
                    }}>
                      <div style={{ 
                        borderBottom: `3px solid ${stage.color}`, 
                        padding: cardDensity === 'compact' ? '8px 10px' : '12px 14px',
                        background: '#f9fafb'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flex: 1, minWidth: 0 }}>
                            <span style={{ width: 8, height: 8, borderRadius: '50%', background: stage.color, display: 'inline-block', flexShrink: 0 }} />
                            <span style={{ fontWeight: 700, fontSize: 11, color: '#1f2937', textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{stage.label}</span>
                            <span style={{ background: stage.color, color: '#ffffff', fontSize: 10, fontWeight: 700, borderRadius: 20, padding: '2px 6px', flexShrink: 0 }}>{cards.length}</span>
                          </div>
                          {colTotal > 0 && showStageTotals && (
                            <span style={{ fontFamily: 'monospace', fontSize: 11, fontWeight: 700, color: '#059669', flexShrink: 0, marginLeft: 4 }}>{fmtRand(colTotal)}</span>
                          )}
                        </div>
                      </div>
                      <div style={{ flex: 1, padding: cardDensity === 'compact' ? '6px 6px 0' : '8px 8px 0', minHeight: '200px', maxHeight: 'calc(100vh - 280px)', overflowY: 'auto' }}>
                         {cards.length === 0 && (
                           <div style={{ border: '2px dashed #e5e7eb', borderRadius: 8, padding: '16px 8px', textAlign: 'center', color: '#9ca3af', fontSize: 11 }}>Empty</div>
                         )}
                        {cards.map((c, i) => (
                            <DealCard 
                              key={c.id} 
                              contact={c} 
                              isTop={i === 0} 
                              onMove={handleMove} 
                              onSelect={(contact) => {
                                setSelectedContact(contact);
                                setShowWorkflow(true);
                              }} 
                            />
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Custom Pipelines Section */}
          {customPipelines.length > 0 && (
            <div style={{ padding: '0 20px 24px' }}>
              <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: 20, marginBottom: 12 }}>
                <h2 style={{ fontSize: 15, fontWeight: 700, color: '#1e1e2e', margin: 0 }}>Custom Pipelines</h2>
                <p style={{ fontSize: 11, color: '#6b7280', margin: '4px 0 0' }}>Click a pipeline to view its stages</p>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
                {customPipelines.map(p => (
                  <div
                    key={p.id}
                    onClick={() => setViewingPipeline(p)}
                    style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10, padding: '14px 18px', cursor: 'pointer', minWidth: 220, boxShadow: '0 1px 4px rgba(0,0,0,0.06)', transition: 'all 0.15s' }}
                    onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)'; e.currentTarget.style.borderColor = '#8b5cf6'; }}
                    onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,0,0,0.06)'; e.currentTarget.style.borderColor = '#e5e7eb'; }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                      <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#8b5cf6' }} />
                      <span style={{ fontWeight: 700, fontSize: 13, color: '#1f2937' }}>{p.name}</span>
                    </div>
                    {p.description && <p style={{ fontSize: 11, color: '#6b7280', margin: '0 0 6px' }}>{p.description}</p>}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                      {(p.stages || []).slice(0, 5).map(s => (
                        <span key={s.id} style={{ fontSize: 9, background: '#f3f4f6', color: '#374151', padding: '2px 6px', borderRadius: 8, fontWeight: 600 }}>{s.name}</span>
                      ))}
                      {(p.stages || []).length > 5 && <span style={{ fontSize: 9, color: '#9ca3af' }}>+{p.stages.length - 5} more</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Custom Pipeline Detail Modal — full-screen Kanban view */}
        {viewingPipeline && (
          <div className="fixed inset-0 z-50 flex flex-col bg-gray-50">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 px-5 py-4 flex items-center justify-between flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-purple-500" />
                <div>
                  <h2 className="text-lg font-bold text-gray-900">{viewingPipeline.name}</h2>
                  {viewingPipeline.description && <p className="text-xs text-gray-500">{viewingPipeline.description}</p>}
                </div>
                <span className="ml-2 text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full font-semibold">{(viewingPipeline.stages || []).length} stages</span>
              </div>
              <button onClick={() => setViewingPipeline(null)} className="p-2 hover:bg-gray-100 rounded-xl">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            {/* Kanban Stages */}
            <div className="flex-1 overflow-x-auto p-5">
              <div className="flex gap-4 h-full" style={{ minHeight: 400 }}>
                {(viewingPipeline.stages || []).map((stage, idx) => {
                  const stageColor = stage.color && stage.color.startsWith('#') ? stage.color : '#8b5cf6';
                  return (
                    <div key={stage.id || idx} style={{ minWidth: 240, flex: '0 0 240px', display: 'flex', flexDirection: 'column', background: '#fff', borderRadius: 10, border: '1px solid #e5e7eb', overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
                      {/* Stage Header */}
                      <div style={{ borderBottom: `3px solid ${stageColor}`, padding: '10px 12px', background: '#f9fafb' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <span style={{ width: 8, height: 8, borderRadius: '50%', background: stageColor, display: 'inline-block', flexShrink: 0 }} />
                          <span style={{ fontWeight: 700, fontSize: 11, color: '#1f2937', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{stage.name}</span>
                        </div>
                        {stage.description && <p style={{ fontSize: 10, color: '#9ca3af', margin: '4px 0 0' }}>{stage.description}</p>}
                      </div>
                      {/* Stage Body */}
                      <div style={{ flex: 1, padding: '10px 8px', minHeight: 120 }}>
                        {stage.suggested_actions?.length > 0 && (
                          <div>
                            <p style={{ fontSize: 9, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>Suggested Actions</p>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                              {stage.suggested_actions.map((a, ai) => (
                                <div key={ai} style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 6, padding: '4px 8px', display: 'flex', alignItems: 'center', gap: 4 }}>
                                  <span style={{ fontSize: 10 }}>
                                    {a.action_type === 'send_email' ? '✉️' : a.action_type === 'send_whatsapp' ? '💬' : a.action_type === 'create_task' ? '✅' : '📋'}
                                  </span>
                                  <span style={{ fontSize: 10, color: '#1d4ed8', fontWeight: 600 }}>{a.action_name}</span>
                                  {a.delay_days > 0 && <span style={{ fontSize: 9, color: '#60a5fa', marginLeft: 'auto' }}>+{a.delay_days}d</span>}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        {(!stage.suggested_actions || stage.suggested_actions.length === 0) && (
                          <div style={{ border: '2px dashed #e5e7eb', borderRadius: 8, padding: '16px 8px', textAlign: 'center', color: '#d1d5db', fontSize: 11 }}>No actions</div>
                        )}
                      </div>
                    </div>
                  );
                })}
                {(viewingPipeline.stages || []).length === 0 && (
                  <div className="flex items-center justify-center w-full text-gray-400 text-sm">No stages defined for this pipeline.</div>
                )}
              </div>
            </div>
          </div>
        )}

        {showWorkflow && selectedContact && (
          <WorkflowPanel contactId={selectedContact.id} onClose={() => { setShowWorkflow(false); setSelectedContact(null); }} />
        )}

        {/* Contact Picker Modal for New Workflow */}
        {showContactPicker && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={() => setShowContactPicker(false)}>
            <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl" onClick={e => e.stopPropagation()}>
              <h3 className="text-lg font-bold text-gray-900 mb-1">New Workflow</h3>
              <p className="text-sm text-gray-500 mb-4">Select a contact to start a workflow for:</p>
              <input
                autoFocus
                type="text"
                placeholder="Search by name or book title..."
                value={contactPickerSearch}
                onChange={e => setContactPickerSearch(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm mb-3 focus:outline-none focus:ring-2 focus:ring-indigo-300"
              />
              <div className="max-h-72 overflow-y-auto space-y-1">
                {contacts
                  .filter(c => {
                    if (!contactPickerSearch) return true;
                    const q = contactPickerSearch.toLowerCase();
                    return c.full_name?.toLowerCase().includes(q) || c.book_title?.toLowerCase().includes(q);
                  })
                  .slice(0, 30)
                  .map(c => (
                    <button
                      key={c.id}
                      onClick={() => {
                        setSelectedContact(c);
                        setShowContactPicker(false);
                        setShowWorkflow(true);
                      }}
                      className="w-full text-left px-3 py-2.5 rounded-lg hover:bg-indigo-50 border border-transparent hover:border-indigo-200 transition-colors"
                    >
                      <div className="font-medium text-gray-900 text-sm">{c.full_name}</div>
                      {c.book_title && <div className="text-xs text-gray-500">📖 {c.book_title}</div>}
                      {c.pipeline_stage && <div className="text-xs text-indigo-500 mt-0.5">{c.pipeline_stage}</div>}
                    </button>
                  ))}
                {contacts.filter(c => {
                  if (!contactPickerSearch) return true;
                  const q = contactPickerSearch.toLowerCase();
                  return c.full_name?.toLowerCase().includes(q) || c.book_title?.toLowerCase().includes(q);
                }).length === 0 && (
                  <p className="text-sm text-gray-400 text-center py-4">No contacts found</p>
                )}
              </div>
              <button onClick={() => setShowContactPicker(false)} className="mt-3 w-full py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                Cancel
              </button>
            </div>
          </div>
        )}
        {settingsOpen && (
          <PipelineSettingsModal 
            layoutMode={layoutMode}
            setLayoutMode={setLayoutMode}
            columnWidth={columnWidth}
            setColumnWidth={setColumnWidth}
            showStageTotals={showStageTotals}
            setShowStageTotals={setShowStageTotals}
            cardDensity={cardDensity}
            setCardDensity={setCardDensity}
            onClose={() => setSettingsOpen(false)}
          />
        )}
        {showPipelineBuilder && (
          <PipelineBuilderModal 
            onClose={() => setShowPipelineBuilder(false)}
            onSaved={() => { loadCustomPipelines(); setShowPipelineBuilder(false); }}
          />
        )}
      </div>
       <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        .deal-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.08) !important;
          border-color: #d1d5db !important;
        }
        
        @media (max-width: 768px) {
          .admin-layout-main {
            padding: 12px !important;
          }
          .deal-card {
            margin-bottom: 6px;
          }
        }
        
        @media (max-width: 480px) {
          .deal-card {
            font-size: 12px;
          }
        }
        
        /* Hide scrollbar but keep functionality */
        div[style*="overflowX: auto"]::-webkit-scrollbar {
          height: 6px;
        }
        div[style*="overflowX: auto"]::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 8px;
        }
        div[style*="overflowX: auto"]::-webkit-scrollbar-thumb {
          background: #c1c1c1;
          border-radius: 8px;
        }
        div[style*="overflowX: auto"]::-webkit-scrollbar-thumb:hover {
          background: #a1a1a1;
        }
      `}</style>
    </AdminLayout>
  );
}

export default function AdminPipeline() {
  const [params, setParams] = useSearchParams();
  const legacy = params.get('board') === 'legacy';
  function choose(mode) {
    setParams(current => {
      const next = new URLSearchParams(current);
      if (mode === 'legacy') next.set('board', 'legacy'); else next.delete('board');
      return next;
    });
  }
  const switcher = <nav aria-label="Pipeline boards" className="mb-6 flex flex-wrap gap-2">
    <button type="button" aria-current={!legacy ? 'page' : undefined} onClick={()=>choose('publishing')} className={`rounded-lg px-4 py-2 text-sm font-semibold ${!legacy ? 'bg-[#9a6030] text-white' : 'border border-slate-300 bg-white text-slate-700'}`}>Creative Books Pipeline</button>
    <button type="button" aria-current={legacy ? 'page' : undefined} onClick={()=>choose('legacy')} className={`rounded-lg px-4 py-2 text-sm font-semibold ${legacy ? 'bg-[#9a6030] text-white' : 'border border-slate-300 bg-white text-slate-700'}`}>Existing sales pipeline</button>
  </nav>;
  if (legacy) return <LegacyPipeline switcher={switcher}/>;
  return <AdminLayout>{switcher}<PublishingPipelineBoard/></AdminLayout>;
}
