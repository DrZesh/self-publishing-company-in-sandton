import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { platform } from '@/api/platformClient';
import { Search, Loader2, FileX2 } from 'lucide-react';
import PageMeta from '@/components/shared/PageMeta';
import Breadcrumbs from '@/components/shared/Breadcrumbs';
import { CATEGORIES, CATEGORY_ICON } from '@/lib/resourceDocsConfig';
import DocumentCard from '@/components/documents/DocumentCard';
import DocumentPreviewModal from '@/components/documents/DocumentPreviewModal';
import DownloadToast from '@/components/documents/DownloadToast';
import useDocumentDownload from '@/components/documents/useDocumentDownload';

const SORT_OPTIONS = [
  { key: 'newest', label: 'Newest' },
  { key: 'az', label: 'A → Z' },
  { key: 'oldest', label: 'Oldest' },
  { key: 'popular', label: 'Most downloaded' },
];

export default function Documents() {
  const [docs, setDocs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCat, setActiveCat] = useState('All');
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState('newest');
  const [preview, setPreview] = useState(null);

  const { download, trackView, toast, dismiss } = useDocumentDownload();

  const handleView = (doc) => {
    setPreview(doc);
    trackView(doc);
    setDocs((prev) => prev.map((d) => (d.id === doc.id ? { ...d, view_count: (d.view_count || 0) + 1 } : d)));
  };

  useEffect(() => {
    platform.entities.ResourceDocument
      .filter({ is_active: true }, 'sort_order')
      .then(setDocs)
      .catch(() => setDocs([]))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = docs.filter((d) => {
      const matchCat = activeCat === 'All' || d.category === activeCat;
      const matchQuery = !q ||
        d.title?.toLowerCase().includes(q) ||
        d.description?.toLowerCase().includes(q) ||
        d.category?.toLowerCase().includes(q) ||
        d.file_type?.toLowerCase().includes(q);
      return matchCat && matchQuery;
    });

    list = [...list].sort((a, b) => {
      switch (sort) {
        case 'az': return (a.title || '').localeCompare(b.title || '');
        case 'oldest': return new Date(a.updated_date || 0) - new Date(b.updated_date || 0);
        case 'popular': return (b.download_count || 0) - (a.download_count || 0);
        case 'newest':
        default: return new Date(b.updated_date || 0) - new Date(a.updated_date || 0);
      }
    });
    return list;
  }, [docs, activeCat, query, sort]);

  return (
    <div className="bg-vellum min-h-screen">
      <PageMeta
        title="Documents & Resources | Creative Books SA"
        description="Access, view and download important Creative Books SA documents — NDAs, contracts, agreements, forms, policies and publishing resources. Instant, secure downloads."
        canonical="https://creativebooks.co.za/resources/documents"
      />

      {/* ── Header ── */}
      <section className="bg-obsidian border-b border-copper/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-28 pb-14">
          <Breadcrumbs light items={[{ label: 'Resources', path: '/resources/documents' }, { label: 'Documents', path: '/resources/documents' }]} />
          <div className="max-w-3xl mt-6">
            <span className="text-copper text-xs font-body font-semibold tracking-[0.2em] uppercase">Document Library</span>
            <h1 className="font-heading text-4xl md:text-5xl font-bold text-white mt-3 mb-4">
              Documents &amp; Resources
            </h1>
            <p className="text-white/60 text-lg leading-relaxed font-body">
              Access, view, and download important documents, agreements, forms, templates, and resources from Creative Books SA.
            </p>
          </div>
        </div>
      </section>

      {/* ── Library ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        {/* Search */}
        <div className="relative max-w-xl mb-8">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#9A948B]" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search documents, forms, agreements or resources…"
            className="w-full pl-12 pr-4 py-3 text-[15px] text-[#2C2C2C] placeholder-[#9A948B] font-body bg-white border border-[#E5E0D8] rounded-lg focus:outline-none focus:border-copper focus:ring-1 focus:ring-copper transition-colors"
          />
        </div>

        {/* Filters + sort */}
        <div className="flex flex-col lg:flex-row lg:items-center gap-4 mb-9">
          <div className="flex gap-2 flex-1 overflow-x-auto pb-1 -mb-1 lg:flex-wrap lg:overflow-visible scrollbar-none">
            {CATEGORIES.map((cat) => {
              const active = activeCat === cat;
              const Icon = CATEGORY_ICON[cat];
              return (
                <button
                  key={cat}
                  onClick={() => setActiveCat(cat)}
                  className={`inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold tracking-wide uppercase rounded-md whitespace-nowrap shrink-0 transition-colors border ${
                    active
                      ? 'bg-copper text-white border-copper'
                      : 'bg-white text-[#6B6B6B] border-[#E5E0D8] hover:border-copper hover:text-copper'
                  }`}
                >
                  {Icon && <Icon className="w-3.5 h-3.5" />}
                  {cat === 'Publishing Resource' ? 'Publishing' : cat}
                </button>
              );
            })}
          </div>

          <div className="relative shrink-0">
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="appearance-none bg-white text-[#2C2C2C] text-sm font-body pl-4 pr-9 py-2.5 border border-[#E5E0D8] rounded-lg focus:outline-none focus:border-copper cursor-pointer"
            >
              {SORT_OPTIONS.map((o) => (
                <option key={o.key} value={o.key}>{o.label}</option>
              ))}
            </select>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="w-8 h-8 text-copper animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-24">
            <div className="w-16 h-16 rounded-lg mx-auto mb-5 flex items-center justify-center bg-white border border-[#E5E0D8]">
              <FileX2 className="w-8 h-8 text-[#9A948B]" />
            </div>
            <h3 className="font-heading text-xl font-bold text-[#2C2C2C] mb-2">
              {docs.length === 0 ? 'No documents published yet' : 'No documents found'}
            </h3>
            <p className="text-[#6B6B6B] font-body max-w-sm mx-auto">
              {docs.length === 0
                ? 'Check back soon — new resources are added regularly.'
                : 'Try changing your search term or selecting another document category.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((doc) => (
              <DocumentCard key={doc.id} doc={doc} onView={handleView} onDownload={download} />
            ))}
          </div>
        )}
      </section>

      {/* ── Footer CTA ── */}
      <section className="border-t border-[#E5E0D8] py-14 text-center">
        <div className="max-w-2xl mx-auto px-4 sm:px-6">
          <p className="text-[#6B6B6B] font-body mb-5">
            Need a specific document or have a question about our agreements?
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link to="/contact"
              className="inline-flex items-center px-6 py-3 text-sm font-semibold text-white bg-copper hover:bg-copper/90 rounded-full transition-colors">
              Contact Us
            </Link>
            <Link to="/legal"
              className="inline-flex items-center px-6 py-3 text-sm font-semibold text-[#2C2C2C] hover:text-copper rounded-full border border-[#E5E0D8] transition-colors">
              Legal &amp; Compliance
            </Link>
          </div>
        </div>
      </section>

      <DocumentPreviewModal doc={preview} onClose={() => setPreview(null)} onDownload={download} />
      <DownloadToast title={toast} onDismiss={dismiss} />
    </div>
  );
}