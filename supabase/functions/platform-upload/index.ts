import { serve, adminClient } from '../_shared/server.ts';
import { uploadFile } from '../_shared/integrations.ts';
serve('platform-upload', async req => {
  const form = await req.formData(); const file = form.get('file');
  if (!(file instanceof File) || file.size === 0 || file.size > 50 * 1024 * 1024) return Response.json({ error: 'Upload a file between 1 byte and 50 MB' }, { status: 400 });
  // Only document/image/audio formats used by the app. Never host executable HTML or SVG.
  if (!/\.(pdf|docx?|odt|rtf|txt|csv|xlsx?|epub|zip|png|jpe?g|webp|gif|tiff?|mp3|wav|m4a|ogg|webm)$/i.test(file.name)) return Response.json({ error: 'Unsupported file format' }, { status: 400 });
  return Response.json(await uploadFile(adminClient(), { file }, 'uploads'));
});
