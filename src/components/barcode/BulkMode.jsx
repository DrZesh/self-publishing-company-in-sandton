import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Download, Loader2, CheckCircle2, XCircle } from 'lucide-react';
import JSZip from 'jszip';
import { processISBN, generateFilename } from '@/lib/isbnUtils';
import { generateBlob } from './DownloadHandler';

export default function BulkMode({ format, size, dpi, transparentBg }) {
  const [input, setInput] = useState('');
  const [processing, setProcessing] = useState(false);
  const [results, setResults] = useState(null);

  const parsed = input
    .split(/[\n,;]+/)
    .map((l) => l.trim())
    .filter(Boolean);

  const handleGenerate = async () => {
    if (!parsed.length) return;
    setProcessing(true);
    setResults(null);

    const zip = new JSZip();
    const summary = [];
    const options = { size, dpi: parseInt(dpi), transparentBg: transparentBg === 'transparent' };

    for (const raw of parsed) {
      const res = processISBN(raw);
      if (res.valid) {
        try {
          const { blob, ext } = generateBlob(res.isbn13, res.displayISBN, format, options);
          zip.file(generateFilename(res.isbn13, ext), blob);
          summary.push({ input: raw, ok: true, isbn13: res.isbn13 });
        } catch {
          summary.push({ input: raw, ok: false, message: 'Failed to generate' });
        }
      } else {
        summary.push({ input: raw, ok: false, message: res.message });
      }
    }

    const okCount = summary.filter((s) => s.ok).length;
    if (okCount > 0) {
      const content = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(content);
      const a = document.createElement('a');
      a.href = url;
      a.download = `creativebooks-isbn-barcodes-${okCount}.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    }

    setResults(summary);
    setProcessing(false);
  };

  const fieldStyle = {
    background: 'rgba(255,255,255,0.7)',
    border: '1px solid rgba(180,130,70,0.2)',
    color: '#3a2a10',
  };

  return (
    <div className="space-y-6">
      <div>
        <label className="text-xs font-semibold text-amber-900/60 uppercase tracking-widest mb-2 block">
          Paste ISBNs (one per line, or comma-separated)
        </label>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          rows={6}
          placeholder={'978-0-06-112008-4\n9780316769488\n978-1-84749-707-0'}
          className="w-full text-sm font-mono rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-amber-500/40 transition-all resize-y"
          style={fieldStyle}
        />
        {parsed.length > 0 && (
          <p className="text-xs text-amber-900/50 mt-2">{parsed.length} ISBN{parsed.length !== 1 ? 's' : ''} detected</p>
        )}
      </div>

      <motion.button
        whileHover={{ scale: parsed.length ? 1.01 : 1 }}
        whileTap={{ scale: parsed.length ? 0.98 : 1 }}
        onClick={handleGenerate}
        disabled={!parsed.length || processing}
        className="w-full h-12 text-sm font-semibold flex items-center justify-center gap-2"
        style={{
          background: parsed.length ? 'linear-gradient(135deg, #7c5a2a 0%, #a07840 100%)' : 'rgba(180,160,140,0.3)',
          color: parsed.length ? '#fff' : 'rgba(120,100,80,0.4)',
          borderRadius: '10px',
          boxShadow: parsed.length ? '0 4px 14px rgba(120,80,30,0.3)' : 'none',
          border: 'none',
          cursor: parsed.length && !processing ? 'pointer' : 'not-allowed',
        }}
      >
        {processing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
        {processing ? 'Generating…' : `Generate & Download ZIP (${format})`}
      </motion.button>

      {results && (
        <div className="rounded-xl p-4 space-y-2 max-h-64 overflow-y-auto" style={{ background: 'rgba(255,255,255,0.6)', border: '1px solid rgba(180,130,70,0.15)' }}>
          {results.map((r, i) => (
            <div key={i} className="flex items-center gap-2 text-sm">
              {r.ok ? <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0" /> : <XCircle className="w-4 h-4 text-red-500 shrink-0" />}
              <span className="font-mono text-amber-900/70">{r.input}</span>
              {!r.ok && <span className="text-red-500/70 text-xs">— {r.message}</span>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}