import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import AdminLayout from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  PenTool, Plus, Send, RotateCcw, Eye, Clock, CheckCircle,
  XCircle, AlertTriangle, Search, ChevronRight, FileText, Download,
  RefreshCw, Ban, Activity, Shield, X, Loader2
} from 'lucide-react';
import { toast } from 'sonner';

const STATUS_COLORS = {
  'Draft': 'bg-gray-100 text-gray-600',
  'Prepared': 'bg-blue-100 text-blue-700',
  'Sent': 'bg-blue-100 text-blue-700',
  'Delivered': 'bg-sky-100 text-sky-700',
  'Opened': 'bg-purple-100 text-purple-700',
  'Viewed': 'bg-violet-100 text-violet-700',
  'Signing Started': 'bg-amber-100 text-amber-700',
  'Signed': 'bg-green-100 text-green-700',
  'Declined': 'bg-red-100 text-red-700',
  'Expired': 'bg-gray-200 text-gray-500',
  'Cancelled': 'bg-gray-200 text-gray-500',
  'Archived': 'bg-slate-100 text-slate-500',
};

const DOCUMENT_TYPES = ['Contract', 'NDA', 'Publishing Agreement', 'Editing Agreement', 'Proof Approval', 'Payment Agreement', 'Supplier Agreement', 'Client Approval', 'Internal Document'];

function NewRequestModal({ contacts, documents, onClose, onCreated }) {
  const [form, setForm] = useState({
    title: '', recipient_name: '', recipient_email: '', recipient_phone: '',
    company_name: '', document_category: 'Contract', file_url: '',
    email_subject: '', email_message: '', expires_days: 14,
    send_whatsapp: false, allow_download_before_sign: true, allow_download_after_sign: true,
    contact_id: '', document_id: '',
  });
  const [saving, setSaving] = useState(false);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleDocSelect = (docId) => {
    set('document_id', docId);
    const doc = documents.find(d => d.id === docId);
    if (doc) {
      set('file_url', doc.file_url);
      if (!form.title) set('title', doc.template_label || doc.file_name);
      if (!form.document_category) set('document_category', doc.category);
    }
  };

  const handleSave = async (andSend = false) => {
    if (!form.title || !form.recipient_email || !form.file_url) { toast.error('Title, recipient email, and document are required'); return; }
    setSaving(true);
    const expiresAt = new Date(Date.now() + (form.expires_days || 14) * 24 * 3600000).toISOString();
    const data = await base44.entities.ESignatureRequest.create({
      ...form, expires_at: expiresAt, status: andSend ? 'Sent' : 'Draft',
    });
    if (andSend) {
      const res = await base44.functions.invoke('eSignatureActions', { action: 'send', request_id: data.id });
      if (res.data?.success) toast.success('Signing request sent!');
      else toast.error(res.data?.error || 'Saved but failed to send email');
    } else {
      toast.success('Signing request saved as draft');
    }
    setSaving(false);
    onCreated();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2"><PenTool className="w-5 h-5 text-[#B87333]" /> New E-Signature Request</h2>
          <button onClick={onClose}><X className="w-5 h-5 text-gray-400" /></button>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1 block">Document Title *</label>
            <Input value={form.title} onChange={e => set('title', e.target.value)} placeholder="e.g. NDA — John Smith" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1 block">Document Type</label>
              <select value={form.document_category} onChange={e => set('document_category', e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white">
                {DOCUMENT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1 block">Linked Contact</label>
              <select value={form.contact_id} onChange={e => set('contact_id', e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white">
                <option value="">None</option>
                {contacts.map(c => <option key={c.id} value={c.id}>{c.full_name}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1 block">Select Document from Library</label>
            <select value={form.document_id} onChange={e => handleDocSelect(e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white">
              <option value="">Choose document...</option>
              {documents.map(d => <option key={d.id} value={d.id}>{d.template_label || d.file_name}</option>)}
            </select>
          </div>
          {!form.document_id && (
            <div>
              <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1 block">Or enter document URL directly</label>
              <Input value={form.file_url} onChange={e => set('file_url', e.target.value)} placeholder="https://..." />
            </div>
          )}
          <div className="border-t pt-4">
            <p className="text-xs font-bold text-gray-700 uppercase tracking-wide mb-3">Recipient</p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-gray-600 uppercase mb-1 block">Full Name *</label>
                <Input value={form.recipient_name} onChange={e => set('recipient_name', e.target.value)} placeholder="John Smith" />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600 uppercase mb-1 block">Email *</label>
                <Input type="email" value={form.recipient_email} onChange={e => set('recipient_email', e.target.value)} placeholder="john@email.com" />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600 uppercase mb-1 block">Phone</label>
                <Input value={form.recipient_phone} onChange={e => set('recipient_phone', e.target.value)} placeholder="+27..." />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600 uppercase mb-1 block">Company</label>
                <Input value={form.company_name} onChange={e => set('company_name', e.target.value)} placeholder="Company name" />
              </div>
            </div>
          </div>
          <div className="border-t pt-4 space-y-3">
            <p className="text-xs font-bold text-gray-700 uppercase tracking-wide">Email Settings</p>
            <div>
              <label className="text-xs font-semibold text-gray-600 uppercase mb-1 block">Subject</label>
              <Input value={form.email_subject} onChange={e => set('email_subject', e.target.value)} placeholder={`Please sign: ${form.title || 'Document'}`} />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-600 uppercase mb-1 block">Message</label>
              <textarea value={form.email_message} onChange={e => set('email_message', e.target.value)} rows={2} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm resize-none" placeholder="Optional personal message..." />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-gray-600 uppercase mb-1 block">Link Expires (days)</label>
              <Input type="number" min="1" max="90" value={form.expires_days} onChange={e => set('expires_days', parseInt(e.target.value) || 14)} />
            </div>
          </div>
          <div className="space-y-2">
            {[
              { key: 'send_whatsapp', label: 'Also send signing link via WhatsApp' },
              { key: 'allow_download_before_sign', label: 'Recipient can download before signing' },
              { key: 'allow_download_after_sign', label: 'Recipient can download signed copy' },
            ].map(opt => (
              <label key={opt.key} className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form[opt.key]} onChange={e => set(opt.key, e.target.checked)} className="w-4 h-4 accent-[#B87333]" />
                <span className="text-sm text-gray-700">{opt.label}</span>
              </label>
            ))}
          </div>
        </div>
        <div className="flex gap-3 p-6 border-t">
          <Button variant="outline" onClick={() => handleSave(false)} disabled={saving} className="flex-1">Save as Draft</Button>
          <Button onClick={() => handleSave(true)} disabled={saving} className="flex-1 bg-[#B87333] hover:bg-[#A06828] text-white gap-2">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            Save &amp; Send
          </Button>
        </div>
      </div>
    </div>
  );
}

function DebugLogPanel({ request, onClose }) {
  const trail = request.audit_trail || [];

  const steps = [
    { key: 'created', label: 'Request created', check: () => !!request.created_date },
    { key: 'sent', label: 'Signing link sent to recipient', check: () => !!request.sent_at },
    { key: 'opened', label: 'Client opened signing link', check: () => !!request.opened_at },
    { key: 'signing_started', label: 'Client started signing', check: () => !!request.signing_started_at },
    { key: 'signed', label: 'Client submitted signature', check: () => request.status === 'Signed' },
    { key: 'pdf', label: 'Signed PDF / certificate generated', check: () => !!request.signed_document_url },
    { key: 'status', label: 'Status updated to Signed', check: () => request.status === 'Signed' },
    { key: 'cert_audit', label: 'Certificate recorded in audit trail', check: () => trail.some(e => e.event === 'certificate_generated') },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[85vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b">
          <h3 className="font-bold text-gray-900">Submission Debug Log</h3>
          <button onClick={onClose}><X className="w-5 h-5 text-gray-400" /></button>
        </div>
        <div className="p-5 space-y-2">
          <p className="text-xs text-gray-500 mb-3">Document: <strong>{request.title}</strong></p>
          {steps.map(step => {
            const ok = step.check();
            return (
              <div key={step.key} className={`flex items-center gap-3 p-3 rounded-lg border ${ok ? 'bg-green-50 border-green-100' : 'bg-red-50 border-red-100'}`}>
                <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 text-white text-xs font-bold ${ok ? 'bg-green-500' : 'bg-red-400'}`}>
                  {ok ? '✓' : '✗'}
                </div>
                <span className={`text-xs font-medium ${ok ? 'text-green-800' : 'text-red-700'}`}>{step.label}</span>
              </div>
            );
          })}
          {request.decline_reason && (
            <div className="mt-3 p-3 bg-amber-50 border border-amber-100 rounded-lg">
              <p className="text-xs font-semibold text-amber-700">Decline Reason:</p>
              <p className="text-xs text-amber-800 mt-0.5">{request.decline_reason}</p>
            </div>
          )}
          <div className="mt-4 pt-3 border-t">
            <p className="text-xs font-semibold text-gray-600 mb-2">Raw Audit Trail ({trail.length} events)</p>
            <div className="space-y-1 max-h-48 overflow-y-auto">
              {trail.length === 0 && <p className="text-xs text-gray-400">No audit events recorded</p>}
              {trail.map((e, i) => (
                <div key={i} className="text-xs bg-gray-50 rounded p-2">
                  <span className="font-mono font-bold text-[#B87333]">{e.event}</span>
                  <span className="text-gray-400 ml-2">{e.timestamp ? new Date(e.timestamp).toLocaleString('en-ZA') : ''}</span>
                  {e.error && <span className="text-red-500 block mt-0.5">Error: {e.error}</span>}
                </div>
              ))}
            </div>
          </div>
        </div>
        {request.signed_document_url && (
          <div className="px-5 pb-5">
            <a href={request.signed_document_url} target="_blank" rel="noreferrer">
              <Button size="sm" className="w-full gap-2 bg-[#B87333] hover:bg-[#A06828] text-white">
                <Download className="w-4 h-4" /> Download Signed Certificate
              </Button>
            </a>
          </div>
        )}
      </div>
    </div>
  );
}

function AuditPanel({ request, onClose }) {
  const trail = request.audit_trail || [];
  return (
    <div className="fixed inset-0 z-40 flex justify-end">
      <div className="absolute inset-0 bg-black/20" onClick={onClose} />
      <div className="relative bg-white w-full max-w-md shadow-2xl flex flex-col h-full">
        <div className="flex items-center justify-between p-5 border-b">
          <h3 className="font-bold text-gray-900">Audit Trail</h3>
          <button onClick={onClose}><X className="w-5 h-5 text-gray-400" /></button>
        </div>
        <div className="flex-1 overflow-y-auto p-5 space-y-2">
          <div className="space-y-1 mb-4 text-xs">
            {[
              { label: 'Recipient', value: request.recipient_name + ' — ' + request.recipient_email },
              { label: 'Status', value: request.status },
              { label: 'Sent', value: request.sent_at ? new Date(request.sent_at).toLocaleString('en-ZA') : '—' },
              { label: 'Opened', value: request.opened_at ? new Date(request.opened_at).toLocaleString('en-ZA') : '—' },
              { label: 'Signed', value: request.signed_at ? new Date(request.signed_at).toLocaleString('en-ZA') : '—' },
              { label: 'IP', value: request.signer_ip || '—' },
              { label: 'Device', value: request.signer_device || '—' },
              { label: 'Browser', value: request.signer_browser || '—' },
              { label: 'Sig. Method', value: request.signature_method || '—' },
            ].map(i => (
              <div key={i.label} className="flex justify-between py-1 border-b border-gray-50">
                <span className="text-gray-500">{i.label}</span>
                <span className="font-medium text-gray-800 text-right max-w-[200px] truncate">{i.value}</span>
              </div>
            ))}
          </div>
          <h4 className="text-xs font-semibold text-gray-700 uppercase tracking-wide mb-2">Event Timeline</h4>
          {trail.length === 0 && <p className="text-xs text-gray-400">No events yet</p>}
          {[...trail].reverse().map((event, i) => (
            <div key={i} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
              <div className="w-2 h-2 bg-[#B87333] rounded-full mt-1.5 flex-shrink-0" />
              <div>
                <p className="text-xs font-semibold text-gray-800 capitalize">{event.event?.replace(/_/g, ' ')}</p>
                <p className="text-[10px] text-gray-500">{event.timestamp ? new Date(event.timestamp).toLocaleString('en-ZA') : ''}</p>
                {event.actor && <p className="text-[10px] text-gray-400">by {event.actor}</p>}
                {event.ip && <p className="text-[10px] text-gray-400">IP: {event.ip} · {event.device}</p>}
              </div>
            </div>
          ))}
        </div>
        {request.signature_image_url && (
          <div className="p-4 border-t">
            <p className="text-xs font-semibold text-gray-600 mb-2">Captured Signature</p>
            <img src={request.signature_image_url} alt="Signature" className="max-h-20 border border-gray-200 rounded-lg p-2 bg-white" />
          </div>
        )}
      </div>
    </div>
  );
}

export default function AdminESignatures() {
  const queryClient = useQueryClient();
  const [showNew, setShowNew] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [auditRequest, setAuditRequest] = useState(null);
  const [sendingId, setSendingId] = useState(null);
  const [debugRequest, setDebugRequest] = useState(null);

  const { data: requests = [], isLoading } = useQuery({
    queryKey: ['esignature-requests'],
    queryFn: () => base44.entities.ESignatureRequest.list('-created_date', 300),
  });
  const { data: contacts = [] } = useQuery({ queryKey: ['contacts'], queryFn: () => base44.entities.Contact.list('-created_date', 500) });
  const { data: documents = [] } = useQuery({
    queryKey: ['documents'],
    queryFn: () => base44.entities.Document.list('-created_date', 500),
  });

  const allDocs = documents.filter(d => d.file_url);

  const handleSend = async (req) => {
    setSendingId(req.id);
    const res = await base44.functions.invoke('eSignatureActions', { action: 'send', request_id: req.id });
    setSendingId(null);
    if (res.data?.success) { toast.success('Signing link sent!'); queryClient.invalidateQueries({ queryKey: ['esignature-requests'] }); }
    else toast.error(res.data?.error || 'Failed to send');
  };

  const handleResend = async (req) => {
    setSendingId(req.id);
    const res = await base44.functions.invoke('eSignatureActions', { action: 'resend', request_id: req.id });
    setSendingId(null);
    if (res.data?.success) { toast.success('Signing link resent!'); queryClient.invalidateQueries({ queryKey: ['esignature-requests'] }); }
    else toast.error(res.data?.error || 'Failed to resend');
  };

  const handleCancel = async (req) => {
    if (!window.confirm('Cancel this signing request?')) return;
    await base44.entities.ESignatureRequest.update(req.id, { status: 'Cancelled' });
    queryClient.invalidateQueries({ queryKey: ['esignature-requests'] });
    toast.success('Request cancelled');
  };

  const filtered = requests.filter(r => {
    const q = search.toLowerCase();
    return (!q || r.title?.toLowerCase().includes(q) || r.recipient_name?.toLowerCase().includes(q) || r.recipient_email?.toLowerCase().includes(q))
      && (!statusFilter || r.status === statusFilter);
  });

  const stats = {
    sent: requests.filter(r => ['Sent','Delivered','Opened','Viewed','Signing Started'].includes(r.status)).length,
    signed: requests.filter(r => r.status === 'Signed').length,
    awaiting: requests.filter(r => ['Sent','Opened','Viewed'].includes(r.status)).length,
    expired: requests.filter(r => r.status === 'Expired').length,
    declined: requests.filter(r => r.status === 'Declined').length,
    signedToday: requests.filter(r => r.status === 'Signed' && r.signed_at && new Date(r.signed_at).toDateString() === new Date().toDateString()).length,
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2"><PenTool className="w-6 h-6 text-[#B87333]" /> E-Signature Centre</h1>
            <p className="text-sm text-gray-500 mt-0.5">Send documents for native electronic signing — no third-party required</p>
          </div>
          <Button onClick={() => setShowNew(true)} className="gap-2 bg-[#B87333] hover:bg-[#A06828] text-white">
            <Plus className="w-4 h-4" /> New Signing Request
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
          {[
            { label: 'Sent', value: stats.sent, color: 'text-blue-600', bg: 'bg-blue-50', icon: Send },
            { label: 'Awaiting', value: stats.awaiting, color: 'text-amber-600', bg: 'bg-amber-50', icon: Clock },
            { label: 'Signed Today', value: stats.signedToday, color: 'text-emerald-600', bg: 'bg-emerald-50', icon: CheckCircle },
            { label: 'Total Signed', value: stats.signed, color: 'text-green-600', bg: 'bg-green-50', icon: Shield },
            { label: 'Expired', value: stats.expired, color: 'text-gray-500', bg: 'bg-gray-100', icon: AlertTriangle },
            { label: 'Declined', value: stats.declined, color: 'text-red-600', bg: 'bg-red-50', icon: XCircle },
          ].map(card => {
            const Icon = card.icon;
            return (
              <div key={card.label} className={`${card.bg} rounded-xl border border-gray-100 p-3 flex items-start justify-between`}>
                <div>
                  <p className="text-xs text-gray-500">{card.label}</p>
                  <p className={`text-2xl font-bold mt-1 ${card.color}`}>{card.value}</p>
                </div>
                <Icon className={`w-4 h-4 mt-0.5 ${card.color}`} />
              </div>
            );
          })}
        </div>

        {/* Filters */}
        <div className="flex gap-3 flex-wrap">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input placeholder="Search by title, recipient..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
          </div>
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white">
            <option value="">All Statuses</option>
            {Object.keys(STATUS_COLORS).map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          {isLoading ? (
            <div className="p-12 text-center text-gray-400">Loading...</div>
          ) : filtered.length === 0 ? (
            <div className="p-12 text-center">
              <PenTool className="w-12 h-12 text-gray-200 mx-auto mb-3" />
              <p className="text-gray-500 font-medium">No signing requests yet</p>
              <p className="text-xs text-gray-400 mt-1">Create a new request to send a document for e-signature</p>
              <Button onClick={() => setShowNew(true)} className="mt-4 gap-2 bg-[#B87333] hover:bg-[#A06828] text-white"><Plus className="w-4 h-4" /> New Signing Request</Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>{['Document', 'Recipient', 'Type', 'Status', 'Sent', 'Signed', 'Actions'].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                  ))}</tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filtered.map(req => {
                    const isSigned = req.status === 'Signed';
                    const isExpired = req.status === 'Expired';
                    const canSend = req.status === 'Draft';
                    const canResend = ['Sent','Opened','Viewed','Expired'].includes(req.status);
                    return (
                      <tr key={req.id} className={`hover:bg-gray-50 transition-colors ${isSigned ? 'bg-green-50/20' : ''}`}>
                        <td className="px-4 py-3">
                          <p className="font-medium text-gray-900 truncate max-w-[200px]">{req.title}</p>
                          {req.company_name && <p className="text-xs text-gray-400">{req.company_name}</p>}
                        </td>
                        <td className="px-4 py-3">
                          <p className="text-sm text-gray-700">{req.recipient_name}</p>
                          <p className="text-xs text-gray-400">{req.recipient_email}</p>
                        </td>
                        <td className="px-4 py-3 text-xs text-gray-500">{req.document_category || '—'}</td>
                        <td className="px-4 py-3">
                          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${STATUS_COLORS[req.status] || 'bg-gray-100 text-gray-600'}`}>{req.status}</span>
                          {isExpired && <div className="text-[10px] text-orange-500 mt-0.5 flex items-center gap-1"><Clock className="w-3 h-3" /> Link expired</div>}
                        </td>
                        <td className="px-4 py-3 text-xs text-gray-400">{req.sent_at ? new Date(req.sent_at).toLocaleDateString('en-ZA') : '—'}</td>
                        <td className="px-4 py-3 text-xs">{req.signed_at ? <span className="text-green-700 font-medium">{new Date(req.signed_at).toLocaleDateString('en-ZA')}</span> : '—'}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1">
                            {canSend && (
                              <Button variant="ghost" size="sm" title="Send for signature" disabled={sendingId === req.id} onClick={() => handleSend(req)}>
                                {sendingId === req.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4 text-emerald-600" />}
                              </Button>
                            )}
                            {canResend && (
                              <Button variant="ghost" size="sm" title="Resend signing link" disabled={sendingId === req.id} onClick={() => handleResend(req)}>
                                {sendingId === req.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <RotateCcw className="w-4 h-4 text-blue-500" />}
                              </Button>
                            )}
                            <Button variant="ghost" size="sm" title="Submission debug log" onClick={() => setDebugRequest(req)} className="text-orange-500">
                              <AlertTriangle className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="sm" title="View audit trail" onClick={() => setAuditRequest(req)}>
                              <Activity className="w-4 h-4 text-purple-500" />
                            </Button>
                            {isSigned && req.signed_document_url && (
                              <a href={req.signed_document_url} download={`signed_${req.title}.pdf`}>
                                <Button variant="ghost" size="sm" title="Download certificate"><Download className="w-4 h-4 text-green-600" /></Button>
                              </a>
                            )}
                            {!isSigned && req.file_url && (
                              <a href={req.file_url} target="_blank" rel="noreferrer">
                                <Button variant="ghost" size="sm" title="Preview document"><Eye className="w-4 h-4" /></Button>
                              </a>
                            )}
                            {!['Signed','Cancelled','Archived'].includes(req.status) && (
                              <Button variant="ghost" size="sm" title="Cancel request" onClick={() => handleCancel(req)}>
                                <Ban className="w-4 h-4 text-red-400" />
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {showNew && (
        <NewRequestModal
          contacts={contacts}
          documents={allDocs}
          onClose={() => setShowNew(false)}
          onCreated={() => { queryClient.invalidateQueries({ queryKey: ['esignature-requests'] }); setShowNew(false); }}
        />
      )}

      {auditRequest && <AuditPanel request={auditRequest} onClose={() => setAuditRequest(null)} />}
      {debugRequest && <DebugLogPanel request={debugRequest} onClose={() => setDebugRequest(null)} />}
    </AdminLayout>
  );
}