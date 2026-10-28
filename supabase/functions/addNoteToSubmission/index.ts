import { createClientFromRequest, serve } from '../_shared/server.ts';

serve('addNoteToSubmission', async (req) => {
  try {
    const platform = createClientFromRequest(req);
    const user = await platform.auth.me();

    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const body = await req.json();
    const { submissionId, content } = body;

    if (!submissionId || !content) {
      return Response.json({ error: 'Submission ID and content required' }, { status: 400 });
    }

    // Create note
    const note = await platform.asServiceRole.entities.Note.create({
      entity_type: 'submission',
      entity_id: submissionId,
      content
    });

    // Log activity
    await platform.asServiceRole.entities.ActivityLog.create({
      entity_type: 'submission',
      entity_id: submissionId,
      action: 'note_added',
      actor_id: user.id,
      description: `Note added: ${content.substring(0, 50)}...`,
      metadata: { note_id: note.id }
    });

    return Response.json({ success: true, note });
  } catch (error) {
    console.error('Add note error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});