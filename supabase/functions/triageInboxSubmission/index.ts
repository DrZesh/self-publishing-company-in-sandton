import { createClientFromRequest, serve } from '../_shared/server.ts';

// AI Inbox Triage — auto-tags submission with priority, sentiment, and category
serve('triageInboxSubmission', async (req) => {
  try {
    const platform = createClientFromRequest(req);

    const body = await req.json().catch(() => ({}));
    const { submission_id } = body;

    if (!submission_id) {
      return Response.json({ error: 'submission_id required' }, { status: 400 });
    }

    const submissions = await platform.asServiceRole.entities.Submission.filter({ id: submission_id });
    if (!submissions.length) {
      return Response.json({ error: 'Submission not found' }, { status: 404 });
    }
    const sub = submissions[0];

    const context = [
      sub.full_name ? `Name: ${sub.full_name}` : '',
      sub.message ? `Message: ${sub.message}` : '',
      sub.service_interest?.length ? `Services: ${sub.service_interest.join(', ')}` : '',
      sub.budget ? `Budget: ${sub.budget}` : '',
      sub.book_title ? `Book: ${sub.book_title}` : '',
    ].filter(Boolean).join('\n');

    const result = await platform.asServiceRole.integrations.Core.InvokeLLM({
      prompt: `You are an inbox assistant for Creative Books SA, a South African self-publishing company. Analyze this inbound enquiry and return a JSON object with these fields:
- priority: "urgent" | "high" | "normal" | "low"
- sentiment: "positive" | "neutral" | "negative" | "urgent_need"
- category: "quote_request" | "print_order" | "editing" | "cover_design" | "ghostwriting" | "publishing_package" | "general_enquiry" | "spam"
- summary: A one-sentence summary of the enquiry (max 15 words)
- recommended_action: "send_quote" | "book_consultation" | "request_details" | "acknowledge" | "ignore"
- urgency_reason: Brief reason if priority is urgent/high (null otherwise)

Enquiry details:
${context}`,
      response_json_schema: {
        type: 'object',
        properties: {
          priority: { type: 'string' },
          sentiment: { type: 'string' },
          category: { type: 'string' },
          summary: { type: 'string' },
          recommended_action: { type: 'string' },
          urgency_reason: { type: 'string' },
        },
      },
    });

    // Save triage result to submission's additional_fields or a new triage_data field
    await platform.asServiceRole.entities.Submission.update(submission_id, {
      additional_fields: {
        ...(sub.additional_fields || {}),
        ai_priority: result.priority,
        ai_sentiment: result.sentiment,
        ai_category: result.category,
        ai_summary: result.summary,
        ai_recommended_action: result.recommended_action,
        ai_urgency_reason: result.urgency_reason || '',
        ai_triaged_at: new Date().toISOString(),
      },
    });

    console.log(`Triaged submission ${submission_id}:`, result);
    return Response.json({ success: true, triage: result });
  } catch (error) {
    console.error('triageInboxSubmission error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});