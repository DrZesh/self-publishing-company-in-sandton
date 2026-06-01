import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

// Full mapping from every website form service_interest value → pipeline service_type
const SERVICE_MAP = {
  // Book Printing
  'Book Printing': 'Book Printing',
  'Printing': 'Book Printing',
  'A5 Book Printing': 'Book Printing',
  '6x9 Book Printing': 'Book Printing',
  'Hardcover Printing': 'Book Printing',
  "Children's Book Printing": 'Book Printing',
  'Print run': 'Book Printing',
  'Book printing': 'Book Printing',

  // Book Editing
  'Book Editing': 'Book Editing',
  'Editing': 'Book Editing',
  'Proofreading': 'Book Editing',
  'Academic Editing': 'Book Editing',
  'Thesis Editing': 'Book Editing',
  'Dissertation Editing': 'Book Editing',
  'Manuscript Evaluation': 'Manuscript Evaluation',
  'Copy Editing': 'Book Editing',

  // Book Cover Design
  'Book Cover Design': 'Book Cover Design',
  'Cover Design': 'Book Cover Design',
  'Ebook Cover Design': 'Book Cover Design',

  // Typesetting
  'Typesetting': 'Typesetting and Layout',
  'Typesetting and Layout': 'Typesetting and Layout',
  'Book Typesetting': 'Typesetting and Layout',
  'Layout Design': 'Typesetting and Layout',

  // Ghostwriting
  'Ghostwriting': 'Ghostwriting',
  'Ghost Writing': 'Ghostwriting',
  'Memoir Writing': 'Ghostwriting',
  'Biography Writing': 'Ghostwriting',
  'Christian Book Writing': 'Ghostwriting',

  // Publishing Packages (map to Book Printing as primary deliverable)
  'Full Publishing Package': 'Book Printing',
  'Full publishing': 'Book Printing',
  'Mini Publishing Package': 'Book Printing',
  'Self Publishing': 'Book Printing',
  "Children's Book Package": 'Book Printing',

  // Ebook
  'Ebook Publishing': 'Ebook Publishing',
  'Ebook Formatting': 'Ebook Publishing',
  'Kindle Publishing': 'Ebook Publishing',

  // Author Website
  'Author Website': 'Author Website',
  'Website Design': 'Author Website',

  // General
  'Other': '',
  'General Enquiry': '',
};

function mapServiceInterest(serviceInterest) {
  if (!serviceInterest) return '';
  const key = Object.keys(SERVICE_MAP).find(
    k => k.toLowerCase() === serviceInterest.toLowerCase()
  );
  return key ? SERVICE_MAP[key] : serviceInterest;
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();

    // Get submission data from the automation payload
    const submission = body.data;
    if (!submission) {
      return Response.json({ error: 'No submission data' }, { status: 400 });
    }

    // Skip spam / test submissions
    const email = (submission.email || '').trim().toLowerCase();
    if (!email || !submission.full_name) {
      return Response.json({ skipped: true, reason: 'Missing required fields (name/email)' });
    }

    // Find the first active pipeline (prefer "book" or "publishing" in name)
    const pipelines = await base44.asServiceRole.entities.SalesPipeline.filter({ is_active: true }, 'created_date', 10);
    if (!pipelines || pipelines.length === 0) {
      return Response.json({ skipped: true, reason: 'No active pipelines found' });
    }

    const pipeline = pipelines.find(p => /book|publish/i.test(p.name)) || pipelines[0];

    // Get the first non-won/non-lost stage (entry stage)
    const stages = [...(pipeline.stages || [])].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
    const firstStage = stages.find(s => !s.isWon && !s.isLost);
    if (!firstStage) {
      return Response.json({ skipped: true, reason: 'No valid entry stage found in pipeline' });
    }

    // Deduplication: skip if a deal with the same email already exists in this pipeline
    const existingDeals = await base44.asServiceRole.entities.PipelineDeal.filter(
      { pipeline_id: pipeline.id, client_email: email },
      '',
      5
    );
    if (existingDeals.length > 0) {
      return Response.json({
        skipped: true,
        reason: `Deal already exists for ${email} in pipeline "${pipeline.name}"`,
        existing_deal_id: existingDeals[0].id,
      });
    }

    // Handle service_interest — may be array or string
    const interestRaw = Array.isArray(submission.service_interest)
      ? submission.service_interest
      : submission.service_interest
        ? [submission.service_interest]
        : [];

    // Primary service = first mapped value
    const primaryService = mapServiceInterest(interestRaw[0] || '');

    // All services for notes
    const allServices = interestRaw.map(s => mapServiceInterest(s) || s).filter(Boolean);

    // Build project title
    const projectTitle = submission.book_title || submission.project_title || '';

    // Build notes
    const noteLines = [
      allServices.length > 1 ? `Services interested in: ${allServices.join(', ')}` : '',
      submission.message ? `Enquiry: ${submission.message}` : '',
      submission.how_heard ? `How they found us: ${submission.how_heard}` : '',
      submission.company ? `Company: ${submission.company}` : '',
      `Source: Website enquiry form`,
      `Submitted: ${new Date().toLocaleDateString('en-ZA')}`,
    ].filter(Boolean).join('\n');

    const dealData = {
      pipeline_id: pipeline.id,
      stage_key: firstStage.key,
      client_name: submission.full_name || submission.name || 'Unknown',
      client_email: email,
      client_phone: submission.phone || submission.whatsapp || submission.whatsapp_number || '',
      service_type: primaryService,
      project_title: projectTitle,
      notes: noteLines,
    };

    const deal = await base44.asServiceRole.entities.PipelineDeal.create(dealData);

    return Response.json({
      success: true,
      deal_id: deal.id,
      pipeline_name: pipeline.name,
      stage: firstStage.label,
      service_mapped: primaryService,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});