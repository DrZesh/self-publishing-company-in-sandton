import { useRef, useState } from 'react';
import { Upload, Download, X, CheckCircle, AlertCircle, Loader2, ArrowRight, Eye, RefreshCw, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

// ── CSV Utilities ─────────────────────────────────────────────────────────────

export function downloadCsv(data, columns, filename) {
  const header = columns.map(c => '"' + c.label + '"').join(',');
  const rows = data.map(row =>
    columns.map(c => {
      const val = c.render ? c.render(row) : (row[c.key] ?? '');
      return '"' + String(val).replace(/"/g, '""') + '"';
    }).join(',')
  );
  const csv = [header, ...rows].join('\n');
  const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}

function parseCsv(text) {
  const lines = text.trim().split(/\r?\n/);
  if (lines.length < 2) return { headers: [], rows: [] };
  const headers = splitCsvLine(lines[0]).map(h => h.replace(/^"|"$/g, '').trim());
  const rows = lines.slice(1).filter(l => l.trim()).map((line, idx) => {
    const vals = splitCsvLine(line).map(v => v.replace(/^"|"$/g, '').trim());
    const obj = { __rowNum: idx + 2 };
    headers.forEach((h, i) => { obj[h] = (vals[i] ?? '').trim(); });
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

// ── Zoho CRM field aliases ────────────────────────────────────────────────────
const ZOHO_ALIASES = {
  fullname: 'full_name', contactname: 'full_name', leadname: 'full_name', name: 'full_name',
  emailaddress: 'email', email1: 'email',
  mobile: 'phone', phonenumber: 'phone', mobilephone: 'phone', homephone: 'phone',
  accountname: 'company', organization: 'company', companyname: 'company',
  title: 'role', jobtitle: 'role', position: 'role',
  leadstatus: 'lifecycle_stage', contactstage: 'lifecycle_stage', status: 'lifecycle_stage',
  mailingcity: 'city', othercity: 'city',
  state: 'province', stateprovince: 'province', mailingstate: 'province', otherstate: 'province',
  booktitle: 'book_title', book: 'book_title',
  stage: 'pipeline_stage', pipelinestage: 'pipeline_stage', dealstage: 'pipeline_stage',
  amount: 'pipeline_value', dealvalue: 'pipeline_value', revenue: 'pipeline_value',
  notes: 'description', comments: 'description', memo: 'description',
};

function normalizeHeader(h) {
  return h.toLowerCase().replace(/[^a-z0-9]/g, '');
}

function autoMatch(csvHeaders, importFields) {
  const mapping = {};
  csvHeaders.forEach(csvHeader => {
    const n = normalizeHeader(csvHeader);
    if (n === 'firstname' || n === 'first') { mapping[csvHeader] = '__first_name__'; return; }
    if (n === 'lastname' || n === 'last') { mapping[csvHeader] = '__last_name__'; return; }
    const keyMatch = importFields.find(f => normalizeHeader(f.key) === n);
    if (keyMatch) { mapping[csvHeader] = keyMatch.key; return; }
    const labelMatch = importFields.find(f => normalizeHeader(f.label) === n);
    if (labelMatch) { mapping[csvHeader] = labelMatch.key; return; }
    if (ZOHO_ALIASES[n]) {
      const found = importFields.find(f => f.key === ZOHO_ALIASES[n]);
      if (found) { mapping[csvHeader] = found.key; return; }
    }
    mapping[csvHeader] = '__ignore';
  });
  return mapping;
}

// ── Map + validate rows ───────────────────────────────────────────────────────

function applyMappingAndValidate(rawRows, mapping, importFields) {
  const firstNameCol = Object.keys(mapping).find(k => mapping[k] === '__first_name__');
  const lastNameCol = Object.keys(mapping).find(k => mapping[k] === '__last_name__');

  return rawRows.map(raw => {
    const mapped = { _idx: raw.__rowNum };
    Object.entries(mapping).forEach(([csvCol, dashKey]) => {
      if (dashKey === '__ignore' || dashKey === '__first_name__' || dashKey === '__last_name__') return;
      if (mapped[dashKey] === undefined || mapped[dashKey] === '') {
        mapped[dashKey] = (raw[csvCol] ?? '').trim();
      }
    });
    if (firstNameCol || lastNameCol) {
      const fn = firstNameCol ? (raw[firstNameCol] || '').trim() : '';
      const ln = lastNameCol ? (raw[lastNameCol] || '').trim() : '';
      if (!mapped.full_name) mapped.full_name = [fn, ln].filter(Boolean).join(' ');
    }
    const errors = [];
    const warnings = [];
    importFields.forEach(f => {
      const val = (mapped[f.key] || '').trim();
      if (f.required && !val) errors.push(f.label + ' is required');
      if (f.type === 'email' && val && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) {
        warnings.push(f.label + ' may not be valid');
      }
      if (f.type === 'number' && val && isNaN(parseFloat(val))) {
        errors.push(f.label + ' must be a number (got: "' + val + '")');
      }
    });
    return { ...mapped, _errors: errors, _warnings: warnings };
  });
}

// ── Main Component ────────────────────────────────────────────────────────────

export default function CsvImportExport({
  data = [],
  exportColumns = [],
  exportFilename = 'export.csv',
  importFields = [],
  onImport,
  entityLabel = 'records',
  importDisabled,
}) {
  const fileRef = useRef();
  const [step, setStep] = useState('idle');
  const [csvData, setCsvData] = useState(null);
  const [mapping, setMapping] = useState({});
  const [mappedRows, setMappedRows] = useState([]);
  const [result, setResult] = useState(null);
  const [dedupeMode, setDedupeMode] = useState('skip');

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const parsed = parseCsv(ev.target.result);
        if (parsed.headers.length === 0) { toast.error('Could not read CSV headers'); return; }
        if (parsed.rows.length === 0) { toast.error('No data rows found in file'); return; }
        const autoMapping = autoMatch(parsed.headers, importFields);
        setCsvData(parsed);
        setMapping(autoMapping);
        setResult(null);
        setStep('map');
        toast.success('Loaded ' + parsed.rows.length + ' rows with ' + parsed.headers.length + ' columns');
      } catch (err) {
        toast.error('Failed to parse CSV: ' + err.message);
      }
    };
    reader.onerror = () => toast.error('Failed to read file');
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleProceedToPreview = () => {
    const rows = applyMappingAndValidate(csvData.rows, mapping, importFields);
    setMappedRows(rows);
    setStep('preview');
  };

  const handleImport = async () => {
    const toImport = mappedRows.filter(r => r._errors.length === 0);
    if (toImport.length === 0) { toast.error('No valid rows to import'); return; }
    setStep('importing');
    try {
      const res = await onImport(toImport, { dedupeMode });
      setResult(res);
      setStep('result');
      toast.success('Import complete: ' + (res.created || 0) + ' created, ' + (res.updated || 0) + ' updated');
    } catch (err) {
      toast.error('Import failed: ' + (err.message || 'Unknown error'));
      setStep('preview');
    }
  };

  const reset = () => { setStep('idle'); setCsvData(null); setMapping({}); setMappedRows([]); setResult(null); };

  const downloadTemplate = () => {
    const header = importFields.map(f => '"' + f.label + '"').join(',');
    const blob = new Blob(['\ufeff' + header + '\n'], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = entityLabel + '-import-template.csv'; a.click();
    URL.revokeObjectURL(url);
  };

  const validRows = mappedRows.filter(r => r._errors.length === 0);
  const invalidRows = mappedRows.filter(r => r._errors.length > 0);
  const warnRows = mappedRows.filter(r => r._errors.length === 0 && r._warnings.length > 0);

  const mappedFieldKeys = Object.values(mapping).filter(v => !['__ignore', '__first_name__', '__last_name__'].includes(v));
  const hasFirstLast = Object.values(mapping).some(v => v === '__first_name__' || v === '__last_name__');
  const uniqueMapped = new Set(mappedFieldKeys).size + (hasFirstLast ? 1 : 0);
  const ignoredCount = Object.values(mapping).filter(v => v === '__ignore').length;
  const displayFields = importFields.filter(f => mappedFieldKeys.includes(f.key) || (f.key === 'full_name' && hasFirstLast));

  return (
    <>
      <div className="flex items-center gap-2">
        <button
          onClick={() => downloadCsv(data, exportColumns, exportFilename)}
          className="flex items-center gap-1.5 px-3 py-2 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 bg-white hover:bg-gray-50 hover:border-[#B87333] transition-colors"
        >
          <Download className="w-4 h-4" /> Export CSV
        </button>
        {!importDisabled && (
          <>
            <input ref={fileRef} type="file" accept=".csv,.txt" className="hidden" onChange={handleFile} />
            <button
              onClick={() => fileRef.current?.click()}
              className="flex items-center gap-1.5 px-3 py-2 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 bg-white hover:bg-gray-50 hover:border-[#B87333] transition-colors"
            >
              <Upload className="w-4 h-4" /> Import CSV
            </button>
          </>
        )}
      </div>

      {step !== 'idle' && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={step === 'importing' ? undefined : reset}>
          <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl" onClick={e => e.stopPropagation()}>

            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 flex-shrink-0">
              <div className="flex items-center gap-3">
                <h3 className="font-bold text-gray-900 text-lg">Import {entityLabel}</h3>
                {csvData && (
                  <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
                    {csvData.rows.length} rows
                  </span>
                )}
              </div>
              <div className="flex items-center gap-4">
                <div className="hidden sm:flex items-center gap-2 text-xs">
                  {[['map','1. Map'], ['preview','2. Preview'], ['result','3. Results']].map(([s, label], i, arr) => (
                    <span key={s} className="flex items-center gap-1.5">
                      <span className={`px-2 py-0.5 rounded font-semibold ${step === s ? 'bg-[#B87333] text-white' : 'bg-gray-100 text-gray-400'}`}>{label}</span>
                      {i < arr.length - 1 && <ArrowRight className="w-3 h-3 text-gray-300" />}
                    </span>
                  ))}
                </div>
                {step !== 'importing' && (
                  <button onClick={reset} className="p-1.5 hover:bg-gray-100 rounded-lg"><X className="w-4 h-4 text-gray-400" /></button>
                )}
              </div>
            </div>

            {/* Body */}
            <div className="overflow-y-auto flex-1 p-6">

              {/* MAP */}
              {step === 'map' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-600">Match your CSV columns to dashboard fields. Zoho CRM fields are auto-detected.</p>
                    <button onClick={downloadTemplate} className="text-xs text-[#B87333] hover:underline flex items-center gap-1 flex-shrink-0 ml-4">
                      <Download className="w-3 h-3" /> Template
                    </button>
                  </div>
                  <div className="grid grid-cols-3 gap-3 text-center">
                    <div className="bg-green-50 border border-green-100 rounded-xl p-3">
                      <div className="text-xl font-bold text-green-700">{uniqueMapped}</div>
                      <div className="text-xs text-green-600">Fields mapped</div>
                    </div>
                    <div className="bg-gray-50 border border-gray-100 rounded-xl p-3">
                      <div className="text-xl font-bold text-gray-500">{ignoredCount}</div>
                      <div className="text-xs text-gray-400">Ignored</div>
                    </div>
                    <div className="bg-blue-50 border border-blue-100 rounded-xl p-3">
                      <div className="text-xl font-bold text-blue-700">{csvData.rows.length}</div>
                      <div className="text-xs text-blue-600">Total rows</div>
                    </div>
                  </div>
                  <div className="rounded-xl border border-gray-100 overflow-hidden">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase w-1/2">CSV Column</th>
                          <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase w-1/2">Maps To</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {csvData.headers.map(header => {
                          const val = mapping[header] || '__ignore';
                          const isAutoMatched = val !== '__ignore';
                          return (
                            <tr key={header} className={isAutoMatched ? 'bg-green-50/50' : ''}>
                              <td className="px-4 py-2.5">
                                <span className="font-medium text-gray-800">{header}</span>
                                {isAutoMatched && <span className="ml-2 text-[10px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded font-bold">AUTO</span>}
                              </td>
                              <td className="px-4 py-2.5">
                                <select value={val} onChange={e => setMapping(m => ({ ...m, [header]: e.target.value }))}
                                  className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-sm bg-white focus:outline-none focus:border-[#B87333]">
                                  <option value="__ignore">— Ignore —</option>
                                  <option value="__first_name__">First Name (combine into Full Name)</option>
                                  <option value="__last_name__">Last Name (combine into Full Name)</option>
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
                  <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                    <div className="flex items-center gap-2">
                      <label className="text-sm text-gray-600 font-medium">On duplicate email:</label>
                      <select value={dedupeMode} onChange={e => setDedupeMode(e.target.value)}
                        className="border border-gray-200 rounded-lg px-2 py-1.5 text-sm bg-white">
                        <option value="skip">Skip duplicates</option>
                        <option value="update">Update existing</option>
                      </select>
                    </div>
                    <button onClick={handleProceedToPreview}
                      className="flex items-center gap-2 px-5 py-2.5 bg-[#B87333] text-white rounded-xl text-sm font-semibold hover:bg-[#a06428]">
                      <Eye className="w-4 h-4" /> Preview
                    </button>
                  </div>
                </div>
              )}

              {/* PREVIEW */}
              {step === 'preview' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-3 text-center">
                    <div className="bg-green-50 border border-green-100 rounded-xl p-3">
                      <div className="text-2xl font-bold text-green-700">{validRows.length}</div>
                      <div className="text-xs text-green-600">Ready</div>
                    </div>
                    <div className={`border rounded-xl p-3 ${warnRows.length > 0 ? 'bg-yellow-50 border-yellow-100' : 'bg-gray-50 border-gray-100'}`}>
                      <div className={`text-2xl font-bold ${warnRows.length > 0 ? 'text-yellow-600' : 'text-gray-300'}`}>{warnRows.length}</div>
                      <div className={`text-xs ${warnRows.length > 0 ? 'text-yellow-600' : 'text-gray-300'}`}>Warnings</div>
                    </div>
                    <div className={`border rounded-xl p-3 ${invalidRows.length > 0 ? 'bg-red-50 border-red-100' : 'bg-gray-50 border-gray-100'}`}>
                      <div className={`text-2xl font-bold ${invalidRows.length > 0 ? 'text-red-600' : 'text-gray-300'}`}>{invalidRows.length}</div>
                      <div className={`text-xs ${invalidRows.length > 0 ? 'text-red-500' : 'text-gray-300'}`}>Skipped</div>
                    </div>
                  </div>

                  {invalidRows.length > 0 && (
                    <div className="bg-red-50 border border-red-100 rounded-xl p-4">
                      <p className="text-sm font-semibold text-red-700 mb-2 flex items-center gap-1.5">
                        <AlertCircle className="w-4 h-4" /> Rows with errors (will be skipped):
                      </p>
                      <div className="space-y-1 max-h-32 overflow-y-auto">
                        {invalidRows.slice(0, 15).map(r => (
                          <div key={r._idx} className="text-xs text-red-600">Row {r._idx}: {r._errors.join('; ')}</div>
                        ))}
                        {invalidRows.length > 15 && <div className="text-xs text-red-400">...and {invalidRows.length - 15} more</div>}
                      </div>
                    </div>
                  )}

                  {warnRows.length > 0 && (
                    <div className="bg-yellow-50 border border-yellow-100 rounded-xl p-3 text-xs text-yellow-700 flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                      {warnRows.length} rows have warnings but will still be imported
                    </div>
                  )}

                  {validRows.length > 0 && displayFields.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">First 5 valid rows</p>
                      <div className="rounded-xl border border-gray-100 overflow-auto max-h-56">
                        <table className="w-full text-xs">
                          <thead className="bg-gray-50 sticky top-0">
                            <tr>
                              <th className="px-3 py-2 text-left font-semibold text-gray-400">#</th>
                              {displayFields.map(f => (
                                <th key={f.key} className="px-3 py-2 text-left font-semibold text-gray-500 whitespace-nowrap">{f.label}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-50">
                            {validRows.slice(0, 5).map(row => (
                              <tr key={row._idx}>
                                <td className="px-3 py-2 text-gray-400">{row._idx}</td>
                                {displayFields.map(f => (
                                  <td key={f.key} className="px-3 py-2 text-gray-700 max-w-[140px] truncate">
                                    {row[f.key] || '—'}
                                  </td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  <div className="flex gap-3 pt-2 border-t border-gray-100">
                    <button onClick={() => setStep('map')}
                      className="flex items-center gap-1.5 px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50">
                      <RefreshCw className="w-4 h-4" /> Back
                    </button>
                    <button onClick={handleImport} disabled={validRows.length === 0}
                      className="flex-1 py-2.5 bg-[#B87333] text-white rounded-xl text-sm font-semibold disabled:opacity-40 hover:bg-[#a06428]">
                      {validRows.length === 0 ? 'No valid rows' : 'Import ' + validRows.length + ' ' + entityLabel + ' (' + (dedupeMode === 'update' ? 'update duplicates' : 'skip duplicates') + ')'}
                    </button>
                  </div>
                </div>
              )}

              {/* IMPORTING */}
              {step === 'importing' && (
                <div className="py-16 text-center space-y-4">
                  <Loader2 className="w-14 h-14 text-[#B87333] animate-spin mx-auto" />
                  <p className="font-semibold text-gray-700 text-lg">Importing {entityLabel}...</p>
                  <p className="text-sm text-gray-400">Please wait, do not close this window</p>
                </div>
              )}

              {/* RESULT */}
              {step === 'result' && result && (
                <div className="space-y-5">
                  <div className="text-center py-4">
                    <CheckCircle className="w-14 h-14 text-green-500 mx-auto mb-3" />
                    <p className="text-xl font-bold text-gray-800">Import Complete</p>
                  </div>
                  <div className="grid grid-cols-3 gap-3 text-center">
                    <div className="bg-green-50 border border-green-100 rounded-xl p-4">
                      <div className="text-3xl font-bold text-green-700">{result.created || 0}</div>
                      <div className="text-xs text-green-600 mt-1 font-medium">Created</div>
                    </div>
                    <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
                      <div className="text-3xl font-bold text-blue-700">{result.updated || 0}</div>
                      <div className="text-xs text-blue-600 mt-1 font-medium">Updated</div>
                    </div>
                    <div className={`border rounded-xl p-4 ${result.failed > 0 ? 'bg-red-50 border-red-100' : 'bg-gray-50 border-gray-100'}`}>
                      <div className={`text-3xl font-bold ${result.failed > 0 ? 'text-red-600' : 'text-gray-400'}`}>{result.failed || 0}</div>
                      <div className={`text-xs mt-1 font-medium ${result.failed > 0 ? 'text-red-500' : 'text-gray-400'}`}>Failed</div>
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