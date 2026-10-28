import { createClientFromRequest, serve } from '../_shared/server.ts';

serve('onContractSigned', async (req) => {
  try {
    const body = await req.json();
    const platform = createClientFromRequest(req);
    const { data: contract } = body;

    if (!contract || contract.status !== 'Signed') {
      return Response.json({ skipped: true });
    }

    // Find linked project and update stage
    let projectUpdated = false;

    if (contract.project_id) {
      await platform.asServiceRole.entities.Project.update(contract.project_id, {
        stage: 'Contract Signed',
        contract_status: 'Signed',
        stage_changed_at: new Date().toISOString(),
      });
      projectUpdated = true;
    }

    if (!projectUpdated && contract.contact_id) {
      const projects = await platform.asServiceRole.entities.Project.filter({ contact_id: contract.contact_id });
      const active = projects.find(p => !['Completed', 'Delivered'].includes(p.stage));
      if (active) {
        await platform.asServiceRole.entities.Project.update(active.id, {
          stage: 'Contract Signed',
          contract_status: 'Signed',
          stage_changed_at: new Date().toISOString(),
        });
        projectUpdated = true;
      }
    }

    // Create a task reminder for payment collection
    if (contract.contact_id) {
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + 2);
      await platform.asServiceRole.entities.Task.create({
        title: `💰 Follow up on deposit payment — ${contract.title || 'Contract Signed'}`,
        task_type: 'Payment Follow-up',
        contact_id: contract.contact_id,
        project_id: contract.project_id || '',
        due_date: dueDate.toISOString(),
        priority: 'High',
        status: 'Pending',
        notes: `Contract signed on ${new Date().toLocaleDateString('en-ZA')}. Follow up to confirm deposit payment.`,
      });
    }

    return Response.json({ success: true, projectUpdated });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});