import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const body = await req.json();
    const { submissionId, estimatedValue, probability } = body;

    if (!submissionId) {
      return Response.json({ error: 'Submission ID required' }, { status: 400 });
    }

    // Get submission
    const submission = await base44.asServiceRole.entities.Submission.get(submissionId);
    if (!submission) {
      return Response.json({ error: 'Submission not found' }, { status: 404 });
    }

    // Get or create contact
    let contact = null;
    if (submission.contact_id) {
      contact = await base44.asServiceRole.entities.Contact.get(submission.contact_id);
    } else {
      contact = await base44.asServiceRole.entities.Contact.create({
        full_name: submission.full_name,
        email: submission.email,
        phone: submission.phone,
        lifecycle_stage: 'lead'
      });
    }

    // Create lead
    const lead = await base44.asServiceRole.entities.Lead.create({
      contact_id: contact.id,
      source_submission_id: submissionId,
      stage: 'new',
      service_interest: submission.service_interest || [],
      estimated_value: estimatedValue || 0,
      probability_percent: probability || 50,
      owner_id: user.id,
      stage_changed_at: new Date().toISOString()
    });

    // Update submission to link lead and change status
    await base44.asServiceRole.entities.Submission.update(submissionId, {
      contact_id: contact.id,
      lead_id: lead.id,
      status: 'converted_to_lead'
    });

    // Log activity
    await base44.asServiceRole.entities.ActivityLog.create({
      entity_type: 'submission',
      entity_id: submissionId,
      action: 'converted_to_lead',
      actor_id: user.id,
      description: `Converted to lead #${lead.id}`,
      metadata: { lead_id: lead.id, contact_id: contact.id }
    });

    return Response.json({ success: true, lead, contact });
  } catch (error) {
    console.error('Create lead error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});