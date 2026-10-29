import { createClientFromRequest, serve } from '../_shared/server.ts';

serve('manageInventory', async (req) => {
  try {
    const platform = createClientFromRequest(req);
    const user = await platform.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const { action, material_id, po_id, data = {} } = body;

    // Get company settings
    const getCompanySettings = async () => {
      const settings = await platform.entities.CompanySettings.filter({ setting_key: 'main' });
      return settings[0] || null;
    };

    // Generate PO number
    const generatePONumber = async () => {
      const year = new Date().getFullYear();
      const allPOs = await platform.entities.PurchaseOrder.list('-created_date', 1);
      const lastNumber = allPOs[0]?.po_number ? parseInt(allPOs[0].po_number.split('-').pop()) : 0;
      return `PO-${year}-${String(lastNumber + 1).padStart(4, '0')}`;
    };

    // GENERATE material code
    if (action === 'generate_material_code') {
      const category = data.category || 'OTHER';
      const prefix = category.substring(0, 4).toUpperCase();
      const allMaterials = await platform.entities.Material.list('-created_date', 1000);
      const existingCodes = allMaterials.map(m => m.material_code);
      
      let counter = 1;
      let code = `${prefix}-${String(counter).padStart(3, '0')}`;
      while (existingCodes.includes(code)) {
        counter++;
        code = `${prefix}-${String(counter).padStart(3, '0')}`;
      }

      return Response.json({ material_code: code });
    }

    // CREATE material
    if (action === 'create_material') {
      const material = await platform.entities.Material.create({
        material_code: data.material_code,
        name: data.name,
        category: data.category,
        description: data.description,
        supplier_id: data.supplier_id,
        unit_of_measure: data.unit_of_measure || 'sheets',
        cost_per_unit: data.cost_per_unit || 0,
        current_stock: data.current_stock || 0,
        minimum_stock: data.minimum_stock || 0,
        maximum_stock: data.maximum_stock || 0,
        reorder_quantity: data.reorder_quantity || 0,
        lead_time_days: data.lead_time_days || 7,
        storage_location: data.storage_location,
        specifications: data.specifications || {},
        is_active: true,
      });

      return Response.json({ success: true, material });
    }

    // UPDATE material
    if (action === 'update_material') {
      await platform.entities.Material.update(material_id, {
        ...data,
        last_used_date: data.current_stock < (await platform.entities.Material.filter({ id: material_id }))[0]?.current_stock 
          ? new Date().toISOString().split('T')[0] 
          : undefined,
      });

      return Response.json({ success: true });
    }

    // LIST materials
    if (action === 'list_materials') {
      const filters = {};
      if (data.category) filters.category = data.category;
      if (data.is_active !== undefined) filters.is_active = data.is_active;

      const materials = await platform.entities.Material.filter(filters, '-name', 500);
      
      // Add low stock flag
      const withFlags = materials.map(m => ({
        ...m,
        is_low_stock: m.current_stock <= m.minimum_stock,
        needs_reorder: m.current_stock <= m.minimum_stock && m.is_active,
      }));

      return Response.json({ materials: withFlags });
    }

    // GET material stock levels
    if (action === 'stock_levels') {
      const materials = await platform.entities.Material.filter({ is_active: true });
      
      const stockSummary = {
        total_materials: materials.length,
        low_stock_count: materials.filter(m => m.current_stock <= m.minimum_stock).length,
        out_of_stock_count: materials.filter(m => m.current_stock === 0).length,
        total_value: materials.reduce((sum, m) => sum + (m.current_stock * m.cost_per_unit), 0),
        materials: materials.map(m => ({
          id: m.id,
          name: m.name,
          code: m.material_code,
          current_stock: m.current_stock,
          minimum_stock: m.minimum_stock,
          unit: m.unit_of_measure,
          is_low: m.current_stock <= m.minimum_stock,
          value: m.current_stock * m.cost_per_unit,
        })),
      };

      return Response.json({ stockSummary });
    }

    // CREATE purchase order
    if (action === 'create_po') {
      const poNumber = await generatePONumber();
      const supplier = (await platform.entities.Contact.filter({ id: data.supplier_id }))[0];

      const po = await platform.entities.PurchaseOrder.create({
        po_number: poNumber,
        supplier_id: data.supplier_id,
        supplier_snapshot: supplier ? {
          name: supplier.full_name,
          company: supplier.company,
          email: supplier.email,
          phone: supplier.phone,
          address: supplier.billing_address,
        } : {},
        order_date: data.order_date || new Date().toISOString().split('T')[0],
        expected_delivery_date: data.expected_delivery_date,
        line_items: data.line_items || [],
        payment_terms: data.payment_terms || 'Payment due within 30 days',
        delivery_address: data.delivery_address,
        notes: data.notes,
        created_by: user.full_name,
        status: 'Draft',
      });

      return Response.json({ success: true, po });
    }

    // UPDATE purchase order
    if (action === 'update_po') {
      const updates = { ...data };
      
      // Calculate totals
      if (data.line_items) {
        const subtotal = data.line_items.reduce((sum, item) => sum + (item.line_total || 0), 0);
        const vatRate = data.vat_rate || 15;
        const vatAmount = subtotal * (vatRate / 100);
        
        updates.subtotal = subtotal;
        updates.vat_rate = vatRate;
        updates.vat_amount = vatAmount;
        updates.total = subtotal + vatAmount;
      }

      await platform.entities.PurchaseOrder.update(po_id, updates);
      return Response.json({ success: true });
    }

    // SEND purchase order
    if (action === 'send_po') {
      return Response.json({ error: 'Supplier email sending needs explicit approval. Purchase orders can still be saved and received.' }, { status: 503 });
    }

    if (action === 'receive_items') {
      const po = (await platform.entities.PurchaseOrder.filter({ id: po_id }))[0];
      if (!po) {
        return Response.json({ error: 'PO not found' }, { status: 404 });
      }

      const receivedItems = data.received_items || [];
      const existingReceived = po.received_items || [];
      
      const updatedReceived = [...existingReceived, ...receivedItems.map(item => ({
        ...item,
        received_date: item.received_date || new Date().toISOString().split('T')[0],
        received_by: item.received_by || user.full_name,
      }))];

      // Update material stock levels
      for (const item of receivedItems) {
        const lineItem = po.line_items[item.line_item_index];
        if (lineItem?.material_id) {
          const material = (await platform.entities.Material.filter({ id: lineItem.material_id }))[0];
          if (material) {
            await platform.entities.Material.update(lineItem.material_id, {
              current_stock: (material.current_stock || 0) + item.quantity_received,
              last_restock_date: new Date().toISOString().split('T')[0],
            });
          }
        }
      }

      // Update PO status
      let newStatus = po.status;
      const allReceived = po.line_items.every((line, idx) => {
        const received = updatedReceived.filter(r => r.line_item_index === idx)
          .reduce((sum, r) => sum + r.quantity_received, 0);
        return received >= line.quantity;
      });

      if (allReceived) {
        newStatus = 'Completed';
      } else if (updatedReceived.length > 0) {
        newStatus = 'Partially Received';
      }

      await platform.entities.PurchaseOrder.update(po_id, {
        received_items: updatedReceived,
        status: newStatus,
        actual_delivery_date: new Date().toISOString().split('T')[0],
      });

      return Response.json({ success: true });
    }

    // LIST purchase orders
    if (action === 'list_pos') {
      const filters = {};
      if (data.status) filters.status = data.status;
      if (data.supplier_id) filters.supplier_id = data.supplier_id;

      const pos = await platform.entities.PurchaseOrder.filter(filters, '-order_date', data.limit || 100);
      return Response.json({ pos });
    }

    // GET low stock alerts
    if (action === 'low_stock_alerts') {
      const materials = await platform.entities.Material.filter({ 
        is_active: true,
        current_stock: { $lte: '$minimum_stock' }
      });

      const alerts = materials.map(m => ({
        material_id: m.id,
        material_name: m.name,
        material_code: m.material_code,
        current_stock: m.current_stock,
        minimum_stock: m.minimum_stock,
        reorder_quantity: m.reorder_quantity,
        supplier_id: m.supplier_id,
        urgency: m.current_stock === 0 ? 'critical' : 'warning',
      }));

      return Response.json({ alerts });
    }

    return Response.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});