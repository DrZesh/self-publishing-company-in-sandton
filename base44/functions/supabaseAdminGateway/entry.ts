import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';
import { requireAdmin, AuthError } from './supabase-auth.ts';
import { allowedEntities } from './allowed-entities.ts';
const methods = new Set(['list', 'filter', 'create', 'update', 'delete']);
const integrations = new Set(['InvokeLLM', 'SendEmail', 'TranscribeAudio']);
Deno.serve(async (req) => {
  try {
    await requireAdmin(req);
    if (req.method !== 'POST') return Response.json({ error: 'Method not allowed' }, { status: 405 });
    const backend = createClientFromRequest(req).asServiceRole;
    if (req.headers.get('content-type')?.includes('multipart/form-data')) {
      const form = await req.formData();
      const file = form.get('file');
      if (form.get('kind') !== 'upload' || !(file instanceof File)) return Response.json({ error: 'Invalid upload' }, { status: 400 });
      if (file.size > 25 * 1024 * 1024) return Response.json({ error: 'Maximum file size is 25 MB' }, { status: 413 });
      return Response.json(await backend.integrations.Core.UploadFile({ file }));
    }
    const body = await req.json();
    if (body.kind === 'entity' && allowedEntities.has(body.entity) && methods.has(body.method) && Array.isArray(body.args)) {
      // User identity and roles are managed only in Supabase, never via this data gateway.
      if (body.entity === 'User') return Response.json({ error: 'Use Supabase to manage users' }, { status: 403 });
      return Response.json(await backend.entities[body.entity][body.method](...body.args));
    }
    if (body.kind === 'integration' && integrations.has(body.method) && body.args && typeof body.args === 'object') {
      return Response.json(await backend.integrations.Core[body.method](body.args));
    }
    return Response.json({ error: 'Unsupported operation' }, { status: 400 });
  } catch (error) {
    if (error instanceof AuthError) return Response.json({ error: error.message }, { status: error.status });
    console.error('Admin gateway request failed', error);
    return Response.json({ error: 'The backend request failed' }, { status: 500 });
  }
});
