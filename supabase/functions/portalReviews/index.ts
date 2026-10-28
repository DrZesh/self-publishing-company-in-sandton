import { createClientFromRequest, serve } from '../_shared/server.ts';

serve('portalReviews', async (req) => {
  try {
    const platform = createClientFromRequest(req);
    const user = await platform.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { action, review_id, project_id } = body;

    // ── GET MY REVIEWS ────────────────────────────────────────────────────────
    if (action === 'get_my_reviews') {
      const contacts = await platform.asServiceRole.entities.Contact.filter({ email: user.email });
      if (!contacts.length) return Response.json({ reviews: [] });
      const contact = contacts[0];
      
      // Check for completed projects
      const projects = await platform.asServiceRole.entities.Project.filter({ 
        contact_id: contact.id,
        stage: ['Completed', 'Delivered']
      });
      
      const canReview = projects.length > 0;
      
      return Response.json({ reviews: [], can_review: canReview, projects });
    }

    // ── SUBMIT REVIEW ─────────────────────────────────────────────────────────
    if (action === 'submit_review') {
      const { rating, testimonial, allow_website_use, internal_feedback } = body;
      
      const contacts = await platform.asServiceRole.entities.Contact.filter({ email: user.email });
      if (!contacts.length) return Response.json({ error: 'Contact not found' }, { status: 404 });
      const contact = contacts[0];
      
      const review = await platform.asServiceRole.entities.Submission.create({
        full_name: contact.full_name,
        email: contact.email,
        service_interest: ['Review'],
        message: testimonial || '',
        custom_fields: {
          review_rating: rating,
          review_type: 'testimonial',
          allow_website_use: allow_website_use || false,
          internal_feedback: internal_feedback || '',
          contact_id: contact.id,
          project_id: project_id || null,
        },
        status: 'new',
      });
      
      // Send thank you email
      await platform.functions.invoke('sendBrandedEmail', {
        to: contact.email,
        subject: 'Thank You for Your Review - Creative Books SA',
        template_name: 'review_thank_you',
        variables: {
          client_name: contact.full_name,
          rating: String(rating),
        }
      });
      
      // Notify admin
      await platform.entities.MessageLog.create({
        recipient_email: 'info@creativebooks.co.za',
        subject: `New Review: ${contact.full_name} (${rating}⭐)`,
        template_used: 'admin_review_notification',
        sent_at: new Date().toISOString(),
        success: true,
      });
      
      return Response.json({ success: true, review });
    }

    // ── ADMIN: APPROVE REVIEW FOR WEBSITE ────────────────────────────────────
    if (action === 'admin_approve_review') {
      const { approved } = body;
      // Implementation would update a Review entity or mark Submission as approved
      return Response.json({ success: true });
    }

    return Response.json({ error: 'Unknown action' }, { status: 400 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});