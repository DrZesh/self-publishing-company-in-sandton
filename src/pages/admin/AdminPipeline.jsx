import { useState, useCallback, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import AdminLayout from '@/components/admin/AdminLayout';
import { toast } from 'sonner';
import { SlidersHorizontal, Plus, Calendar, DollarSign, ArrowRight, CheckCircle, Mail, Phone, ExternalLink, BookOpen, TrendingUp, User, MessageSquare, History, X, Edit2 } from 'lucide-react';
import NewDealModal from '@/components/pipeline/NewDealModal';

// ── Stage config ──────────────────────────────────────────────────────────────
const STAGES = [
  { id: 'Inquiry',   label: 'Inquiry',   color: '#334155', textColor: '#334155', bg: 'rgba(51,65,85,0.04)',   prob: 0.20, active: true },
  { id: 'Quotation', label: 'Quotation', color: '#2563eb', textColor: '#2563eb', bg: 'rgba(37,99,235,0.04)',  prob: 0.55, active: true },
  { id: 'Won',       label: 'Won',       color: '#16a34a', textColor: '#16a34a', bg: 'rgba(22,163,74,0.04)',  prob: 1,    active: false },
  { id: 'Lost',      label: 'Lost',      color: '#e11d48', textColor: '#e11d48', bg: 'rgba(225,29,72,0.04)',  prob: 0,    active: false },
  { id: 'Ghosted',   label: 'Ghosted',   color: '#94a3b8', textColor: '#94a3b8', bg: 'rgba(148,163,184,0.04)',prob: 0,    active: false },
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

function getProbability(contact, stage) {
  if (contact.probability != null) return contact.probability;
  return Math.round((STAGES.find(s => s.id === stage)?.prob ?? 0.2) * 100);
}

function getDaysInStage(contact) {
  const d = contact.pipeline_stage_changed_at || contact.updated_date || contact.created_date;
  if (!d) return 0;
  return Math.floor((Date.now() - new Date(d)) / 86400000);
}

function fmtValue(v) {
  if (!v) return '0';
  return Math.round(v).toLocaleString('en-ZA');
}

function fmtValueShort(v) {
  if (!v) return 'R0';
  if (v >= 1000000) return 'R' + (v / 1000000).toFixed(1) + 'M';
  if (v >= 1000) return 'R' + Math.round(v / 1000) + 'k';
  return 'R' + Math.round(v);
}

function fmtDate(d) {
  if (!d) return null;
  return new Date(d).toLocaleDateString('en-ZA', { month: 'short', day: 'numeric' });
}

function toContactStage(newStage, lostReason) {
  if (newStage === 'Inquiry')   return { pipeline_stage: 'New Enquiry', lost_reason: '' };
  if (newStage === 'Quotation') return { pipeline_stage: 'Quote Sent', lost_reason: '' };
  if (newStage === 'Won')       return { pipeline_stage: 'Project Started', lost_reason: '' };
  if (newStage === 'Lost')      return { pipeline_stage: 'Lost', lost_reason: lostReason || 'Did not proceed' };
  if (newStage === 'Ghosted')   return { pipeline_stage: 'Lost', lost_reason: 'Ghosted' };
  return {};
}

function probPill(prob) {
  if (prob >= 70) return { bg: '#dcfce7', text: '#15803d' };
  if (prob >= 40) return { bg: '#dbeafe', text: '#1d4ed8' };
  return { bg: '#f1f5f9', text: '#64748b' };
}

function initials(name) {
  if (!name) return '?';
  return name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase();
}

// ── Deal Card ─────────────────────────────────────────────────────────────────
function DealCard({ contact, onSelect, onMove, stageConf }) {
  const stage = mapStage(contact);
  const prob = getProbability(contact, stage);
  const pill = probPill(prob);
  const closeDate = contact.expected_close_date ? fmtDate(contact.expected_close_date) : null;
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div
      className="group relative bg-white rounded-2xl border border-slate-100 shadow-sm cursor-pointer select-none transition-all duration-150 hover:shadow-md hover:-translate-y-0.5"
      style={{ padding: '16px 18px' }}
      onClick={() => onSelect(contact)}
    >
      {/* Row 1: company + prob pill */}
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-xs text-slate-400 truncate max-w-[140px] font-medium">
          {contact.company || contact.book_title || '—'}
        </span>
        <span className="text-xs font-semibold px-2 py-0.5 rounded-full flex-shrink-0 ml-2"
          style={{ background: pill.bg, color: pill.text }}>
          {prob}%
        </span>
      </div>

      {/* Row 2: deal title */}
      <p className="font-bold text-[#0F172A] text-base leading-snug mb-3 truncate">
        {contact.full_name}
      </p>

      {/* Row 3: value + date */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1">
          <DollarSign className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
          <span className="text-sm font-bold text-[#0F172A]">
            {contact.pipeline_value ? fmtValue(contact.pipeline_value) : '—'}
          </span>
        </div>
        {closeDate && (
          <div className="flex items-center gap-1 text-slate-400">
            <Calendar className="w-3 h-3" />
            <span className="text-xs">{closeDate}</span>
          </div>
        )}
      </div>

      {/* Move menu */}
      <button
        className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-slate-100 rounded text-slate-400"
        onClick={e => { e.stopPropagation(); setMenuOpen(o => !o); }}
      >
        <span className="text-sm leading-none">···</span>
      </button>
      {menuOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={e => { e.stopPropagation(); setMenuOpen(false); }} />
          <div className="absolute top-8 right-2 bg-white border border-slate-100 rounded-xl shadow-lg z-50 py-1 min-w-[140px]">
            {STAGES.filter(s => s.id !== stage).map(s => (
              <button key={s.id}
                onClick={e => { e.stopPropagation(); setMenuOpen(false); onMove(contact.id, s.id); }}
                className="block w-full text-left px-3 py-2 text-xs text-slate-600 hover:bg-slate-50 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full" style={{ background: s.color }} />
                Move to {s.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// ── Deal Detail Panel ─────────────────────────────────────────────────────────
const PKG_TYPES = ['Full publishing','Editing only','Cover + layout','Typesetting','Print run','Other'];
const STAGE_OPTS = [
  { label: 'Inquiry',   pipeline_stage: 'New Enquiry' },
  { label: 'Quotation', pipeline_stage: 'Quote Sent' },
  { label: 'Won',       pipeline_stage: 'Project Started' },
  { label: 'Lost',      pipeline_stage: 'Lost' },
];
const EMAIL_TEMPLATES = [
  { id: 'intro', subject: 'Welcome to Creative Books SA', body: 'Dear {{client_name}},\n\nThank you for your interest in publishing your book, {{book_title}}. We would be delighted to help you bring your manuscript to life.\n\nOur team specializes in full-service publishing including editing, cover design, typesetting, and printing. Would you be available for a quick call this week to discuss your project?\n\nWarm regards,\nCreative Books SA\n084 230 5393' },
  { id: 'quote_followup', subject: 'Following up on your quote', body: 'Dear {{client_name}},\n\nI hope this email finds you well. I wanted to follow up on the quote we sent for {{book_title}}.\n\nDo you have any questions about the package or our services?\n\nKind regards,\nCreative Books SA' },
  { id: 'high_value', subject: 'Premium publishing package for {{book_title}}', body: 'Dear {{client_name}},\n\nThank you for considering Creative Books SA for your publishing project, {{book_title}}.\n\nWould you be available for a discovery call this week?\n\nWarm regards,\nCreative Books SA' },
];

function DealDetailPanel({ contact, onClose, onMove, onConvert, onUpdate }) {
  const stage = mapStage(contact);
  const prob = getProbability(contact, stage);
  const stageConf = STAGES.find(s => s.id === stage);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [emailTab, setEmailTab] = useState('compose');
  const [emailForm, setEmailForm] = useState({ to: contact.email || '', subject: '', body: '' });
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [sendingEmail, setSendingEmail] = useState(false);
  const [sendingWA, setSendingWA] = useState(false);
  const [showActivity, setShowActivity] = useState(false);
  const [activityLogs, setActivityLogs] = useState([]);
  const [ef, setEfState] = useState({
    pipeline_value: contact.pipeline_value || '',
    probability: contact.probability ?? '',
    package_type_val: contact.package_type || '',
    pipeline_stage_val: contact.pipeline_stage || 'New Enquiry',
    expected_close_date: contact.expected_close_date ? contact.expected_close_date.split('T')[0] : '',
    pipeline_owner: contact.pipeline_owner || '',
  });
  const setEF = (k, v) => setEfState(f => ({ ...f, [k]: v }));

  const resolveVars = (text) => !text ? '' : text.replace(/{{client_name}}/g, contact.full_name || '').replace(/{{book_title}}/g, contact.book_title || '[Book Title]');

  const handleSelectTemplate = (t) => {
    setSelectedTemplate(t.id);
    setEmailForm({ to: contact.email || '', subject: resolveVars(t.subject), body: resolveVars(t.body) });
  };

  const handleSendEmail = async () => {
    if (!emailForm.to || !emailForm.subject || !emailForm.body) { toast.error('Fill in all fields'); return; }
    setSendingEmail(true);
    try {
      const res = await base44.functions.invoke('sendContactEmail', { action: 'send', to: emailForm.to, subject: emailForm.subject, body_html: '<p>' + emailForm.body.replace(/\n/g, '<br/>') + '</p>' });
      if (res.data?.success) { toast.success('Email sent!'); setEmailForm({ to: '', subject: '', body: '' }); setSelectedTemplate(null); }
      else toast.error(res.data?.error || 'Failed');
    } catch (e) { toast.error('Failed: ' + (e?.message || 'Unknown')); }
    setSendingEmail(false);
  };

  const handleSendWhatsApp = async () => {
    const number = contact.whatsapp_number || contact.phone;
    if (!number) { toast.error('No WhatsApp number found'); return; }
    setSendingWA(true);
    try {
      const res = await base44.functions.invoke('sendWhatsAppNotification', { to_number: number, message: 'Hi ' + (contact.full_name || 'there') + ', this is Creative Books SA. Regarding "' + (contact.book_title || 'your book') + '" — how can we help you today?', contact_id: contact.id, type: 'Pipeline Follow-up' });
      if (res.data?.success) toast.success('WhatsApp sent!'); else toast.error(res.data?.error || 'Failed');
    } catch (e) { toast.error('Failed: ' + (e?.message || 'Unknown')); }
    setSendingWA(false);
  };

  const handleSave = async () => {
    setSaving(true);
    const updates = { pipeline_value: ef.pipeline_value !== '' ? Number(ef.pipeline_value) : undefined, probability: ef.probability !== '' ? Number(ef.probability) : null, package_type: ef.package_type_val || undefined, pipeline_stage: ef.pipeline_stage_val || undefined, pipeline_stage_changed_at: new Date().toISOString(), expected_close_date: ef.expected_close_date || undefined, pipeline_owner: ef.pipeline_owner || undefined };
    await base44.entities.Contact.update(contact.id, updates);
    setSaving(false); setEditing(false);
    onUpdate(contact.id, updates);
    toast.success('Deal updated');
  };

  const inStyle = { width: '100%', border: '1px solid #e2e8f0', borderRadius: 8, padding: '7px 10px', fontSize: 13, boxSizing: 'border-box', outline: 'none', fontFamily: 'inherit', background: '#fff' };

  return (
    <>
      <div className="fixed inset-0 bg-black/30 z-[100]" onClick={onClose} />
      <div className="fixed top-0 right-0 bottom-0 w-[380px] bg-white z-[101] shadow-2xl flex flex-col overflow-y-auto">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <div>
            <h2 className="font-bold text-[#0F172A] text-lg">{contact.full_name}</h2>
            <p className="text-xs text-slate-400 mt-0.5">{contact.company || contact.book_title || ''}</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setEditing(e => !e)}
              className="text-xs px-3 py-1.5 border border-slate-200 rounded-lg font-semibold text-slate-600 hover:bg-slate-50">
              {editing ? 'Cancel' : 'Edit'}
            </button>
            <button onClick={onClose} className="p-1.5 hover:bg-slate-100 rounded-lg"><X className="w-4 h-4 text-slate-400" /></button>
          </div>
        </div>

        <div className="p-5 space-y-4 flex-1">
          {/* Stage badge */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold px-3 py-1 rounded-full" style={{ background: stageConf?.bg || '#f1f5f9', color: stageConf?.color || '#64748b' }}>
              {stage}
            </span>
            <span className="text-xs text-slate-400">{getDaysInStage(contact)}d in stage</span>
          </div>

          {editing ? (
            <div className="bg-slate-50 rounded-xl p-4 space-y-3">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wide">Edit Deal</p>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Value (R)</label>
                  <input type="number" value={ef.pipeline_value} onChange={e => setEF('pipeline_value', e.target.value)} style={inStyle} />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Win Prob %</label>
                  <input type="number" min="0" max="100" value={ef.probability} onChange={e => setEF('probability', e.target.value)} placeholder={String(prob)} style={inStyle} />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Package</label>
                  <select value={ef.package_type_val} onChange={e => setEF('package_type_val', e.target.value)} style={{ ...inStyle, color: '#374151' }}>
                    <option value="">— None —</option>
                    {PKG_TYPES.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Stage</label>
                  <select value={ef.pipeline_stage_val} onChange={e => setEF('pipeline_stage_val', e.target.value)} style={{ ...inStyle, color: '#374151' }}>
                    {STAGE_OPTS.map(s => <option key={s.pipeline_stage} value={s.pipeline_stage}>{s.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Close Date</label>
                  <input type="date" value={ef.expected_close_date} onChange={e => setEF('expected_close_date', e.target.value)} style={inStyle} />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Owner</label>
                  <input value={ef.pipeline_owner} onChange={e => setEF('pipeline_owner', e.target.value)} style={inStyle} />
                </div>
              </div>
              <button onClick={handleSave} disabled={saving}
                className="w-full py-2.5 bg-[#0F172A] text-white rounded-xl text-sm font-semibold disabled:opacity-50">
                {saving ? 'Saving…' : 'Save Changes'}
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-slate-50 rounded-xl p-3">
                <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wide mb-1">Deal Value</p>
                <p className="font-bold text-[#0F172A] text-lg">R{contact.pipeline_value ? fmtValue(contact.pipeline_value) : '—'}</p>
              </div>
              <div className="bg-slate-50 rounded-xl p-3">
                <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wide mb-1">Win Probability</p>
                <p className="font-bold text-[#0F172A] text-lg">{prob}%</p>
              </div>
            </div>
          )}

          {/* Contact info */}
          <div className="space-y-2">
            {contact.email && (
              <a href={'mailto:' + contact.email} className="flex items-center gap-2.5 px-3 py-2.5 bg-slate-50 rounded-xl text-sm text-slate-700 hover:bg-slate-100 transition-colors no-underline">
                <Mail className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                <span className="truncate text-xs">{contact.email}</span>
              </a>
            )}
            {contact.phone && (
              <a href={'tel:' + contact.phone} className="flex items-center gap-2.5 px-3 py-2.5 bg-slate-50 rounded-xl text-sm text-slate-700 hover:bg-slate-100 transition-colors no-underline">
                <Phone className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                <span className="text-xs">{contact.phone}</span>
              </a>
            )}
            {contact.book_title && (
              <div className="flex items-center gap-2.5 px-3 py-2.5 bg-slate-50 rounded-xl">
                <BookOpen className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                <span className="text-xs text-slate-600">{contact.book_title}</span>
              </div>
            )}
            {contact.package_type && (
              <div className="flex items-center gap-2.5 px-3 py-2.5 bg-slate-50 rounded-xl">
                <TrendingUp className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                <span className="text-xs text-slate-600">{contact.package_type}</span>
              </div>
            )}
          </div>

          {/* Move to stage */}
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-2">Move to stage</p>
            <div className="flex flex-wrap gap-1.5">
              {STAGES.filter(s => s.id !== stage).map(s => (
                <button key={s.id} onClick={() => { onMove(contact.id, s.id); onClose(); }}
                  className="text-xs font-semibold px-3 py-1.5 rounded-full border transition-colors hover:opacity-80"
                  style={{ borderColor: s.color, color: s.color, background: s.bg }}>
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* Email composer */}
          <div className="border-t border-slate-100 pt-4">
            <div className="flex gap-1 mb-3">
              <button onClick={() => setEmailTab('compose')}
                className={'flex-1 py-1.5 text-xs font-semibold border-b-2 transition-colors ' + (emailTab === 'compose' ? 'border-[#0F172A] text-[#0F172A]' : 'border-transparent text-slate-400')}>
                Compose
              </button>
              <button onClick={() => setEmailTab('templates')}
                className={'flex-1 py-1.5 text-xs font-semibold border-b-2 transition-colors ' + (emailTab === 'templates' ? 'border-[#0F172A] text-[#0F172A]' : 'border-transparent text-slate-400')}>
                Templates
              </button>
            </div>

            {emailTab === 'templates' && (
              <div className="space-y-2 mb-3">
                {EMAIL_TEMPLATES.map(t => (
                  <button key={t.id} onClick={() => handleSelectTemplate(t)}
                    className={'w-full text-left p-3 rounded-xl border text-xs transition-colors ' + (selectedTemplate === t.id ? 'border-[#0F172A] bg-slate-50' : 'border-slate-100 bg-white hover:bg-slate-50')}>
                    <p className="font-semibold text-slate-700 mb-0.5">{t.subject.split('{{')[0].trim()}</p>
                    <p className="text-slate-400 truncate">{t.body.slice(0, 60)}...</p>
                  </button>
                ))}
              </div>
            )}

            {emailTab === 'compose' && (
              <div className="space-y-2">
                <input value={emailForm.to} onChange={e => setEmailForm(f => ({ ...f, to: e.target.value }))} placeholder="To" style={inStyle} />
                <input value={emailForm.subject} onChange={e => setEmailForm(f => ({ ...f, subject: e.target.value }))} placeholder="Subject" style={inStyle} />
                <textarea value={emailForm.body} onChange={e => setEmailForm(f => ({ ...f, body: e.target.value }))} rows={4} placeholder="Message…" style={{ ...inStyle, resize: 'none' }} />
                <button onClick={handleSendEmail} disabled={sendingEmail || !emailForm.to || !emailForm.subject || !emailForm.body}
                  className="w-full py-2.5 bg-[#0F172A] text-white rounded-xl text-xs font-semibold disabled:opacity-40">
                  {sendingEmail ? 'Sending…' : 'Send Email'}
                </button>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="grid grid-cols-2 gap-2 pb-2">
            <button onClick={handleSendWhatsApp} disabled={sendingWA || !(contact.whatsapp_number || contact.phone)}
              className="py-2.5 bg-[#25D366] text-white rounded-xl text-xs font-semibold disabled:opacity-40 flex items-center justify-center gap-1.5">
              <MessageSquare className="w-3.5 h-3.5" />{sendingWA ? 'Sending…' : 'WhatsApp'}
            </button>
            <button onClick={() => setShowActivity(!showActivity)}
              className="py-2.5 border border-slate-200 rounded-xl text-xs font-semibold text-slate-600 flex items-center justify-center gap-1.5 hover:bg-slate-50">
              <History className="w-3.5 h-3.5" /> Activity
            </button>
          </div>

          <a href={'/admin/contacts/detail?id=' + contact.id}
            className="flex items-center justify-center gap-2 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-100 no-underline">
            <ExternalLink className="w-3.5 h-3.5" /> Open Full Contact
          </a>

          {stage === 'Won' && (
            <button onClick={() => { onConvert(contact); onClose(); }}
              className="w-full py-2.5 bg-emerald-600 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2 hover:bg-emerald-700">
              <ArrowRight className="w-3.5 h-3.5" /> Convert to Project
            </button>
          )}
        </div>
      </div>
    </>
  );
}

// ── Convert to Project Modal ──────────────────────────────────────────────────
function ConvertToProjectModal({ contact, onClose, onConverted }) {
  const [form, setForm] = useState({ book_title: contact.book_title || '', author_name: contact.full_name || '', service_type: 'Full Publishing Package', project_value: contact.pipeline_value || 0, notes: '' });
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);
  const SERVICE_TYPES = ['Full Publishing Package','Printing Only','Editing Only','Cover Design Only','Typesetting Only','Ebook','Ghostwriting',"Children's Book",'Academic Editing','Custom'];

  const save = async () => {
    setSaving(true);
    await base44.entities.Project.create({ contact_id: contact.id, book_title: form.book_title, author_name: form.author_name, service_type: form.service_type, project_value: Number(form.project_value) || 0, stage: 'Quote Accepted', notes: form.notes });
    setSaving(false); setDone(true);
    setTimeout(() => { onConverted(); onClose(); }, 1400);
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-[200] flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6" onClick={e => e.stopPropagation()}>
        {done ? (
          <div className="text-center py-6">
            <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
            <p className="font-bold text-lg text-[#0F172A]">Project Created!</p>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-bold text-lg text-[#0F172A]">Convert to Project</h2>
              <button onClick={onClose} className="p-1.5 hover:bg-slate-100 rounded-lg"><X className="w-4 h-4 text-slate-400" /></button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase block mb-1">Book Title</label>
                <input value={form.book_title} onChange={e => setForm(f => ({ ...f, book_title: e.target.value }))} className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#0F172A]" />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase block mb-1">Author</label>
                <input value={form.author_name} onChange={e => setForm(f => ({ ...f, author_name: e.target.value }))} className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#0F172A]" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase block mb-1">Service</label>
                  <select value={form.service_type} onChange={e => setForm(f => ({ ...f, service_type: e.target.value }))} className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none">
                    {SERVICE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase block mb-1">Value (R)</label>
                  <input type="number" value={form.project_value} onChange={e => setForm(f => ({ ...f, project_value: e.target.value }))} className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none" />
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase block mb-1">Notes</label>
                <textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} rows={2} className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none resize-none" />
              </div>
            </div>
            <div className="flex gap-2 mt-5">
              <button onClick={onClose} className="flex-1 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-600 hover:bg-slate-50">Cancel</button>
              <button onClick={save} disabled={saving || !form.book_title.trim()}
                className="flex-2 px-6 py-2.5 bg-emerald-600 text-white rounded-xl text-sm font-semibold disabled:opacity-40 flex items-center gap-2 hover:bg-emerald-700">
                <ArrowRight className="w-4 h-4" />{saving ? 'Creating…' : 'Create Project'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function AdminPipeline() {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [convertContact, setConvertContact] = useState(null);
  const [selectedContact, setSelectedContact] = useState(null);
  const [newDealOpen, setNewDealOpen] = useState(false);

  const load = useCallback(async () => {
    const all = await base44.entities.Contact.list('-updated_date', 500);
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
      toast.success('Moved to ' + newStage);
    } catch {
      setContacts(prev => prev.map(c => c.id === contactId ? contact : c));
      toast.error('Failed to update');
    }
  };

  const handleUpdate = (contactId, updates) => {
    setContacts(prev => prev.map(c => c.id === contactId ? { ...c, ...updates } : c));
    setSelectedContact(prev => prev ? { ...prev, ...updates } : prev);
  };

  function getEffectiveStage(c) { return c._pipelineStageOverride || mapStage(c); }

  const filtered = contacts.filter(c => {
    if (!search) return true;
    const q = search.toLowerCase();
    return c.full_name?.toLowerCase().includes(q) || c.book_title?.toLowerCase().includes(q);
  });

  const byStage = {};
  STAGES.forEach(s => { byStage[s.id] = []; });
  filtered.forEach(c => { const st = getEffectiveStage(c); if (byStage[st]) byStage[st].push(c); });
  STAGES.forEach(s => {
    byStage[s.id].sort((a, b) => (b.pipeline_value || 0) - (a.pipeline_value || 0));
  });

  const totalPipeline = [...byStage['Inquiry'], ...byStage['Quotation']].reduce((s, c) => s + (c.pipeline_value || 0), 0);

  return (
    <AdminLayout>
      <div className="flex flex-col h-full" style={{ margin: '-24px -24px -24px', background: '#f8fafc', minHeight: '100%' }}>

        {/* Page header */}
        <div className="flex items-center justify-between px-8 py-5 bg-white border-b border-slate-100">
          <div>
            <h1 className="text-2xl font-bold text-[#0F172A]" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>Pipeline</h1>
            <p className="text-xs text-slate-400 mt-0.5">
              {filtered.length} deals · {fmtValueShort(totalPipeline)} open pipeline
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {/* filter placeholder */}}
              className="flex items-center gap-1.5 px-3.5 py-2 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 transition-colors shadow-sm"
            >
              <SlidersHorizontal className="w-4 h-4" /> Filter
            </button>
            <button
              onClick={() => setNewDealOpen(true)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold text-white transition-colors"
              style={{ background: '#0F172A' }}
            >
              <Plus className="w-4 h-4" /> New Deal
            </button>
          </div>
        </div>

        {/* Board */}
        {loading ? (
          <div className="flex items-center justify-center flex-1 py-20">
            <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-600 rounded-full animate-spin" />
          </div>
        ) : (
          <div className="flex-1 overflow-x-auto">
            <div className="flex gap-4 px-8 py-6 h-full" style={{ minWidth: 'max-content', alignItems: 'flex-start' }}>
              {STAGES.map(stageConf => {
                const cards = byStage[stageConf.id];
                const colTotal = cards.reduce((s, c) => s + (c.pipeline_value || 0), 0);
                return (
                  <div key={stageConf.id} style={{ width: 260, flexShrink: 0 }}>
                    {/* Column header */}
                    <div className="flex items-center justify-between mb-3 px-1">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-sm" style={{ color: stageConf.color }}>
                          {stageConf.label}
                        </span>
                        <span className="text-sm text-slate-400 font-normal">{cards.length}</span>
                      </div>
                      {colTotal > 0 && (
                        <span className="text-xs text-slate-400 font-medium">{fmtValueShort(colTotal)}</span>
                      )}
                    </div>

                    {/* Column body */}
                    <div
                      className="rounded-2xl p-2 flex flex-col gap-2.5 min-h-[120px]"
                      style={{ background: stageConf.bg }}
                    >
                      {cards.map(c => (
                        <DealCard
                          key={c.id}
                          contact={c}
                          stageConf={stageConf}
                          onSelect={setSelectedContact}
                          onMove={handleMove}
                        />
                      ))}

                      {/* + New Deal ghost button */}
                      <button
                        onClick={() => setNewDealOpen(true)}
                        className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-medium text-slate-400 hover:text-slate-600 hover:bg-white/70 transition-colors w-full"
                      >
                        <Plus className="w-3.5 h-3.5" /> New Deal
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* New deal modal */}
      {newDealOpen && <NewDealModal onClose={() => setNewDealOpen(false)} onCreated={() => load()} />}

      {/* Deal detail panel */}
      {selectedContact && (
        <DealDetailPanel
          contact={selectedContact}
          onClose={() => setSelectedContact(null)}
          onMove={(id, stage) => { handleMove(id, stage); setSelectedContact(null); }}
          onConvert={setConvertContact}
          onUpdate={handleUpdate}
        />
      )}

      {/* Convert to project modal */}
      {convertContact && (
        <ConvertToProjectModal
          contact={convertContact}
          onClose={() => setConvertContact(null)}
          onConverted={() => { toast.success('Project created!'); load(); }}
        />
      )}
    </AdminLayout>
  );
}