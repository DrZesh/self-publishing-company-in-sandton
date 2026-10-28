import { createClientFromRequest, serve } from '../_shared/server.ts';

// AI Lead Scoring Engine — scores 0-100, grades Cold/Warm/Hot/Qualified
// Can be triggered manually or by scheduler

function calcScore(contact, quotes, invoices, submissions, tasks) {
  let score = 0;
  const breakdown = { recency: 0, engagement: 0, deal_value: 0, completeness: 0, pipeline_stage: 0 };

  // Recency — last activity
  const lastActivity = contact.last_activity_at || contact.updated_date || contact.created_date;
  const daysSince = lastActivity ? (Date.now() - new Date(lastActivity)) / 86400000 : 999;
  if (daysSince < 1) breakdown.recency = 20;
  else if (daysSince < 3) breakdown.recency = 18;
  else if (daysSince < 7) breakdown.recency = 14;
  else if (daysSince < 14) breakdown.recency = 10;
  else if (daysSince < 30) breakdown.recency = 5;
  else breakdown.recency = 0;

  // Engagement — quote views, submissions, tasks
  const contactQuotes = quotes.filter(q => q.contact_id === contact.id);
  const hasViewedQuote = contactQuotes.some(q => ['Viewed', 'Opened', 'Accepted'].includes(q.status));
  const hasAcceptedQuote = contactQuotes.some(q => q.status === 'Accepted');
  const contactSubs = submissions.filter(s => s.contact_id === contact.id || s.email === contact.email);
  
  if (hasAcceptedQuote) breakdown.engagement = 25;
  else if (hasViewedQuote) breakdown.engagement = 18;
  else if (contactQuotes.length > 0) breakdown.engagement = 10;
  else if (contactSubs.length > 0) breakdown.engagement = 5;

  // Deal value
  const maxQuoteValue = Math.max(0, ...contactQuotes.map(q => q.total || 0));
  const paidTotal = invoices.filter(i => i.contact_id === contact.id && i.status === 'Paid').reduce((s, i) => s + (i.total || 0), 0);
  const dealValue = Math.max(maxQuoteValue, paidTotal, contact.pipeline_value || 0);
  if (dealValue >= 50000) breakdown.deal_value = 25;
  else if (dealValue >= 20000) breakdown.deal_value = 20;
  else if (dealValue >= 10000) breakdown.deal_value = 15;
  else if (dealValue >= 5000) breakdown.deal_value = 10;
  else if (dealValue >= 1000) breakdown.deal_value = 5;

  // Profile completeness
  let fields = 0;
  if (contact.full_name) fields++;
  if (contact.email) fields++;
  if (contact.phone) fields++;
  if (contact.company) fields++;
  if (contact.book_title) fields++;
  if (contact.billing_address) fields++;
  breakdown.completeness = Math.round((fields / 6) * 15);

  // Pipeline stage
  const stageScores = {
    'New Enquiry': 2, 'Information Requested': 5, 'Quote in Progress': 8,
    'Quote Sent': 10, 'Payment Pending': 12, 'Project Started': 14,
    'Editing': 15, 'Cover Design': 15, 'Typesetting': 15,
    'Sample Queued': 14, 'Sample Approved': 14, 'Mass Production': 13,
    'Completed': 5, 'Delivered': 3, 'Lost': 0,
  };
  breakdown.pipeline_stage = stageScores[contact.pipeline_stage] || 0;

  score = Object.values(breakdown).reduce((a, b) => a + b, 0);

  let grade = 'Cold';
  if (score >= 75) grade = 'Qualified';
  else if (score >= 55) grade = 'Hot';
  else if (score >= 30) grade = 'Warm';

  return { score, grade, breakdown };
}

serve('scoreLeads', async (req) => {
  try {
    const platform = createClientFromRequest(req);

    const body = await req.json().catch(() => ({}));
    const { contact_id } = body;

    const { limit = 30 } = body;

    // Fetch sequentially to stay within rate limits
    const contacts = contact_id
      ? await platform.asServiceRole.entities.Contact.filter({ id: contact_id })
      : await platform.asServiceRole.entities.Contact.list('-updated_date', Math.min(limit, 30));
    const quotes = await platform.asServiceRole.entities.Quote.list('-created_date', 300);
    const invoices = await platform.asServiceRole.entities.Invoice.list('-created_date', 300);
    const submissions = await platform.asServiceRole.entities.Submission.list('-created_date', 200);

    const tasks = [];
    const results = [];

    // Fetch all existing scores in one call for efficient upsert
    const existingScores = await platform.asServiceRole.entities.LeadScore.list('-created_date', 500);
    const scoreMap = Object.fromEntries(existingScores.map(s => [s.contact_id, s]));

    // Process in batches of 10 to avoid rate limits
    const BATCH = 10;
    for (let i = 0; i < contacts.length; i += BATCH) {
      const batch = contacts.slice(i, i + BATCH);
      await Promise.all(batch.map(async (contact) => {
        const { score, grade, breakdown } = calcScore(contact, quotes, invoices, submissions, tasks);
        const payload = {
          contact_id: contact.id,
          score,
          grade,
          score_breakdown: breakdown,
          last_calculated_at: new Date().toISOString(),
        };
        const existing = scoreMap[contact.id];
        if (existing) {
          await platform.asServiceRole.entities.LeadScore.update(existing.id, payload);
        } else {
          await platform.asServiceRole.entities.LeadScore.create(payload);
        }
        results.push({ id: contact.id, name: contact.full_name, score, grade });
      }));
    }

    console.log(`Scored ${results.length} contacts`);
    return Response.json({ success: true, scored: results.length, results });
  } catch (error) {
    console.error('scoreLeads error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});