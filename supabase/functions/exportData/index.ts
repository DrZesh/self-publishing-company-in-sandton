import { createClientFromRequest, serve } from '../_shared/server.ts';
import { jsPDF } from 'npm:jspdf@4.0.0';
import autoTable from 'npm:jspdf-autotable@3.8.2';

serve('exportData', async (req) => {
  try {
    const platform = createClientFromRequest(req);
    const user = await platform.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const { action, entity, format, filters, columns, data } = body;

    // Helper: Convert entity data to CSV
    const toCSV = (records, columns) => {
      if (!records || records.length === 0) return '';
      
      const headers = columns || Object.keys(records[0]).filter(k => 
        !k.includes('url') && !k.includes('snapshot') && typeof records[0][k] !== 'object'
      );
      
      const escapeCSV = (value) => {
        if (value === null || value === undefined) return '';
        const str = String(value);
        if (str.includes(',') || str.includes('"') || str.includes('\n')) {
          return `"${str.replace(/"/g, '""')}"`;
        }
        return str;
      };

      const rows = records.map(record => 
        headers.map(h => escapeCSV(record[h])).join(',')
      );

      return [headers.join(','), ...rows].join('\n');
    };

    // Helper: Generate PDF report
    const generatePDF = async (title, records, columns, company) => {
      const doc = new jsPDF();
      
      // Header
      if (company?.logo_url) {
        try {
          const logoResponse = await fetch(company.logo_url);
          const logoBuffer = await logoResponse.arrayBuffer();
          const logoBase64 = btoa(String.fromCharCode(...new Uint8Array(logoBuffer)));
          doc.addImage(`data:image/png;base64,${logoBase64}`, 'PNG', 14, 10, 40, 15);
        } catch (e) {
          // Logo failed, skip
        }
      }

      // Company info
      doc.setFontSize(16);
      doc.setTextColor(184, 115, 51); // Copper
      doc.text(title, 14, 35);
      
      doc.setFontSize(10);
      doc.setTextColor(100);
      doc.text(`Generated: ${new Date().toLocaleString('en-ZA')}`, 14, 42);
      doc.text(`By: ${user.full_name}`, 14, 47);
      doc.text(`Records: ${records.length}`, 14, 52);

      // Table
      const tableColumns = columns.map(c => ({ header: c.replace(/_/g, ' ').toUpperCase(), dataKey: c }));
      
      autoTable(doc, {
        startY: 60,
        head: [tableColumns.map(c => c.header)],
        body: records.map(r => columns.map(c => {
          const val = r[c];
          if (typeof val === 'object') return JSON.stringify(val);
          if (typeof val === 'boolean') return val ? 'Yes' : 'No';
          if (val instanceof Date) return val.toLocaleDateString('en-ZA');
          return val ?? '';
        })),
        theme: 'striped',
        headStyles: { fillColor: [184, 115, 51] }, // Copper
        styles: { fontSize: 8, cellPadding: 2 },
      });

      return doc.output('arraybuffer');
    };

    // EXPORT contacts
    if (action === 'export_contacts') {
      const contacts = await platform.entities.Contact.filter(filters || {}, '-created_date', data?.limit || 1000);
      
      const columns = data?.columns || [
        'full_name', 'email', 'phone', 'company', 'lifecycle_stage', 
        'pipeline_stage', 'pipeline_value', 'created_date'
      ];

      const filteredContacts = contacts.map(c => ({
        full_name: c.full_name,
        email: c.email,
        phone: c.phone,
        company: c.company,
        lifecycle_stage: c.lifecycle_stage,
        pipeline_stage: c.pipeline_stage,
        pipeline_value: c.pipeline_value,
        created_date: c.created_date,
      }));

      if (format === 'csv') {
        const csv = toCSV(filteredContacts, columns);
        return new Response(csv, {
          headers: {
            'Content-Type': 'text/csv',
            'Content-Disposition': 'attachment; filename="contacts.csv"',
          },
        });
      }

      if (format === 'pdf') {
        const company = (await platform.entities.CompanySettings.filter({ setting_key: 'main' }))[0];
        const pdfBuffer = await generatePDF('Contacts Report', filteredContacts, columns, company);
        return new Response(pdfBuffer, {
          headers: {
            'Content-Type': 'application/pdf',
            'Content-Disposition': 'attachment; filename="contacts.pdf"',
          },
        });
      }

      return Response.json({ contacts: filteredContacts });
    }

    // EXPORT quotes
    if (action === 'export_quotes') {
      const quotes = await platform.entities.Quote.filter(filters || {}, '-created_date', data?.limit || 500);
      
      const columns = data?.columns || [
        'quote_number', 'contact_id', 'status', 'total', 'created_date', 'accepted_at'
      ];

      const filteredQuotes = quotes.map(q => ({
        quote_number: q.quote_number,
        contact_id: q.contact_id,
        status: q.status,
        total: q.total,
        created_date: q.created_date,
        accepted_at: q.accepted_at,
      }));

      if (format === 'csv') {
        const csv = toCSV(filteredQuotes, columns);
        return new Response(csv, {
          headers: {
            'Content-Type': 'text/csv',
            'Content-Disposition': 'attachment; filename="quotes.csv"',
          },
        });
      }

      if (format === 'pdf') {
        const company = (await platform.entities.CompanySettings.filter({ setting_key: 'main' }))[0];
        const pdfBuffer = await generatePDF('Quotes Report', filteredQuotes, columns, company);
        return new Response(pdfBuffer, {
          headers: {
            'Content-Type': 'application/pdf',
            'Content-Disposition': 'attachment; filename="quotes.pdf"',
          },
        });
      }

      return Response.json({ quotes: filteredQuotes });
    }

    // EXPORT invoices
    if (action === 'export_invoices') {
      const invoices = await platform.entities.Invoice.filter(filters || {}, '-created_date', data?.limit || 500);
      
      const columns = data?.columns || [
        'invoice_number', 'contact_id', 'status', 'total', 'amount_paid', 'balance_due', 'issue_date', 'due_date'
      ];

      const filteredInvoices = invoices.map(i => ({
        invoice_number: i.invoice_number,
        contact_id: i.contact_id,
        status: i.status,
        total: i.total,
        amount_paid: i.amount_paid,
        balance_due: i.balance_due,
        issue_date: i.issue_date,
        due_date: i.due_date,
      }));

      if (format === 'csv') {
        const csv = toCSV(filteredInvoices, columns);
        return new Response(csv, {
          headers: {
            'Content-Type': 'text/csv',
            'Content-Disposition': 'attachment; filename="invoices.csv"',
          },
        });
      }

      if (format === 'pdf') {
        const company = (await platform.entities.CompanySettings.filter({ setting_key: 'main' }))[0];
        const pdfBuffer = await generatePDF('Invoices Report', filteredInvoices, columns, company);
        return new Response(pdfBuffer, {
          headers: {
            'Content-Type': 'application/pdf',
            'Content-Disposition': 'attachment; filename="invoices.pdf"',
          },
        });
      }

      return Response.json({ invoices: filteredInvoices });
    }

    // EXPORT production jobs
    if (action === 'export_production') {
      const jobs = await platform.entities.ProductionJob.filter(filters || {}, '-created_date', data?.limit || 500);
      
      const columns = data?.columns || [
        'job_number', 'job_type', 'status', 'quantity', 'assigned_operator', 
        'estimated_completion_date', 'actual_completion_date'
      ];

      const filteredJobs = jobs.map(j => ({
        job_number: j.job_number,
        job_type: j.job_type,
        status: j.status,
        quantity: j.quantity,
        assigned_operator: j.assigned_operator,
        estimated_completion_date: j.estimated_completion_date,
        actual_completion_date: j.actual_completion_date,
      }));

      if (format === 'csv') {
        const csv = toCSV(filteredJobs, columns);
        return new Response(csv, {
          headers: {
            'Content-Type': 'text/csv',
            'Content-Disposition': 'attachment; filename="production_jobs.csv"',
          },
        });
      }

      if (format === 'pdf') {
        const company = (await platform.entities.CompanySettings.filter({ setting_key: 'main' }))[0];
        const pdfBuffer = await generatePDF('Production Jobs Report', filteredJobs, columns, company);
        return new Response(pdfBuffer, {
          headers: {
            'Content-Type': 'application/pdf',
            'Content-Disposition': 'attachment; filename="production_jobs.pdf"',
          },
        });
      }

      return Response.json({ jobs: filteredJobs });
    }

    // EXPORT purchase orders
    if (action === 'export_purchase_orders') {
      const pos = await platform.entities.PurchaseOrder.filter(filters || {}, '-order_date', data?.limit || 500);
      
      const columns = data?.columns || [
        'po_number', 'supplier_id', 'status', 'total', 'order_date', 'expected_delivery_date'
      ];

      const filteredPOs = pos.map(po => ({
        po_number: po.po_number,
        supplier_id: po.supplier_id,
        status: po.status,
        total: po.total,
        order_date: po.order_date,
        expected_delivery_date: po.expected_delivery_date,
      }));

      if (format === 'csv') {
        const csv = toCSV(filteredPOs, columns);
        return new Response(csv, {
          headers: {
            'Content-Type': 'text/csv',
            'Content-Disposition': 'attachment; filename="purchase_orders.csv"',
          },
        });
      }

      if (format === 'pdf') {
        const company = (await platform.entities.CompanySettings.filter({ setting_key: 'main' }))[0];
        const pdfBuffer = await generatePDF('Purchase Orders Report', filteredPOs, columns, company);
        return new Response(pdfBuffer, {
          headers: {
            'Content-Type': 'application/pdf',
            'Content-Disposition': 'attachment; filename="purchase_orders.pdf"',
          },
        });
      }

      return Response.json({ pos: filteredPOs });
    }

    // EXPORT materials
    if (action === 'export_materials') {
      const materials = await platform.entities.Material.filter(filters || {}, '-name', data?.limit || 500);
      
      const columns = data?.columns || [
        'material_code', 'name', 'category', 'current_stock', 'minimum_stock', 
        'cost_per_unit', 'supplier_id'
      ];

      const filteredMaterials = materials.map(m => ({
        material_code: m.material_code,
        name: m.name,
        category: m.category,
        current_stock: m.current_stock,
        minimum_stock: m.minimum_stock,
        cost_per_unit: m.cost_per_unit,
        supplier_id: m.supplier_id,
      }));

      if (format === 'csv') {
        const csv = toCSV(filteredMaterials, columns);
        return new Response(csv, {
          headers: {
            'Content-Type': 'text/csv',
            'Content-Disposition': 'attachment; filename="materials.csv"',
          },
        });
      }

      if (format === 'pdf') {
        const company = (await platform.entities.CompanySettings.filter({ setting_key: 'main' }))[0];
        const pdfBuffer = await generatePDF('Materials Inventory Report', filteredMaterials, columns, company);
        return new Response(pdfBuffer, {
          headers: {
            'Content-Type': 'application/pdf',
            'Content-Disposition': 'attachment; filename="materials.pdf"',
          },
        });
      }

      return Response.json({ materials: filteredMaterials });
    }

    // GENERATE financial report
    if (action === 'financial_report') {
      const { start_date, end_date } = data || {};
      
      // Get invoices
      const invoices = await platform.entities.Invoice.filter({}, '-issue_date', 1000);
      const filteredInvoices = invoices.filter(inv => {
        if (!inv.issue_date) return false;
        const date = new Date(inv.issue_date);
        if (start_date && date < new Date(start_date)) return false;
        if (end_date && date > new Date(end_date)) return false;
        return true;
      });

      // Get payments
      const payments = await platform.entities.Payment.filter({}, '-payment_date', 1000);
      const filteredPayments = payments.filter(p => {
        if (!p.payment_date) return false;
        const date = new Date(p.payment_date);
        if (start_date && date < new Date(start_date)) return false;
        if (end_date && date > new Date(end_date)) return false;
        return true;
      });

      const report = {
        period: { start: start_date, end: end_date },
        total_invoiced: filteredInvoices.reduce((sum, i) => sum + (i.total || 0), 0),
        total_paid: filteredPayments.reduce((sum, p) => sum + (p.amount || 0), 0),
        outstanding: filteredInvoices.reduce((sum, i) => sum + (i.balance_due || 0), 0),
        invoice_count: filteredInvoices.length,
        payment_count: filteredPayments.length,
        by_status: {},
        by_month: {},
      };

      // Group by status
      filteredInvoices.forEach(inv => {
        const status = inv.status || 'Unknown';
        report.by_status[status] = (report.by_status[status] || 0) + 1;
      });

      // Group by month
      filteredInvoices.forEach(inv => {
        if (!inv.issue_date) return;
        const month = new Date(inv.issue_date).toLocaleString('en-ZA', { month: 'short', year: 'numeric' });
        report.by_month[month] = (report.by_month[month] || 0) + (inv.total || 0);
      });

      if (format === 'csv') {
        const csvData = [
          ['Metric', 'Value'],
          ['Total Invoiced', report.total_invoiced],
          ['Total Paid', report.total_paid],
          ['Outstanding', report.outstanding],
          ['Invoice Count', report.invoice_count],
          ['Payment Count', report.payment_count],
        ];
        const csv = toCSV(csvData, ['Metric', 'Value']);
        return new Response(csv, {
          headers: {
            'Content-Type': 'text/csv',
            'Content-Disposition': 'attachment; filename="financial_report.csv"',
          },
        });
      }

      return Response.json({ report });
    }

    return Response.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});