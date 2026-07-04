import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders,
      'Content-Type': 'application/json',
    },
  });
}

function cleanText(value: unknown, maxLength = 5000): string | null {
  if (typeof value !== 'string') return null;
  const cleaned = value.trim().slice(0, maxLength);
  return cleaned || null;
}

function parsePositiveInteger(value: unknown): number | null {
  const parsed = Number.parseInt(String(value ?? ''), 10);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : null;
}

async function hashIp(ip: string, salt: string): Promise<string | null> {
  if (!ip || ip === 'unknown') return null;

  const bytes = new TextEncoder().encode(`${ip}:${salt}`);
  const digest = await crypto.subtle.digest('SHA-256', bytes);

  return Array.from(new Uint8Array(digest))
    .map(byte => byte.toString(16).padStart(2, '0'))
    .join('');
}

Deno.serve(async (request) => {
  if (request.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (request.method !== 'POST') {
    return json({ error: 'Method not allowed' }, 405);
  }

  try {
    const payload = await request.json();

    const fullName = cleanText(payload.fullName, 200);
    const email = cleanText(payload.email, 320)?.toLowerCase();

    if (!fullName || !email || !email.includes('@')) {
      return json({ error: 'A valid full name and email address are required.' }, 400);
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !serviceRoleKey) {
      throw new Error('Supabase service environment is not configured.');
    }

    const admin = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });

    const userAgent = request.headers.get('user-agent') || '';
    const forwardedFor = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim();
    const ipAddress =
      request.headers.get('cf-connecting-ip') ||
      forwardedFor ||
      request.headers.get('x-real-ip') ||
      'unknown';

    const deviceType = /mobile/i.test(userAgent)
      ? 'mobile'
      : /tablet|ipad/i.test(userAgent)
        ? 'tablet'
        : 'desktop';

    const browser = /edg/i.test(userAgent)
      ? 'Edge'
      : /firefox/i.test(userAgent)
        ? 'Firefox'
        : /chrome/i.test(userAgent)
          ? 'Chrome'
          : /safari/i.test(userAgent)
            ? 'Safari'
            : 'Unknown';

    const referrer = request.headers.get('referer') || '';
    let marketingSource = 'direct';

    if (/google\.(com|co\.za)/i.test(referrer)) marketingSource = 'organic_search';
    else if (/facebook|instagram|twitter|x\.com|linkedin/i.test(referrer)) marketingSource = 'social';
    else if (referrer) marketingSource = 'referral';

    const ipSalt = Deno.env.get('CAPTURE_IP_SALT') || 'creative-books-capture';
    const ipAddressHash = await hashIp(ipAddress, ipSalt);

    const sourcePage = cleanText(payload.sourcePage, 1000);
    const serviceInterest = Array.isArray(payload.serviceInterest)
      ? payload.serviceInterest.filter((value: unknown) => typeof value === 'string').slice(0, 30)
      : [];

    const additionalFields =
      payload.additionalFields && typeof payload.additionalFields === 'object' && !Array.isArray(payload.additionalFields)
        ? payload.additionalFields
        : {};

    const { data: existingContact, error: contactLookupError } = await admin
      .from('contacts')
      .select('*')
      .ilike('email', email)
      .maybeSingle();

    if (contactLookupError) throw contactLookupError;

    let contact = existingContact;

    if (contact) {
      const { data, error } = await admin
        .from('contacts')
        .update({
          last_contact_date: new Date().toISOString(),
          phone: contact.phone || cleanText(payload.phone, 80),
          city: contact.city || cleanText(payload.city, 120),
        })
        .eq('id', contact.id)
        .select('*')
        .single();

      if (error) throw error;
      contact = data;
    } else {
      const { data, error } = await admin
        .from('contacts')
        .insert({
          full_name: fullName,
          email,
          phone: cleanText(payload.phone, 80),
          lifecycle_stage: 'lead',
          city: cleanText(payload.city, 120),
          book_title: cleanText(payload.bookTitle, 500),
        })
        .select('*')
        .single();

      if (error) throw error;
      contact = data;
    }

    const formType = ['contact', 'quote', 'newsletter', 'package_order', 'service_enquiry', 'other'].includes(payload.formType)
      ? payload.formType
      : 'other';

    const { data: submission, error: submissionError } = await admin
      .from('submissions')
      .insert({
        form_type: formType,
        source_page: sourcePage,
        full_name: fullName,
        email,
        phone: cleanText(payload.phone, 80),
        message: cleanText(payload.message, 10000),
        service_interest: serviceInterest,
        budget: cleanText(payload.budget, 200),
        book_title: cleanText(payload.bookTitle, 500),
        book_genre: cleanText(payload.bookGenre, 200),
        book_page_count: parsePositiveInteger(payload.bookPageCount),
        book_word_count: parsePositiveInteger(payload.bookWordCount),
        additional_fields: additionalFields,
        marketing_source: marketingSource,
        referrer_url: referrer || null,
        landing_page: sourcePage,
        pages_viewed: sourcePage ? [sourcePage] : [],
        session_duration_seconds: parsePositiveInteger(payload.sessionDuration) || 0,
        device_type: deviceType,
        browser,
        city: cleanText(payload.city, 120),
        country: cleanText(payload.country, 120) || 'South Africa',
        ip_address_hash: ipAddressHash,
        status: 'new',
        contact_id: contact.id,
      })
      .select('*')
      .single();

    if (submissionError) throw submissionError;

    await admin.from('activity_logs').insert({
      entity_type: 'submission',
      entity_id: submission.id,
      action: 'created',
      description: `New ${formType} submission from ${fullName}`,
      metadata: {
        contact_id: contact.id,
        source_page: sourcePage,
      },
    });

    return json({
      success: true,
      submissionId: submission.id,
      contactId: contact.id,
    });
  } catch (error) {
    console.error('capture-form-submission error:', error);
    return json({ error: error instanceof Error ? error.message : 'Unable to process submission.' }, 500);
  }
});
