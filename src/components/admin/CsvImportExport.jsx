import React, { useState, useCallback, useRef } from 'react';
import { Upload, Download, FileText, CheckCircle, AlertCircle, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { platform } from '@/api/platformClient';

export default function CsvImportExport({ 
  data, 
  exportColumns, 
  exportFilename, 
  importFields, 
  onImport, 
  entityLabel 
}) {
  const [dragActive, setDragActive] = useState(false);
  const [importing, setImporting] = useState(false);
  const [importResults, setImportResults] = useState(null);
  const [previewData, setPreviewData] = useState(null);
  const [showImportPanel, setShowImportPanel] = useState(false);
  const fileInputRef = useRef(null);

  const downloadTemplate = () => {
    const headers = importFields.map(f => f.label).join(',');
    const csv = [headers, ...Array(2).fill(importFields.map(f => 'example').join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${entityLabel.toLowerCase()}_template.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Template downloaded');
  };

  const exportCsv = () => {
    if (!data?.length) {
      toast.error('No data to export');
      return;
    }
    const headers = exportColumns.map(c => c.label).join(',');
    const rows = data.map(row => 
      exportColumns.map(col => {
        const val = col.render ? col.render(row) : row[col.key];
        return `"${String(val || '').replace(/"/g, '""')}"`;
      }).join(',')
    );
    const csv = [headers, ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = exportFilename;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Export downloaded');
  };

  const parseCSV = (text) => {
    const rows = [];
    let currentRow = [];
    let currentField = '';
    let inQuotes = false;
    let i = 0;
    
    while (i < text.length) {
      const char = text[i];
      
      if (char === '"') {
        if (inQuotes && text[i + 1] === '"') {
          // Escaped quote
          currentField += '"';
          i += 2;
          continue;
        }
        // Toggle quote mode
        inQuotes = !inQuotes;
        i++;
        continue;
      }
      
      if (char === ',' && !inQuotes) {
        // End of field
        currentRow.push(currentField.trim());
        currentField = '';
        i++;
        continue;
      }
      
      if ((char === '\n' || char === '\r') && !inQuotes) {
        // End of row
        currentRow.push(currentField.trim());
        if (currentRow.length > 0 && currentRow.some(f => f !== '')) {
          rows.push(currentRow);
        }
        currentRow = [];
        currentField = '';
        // Skip \r\n or just \n
        if (char === '\r' && text[i + 1] === '\n') {
          i += 2;
        } else {
          i++;
        }
        continue;
      }
      
      currentField += char;
      i++;
    }
    
    // Add last field/row if exists
    if (currentField || currentRow.length > 0) {
      currentRow.push(currentField.trim());
      if (currentRow.some(f => f !== '')) {
        rows.push(currentRow);
      }
    }
    
    if (rows.length < 2) return [];
    
    // Convert to objects using header row
    const headers = rows[0];
    return rows.slice(1).map(row => {
      const obj = {};
      headers.forEach((h, i) => {
        obj[h] = row[i] || '';
      });
      return obj;
    });
  };

  const handleFile = async (file) => {
    if (!file || (file.type !== 'text/csv' && !file.name.endsWith('.csv'))) {
      toast.error('Please upload a CSV file');
      return;
    }

    const text = await file.text();
    const data = parseCSV(text);
    
    if (data.length === 0) {
      toast.error('CSV file is empty');
      return;
    }

    setPreviewData(data);
  };

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files?.[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  }, []);

  const handleImport = async () => {
    if (!previewData?.length) return;
    
    setImporting(true);
    try {
      const result = await onImport(previewData);
      setImportResults(result);
      if (result.created > 0) {
        toast.success(`Imported ${result.created} records`);
      }
      if (result.failed > 0) {
        toast.warning(`${result.failed} records failed`);
      }
    } catch (error) {
      toast.error(error.message || 'Import failed');
      setImportResults({ created: 0, failed: previewData.length, error: error.message });
    } finally {
      setImporting(false);
    }
  };

  const resetImport = () => {
    setPreviewData(null);
    setImportResults(null);
    setShowImportPanel(false);
  };

  return (
    <div className="relative inline-block">
      {/* Export Button */}
      <Button variant="outline" size="sm" onClick={exportCsv} className="mr-2">
        <Download className="w-3 h-3 mr-2" />
        Export
      </Button>

      {/* Import Button */}
      <Button 
        variant="default" 
        size="sm" 
        className="bg-[#B87333] hover:bg-[#A0632A]"
        onClick={() => setShowImportPanel(!showImportPanel)}
      >
        <Upload className="w-3 h-3 mr-2" />
        Import
      </Button>

      {/* Import Panel */}
      {showImportPanel && (
        <div className="absolute top-full right-0 mt-2 w-[420px] z-50">
          <div className="bg-white border border-gray-200 rounded-xl shadow-xl p-4">
            {!previewData ? (
              <div
                className={`border-2 border-dashed rounded-xl p-6 text-center transition-colors ${
                  dragActive ? 'border-[#B87333] bg-orange-50/50' : 'border-gray-200 hover:border-gray-300'
                }`}
                onDragEnter={() => setDragActive(true)}
                onDragLeave={() => setDragActive(false)}
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
              >
                <Upload className="w-8 h-8 text-gray-300 mx-auto mb-3" />
                <h3 className="text-sm font-semibold text-gray-700 mb-2">Import {entityLabel}</h3>
                <p className="text-xs text-gray-500 mb-3">Drag & drop CSV file or click to browse</p>
                <div className="flex items-center justify-center gap-2 mb-3">
                  <Button variant="outline" size="sm" onClick={downloadTemplate}>
                    <Download className="w-3 h-3 mr-2" />
                    Template
                  </Button>
                  <>
                    <Button 
                      variant="default" 
                      size="sm" 
                      className="bg-[#B87333] hover:bg-[#A0632A]"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <FileText className="w-3 h-3 mr-2" />
                      Browse
                    </Button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".csv"
                      className="hidden"
                      onChange={(e) => {
                        if (e.target.files?.[0]) {
                          handleFile(e.target.files[0]);
                        }
                        // Reset value so same file can be selected again
                        e.target.value = '';
                      }}
                    />
                  </>
                </div>
                {importFields?.length > 0 && (
                  <div className="text-left">
                    <p className="text-xs font-semibold text-gray-500 mb-1">Expected fields:</p>
                    <div className="flex flex-wrap gap-1">
                      {importFields.map(f => (
                        <span 
                          key={f.key} 
                          className={`text-[10px] px-1.5 py-0.5 rounded ${
                            f.required ? 'bg-red-50 text-red-600 border border-red-200' : 'bg-gray-100 text-gray-600'
                          }`}
                        >
                          {f.label}{f.required && '*'}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : !importResults ? (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-gray-700">Preview ({previewData.length} rows)</h3>
                  <button onClick={resetImport} className="text-gray-400 hover:text-gray-600">
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="max-h-40 overflow-auto text-xs border rounded-lg">
                  <table className="w-full">
                    <thead className="bg-gray-50 sticky top-0">
                      <tr>
                        {Object.keys(previewData[0]).map(key => (
                          <th key={key} className="text-left px-2 py-1.5 font-medium text-gray-500 whitespace-nowrap">{key}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {previewData.slice(0, 5).map((row, i) => (
                        <tr key={i} className="border-t border-gray-100">
                          {Object.values(row).map((val, j) => (
                            <td key={j} className="px-2 py-1.5 text-gray-600 whitespace-nowrap">{val}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {previewData.length > 5 && (
                    <p className="text-xs text-gray-400 text-center py-2">
                      ...and {previewData.length - 5} more rows
                    </p>
                  )}
                </div>
                <div className="flex items-center justify-end gap-2 mt-4">
                  <Button variant="outline" size="sm" onClick={resetImport}>Cancel</Button>
                  <Button 
                    size="sm" 
                    className="bg-[#B87333] hover:bg-[#A0632A]"
                    onClick={handleImport}
                    disabled={importing}
                  >
                    {importing ? 'Importing...' : `Import ${previewData.length} Records`}
                  </Button>
                </div>
              </div>
            ) : (
              <div>
                <div className="flex items-center gap-3 mb-3">
                  {importResults.failed ? (
                    <AlertCircle className="w-5 h-5 text-amber-500" />
                  ) : (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  )}
                  <h3 className="text-sm font-semibold text-gray-700">Import Complete</h3>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-green-50 rounded-lg p-3">
                    <p className="text-xs text-gray-500 mb-1">Success</p>
                    <p className="text-lg font-bold text-green-600">{importResults.created}</p>
                  </div>
                  {importResults.failed > 0 && (
                    <div className="bg-amber-50 rounded-lg p-3">
                      <p className="text-xs text-gray-500 mb-1">Failed</p>
                      <p className="text-lg font-bold text-amber-600">{importResults.failed}</p>
                    </div>
                  )}
                </div>
                <Button variant="outline" size="sm" onClick={resetImport} className="mt-3 w-full">
                  Import More
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}