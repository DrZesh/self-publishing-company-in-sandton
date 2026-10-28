import { createClientFromRequest, serve } from '../_shared/server.ts';

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');

function brandedEmail(innerContent) {
  return '<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>' +
    '<body style="margin:0;padding:0;background:#F5F5F5;font-family:Helvetica,Arial,sans-serif;">' +
    '<table width="100%" cellpadding="0" cellspacing="0" style="background:#F5F5F5;"><tr><td align="center" style="padding:24px 16px;">' +
    '<table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#FFFFFF;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">' +
    '<tr><td height="10" style="background:linear-gradient(90deg,#e74c3c,#e67e22,#f1c40f,#2ecc71,#3498db,#9b59b6);font-size:0;line-height:0;">&nbsp;</td></tr>' +
    '<tr><td align="center" style="padding:32px 0 24px;">' +
    '<img src="https://media.base44.com/images/public/69fb173eeab1ba78da6eab45/a6ae114da_creativelogo.png" alt="Creative Books SA" width="160" style="max-width:160px;height:auto;display:block;" />' +
    '</td></tr>' +
    '<tr><td style="padding:0 32px 32px;font-size:15px;line-height:1.7;color:#2C2C2C;">' +
    '<table width="100%" cellpadding="0" cellspacing="0"><tr><td height="1" style="background:#E5E0D5;font-size:0;">&nbsp;</td></tr></table>' +
    '<div style="padding:24px 0;">' + innerContent + '</div>' +
    '<table width="100%" cellpadding="0" cellspacing="0"><tr><td height="1" style="background:#E5E0D5;font-size:0;">&nbsp;</td></tr></table>' +
    '</td></tr>' +
    '<tr><td align="center" style="padding:20px 32px 8px;font-size:13px;color:#6B6B6B;line-height:1.8;">' +
    '<strong style="color:#2C2C2C;">Creative Books SA</strong><br />' +
    'Prism Office Park, Fourways, Johannesburg<br />' +
    '<a href="mailto:info@creativebooks.co.za" style="color:#B87333;text-decoration:none;">info@creativebooks.co.za</a> &middot; 084 230 5393' +
    '</td></tr>' +
    '<tr><td align="center" style="padding:12px 32px 28px;font-size:11px;color:#AAAAAA;">You are receiving this email as part of your active project with Creative Books SA.</td></tr>' +
    '</table></td></tr></table></body></html>';
}

function stageRow(label, value) {
  return '<tr><td style="padding:10px 12px;font-size:14px;font-weight:600;color:#2C2C2C;width:38%;border-bottom:1px solid #E5E0D5;">' + label + '</td>' +
    '<td style="padding:10px 12px;font-size:14px;color:#2C2C2C;border-bottom:1px solid #E5E0D5;">' + value + '</td></tr>';
}

function buildEmailHtml(project, stageLabel, customBody, isWelcome, hasAttachments) {
  const today = new Date().toLocaleDateString('en-ZA', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  const detailsTable = '<table width="100%" cellpadding="0" cellspacing="0" style="border-radius:12px;overflow:hidden;border:1px solid #E5E0D5;margin-bottom:24px;">' +
    '<tr><td style="background:#FAF5EE;padding:0;"><table width="100%" cellpadding="0" cellspacing="0">' +
    stageRow('Project', project.project_title) +
    stageRow('Service', project.service_type) +
    stageRow('Stage', stageLabel) +
    stageRow('Date', today) +
    '</table></td></tr></table>';

  const attachNote = isWelcome && hasAttachments
    ? '<p style="font-size:14px;color:#2C2C2C;background:#FFF8EE;border-left:4px solid #B87333;padding:12px 16px;border-radius:8px;margin:16px 0;">Your payment receipt and invoice are attached to this email for your records.</p>'
    : '';

  const inner = '<h2 style="font-family:Georgia,serif;font-size:24px;font-weight:700;color:#2C2C2C;margin:0 0 8px 0;">' + stageLabel + '</h2>' +
    '<p style="font-size:15px;color:#2C2C2C;margin:0 0 20px 0;">Dear ' + project.client_name + ',</p>' +
    '<div style="font-size:15px;color:#2C2C2C;line-height:1.7;margin-bottom:20px;">' + customBody + '</div>' +
    attachNote +
    detailsTable +
    '<p style="font-size:14px;color:#6B6B6B;margin:0;">If you have any questions, please do not hesitate to contact us at <a href="mailto:info@creativebooks.co.za" style="color:#B87333;text-decoration:none;">info@creativebooks.co.za</a> or call <strong>084 230 5393 / 010 500 3331</strong>.</p>' +
    '<p style="font-size:15px;color:#2C2C2C;margin:20px 0 0 0;">Kind regards,<br /><strong>Creative Books SA</strong></p>';

  return brandedEmail(inner);
}

async function fetchAsBase64(url) {
  const res = await fetch(url);
  const buf = await res.arrayBuffer();
  const bytes = new Uint8Array(buf);
  let binary = '';
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
  return btoa(binary);
}

serve('clientServiceActions', async (req) => {
  try {
    const platform = createClientFromRequest(req);
    const user = await platform.auth.me();
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await req.json();
    const { action } = body;

    // ── Send Stage Email ──────────────────────────────────────────────────────
    if (action === 'send_stage_email') {
      const { projectId, stageKey, stageLabel, subject, emailBody, isWelcome } = body;

      const project = await platform.asServiceRole.entities.ClientServiceProject.get(projectId);
      if (!project) return Response.json({ error: 'Project not found' }, { status: 404 });

      // Dedup check — prevent same stage from being emailed twice unless resend
      if (!body.forceResend) {
        const existing = await platform.asServiceRole.entities.ServiceEmailLog.filter({
          project_id: projectId, stage_key: stageKey, status: 'sent',
        });
        if (existing.length > 0) {
          return Response.json({ error: 'Email already sent for this stage. Use Resend to send again.' }, { status: 409 });
        }
      }

      // Build attachments for welcome email
      const attachments = [];
      const attachmentNames = [];
      if (isWelcome) {
        if (project.payment_receipt_url) {
          try {
            const content = await fetchAsBase64(project.payment_receipt_url);
            attachments.push({ filename: project.payment_receipt_name || 'Payment_Receipt.pdf', content });
            attachmentNames.push(project.payment_receipt_name || 'Payment_Receipt.pdf');
          } catch (e) { console.error('Receipt fetch failed:', e.message); }
        }
        if (project.invoice_url) {
          try {
            const content = await fetchAsBase64(project.invoice_url);
            attachments.push({ filename: project.invoice_name || 'Invoice.pdf', content });
            attachmentNames.push(project.invoice_name || 'Invoice.pdf');
          } catch (e) { console.error('Invoice fetch failed:', e.message); }
        }
      }

      const htmlBody = buildEmailHtml(project, stageLabel, emailBody, isWelcome, attachments.length > 0);

      // Send via Resend
      const resendPayload = {
        from: 'Creative Books SA <info@creativebooks.co.za>',
        to: [project.client_email],
        subject,
        html: htmlBody,
      };
      if (attachments.length > 0) resendPayload.attachments = attachments;

      const resendRes = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${RESEND_API_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(resendPayload),
      });

      const resendData = await resendRes.json();
      const success = resendRes.ok;

      // Log email
      const logStatus = body.forceResend ? 'resent' : (success ? 'sent' : 'failed');
      await platform.asServiceRole.entities.ServiceEmailLog.create({
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
        sent_by: user.email || user.full_name,
        error_message: success ? '' : (resendData?.message || 'Send failed'),
        attachments_included: attachmentNames,
        is_welcome_email: isWelcome || false,
      });

      if (!success) return Response.json({ error: 'Email failed to send', detail: resendData }, { status: 500 });
      return Response.json({ success: true, attachmentsSent: attachmentNames });
    }

    // ── Update Stage ──────────────────────────────────────────────────────────
    if (action === 'update_stage') {
      const { projectId, stageKey, stageLabel, updatedBy } = body;
      const project = await platform.asServiceRole.entities.ClientServiceProject.get(projectId);
      if (!project) return Response.json({ error: 'Project not found' }, { status: 404 });

      const historyEntry = {
        stage_key: stageKey,
        stage_label: stageLabel,
        updated_at: new Date().toISOString(),
        updated_by: updatedBy || user.email,
        email_sent: false,
      };

      const history = Array.isArray(project.stage_history) ? [...project.stage_history, historyEntry] : [historyEntry];
      const updateData = {
        current_stage_key: stageKey,
        current_stage_label: stageLabel,
        stage_history: history,
      };
      if (stageKey === 'intro') updateData.welcome_email_sent = false;

      await platform.asServiceRole.entities.ClientServiceProject.update(projectId, updateData);
      return Response.json({ success: true });
    }

    // ── Mark Email Sent on Stage History ─────────────────────────────────────
    if (action === 'mark_stage_email_sent') {
      const { projectId, stageKey } = body;
      const project = await platform.asServiceRole.entities.ClientServiceProject.get(projectId);
      if (!project) return Response.json({ error: 'Not found' }, { status: 404 });

      const history = (project.stage_history || []).map(h =>
        h.stage_key === stageKey ? { ...h, email_sent: true } : h
      );
      const updates = { stage_history: history, last_email_sent_at: new Date().toISOString(), total_emails_sent: (project.total_emails_sent || 0) + 1 };
      if (stageKey === 'intro') updates.welcome_email_sent = true;
      await platform.asServiceRole.entities.ClientServiceProject.update(projectId, updates);
      return Response.json({ success: true });
    }

    return Response.json({ error: 'Unknown action' }, { status: 400 });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
});