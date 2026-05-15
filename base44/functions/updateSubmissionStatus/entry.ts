import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const body = await req.json();
    const { submissionId, status, internalNotes } = body;

    if (!submissionId || !status) {
      return Response.json({ error: 'Submission ID and status required' }, { status: 400 });
    }

    // Update submission
    const updatedSubmission = await base44.asServiceRole.entities.Submission.update(submissionId, {
      status,
      internal_notes: internalNotes
    });

    // Log activity
    await base44.asServiceRole.entities.ActivityLog.create({
      entity_type: 'submission',
      entity_id: submissionId,
      action: 'status_changed',
      actor_id: user.id,
      description: `Status changed from previous to ${status}`,
      metadata: { new_status: status }
    });

    return Response.json({ success: true, submission: updatedSubmission });
  } catch (error) {
    console.error('Update submission status error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});