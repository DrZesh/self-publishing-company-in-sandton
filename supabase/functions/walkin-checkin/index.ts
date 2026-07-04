import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

function cleanText(value: unknown, maxLength = 5000): string | null {
  if (typeof value !== 'string') return null;
  const cleaned = value.trim().slice(0, maxLength);
  return cleaned || null;
}

async function hashIp(ip: string, salt: string): Promise<string | null> {
  if (!ip || ip === 'unknown') return null;
  const digest = await crypto.subtle.digest(
    'SHA-256',
    new TextEncoder().encode(`${salt}:${ip}`),
  );
  return [...new Uint8Array(digest)]
    .map(byte => byte.toString(16).padStart(2, '0'))
    .join('');
}

Deno.serve(async request => {
  if (request.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (request.method !== 'POST') return json({ error: 'Method not allowed' }, 405);

  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  if (!supabaseUrl || !serviceRoleKey) {
    return json({ error: 'Supabase service environment is not configured.' }, 500);
  }

  const admin = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  try {
    const payload = await request.json().catch(() => ({}));
    const fullName = cleanText(payload.full_name || payload.fullName, 200);
    const email = cleanText(payload.email, 320)?.toLowerCase() || null;
    const phone = cleanText(payload.phone, 80);
    const serviceInterest = cleanText(payload.service_interest || payload.serviceInterest, 300);
    const notes = cleanText(payload.notes, 5000);

    if (!fullName || !phone) {
      return json({ error: 'Full name and phone number are required.' }, 400);
    }
    if (email && !email.includes('@')) {
      return json({ error: 'The email address provided is not valid.' }, 400);
    }

    let contact = null;

    if (email) {
      const { data, error } = await admin
        .from('contacts')
        .select('*')
        .ilike('email', email)
        .maybeSingle();
      if (error) throw error;
      contact = data;
    }

    if (!contact) {
      const { data, error } = await admin
        .from('contacts')
        .select('*')
        .eq('phone', phone)
        .order('updated_date', { ascending: false })
        .limit(1);
      if (error) throw error;
      contact = data?.[0] || null;
    }

    const now = new Date().toISOString();

    if (contact) {
      const { data, error } = await admin
        .from('contacts')
        .update({
          last_contact_date: now,
          email: contact.email || email,
          phone: contact.phone || phone,
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
          phone,
          lifecycle_stage: 'lead',
          pipeline_stage: 'New Enquiry',
          first_contact_date: now,
          last_contact_date: now,
        })
        .select('*')
        .single();
      if (error) throw error;
      contact = data;
    }

    const message = [
      'Walk-in client check-in.',
      `Service interest: ${serviceInterest || 'Not specified'}.`,
      `Notes: ${notes || 'None'}`,
    ].join(' ');

    const forwardedFor = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim();
    const ip = request.headers.get('cf-connecting-ip')
      || forwardedFor
      || request.headers.get('x-real-ip')
      || 'unknown';
    const salt = Deno.env.get('CAPTURE_IP_SALT') || Deno.env.get('WALKIN_IP_SALT');
    if (!salt) throw new Error('CAPTURE_IP_SALT or WALKIN_IP_SALT is required.');

    const { data: submission, error: submissionError } = await admin
      .from('submissions')
      .insert({
        form_type: 'contact',
        source_page: '/walk-in',
        full_name: fullName,
        email,
        phone,
        message,
        service_interest: serviceInterest ? [serviceInterest] : [],
        additional_fields: {
          capture_mode: 'walk_in',
          notes,
        },
        marketing_source: 'walk_in',
        landing_page: '/walk-in',
        pages_viewed: ['/walk-in'],
        device_type: /mobile/i.test(request.headers.get('user-agent') || '') ? 'mobile' : 'desktop',
        browser: null,
        country: 'South Africa',
        ip_address_hash: await hashIp(ip, salt),
        status: 'new',
        contact_id: contact.id,
      })
      .select('*')
      .single();
    if (submissionError) throw submissionError;

    const { error: activityError } = await admin.from('activity_logs').insert({
      entity_type: 'submission',
      entity_id: submission.id,
      action: 'walk_in_checkin',
      description: `Walk-in check-in from ${fullName}`,
      metadata: {
        contact_id: contact.id,
        service_interest: serviceInterest,
        notes,
      },
    });
    if (activityError) throw activityError;

    return json({
      success: true,
      contactId: contact.id,
      submissionId: submission.id,
    });
  } catch (error) {
    console.error('walkin-checkin error:', error?.message || error);
    return json({ error: error?.message || 'Unable to complete check-in.' }, 500);
  }
});
