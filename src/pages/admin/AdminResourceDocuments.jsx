import React, { useState, useEffect } from 'react';
import { platform } from '@/api/platformClient';
import AdminLayout from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  Plus, Pencil, Trash2, Download, Loader2, Upload, FileText, FolderOpen, Star,
} from 'lucide-react';
import { ADMIN_CATEGORIES as CATEGORIES, FILE_TYPES } from '@/lib/resourceDocsConfig';

const EMPTY = {
  title: '', description: '', category: 'Other', file_type: 'PDF',
  file_url: '', file_size_kb: 0, sort_order: 0, is_active: true, is_featured: false,
};

export default function AdminResourceDocuments() {
  const [docs, setDocs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  const load = () => {
    setLoading(true);
    platform.entities.ResourceDocument.list('sort_order')
      .then(setDocs)
      .catch(() => setDocs([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const openNew = () => { setEditing(null); setForm(EMPTY); setModalOpen(true); };
  const openEdit = (doc) => { setEditing(doc); setForm({ ...EMPTY, ...doc }); setModalOpen(true); };

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const { file_url } = await platform.integrations.Core.UploadFile({ file });
      const name = file.name.toLowerCase();
      const detected = name.endsWith('.pdf') ? 'PDF'
        : /\.(docx?|rtf)$/.test(name) ? 'Word'
        : /\.(xlsx?|csv)$/.test(name) ? 'Excel' : 'Other';
      setForm((f) => ({
        ...f,
        file_url,
        file_type: detected,
        file_size_kb: Math.round(file.size / 1024),
        title: f.title || file.name.replace(/\.[^.]+$/, ''),
      }));
    } finally {
      setUploading(false);
    }
  };

  const save = async () => {
    if (!form.title || !form.file_url) return;
    setSaving(true);
    try {
      const payload = { ...form, sort_order: Number(form.sort_order) || 0, file_size_kb: Number(form.file_size_kb) || 0 };
      if (editing) await platform.entities.ResourceDocument.update(editing.id, payload);
      else await platform.entities.ResourceDocument.create(payload);
      setModalOpen(false);
      load();
    } finally {
      setSaving(false);
    }
  };

  const remove = async (doc) => {
    if (!window.confirm(`Delete "${doc.title}"? This cannot be undone.`)) return;
    await platform.entities.ResourceDocument.delete(doc.id);
    load();
  };

  return (
    <AdminLayout>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-neutral-900 flex items-center gap-2">
              <FolderOpen className="w-6 h-6 text-[#B87333]" /> Resource Documents
            </h1>
            <p className="text-sm text-neutral-500 mt-1">
              Manage the downloadable documents shown on the public Resources → Documents page.
            </p>
          </div>
          <Button onClick={openNew} className="bg-[#B87333] hover:bg-[#a3652c]">
            <Plus className="w-4 h-4 mr-2" /> Add Document
          </Button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="w-8 h-8 text-[#B87333] animate-spin" />
          </div>
        ) : docs.length === 0 ? (
          <div className="text-center py-24 border border-dashed rounded-xl">
            <FileText className="w-10 h-10 text-neutral-300 mx-auto mb-3" />
            <p className="text-neutral-500">No documents yet. Add your first one.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {docs.map((doc) => (
              <div key={doc.id}
                className="flex items-center gap-4 p-4 bg-white rounded-xl border border-neutral-200 hover:border-[#B87333]/40 transition-colors">
                <div className="w-10 h-10 rounded-lg bg-[#B87333]/10 flex items-center justify-center shrink-0">
                  <FileText className="w-5 h-5 text-[#B87333]" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-neutral-900 truncate">{doc.title}</p>
                    {doc.is_featured && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-[#B87333]/15 text-[#B87333]"><Star className="w-2.5 h-2.5 fill-current" />Featured</span>
                    )}
                    {!doc.is_active && (
                      <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-neutral-200 text-neutral-500">Hidden</span>
                    )}
                  </div>
                  <p className="text-xs text-neutral-500 truncate">{doc.description}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] font-medium uppercase tracking-wide text-[#B87333]">{doc.category}</span>
                    <span className="text-neutral-300">·</span>
                    <span className="text-[10px] font-medium uppercase tracking-wide text-neutral-400">{doc.file_type}</span>
                    <span className="text-neutral-300">·</span>
                    <span className="text-[10px] text-neutral-400">Order {doc.sort_order}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <a href={doc.file_url} target="_blank" rel="noopener noreferrer"
                    className="p-2 rounded-lg hover:bg-neutral-100 text-neutral-500" title="Download">
                    <Download className="w-4 h-4" />
                  </a>
                  <button onClick={() => openEdit(doc)} className="p-2 rounded-lg hover:bg-neutral-100 text-neutral-500" title="Edit">
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button onClick={() => remove(doc)} className="p-2 rounded-lg hover:bg-red-50 text-red-500" title="Delete">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing ? 'Edit Document' : 'Add Document'}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div>
              <Label>Document File</Label>
              <div className="mt-1.5 flex items-center gap-3">
                <label className="flex items-center gap-2 px-4 py-2 text-sm font-medium border border-neutral-300 rounded-lg cursor-pointer hover:bg-neutral-50">
                  {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                  {uploading ? 'Uploading…' : 'Upload file'}
                  <input type="file" className="hidden" onChange={handleUpload}
                    accept=".pdf,.doc,.docx,.rtf,.xls,.xlsx,.csv" />
                </label>
                {form.file_url && !uploading && (
                  <a href={form.file_url} target="_blank" rel="noopener noreferrer"
                    className="text-xs text-[#B87333] underline truncate">View uploaded file</a>
                )}
              </div>
            </div>

            <div>
              <Label htmlFor="title">Document Name</Label>
              <Input id="title" value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="e.g. Non-Disclosure Agreement" className="mt-1.5" />
            </div>

            <div>
              <Label htmlFor="desc">Short Description</Label>
              <Textarea id="desc" value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Brief summary shown on the card" rows={2} className="mt-1.5" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Category</Label>
                <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                  <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>File Type</Label>
                <Select value={form.file_type} onValueChange={(v) => setForm({ ...form, file_type: v })}>
                  <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {FILE_TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 items-end">
              <div>
                <Label htmlFor="order">Sort Order</Label>
                <Input id="order" type="number" value={form.sort_order}
                  onChange={(e) => setForm({ ...form, sort_order: e.target.value })} className="mt-1.5" />
              </div>
              <div className="flex items-center gap-2 pb-2">
                <Switch checked={form.is_active}
                  onCheckedChange={(v) => setForm({ ...form, is_active: v })} />
                <Label className="cursor-pointer">Visible on site</Label>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <Switch checked={form.is_featured}
                onCheckedChange={(v) => setForm({ ...form, is_featured: v })} />
              <Label className="cursor-pointer flex items-center gap-1.5">
                <Star className="w-3.5 h-3.5 text-[#B87333]" /> Feature this document
              </Label>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button onClick={save} disabled={saving || !form.title || !form.file_url}
              className="bg-[#B87333] hover:bg-[#a3652c]">
              {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {editing ? 'Save Changes' : 'Add Document'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}