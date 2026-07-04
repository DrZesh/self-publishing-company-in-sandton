import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/api/supabaseClient';
import AdminLayout from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Search, Copy, Link2, Trash2, ToggleLeft, ToggleRight, Eye, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

const SECTIONS = ['quotes', 'invoices', 'projects', 'documents'];

async function listPortalAccesses() {
  const { data, error } = await supabase
    .from('client_portal_access')
    .select('*')
    .order('created_date', { ascending: false })
    .limit(200);
  if (error) throw error;
  return data || [];
}

async function listContacts() {
  const { data, error } = await supabase
    .from('contacts')
    .select('id, full_name, email')
    .order('created_date', { ascending: false })
    .limit(500);
  if (error) throw error;
  return data || [];
}

function PortalLinkModal({ contacts, onClose, onSaved }) {
  const [form, setForm] = useState({
    contact_id: '',
    email: '',
    allowed_sections: [...SECTIONS],
    expires_in_days: 30,
  });
  const [saving, setSaving] = useState(false);

  const set = (key, value) => setForm(current => ({ ...current, [key]: value }));

  const toggleSection = section => {
    setForm(current => ({
      ...current,
      allowed_sections: current.allowed_sections.includes(section)
        ? current.allowed_sections.filter(item => item !== section)
        : [...current.allowed_sections, section],
    }));
  };

  const handleContactChange = id => {
    const contact = contacts.find(item => item.id === id);
    setForm(current => ({ ...current, contact_id: id, email: contact?.email || '' }));
  };

  const handleSave = async () => {
    if (!form.contact_id || !form.email) return;

    setSaving(true);
    try {
      const days = Math.max(1, Number(form.expires_in_days) || 30);
      const expiresAt = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString();
      const { error } = await supabase.from('client_portal_access').insert({
        contact_id: form.contact_id,
        email: form.email.trim().toLowerCase(),
        is_active: true,
        expires_at: expiresAt,
        allowed_sections: form.allowed_sections,
        access_count: 0,
      });
      if (error) throw error;
      onSaved();
    } catch (error) {
      toast.error(error.message || 'Failed to create portal link');
    } finally {
      setSaving(false);
    }
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
            <select value={form.contact_id} onChange={event => handleContactChange(event.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white">
              <option value="">Select client...</option>
              {contacts.map(contact => <option key={contact.id} value={contact.id}>{contact.full_name} — {contact.email}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1 block">Client Email *</label>
            <Input value={form.email} onChange={event => set('email', event.target.value)} placeholder="client@example.com" />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1 block">Expires In (days)</label>
            <Input type="number" min="1" value={form.expires_in_days} onChange={event => set('expires_in_days', Number.parseInt(event.target.value, 10))} />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2 block">Allowed Sections</label>
            <div className="grid grid-cols-2 gap-2">
              {SECTIONS.map(section => (
                <button
                  key={section}
                  type="button"
                  onClick={() => toggleSection(section)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-medium transition-colors capitalize ${form.allowed_sections.includes(section) ? 'bg-[#B87333]/10 border-[#B87333] text-[#B87333]' : 'bg-white border-gray-200 text-gray-500'}`}
                >
                  <span className={`w-3 h-3 rounded-full border-2 ${form.allowed_sections.includes(section) ? 'bg-[#B87333] border-[#B87333]' : 'border-gray-400'}`} />
                  {section}
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
    queryFn: listPortalAccesses,
  });

  const { data: contacts = [] } = useQuery({
    queryKey: ['contacts'],
    queryFn: listContacts,
  });

  const toggleAccess = useMutation({
    mutationFn: async ({ id, is_active }) => {
      const { error } = await supabase.from('client_portal_access').update({ is_active }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['client_portal_accesses'] }),
    onError: error => toast.error(error.message || 'Failed to update portal access'),
  });

  const regenerateToken = useMutation({
    mutationFn: async id => {
      const { error } = await supabase.rpc('regenerate_client_portal_token', { p_access_id: id });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['client_portal_accesses'] });
      toast.success('Token regenerated');
    },
    onError: error => toast.error(error.message || 'Failed to regenerate token'),
  });

  const deleteAccess = useMutation({
    mutationFn: async id => {
      const { error } = await supabase.from('client_portal_access').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['client_portal_accesses'] }),
    onError: error => toast.error(error.message || 'Failed to delete portal link'),
  });

  const contactMap = Object.fromEntries(contacts.map(contact => [contact.id, contact]));

  const filtered = accesses.filter(access => {
    const query = search.toLowerCase();
    const contact = contactMap[access.contact_id];
    return !query || access.email?.toLowerCase().includes(query) || contact?.full_name?.toLowerCase().includes(query);
  });

  const getPortalUrl = accessToken => `${window.location.origin}/portal/${accessToken}`;

  const copyLink = async accessToken => {
    await navigator.clipboard.writeText(getPortalUrl(accessToken));
    toast.success('Portal link copied!');
  };

  const activeCount = accesses.filter(access => access.is_active).length;
  const expiredCount = accesses.filter(access => access.expires_at && new Date(access.expires_at) < new Date()).length;

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

        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start gap-3">
          <Link2 className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-blue-800">How it works</p>
            <p className="text-sm text-blue-700 mt-0.5">Generate a secure link for each client. They can view their own quotes, invoices, project status and documents without logging in. Links expire automatically and can be revoked at any time.</p>
          </div>
        </div>

        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input placeholder="Search by client or email..." value={search} onChange={event => setSearch(event.target.value)} className="pl-9" />
        </div>

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
                  {['Client', 'Email', 'Sections', 'Views', 'Expires', 'Status', 'Actions'].map(header => (
                    <th key={header} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">{header}</th>
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
                          {(access.allowed_sections || []).map(section => (
                            <span key={section} className="px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded text-xs capitalize">{section}</span>
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
          onSaved={() => {
            queryClient.invalidateQueries({ queryKey: ['client_portal_accesses'] });
            setShowModal(false);
          }}
        />
      )}
    </AdminLayout>
  );
}
