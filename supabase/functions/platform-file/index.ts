import { serve, adminClient } from '../_shared/server.ts';
serve('platform-file', async req => {
  const token = new URL(req.url).searchParams.get('token');
  if (!token || !/^[a-f0-9]{64}$/.test(token)) return new Response('Not found', { status: 404 });
  const client = adminClient(); const { data, error } = await client.rpc('cb_file_lookup', { capability: token });
  if (error || !data) return new Response('Not found', { status: 404 });
  const result = await client.storage.from('documents').createSignedUrl(data, 60, { download: true });
  if (result.error) throw result.error;
  return new Response(null, { status: 302, headers: { Location: result.data.signedUrl, 'Cache-Control': 'no-store', 'Referrer-Policy': 'no-referrer' } });
});
