import { useState } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { platform } from '@/api/platformClient';
import { Button } from '@/components/ui/button';
import { Download, FileJson, FileText, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const ENTITIES = [
  { key: 'CompanySettings', label: 'Company Settings' },
  { key: 'Contact', label: 'Clients / Contacts' },
  { key: 'Quote', label: 'Quotes' },
  { key: 'Invoice', label: 'Invoices' },
  { key: 'Payment', label: 'Payments' },
  { key: 'Receipt', label: 'Receipts' },
  { key: 'CreditNote', label: 'Credit Notes' },
];

function flattenForCsv(records) {
  if (!records.length) return [[], []];
  // Collect all keys across all records
  const allKeys = new Set();
  records.forEach(r => collectKeys('', r, allKeys));
  const headers = Array.from(allKeys);

  const rows = records.map(r => {
    return headers.map(h => {
      const val = getNestedValue(r, h);
      if (val === null || val === undefined) return '';
      if (typeof val === 'object') return JSON.stringify(val);
      return String(val);
    });
  });

  return [headers, rows];
}

function collectKeys(prefix, obj, set) {
  if (obj === null || obj === undefined) return;
  if (typeof obj !== 'object' || Array.isArray(obj)) {
    set.add(prefix);
    return;
  }
  Object.keys(obj).forEach(k => {
    const fullKey = prefix ? `${prefix}.${k}` : k;
    const val = obj[k];
    // Keep arrays (like line_items) as JSON strings — don't flatten them
    if (Array.isArray(val)) {
      set.add(fullKey);
    } else if (val && typeof val === 'object') {
      collectKeys(fullKey, val, set);
    } else {
      set.add(fullKey);
    }
  });
}

function getNestedValue(obj, path) {
  return path.split('.').reduce((acc, k) => {
    if (acc === null || acc === undefined) return undefined;
    return acc[k];
  }, obj);
}

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function escapeCsvValue(val) {
  if (val === null || val === undefined) return '';
  const str = String(val);
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export default function AdminExportData() {
  const [loading, setLoading] = useState({});

  const fetchAll = async (entityKey) => {
    return platform.entities[entityKey].list('-created_date', 10000);
  };

  const handleDownloadJson = async (entityKey, label) => {
    setLoading(l => ({ ...l, [`${entityKey}_json`]: true }));
    try {
      const records = await fetchAll(entityKey);
      const json = JSON.stringify(records, null, 2);
      const blob = new Blob([json], { type: 'application/json' });
      downloadBlob(blob, `${entityKey}-export-${new Date().toISOString().split('T')[0]}.json`);
      toast.success(`${label}: ${records.length} records exported as JSON`);
    } catch (e) {
      toast.error(`Export failed: ${e.message}`);
    } finally {
      setLoading(l => ({ ...l, [`${entityKey}_json`]: false }));
    }
  };

  const handleDownloadCsv = async (entityKey, label) => {
    setLoading(l => ({ ...l, [`${entityKey}_csv`]: true }));
    try {
      const records = await fetchAll(entityKey);
      if (!records.length) {
        toast.info(`${label}: No records to export`);
        return;
      }
      const [headers, rows] = flattenForCsv(records);
      const csvLines = [
        headers.map(escapeCsvValue).join(','),
        ...rows.map(row => row.map(escapeCsvValue).join(',')),
      ];
      const blob = new Blob([csvLines.join('\n')], { type: 'text/csv;charset=utf-8;' });
      downloadBlob(blob, `${entityKey}-export-${new Date().toISOString().split('T')[0]}.csv`);
      toast.success(`${label}: ${records.length} records exported as CSV`);
    } catch (e) {
      toast.error(`Export failed: ${e.message}`);
    } finally {
      setLoading(l => ({ ...l, [`${entityKey}_csv`]: false }));
    }
  };

  const handleExportAll = async () => {
    toast.info('Exporting all entities as JSON…');
    const allData = {};
    for (const { key, label } of ENTITIES) {
      try {
        allData[key] = await fetchAll(key);
      } catch {
        allData[key] = [];
      }
    }
    const blob = new Blob([JSON.stringify(allData, null, 2)], { type: 'application/json' });
    downloadBlob(blob, `CreativeBooks-full-export-${new Date().toISOString().split('T')[0]}.json`);
    toast.success('Full export downloaded');
  };

  return (
    <AdminLayout>
      <div className="min-h-screen -m-6 p-6 relative" style={{ backgroundImage: `url(https://images.unsplash.com/photo-1614851099511-773084f6911d?w=1600&q=80)`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
        <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, rgba(100,120,200,0.55) 0%, rgba(180,100,200,0.45) 50%, rgba(100,160,220,0.5) 100%)' }} />
      <div className="relative z-10 max-w-3xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white drop-shadow">Export Data</h1>
            <p className="text-sm text-white/60 mt-0.5">Download all records exactly as stored — no transformations, all fields and relationships included.</p>
          </div>
          <Button onClick={handleExportAll} className="gap-2 bg-black/30 hover:bg-black/40 text-white border border-white/20">
            <Download className="w-4 h-4" /> Export Everything (JSON)
          </Button>
        </div>

        <div className="rounded-xl p-4 text-sm text-orange-200" style={{ background: 'rgba(0,0,0,0.25)', backdropFilter: 'blur(24px)', border: '1px solid rgba(251,191,36,0.3)' }}>
          <strong>Admin only.</strong> Exports include all fields including entity IDs, relationship links, and structured objects (e.g. line_items are exported in full structured form, not flattened). JSON exports are ideal for Supabase migration.
        </div>

        <div className="space-y-3">
          {ENTITIES.map(({ key, label }) => (
            <div key={key} className="rounded-xl p-5 flex items-center justify-between gap-4" style={{ background: 'rgba(0,0,0,0.25)', backdropFilter: 'blur(24px)', border: '1px solid rgba(255,255,255,0.15)' }}>
              <div>
                <p className="font-semibold text-white">{label}</p>
                <p className="text-xs text-white/40 font-mono mt-0.5">{key}</p>
              </div>
              <div className="flex gap-2 shrink-0">
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2 text-white border-white/30 bg-white/10 hover:bg-white/20"
                  disabled={loading[`${key}_json`]}
                  onClick={() => handleDownloadJson(key, label)}
                >
                  {loading[`${key}_json`]
                    ? <Loader2 className="w-4 h-4 animate-spin" />
                    : <FileJson className="w-4 h-4 text-blue-300" />}
                  JSON
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2 text-white border-white/30 bg-white/10 hover:bg-white/20"
                  disabled={loading[`${key}_csv`]}
                  onClick={() => handleDownloadCsv(key, label)}
                >
                  {loading[`${key}_csv`]
                    ? <Loader2 className="w-4 h-4 animate-spin" />
                    : <FileText className="w-4 h-4 text-green-300" />}
                  CSV
                </Button>
              </div>
            </div>
          ))}
        </div>

        <p className="text-xs text-white/30 text-center pb-4">
          CSV exports flatten nested objects with dot-notation keys. Arrays (e.g. line_items) are kept as JSON strings within cells.
        </p>
      </div>
      </div>
    </AdminLayout>
  );
}