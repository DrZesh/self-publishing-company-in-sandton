import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

// Hash function for IP anonymization
async function hashIP(ip) {
  const encoder = new TextEncoder();
  const data = encoder.encode(ip + 'creative-books-salt');
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

Deno.serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  try {
    const base44 = createClientFromRequest(req);
    const payload = await req.json();

    // Extract form data
    const {
      formType,
      fullName,
      email,
      phone,
      message,
      sourcePage,
      serviceInterest = [],
      budget,
      bookTitle,
      bookGenre,
      bookPageCount,
      bookWordCount,
      additionalFields = {},
    } = payload;

    // Extract visitor context
    const userAgent = req.headers.get('user-agent') || '';
    const ipAddress = req.headers.get('cf-connecting-ip') || 
                      req.headers.get('x-forwarded-for')?.split(',')[0] ||
                      req.headers.get('x-real-ip') ||
                      'unknown';

    // Hash IP for POPIA compliance
    const ipAddressHash = await hashIP(ipAddress);

    // Parse user agent for device and browser
    const deviceType = userAgent.includes('Mobile') ? 'mobile' : 
                      userAgent.includes('Tablet') ? 'tablet' : 'desktop';
    
    const browser = userAgent.includes('Chrome') ? 'Chrome' :
                   userAgent.includes('Firefox') ? 'Firefox' :
                   userAgent.includes('Safari') ? 'Safari' :
                   userAgent.includes('Edge') ? 'Edge' : 'Unknown';

    // Determine marketing source from referrer if available
    let marketingSource = 'direct';
    let searchKeywords = null;
    const referrer = req.headers.get('referer') || '';
    
    if (referrer.includes('google.com') || referrer.includes('google.co.za')) {
      marketingSource = 'organic_search';
      try {
        const url = new URL(referrer);
        searchKeywords = url.searchParams.get('q');
      } catch {}
    } else if (referrer.includes('facebook.com') || referrer.includes('instagram.com') || 
               referrer.includes('twitter.com') || referrer.includes('linkedin.com')) {
      marketingSource = 'social';
    } else if (referrer) {
      marketingSource = 'referral';
    }

    // Create submission record — use service role since this is a public (unauthenticated) form
    const submission = await base44.asServiceRole.entities.Submission.create({
      form_type: formType,
      source_page: sourcePage,
      full_name: fullName,
      email,
      phone: phone || null,
      message: message || null,
      service_interest: serviceInterest.length > 0 ? serviceInterest : null,
      budget: budget || null,
      book_title: bookTitle || null,
      book_genre: bookGenre || null,
      book_page_count: bookPageCount || null,
      book_word_count: bookWordCount || null,
      additional_fields: Object.keys(additionalFields).length > 0 ? additionalFields : null,
      marketing_source: marketingSource,
      search_keywords: searchKeywords,
      referrer_url: referrer || null,
      landing_page: sourcePage,
      pages_viewed: [sourcePage],
      session_duration_seconds: payload.sessionDuration || 0,
      device_type: deviceType,
      browser,
      city: payload.city || null,
      country: payload.country || 'South Africa',
      ip_address_hash: ipAddressHash,
      status: 'new',
    });

    // Auto-create or link contact
    let contact = null;
    try {
      const existingContact = await base44.asServiceRole.entities.Contact.filter(
        { email },
        '-created_date',
        1
      );

      if (existingContact && existingContact.length > 0) {
        contact = existingContact[0];
        // Update last_contact_date
        await base44.asServiceRole.entities.Contact.update(contact.id, {
          last_contact_date: new Date().toISOString(),
        });
      } else {
        // Create new contact
        contact = await base44.asServiceRole.entities.Contact.create({
          full_name: fullName,
          email,
          phone: phone || null,
          lifecycle_stage: 'lead',
          first_contact_date: new Date().toISOString(),
          last_contact_date: new Date().toISOString(),
        });
      }

      // Link submission to contact
      if (contact) {
        await base44.asServiceRole.entities.Submission.update(submission.id, {
          contact_id: contact.id,
        });
      }
    } catch (contactErr) {
      console.error('Contact linking error:', contactErr.message);
      // Continue without contact linking
    }

    // Log activity
    try {
      await base44.asServiceRole.entities.ActivityLog.create({
        entity_type: 'submission',
        entity_id: submission.id,
        action: 'created',
        actor_id: 'system',
        description: `New ${formType} submission from ${fullName}`,
      });
    } catch (logErr) {
      console.error('Activity logging error:', logErr.message);
    }

    return Response.json({
      success: true,
      submissionId: submission.id,
      contactId: contact?.id,
    });
  } catch (error) {
    console.error('Form capture error:', error.message);
    // Return success anyway to not break user experience
    return Response.json({
      success: true,
      message: 'Form processed',
    }, { status: 200 });
  }
});