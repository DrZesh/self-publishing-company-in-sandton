import React, { useEffect, useState } from 'react';
import { platform } from '@/api/platformClient';
import { CheckCircle, AlertCircle, RefreshCw, Send } from 'lucide-react';

const DEFAULT_SITEMAP = 'https://www.creativebooks.co.za/sitemap.xml';

export default function SitemapManager() {
  const [sitemaps, setSitemaps] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);
  const [customUrl, setCustomUrl] = useState(DEFAULT_SITEMAP);

  const fetchSitemaps = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await platform.functions.invoke('searchConsoleData', { action: 'sitemaps' });
      setSitemaps(res.data.sitemaps || []);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const submitSitemap = async () => {
    setSubmitting(true);
    setError(null);
    setSuccessMsg(null);
    try {
      await platform.functions.invoke('searchConsoleData', { action: 'submitSitemap', sitemapUrl: customUrl });
      setSuccessMsg(`Sitemap submitted: ${customUrl}`);
      fetchSitemaps();
    } catch (e) {
      setError(e.message);
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => { fetchSitemaps(); }, []);

  return (
    <div className="max-w-3xl">
      {/* Submit */}
      <div className="bg-white rounded-2xl border border-black/8 shadow-sm p-6 mb-6">
        <div className="text-sm font-semibold text-[#1A1208] mb-4">Submit Sitemap</div>
        <div className="flex gap-3">
          <input
            type="text"
            value={customUrl}
            onChange={e => setCustomUrl(e.target.value)}
            className="flex-1 px-4 py-2.5 rounded-xl border border-black/15 text-sm focus:outline-none focus:border-[#B87333]"
            placeholder="https://www.creativebooks.co.za/sitemap.xml"
          />
          <button
            onClick={submitSitemap}
            disabled={submitting || !customUrl}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#B87333] text-white rounded-xl text-sm font-semibold hover:bg-[#a06428] transition-all disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
            {submitting ? 'Submitting…' : 'Submit'}
          </button>
        </div>
        {successMsg && <div className="mt-3 flex items-center gap-2 text-emerald-700 text-sm"><CheckCircle className="w-4 h-4" />{successMsg}</div>}
        {error && <div className="mt-3 flex items-center gap-2 text-red-600 text-sm"><AlertCircle className="w-4 h-4" />{error}</div>}
      </div>

      {/* List */}
      <div className="bg-white rounded-2xl border border-black/8 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-black/8 flex items-center justify-between">
          <div className="text-sm font-semibold text-[#1A1208]">Submitted Sitemaps</div>
          <button onClick={fetchSitemaps} className="text-xs text-[#B87333] flex items-center gap-1 hover:underline">
            <RefreshCw className="w-3 h-3" /> Refresh
          </button>
        </div>

        {loading && (
          <div className="flex items-center justify-center h-32">
            <div className="w-6 h-6 border-2 border-[#B87333]/20 border-t-[#B87333] rounded-full animate-spin" />
          </div>
        )}

        {!loading && sitemaps.length === 0 && (
          <div className="text-center py-12 text-black/40 text-sm">No sitemaps found.</div>
        )}

        {!loading && sitemaps.map((s, i) => {
          const isOk = s.errors === 0 || !s.errors;
          return (
            <div key={i} className="flex items-center justify-between px-5 py-4 border-t border-black/5">
              <div>
                <div className="text-sm font-medium text-[#1A1208] break-all">{s.path}</div>
                <div className="text-xs text-black/40 mt-0.5">
                  Last submitted: {s.lastSubmitted ? new Date(s.lastSubmitted).toLocaleDateString('en-ZA') : '—'} · 
                  URLs: {s.contents?.[0]?.submitted?.toLocaleString() ?? '—'} submitted / {s.contents?.[0]?.indexed?.toLocaleString() ?? '—'} indexed
                </div>
              </div>
              <span className={`ml-4 px-2.5 py-1 rounded-full text-xs font-semibold flex items-center gap-1 ${isOk ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-600'}`}>
                {isOk ? <CheckCircle className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                {isOk ? 'OK' : `${s.errors} errors`}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}