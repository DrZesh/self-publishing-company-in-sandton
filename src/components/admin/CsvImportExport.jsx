import { useRef, useState } from 'react';
import { Upload, Download, X, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

// ── Utilities ────────────────────────────────────────────────────────────────

export function downloadCsv(data, columns, filename) {
  const header = columns.map(c => `"${c.label}"`).join(',');
  const rows = data.map(row =>
    columns.map(c => {
      const val = c.render ? c.render(row) : (row[c.key] ?? '');
      return `"${String(val).replace(/"/g, '""')}"`;
    }).join(',')
  );
  const csv = [header, ...rows].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}

export function parseCsv(text) {
  const lines = text.trim().split(/\r?\n/);
  if (lines.length < 2) return [];
  const headers = lines[0].split(',').map(h => h.replace(/^"|"$/g, '').trim());
  return lines.slice(1).filter(l => l.trim()).map(line => {
    // Handle quoted fields
    const vals = [];
    let cur = '', inQ = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"') { inQ = !inQ; }
      else if (ch === ',' && !inQ) { vals.push(cur.trim()); cur = ''; }
      else { cur += ch; }
    }
    vals.push(cur.trim());
    const obj = {};
    headers.forEach((h, i) => { obj[h] = (vals[i] || '').replace(/^"|"$/g, ''); });
    return obj;
  });
}

// ── Component ────────────────────────────────────────────────────────────────

export default function CsvImportExport({
  data,             // array — current data for export
  exportColumns,    // [{key, label, render?}]
  exportFilename,   // e.g. 'contacts.csv'
  importFields,     // [{key, label, required?}] — describes the expected CSV columns
  onImport,         // async (rows) => { ... } — called with parsed rows; should return { created, failed }
  entityLabel,      // e.g. 'contacts'
  importDisabled,   // optional — hide import button
}) {
  const fileRef = useRef();
  const [modal, setModal] = useState(null); // null | { rows, filename }
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState(null);

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const rows = parseCsv(ev.target.result);
      setResult(null);
      setModal({ rows, filename: file.name });
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleImport = async () => {
    setImporting(true);
    try {
      const res = await onImport(modal.rows);
      setResult(res);
      toast.success(`Imported ${res.created} ${entityLabel}`);
    } catch (err) {
      toast.error('Import failed: ' + err.message);
    } finally {
      setImporting(false);
    }
  };

  const downloadTemplate = () => {
    const header = importFields.map(f => `"${f.label}"`).join(',');
    const blob = new Blob([header + '\n'], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `${entityLabel}-template.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <>
      <div className="flex items-center gap-2">
        <button
          onClick={() => downloadCsv(data, exportColumns, exportFilename)}
          className="flex items-center gap-1.5 px-3 py-2 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 bg-white hover:bg-gray-50 hover:border-[#B87333] transition-colors"
          title="Export CSV"
        >
          <Download className="w-4 h-4" /> Export CSV
        </button>
        {!importDisabled && (
          <>
            <input ref={fileRef} type="file" accept=".csv" className="hidden" onChange={handleFile} />
            <button
              onClick={() => fileRef.current?.click()}
              className="flex items-center gap-1.5 px-3 py-2 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 bg-white hover:bg-gray-50 hover:border-[#B87333] transition-colors"
              title="Import CSV"
            >
              <Upload className="w-4 h-4" /> Import CSV
            </button>
          </>
        )}
      </div>

      {modal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => !importing && setModal(null)}>
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h3 className="font-bold text-gray-900">Import {entityLabel}</h3>
              <button onClick={() => setModal(null)} disabled={importing} className="p-1.5 hover:bg-gray-100 rounded-lg"><X className="w-4 h-4" /></button>
            </div>
            <div className="p-6 space-y-4">
              {result ? (
                <div className="text-center py-4">
                  <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
                  <p className="font-semibold text-gray-800">Import complete</p>
                  <p className="text-sm text-gray-500 mt-1">{result.created} created · {result.failed} failed</p>
                  <button onClick={() => setModal(null)} className="mt-4 px-6 py-2 bg-[#B87333] text-white rounded-xl text-sm font-semibold">Done</button>
                </div>
              ) : (
                <>
                  <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
                    <p className="text-sm font-medium text-blue-800 mb-1">File: {modal.filename}</p>
                    <p className="text-sm text-blue-700">{modal.rows.length} rows detected</p>
                  </div>

                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Expected Columns</p>
                    <div className="flex flex-wrap gap-2">
                      {importFields.map(f => (
                        <span key={f.key} className={`px-2 py-1 rounded-lg text-xs font-medium ${f.required ? 'bg-[#B87333]/10 text-[#B87333]' : 'bg-gray-100 text-gray-600'}`}>
                          {f.label}{f.required ? ' *' : ''}
                        </span>
                      ))}
                    </div>
                    <button onClick={downloadTemplate} className="mt-2 text-xs text-[#B87333] hover:underline">Download template CSV</button>
                  </div>

                  {modal.rows.length > 0 && (
                    <div className="bg-gray-50 rounded-xl p-3 max-h-40 overflow-y-auto">
                      <p className="text-xs font-semibold text-gray-400 mb-2">Preview (first 3 rows)</p>
                      {modal.rows.slice(0, 3).map((row, i) => (
                        <div key={i} className="text-xs text-gray-600 py-1 border-b border-gray-100 last:border-0">
                          {Object.entries(row).slice(0, 4).map(([k, v]) => v ? `${k}: ${v}` : null).filter(Boolean).join(' · ')}
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="flex gap-3 pt-2">
                    <button onClick={() => setModal(null)} className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-600">Cancel</button>
                    <button onClick={handleImport} disabled={importing || modal.rows.length === 0}
                      className="flex-1 py-2.5 bg-[#B87333] text-white rounded-xl text-sm font-semibold disabled:opacity-50 flex items-center justify-center gap-2">
                      {importing ? <><Loader2 className="w-4 h-4 animate-spin" /> Importing…</> : `Import ${modal.rows.length} rows`}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}