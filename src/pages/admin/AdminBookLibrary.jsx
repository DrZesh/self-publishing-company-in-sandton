import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import AdminLayout from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Search, BookOpen, X, RefreshCw } from 'lucide-react';

const GENRES = ['Fiction','Non-Fiction','Christian','Biography','Memoir',"Children's",'Poetry','Academic','Business','Self-Help','Other'];

const STATUS_COLORS = {
  'In Progress': 'bg-blue-100 text-blue-700',
  'Completed': 'bg-green-100 text-green-700',
  'Delivered': 'bg-emerald-100 text-emerald-700',
  'Archived': 'bg-gray-100 text-gray-500',
};

export default function AdminBookLibrary() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [genreFilter, setGenreFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ book_title: '', author_name: '', genre: '', services_provided: [], year_completed: '', notes: '', project_status: 'Completed', thumbnail_url: '', reprint_count: 0 });

  const { data: books = [], isLoading } = useQuery({
    queryKey: ['books'],
    queryFn: () => base44.entities.BookRecord.list('-created_date', 500),
  });

  const saveMutation = useMutation({
    mutationFn: (data) => editing ? base44.entities.BookRecord.update(editing.id, data) : base44.entities.BookRecord.create(data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['books'] }); setShowModal(false); setEditing(null); },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.BookRecord.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['books'] }),
  });

  const openNew = () => { setEditing(null); setForm({ book_title: '', author_name: '', genre: '', services_provided: [], year_completed: '', notes: '', project_status: 'Completed', thumbnail_url: '', reprint_count: 0 }); setShowModal(true); };
  const openEdit = (book) => { setEditing(book); setForm({ ...book, services_provided: book.services_provided || [] }); setShowModal(true); };

  const filtered = books.filter(b => {
    const q = search.toLowerCase();
    const matchSearch = !q || b.book_title?.toLowerCase().includes(q) || b.author_name?.toLowerCase().includes(q);
    return matchSearch && (!genreFilter || b.genre === genreFilter);
  });

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Book Library</h1>
            <p className="text-sm text-gray-500 mt-0.5">{books.length} books in the Creative Books SA archive</p>
          </div>
          <Button onClick={openNew} className="gap-2 bg-[#B87333] hover:bg-[#A06828] text-white">
            <Plus className="w-4 h-4" /> Add Book
          </Button>
        </div>

        <div className="flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-[220px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input placeholder="Search by title or author…" value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
          </div>
          <select value={genreFilter} onChange={e => setGenreFilter(e.target.value)} className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white">
            <option value="">All Genres</option>
            {GENRES.map(g => <option key={g} value={g}>{g}</option>)}
          </select>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          {isLoading ? (
            <div className="p-12 text-center text-gray-400">Loading…</div>
          ) : filtered.length === 0 ? (
            <div className="p-12 text-center">
              <BookOpen className="w-10 h-10 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No books found. Start building your library.</p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  {['Book Title', 'Author', 'Genre', 'Services', 'Reprints', 'Status', ''].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map(book => (
                  <tr key={book.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <p className="font-semibold text-gray-900">{book.book_title}</p>
                      {book.year_completed && <p className="text-xs text-gray-400">{book.year_completed}</p>}
                    </td>
                    <td className="px-4 py-3 text-gray-600">{book.author_name}</td>
                    <td className="px-4 py-3">
                      {book.genre && <span className="inline-block px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded-full text-xs font-medium">{book.genre}</span>}
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500">{(book.services_provided || []).join(', ') || '—'}</td>
                    <td className="px-4 py-3">
                      {book.reprint_count > 0 ? (
                        <span className="flex items-center gap-1 text-xs text-emerald-700 font-semibold">
                          <RefreshCw className="w-3 h-3" /> {book.reprint_count}x
                        </span>
                      ) : <span className="text-gray-400 text-xs">—</span>}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[book.project_status] || 'bg-gray-100 text-gray-600'}`}>
                        {book.project_status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        <Button variant="ghost" size="sm" onClick={() => openEdit(book)}>Edit</Button>
                        <Button variant="ghost" size="sm" onClick={() => { if (confirm('Delete this book record?')) deleteMutation.mutate(book.id); }}>
                          <X className="w-4 h-4 text-red-400" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900">{editing ? 'Edit Book' : 'Add Book'}</h2>
              <button onClick={() => setShowModal(false)}><X className="w-5 h-5 text-gray-400" /></button>
            </div>
            {[
              { label: 'Book Title *', key: 'book_title', type: 'text' },
              { label: 'Author Name *', key: 'author_name', type: 'text' },
              { label: 'Year Completed', key: 'year_completed', type: 'number' },
              { label: 'Reprint Count', key: 'reprint_count', type: 'number' },
            ].map(f => (
              <div key={f.key}>
                <label className="text-xs font-semibold text-gray-600 block mb-1">{f.label}</label>
                <Input type={f.type} value={form[f.key] || ''} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))} />
              </div>
            ))}
            <div>
              <label className="text-xs font-semibold text-gray-600 block mb-1">Genre</label>
              <select value={form.genre || ''} onChange={e => setForm(p => ({ ...p, genre: e.target.value }))} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm">
                <option value="">Select genre…</option>
                {GENRES.map(g => <option key={g} value={g}>{g}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-600 block mb-1">Status</label>
              <select value={form.project_status || 'Completed'} onChange={e => setForm(p => ({ ...p, project_status: e.target.value }))} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm">
                {['In Progress','Completed','Delivered','Archived'].map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-600 block mb-1">Notes</label>
              <textarea value={form.notes || ''} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm resize-none" rows={3} />
            </div>
            <div className="flex gap-2 pt-2">
              <Button variant="outline" onClick={() => setShowModal(false)} className="flex-1">Cancel</Button>
              <Button onClick={() => saveMutation.mutate(form)} disabled={!form.book_title || !form.author_name || saveMutation.isPending} className="flex-1 bg-[#B87333] hover:bg-[#A06828] text-white">
                {saveMutation.isPending ? 'Saving…' : 'Save'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}