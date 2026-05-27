import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import AdminLayout from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Search, User, X, Star, Globe } from 'lucide-react';

export default function AdminAuthors() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ full_name: '', pen_name: '', email: '', phone: '', preferred_book_size: '', author_website: '', author_bio: '', testimonial: '', marketing_permissions: false, is_vip: false, vip_reason: '' });

  const { data: authors = [], isLoading } = useQuery({
    queryKey: ['authors'],
    queryFn: () => base44.entities.Author.list('-created_date', 500),
  });

  const { data: books = [] } = useQuery({
    queryKey: ['books'],
    queryFn: () => base44.entities.BookRecord.list('-created_date', 500),
  });

  const saveMutation = useMutation({
    mutationFn: (data) => editing ? base44.entities.Author.update(editing.id, data) : base44.entities.Author.create(data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['authors'] }); setShowModal(false); setEditing(null); },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Author.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['authors'] }),
  });

  const openNew = () => { setEditing(null); setForm({ full_name: '', pen_name: '', email: '', phone: '', preferred_book_size: '', author_website: '', author_bio: '', testimonial: '', marketing_permissions: false, is_vip: false, vip_reason: '' }); setShowModal(true); };
  const openEdit = (a) => { setEditing(a); setForm({ ...a }); setShowModal(true); };

  const filtered = authors.filter(a => {
    const q = search.toLowerCase();
    return !q || a.full_name?.toLowerCase().includes(q) || a.email?.toLowerCase().includes(q) || a.pen_name?.toLowerCase().includes(q);
  });

  const getBookCount = (authorId) => books.filter(b => b.author_id === authorId).length;

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Author Library</h1>
            <p className="text-sm text-gray-500 mt-0.5">{authors.length} authors on record</p>
          </div>
          <Button onClick={openNew} className="gap-2 bg-[#B87333] hover:bg-[#A06828] text-white">
            <Plus className="w-4 h-4" /> Add Author
          </Button>
        </div>

        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input placeholder="Search by name or email…" value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
        </div>

        {isLoading ? (
          <div className="p-12 text-center text-gray-400">Loading…</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map(author => (
              <div key={author.id} className="bg-white rounded-xl border border-gray-100 p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#B87333]/20 flex items-center justify-center text-[#B87333] font-bold text-lg flex-shrink-0">
                      {author.full_name[0]}
                    </div>
                    <div>
                      <p className="font-bold text-gray-900 text-sm">{author.full_name}</p>
                      {author.pen_name && <p className="text-xs text-gray-500">"{author.pen_name}"</p>}
                      {author.is_vip && <span className="inline-flex items-center gap-0.5 text-[10px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-full font-semibold"><Star className="w-2.5 h-2.5" /> VIP</span>}
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="sm" onClick={() => openEdit(author)} className="text-xs">Edit</Button>
                    <Button variant="ghost" size="sm" onClick={() => { if (confirm('Delete author?')) deleteMutation.mutate(author.id); }}>
                      <X className="w-3.5 h-3.5 text-red-400" />
                    </Button>
                  </div>
                </div>

                <div className="space-y-1.5 text-xs text-gray-600">
                  {author.email && <p>📧 {author.email}</p>}
                  {author.phone && <p>📱 {author.phone}</p>}
                  {author.preferred_book_size && <p>📖 Preferred: {author.preferred_book_size}</p>}
                  {author.author_website && (
                    <a href={author.author_website} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-[#B87333] hover:underline">
                      <Globe className="w-3 h-3" /> Website
                    </a>
                  )}
                </div>

                <div className="mt-3 pt-3 border-t border-gray-50 flex gap-3 text-xs text-gray-500">
                  <span>{getBookCount(author.id)} books</span>
                  {author.marketing_permissions && <span className="text-green-600">✓ Marketing OK</span>}
                  {author.testimonial_approved && <span className="text-blue-600">✓ Testimonial</span>}
                </div>
              </div>
            ))}
            {filtered.length === 0 && (
              <div className="col-span-3 py-16 text-center">
                <User className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No authors found.</p>
              </div>
            )}
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900">{editing ? 'Edit Author' : 'Add Author'}</h2>
              <button onClick={() => setShowModal(false)}><X className="w-5 h-5 text-gray-400" /></button>
            </div>
            {[
              { label: 'Full Name *', key: 'full_name' },
              { label: 'Pen Name', key: 'pen_name' },
              { label: 'Email', key: 'email' },
              { label: 'Phone', key: 'phone' },
              { label: 'Preferred Book Size', key: 'preferred_book_size', placeholder: 'e.g. A5, 6×9' },
              { label: 'Author Website', key: 'author_website', placeholder: 'https://...' },
            ].map(f => (
              <div key={f.key}>
                <label className="text-xs font-semibold text-gray-600 block mb-1">{f.label}</label>
                <Input value={form[f.key] || ''} placeholder={f.placeholder} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))} />
              </div>
            ))}
            <div>
              <label className="text-xs font-semibold text-gray-600 block mb-1">Bio</label>
              <textarea value={form.author_bio || ''} onChange={e => setForm(p => ({ ...p, author_bio: e.target.value }))} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm resize-none" rows={3} />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-600 block mb-1">Testimonial</label>
              <textarea value={form.testimonial || ''} onChange={e => setForm(p => ({ ...p, testimonial: e.target.value }))} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm resize-none" rows={2} />
            </div>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input type="checkbox" checked={form.marketing_permissions || false} onChange={e => setForm(p => ({ ...p, marketing_permissions: e.target.checked }))} />
                Marketing Permissions
              </label>
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input type="checkbox" checked={form.is_vip || false} onChange={e => setForm(p => ({ ...p, is_vip: e.target.checked }))} />
                VIP Author
              </label>
            </div>
            {form.is_vip && (
              <Input placeholder="VIP reason (e.g. Returning Author)" value={form.vip_reason || ''} onChange={e => setForm(p => ({ ...p, vip_reason: e.target.value }))} />
            )}
            <div className="flex gap-2 pt-2">
              <Button variant="outline" onClick={() => setShowModal(false)} className="flex-1">Cancel</Button>
              <Button onClick={() => saveMutation.mutate(form)} disabled={!form.full_name || saveMutation.isPending} className="flex-1 bg-[#B87333] hover:bg-[#A06828] text-white">
                {saveMutation.isPending ? 'Saving…' : 'Save'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}