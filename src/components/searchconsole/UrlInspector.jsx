import React, { useState } from 'react';
import { platform } from '@/api/platformClient';
import { Search, CheckCircle, AlertCircle, Clock, ExternalLink } from 'lucide-react';

const QUICK_URLS = [
  'https://www.creativebooks.co.za/',
  'https://www.creativebooks.co.za/book-printing',
  'https://www.creativebooks.co.za/book-cover-design',
  'https://www.creativebooks.co.za/book-editing',
  'https://www.creativebooks.co.za/book-publishing',
  'https://www.creativebooks.co.za/ghostwriting',
  'https://www.creativebooks.co.za/typesetting',
  'https://www.creativebooks.co.za/calculator',
];

function StatusBadge({ verdict }) {
  if (!verdict) return null;
  const map = {
    PASS: { label: 'Indexed', color: 'bg-emerald-100 text-emerald-700', icon: CheckCircle },
    NEUTRAL: { label: 'Neutral', color: 'bg-blue-100 text-blue-700', icon: Clock },
    FAIL: { label: 'Not Indexed', color: 'bg-red-100 text-red-600', icon: AlertCircle },
    VERDICT_UNSPECIFIED: { label: 'Unknown', color: 'bg-black/5 text-black/40', icon: Clock },
  };
  const cfg = map[verdict] || map.VERDICT_UNSPECIFIED;
  const Icon = cfg.icon;
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-semibold ${cfg.color}`}>
      <Icon className="w-4 h-4" /> {cfg.label}
    </span>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex justify-between py-2.5 border-b border-black/5 last:border-0">
      <span className="text-sm text-black/50">{label}</span>
      <span className="text-sm font-medium text-[#1A1208] text-right max-w-xs break-all">{value ?? '—'}</span>
    </div>
  );
}

export default function UrlInspector() {
  const [url, setUrl] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const inspect = async (targetUrl) => {
    const u = targetUrl || url;
    if (!u) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await platform.functions.invoke('searchConsoleData', { action: 'inspectUrl', url: u });
      setResult(res.data.result);
      setUrl(u);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const idx = result?.indexStatusResult;

  return (
    <div className="max-w-3xl">
      {/* Input */}
      <div className="bg-white rounded-2xl border border-black/8 shadow-sm p-6 mb-6">
        <div className="text-sm font-semibold text-[#1A1208] mb-4">Inspect URL Indexing Status</div>
        <div className="flex gap-3 mb-4">
          <input
            type="text"
            value={url}
            onChange={e => setUrl(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && inspect()}
            placeholder="https://www.creativebooks.co.za/..."
            className="flex-1 px-4 py-2.5 rounded-xl border border-black/15 text-sm focus:outline-none focus:border-[#B87333]"
          />
          <button
            onClick={() => inspect()}
            disabled={loading || !url}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#B87333] text-white rounded-xl text-sm font-semibold hover:bg-[#a06428] transition-all disabled:opacity-50"
          >
            <Search className="w-4 h-4" />
            {loading ? 'Inspecting…' : 'Inspect'}
          </button>
        </div>

        {/* Quick URLs */}
        <div>
          <div className="text-xs text-black/40 mb-2">Quick check:</div>
          <div className="flex flex-wrap gap-2">
            {QUICK_URLS.map(u => (
              <button key={u} onClick={() => inspect(u)}
                className="px-3 py-1 bg-[#F9F7F2] hover:bg-[#B87333] hover:text-white text-xs text-black/60 rounded-full transition-all border border-black/8">
                {u.replace('https://www.creativebooks.co.za', '') || '/'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {error && <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700 mb-6">{error}</div>}

      {loading && (
        <div className="flex items-center justify-center h-32">
          <div className="w-6 h-6 border-2 border-[#B87333]/20 border-t-[#B87333] rounded-full animate-spin" />
        </div>
      )}

      {/* Results */}
      {result && idx && (
        <div className="bg-white rounded-2xl border border-black/8 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-black/8 flex items-center justify-between gap-4">
            <div>
              <div className="text-xs text-black/40 mb-1 truncate">{url}</div>
              <StatusBadge verdict={idx.verdict} />
            </div>
            <a href={url} target="_blank" rel="noopener noreferrer" className="text-[#B87333] hover:underline">
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
          <div className="p-5">
            <Row label="Coverage State" value={idx.coverageState} />
            <Row label="Robots.txt" value={idx.robotsTxtState} />
            <Row label="Indexing Allowed" value={idx.indexingState} />
            <Row label="Last Crawl" value={idx.lastCrawlTime ? new Date(idx.lastCrawlTime).toLocaleString('en-ZA') : '—'} />
            <Row label="Crawled As" value={idx.crawledAs} />
            <Row label="Page Fetch" value={idx.pageFetchState} />
            <Row label="Canonical (Google)" value={idx.googleCanonical} />
            <Row label="Canonical (Page)" value={idx.userCanonical} />

            {idx.sitemap?.length > 0 && (
              <div className="mt-3">
                <div className="text-xs text-black/40 mb-1">Found in sitemaps:</div>
                {idx.sitemap.map((s, i) => (
                  <div key={i} className="text-xs text-[#B87333] break-all">{s}</div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}