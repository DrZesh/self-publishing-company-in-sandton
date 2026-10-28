import { createClientFromRequest, serve } from '../_shared/server.ts';

serve('getFollowUpReminders', async (req) => {
  try {
    const platform = createClientFromRequest(req);
    const user = await platform.auth.me();
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    const now = new Date();
    const followUps = [];

    // Fetch leads that need follow-up (active leads not updated in 3+ days)
    const leads = await platform.asServiceRole.entities.Lead.list('-updated_date', 100);
    for (const lead of leads) {
      if (!lead.updated_date) continue;
      const daysSince = Math.floor((now - new Date(lead.updated_date)) / (1000 * 60 * 60 * 24));
      if (daysSince >= 3 && lead.status !== 'won' && lead.status !== 'lost') {
        followUps.push({
          type: 'lead_followup',
          title: lead.full_name || lead.name || 'Lead',
          description: `No update in ${daysSince} days`,
          priority: daysSince >= 7 ? 'high' : daysSince >= 5 ? 'medium' : 'low',
          days_overdue: daysSince,
          contact_id: lead.id,
          estimated_value: lead.estimated_value || null,
        });
      }
    }

    // Fetch quotes needing follow-up (sent but not accepted, 3+ days old)
    const quotes = await platform.asServiceRole.entities.Quote.list('-updated_date', 100);
    for (const quote of quotes) {
      if (quote.status === 'accepted' || quote.status === 'rejected' || quote.status === 'cancelled') continue;

      if (quote.status === 'sent' && quote.sent_at) {
        const daysPending = Math.floor((now - new Date(quote.sent_at)) / (1000 * 60 * 60 * 24));
        if (daysPending >= 3) {
          followUps.push({
            type: 'quote_followup',
            title: `Quote: ${quote.contact_name || quote.book_title || 'Client'}`,
            description: `Sent ${daysPending} days ago, awaiting response`,
            priority: daysPending >= 7 ? 'high' : 'medium',
            days_pending: daysPending,
            quote_id: quote.id,
            quote_total: quote.total || null,
          });
        }
      }

      // Expiring quotes (expire within 3 days)
      if (quote.valid_until) {
        const daysUntilExpiry = Math.floor((new Date(quote.valid_until) - now) / (1000 * 60 * 60 * 24));
        if (daysUntilExpiry >= 0 && daysUntilExpiry <= 3) {
          followUps.push({
            type: 'quote_expiring',
            title: `Quote Expiring: ${quote.contact_name || quote.book_title || 'Client'}`,
            description: daysUntilExpiry === 0 ? 'Expires today' : `Expires in ${daysUntilExpiry} day(s)`,
            priority: daysUntilExpiry === 0 ? 'high' : 'medium',
            days_until_expiry: daysUntilExpiry,
            quote_id: quote.id,
            quote_total: quote.total || null,
          });
        }
      }
    }

    // Sort by priority
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    followUps.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

    return Response.json({
      followUps,
      summary: {
        total: followUps.length,
        high: followUps.filter(f => f.priority === 'high').length,
        medium: followUps.filter(f => f.priority === 'medium').length,
        low: followUps.filter(f => f.priority === 'low').length,
      }
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});