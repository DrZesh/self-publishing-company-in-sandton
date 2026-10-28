import { createClientFromRequest, serve } from '../_shared/server.ts';

// Maps old Contact pipeline_stage values to new pipeline stage keys
function mapOldStageToKey(pipelineStage, lostReason, stages) {
  const s = (pipelineStage || '').toLowerCase();
  const lr = (lostReason || '').toLowerCase();

  // Determine "bucket"
  let bucket = 'enquiry';
  if (['quote in progress', 'quote sent', 'payment pending'].some(x => s.includes(x.toLowerCase()))) {
    bucket = 'quotation';
  } else if (['project started','editing','cover design','typesetting','sample queued','sample approved','mass production','completed','delivered'].some(x => s.includes(x.toLowerCase()))) {
    bucket = 'won';
  } else if (s === 'lost' && lr.includes('ghost')) {
    bucket = 'lost';
  } else if (s === 'lost') {
    bucket = 'lost';
  }

  // Try to match bucket to a stage key in the target pipeline
  const bucketKeyMap = {
    enquiry: ['enquiry', 'new_author', 'lead', 'inquiry', 'new'],
    quotation: ['quote_sent', 'quote', 'quotation', 'proposal', 'consultation'],
    won: ['won'],
    lost: ['lost'],
  };

  const candidates = bucketKeyMap[bucket] || ['enquiry'];
  for (const candidate of candidates) {
    const found = stages.find(s => s.key === candidate);
    if (found) return found.key;
  }

  // Fallback to first non-won/non-lost stage
  const fallback = stages.find(s => !s.isWon && !s.isLost);
  return fallback?.key || stages[0]?.key || 'enquiry';
}

serve('migrateDealsToNewPipeline', async (req) => {
  try {
    const platform = createClientFromRequest(req);
    const user = await platform.auth.me();

    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Admin access required' }, { status: 403 });
    }

    const body = await req.json();
    const targetPipelineId = body.pipeline_id;

    if (!targetPipelineId) {
      return Response.json({ error: 'pipeline_id is required' }, { status: 400 });
    }

    // Load the target pipeline
    const pipelines = await platform.asServiceRole.entities.SalesPipeline.filter({ id: targetPipelineId });
    const pipeline = pipelines[0];
    if (!pipeline) {
      return Response.json({ error: 'Pipeline not found' }, { status: 404 });
    }

    const stages = [...(pipeline.stages || [])].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
    if (stages.length === 0) {
      return Response.json({ error: 'Target pipeline has no stages' }, { status: 400 });
    }

    // Load all contacts with a pipeline_stage set
    const contacts = await platform.asServiceRole.entities.Contact.list('-updated_date', 500);
    const toMigrate = contacts.filter(c => c.pipeline_stage && c.pipeline_stage !== '');

    if (toMigrate.length === 0) {
      return Response.json({ migrated: 0, skipped: 0, message: 'No contacts with pipeline stages found.' });
    }

    // Load existing deals to avoid duplicates (by client_email in this pipeline)
    const existingDeals = await platform.asServiceRole.entities.PipelineDeal.filter({ pipeline_id: targetPipelineId }, '', 500);
    const existingEmails = new Set(existingDeals.map(d => d.client_email?.toLowerCase()).filter(Boolean));

    let migrated = 0;
    let skipped = 0;
    const errors = [];

    for (const contact of toMigrate) {
      // Skip if already exists by email
      if (contact.email && existingEmails.has(contact.email.toLowerCase())) {
        skipped++;
        continue;
      }

      const stageKey = mapOldStageToKey(contact.pipeline_stage, contact.lost_reason, stages);
      const stageObj = stages.find(s => s.key === stageKey) || stages[0];

      // Map package_type to service_type
      const pkgToService = {
        'Full publishing': 'Book Printing',
        'Editing only': 'Book Editing',
        'Cover + layout': 'Book Cover Design',
        'Typesetting': 'Typesetting and Layout',
        'Print run': 'Book Printing',
      };

      try {
        const dealData = {
          pipeline_id: targetPipelineId,
          stage_key: stageKey,
          client_name: contact.full_name || 'Unknown',
          client_email: contact.email || '',
          client_phone: contact.phone || contact.whatsapp_number || '',
          service_type: pkgToService[contact.package_type] || contact.package_type || '',
          project_title: contact.book_title || '',
          deal_value: contact.pipeline_value || 0,
          assigned_team_member: contact.pipeline_owner || '',
          notes: [
            contact.description ? `Notes: ${contact.description}` : '',
            contact.lost_reason ? `Lost reason: ${contact.lost_reason}` : '',
            `Migrated from old Deals Pipeline (${new Date().toLocaleDateString('en-ZA')})`,
          ].filter(Boolean).join('\n'),
        };

        // Set won_at / lost_at
        if (stageObj?.isWon) dealData.won_at = contact.pipeline_stage_changed_at || new Date().toISOString();
        if (stageObj?.isLost) dealData.lost_at = contact.pipeline_stage_changed_at || new Date().toISOString();

        await platform.asServiceRole.entities.PipelineDeal.create(dealData);
        if (contact.email) existingEmails.add(contact.email.toLowerCase());
        migrated++;
      } catch (err) {
        errors.push({ contact: contact.full_name, error: err.message });
      }
    }

    return Response.json({
      success: true,
      migrated,
      skipped,
      total: toMigrate.length,
      errors: errors.length > 0 ? errors : undefined,
      message: `Migrated ${migrated} deals, skipped ${skipped} duplicates.`,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});