import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const body = await req.json();
    const base44 = createClientFromRequest(req);
    const { data: doc } = body;

    if (!doc || doc.status !== 'Approved' || doc.category !== 'Proof Approval') {
      return Response.json({ skipped: true });
    }

    // Update project stage to Sample Print Queued
    if (doc.project_id) {
      await base44.asServiceRole.entities.Project.update(doc.project_id, {
        stage: 'Sample Print Queued',
        stage_changed_at: new Date().toISOString(),
      });
    }

    // Create print job ticket task (due tomorrow)
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 1);

    await base44.asServiceRole.entities.Task.create({
      title: `🖨️ Print Job Ticket: ${doc.book_title || 'Book'} — Ready for Production`,
      task_type: 'Production Deadline',
      contact_id: doc.contact_id || '',
      project_id: doc.project_id || '',
      due_date: dueDate.toISOString(),
      priority: 'High',
      status: 'Pending',
      notes: `Proof approval received on ${new Date().toLocaleDateString('en-ZA')}. Queue for sample print production. Document: ${doc.file_name || 'proof file'}.`,
    });

    return Response.json({ success: true });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});