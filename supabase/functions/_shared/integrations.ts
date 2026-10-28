export function required(name: string) { const value = Deno.env.get(name); if (!value) throw new Error(`${name} is not configured`); return value; }
export function serverKey() {
  const keys = Deno.env.get('SUPABASE_SECRET_KEYS');
  return (keys ? JSON.parse(keys).default : null) || required('SUPABASE_SERVICE_ROLE_KEY');
}
export function publicKey() {
  const keys = Deno.env.get('SUPABASE_PUBLISHABLE_KEYS');
  return (keys ? JSON.parse(keys).default : null) || required('SUPABASE_ANON_KEY');
}
export function internalToken() { return Deno.env.get('CB_INTERNAL_SECRET') || serverKey(); }
export async function sendEmail(args: Record<string, any>) {
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST', headers: { Authorization: `Bearer ${required('RESEND_API_KEY')}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from: Deno.env.get('EMAIL_FROM') || 'Creative Books SA <info@creativebooks.co.za>', to: args.to, subject: args.subject, ...(args.body?.includes('<') || args.html ? { html: args.html || args.body } : { text: args.body || '' }) }),
  });
  const result = await response.json(); if (!response.ok) throw new Error(result.message || 'Email delivery failed'); return result;
}
export async function uploadFile(client: any, { file }: { file: File | Blob }, owner = 'generated') {
  const name = file instanceof File ? file.name : 'document.pdf';
  const path = `${owner}/${crypto.randomUUID()}/${name.replace(/[^A-Za-z0-9._-]/g, '_')}`;
  const { error } = await client.storage.from('documents').upload(path, file, { contentType: file.type || 'application/octet-stream', upsert: false });
  if (error) throw error;
  const token = crypto.randomUUID().replaceAll('-', '') + crypto.randomUUID().replaceAll('-', '');
  const result = await client.rpc('cb_file_register', { object_path: path, capability: token });
  if (result.error) { await client.storage.from('documents').remove([path]); throw result.error; }
  return { file_url: `${required('SUPABASE_URL')}/functions/v1/platform-file?token=${token}`, file_name: name };
}
export async function invokeLLM(args: Record<string, any>) {
  const response = await fetch('https://api.openai.com/v1/chat/completions', { method: 'POST', headers: { Authorization: `Bearer ${required('OPENAI_API_KEY')}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ model: required('OPENAI_MODEL'), messages: [{ role: 'user', content: args.prompt + (args.file_urls?.length ? '\nReference URLs: ' + args.file_urls.join('\n') : '') }], ...(args.response_json_schema ? { response_format: { type: 'json_schema', json_schema: { name: 'result', schema: args.response_json_schema } } } : {}) }) });
  const value = await response.json(); if (!response.ok) throw new Error(value.error?.message || 'AI request failed');
  const content = value.choices[0].message.content; return args.response_json_schema ? JSON.parse(content) : content;
}
export async function getConnection(name: string) {
  const supported = ['gmail', 'googlecalendar', 'google_analytics', 'google_search_console'];
  if (!supported.includes(name)) throw new Error('Unsupported connector');
  const refreshName = `${name.toUpperCase()}_REFRESH_TOKEN`;
  const response = await fetch('https://oauth2.googleapis.com/token', { method: 'POST', body: new URLSearchParams({ client_id: required('GOOGLE_CLIENT_ID'), client_secret: required('GOOGLE_CLIENT_SECRET'), refresh_token: required(refreshName), grant_type: 'refresh_token' }) });
  const data = await response.json(); if (!response.ok) throw new Error(`${name} connection needs authorization`); return { accessToken: data.access_token };
}

export async function transcribeAudio(client: any, args: Record<string, any>) {
  const url = new URL(args.audio_url);
  const expected = new URL(required('SUPABASE_URL'));
  if (url.origin !== expected.origin || url.pathname !== '/functions/v1/platform-file') throw new Error('Use an audio file uploaded to this application');
  const token = url.searchParams.get('token');
  const { data: path, error } = await client.rpc('cb_file_lookup', { capability: token });
  if (error || !path) throw new Error('Audio file not found');
  const file = await client.storage.from('documents').download(path); if (file.error) throw file.error;
  const form = new FormData(); form.set('file', file.data, path.split('/').pop()); form.set('model', required('OPENAI_TRANSCRIPTION_MODEL'));
  const response = await fetch('https://api.openai.com/v1/audio/transcriptions', { method: 'POST', headers: { Authorization: `Bearer ${required('OPENAI_API_KEY')}` }, body: form });
  const data = await response.json(); if (!response.ok) throw new Error(data.error?.message || 'Transcription failed'); return data.text;
}
