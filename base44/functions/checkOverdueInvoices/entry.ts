import { requireAdmin, AuthError } from './supabase-auth.ts';
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    await requireAdmin(req, { allowScheduled: true });

    const today = new Date().toISOString().split('T')[0];
    const invoices = await base44.asServiceRole.entities.Invoice.list('-due_date', 500);

    const overdueInvoices = invoices.filter(inv =>
      inv.due_date &&
      inv.due_date < today &&
      !['Paid', 'Cancelled', 'Overdue'].includes(inv.status) &&
      (inv.balance_due || 0) > 0
    );

    let updatedCount = 0;
    let taskCount = 0;

    for (const inv of overdueInvoices) {
      // Mark as overdue
      await base44.asServiceRole.entities.Invoice.update(inv.id, { status: 'Overdue' });
      updatedCount++;

      // Create a payment follow-up task if one doesn't exist recently
      const existingTasks = await base44.asServiceRole.entities.Task.filter({
        entity_id: inv.id,
        task_type: 'Payment Follow-up',
        status: 'Pending',
      });

      if (existingTasks.length === 0) {
        const dueDate = new Date();
        dueDate.setDate(dueDate.getDate() + 1);
        await base44.asServiceRole.entities.Task.create({
          title: `Follow up on overdue invoice ${inv.invoice_number}`,
          task_type: 'Payment Follow-up',
          entity_type: 'invoice',
          entity_id: inv.id,
          contact_id: inv.contact_id,
          due_date: dueDate.toISOString(),
          priority: 'High',
          status: 'Pending',
          notes: `Invoice ${inv.invoice_number} overdue. Balance due: R ${(inv.balance_due || 0).toLocaleString()}. Due date was ${inv.due_date}.`,
        });
        taskCount++;
      }
    }

    return Response.json({
      success: true,
      invoices_marked_overdue: updatedCount,
      tasks_created: taskCount,
      checked_at: new Date().toISOString(),
    });
  } catch (error) {
    if (error instanceof AuthError) return Response.json({ error: error.message }, { status: error.status });
    return Response.json({ error: error.message }, { status: 500 });
  }
});