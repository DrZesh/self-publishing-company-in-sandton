import { createClientFromRequest, serve } from '../_shared/server.ts';

serve('fileUploadActions', async (req) => {
  try {
    const platform = createClientFromRequest(req);
    
    const body = await req.json();
    const { action, request_id, file_url, file_name, token } = body;

    if (!token) {
      return Response.json({ error: 'Token required' }, { status: 400 });
    }

    // Verify portal access
    const accesses = await platform.entities.ClientPortalAccess.filter({ access_token: token });
    if (!accesses.length) {
      return Response.json({ error: 'Invalid portal access' }, { status: 403 });
    }
    const contactId = accesses[0].contact_id;

    if (action === 'upload_payment_proof' && file_url) {
      await platform.entities.Document.create({ contact_id: contactId, category: 'Proof of Payment', file_url, file_name, status: 'Pending Review' });
      return Response.json({ success: true });
    }
    if (action === 'upload_file' && request_id && file_url) {
      // Verify file request ownership
      const requests = await platform.entities.FileRequest.filter({ id: request_id });
      if (!requests.length) {
        return Response.json({ error: 'File request not found' }, { status: 404 });
      }
      const request = requests[0];

      if (request.contact_id !== contactId) {
        return Response.json({ error: 'Unauthorized' }, { status: 403 });
      }

      await platform.entities.FileRequest.update(request_id, {
        status: 'uploaded',
        uploaded_file_url: file_url,
        uploaded_file_name: file_name,
        uploaded_at: new Date().toISOString(),
      });

      // Create project update
      await platform.entities.ProjectUpdate.create({
        project_id: request.project_id,
        contact_id: contactId,
        update_type: 'file_uploaded',
        title: 'File Uploaded',
        message: `You uploaded ${file_name || 'the requested file'}. Our team will review it shortly.`,
      });

      return Response.json({ success: true, message: 'File uploaded successfully' });
    }

    return Response.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('File upload error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});