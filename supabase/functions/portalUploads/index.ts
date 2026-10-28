import { createClientFromRequest, serve } from '../_shared/server.ts';

serve('portalUploads', async (req) => {
  try {
    const platform = createClientFromRequest(req);
    const user = await platform.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { action, file_url, file_name, file_type, project_id, upload_category, admin_feedback } = body;

    // ── GET CLIENT UPLOADS ───────────────────────────────────────────────────
    if (action === 'get_my_uploads') {
      const contacts = await platform.asServiceRole.entities.Contact.filter({ email: user.email });
      if (!contacts.length) return Response.json({ uploads: [] });
      const contact = contacts[0];
      
      const uploads = await platform.asServiceRole.entities.Document.filter({ 
        contact_id: contact.id,
        category: ['Manuscript', 'Edited Manuscript', 'Cover Image', 'Author Photo', 'ISBN Document', 'Proof Corrections', 'Signed Documents', 'Print-Ready Files', 'Proof of Payment', 'Supporting Documents', 'Client Supplied']
      }, '-created_date');
      
      return Response.json({ uploads });
    }

    // ── UPLOAD FILE ───────────────────────────────────────────────────────────
    if (action === 'upload_file') {
      const contacts = await platform.asServiceRole.entities.Contact.filter({ email: user.email });
      if (!contacts.length) return Response.json({ error: 'Contact not found' }, { status: 404 });
      const contact = contacts[0];
      
      const doc = await platform.asServiceRole.entities.Document.create({
        contact_id: contact.id,
        project_id: project_id || null,
        category: upload_category || 'Client Supplied',
        file_name,
        file_url,
        file_type: file_type || 'application/pdf',
        file_size_kb: 0,
        status: 'Uploaded',
        uploaded_by: contact.full_name,
        sent_at: new Date().toISOString(),
        book_title: body.book_title || '',
      });
      
      // Create project update if project linked
      if (project_id) {
        await platform.entities.ProjectUpdate.create({
          project_id,
          contact_id: contact.id,
          update_type: 'file_uploaded',
          title: 'File Uploaded',
          message: `${contact.full_name} uploaded ${file_name}`,
        });
      }
      
      // Notify admin
      await platform.entities.MessageLog.create({
        recipient_email: 'info@creativebooks.co.za',
        subject: `New File Upload: ${file_name} by ${contact.full_name}`,
        template_used: 'admin_file_upload_notification',
        sent_at: new Date().toISOString(),
        success: true,
      });
      
      return Response.json({ success: true, document: doc });
    }

    // ── ADMIN: UPDATE UPLOAD STATUS ──────────────────────────────────────────
    if (action === 'admin_update_status') {
      const { status, notes } = body;
      const docs = await platform.asServiceRole.entities.Document.filter({ id: body.document_id });
      if (!docs.length) return Response.json({ error: 'Not found' }, { status: 404 });
      
      await platform.asServiceRole.entities.Document.update(body.document_id, {
        status,
        internal_notes: notes || '',
        admin_feedback,
      });
      
      // Notify client if status changed to rejected or needs re-upload
      if (['Rejected', 'Please Re-upload'].includes(status)) {
        const doc = docs[0];
        const contacts = await platform.asServiceRole.entities.Contact.filter({ id: doc.contact_id });
        if (contacts.length) {
          await platform.functions.invoke('sendBrandedEmail', {
            to: contacts[0].email,
            subject: 'File Upload Review - Creative Books SA',
            template_name: 'file_upload_review',
            variables: {
              client_name: contacts[0].full_name,
              file_name: doc.file_name,
              status,
              feedback: admin_feedback || 'Please review and re-upload',
            }
          });
        }
      }
      
      return Response.json({ success: true });
    }

    return Response.json({ error: 'Unknown action' }, { status: 400 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});