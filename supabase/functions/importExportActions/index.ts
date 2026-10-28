import { createClientFromRequest, serve } from '../_shared/server.ts';

serve('importExportActions', async (req) => {
  try {
    const platform = createClientFromRequest(req);
    const user = await platform.auth.me();
    
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Unauthorized - Admin only' }, { status: 403 });
    }

    const { action, entity_name, data, format = 'csv' } = await req.json();

    if (action === 'import') {
      if (!entity_name || !Array.isArray(data)) {
        return Response.json({ error: 'Invalid parameters' }, { status: 400 });
      }

      let successCount = 0;
      let errorCount = 0;
      const errors = [];

      for (let i = 0; i < data.length; i++) {
        try {
          const record = data[i];
          
          // Validate required fields based on entity
          if (entity_name === 'Contact' && (!record.full_name || !record.email)) {
            errors.push(`Row ${i + 1}: Missing full_name or email`);
            errorCount++;
            continue;
          }
          
          if (entity_name === 'Invoice' && (!record.contact_id || !record.invoice_number)) {
            errors.push(`Row ${i + 1}: Missing contact_id or invoice_number`);
            errorCount++;
            continue;
          }

          if (entity_name === 'Quote' && (!record.contact_id || !record.quote_number)) {
            errors.push(`Row ${i + 1}: Missing contact_id or quote_number`);
            errorCount++;
            continue;
          }

          // Create the record
          await platform.asServiceRole.entities[entity_name].create(record);
          successCount++;
        } catch (error) {
          errors.push(`Row ${i + 1}: ${error.message}`);
          errorCount++;
        }
      }

      return Response.json({
        success: errorCount === 0,
        success_count: successCount,
        error_count: errorCount,
        errors: errors.slice(0, 20),
      });
    }

    if (action === 'export') {
      if (!entity_name) {
        return Response.json({ error: 'Entity name required' }, { status: 400 });
      }

      const records = await platform.asServiceRole.entities[entity_name].list();
      
      if (format === 'csv') {
        if (!records.length) {
          return Response.json({ csv: '', count: 0 });
        }

        const headers = Object.keys(records[0]).filter(h => !h.startsWith('_'));
        const csvRows = [headers.join(',')];
        
        records.forEach(record => {
          const row = headers.map(h => {
            const val = record[h];
            if (val === null || val === undefined) return '';
            if (typeof val === 'object') return JSON.stringify(val).replace(/,/g, ';');
            return String(val).includes(',') ? `"${val}"` : val;
          });
          csvRows.push(row.join(','));
        });

        return Response.json({ csv: csvRows.join('\n'), count: records.length });
      }

      return Response.json({ data: records, count: records.length });
    }

    return Response.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Import/Export error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});