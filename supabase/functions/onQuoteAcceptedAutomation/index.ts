/**
 * onQuoteAcceptedAutomation
 * Called directly (e.g., from the quote builder) with { quote_id }.
 * Delegates entirely to the entity automation logic in onQuoteAccepted
 * by fetching the quote and calling the same steps.
 *
 * IMPORTANT: Does NOT send portal login or NDA — that only happens after
 * admin clicks "Confirm Invoice and Continue" (adminConfirmWorkflow).
 */
import { createClientFromRequest, serve } from '../_shared/server.ts';

serve('onQuoteAcceptedAutomation', async (req) => {
  try {
    const platform = createClientFromRequest(req);
    const { quote_id } = await req.json();

    const quotes = await platform.asServiceRole.entities.Quote.filter({ id: quote_id });
    if (!quotes?.length) return Response.json({ error: 'Quote not found' }, { status: 404 });
    const quote = quotes[0];

    if (quote.status !== 'Accepted') {
      return Response.json({ skipped: true, reason: `Quote status is "${quote.status}", not "Accepted"` });
    }

    // Delegate to the main automation by invoking it with the same payload shape
    const result = await platform.asServiceRole.functions.invoke('onQuoteAccepted', {
      data: quote,
    });

    return Response.json({ success: true, result });
  } catch (error) {
    console.error('onQuoteAcceptedAutomation error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});