import { useState, useCallback, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import AdminLayout from '@/components/admin/AdminLayout';
import { toast } from 'sonner';
import { Sparkles, AlertTriangle, Settings2, Plus, Search, X, Edit2, ArrowRight, CheckCircle, Mail, Phone, ExternalLink, BookOpen, Calendar, TrendingUp, User } from 'lucide-react';
import NewDealModal from '@/components/pipeline/NewDealModal';

// ── Stage config ──────────────────────────────────────────────────────────────
const STAGES = [
  { id: 'Inquiry',   label: 'Inquiry',   color: '#6366f1', prob: 0.20, active: true },
  { id: 'Quotation', label: 'Quotation', color: '#0ea5e9', prob: 0.55, active: true },
  { id: 'Won',       label: 'Won',       color: '#16a34a', prob: 1,    active: false },
  { id: 'Lost',      label: 'Lost',      color: '#e11d48', prob: 0,    active: false },
  { id: 'Ghosted',   label: 'Ghosted',   color: '#64748b', prob: 0,    active: false },
];

function mapStage(contact) {
  const s = contact.pipeline_stage || '';
  const lr = (contact.lost_reason || '').toLowerCase();
  if (lr.includes('ghost')) return 'Ghosted';
  const WON = ['Project Started','Editing','Cover Design','Typesetting','Sample Queued','Sample Approved','Mass Production','Completed','Delivered'];
  const QUOT = ['Quote in Progress','Quote Sent','Payment Pending'];
  if (WON.includes(s)) return 'Won';
  if (s === 'Lost') return 'Lost';
  if (QUOT.includes(s)) return 'Quotation';
  return 'Inquiry';
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

function aiSuggestion(contact, stage) {
  const days = getDaysInStage(contact);
  const val = contact.pipeline_value || 0;
  if (stage === 'Inquiry') {
    if (days > 3) return 'Follow up — no response in ' + days + ' days';
    return 'Send intro email with publishing packages';
  }
  if (stage === 'Quotation') {
    if (days > 5) return 'Chase quote — client has not responded';
    if (val > 30000) return 'High-value deal — offer a discovery call';
    return 'Send revised quote if no response today';
  }
  return null;
}

function toContactStage(newStage, lostReason) {
  if (newStage === 'Inquiry')   return { pipeline_stage: 'New Enquiry', lost_reason: '' };
  if (newStage === 'Quotation') return { pipeline_stage: 'Quote Sent', lost_reason: '' };
  if (newStage === 'Won')       return { pipeline_stage: 'Project Started', lost_reason: '' };
  if (newStage === 'Lost')      return { pipeline_stage: 'Lost', lost_reason: lostReason || 'Did not proceed' };
  if (newStage === 'Ghosted')   return { pipeline_stage: 'Lost', lost_reason: 'Ghosted' };
  return {};
}

// ── Avatar ────────────────────────────────────────────────────────────────────
function Avatar({ name, size = 28 }) {
  const bg = avatarColor(name);
  return (
    <div style={{ width: size, height: size, borderRadius: '50%', background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: size * 0.38, fontWeight: 700, color: '#fff', flexShrink: 0 }}>
      {initials(name)}
    </div>
  );
}

// ── Deal card ─────────────────────────────────────────────────────────────────
function DealCard({ contact, isTop, showAI, onMove, onSelect }) {
  const stage = mapStage(contact);
  const days = getDaysInStage(contact);
  const stalled = days > 7;
  const pri = getPriority(contact);
  const ai = showAI ? aiSuggestion(contact, stage) : null;
  const [menuOpen, setMenuOpen] = useState(false);
  const prob = contact.probability != null
    ? contact.probability
    : Math.round((STAGES.find(s => s.id === stage)?.prob ?? 0.2) * 100);

  return (
    <div
      className="deal-card"
      onClick={() => onSelect(contact)}
      style={{
        background: stalled ? 'rgba(251,191,36,0.06)' : 'rgba(255,255,255,0.93)',
        borderRadius: 12,
        border: stalled ? '1.5px solid rgba(245,158,11,0.7)' : '1px solid rgba(255,255,255,0.6)',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        overflow: 'hidden',
        position: 'relative',
        marginBottom: 10,
        cursor: 'pointer',
      }}
    >
      <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 4, background: pri.color, borderRadius: '12px 0 0 12px' }} />
      <div style={{ padding: '12px 12px 12px 16px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 6 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1, minWidth: 0 }}>
            <Avatar name={contact.full_name} size={28} />
            <div style={{ minWidth: 0 }}>
              <div style={{ fontWeight: 600, fontSize: 13, color: '#1e1e2e', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{contact.full_name}</div>
              {contact.book_title && (
                <div style={{ fontSize: 11, color: '#64748b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>📖 {contact.book_title}</div>
              )}
            </div>
          </div>
          <div style={{ position: 'relative', flexShrink: 0, marginLeft: 6 }}>
            <button onClick={e => { e.stopPropagation(); setMenuOpen(o => !o); }}
              style={{ padding: '2px 6px', fontSize: 16, color: '#94a3b8', background: 'none', border: 'none', cursor: 'pointer', lineHeight: 1 }}>···</button>
            {menuOpen && (
              <div style={{ position: 'absolute', right: 0, top: 24, background: '#fff', border: '1px solid #e7e8f0', borderRadius: 10, boxShadow: '0 4px 16px rgba(0,0,0,0.12)', zIndex: 50, minWidth: 140, padding: 6 }}>
                {STAGES.filter(s => s.id !== stage).map(s => (
                  <button key={s.id}
                    onClick={e => { e.stopPropagation(); setMenuOpen(false); onMove(contact.id, s.id); }}
                    style={{ display: 'block', width: '100%', textAlign: 'left', padding: '6px 10px', fontSize: 12, color: '#374151', background: 'none', border: 'none', cursor: 'pointer', borderRadius: 6 }}
                    onMouseEnter={e => e.currentTarget.style.background = '#f5f6fa'}
                    onMouseLeave={e => e.currentTarget.style.background = 'none'}
                  >
                    <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', background: s.color, marginRight: 6 }} />
                    Move to {s.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div style={{ fontFamily: 'monospace', fontWeight: 800, fontSize: 20, color: '#1e1e2e', marginBottom: 6, letterSpacing: '-0.5px' }}>
          {fmtRandFull(contact.pipeline_value)}
        </div>

        <div style={{ marginBottom: 8 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
            <span style={{ fontSize: 10, color: '#94a3b8' }}>Win probability</span>
            <span style={{ fontSize: 10, fontWeight: 700, color: prob >= 60 ? '#16a34a' : prob >= 30 ? '#f59e0b' : '#e11d48' }}>{prob}%</span>
          </div>
          <div style={{ height: 4, background: '#f1f5f9', borderRadius: 4, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${prob}%`, background: prob >= 60 ? '#16a34a' : prob >= 30 ? '#f59e0b' : '#e11d48', borderRadius: 4, transition: 'width 0.3s' }} />
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 5, flexWrap: 'wrap' }}>
          {contact.package_type && (
            <span style={{ background: '#ede9fe', color: '#6d28d9', fontSize: 9, fontWeight: 700, letterSpacing: '0.06em', padding: '2px 6px', borderRadius: 20 }}>{contact.package_type}</span>
          )}
          {isTop && (
            <span style={{ background: '#4f46e5', color: '#fff', fontSize: 9, fontWeight: 700, letterSpacing: '0.08em', padding: '2px 7px', borderRadius: 20, textTransform: 'uppercase' }}>Act now</span>
          )}
          <span style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: 10, color: pri.color, fontWeight: 600 }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: pri.color, display: 'inline-block' }} />
            {pri.label}
          </span>
          {stalled ? (
            <span style={{ background: '#fef3c7', color: '#d97706', fontSize: 9, fontWeight: 700, padding: '2px 6px', borderRadius: 20, display: 'flex', alignItems: 'center', gap: 3 }}>
              <AlertTriangle style={{ width: 9, height: 9 }} /> Stalled {days}d
            </span>
          ) : (
            <span style={{ fontSize: 10, color: '#94a3b8' }}>{days}d in stage</span>
          )}
        </div>

        {ai && (
          <div style={{ marginTop: 8, background: '#f5f3ff', border: '1px solid #ede9fe', borderRadius: 8, padding: '6px 10px', display: 'flex', alignItems: 'flex-start', gap: 6 }}>
            <Sparkles style={{ width: 12, height: 12, color: '#7c3aed', flexShrink: 0, marginTop: 1 }} />
            <span style={{ fontSize: 11, color: '#5b21b6', lineHeight: 1.4 }}>{ai}</span>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Deal detail panel ─────────────────────────────────────────────────────────
const PKG_TYPES = ['Full publishing','Editing only','Cover + layout','Typesetting','Print run','Other'];
const STAGE_OPTS = [
  { label: 'Inquiry',   pipeline_stage: 'New Enquiry' },
  { label: 'Quotation', pipeline_stage: 'Quote Sent' },
  { label: 'Won',       pipeline_stage: 'Project Started' },
  { label: 'Lost',      pipeline_stage: 'Lost' },
];

function DealDetailPanel({ contact, onClose, onMove, onConvert, onUpdate, stages }) {
  const stage = mapStage(contact);
  const days = getDaysInStage(contact);
  const pri = getPriority(contact);
  const prob = contact.probability != null
    ? contact.probability
    : Math.round((stages.find(s => s.id === stage)?.prob ?? 0.2) * 100);
  const stageConf = stages.find(s => s.id === stage);
  const closeDate = contact.expected_close_date
    ? new Date(contact.expected_close_date).toLocaleDateString('en-ZA', { day: '2-digit', month: 'short', year: 'numeric' })
    : null;

  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [ef, setEfState] = useState({
    pipeline_value: contact.pipeline_value || '',
    probability: contact.probability ?? '',
    package_type_val: contact.package_type || '',
    pipeline_stage_val: contact.pipeline_stage || 'New Enquiry',
    expected_close_date: contact.expected_close_date ? contact.expected_close_date.split('T')[0] : '',
    pipeline_owner: contact.pipeline_owner || '',
  });
  const setEF = (k, v) => setEfState(f => ({ ...f, [k]: v }));

  const handleSave = async () => {
    setSaving(true);
    const updates = {
      pipeline_value: ef.pipeline_value !== '' ? Number(ef.pipeline_value) : undefined,
      probability: ef.probability !== '' ? Number(ef.probability) : null,
      package_type: ef.package_type_val || undefined,
      pipeline_stage: ef.pipeline_stage_val || undefined,
      pipeline_stage_changed_at: new Date().toISOString(),
      expected_close_date: ef.expected_close_date || undefined,
      pipeline_owner: ef.pipeline_owner || undefined,
    };
    await base44.entities.Contact.update(contact.id, updates);
    setSaving(false);
    setEditing(false);
    onUpdate(contact.id, updates);
    toast.success('Deal updated');
  };

  const inStyle = { width: '100%', border: '1px solid #e7e8f0', borderRadius: 7, padding: '7px 10px', fontSize: 13, boxSizing: 'border-box', outline: 'none', fontFamily: 'inherit' };

  return (
    <>
      <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.3)', zIndex: 100 }} onClick={onClose} />
      <div style={{ position: 'fixed', top: 0, right: 0, bottom: 0, width: 390, background: '#fff', zIndex: 101, boxShadow: '-8px 0 40px rgba(0,0,0,0.2)', display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>

        {/* Header */}
        <div style={{ background: `linear-gradient(135deg, ${stageConf?.color || '#6366f1'} 0%, ${stageConf?.color || '#6366f1'}aa 100%)`, padding: '24px 20px 20px', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 14 }}>
            <Avatar name={contact.full_name} size={48} />
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => setEditing(e => !e)}
                style={{ background: editing ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.2)', border: 'none', borderRadius: 8, padding: '5px 12px', cursor: 'pointer', color: editing ? '#4f46e5' : '#fff', fontSize: 12, fontWeight: 700 }}>
                {editing ? 'Cancel' : '✏️ Edit'}
              </button>
              <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: '50%', width: 30, height: 30, cursor: 'pointer', color: '#fff', fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
            </div>
          </div>
          <h2 style={{ color: '#fff', fontWeight: 700, fontSize: 18, margin: '0 0 3px', fontFamily: 'var(--font-heading)' }}>{contact.full_name}</h2>
          {contact.company && <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: 13, margin: '0 0 8px' }}>{contact.company}</p>}
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 8 }}>
            <span style={{ background: 'rgba(255,255,255,0.2)', color: '#fff', fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20 }}>{stage}</span>
            <span style={{ background: pri.color, color: '#fff', fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20 }}>{pri.label} priority</span>
          </div>
        </div>

        {/* Body */}
        <div style={{ padding: 20, flex: 1 }}>

          {editing ? (
            /* ── Edit form ── */
            <div style={{ background: '#f8fafc', borderRadius: 12, padding: 16, marginBottom: 16 }}>
              <p style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.07em', margin: '0 0 12px' }}>Edit Deal Details</p>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
                <div>
                  <label style={{ fontSize: 10, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', display: 'block', marginBottom: 4 }}>Value (R)</label>
                  <input type="number" value={ef.pipeline_value} onChange={e => setEF('pipeline_value', e.target.value)} style={inStyle} />
                </div>
                <div>
                  <label style={{ fontSize: 10, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', display: 'block', marginBottom: 4 }}>Win Prob %</label>
                  <input type="number" min="0" max="100" value={ef.probability} onChange={e => setEF('probability', e.target.value)} placeholder={String(prob)} style={inStyle} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
                <div>
                  <label style={{ fontSize: 10, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', display: 'block', marginBottom: 4 }}>Package Type</label>
                  <select value={ef.package_type_val} onChange={e => setEF('package_type_val', e.target.value)} style={{ ...inStyle, color: '#374151' }}>
                    <option value="">— None —</option>
                    {PKG_TYPES.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: 10, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', display: 'block', marginBottom: 4 }}>Stage</label>
                  <select value={ef.pipeline_stage_val} onChange={e => setEF('pipeline_stage_val', e.target.value)} style={{ ...inStyle, color: '#374151' }}>
                    {STAGE_OPTS.map(s => <option key={s.pipeline_stage} value={s.pipeline_stage}>{s.label}</option>)}
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 14 }}>
                <div>
                  <label style={{ fontSize: 10, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', display: 'block', marginBottom: 4 }}>Close Date</label>
                  <input type="date" value={ef.expected_close_date} onChange={e => setEF('expected_close_date', e.target.value)} style={inStyle} />
                </div>
                <div>
                  <label style={{ fontSize: 10, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', display: 'block', marginBottom: 4 }}>Owner</label>
                  <input value={ef.pipeline_owner} onChange={e => setEF('pipeline_owner', e.target.value)} placeholder="Assigned to…" style={inStyle} />
                </div>
              </div>

              <button onClick={handleSave} disabled={saving}
                style={{ width: '100%', padding: '10px 0', background: '#4f46e5', color: '#fff', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: 'pointer', opacity: saving ? 0.6 : 1 }}>
                {saving ? 'Saving…' : '✓ Save Changes'}
              </button>
            </div>
          ) : (
            /* ── Read-only tiles ── */
            <>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 }}>
                <div style={{ background: '#f8fafc', borderRadius: 10, padding: '12px 14px' }}>
                  <p style={{ fontSize: 10, color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 4px' }}>Deal Value</p>
                  <p style={{ fontFamily: 'monospace', fontSize: 20, fontWeight: 800, color: '#1e1e2e', margin: 0 }}>{fmtRandFull(contact.pipeline_value)}</p>
                </div>
                <div style={{ background: '#f8fafc', borderRadius: 10, padding: '12px 14px' }}>
                  <p style={{ fontSize: 10, color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 4px' }}>Weighted</p>
                  <p style={{ fontFamily: 'monospace', fontSize: 20, fontWeight: 800, color: '#16a34a', margin: 0 }}>{fmtRandFull((contact.pipeline_value || 0) * (prob / 100))}</p>
                </div>
              </div>

              <div style={{ marginBottom: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span style={{ fontSize: 12, color: '#64748b', fontWeight: 600 }}>Win probability</span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: prob >= 60 ? '#16a34a' : prob >= 30 ? '#f59e0b' : '#e11d48' }}>{prob}%</span>
                </div>
                <div style={{ height: 6, background: '#f1f5f9', borderRadius: 6, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${prob}%`, background: prob >= 60 ? '#16a34a' : prob >= 30 ? '#f59e0b' : '#e11d48', borderRadius: 6 }} />
                </div>
              </div>
            </>
          )}

          {/* Info rows */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 18 }}>
            {contact.email && (
              <a href={`mailto:${contact.email}`} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px', background: '#f8fafc', borderRadius: 9, textDecoration: 'none', color: '#374151' }}>
                <Mail style={{ width: 14, height: 14, color: '#6366f1', flexShrink: 0 }} />
                <span style={{ fontSize: 13, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{contact.email}</span>
              </a>
            )}
            {contact.phone && (
              <a href={`tel:${contact.phone}`} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px', background: '#f8fafc', borderRadius: 9, textDecoration: 'none', color: '#374151' }}>
                <Phone style={{ width: 14, height: 14, color: '#0ea5e9', flexShrink: 0 }} />
                <span style={{ fontSize: 13 }}>{contact.phone}</span>
              </a>
            )}
            {contact.book_title && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px', background: '#f8fafc', borderRadius: 9 }}>
                <BookOpen style={{ width: 14, height: 14, color: '#f59e0b', flexShrink: 0 }} />
                <span style={{ fontSize: 13, color: '#374151' }}>{contact.book_title}</span>
              </div>
            )}
            {contact.package_type && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px', background: '#f8fafc', borderRadius: 9 }}>
                <TrendingUp style={{ width: 14, height: 14, color: '#8b5cf6', flexShrink: 0 }} />
                <span style={{ fontSize: 13, color: '#374151' }}>{contact.package_type}</span>
              </div>
            )}
            {closeDate && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px', background: '#f8fafc', borderRadius: 9 }}>
                <Calendar style={{ width: 14, height: 14, color: '#e11d48', flexShrink: 0 }} />
                <span style={{ fontSize: 13, color: '#374151' }}>Close by {closeDate}</span>
              </div>
            )}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px', background: '#f8fafc', borderRadius: 9 }}>
              <User style={{ width: 14, height: 14, color: '#94a3b8', flexShrink: 0 }} />
              <span style={{ fontSize: 13, color: '#94a3b8' }}>{days}d in {stage} stage</span>
            </div>
          </div>

          {/* Quick move buttons — hidden in edit mode */}
          {!editing && (
            <>
              <p style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>Move to stage</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7, marginBottom: 18 }}>
                {stages.filter(s => s.id !== stage).map(s => (
                  <button key={s.id} onClick={() => { onMove(contact.id, s.id); onClose(); }}
                    style={{ padding: '6px 12px', fontSize: 12, fontWeight: 600, border: `1.5px solid ${s.color}`, borderRadius: 20, background: '#fff', color: s.color, cursor: 'pointer' }}>
                    <span style={{ width: 7, height: 7, borderRadius: '50%', background: s.color, display: 'inline-block', marginRight: 5 }} />
                    {s.label}
                  </button>
                ))}
              </div>
            </>
          )}

          {/* Actions */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
            <a href={`/admin/contacts/detail?id=${contact.id}`}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, padding: '11px 0', background: '#1e1e2e', color: '#fff', borderRadius: 9, textDecoration: 'none', fontSize: 13, fontWeight: 600 }}>
              <ExternalLink style={{ width: 14, height: 14 }} /> Open Full Contact
            </a>
            {stage === 'Won' && (
              <button onClick={() => { onConvert(contact); onClose(); }}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, padding: '11px 0', background: '#16a34a', color: '#fff', border: 'none', borderRadius: 9, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                <ArrowRight style={{ width: 14, height: 14 }} /> Convert to Project
              </button>
            )}
            {contact.email && (
              <a href={`mailto:${contact.email}?subject=Regarding your publishing enquiry`}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, padding: '11px 0', background: '#f8fafc', color: '#374151', border: '1px solid #e7e8f0', borderRadius: 9, textDecoration: 'none', fontSize: 13, fontWeight: 600 }}>
                <Mail style={{ width: 14, height: 14 }} /> Send Email
              </a>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

// ── Convert to Project modal ──────────────────────────────────────────────────
function ConvertToProjectModal({ contact, onClose, onConverted }) {
  const [form, setForm] = useState({
    book_title: contact.book_title || '',
    author_name: contact.full_name || '',
    service_type: 'Full Publishing Package',
    project_value: contact.pipeline_value || 0,
    notes: '',
  });
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);

  const save = async () => {
    setSaving(true);
    await base44.entities.Project.create({
      contact_id: contact.id,
      book_title: form.book_title,
      author_name: form.author_name,
      service_type: form.service_type,
      project_value: Number(form.project_value) || 0,
      stage: 'Quote Accepted',
      notes: form.notes,
    });
    setSaving(false);
    setDone(true);
    setTimeout(() => { onConverted(); onClose(); }, 1400);
  };

  const SERVICE_TYPES = ['Full Publishing Package','Printing Only','Editing Only','Cover Design Only','Typesetting Only','Ebook','Ghostwriting',"Children's Book",'Academic Editing','Custom'];

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', zIndex: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }} onClick={onClose}>
      <div style={{ background: '#fff', borderRadius: 18, boxShadow: '0 24px 64px rgba(0,0,0,0.25)', maxWidth: 480, width: '100%', padding: 28 }} onClick={e => e.stopPropagation()}>
        {done ? (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <CheckCircle style={{ width: 48, height: 48, color: '#16a34a', margin: '0 auto 12px' }} />
            <p style={{ fontWeight: 700, fontSize: 17, color: '#1e1e2e' }}>Project Created!</p>
            <p style={{ fontSize: 13, color: '#64748b', marginTop: 4 }}>You can manage it in Admin → Projects.</p>
          </div>
        ) : (
          <>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <div>
                <h2 style={{ fontWeight: 700, fontSize: 17, color: '#1e1e2e', margin: 0 }}>Convert Deal to Project</h2>
                <p style={{ fontSize: 12, color: '#94a3b8', margin: '3px 0 0' }}>{contact.full_name}</p>
              </div>
              <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 20, color: '#94a3b8', lineHeight: 1 }}>✕</button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ fontSize: 11, fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: 5 }}>Book Title</label>
                <input value={form.book_title} onChange={e => setForm(f => ({ ...f, book_title: e.target.value }))} placeholder="e.g. My Memoir"
                  style={{ width: '100%', border: '1px solid #e7e8f0', borderRadius: 8, padding: '8px 12px', fontSize: 13, boxSizing: 'border-box', outline: 'none' }} />
              </div>
              <div>
                <label style={{ fontSize: 11, fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: 5 }}>Author Name</label>
                <input value={form.author_name} onChange={e => setForm(f => ({ ...f, author_name: e.target.value }))}
                  style={{ width: '100%', border: '1px solid #e7e8f0', borderRadius: 8, padding: '8px 12px', fontSize: 13, boxSizing: 'border-box', outline: 'none' }} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: 5 }}>Service Type</label>
                  <select value={form.service_type} onChange={e => setForm(f => ({ ...f, service_type: e.target.value }))}
                    style={{ width: '100%', border: '1px solid #e7e8f0', borderRadius: 8, padding: '8px 10px', fontSize: 12, color: '#374151', outline: 'none' }}>
                    {SERVICE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: 5 }}>Project Value (R)</label>
                  <input type="number" value={form.project_value} onChange={e => setForm(f => ({ ...f, project_value: e.target.value }))}
                    style={{ width: '100%', border: '1px solid #e7e8f0', borderRadius: 8, padding: '8px 12px', fontSize: 13, boxSizing: 'border-box', outline: 'none' }} />
                </div>
              </div>
              <div>
                <label style={{ fontSize: 11, fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: 5 }}>Notes (optional)</label>
                <textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} rows={2} placeholder="Any handover notes…"
                  style={{ width: '100%', border: '1px solid #e7e8f0', borderRadius: 8, padding: '8px 12px', fontSize: 13, boxSizing: 'border-box', outline: 'none', resize: 'none' }} />
              </div>
            </div>
            <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
              <button onClick={onClose} style={{ flex: 1, padding: '10px 0', border: '1px solid #e7e8f0', borderRadius: 9, fontSize: 13, background: '#fff', cursor: 'pointer', color: '#374151' }}>Cancel</button>
              <button onClick={save} disabled={saving || !form.book_title.trim()}
                style={{ flex: 2, padding: '10px 0', background: '#16a34a', color: '#fff', border: 'none', borderRadius: 9, fontSize: 13, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, opacity: (!form.book_title.trim() || saving) ? 0.6 : 1 }}>
                <ArrowRight style={{ width: 15, height: 15 }} />
                {saving ? 'Creating…' : 'Create Project'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ── Resolved row ──────────────────────────────────────────────────────────────
function ResolvedRow({ contact, onMove, onConvert }) {
  const stage = mapStage(contact);
  const stageConf = STAGES.find(s => s.id === stage);
  const [menuOpen, setMenuOpen] = useState(false);
  const date = contact.pipeline_stage_changed_at
    ? new Date(contact.pipeline_stage_changed_at).toLocaleDateString('en-ZA', { day: '2-digit', month: 'short' })
    : '—';
  let sub = '';
  if (stage === 'Won')     sub = `Closed ${date}`;
  if (stage === 'Lost')    sub = `${contact.lost_reason || 'No reason'} · ${date}`;
  if (stage === 'Ghosted') sub = `Last reply ${date}`;

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px', borderRadius: 9, background: 'rgba(255,255,255,0.85)', border: '1px solid rgba(255,255,255,0.5)', marginBottom: 6, position: 'relative' }}>
      <Avatar name={contact.full_name} size={24} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: '#374151', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{contact.full_name}</div>
        <div style={{ fontSize: 11, color: '#94a3b8' }}>{sub}</div>
      </div>
      <div style={{ fontFamily: 'monospace', fontSize: 12, fontWeight: 600, color: stageConf.color, flexShrink: 0 }}>{fmtRand(contact.pipeline_value)}</div>
      {stage === 'Won' && (
        <button onClick={() => onConvert(contact)} title="Convert to Project"
          style={{ background: '#16a34a', color: '#fff', border: 'none', borderRadius: 6, padding: '3px 8px', fontSize: 10, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 3, flexShrink: 0 }}>
          <ArrowRight style={{ width: 10, height: 10 }} /> Project
        </button>
      )}
      <div style={{ position: 'relative', flexShrink: 0 }}>
        <button onClick={() => setMenuOpen(o => !o)} style={{ padding: '2px 4px', fontSize: 14, color: '#94a3b8', background: 'none', border: 'none', cursor: 'pointer', lineHeight: 1 }}>···</button>
        {menuOpen && (
          <div style={{ position: 'absolute', right: 0, top: 22, background: '#fff', border: '1px solid #e7e8f0', borderRadius: 10, boxShadow: '0 4px 16px rgba(0,0,0,0.12)', zIndex: 50, minWidth: 140, padding: 6 }}>
            {STAGES.filter(s => s.id !== stage).map(s => (
              <button key={s.id} onClick={() => { setMenuOpen(false); onMove(contact.id, s.id); }}
                style={{ display: 'block', width: '100%', textAlign: 'left', padding: '6px 10px', fontSize: 12, color: '#374151', background: 'none', border: 'none', cursor: 'pointer', borderRadius: 6 }}
                onMouseEnter={e => e.currentTarget.style.background = '#f5f6fa'}
                onMouseLeave={e => e.currentTarget.style.background = 'none'}
              >
                <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', background: s.color, marginRight: 6 }} />
                Move to {s.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function AdminPipeline() {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [ownerFilter, setOwnerFilter] = useState('');
  const [showAI, setShowAI] = useState(true);
  const [showTotals, setShowTotals] = useState(true);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [accentColor, setAccentColor] = useState('#4f46e5');
  const [bulkOpen, setBulkOpen] = useState(false);
  const [bulkEdits, setBulkEdits] = useState({});
  const [convertContact, setConvertContact] = useState(null);
  const [selectedContact, setSelectedContact] = useState(null);
  const [newDealOpen, setNewDealOpen] = useState(false);

  const load = useCallback(async () => {
    const [, all] = await Promise.all([base44.auth.me(), base44.entities.Contact.list('-updated_date', 500)]);
    setContacts(all);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleMove = async (contactId, newStage) => {
    const contact = contacts.find(c => c.id === contactId);
    if (!contact) return;
    const now = new Date().toISOString();
    const updates = { ...toContactStage(newStage), pipeline_stage_changed_at: now };
    setContacts(prev => prev.map(c => c.id === contactId ? { ...c, ...updates, _pipelineStageOverride: newStage } : c));
    try {
      await base44.entities.Contact.update(contactId, updates);
      toast.success(`Moved to ${newStage}`);
    } catch {
      setContacts(prev => prev.map(c => c.id === contactId ? contact : c));
      toast.error('Failed to update');
    }
  };

  const handleUpdate = (contactId, updates) => {
    setContacts(prev => prev.map(c => c.id === contactId ? { ...c, ...updates } : c));
    setSelectedContact(prev => prev ? { ...prev, ...updates } : prev);
  };

  function getEffectiveStage(c) {
    return c._pipelineStageOverride || mapStage(c);
  }

  function effectiveProb(contact) {
    const stage = getEffectiveStage(contact);
    if (contact.probability != null) return contact.probability / 100;
    return STAGES.find(s => s.id === stage)?.prob ?? 0.20;
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
  filtered.forEach(c => { const st = getEffectiveStage(c); if (byStage[st]) byStage[st].push(c); });

  STAGES.filter(s => s.active).forEach(s => {
    byStage[s.id].sort((a, b) => {
      const pa = getPriority(a).rank, pb = getPriority(b).rank;
      if (pb !== pa) return pb - pa;
      return (b.pipeline_value || 0) - (a.pipeline_value || 0);
    });
  });

  const openContacts = [...byStage['Inquiry'], ...byStage['Quotation']];
  const openPipeline = openContacts.reduce((s, c) => s + (c.pipeline_value || 0), 0);
  const weightedForecast = openContacts.reduce((s, c) => s + (c.pipeline_value || 0) * effectiveProb(c), 0);
  const wonCount = byStage['Won'].length;
  const lostCount = byStage['Lost'].length + byStage['Ghosted'].length;
  const winRate = (wonCount + lostCount) > 0 ? Math.round((wonCount / (wonCount + lostCount)) * 100) : 0;
  const stalledDeals = openContacts.filter(c => getDaysInStage(c) > 7);
  const stalledValue = stalledDeals.reduce((s, c) => s + (c.pipeline_value || 0), 0);

  const handleBulkSave = async () => {
    const updates = Object.entries(bulkEdits);
    await Promise.all(updates.map(([id, vals]) => base44.entities.Contact.update(id, vals)));
    setBulkEdits({});
    setBulkOpen(false);
    load();
    toast.success(`Updated ${updates.length} deal${updates.length !== 1 ? 's' : ''}`);
  };

  return (
    <AdminLayout>
      <div style={{ minHeight: '100%', margin: '-24px -24px -24px', padding: '0 0 32px', background: 'linear-gradient(135deg, #0f0c29 0%, #302b63 40%, #24243e 70%, #1a1a2e 100%)', position: 'relative' }}>
        {/* Mesh blobs */}
        <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 0 }}>
          <div style={{ position: 'absolute', width: 600, height: 600, borderRadius: '50%', background: 'radial-gradient(circle, rgba(99,102,241,0.18) 0%, transparent 70%)', top: -100, left: -100 }} />
          <div style={{ position: 'absolute', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, rgba(184,115,51,0.15) 0%, transparent 70%)', top: 200, right: -50 }} />
          <div style={{ position: 'absolute', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(14,165,233,0.12) 0%, transparent 70%)', bottom: 0, left: '40%' }} />
        </div>

        <div style={{ position: 'relative', zIndex: 1 }}>
          {/* Header */}
          <div style={{ background: 'rgba(255,255,255,0.07)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(255,255,255,0.1)', padding: '20px 28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
            <div>
              <h1 style={{ fontSize: 22, fontWeight: 700, color: '#fff', margin: 0, fontFamily: 'var(--font-heading)' }}>Deals Pipeline</h1>
              <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.55)', margin: '2px 0 0' }}>
                {new Date().toLocaleDateString('en-ZA', { month: 'long', year: 'numeric' })} · {ownerFilter || 'All owners'} · {filtered.length} deals
              </p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
              <div style={{ position: 'relative' }}>
                <Search style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', width: 14, height: 14, color: '#94a3b8' }} />
                <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search deals…"
                  style={{ paddingLeft: 32, paddingRight: 10, height: 36, border: '1px solid rgba(255,255,255,0.2)', borderRadius: 8, fontSize: 13, color: '#fff', background: 'rgba(255,255,255,0.1)', outline: 'none', width: 180 }} />
                {search && <button onClick={() => setSearch('')} style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}><X style={{ width: 13, height: 13 }} /></button>}
              </div>

              {owners.length > 0 && (
                <select value={ownerFilter} onChange={e => setOwnerFilter(e.target.value)}
                  style={{ height: 36, border: '1px solid rgba(255,255,255,0.2)', borderRadius: 8, fontSize: 13, color: '#fff', background: 'rgba(255,255,255,0.1)', padding: '0 10px', outline: 'none' }}>
                  <option value="">All owners</option>
                  {owners.map(o => <option key={o} value={o}>{o}</option>)}
                </select>
              )}

              <div style={{ position: 'relative' }}>
                <button onClick={() => setSettingsOpen(o => !o)}
                  style={{ height: 36, padding: '0 14px', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 8, fontSize: 13, color: '#fff', background: 'rgba(255,255,255,0.1)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Settings2 style={{ width: 14, height: 14 }} /> Tweaks
                </button>
                {settingsOpen && (
                  <div style={{ position: 'absolute', right: 0, top: 42, background: '#fff', border: '1px solid #e7e8f0', borderRadius: 12, boxShadow: '0 8px 24px rgba(0,0,0,0.15)', zIndex: 60, padding: 16, minWidth: 220 }}>
                    <p style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>Display settings</p>
                    <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10, cursor: 'pointer' }}>
                      <span style={{ fontSize: 13, color: '#374151' }}>AI suggestions</span>
                      <input type="checkbox" checked={showAI} onChange={e => setShowAI(e.target.checked)} />
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10, cursor: 'pointer' }}>
                      <span style={{ fontSize: 13, color: '#374151' }}>Column totals</span>
                      <input type="checkbox" checked={showTotals} onChange={e => setShowTotals(e.target.checked)} />
                    </label>
                    <div style={{ marginTop: 4 }}>
                      <p style={{ fontSize: 13, color: '#374151', marginBottom: 6 }}>Accent color</p>
                      <div style={{ display: 'flex', gap: 8 }}>
                        {['#4f46e5','#B87333','#0ea5e9','#16a34a','#e11d48'].map(c => (
                          <button key={c} onClick={() => setAccentColor(c)}
                            style={{ width: 22, height: 22, borderRadius: '50%', background: c, border: accentColor === c ? '2px solid #1e1e2e' : '2px solid transparent', cursor: 'pointer' }} />
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <button onClick={() => { setBulkEdits({}); setBulkOpen(true); }}
                style={{ height: 36, padding: '0 14px', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 8, fontSize: 13, color: '#fff', background: 'rgba(255,255,255,0.1)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
                <Edit2 style={{ width: 13, height: 13 }} /> Bulk edit values
              </button>

              <button onClick={() => setNewDealOpen(true)}
                style={{ height: 36, padding: '0 16px', background: accentColor, color: '#fff', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
                <Plus style={{ width: 14, height: 14 }} /> New deal
              </button>
            </div>
          </div>

          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: 80 }}>
              <div style={{ width: 32, height: 32, border: '4px solid rgba(255,255,255,0.1)', borderTop: `4px solid ${accentColor}`, borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
            </div>
          ) : (
            <div style={{ padding: '20px 28px 0' }}>
              {/* KPI Strip */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr auto', gap: 12, marginBottom: 20 }}>
                <KpiTile label="Open Pipeline" value={fmtRand(openPipeline)} sub={`${openContacts.length} active deals`} tinted />
                <KpiTile label="Weighted Forecast" value={fmtRand(weightedForecast)} sub="by stage probability" />
                <KpiTile label="Win Rate" value={`${winRate}%`} sub={`${wonCount} won, ${lostCount} lost/ghosted`} />
                <KpiTile
                  label="Needs Attention"
                  value={stalledDeals.length > 0 ? fmtRand(stalledValue) : '0'}
                  sub={stalledDeals.length > 0 ? `${stalledDeals.length} deals stalled >7d` : 'No stalled deals'}
                  warn={stalledDeals.length > 0}
                />
                <FunnelCard inquiry={byStage['Inquiry'].length} quotation={byStage['Quotation'].length} won={byStage['Won'].length} />
              </div>

              {/* Kanban */}
              <div style={{ display: 'flex', gap: 14, overflowX: 'auto', paddingBottom: 12, alignItems: 'flex-start' }}>
                {STAGES.map(stage => {
                  const cards = byStage[stage.id];
                  const colTotal = cards.reduce((s, c) => s + (c.pipeline_value || 0), 0);
                  return (
                    <div key={stage.id} style={{ minWidth: 260, flex: stage.active ? '0 0 280px' : '0 0 240px', display: 'flex', flexDirection: 'column', background: 'rgba(255,255,255,0.07)', backdropFilter: 'blur(14px)', WebkitBackdropFilter: 'blur(14px)', borderRadius: 14, border: '1px solid rgba(255,255,255,0.12)', boxShadow: '0 4px 24px rgba(0,0,0,0.2)', overflow: 'hidden' }}>
                      <div style={{ borderBottom: `3px solid ${stage.color}`, padding: '12px 14px 10px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                            <span style={{ width: 9, height: 9, borderRadius: '50%', background: stage.color, display: 'inline-block', flexShrink: 0 }} />
                            <span style={{ fontWeight: 700, fontSize: 13, color: '#fff' }}>{stage.label}</span>
                            <span style={{ background: 'rgba(255,255,255,0.15)', color: '#fff', fontSize: 11, fontWeight: 600, borderRadius: 20, padding: '1px 7px' }}>{cards.length}</span>
                          </div>
                          {showTotals && colTotal > 0 && (
                            <span style={{ fontFamily: 'monospace', fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.8)' }}>{fmtRand(colTotal)}</span>
                          )}
                        </div>
                      </div>
                      <div style={{ flex: 1, padding: '10px 10px 0' }}>
                        {cards.length === 0 && (
                          <div style={{ border: '2px dashed rgba(255,255,255,0.15)', borderRadius: 10, padding: '20px 0', textAlign: 'center', color: 'rgba(255,255,255,0.3)', fontSize: 12 }}>Empty</div>
                        )}
                        {cards.map((c, i) =>
                          stage.active ? (
                            <DealCard key={c.id} contact={c} isTop={i === 0} showAI={showAI} onMove={handleMove} onSelect={setSelectedContact} />
                          ) : (
                            <ResolvedRow key={c.id} contact={c} onMove={handleMove} onConvert={setConvertContact} />
                          )
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* New deal modal */}
        {newDealOpen && (
          <NewDealModal onClose={() => setNewDealOpen(false)} onCreated={() => load()} />
        )}

        {/* Deal detail panel */}
        {selectedContact && (
          <DealDetailPanel
            contact={selectedContact}
            onClose={() => setSelectedContact(null)}
            onMove={(id, stage) => { handleMove(id, stage); setSelectedContact(null); }}
            onConvert={setConvertContact}
            onUpdate={handleUpdate}
            stages={STAGES}
          />
        )}

        {/* Convert to Project modal */}
        {convertContact && (
          <ConvertToProjectModal
            contact={convertContact}
            onClose={() => setConvertContact(null)}
            onConverted={() => { toast.success('Project created!'); load(); }}
          />
        )}

        {/* Bulk edit modal */}
        {bulkOpen && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }} onClick={() => setBulkOpen(false)}>
            <div style={{ background: '#fff', borderRadius: 16, boxShadow: '0 24px 64px rgba(0,0,0,0.3)', maxWidth: 700, width: '100%', maxHeight: '80vh', display: 'flex', flexDirection: 'column' }} onClick={e => e.stopPropagation()}>
              <div style={{ padding: '20px 24px', borderBottom: '1px solid #e7e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <h2 style={{ fontWeight: 700, fontSize: 18, color: '#1e1e2e', margin: 0 }}>Bulk Edit Deal Values</h2>
                  <p style={{ fontSize: 12, color: '#94a3b8', margin: '2px 0 0' }}>Set value, probability and package type for open deals</p>
                </div>
                <button onClick={() => setBulkOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 20, color: '#94a3b8' }}>✕</button>
              </div>
              <div style={{ overflowY: 'auto', flex: 1, padding: '16px 24px' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid #e7e8f0' }}>
                      <th style={{ textAlign: 'left', padding: '8px 0', color: '#64748b', fontWeight: 600 }}>Contact</th>
                      <th style={{ textAlign: 'left', padding: '8px 8px', color: '#64748b', fontWeight: 600 }}>Stage</th>
                      <th style={{ textAlign: 'left', padding: '8px 8px', color: '#64748b', fontWeight: 600 }}>Value (R)</th>
                      <th style={{ textAlign: 'left', padding: '8px 8px', color: '#64748b', fontWeight: 600 }}>Prob %</th>
                      <th style={{ textAlign: 'left', padding: '8px 0', color: '#64748b', fontWeight: 600 }}>Package</th>
                    </tr>
                  </thead>
                  <tbody>
                    {openContacts.map(c => (
                      <tr key={c.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '8px 0' }}>
                          <div style={{ fontWeight: 600, color: '#1e1e2e' }}>{c.full_name}</div>
                          {c.book_title && <div style={{ fontSize: 11, color: '#94a3b8' }}>{c.book_title}</div>}
                        </td>
                        <td style={{ padding: '8px 8px', color: '#64748b' }}>{getEffectiveStage(c)}</td>
                        <td style={{ padding: '8px 8px' }}>
                          <input type="number" defaultValue={c.pipeline_value || ''}
                            onChange={e => setBulkEdits(prev => ({ ...prev, [c.id]: { ...prev[c.id], pipeline_value: Number(e.target.value) } }))}
                            placeholder="0" style={{ width: 90, border: '1px solid #e7e8f0', borderRadius: 6, padding: '4px 8px', fontSize: 13 }} />
                        </td>
                        <td style={{ padding: '8px 8px' }}>
                          <input type="number" min="0" max="100" defaultValue={c.probability ?? ''}
                            onChange={e => setBulkEdits(prev => ({ ...prev, [c.id]: { ...prev[c.id], probability: Number(e.target.value) } }))}
                            placeholder={String(Math.round((STAGES.find(s => s.id === getEffectiveStage(c))?.prob ?? 0.2) * 100))}
                            style={{ width: 60, border: '1px solid #e7e8f0', borderRadius: 6, padding: '4px 8px', fontSize: 13 }} />
                        </td>
                        <td style={{ padding: '8px 0' }}>
                          <select defaultValue={c.package_type || ''}
                            onChange={e => setBulkEdits(prev => ({ ...prev, [c.id]: { ...prev[c.id], package_type: e.target.value } }))}
                            style={{ border: '1px solid #e7e8f0', borderRadius: 6, padding: '4px 6px', fontSize: 12, color: '#374151' }}>
                            <option value="">—</option>
                            {['Full publishing','Editing only','Cover + layout','Typesetting','Print run','Other'].map(p => (
                              <option key={p} value={p}>{p}</option>
                            ))}
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {openContacts.length === 0 && <p style={{ color: '#94a3b8', textAlign: 'center', padding: 32 }}>No open deals to edit.</p>}
              </div>
              <div style={{ padding: '16px 24px', borderTop: '1px solid #e7e8f0', display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                <button onClick={() => setBulkOpen(false)} style={{ padding: '8px 20px', border: '1px solid #e7e8f0', borderRadius: 8, fontSize: 13, background: '#fff', cursor: 'pointer' }}>Cancel</button>
                <button onClick={handleBulkSave} disabled={Object.keys(bulkEdits).length === 0}
                  style={{ padding: '8px 24px', background: accentColor, color: '#fff', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer', opacity: Object.keys(bulkEdits).length === 0 ? 0.5 : 1 }}>
                  Save {Object.keys(bulkEdits).length > 0 ? `(${Object.keys(bulkEdits).length})` : ''} changes
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        .deal-card:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(0,0,0,0.18) !important; transition: all 0.15s ease; }
      `}</style>
    </AdminLayout>
  );
}

function KpiTile({ label, value, sub, tinted, warn }) {
  return (
    <div style={{ background: tinted ? 'rgba(255,255,255,0.18)' : 'rgba(255,255,255,0.08)', backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)', border: warn ? '1.5px solid rgba(245,158,11,0.7)' : `1px solid ${tinted ? 'rgba(255,255,255,0.25)' : 'rgba(255,255,255,0.12)'}`, borderRadius: 12, padding: '14px 16px' }}>
      <p style={{ fontSize: 11, color: warn ? '#fbbf24' : 'rgba(255,255,255,0.55)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 4 }}>{label}</p>
      <p style={{ fontFamily: 'monospace', fontSize: 22, fontWeight: 700, color: warn ? '#fbbf24' : '#fff', margin: '0 0 2px' }}>{value}</p>
      <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', margin: 0 }}>{sub}</p>
    </div>
  );
}

function FunnelCard({ inquiry, quotation, won }) {
  const bars = [
    { label: 'Inquiry',   count: inquiry,   color: '#6366f1' },
    { label: 'Quotation', count: quotation,  color: '#0ea5e9' },
    { label: 'Won',       count: won,        color: '#16a34a' },
  ];
  const max = Math.max(...bars.map(b => b.count), 1);
  const convQ = inquiry   > 0 ? Math.round((quotation / inquiry)   * 100) : 0;
  const convW = quotation > 0 ? Math.round((won       / quotation) * 100) : 0;

  return (
    <div style={{ background: 'rgba(255,255,255,0.08)', backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 12, padding: '14px 16px', minWidth: 160 }}>
      <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.55)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 10 }}>Funnel</p>
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 10 }}>
        {bars.map((b, i) => (
          <div key={b.label} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, flex: 1 }}>
            <span style={{ fontFamily: 'monospace', fontSize: 12, fontWeight: 700, color: '#fff' }}>{b.count}</span>
            <div style={{ width: '100%', background: 'rgba(255,255,255,0.1)', borderRadius: 4, overflow: 'hidden', height: 40, display: 'flex', alignItems: 'flex-end' }}>
              <div style={{ width: '100%', background: b.color, height: `${Math.max(8, Math.round((b.count / max) * 40))}px`, borderRadius: 4, transition: 'height 0.3s' }} />
            </div>
            {i === 0 && <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.4)', marginTop: 1 }}>{convQ}% →</span>}
            {i === 1 && <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.4)', marginTop: 1 }}>{convW}% →</span>}
            {i === 2 && <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.4)', marginTop: 1 }}>&nbsp;</span>}
            <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)', fontWeight: 500 }}>{b.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}