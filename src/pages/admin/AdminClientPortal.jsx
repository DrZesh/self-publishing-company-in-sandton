import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { platform } from '@/api/platformClient';
import AdminLayout from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Search, Copy, Link2, Trash2, ToggleLeft, ToggleRight, Eye, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

const generateToken = () => Math.random().toString(36).substring(2) + Math.random().toString(36).substring(2);

const SECTIONS = ['quotes', 'invoices', 'projects', 'documents'];

function PortalLinkModal({ contacts, projects, onClose, onSaved }) {
  const [form, setForm] = useState({
    contact_id: '',
    project_id: '',
    email: '',
    allowed_sections: [...SECTIONS],
    expires_in_days: 30,
    send_email: false,
    use_custom_slug: false,
    custom_slug: '',
  });
  const [saving, setSaving] = useState(false);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const toggleSection = (s) => {
    setForm(f => ({
      ...f,
      allowed_sections: f.allowed_sections.includes(s) ? f.allowed_sections.filter(x => x !== s) : [...f.allowed_sections, s],
    }));
  };

  const handleContactChange = (id) => {
    const contact = contacts.find(c => c.id === id);
    setForm(f => ({ ...f, contact_id: id, email: contact?.email || '', project_id: '' }));
  };

  const handleSave = async () => {
    if (!form.contact_id || !form.project_id || !form.email) return;
    if (form.use_custom_slug && !form.custom_slug.trim()) {
      toast.error('Please enter a custom slug or disable custom URL');
      return;
    }
    setSaving(true);
    const expiresAt = new Date(Date.now() + form.expires_in_days * 24 * 60 * 60 * 1000).toISOString();
    const token = form.use_custom_slug ? form.custom_slug.trim().toLowerCase().replace(/[^a-z0-9-]/g, '-') : generateToken();
    
    const access = await platform.entities.ClientPortalAccess.create({
      contact_id: form.contact_id,
      project_id: form.project_id,
      email: form.email,
      access_token: token,
      custom_slug: form.use_custom_slug ? token : null,
      is_active: true,
      expires_at: expiresAt,
      allowed_sections: form.allowed_sections,
      access_count: 0,
    });

    // Send email if requested
    if (form.send_email) {
      const portalUrl = `${window.location.origin}/portal/${access.access_token}`;
      const contact = contacts.find(c => c.id === form.contact_id);
      const project = projects.find(p => p.id === form.project_id);
      
      const emailHtml = `
        <!DOCTYPE html>
        <html>
        <head><meta charset="UTF-8"></head>
        <body style="margin:0;padding:0;background:#F5F5F5;font-family:Helvetica,Arial,sans-serif;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background:#F5F5F5;">
            <tr><td align="center" style="padding:24px 16px;">
              <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#FFFFFF;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
                <tr><td height="10" style="background:linear-gradient(90deg,#B87333,#D4A574);font-size:0;line-height:0;">&nbsp;</td></tr>
                <tr><td align="center" style="padding:32px 0 24px;">
                  <img src="https://media.base44.com/images/public/69fb173eeab1ba78da6eab45/a6ae114da_creativelogo.png" alt="Creative Books SA" width="160" style="max-width:160px;height:auto;display:block;" />
                </td></tr>
                <tr><td style="padding:0 32px 32px;font-size:15px;line-height:1.7;color:#2C2C2C;">
                  <h2 style="font-family:Georgia,serif;font-size:24px;font-weight:700;color:#2C2C2C;margin:0 0 16px 0;">Your Client Portal is Ready</h2>
                  <p style="font-size:15px;color:#2C2C2C;margin:0 0 16px 0;">Dear ${contact?.full_name || 'Client'},</p>
                  <p style="font-size:15px;color:#2C2C2C;margin:0 0 16px 0;">We've created your secure client portal for <strong>${project?.book_title || 'your project'}</strong>. Through this portal, you can:</p>
                  <ul style="font-size:15px;color:#2C2C2C;margin:0 0 24px 0;padding-left:20px;">
                    <li>View and download quotes</li>
                    <li>Access invoices and payment receipts</li>
                    <li>Track your project progress</li>
                    <li>Review and approve documents</li>
                  </ul>
                  <div style="text-align:center;margin:24px 0;">
                    <a href="${portalUrl}" style="display:inline-block;padding:14px 32px;background:#B87333;color:#FFFFFF;text-decoration:none;border-radius:8px;font-weight:600;font-size:15px;">Access Your Portal</a>
                  </div>
                  <p style="font-size:14px;color:#6B6B6B;margin:16px 0 0 0;">This link will expire on ${new Date(expiresAt).toLocaleDateString('en-ZA', { day: 'numeric', month: 'long', year: 'numeric' })}.</p>
                  <p style="font-size:14px;color:#6B6B6B;margin:16px 0 0 0;">If you have any questions, please contact us at <a href="mailto:info@creativebooks.co.za" style="color:#B87333;text-decoration:none;">info@creativebooks.co.za</a> or call <strong>084 230 5393</strong>.</p>
                  <p style="font-size:15px;color:#2C2C2C;margin:24px 0 0 0;">Kind regards,<br><strong>Creative Books SA</strong></p>
                </td></tr>
                <tr><td align="center" style="padding:20px 32px 8px;font-size:13px;color:#6B6B6B;line-height:1.8;">
                  <strong style="color:#2C2C2C;">Creative Books SA</strong><br />
                  Prism Office Park, Fourways, Johannesburg<br />
                  <a href="mailto:info@creativebooks.co.za" style="color:#B87333;text-decoration:none;">info@creativebooks.co.za</a> · 084 230 5393
                </td></tr>
                <tr><td align="center" style="padding:12px 32px 28px;font-size:11px;color:#AAAAAA;">
                  You are receiving this email as part of your publishing journey with Creative Books SA.
                </td></tr>
              </table>
            </td></tr>
          </table>
        </body>
        </html>
      `;

      try {
        await platform.functions.invoke('sendBrandedEmail', {
          to: form.email,
          subject: `Your Client Portal - ${project?.book_title || 'Creative Books SA'}`,
          html: emailHtml,
        });
        toast.success('Portal created and email sent!');
      } catch (err) {
        console.error('Email failed:', err);
        toast.success('Portal created (email failed to send)');
      }
    } else {
      toast.success('Portal link created!');
    }

    setSaving(false);
    onSaved();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-lg font-bold text-gray-900">Create Portal Access</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1 block">Client *</label>
            <select value={form.contact_id} onChange={e => handleContactChange(e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white">
              <option value="">Select client...</option>
              {contacts.map(c => <option key={c.id} value={c.id}>{c.full_name} — {c.email}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1 block">Project *</label>
            <select value={form.project_id} onChange={e => set('project_id', e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white">
              <option value="">Select project...</option>
              {projects.filter(p => p.contact_id === form.contact_id).map(p => (
                <option key={p.id} value={p.id}>{p.book_title}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1 block">Client Email *</label>
            <Input value={form.email} onChange={e => set('email', e.target.value)} placeholder="client@example.com" />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1 block">Expires In (days)</label>
            <Input type="number" value={form.expires_in_days} onChange={e => set('expires_in_days', parseInt(e.target.value))} />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2 block">Allowed Sections</label>
            <div className="grid grid-cols-2 gap-2">
              {SECTIONS.map(s => (
                <button
                  key={s}
                  type="button"
                  onClick={() => toggleSection(s)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-medium transition-colors capitalize ${form.allowed_sections.includes(s) ? 'bg-[#B87333]/10 border-[#B87333] text-[#B87333]' : 'bg-white border-gray-200 text-gray-500'}`}
                >
                  <span className={`w-3 h-3 rounded-full border-2 ${form.allowed_sections.includes(s) ? 'bg-[#B87333] border-[#B87333]' : 'border-gray-400'}`} />
                  {s}
                </button>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
            <input
              type="checkbox"
              id="use_custom_slug"
              checked={form.use_custom_slug}
              onChange={e => set('use_custom_slug', e.target.checked)}
              className="w-4 h-4 text-[#B87333] border-gray-300 rounded focus:ring-[#B87333]"
            />
            <label htmlFor="use_custom_slug" className="text-sm font-medium text-gray-700 cursor-pointer">
              Use custom URL (e.g., /portal/john-doe-book)
            </label>
          </div>
          {form.use_custom_slug && (
            <div>
              <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1 block">Custom Slug *</label>
              <Input 
                value={form.custom_slug} 
                onChange={e => set('custom_slug', e.target.value)} 
                placeholder="john-doe-book" 
                className="font-mono"
              />
              <p className="text-xs text-gray-500 mt-1">Letters, numbers, and hyphens only. Will appear as: /portal/{form.custom_slug || 'your-slug'}</p>
            </div>
          )}
          <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
            <input
              type="checkbox"
              id="send_email"
              checked={form.send_email}
              onChange={e => set('send_email', e.target.checked)}
              className="w-4 h-4 text-[#B87333] border-gray-300 rounded focus:ring-[#B87333]"
            />
            <label htmlFor="send_email" className="text-sm font-medium text-gray-700 cursor-pointer">
              Send portal link via email to client
            </label>
          </div>
        </div>
        <div className="flex gap-3 p-6 border-t">
          <Button variant="outline" onClick={onClose} className="flex-1">Cancel</Button>
          <Button onClick={handleSave} disabled={saving || !form.contact_id || !form.project_id || !form.email || (form.use_custom_slug && !form.custom_slug.trim())} className="flex-1 bg-[#B87333] hover:bg-[#A06828] text-white">
            {saving ? 'Creating...' : (form.send_email ? 'Creating & Sending...' : 'Create Link')}
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function AdminClientPortal() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);

  const { data: accesses = [], isLoading } = useQuery({
    queryKey: ['client_portal_accesses'],
    queryFn: () => platform.entities.ClientPortalAccess.list('-created_date', 200),
  });

  const { data: contacts = [] } = useQuery({
    queryKey: ['contacts'],
    queryFn: () => platform.entities.Contact.list('-created_date', 500),
  });

  const { data: projects = [] } = useQuery({
    queryKey: ['projects'],
    queryFn: () => platform.entities.Project.list('-created_date', 500),
  });

  const toggleAccess = useMutation({
    mutationFn: ({ id, is_active }) => platform.entities.ClientPortalAccess.update(id, { is_active }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['client_portal_accesses'] }),
  });

  const regenerateToken = useMutation({
    mutationFn: (id) => platform.entities.ClientPortalAccess.update(id, { access_token: generateToken(), access_count: 0 }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['client_portal_accesses'] }); toast.success('Token regenerated'); },
  });

  const deleteAccess = useMutation({
    mutationFn: (id) => platform.entities.ClientPortalAccess.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['client_portal_accesses'] }),
  });

  const contactMap = Object.fromEntries(contacts.map(c => [c.id, c]));

  const filtered = accesses.filter(a => {
    const q = search.toLowerCase();
    const contact = contactMap[a.contact_id];
    return !q || a.email?.toLowerCase().includes(q) || contact?.full_name?.toLowerCase().includes(q);
  });

  const getPortalUrl = (token) => `${window.location.origin}/portal/${token}`;

  const copyLink = (token) => {
    navigator.clipboard.writeText(getPortalUrl(token));
    toast.success('Portal link copied!');
  };

  const activeCount = accesses.filter(a => a.is_active).length;
  const expiredCount = accesses.filter(a => a.expires_at && new Date(a.expires_at) < new Date()).length;

  return (
    <AdminLayout>
      <div className="min-h-screen -m-6 p-6 relative" style={{ backgroundImage: `url(https://images.unsplash.com/photo-1614851099511-773084f6911d?w=1600&q=80)`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
        <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, rgba(100,120,200,0.55) 0%, rgba(180,100,200,0.45) 50%, rgba(100,160,220,0.5) 100%)' }} />
      <div className="relative z-10 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white drop-shadow">Client Portal</h1>
            <p className="text-sm text-white/60 mt-0.5">Generate secure access links for clients to view their quotes, invoices, and project status</p>
          </div>
          <button onClick={() => setShowModal(true)} className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white" style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.2)' }}>
            <Plus className="w-4 h-4" /> Create Portal Link
          </button>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-3 gap-4">
          {[{ label: 'Total Links', value: accesses.length, color: 'text-white' }, { label: 'Active', value: activeCount, color: 'text-green-300' }, { label: 'Expired', value: expiredCount, color: 'text-red-300' }].map(k => (
            <div key={k.label} className="rounded-2xl p-4" style={{ background: 'rgba(0,0,0,0.25)', backdropFilter: 'blur(24px)', border: '1px solid rgba(255,255,255,0.15)' }}>
              <p className="text-xs text-white/50 uppercase tracking-widest">{k.label}</p>
              <p className={`text-2xl font-bold mt-1 ${k.color}`}>{k.value}</p>
            </div>
          ))}
        </div>

        {/* Info Banner */}
        <div className="rounded-xl p-4 flex items-start gap-3" style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.15)' }}>
          <Link2 className="w-5 h-5 text-blue-300 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-white">How it works</p>
            <p className="text-sm text-white/60 mt-0.5">Generate a secure link for each client. They can view their own quotes, invoices, project status and documents without logging in. Links expire automatically and can be revoked at any time.</p>
          </div>
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
          <input placeholder="Search by client or email..." value={search} onChange={e => setSearch(e.target.value)} className="w-full rounded-xl pl-9 pr-3 py-2 text-sm text-white placeholder-white/30 outline-none" style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.15)' }} />
        </div>

        {/* Access Links Table */}
        <div className="rounded-2xl overflow-hidden" style={{ background: 'rgba(0,0,0,0.25)', backdropFilter: 'blur(24px)', border: '1px solid rgba(255,255,255,0.15)' }}>
          {isLoading ? (
            <div className="p-12 text-center text-white/40">Loading...</div>
          ) : filtered.length === 0 ? (
            <div className="p-12 text-center text-white/40">No portal links created yet</div>
          ) : (
            <table className="w-full text-sm">
              <thead><tr style={{ background: 'rgba(0,0,0,0.2)', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                {['Client', 'Email', 'Sections', 'Views', 'Expires', 'Status', 'Actions'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-white/40 uppercase tracking-wide">{h}</th>
                ))}
              </tr></thead>
              <tbody>
                {filtered.map(access => {
                  const contact = contactMap[access.contact_id];
                  const isExpired = access.expires_at && new Date(access.expires_at) < new Date();
                  const isCustom = !!access.custom_slug;
                  return (
                    <tr key={access.id} className={`border-b border-white/5 hover:bg-white/5 transition-colors ${isExpired ? 'opacity-60' : ''}`}>
                      <td className="px-4 py-3 font-medium text-white">{contact?.full_name || '—'}</td>
                      <td className="px-4 py-3 text-white/50">{access.email}</td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-1">
                          {(access.allowed_sections || []).map(s => (
                            <span key={s} className="px-1.5 py-0.5 bg-white/10 text-white/60 rounded text-xs capitalize">{s}</span>
                          ))}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-white/50">{access.access_count || 0}</td>
                      <td className="px-4 py-3 text-xs text-white/50">
                        {access.expires_at ? (
                          <span className={isExpired ? 'text-red-300 font-medium' : ''}>
                            {new Date(access.expires_at).toLocaleDateString('en-ZA')}
                            {isExpired && ' (expired)'}
                          </span>
                        ) : '—'}
                      </td>
                      <td className="px-4 py-3">
                        <button onClick={() => toggleAccess.mutate({ id: access.id, is_active: !access.is_active })} className="flex items-center gap-1 text-xs font-medium">
                          {access.is_active ? <ToggleRight className="w-5 h-5 text-green-400" /> : <ToggleLeft className="w-5 h-5 text-white/30" />}
                          <span className={access.is_active ? 'text-green-300' : 'text-white/30'}>{access.is_active ? 'Active' : 'Inactive'}</span>
                        </button>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="flex flex-col">
                            <span className="text-xs font-mono text-white/50">{isCustom ? `/${access.custom_slug}` : 'Auto token'}</span>
                            {isCustom && <span className="text-[10px] text-green-300 font-medium">Custom URL</span>}
                          </div>
                          <div className="flex items-center gap-1">
                            <button className="p-1.5 hover:bg-white/10 rounded-lg" title="Copy link" onClick={() => copyLink(access.access_token)}><Copy className="w-4 h-4 text-white/40" /></button>
                            <a href={getPortalUrl(access.access_token)} target="_blank" rel="noreferrer"><button className="p-1.5 hover:bg-white/10 rounded-lg"><Eye className="w-4 h-4 text-white/40" /></button></a>
                            <button className="p-1.5 hover:bg-white/10 rounded-lg" title="Regenerate token" onClick={() => regenerateToken.mutate(access.id)}><RefreshCw className="w-4 h-4 text-blue-300" /></button>
                            <button className="p-1.5 hover:bg-white/10 rounded-lg" title="Delete" onClick={() => { if (window.confirm('Delete this portal link?')) deleteAccess.mutate(access.id); }}><Trash2 className="w-4 h-4 text-red-300" /></button>
                          </div>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
      </div>

      {showModal && (
        <PortalLinkModal
          contacts={contacts}
          projects={projects}
          onClose={() => setShowModal(false)}
          onSaved={() => { queryClient.invalidateQueries({ queryKey: ['client_portal_accesses'] }); setShowModal(false); }}
        />
      )}
    </AdminLayout>
  );
}