import { createClientFromRequest, serve } from '../_shared/server.ts';

serve('createProjectUpdate', async (req) => {
  try {
    const platform = createClientFromRequest(req);
    
    const body = await req.json();
    const { project_id, contact_id, update_type, title, message, milestone_name, stage_from, stage_to } = body;

    if (!project_id || !contact_id) {
      return Response.json({ error: 'Project ID and Contact ID required' }, { status: 400 });
    }

    // Create project update
    const update = await platform.entities.ProjectUpdate.create({
      project_id,
      contact_id,
      update_type,
      title,
      message,
      milestone_name,
      stage_from,
      stage_to,
      email_sent: false,
    });

    // TODO: Send email notification if needed
    // This could be handled by automation

    return Response.json({ success: true, update });
  } catch (error) {
    console.error('Create update error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});