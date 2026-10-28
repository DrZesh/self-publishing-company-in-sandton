import { supabase } from './supabaseClient';
import { appParams } from '@/lib/app-params';

export async function invokeBackend(name, payload = {}) {
  const headers = new Headers({ 'X-App-Id': appParams.appId });
  if (appParams.functionsVersion) headers.set('Base44-Functions-Version', appParams.functionsVersion);
  if (supabase) {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) throw error;
    if (session) headers.set('x-supabase-access-token', session.access_token);
  }
  let body;
  if (payload instanceof FormData) body = payload;
  else if (Object.values(payload).some(value => value instanceof File)) {
    body = new FormData();
    for (const [key, value] of Object.entries(payload)) {
      body.append(key, value instanceof File ? value : typeof value === 'object' ? JSON.stringify(value) : String(value));
    }
  } else {
    headers.set('Content-Type', 'application/json');
    body = JSON.stringify(payload);
  }
  const response = await fetch(`/api/apps/${encodeURIComponent(appParams.appId)}/functions/${encodeURIComponent(name)}`, { method: 'POST', headers, body, credentials: 'omit' });
  const data = await response.json();
  if (!response.ok) {
    const error = new Error(data.error || 'The request failed.');
    error.status = response.status;
    throw error;
  }
  // Match the Axios response shape used by existing screens.
  return { data, status: response.status };
}
