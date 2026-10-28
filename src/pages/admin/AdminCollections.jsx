import { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { platform } from '@/api/platformClient';
import AdminLayout from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Search, Package, X, Download } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminCollections() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [lastPos, setLastPos] = useState(null);
  const [form, setForm] = useState({ project_id: '', contact_id: '', book_title: '', collected_by: '', quantity_collected: 1, staff_member: '', collection_notes: '', fully_paid_at_collection: false });

  const { data: collections = [], isLoading } = useQuery({
    queryKey: ['collections'],
    queryFn: () => platform.entities.CollectionSignature.list('-created_date', 200),
  });

  const { data: projects = [] } = useQuery({
    queryKey: ['projects'],
    queryFn: () => platform.entities.Project.list('-created_date', 200),
  });

  const { data: contacts = [] } = useQuery({
    queryKey: ['contacts'],
    queryFn: () => platform.entities.Contact.list('-created_date', 500),
  });

  const saveMutation = useMutation({
    mutationFn: async (data) => {
      // Get signature from canvas
      let sigUrl = '';
      if (canvasRef.current) {
        sigUrl = canvasRef.current.toDataURL('image/png');
        // Upload signature
        const blob = await (await fetch(sigUrl)).blob();
        const file = new File([blob], 'signature.png', { type: 'image/png' });
        const res = await platform.integrations.Core.UploadFile({ file });
        sigUrl = res.file_url || sigUrl;
      }
      return platform.entities.CollectionSignature.create({ ...data, signature_image_url: sigUrl, collection_date: new Date().toISOString() });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['collections'] });
      // Update project stage
      if (form.project_id) {
        platform.entities.Project.update(form.project_id, { stage: 'Delivered' });
      }
      setShowModal(false);
      setForm({ project_id: '', contact_id: '', book_title: '', collected_by: '', quantity_collected: 1, staff_member: '', collection_notes: '', fully_paid_at_collection: false });
      toast.success('Collection recorded successfully');
    },
  });

  // Canvas drawing
  const getPos = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return { x: clientX - rect.left, y: clientY - rect.top };
  };

  const startDraw = (e) => { e.preventDefault(); setIsDrawing(true); setLastPos(getPos(e)); };
  const draw = (e) => {
    e.preventDefault();
    if (!isDrawing || !canvasRef.current) return;
    const ctx = canvasRef.current.getContext('2d');
    const pos = getPos(e);
    ctx.beginPath();
    ctx.moveTo(lastPos.x, lastPos.y);
    ctx.lineTo(pos.x, pos.y);
    ctx.strokeStyle = '#1A1208';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.stroke();
    setLastPos(pos);
  };
  const stopDraw = () => setIsDrawing(false);
  const clearCanvas = () => { const ctx = canvasRef.current?.getContext('2d'); if (ctx) ctx.clearRect(0, 0, 400, 150); };

  const filtered = collections.filter(c => {
    const q = search.toLowerCase();
    return !q || c.collected_by?.toLowerCase().includes(q) || c.book_title?.toLowerCase().includes(q);
  });

  const projectMap = Object.fromEntries(projects.map(p => [p.id, p]));
  const contactMap = Object.fromEntries(contacts.map(c => [c.id, c]));

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Client Collections</h1>
            <p className="text-sm text-gray-500 mt-0.5">Digital signatures for book collections</p>
          </div>
          <Button onClick={() => setShowModal(true)} className="gap-2 bg-[#B87333] hover:bg-[#A06828] text-white">
            <Plus className="w-4 h-4" /> Record Collection
          </Button>
        </div>

        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input placeholder="Search by collector or book title…" value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
        </div>

        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          {isLoading ? (
            <div className="p-12 text-center text-gray-400">Loading…</div>
          ) : filtered.length === 0 ? (
            <div className="p-12 text-center">
              <Package className="w-10 h-10 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No collection records yet.</p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  {['Book', 'Collected By', 'Client', 'Qty', 'Date', 'Staff', 'Signature', 'Paid'].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map(col => {
                  const contact = contactMap[col.contact_id];
                  return (
                    <tr key={col.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium text-gray-900">{col.book_title || '—'}</td>
                      <td className="px-4 py-3 text-gray-600">{col.collected_by}</td>
                      <td className="px-4 py-3 text-gray-500 text-xs">{contact?.full_name || '—'}</td>
                      <td className="px-4 py-3 text-gray-700 font-semibold">{col.quantity_collected}</td>
                      <td className="px-4 py-3 text-gray-500 text-xs">{new Date(col.collection_date).toLocaleDateString('en-ZA')}</td>
                      <td className="px-4 py-3 text-gray-500 text-xs">{col.staff_member || '—'}</td>
                      <td className="px-4 py-3">
                        {col.signature_image_url ? (
                          <a href={col.signature_image_url} target="_blank" rel="noreferrer">
                            <img src={col.signature_image_url} alt="signature" className="h-8 w-auto border rounded" />
                          </a>
                        ) : <span className="text-gray-400 text-xs">—</span>}
                      </td>
                      <td className="px-4 py-3">
                        {col.fully_paid_at_collection
                          ? <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">Paid</span>
                          : <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-medium">Outstanding</span>}
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900">Record Collection</h2>
              <button onClick={() => setShowModal(false)}><X className="w-5 h-5 text-gray-400" /></button>
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-600 block mb-1">Project</label>
              <select value={form.project_id} onChange={e => {
                const p = projectMap[e.target.value];
                setForm(prev => ({ ...prev, project_id: e.target.value, contact_id: p?.contact_id || '', book_title: p?.book_title || '' }));
              }} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm">
                <option value="">Select project…</option>
                {projects.filter(p => p.stage === 'Ready for Collection').map(p => (
                  <option key={p.id} value={p.id}>{p.book_title} — {contactMap[p.contact_id]?.full_name || ''}</option>
                ))}
              </select>
            </div>

            {[
              { label: 'Book Title', key: 'book_title' },
              { label: 'Collected By *', key: 'collected_by', placeholder: 'Full name of collector' },
              { label: 'Qty Collected *', key: 'quantity_collected', type: 'number' },
              { label: 'Staff Member', key: 'staff_member' },
              { label: 'Notes', key: 'collection_notes' },
            ].map(f => (
              <div key={f.key}>
                <label className="text-xs font-semibold text-gray-600 block mb-1">{f.label}</label>
                <Input type={f.type || 'text'} value={form[f.key] || ''} placeholder={f.placeholder} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))} />
              </div>
            ))}

            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input type="checkbox" checked={form.fully_paid_at_collection} onChange={e => setForm(p => ({ ...p, fully_paid_at_collection: e.target.checked }))} />
              Fully paid at time of collection
            </label>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-semibold text-gray-600">Client Signature *</label>
                <button onClick={clearCanvas} className="text-xs text-gray-400 hover:text-gray-600">Clear</button>
              </div>
              <canvas
                ref={canvasRef}
                width={460}
                height={150}
                className="w-full border-2 border-dashed border-gray-300 rounded-xl bg-gray-50 touch-none cursor-crosshair"
                onMouseDown={startDraw}
                onMouseMove={draw}
                onMouseUp={stopDraw}
                onMouseLeave={stopDraw}
                onTouchStart={startDraw}
                onTouchMove={draw}
                onTouchEnd={stopDraw}
              />
              <p className="text-xs text-gray-400 mt-1">Sign above using mouse or touchscreen</p>
            </div>

            <div className="flex gap-2 pt-2">
              <Button variant="outline" onClick={() => setShowModal(false)} className="flex-1">Cancel</Button>
              <Button
                onClick={() => saveMutation.mutate(form)}
                disabled={!form.collected_by || !form.quantity_collected || saveMutation.isPending}
                className="flex-1 bg-[#B87333] hover:bg-[#A06828] text-white"
              >
                {saveMutation.isPending ? 'Saving…' : 'Record Collection'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}