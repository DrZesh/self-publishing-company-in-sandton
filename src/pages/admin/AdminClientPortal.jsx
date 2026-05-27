import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import AdminLayout from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Search, Copy, Link2, Trash2, ToggleLeft, ToggleRight, Eye, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

const generateToken = () => Math.random().toString(36).substring(2) + Math.random().toString(36).substring(2);

const SECTIONS = ['quotes', 'invoices', 'projects', 'documents'];

function PortalLinkModal({ contacts, onClose, onSaved }) {
  const [form, setForm] = useState({
    contact_id: '',
    email: '',
    allowed_sections: [...SECTIONS],
    expires_in_days: 30,
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
    setForm(f => ({ ...f, contact_id: id, email: contact?.email || '' }));
  };

  const handleSave = async () => {
    if (!form.contact_id || !form.email) return;
    setSaving(true);
    const expiresAt = new Date(Date.now() + form.expires_in_days * 24 * 60 * 60 * 1000).toISOString();
    await base44.entities.ClientPortalAccess.create({
      contact_id: form.contact_id,
      email: form.email,
      access_token: generateToken(),
      is_active: true,
      expires_at: expiresAt,
      allowed_sections: form.allowed_sections,
      access_count: 0,
    });
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
        </div>
        <div className="flex gap-3 p-6 border-t">
          <Button variant="outline" onClick={onClose} className="flex-1">Cancel</Button>
          <Button onClick={handleSave} disabled={saving || !form.contact_id || !form.email} className="flex-1 bg-[#B87333] hover:bg-[#A06828] text-white">
            {saving ? 'Creating...' : 'Create Link'}
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
    queryFn: () => base44.entities.ClientPortalAccess.list('-created_date', 200),
  });

  const { data: contacts = [] } = useQuery({
    queryKey: ['contacts'],
    queryFn: () => base44.entities.Contact.list('-created_date', 500),
  });

  const toggleAccess = useMutation({
    mutationFn: ({ id, is_active }) => base44.entities.ClientPortalAccess.update(id, { is_active }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['client_portal_accesses'] }),
  });

  const regenerateToken = useMutation({
    mutationFn: (id) => base44.entities.ClientPortalAccess.update(id, { access_token: generateToken(), access_count: 0 }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['client_portal_accesses'] }); toast.success('Token regenerated'); },
  });

  const deleteAccess = useMutation({
    mutationFn: (id) => base44.entities.ClientPortalAccess.delete(id),
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
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Client Portal</h1>
            <p className="text-sm text-gray-500 mt-0.5">Generate secure access links for clients to view their quotes, invoices, and project status</p>
          </div>
          <Button onClick={() => setShowModal(true)} className="gap-2 bg-[#B87333] hover:bg-[#A06828] text-white">
            <Plus className="w-4 h-4" /> Create Portal Link
          </Button>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white rounded-xl border border-gray-100 p-4">
            <p className="text-xs text-gray-500">Total Links</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{accesses.length}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 p-4">
            <p className="text-xs text-gray-500">Active</p>
            <p className="text-2xl font-bold text-green-600 mt-1">{activeCount}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 p-4">
            <p className="text-xs text-gray-500">Expired</p>
            <p className="text-2xl font-bold text-red-500 mt-1">{expiredCount}</p>
          </div>
        </div>

        {/* Info Banner */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start gap-3">
          <Link2 className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-blue-800">How it works</p>
            <p className="text-sm text-blue-700 mt-0.5">Generate a secure link for each client. They can view their own quotes, invoices, project status and documents without logging in. Links expire automatically and can be revoked at any time.</p>
          </div>
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input placeholder="Search by client or email..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
        </div>

        {/* Access Links Table */}
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          {isLoading ? (
            <div className="p-12 text-center text-gray-400">Loading...</div>
          ) : filtered.length === 0 ? (
            <div className="p-12 text-center">
              <Link2 className="w-10 h-10 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No portal links created yet</p>
              <p className="text-sm text-gray-400 mt-1">Create your first secure client link above</p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  {['Client', 'Email', 'Sections', 'Views', 'Expires', 'Status', 'Actions'].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map(access => {
                  const contact = contactMap[access.contact_id];
                  const isExpired = access.expires_at && new Date(access.expires_at) < new Date();
                  return (
                    <tr key={access.id} className={`hover:bg-gray-50 transition-colors ${isExpired ? 'opacity-60' : ''}`}>
                      <td className="px-4 py-3 font-medium text-gray-900">{contact?.full_name || '—'}</td>
                      <td className="px-4 py-3 text-gray-500">{access.email}</td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-1">
                          {(access.allowed_sections || []).map(s => (
                            <span key={s} className="px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded text-xs capitalize">{s}</span>
                          ))}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-500">{access.access_count || 0}</td>
                      <td className="px-4 py-3 text-xs text-gray-500">
                        {access.expires_at ? (
                          <span className={isExpired ? 'text-red-500 font-medium' : ''}>
                            {new Date(access.expires_at).toLocaleDateString('en-ZA')}
                            {isExpired && ' (expired)'}
                          </span>
                        ) : '—'}
                      </td>
                      <td className="px-4 py-3">
                        <button onClick={() => toggleAccess.mutate({ id: access.id, is_active: !access.is_active })} className="flex items-center gap-1 text-xs font-medium">
                          {access.is_active ? <ToggleRight className="w-5 h-5 text-green-500" /> : <ToggleLeft className="w-5 h-5 text-gray-400" />}
                          <span className={access.is_active ? 'text-green-600' : 'text-gray-400'}>{access.is_active ? 'Active' : 'Inactive'}</span>
                        </button>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <Button variant="ghost" size="sm" title="Copy link" onClick={() => copyLink(access.access_token)}>
                            <Copy className="w-4 h-4" />
                          </Button>
                          <a href={getPortalUrl(access.access_token)} target="_blank" rel="noreferrer">
                            <Button variant="ghost" size="sm" title="Preview"><Eye className="w-4 h-4" /></Button>
                          </a>
                          <Button variant="ghost" size="sm" title="Regenerate token" onClick={() => regenerateToken.mutate(access.id)}>
                            <RefreshCw className="w-4 h-4 text-blue-400" />
                          </Button>
                          <Button variant="ghost" size="sm" title="Delete" onClick={() => { if (window.confirm('Delete this portal link?')) deleteAccess.mutate(access.id); }}>
                            <Trash2 className="w-4 h-4 text-red-400" />
                          </Button>
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

      {showModal && (
        <PortalLinkModal
          contacts={contacts}
          onClose={() => setShowModal(false)}
          onSaved={() => { queryClient.invalidateQueries({ queryKey: ['client_portal_accesses'] }); setShowModal(false); }}
        />
      )}
    </AdminLayout>
  );
}