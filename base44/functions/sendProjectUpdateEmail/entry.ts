import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const STAGE_MESSAGES = {
  'Editing': 'Your manuscript is now with our editing team. We will carefully review and improve the text.',
  'Proofreading': 'Your book is currently being proofread. We are checking for any final errors.',
  'Typesetting': 'Your book is being typeset and laid out professionally. The interior design is underway.',
  'Cover Design': 'Our designers are working on your book cover. We will share a proof for your approval soon.',
  'Client Approval': 'Your book is ready for your review! Please check the proof and let us know if you have any changes.',
  'Changes Requested': 'We have received your change requests and are working on implementing them.',
  'Final Approval Received': 'Thank you for your final approval! Your book is now ready for printing.',
  'Sample Print Queued': 'Your sample print has been queued. A printed sample copy will be ready soon.',
  'Sample Print Completed': 'Your sample print is complete! Please review the physical copy.',
  'Mass Production Started': 'Excellent news! Your book is now in mass production. Printing has started.',
  'Ready for Collection': 'Your books are printed and ready for collection! Please contact us to arrange collection or delivery.',
  'Courier Booked': 'Your books have been handed to the courier. You will receive tracking details shortly.',
  'Delivered': 'Your books have been delivered! We hope you love them.',
  'Completed': 'Your publishing project is now complete! Congratulations on your published book.',
};

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { project_id, custom_message } = await req.json();
    if (!project_id) return Response.json({ error: 'project_id required' }, { status: 400 });

    const projects = await base44.asServiceRole.entities.Project.filter({ id: project_id });
    const project = projects[0];
    if (!project) return Response.json({ error: 'Project not found' }, { status: 404 });

    const contacts = await base44.asServiceRole.entities.Contact.filter({ id: project.contact_id });
    const contact = contacts[0];
    if (!contact) return Response.json({ error: 'Contact not found' }, { status: 404 });

    const stageMsg = custom_message || STAGE_MESSAGES[project.stage] || `Your project has been updated to: ${project.stage}`;

    const emailHtml = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family:Georgia,serif;color:#1a1a1a;margin:0;padding:0;background:#f9f7f2">
<div style="max-width:600px;margin:40px auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.08)">
  <div style="background:#B87333;padding:32px;text-align:center">
    <h1 style="color:#fff;margin:0;font-size:24px;letter-spacing:1px">CREATIVE BOOKS SA</h1>
    <p style="color:rgba(255,255,255,0.85);margin:6px 0 0;font-size:13px">Project Update</p>
  </div>
  <div style="padding:32px">
    <p style="color:#6b7280;margin:0 0 8px;font-size:14px">Dear ${contact.full_name},</p>
    <p style="color:#374151;line-height:1.6;margin-bottom:24px">We have an update on your publishing project.</p>
    
    <div style="background:#f9f7f2;border-radius:12px;padding:24px;margin-bottom:24px">
      <p style="color:#9ca3af;font-size:11px;text-transform:uppercase;letter-spacing:1px;margin:0 0 8px">Book Title</p>
      <h2 style="color:#1a1a1a;margin:0 0 16px;font-size:22px">${project.book_title}</h2>
      <div style="display:inline-block;background:#B87333;color:#fff;padding:8px 20px;border-radius:20px;font-size:14px;font-weight:600">
        ${project.stage}
      </div>
    </div>

    <p style="color:#374151;line-height:1.7;font-size:15px;margin-bottom:24px">${stageMsg}</p>

    ${project.client_notes ? `
    <div style="background:#eff6ff;border-left:4px solid #3b82f6;padding:16px;border-radius:0 8px 8px 0;margin-bottom:24px">
      <p style="font-weight:700;color:#1e40af;margin:0 0 8px;font-size:13px">NOTE FROM YOUR PUBLISHING MANAGER</p>
      <p style="color:#1d4ed8;margin:0;line-height:1.6">${project.client_notes}</p>
    </div>` : ''}

    ${project.deadline ? `<p style="color:#6b7280;font-size:13px">Target completion date: <strong>${new Date(project.deadline).toLocaleDateString('en-ZA', { day: 'numeric', month: 'long', year: 'numeric' })}</strong></p>` : ''}

    <p style="color:#374151;margin-top:24px;line-height:1.6">
      If you have any questions, please don't hesitate to contact us.<br><br>
      Kind regards,<br><strong>Creative Books SA Team</strong>
    </p>
  </div>
  <div style="background:#f9f7f2;padding:16px;text-align:center;border-top:1px solid #e5e7eb">
    <p style="color:#9ca3af;font-size:12px;margin:0">Creative Books SA · info@creativebookssa.co.za · www.creativebookssa.co.za</p>
  </div>
</div>
</body>
</html>`;

    const resendApiKey = Deno.env.get('RESEND_API_KEY');
    const emailResp = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${resendApiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: 'Creative Books SA <info@creativebooks.co.za>',
        to: [contact.email],
        subject: `Project Update: ${project.book_title} — ${project.stage}`,
        html: emailHtml,
      }),
    });

    const emailResult = await emailResp.json();
    return Response.json({ success: true, resend_id: emailResult.id, stage: project.stage });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});