import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { platform } from '@/api/platformClient';
import AdminLayout from '@/components/admin/AdminLayout';
import ClientModal from '@/components/admin/clients/ClientModal';
import ClientDocuments from '@/components/admin/clients/ClientDocuments';
import { Search, Plus, ChevronRight, ArrowLeft, Mail, Phone, Building2, MapPin, Hash, User, Edit2, BanIcon } from 'lucide-react';
import { toast } from 'sonner';

const LIFECYCLE_COLORS = {
  subscriber: 'bg-blue-100 text-blue-700',
  lead: 'bg-amber-100 text-amber-700',
  customer: 'bg-emerald-100 text-emerald-700',
  repeat_customer: 'bg-[#B87333]/10 text-[#B87333]',
  past_customer: 'bg-black/5 text-black/50',
};

function InfoRow({ icon: Icon, label, value }) {
  if (!value) return null;
  return (
    <div className="flex items-start gap-3 py-2.5 border-b border-black/5 last:border-0">
      <Icon className="w-4 h-4 text-[#B87333] mt-0.5 shrink-0" />
      <div>
        <div className="text-xs text-black/40 font-semibold">{label}</div>
        <div className="text-sm text-[#1A1208] font-medium">{value}</div>
      </div>
    </div>
  );
}

export default function AdminClients() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingClient, setEditingClient] = useState(null);
  const [selectedClient, setSelectedClient] = useState(null);

  const { data: clients = [], isLoading } = useQuery({
    queryKey: ['clients'],
    queryFn: () => platform.entities.Contact.list('-created_date', 500),
  });

  const filtered = clients.filter(c => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      c.full_name?.toLowerCase().includes(q) ||
      c.email?.toLowerCase().includes(q) ||
      c.company?.toLowerCase().includes(q) ||
      c.contact_person?.toLowerCase().includes(q)
    );
  });

  const handleSave = async (data) => {
    if (editingClient?.id) {
      await platform.entities.Contact.update(editingClient.id, data);
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      if (selectedClient?.id === editingClient.id) setSelectedClient({ ...selectedClient, ...data });
      toast.success('Client updated');
    } else {
      await platform.entities.Contact.create({ ...data, lifecycle_stage: data.lifecycle_stage || 'customer' });
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      toast.success('Client created');
    }
    setShowModal(false);
    setEditingClient(null);
  };

  const handleDisableToggle = async (client) => {
    const newVal = !client.is_disabled;
    const action = newVal ? 'Disable' : 'Enable';
    if (!confirm(`${action} this client?`)) return;

    // Check for linked documents before allowing hard delete (we only disable)
    await platform.entities.Contact.update(client.id, { is_disabled: newVal });
    queryClient.invalidateQueries({ queryKey: ['clients'] });
    if (selectedClient?.id === client.id) setSelectedClient({ ...selectedClient, is_disabled: newVal });
    toast.success(`Client ${newVal ? 'disabled' : 're-enabled'}`);
  };

  const openEdit = (client) => {
    setEditingClient(client);
    setShowModal(true);
  };

  // Detail view
  if (selectedClient) {
    return (
      <AdminLayout>
        <div className="max-w-4xl mx-auto">
          <button onClick={() => setSelectedClient(null)}
            className="flex items-center gap-2 text-sm text-black/50 hover:text-[#B87333] mb-5 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Clients
          </button>

          {/* Header */}
          <div className={`bg-white rounded-2xl border shadow-sm p-6 mb-5 flex items-start justify-between gap-4 ${selectedClient.is_disabled ? 'border-red-200 bg-red-50/30' : 'border-black/8'}`}>
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-[#B87333]/15 flex items-center justify-center text-2xl font-bold text-[#B87333]">
                {selectedClient.full_name?.[0]?.toUpperCase()}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-bold text-[#1A1208]">{selectedClient.full_name}</h1>
                  {selectedClient.is_disabled && (
                    <span className="px-2 py-0.5 bg-red-100 text-red-600 rounded-full text-xs font-semibold">Disabled</span>
                  )}
                </div>
                <div className="flex flex-wrap items-center gap-2 mt-1.5">
                  {selectedClient.email && <a href={`mailto:${selectedClient.email}`} className="text-sm text-[#B87333] hover:underline">{selectedClient.email}</a>}
                  {selectedClient.phone && <span className="text-sm text-black/50">{selectedClient.phone}</span>}
                  {selectedClient.lifecycle_stage && (
                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold capitalize ${LIFECYCLE_COLORS[selectedClient.lifecycle_stage] || 'bg-black/5 text-black/50'}`}>
                      {selectedClient.lifecycle_stage.replace(/_/g, ' ')}
                    </span>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button onClick={() => openEdit(selectedClient)}
                className="flex items-center gap-1.5 px-3 py-2 border border-black/15 text-black/60 rounded-xl text-sm font-semibold hover:bg-black/5">
                <Edit2 className="w-4 h-4" /> Edit
              </button>
              <button onClick={() => handleDisableToggle(selectedClient)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold border transition-colors ${selectedClient.is_disabled ? 'border-green-200 text-green-700 hover:bg-green-50' : 'border-red-200 text-red-600 hover:bg-red-50'}`}>
                <BanIcon className="w-4 h-4" />
                {selectedClient.is_disabled ? 'Re-enable' : 'Disable'}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
            {/* Client Info */}
            <div className="bg-white rounded-2xl border border-black/8 shadow-sm p-5">
              <h2 className="text-xs font-bold text-black/40 uppercase tracking-wide mb-3">Client Details</h2>
              <InfoRow icon={Mail} label="Email" value={selectedClient.email} />
              <InfoRow icon={Phone} label="Phone" value={selectedClient.phone} />
              <InfoRow icon={User} label="Contact Person" value={selectedClient.contact_person} />
              <InfoRow icon={Building2} label="Company" value={selectedClient.company} />
              <InfoRow icon={Hash} label="VAT Number" value={selectedClient.vat_number} />
              <InfoRow icon={MapPin} label="Billing Address" value={selectedClient.billing_address} />
            </div>

            {/* Notes */}
            <div className="bg-white rounded-2xl border border-black/8 shadow-sm p-5">
              <h2 className="text-xs font-bold text-black/40 uppercase tracking-wide mb-3">Notes</h2>
              <p className="text-sm text-black/60 whitespace-pre-wrap">{selectedClient.description || 'No notes.'}</p>
            </div>
          </div>

          {/* Linked Documents */}
          <ClientDocuments contactId={selectedClient.id} />
        </div>

        {showModal && (
          <ClientModal client={editingClient} onClose={() => { setShowModal(false); setEditingClient(null); }} onSave={handleSave} />
        )}
      </AdminLayout>
    );
  }

  // List view
  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-[#1A1208]">Clients</h1>
            <p className="text-sm text-black/50 mt-0.5">{clients.length} total clients</p>
          </div>
          <button onClick={() => { setEditingClient(null); setShowModal(true); }}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#B87333] text-white rounded-xl text-sm font-semibold hover:bg-[#a06428] transition-colors">
            <Plus className="w-4 h-4" /> New Client
          </button>
        </div>

        <div className="relative mb-5">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-black/30" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search by name, email, company or contact person…"
            className="w-full pl-9 pr-4 py-2.5 border border-black/10 rounded-xl text-sm focus:outline-none focus:border-[#B87333] bg-white" />
        </div>

        {isLoading ? (
          <div className="space-y-2">{[...Array(5)].map((_, i) => <div key={i} className="h-16 bg-black/5 rounded-xl animate-pulse" />)}</div>
        ) : filtered.length === 0 ? (
          <div className="py-20 text-center">
            <div className="text-4xl mb-3">👤</div>
            <p className="text-sm font-semibold text-black/50">No clients found</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-black/8 shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[#F9F7F2] border-b border-black/8">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-black/40 uppercase tracking-wide">Client</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-black/40 uppercase tracking-wide hidden md:table-cell">Contact Person</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-black/40 uppercase tracking-wide hidden lg:table-cell">Company</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-black/40 uppercase tracking-wide hidden sm:table-cell">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-black/40 uppercase tracking-wide hidden xl:table-cell">VAT No.</th>
                  <th className="px-4 py-3 w-8" />
                </tr>
              </thead>
              <tbody>
                {filtered.map(c => (
                  <tr key={c.id}
                    onClick={() => setSelectedClient(c)}
                    className={`border-b border-black/5 cursor-pointer transition-colors ${c.is_disabled ? 'opacity-50 bg-red-50/30 hover:bg-red-50/50' : 'hover:bg-[#faf8f4]'}`}>
                    <td className="px-4 py-3">
                      <p className="font-semibold text-[#1A1208]">{c.full_name} {c.is_disabled && <span className="text-xs text-red-500 ml-1">(disabled)</span>}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <Mail className="w-3 h-3 text-black/30" />
                        <span className="text-xs text-black/40 truncate max-w-[180px]">{c.email}</span>
                        {c.phone && <><Phone className="w-3 h-3 text-black/30 ml-1" /><span className="text-xs text-black/40">{c.phone}</span></>}
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell text-xs text-black/60">{c.contact_person || '—'}</td>
                    <td className="px-4 py-3 hidden lg:table-cell text-xs text-black/60">{c.company || '—'}</td>
                    <td className="px-4 py-3 hidden sm:table-cell">
                      <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold ${LIFECYCLE_COLORS[c.lifecycle_stage] || 'bg-black/5 text-black/50'}`}>
                        {c.lifecycle_stage?.replace(/_/g, ' ') || '—'}
                      </span>
                    </td>
                    <td className="px-4 py-3 hidden xl:table-cell text-xs text-black/50 font-mono">{c.vat_number || '—'}</td>
                    <td className="px-4 py-3"><ChevronRight className="w-4 h-4 text-black/20" /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && (
        <ClientModal client={editingClient} onClose={() => { setShowModal(false); setEditingClient(null); }} onSave={handleSave} />
      )}
    </AdminLayout>
  );
}