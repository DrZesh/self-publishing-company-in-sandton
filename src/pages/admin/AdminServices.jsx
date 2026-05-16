import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import AdminLayout from '@/components/admin/AdminLayout';
import { Plus, ChevronRight, X, Search, ToggleLeft, ToggleRight } from 'lucide-react';
import { toast } from 'sonner';

const CATEGORIES = ['printing', 'editing', 'design', 'writing', 'publishing', 'other'];
const PRICING_TYPES = ['fixed', 'per_page', 'per_word', 'per_copy', 'per_colour_page', 'custom'];

const CATEGORY_COLORS = {
  printing: 'bg-blue-100 text-blue-700',
  editing: 'bg-purple-100 text-purple-700',
  design: 'bg-pink-100 text-pink-700',
  writing: 'bg-amber-100 text-amber-700',
  publishing: 'bg-emerald-100 text-emerald-700',
  other: 'bg-gray-100 text-gray-600',
};

function ServiceModal({ service, onClose, onSave, onDelete }) {
  const [form, setForm] = useState({
    category: service?.category || 'printing',
    serviceName: service?.serviceName || '',
    packageName: service?.packageName || '',
    description: service?.description || '',
    pricingType: service?.pricingType || 'fixed',
    price: service?.price || '',
    basePrice: service?.basePrice || '',
    quantity: service?.quantity || '',
    pageCountMin: service?.pageCountMin || '',
    pageCountMax: service?.pageCountMax || '',
    wordCountMin: service?.wordCountMin || '',
    wordCountMax: service?.wordCountMax || '',
    copyQuantityMin: service?.copyQuantityMin || '',
    copyQuantityMax: service?.copyQuantityMax || '',
    bookSizeCondition: service?.bookSizeCondition || '',
    addOnCondition: service?.addOnCondition || '',
    notes: service?.notes || '',
    active: service?.active !== false,
  });
  const [saving, setSaving] = useState(false);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSave = async () => {
    if (!form.serviceName) return toast.error('Service name is required');
    setSaving(true);
    const data = {
      ...form,
      price: form.price !== '' ? Number(form.price) : undefined,
      basePrice: form.basePrice !== '' ? Number(form.basePrice) : undefined,
      quantity: form.quantity !== '' ? Number(form.quantity) : undefined,
      pageCountMin: form.pageCountMin !== '' ? Number(form.pageCountMin) : undefined,
      pageCountMax: form.pageCountMax !== '' ? Number(form.pageCountMax) : undefined,
      wordCountMin: form.wordCountMin !== '' ? Number(form.wordCountMin) : undefined,
      wordCountMax: form.wordCountMax !== '' ? Number(form.wordCountMax) : undefined,
      copyQuantityMin: form.copyQuantityMin !== '' ? Number(form.copyQuantityMin) : undefined,
      copyQuantityMax: form.copyQuantityMax !== '' ? Number(form.copyQuantityMax) : undefined,
    };
    await onSave(data);
    setSaving(false);
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="sticky top-0 bg-white border-b border-black/8 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-[#1A1208]">{service ? 'Edit Service' : 'New Service'}</h2>
          <button onClick={onClose} className="p-2 hover:bg-black/5 rounded-lg"><X className="w-5 h-5" /></button>
        </div>
        <div className="p-6 space-y-5">

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-black/50 uppercase tracking-wide mb-1.5">Category *</label>
              <select value={form.category} onChange={e => set('category', e.target.value)}
                className="w-full px-3 py-2.5 border border-black/15 rounded-xl text-sm focus:outline-none focus:border-[#B87333]">
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="flex items-end gap-3">
              <label className="text-sm font-medium text-[#1A1208]">Active</label>
              <button onClick={() => set('active', !form.active)} className="ml-auto">
                {form.active
                  ? <ToggleRight className="w-8 h-8 text-emerald-500" />
                  : <ToggleLeft className="w-8 h-8 text-black/30" />}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-black/50 uppercase tracking-wide mb-1.5">Service Name *</label>
              <input value={form.serviceName} onChange={e => set('serviceName', e.target.value)}
                placeholder="e.g. Book Printing" className="w-full px-3 py-2.5 border border-black/15 rounded-xl text-sm focus:outline-none focus:border-[#B87333]" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-black/50 uppercase tracking-wide mb-1.5">Package Name</label>
              <input value={form.packageName} onChange={e => set('packageName', e.target.value)}
                placeholder="e.g. Starter Pack" className="w-full px-3 py-2.5 border border-black/15 rounded-xl text-sm focus:outline-none focus:border-[#B87333]" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-black/50 uppercase tracking-wide mb-1.5">Description</label>
            <textarea value={form.description} onChange={e => set('description', e.target.value)} rows={2}
              className="w-full px-3 py-2.5 border border-black/15 rounded-xl text-sm focus:outline-none focus:border-[#B87333]" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-black/50 uppercase tracking-wide mb-1.5">Pricing Type *</label>
              <select value={form.pricingType} onChange={e => set('pricingType', e.target.value)}
                className="w-full px-3 py-2.5 border border-black/15 rounded-xl text-sm focus:outline-none focus:border-[#B87333]">
                {PRICING_TYPES.map(t => <option key={t} value={t}>{t.replace(/_/g, ' ')}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-black/50 uppercase tracking-wide mb-1.5">
                {form.pricingType === 'fixed' ? 'Price (R)' : 'Base Price (R)'}
              </label>
              <input type="number" value={form.pricingType === 'fixed' ? form.price : form.basePrice}
                onChange={e => set(form.pricingType === 'fixed' ? 'price' : 'basePrice', e.target.value)}
                placeholder="0.00" className="w-full px-3 py-2.5 border border-black/15 rounded-xl text-sm focus:outline-none focus:border-[#B87333]" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-black/50 uppercase tracking-wide mb-1.5">Book Size</label>
              <input value={form.bookSizeCondition} onChange={e => set('bookSizeCondition', e.target.value)}
                placeholder="A5, 6x9, any…" className="w-full px-3 py-2.5 border border-black/15 rounded-xl text-sm focus:outline-none focus:border-[#B87333]" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-black/50 uppercase tracking-wide mb-1.5">Quantity</label>
              <input type="number" value={form.quantity} onChange={e => set('quantity', e.target.value)}
                placeholder="e.g. 50" className="w-full px-3 py-2.5 border border-black/15 rounded-xl text-sm focus:outline-none focus:border-[#B87333]" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-black/50 uppercase tracking-wide mb-1.5">Page Count (min–max)</label>
              <div className="flex gap-2">
                <input type="number" value={form.pageCountMin} onChange={e => set('pageCountMin', e.target.value)} placeholder="Min"
                  className="w-full px-3 py-2.5 border border-black/15 rounded-xl text-sm focus:outline-none focus:border-[#B87333]" />
                <input type="number" value={form.pageCountMax} onChange={e => set('pageCountMax', e.target.value)} placeholder="Max"
                  className="w-full px-3 py-2.5 border border-black/15 rounded-xl text-sm focus:outline-none focus:border-[#B87333]" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-black/50 uppercase tracking-wide mb-1.5">Copy Qty (min–max)</label>
              <div className="flex gap-2">
                <input type="number" value={form.copyQuantityMin} onChange={e => set('copyQuantityMin', e.target.value)} placeholder="Min"
                  className="w-full px-3 py-2.5 border border-black/15 rounded-xl text-sm focus:outline-none focus:border-[#B87333]" />
                <input type="number" value={form.copyQuantityMax} onChange={e => set('copyQuantityMax', e.target.value)} placeholder="Max"
                  className="w-full px-3 py-2.5 border border-black/15 rounded-xl text-sm focus:outline-none focus:border-[#B87333]" />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-black/50 uppercase tracking-wide mb-1.5">Notes</label>
            <textarea value={form.notes} onChange={e => set('notes', e.target.value)} rows={2}
              placeholder="Additional pricing notes or conditions…"
              className="w-full px-3 py-2.5 border border-black/15 rounded-xl text-sm focus:outline-none focus:border-[#B87333]" />
          </div>

          <div className="flex gap-3 pt-2">
            <button onClick={handleSave} disabled={saving}
              className="flex-1 py-3 bg-[#B87333] text-white rounded-xl font-semibold text-sm hover:bg-[#a06428] disabled:opacity-50 transition-colors">
              {saving ? 'Saving…' : service ? 'Save Changes' : 'Create Service'}
            </button>
            {service && (
              <button onClick={() => onDelete(service.id)} className="px-4 py-3 text-red-600 border border-red-200 rounded-xl hover:bg-red-50 text-sm font-semibold">Delete</button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AdminServices() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [modalService, setModalService] = useState(null);

  useEffect(() => {
    base44.entities.Service.list('category', 500).then(setServices).finally(() => setLoading(false));
  }, []);

  const filtered = services.filter(s => {
    if (catFilter !== 'all' && s.category !== catFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      return s.serviceName?.toLowerCase().includes(q) || s.packageName?.toLowerCase().includes(q) || s.description?.toLowerCase().includes(q);
    }
    return true;
  });

  const handleSave = async (data) => {
    if (modalService?.id) {
      await base44.entities.Service.update(modalService.id, data);
      setServices(prev => prev.map(s => s.id === modalService.id ? { ...s, ...data } : s));
      toast.success('Service updated');
    } else {
      const created = await base44.entities.Service.create(data);
      setServices(prev => [...prev, created]);
      toast.success('Service created');
    }
    setShowModal(false);
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this service/pricing entry?')) return;
    await base44.entities.Service.delete(id);
    setServices(prev => prev.filter(s => s.id !== id));
    setShowModal(false);
    toast.success('Service deleted');
  };

  const handleToggleActive = async (svc) => {
    const updated = { active: !svc.active };
    await base44.entities.Service.update(svc.id, updated);
    setServices(prev => prev.map(s => s.id === svc.id ? { ...s, ...updated } : s));
    toast.success(updated.active ? 'Service activated' : 'Service deactivated');
  };

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-[#1A1208]">Services & Pricing</h1>
            <p className="text-sm text-black/50 mt-1">{services.filter(s => s.active !== false).length} active · {services.length} total pricing entries</p>
          </div>
          <button onClick={() => { setModalService(null); setShowModal(true); }}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#B87333] text-white rounded-xl text-sm font-semibold hover:bg-[#a06428] transition-colors">
            <Plus className="w-4 h-4" /> New Service
          </button>
        </div>

        <div className="flex gap-2 flex-wrap mb-6">
          <button onClick={() => setCatFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${catFilter === 'all' ? 'bg-[#1A1208] text-white' : 'bg-white border border-black/10 text-black/60 hover:border-[#B87333]'}`}>
            All ({services.length})
          </button>
          {CATEGORIES.map(c => (
            <button key={c} onClick={() => setCatFilter(c)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-colors ${catFilter === c ? 'bg-[#B87333] text-white' : 'bg-white border border-black/10 text-black/60 hover:border-[#B87333]'}`}>
              {c} ({services.filter(s => s.category === c).length})
            </button>
          ))}
        </div>

        <div className="relative mb-6">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-black/30" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search services…"
            className="w-full pl-9 pr-4 py-2.5 border border-black/10 rounded-xl text-sm focus:outline-none focus:border-[#B87333] bg-white" />
        </div>

        {loading ? (
          <div className="space-y-2">{[...Array(6)].map((_, i) => <div key={i} className="h-14 bg-black/5 rounded-xl animate-pulse" />)}</div>
        ) : filtered.length === 0 ? (
          <div className="py-20 text-center">
            <div className="text-4xl mb-3">📋</div>
            <p className="text-sm font-semibold text-black/50">No services found</p>
            <p className="text-xs text-black/30 mt-1">Create your first service/pricing entry above.</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-black/8 shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[#F9F7F2] border-b border-black/8">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-black/40 uppercase tracking-wide">Service</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-black/40 uppercase tracking-wide hidden sm:table-cell">Category</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-black/40 uppercase tracking-wide hidden md:table-cell">Pricing</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-black/40 uppercase tracking-wide hidden md:table-cell">Price (R)</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-black/40 uppercase tracking-wide">Active</th>
                  <th className="px-4 py-3 w-8" />
                </tr>
              </thead>
              <tbody>
                {filtered.map(svc => (
                  <tr key={svc.id} className="border-b border-black/5 hover:bg-[#faf8f4] transition-colors">
                    <td className="px-4 py-3 cursor-pointer" onClick={() => { setModalService(svc); setShowModal(true); }}>
                      <p className="font-semibold text-[#1A1208]">{svc.serviceName}</p>
                      {svc.packageName && <p className="text-xs text-black/40">{svc.packageName}</p>}
                      {svc.bookSizeCondition && <p className="text-xs text-[#B87333]">{svc.bookSizeCondition}</p>}
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell cursor-pointer" onClick={() => { setModalService(svc); setShowModal(true); }}>
                      <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${CATEGORY_COLORS[svc.category] || 'bg-gray-100 text-gray-600'}`}>{svc.category}</span>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell text-xs text-black/50 cursor-pointer" onClick={() => { setModalService(svc); setShowModal(true); }}>
                      {svc.pricingType?.replace(/_/g, ' ')}
                      {(svc.pageCountMin || svc.pageCountMax) && <span className="ml-1 text-black/30">· {svc.pageCountMin}–{svc.pageCountMax}pp</span>}
                      {(svc.copyQuantityMin || svc.copyQuantityMax) && <span className="ml-1 text-black/30">· {svc.copyQuantityMin}–{svc.copyQuantityMax} copies</span>}
                    </td>
                    <td className="px-4 py-3 text-right hidden md:table-cell cursor-pointer" onClick={() => { setModalService(svc); setShowModal(true); }}>
                      <span className="font-semibold text-[#1A1208]">
                        {svc.pricingType === 'fixed' && svc.price ? `R${Number(svc.price).toLocaleString()}` : svc.basePrice ? `R${Number(svc.basePrice).toLocaleString()}` : '—'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button onClick={() => handleToggleActive(svc)}>
                        {svc.active !== false
                          ? <ToggleRight className="w-6 h-6 text-emerald-500 mx-auto" />
                          : <ToggleLeft className="w-6 h-6 text-black/20 mx-auto" />}
                      </button>
                    </td>
                    <td className="px-4 py-3 cursor-pointer" onClick={() => { setModalService(svc); setShowModal(true); }}>
                      <ChevronRight className="w-4 h-4 text-black/20" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && (
        <ServiceModal service={modalService} onClose={() => setShowModal(false)} onSave={handleSave} onDelete={handleDelete} />
      )}
    </AdminLayout>
  );
}