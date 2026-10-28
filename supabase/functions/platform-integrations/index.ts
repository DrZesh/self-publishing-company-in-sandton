import { serve, createClientFromRequest } from '../_shared/server.ts';
serve('platform-integrations', async req => {
  const { operation, ...args } = await req.json();
  const core = createClientFromRequest(req).integrations.Core;
  if (!['SendEmail', 'InvokeLLM', 'TranscribeAudio'].includes(operation)) return Response.json({ error: 'Unsupported operation' }, { status: 400 });
  return Response.json(await core[operation](args));
});
