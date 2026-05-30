import { useRef, useState, useMemo } from 'react';
import { Upload, Download, X, CheckCircle, AlertCircle, Loader2, ArrowRight, Eye, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

// ── CSV Utilities ─────────────────────────────────────────────────────────────

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

function parseCsv(text) {
  const lines = text.trim().split(/\r?\n/);
  if (lines.length < 2) return { headers: [], rows: [] };
  const headers = splitCsvLine(lines[0]).map(h => h.replace(/^"|"$/g, '').trim());
  const rows = lines.slice(1).filter(l => l.trim()).map(line => {
    const vals = splitCsvLine(line).map(v => v.replace(/^"|"$/g, '').trim());
    const obj = {};
    headers.forEach((h, i) => { obj[h] = vals[i] ?? ''; });
    return obj;
  });
  return { headers, rows };
}

function splitCsvLine(line) {
  const vals = [];
  let cur = '', inQ = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQ && line[i + 1] === '"') { cur += '"'; i++; }
      else { inQ = !inQ; }
    } else if (ch === ',' && !inQ) { vals.push(cur); cur = ''; }
    else { cur += ch; }
  }
  vals.push(cur);
  return vals;
}

// ── Auto-match logic ──────────────────────────────────────────────────────────

function autoMatch(csvHeaders, importFields) {
  const mapping = {};
  const normalize = s => s.toLowerCase().replace(/[^a-z0-9]/g, '');

  csvHeaders.forEach(csvHeader => {
    const n = normalize(csvHeader);
    // Direct match
    const direct = importFields.find(f => normalize(f.label) === n || normalize(f.key) === n);
    if (direct) { mapping[csvHeader] = direct.key; return; }
    // Alias match
    const aliases = ZOHO_ALIASES[n];
    if (aliases) {
      const found = importFields.find(f => aliases.includes(normalize(f.key)));
      if (found) { mapping[csvHeader] = found.key; return; }
    }
    mapping[csvHeader] = '__ignore';
  });
  return mapping;
}

// Common Zoho CRM → dashboard field aliases
const ZOHO_ALIASES = {
  firstname: ['full_name'],
  lastname: ['full_name'],
  fullname: ['full_name'],
  contactname: ['full_name'],
  leadname: ['full_name'],
  name: ['full_name'],
  emailaddress: ['email'],
  mobile: ['phone'],
  phonenumber: ['phone'],
  accountname: ['company'],
  organization: ['company'],
  title: ['role'],
  jobtitle: ['role'],
  leadstatus: ['lifecycle_stage'],
  contactstage: ['lifecycle_stage'],
  lifecyclestage: ['lifecycle_stage'],
  stage: ['pipeline_stage'],
  pipelinestage: ['pipeline_stage'],
  dealstage: ['pipeline_stage'],
  amount: ['pipeline_value'],
  dealvalue: ['pipeline_value'],
  value: ['pipeline_value'],
  pipelinevalue: ['pipeline_value'],
  stateprovince: ['province'],
  state: ['province'],
  booktitle: ['book_title'],
  book: ['book_title'],
  description: ['description'],
  notes: ['description'],
};

// ── Validation ────────────────────────────────────────────────────────────────

function validateRow(row, importFields) {
  const errors = [];
  importFields.forEach(f => {
    const val = row[f.key] ?? '';
    if (f.required && !val.trim()) errors.push(`${f.label} is required`);
    if (f.type === 'email' && val && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) errors.push(`${f.label} is not a valid email`);
    if (f.type === 'number' && val && isNaN(Number(val))) errors.push(`${f.label} must be a number`);
  });
  return errors;
}

function applyMapping(rawRows, mapping, importFields) {
  // Handle Zoho "First Name" + "Last Name" → full_name
  const firstNameKey = Object.keys(mapping).find(k => mapping[k] === '__first_name__');
  const lastNameKey = Object.keys(mapping).find(k => mapping[k] === '__last_name__');

  return rawRows.map((raw, idx) => {
    const mapped = {};
    Object.entries(mapping).forEach(([csvCol, dashKey]) => {
      if (dashKey === '__ignore' || dashKey === '__first_name__' || dashKey === '__last_name__') return;
      if (mapped[dashKey] === undefined) mapped[dashKey] = raw[csvCol] ?? '';
    });
    // Combine first + last name
    if (firstNameKey || lastNameKey) {
      const fn = firstNameKey ? (raw[firstNameKey] ?? '') : '';
      const ln = lastNameKey ? (raw[lastNameKey] ?? '') : '';
      if (!mapped.full_name) mapped.full_name = [fn, ln].filter(Boolean).join(' ');
    }
    const errors = validateRow(mapped, importFields);
    return { _idx: idx + 2, _raw: raw, ...mapped, _errors: errors };
  });
}

// ── Main Component ────────────────────────────────────────────────────────────

export default function CsvImportExport({
  data,
  exportColumns,
  exportFilename,
  importFields = [],     // [{key, label, required?, type?}]
  onImport,             // async (mappedRows) => { created, updated, failed, errors[] }
  entityLabel = 'records',
  importDisabled,
}) {
  const fileRef = useRef();
  const [step, setStep] = useState('idle'); // idle | map | preview | importing | result
  const [csvData, setCsvData] = useState(null);    // { headers, rows }
  const [mapping, setMapping] = useState({});
  const [mappedRows, setMappedRows] = useState([]);
  const [result, setResult] = useState(null);
  const [dedupeMode, setDedupeMode] = useState('skip'); // skip | update

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const parsed = parseCsv(ev.target.result);
      if (!parsed.rows.length) { toast.error('No data found in file'); return; }
      const autoMapping = autoMatch(parsed.headers, importFields);
      // Detect split first/last name
      parsed.headers.forEach(h => {
        const n = h.toLowerCase().replace(/[^a-z]/g, '');
        if (n === 'firstname') autoMapping[h] = '__first_name__';
        if (n === 'lastname') autoMapping[h] = '__last_name__';
      });
      setCsvData(parsed);
      setMapping(autoMapping);
      setResult(null);
      setStep('map');
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleProceedToPreview = () => {
    const rows = applyMapping(csvData.rows, mapping, importFields);
    setMappedRows(rows);
    setStep('preview');
  };

  const handleImport = async () => {
    setStep('importing');
    try {
      const res = await onImport(mappedRows.filter(r => !r._errors?.length), { dedupeMode });
      setResult(res);
      setStep('result');
    } catch (err) {
      toast.error('Import failed: ' + err.message);
      setStep('preview');
    }
  };

  const reset = () => { setStep('idle'); setCsvData(null); setMapping({}); setMappedRows([]); setResult(null); };

  const validRows = mappedRows.filter(r => !r._errors?.length);
  const invalidRows = mappedRows.filter(r => r._errors?.length > 0);

  const mappedCount = Object.values(mapping).filter(v => v !== '__ignore' && v !== '__first_name__' && v !== '__last_name__').length
    + (Object.values(mapping).some(v => v === '__first_name__' || v === '__last_name__') ? 1 : 0);

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
      {/* ── Trigger buttons ── */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => downloadCsv(data, exportColumns, exportFilename)}
          className="flex items-center gap-1.5 px-3 py-2 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 bg-white hover:bg-gray-50 hover:border-[#B87333] transition-colors"
        >
          <Download className="w-4 h-4" /> Export CSV
        </button>
        {!importDisabled && (
          <>
            <input ref={fileRef} type="file" accept=".csv" className="hidden" onChange={handleFile} />
            <button
              onClick={() => fileRef.current?.click()}
              className="flex items-center gap-1.5 px-3 py-2 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 bg-white hover:bg-gray-50 hover:border-[#B87333] transition-colors"
            >
              <Upload className="w-4 h-4" /> Import CSV
            </button>
          </>
        )}
      </div>

      {/* ── Modal ── */}
      {step !== 'idle' && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={step === 'importing' ? undefined : reset}>
          <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl" onClick={e => e.stopPropagation()}>

            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 flex-shrink-0">
              <div className="flex items-center gap-3">
                <h3 className="font-bold text-gray-900 text-lg">Import {entityLabel}</h3>
                {csvData && <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">{csvData.rows.length} rows · {csvData.headers.length} columns</span>}
              </div>
              <div className="flex items-center gap-4">
                {/* Step indicators */}
                <div className="flex items-center gap-1.5 text-xs text-gray-400">
                  {[['map','Map Fields'], ['preview','Preview'], ['result','Results']].map(([s, label], i, arr) => (
                    <span key={s} className="flex items-center gap-1.5">
                      <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${step === s ? 'bg-[#B87333] text-white' : (step === 'importing' && s === 'preview') || step === 'result' && s !== 'map' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-400'}`}>{i + 1}</span>
                      <span className={step === s ? 'text-[#B87333] font-semibold' : 'text-gray-400'}>{label}</span>
                      {i < arr.length - 1 && <ArrowRight className="w-3 h-3 text-gray-300" />}
                    </span>
                  ))}
                </div>
                {step !== 'importing' && <button onClick={reset} className="p-1.5 hover:bg-gray-100 rounded-lg"><X className="w-4 h-4 text-gray-400" /></button>}
              </div>
            </div>

            {/* Body */}
            <div className="overflow-y-auto flex-1 p-6">

              {/* ── STEP: MAP ── */}
              {step === 'map' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-600">Match your CSV columns to the correct dashboard fields. Auto-matched fields are highlighted.</p>
                    <button onClick={downloadTemplate} className="text-xs text-[#B87333] hover:underline flex items-center gap-1"><Download className="w-3 h-3" /> Template</button>
                  </div>

                  <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 text-sm text-blue-700">
                    <strong>{mappedCount}</strong> of <strong>{csvData.headers.length}</strong> columns mapped · <strong>{Object.values(mapping).filter(v => v === '__ignore').length}</strong> ignored
                  </div>

                  <div className="rounded-xl border border-gray-100 overflow-hidden">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="text-left px-4 py-2 text-xs font-semibold text-gray-500 uppercase w-1/2">CSV Column</th>
                          <th className="text-left px-4 py-2 text-xs font-semibold text-gray-500 uppercase w-1/2">Map to Dashboard Field</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {csvData.headers.map(header => {
                          const val = mapping[header] || '__ignore';
                          const isAutoMatched = val !== '__ignore';
                          return (
                            <tr key={header} className={isAutoMatched ? 'bg-green-50/40' : ''}>
                              <td className="px-4 py-2.5">
                                <span className="font-medium text-gray-800">{header}</span>
                                {isAutoMatched && <span className="ml-2 text-[10px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded font-semibold">AUTO</span>}
                              </td>
                              <td className="px-4 py-2.5">
                                <select
                                  value={val}
                                  onChange={e => setMapping(m => ({ ...m, [header]: e.target.value }))}
                                  className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-sm bg-white focus:outline-none focus:border-[#B87333]"
                                >
                                  <option value="__ignore">— Ignore this column —</option>
                                  <option value="__first_name__">First Name (combine with Last Name)</option>
                                  <option value="__last_name__">Last Name (combine with First Name)</option>
                                  {importFields.map(f => (
                                    <option key={f.key} value={f.key}>{f.label}{f.required ? ' *' : ''}</option>
                                  ))}
                                </select>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <div className="flex items-center gap-3">
                      <label className="text-sm text-gray-600 font-medium">Duplicates (by email):</label>
                      <select value={dedupeMode} onChange={e => setDedupeMode(e.target.value)} className="border border-gray-200 rounded-lg px-2 py-1.5 text-sm bg-white">
                        <option value="skip">Skip duplicates</option>
                        <option value="update">Update existing records</option>
                      </select>
                    </div>
                    <button onClick={handleProceedToPreview}
                      className="flex items-center gap-2 px-5 py-2.5 bg-[#B87333] text-white rounded-xl text-sm font-semibold hover:bg-[#a06428]">
                      <Eye className="w-4 h-4" /> Preview Import
                    </button>
                  </div>
                </div>
              )}

              {/* ── STEP: PREVIEW ── */}
              {step === 'preview' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-3">
                    <div className="bg-green-50 border border-green-100 rounded-xl p-3 text-center">
                      <div className="text-2xl font-bold text-green-700">{validRows.length}</div>
                      <div className="text-xs text-green-600 mt-0.5">Ready to import</div>
                    </div>
                    <div className="bg-red-50 border border-red-100 rounded-xl p-3 text-center">
                      <div className="text-2xl font-bold text-red-600">{invalidRows.length}</div>
                      <div className="text-xs text-red-500 mt-0.5">Validation errors</div>
                    </div>
                    <div className="bg-gray-50 border border-gray-100 rounded-xl p-3 text-center">
                      <div className="text-2xl font-bold text-gray-700">{mappedRows.length}</div>
                      <div className="text-xs text-gray-500 mt-0.5">Total rows</div>
                    </div>
                  </div>

                  {invalidRows.length > 0 && (
                    <div className="bg-red-50 border border-red-100 rounded-xl p-3">
                      <p className="text-sm font-semibold text-red-700 mb-2">⚠️ Rows with errors (will be skipped):</p>
                      <div className="space-y-1 max-h-28 overflow-y-auto">
                        {invalidRows.slice(0, 10).map(r => (
                          <div key={r._idx} className="text-xs text-red-600">
                            Row {r._idx}: {r._errors.join(', ')}
                          </div>
                        ))}
                        {invalidRows.length > 10 && <div className="text-xs text-red-400">…and {invalidRows.length - 10} more</div>}
                      </div>
                    </div>
                  )}

                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Preview — first 5 valid rows</p>
                    <div className="rounded-xl border border-gray-100 overflow-auto max-h-60">
                      <table className="w-full text-xs">
                        <thead className="bg-gray-50 sticky top-0">
                          <tr>
                            {importFields.filter(f => Object.values(mapping).includes(f.key)).map(f => (
                              <th key={f.key} className="text-left px-3 py-2 font-semibold text-gray-500 whitespace-nowrap">{f.label}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                          {validRows.slice(0, 5).map((row, i) => (
                            <tr key={i}>
                              {importFields.filter(f => Object.values(mapping).includes(f.key)).map(f => (
                                <td key={f.key} className="px-3 py-2 text-gray-700 whitespace-nowrap max-w-[150px] truncate">{row[f.key] || '—'}</td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button onClick={() => setStep('map')} className="flex items-center gap-1.5 px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50">
                      <RefreshCw className="w-4 h-4" /> Back to Mapping
                    </button>
                    <button onClick={handleImport} disabled={validRows.length === 0}
                      className="flex-1 py-2.5 bg-[#B87333] text-white rounded-xl text-sm font-semibold disabled:opacity-50 hover:bg-[#a06428]">
                      Import {validRows.length} records ({dedupeMode === 'update' ? 'update duplicates' : 'skip duplicates'})
                    </button>
                  </div>
                </div>
              )}

              {/* ── STEP: IMPORTING ── */}
              {step === 'importing' && (
                <div className="py-16 text-center space-y-4">
                  <Loader2 className="w-12 h-12 text-[#B87333] animate-spin mx-auto" />
                  <p className="font-semibold text-gray-700">Importing records…</p>
                  <p className="text-sm text-gray-400">Please wait, do not close this window</p>
                </div>
              )}

              {/* ── STEP: RESULT ── */}
              {step === 'result' && result && (
                <div className="space-y-4">
                  <div className="text-center py-4">
                    <CheckCircle className="w-14 h-14 text-green-500 mx-auto mb-3" />
                    <p className="text-xl font-bold text-gray-800">Import Complete</p>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div className="bg-green-50 border border-green-100 rounded-xl p-4 text-center">
                      <div className="text-3xl font-bold text-green-700">{result.created || 0}</div>
                      <div className="text-xs text-green-600 mt-1">Created</div>
                    </div>
                    <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-center">
                      <div className="text-3xl font-bold text-blue-700">{result.updated || 0}</div>
                      <div className="text-xs text-blue-600 mt-1">Updated</div>
                    </div>
                    <div className="bg-red-50 border border-red-100 rounded-xl p-4 text-center">
                      <div className="text-3xl font-bold text-red-600">{result.failed || 0}</div>
                      <div className="text-xs text-red-500 mt-1">Failed</div>
                    </div>
                  </div>

                  {result.errors?.length > 0 && (
                    <div className="bg-red-50 border border-red-100 rounded-xl p-4">
                      <p className="text-sm font-semibold text-red-700 mb-2">Failed rows:</p>
                      <div className="space-y-1 max-h-40 overflow-y-auto">
                        {result.errors.map((e, i) => (
                          <div key={i} className="text-xs text-red-600">Row {e.row}: {e.reason}</div>
                        ))}
                      </div>
                    </div>
                  )}

                  <button onClick={reset} className="w-full py-3 bg-[#B87333] text-white rounded-xl text-sm font-semibold hover:bg-[#a06428]">Done</button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}