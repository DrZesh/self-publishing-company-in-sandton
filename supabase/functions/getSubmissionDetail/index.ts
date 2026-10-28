import { createClientFromRequest, serve } from '../_shared/server.ts';

serve('getSubmissionDetail', async (req) => {
  try {
    const platform = createClientFromRequest(req);
    const user = await platform.auth.me();

    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const body = await req.json();
    const { submissionId } = body;

    if (!submissionId) {
      return Response.json({ error: 'Submission ID required' }, { status: 400 });
    }

    // Fetch submission details
    const submission = await platform.asServiceRole.entities.Submission.get(submissionId);

    if (!submission) {
      return Response.json({ error: 'Submission not found' }, { status: 404 });
    }

    // Fetch linked contact if exists
    let contact = null;
    if (submission.contact_id) {
      contact = await platform.asServiceRole.entities.Contact.get(submission.contact_id);
    }

    // Fetch linked lead if exists
    let lead = null;
    if (submission.lead_id) {
      lead = await platform.asServiceRole.entities.Lead.get(submission.lead_id);
    }

    // Fetch related notes
    const notes = await platform.asServiceRole.entities.Note.filter({
      entity_type: 'submission',
      entity_id: submissionId
    });

    // Fetch activity log
    const activityLog = await platform.asServiceRole.entities.ActivityLog.filter({
      entity_type: 'submission',
      entity_id: submissionId
    }, '-created_date');

    return Response.json({
      submission,
      contact,
      lead,
      notes,
      activityLog
    });
  } catch (error) {
    console.error('Get submission detail error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});