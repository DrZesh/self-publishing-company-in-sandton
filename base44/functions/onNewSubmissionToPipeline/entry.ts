import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();

    // Get submission data from the automation payload
    const submission = body.data;
    if (!submission) {
      return Response.json({ error: 'No submission data' }, { status: 400 });
    }

    // Find the first active pipeline (prefer one named "Book Publishing" or similar, else first)
    const pipelines = await base44.asServiceRole.entities.SalesPipeline.filter({ is_active: true }, 'created_date', 10);
    if (!pipelines || pipelines.length === 0) {
      return Response.json({ skipped: true, reason: 'No active pipelines found' });
    }

    // Pick preferred pipeline: one with "book" or "publishing" in name, else first
    const pipeline = pipelines.find(p =>
      /book|publish/i.test(p.name)
    ) || pipelines[0];

    // Get the first non-won/non-lost stage
    const stages = [...(pipeline.stages || [])].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
    const firstStage = stages.find(s => !s.isWon && !s.isLost);
    if (!firstStage) {
      return Response.json({ skipped: true, reason: 'No valid entry stage found in pipeline' });
    }

    // Map submission fields to deal fields
    const serviceInterest = Array.isArray(submission.service_interest)
      ? submission.service_interest[0]
      : submission.service_interest || '';

    // Map service interest to ClientServiceProject service types
    const serviceMap = {
      'Book Printing': 'Book Printing',
      'Book Editing': 'Book Editing',
      'Book Cover Design': 'Book Cover Design',
      'Typesetting': 'Typesetting and Layout',
      'Manuscript Evaluation': 'Manuscript Evaluation',
      'Ghostwriting': 'Ghostwriting',
      'Author Website': 'Author Website',
      'Ebook Publishing': 'Ebook Publishing',
    };
    const mappedService = serviceMap[serviceInterest] || serviceInterest || '';

    const dealData = {
      pipeline_id: pipeline.id,
      stage_key: firstStage.key,
      client_name: submission.full_name || submission.name || 'Unknown',
      client_email: submission.email || '',
      client_phone: submission.phone || submission.whatsapp || '',
      service_type: mappedService,
      project_title: submission.book_title || submission.project_title || '',
      notes: [
        submission.message ? `Message: ${submission.message}` : '',
        submission.how_heard ? `How heard: ${submission.how_heard}` : '',
        `Source: Website enquiry (${new Date().toLocaleDateString('en-ZA')})`,
      ].filter(Boolean).join('\n'),
    };

    const deal = await base44.asServiceRole.entities.PipelineDeal.create(dealData);

    return Response.json({
      success: true,
      deal_id: deal.id,
      pipeline_name: pipeline.name,
      stage: firstStage.label,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});