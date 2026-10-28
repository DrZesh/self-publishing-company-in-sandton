import { createClientFromRequest, serve } from '../_shared/server.ts';

serve('updateSubmissionStatus', async (req) => {
  try {
    const platform = createClientFromRequest(req);
    const user = await platform.auth.me();

    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const body = await req.json();
    const { submissionId, status, internalNotes } = body;

    if (!submissionId || !status) {
      return Response.json({ error: 'Submission ID and status required' }, { status: 400 });
    }

    // Update submission
    const updatedSubmission = await platform.asServiceRole.entities.Submission.update(submissionId, {
      status,
      internal_notes: internalNotes
    });

    // Log activity
    await platform.asServiceRole.entities.ActivityLog.create({
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