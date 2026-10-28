import React, { useState } from 'react';
import { Upload, Download, X } from 'lucide-react';
import { platform } from '@/api/platformClient';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export default function SimpleImportExport({ entityName, onRefresh }) {
  const [importing, setImporting] = useState(false);
  const [exporting, setExporting] = useState(false);

  const downloadTemplate = () => {
    const templates = {
      Contact: 'full_name,email,phone,company,billing_address,role\n"John Doe",john@example.com,"+27 82 000 0000","Company Name","123 Main St, Johannesburg",author\n',
      Invoice: 'contact_id,invoice_number,total,status,issue_date,due_date\n"contact_id_here",INV-001,5000,Sent,2024-01-01,2024-01-08\n',
      Quote: 'contact_id,quote_number,subtotal,vat_rate,total,valid_until\n"contact_id_here",QUOTE-001,5000,15,5750,2024-02-01\n',
      Payment: 'invoice_id,contact_id,amount,payment_date,payment_method\n"invoice_id_here","contact_id_here",5000,2024-01-15,EFT\n',
    };
    
    const csv = templates[entityName] || 'id,name,created_date\n';
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${entityName.toLowerCase()}_template.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Template downloaded');
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      const result = await platform.functions.invoke('importExportActions', {
        action: 'export',
        entity_name: entityName,
        format: 'csv'
      });
      
      const blob = new Blob([result.data.csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${entityName.toLowerCase()}_export_${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success(`Exported ${result.data.count} records`);
    } catch (error) {
      toast.error(error.message || 'Export failed');
    } finally {
      setExporting(false);
    }
  };

  const handleImport = async (file) => {
    if (!file || file.type !== 'text/csv') {
      toast.error('Please upload a CSV file');
      return;
    }

    setImporting(true);
    try {
      const text = await file.text();
      const lines = text.trim().split('\n');
      if (lines.length < 2) throw new Error('CSV file is empty');
      
      const headers = lines[0].split(',').map(h => h.trim());
      const data = lines.slice(1).map((line, i) => {
        const values = line.split(',').map(v => v.trim().replace(/^"|"$/g, ''));
        const row = {};
        headers.forEach((h, j) => { row[h] = values[j] || ''; });
        return row;
      });

      const result = await platform.functions.invoke('importExportActions', {
        action: 'import',
        entity_name: entityName,
        data: data
      });

      toast.success(`Imported ${result.data.success_count} records`);
      if (result.data.error_count > 0) {
        toast.error(`${result.data.error_count} failed - check console`);
        console.error('Import errors:', result.data.errors);
      }
      onRefresh?.();
    } catch (error) {
      toast.error(error.message || 'Import failed');
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Button variant="outline" size="sm" onClick={downloadTemplate} disabled={importing || exporting}>
        <Download className="w-3 h-3 mr-2" />
        Template
      </Button>
      <Button variant="outline" size="sm" onClick={handleExport} disabled={importing || exporting}>
        <Upload className="w-3 h-3 mr-2" />
        {exporting ? 'Exporting...' : 'Export'}
      </Button>
      <label>
        <Button size="sm" className="bg-[#B87333] hover:bg-[#A0632A]" disabled={importing || exporting}>
          <Download className="w-3 h-3 mr-2" />
          {importing ? 'Importing...' : 'Import CSV'}
        </Button>
        <input
          type="file"
          accept=".csv"
          className="hidden"
          onChange={(e) => e.target.files?.[0] && handleImport(e.target.files[0])}
          disabled={importing || exporting}
        />
      </label>
    </div>
  );
}