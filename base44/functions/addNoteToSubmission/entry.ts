import { requireAdmin, AuthError } from './supabase-auth.ts';
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await requireAdmin(req);

    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const body = await req.json();
    const { submissionId, content } = body;

    if (!submissionId || !content) {
      return Response.json({ error: 'Submission ID and content required' }, { status: 400 });
    }

    // Create note
    const note = await base44.asServiceRole.entities.Note.create({
      entity_type: 'submission',
      entity_id: submissionId,
      content
    });

    // Log activity
    await base44.asServiceRole.entities.ActivityLog.create({
      entity_type: 'submission',
      entity_id: submissionId,
      action: 'note_added',
      actor_id: user.id,
      description: `Note added: ${content.substring(0, 50)}...`,
      metadata: { note_id: note.id }
    });

    return Response.json({ success: true, note });
  } catch (error) {
    if (error instanceof AuthError) return Response.json({ error: error.message }, { status: error.status });
    console.error('Add note error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});