import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const FROM_EMAIL = Deno.env.get('CLIENT_SERVICE_FROM_EMAIL') || 'Creative Books SA <info@creativebooks.co.za>';

function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function brandedEmail(innerContent) {
  return `<!doctype html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
  <body style="margin:0;padding:0;background:#F5F5F5;font-family:Helvetica,Arial,sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#F5F5F5"><tr><td align="center" style="padding:24px 16px">
  <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#FFFFFF;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08)">
  <tr><td height="10" style="background:linear-gradient(90deg,#e74c3c,#e67e22,#f1c40f,#2ecc71,#3498db,#9b59b6);font-size:0;line-height:0">&nbsp;</td></tr>
  <tr><td align="center" style="padding:32px 0 24px"><strong style="font-size:24px;color:#2C2C2C">Creative Books SA</strong></td></tr>
  <tr><td style="padding:0 32px 32px;font-size:15px;line-height:1.7;color:#2C2C2C"><div style="border-top:1px solid #E5E0D5;padding:24px 0;border-bottom:1px solid #E5E0D5">${innerContent}</div></td></tr>
  <tr><td align="center" style="padding:20px 32px 8px;font-size:13px;color:#6B6B6B;line-height:1.8"><strong style="color:#2C2C2C">Creative Books SA</strong><br>Prism Office Park, Fourways, Johannesburg<br><a href="mailto:info@creativebooks.co.za" style="color:#B87333;text-decoration:none">info@creativebooks.co.za</a> · 084 230 5393</td></tr>
  <tr><td align="center" style="padding:12px 32px 28px;font-size:11px;color:#AAAAAA">You are receiving this email as part of your active project with Creative Books SA.</td></tr>
  </table></td></tr></table></body></html>`;
}

function stageRow(label, value) {
  return `<tr><td style="padding:10px 12px;font-size:14px;font-weight:600;color:#2C2C2C;width:38%;border-bottom:1px solid #E5E0D5">${escapeHtml(label)}</td><td style="padding:10px 12px;font-size:14px;color:#2C2C2C;border-bottom:1px solid #E5E0D5">${escapeHtml(value)}</td></tr>`;
}

function buildEmailHtml(project, stageLabel, customBody, isWelcome, hasAttachments) {
  const today = new Date().toLocaleDateString('en-ZA', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'Africa/Johannesburg',
  });

  const detailsTable = `<table width="100%" cellpadding="0" cellspacing="0" style="border-radius:12px;overflow:hidden;border:1px solid #E5E0D5;margin-bottom:24px"><tr><td style="background:#FAF5EE;padding:0"><table width="100%" cellpadding="0" cellspacing="0">${stageRow('Project', project.project_title)}${stageRow('Service', project.service_type)}${stageRow('Stage', stageLabel)}${stageRow('Date', today)}</table></td></tr></table>`;
  const attachNote = isWelcome && hasAttachments
    ? '<p style="font-size:14px;color:#2C2C2C;background:#FFF8EE;border-left:4px solid #B87333;padding:12px 16px;border-radius:8px;margin:16px 0">Your payment receipt and invoice are attached to this email for your records.</p>'
    : '';

  const inner = `<h2 style="font-family:Georgia,serif;font-size:24px;font-weight:700;color:#2C2C2C;margin:0 0 8px">${escapeHtml(stageLabel)}</h2>
  <p style="font-size:15px;color:#2C2C2C;margin:0 0 20px">Dear ${escapeHtml(project.client_name)},</p>
  <div style="font-size:15px;color:#2C2C2C;line-height:1.7;margin-bottom:20px">${customBody || ''}</div>
  ${attachNote}${detailsTable}
  <p style="font-size:14px;color:#6B6B6B;margin:0">If you have any questions, contact us at <a href="mailto:info@creativebooks.co.za" style="color:#B87333;text-decoration:none">info@creativebooks.co.za</a> or call <strong>084 230 5393</strong>.</p>
  <p style="font-size:15px;color:#2C2C2C;margin:20px 0 0">Kind regards,<br><strong>Creative Books SA</strong></p>`;

  return brandedEmail(inner);
}

function parseStorageUri(value) {
  const match = typeof value === 'string' ? value.match(/^supabase:\/\/([^/]+)\/(.+)$/) : null;
  return match ? { bucket: match[1], path: match[2] } : null;
}

function bytesToBase64(bytes) {
  let binary = '';
  const chunkSize = 0x8000;
  for (let offset = 0; offset < bytes.length; offset += chunkSize) {
    const chunk = bytes.subarray(offset, Math.min(offset + chunkSize, bytes.length));
    binary += String.fromCharCode(...chunk);
  }
  return btoa(binary);
}

async function attachmentContent(admin, value) {
  const parsed = parseStorageUri(value);
  let bytes;

  if (parsed) {
    const { data, error } = await admin.storage.from(parsed.bucket).download(parsed.path);
    if (error) throw error;
    bytes = new Uint8Array(await data.arrayBuffer());
  } else {
    const response = await fetch(value);
    if (!response.ok) throw new Error(`Attachment fetch failed (${response.status}).`);
    bytes = new Uint8Array(await response.arrayBuffer());
  }

  return bytesToBase64(bytes);
}

async function requireAdmin(admin, request) {
  const authorization = request.headers.get('authorization') || '';
  const bearer = authorization.replace(/^Bearer\s+/i, '');
  if (!bearer) throw new Error('Unauthorized');

  const { data: userData, error: userError } = await admin.auth.getUser(bearer);
  if (userError || !userData.user) throw new Error('Unauthorized');

  const { data: profile, error: profileError } = await admin
    .from('profiles')
    .select('role, email, full_name')
    .eq('id', userData.user.id)
    .maybeSingle();
  if (profileError || !['super_admin', 'admin'].includes(profile?.role)) {
    throw new Error('Admin access required');
  }

  return {
    email: profile.email || userData.user.email || 'admin',
    fullName: profile.full_name || userData.user.email || 'Admin',
  };
}

async function getProject(admin, projectId) {
  const { data, error } = await admin
    .from('client_service_projects')
    .select('*')
    .eq('id', projectId)
    .maybeSingle();
  if (error) throw error;
  if (!data) throw new Error('Project not found');
  return data;
}

async function sendStageEmail(admin, actor, body) {
  const projectId = body.projectId || body.project_id;
  const stageKey = body.stageKey || body.stage_key;
  const stageLabel = body.stageLabel || body.stage_label;
  const subject = body.subject;
  const emailBody = body.emailBody ?? body.email_body ?? '';
  const isWelcome = Boolean(body.isWelcome ?? body.is_welcome);
  const forceResend = Boolean(body.forceResend ?? body.force_resend);

  if (!projectId || !stageKey || !stageLabel || !subject) {
    throw new Error('projectId, stageKey, stageLabel and subject are required');
  }

  const project = await getProject(admin, projectId);

  if (!forceResend) {
    const { data: existing, error: existingError } = await admin
      .from('service_email_logs')
      .select('id')
      .eq('project_id', projectId)
      .eq('stage_key', stageKey)
      .in('status', ['sent', 'resent'])
      .limit(1);
    if (existingError) throw existingError;
    if (existing?.length) {
      const conflict = new Error('Email already sent for this stage. Use Resend to send again.');
      conflict.status = 409;
      throw conflict;
    }
  }

  const attachments = [];
  const attachmentNames = [];
  if (isWelcome) {
    const candidates = [
      [project.payment_receipt_url, project.payment_receipt_name || 'Payment_Receipt.pdf'],
      [project.invoice_url, project.invoice_name || 'Invoice.pdf'],
    ];

    for (const [fileUrl, filename] of candidates) {
      if (!fileUrl) continue;
      try {
        attachments.push({ filename, content: await attachmentContent(admin, fileUrl) });
        attachmentNames.push(filename);
      } catch (error) {
        console.error(`Unable to attach ${filename}:`, error?.message || error);
      }
    }
  }

  const isStoredFullEmail = forceResend && /<html[\s>]/i.test(String(emailBody));
  const htmlBody = isStoredFullEmail
    ? String(emailBody)
    : buildEmailHtml(project, stageLabel, String(emailBody), isWelcome, attachments.length > 0);

  const resendKey = Deno.env.get('RESEND_API_KEY');
  if (!resendKey) throw new Error('RESEND_API_KEY is not configured');

  const resendPayload = {
    from: FROM_EMAIL,
    to: [project.client_email],
    subject,
    html: htmlBody,
    ...(attachments.length ? { attachments } : {}),
  };

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${resendKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(resendPayload),
  });
  const providerData = await response.json().catch(() => ({}));
  const success = response.ok;
  const logStatus = success ? (forceResend ? 'resent' : 'sent') : 'failed';

  const { error: logError } = await admin.from('service_email_logs').insert({
    project_id: projectId,
    client_name: project.client_name,
    client_email: project.client_email,
    project_title: project.project_title,
    service_type: project.service_type,
    stage_key: stageKey,
    stage_label: stageLabel,
    subject,
    body_html: htmlBody,
    status: logStatus,
    sent_at: new Date().toISOString(),
    sent_by: actor.email || actor.fullName,
    error_message: success ? null : (providerData?.message || 'Send failed'),
    attachments_included: attachmentNames,
    is_welcome_email: isWelcome,
    provider_message_id: success ? providerData?.id || null : null,
  });
  if (logError) throw logError;

  if (!success) {
    const deliveryError = new Error(providerData?.message || 'Email failed to send');
    deliveryError.status = 502;
    throw deliveryError;
  }

  return { success: true, attachmentsSent: attachmentNames, providerMessageId: providerData?.id || null };
}

Deno.serve(async request => {
  if (request.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (request.method !== 'POST') return json({ error: 'Method not allowed' }, 405);

  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  if (!supabaseUrl || !serviceRoleKey) return json({ error: 'Supabase service environment is not configured.' }, 500);

  const admin = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  try {
    const actor = await requireAdmin(admin, request);
    const body = await request.json().catch(() => ({}));
    const action = body.action;

    if (action === 'update_stage') {
      const { data, error } = await admin.rpc('update_client_service_stage', {
        p_project_id: body.projectId || body.project_id,
        p_stage_key: body.stageKey || body.stage_key,
        p_stage_label: body.stageLabel || body.stage_label,
        p_updated_by: body.updatedBy || body.updated_by || actor.email,
      });
      if (error) throw error;
      return json({ success: true, project: data });
    }

    if (action === 'send_stage_email') {
      return json(await sendStageEmail(admin, actor, body));
    }

    if (action === 'mark_stage_email_sent') {
      const { data, error } = await admin.rpc('mark_client_service_stage_email_sent', {
        p_project_id: body.projectId || body.project_id,
        p_stage_key: body.stageKey || body.stage_key,
      });
      if (error) throw error;
      return json({ success: true, project: data });
    }

    if (action === 'update_stage_and_send') {
      const projectId = body.projectId || body.project_id;
      const stageKey = body.stageKey || body.stage_key;
      const stageLabel = body.stageLabel || body.stage_label;

      const { error: stageError } = await admin.rpc('update_client_service_stage', {
        p_project_id: projectId,
        p_stage_key: stageKey,
        p_stage_label: stageLabel,
        p_updated_by: body.updatedBy || body.updated_by || actor.email,
      });
      if (stageError) throw stageError;

      const delivery = await sendStageEmail(admin, actor, body);

      const { data: project, error: markError } = await admin.rpc('mark_client_service_stage_email_sent', {
        p_project_id: projectId,
        p_stage_key: stageKey,
      });
      if (markError) throw markError;

      return json({ success: true, project, ...delivery });
    }

    return json({ error: 'Unknown action' }, 400);
  } catch (error) {
    console.error('client-service-actions error:', error?.message || error);
    const message = error?.message || 'Unexpected client service error.';
    const status = error?.status
      || (message === 'Unauthorized' ? 401
        : message === 'Admin access required' ? 403
        : message.includes('not found') ? 404
        : message.includes('required') ? 400
        : 500);
    return json({ error: message }, status);
  }
});
