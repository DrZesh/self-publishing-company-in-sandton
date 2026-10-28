import { createClient } from '@base44/sdk';
import { appParams } from '@/lib/app-params';
import { supabase } from './supabaseClient';
import { invokeBackend } from './backendTransport';

// Base44 remains the data/integrations backend, but never the identity provider.
// Discard legacy credentials before constructing its anonymous public client.
const legacyUrl = new URL(window.location.href);
if (legacyUrl.searchParams.has('access_token')) {
  legacyUrl.searchParams.delete('access_token');
  window.history.replaceState({}, '', legacyUrl.pathname + legacyUrl.search + legacyUrl.hash);
}
for (const key of ['base44_access_token', 'token', 'adminRememberMe', 'adminEmail']) localStorage.removeItem(key);
const publicClient = createClient({ appId: appParams.appId, functionsVersion: appParams.functionsVersion, serverUrl: '', requiresAuth: false, appBaseUrl: appParams.appBaseUrl });

async function isAdminSession() {
  if (!supabase) return false;
  const { data: { session } } = await supabase.auth.getSession();
  // This selects a transport only. The server verifies identity and role on every request.
  return session?.user?.app_metadata?.role === 'admin';
}
async function gateway(payload) { return (await invokeBackend('supabaseAdminGateway', payload)).data; }
function subscribe(entity, callback) {
  let stopped = false, previous = null, timer;
  async function poll() {
    try {
      const rows = await gateway({ kind: 'entity', entity, method: 'list', args: ['-updated_date', 500] });
      if (stopped) return;
      const next = new Map(rows.map(row => [row.id, row]));
      if (previous) {
        for (const [id, data] of next) {
          if (!previous.has(id)) callback({ type: 'create', id, data });
          else if (JSON.stringify(previous.get(id)) !== JSON.stringify(data)) callback({ type: 'update', id, data });
        }
        for (const [id] of previous) if (!next.has(id)) callback({ type: 'delete', id });
      }
      previous = next;
    } catch { /* Keep the last snapshot on network or authorization failure. */ }
    if (!stopped) timer = setTimeout(poll, 15000);
  }
  void poll();
  return () => { stopped = true; clearTimeout(timer); };
}
const entities = new Proxy({}, { get: (_, entity) => new Proxy({}, { get: (_, method) => {
  if (method === 'subscribe') return callback => subscribe(entity, callback);
  return async (...args) => await isAdminSession()
    ? gateway({ kind: 'entity', entity, method, args })
    : publicClient.entities[entity][method](...args);
} }) });
const core = new Proxy({}, { get: (_, method) => async (args) => {
  if (!await isAdminSession()) return publicClient.integrations.Core[method](args);
  if (method === 'UploadFile') {
    const form = new FormData();
    form.set('kind', 'upload');
    form.set('file', args.file);
    return gateway(form);
  }
  return gateway({ kind: 'integration', method, args });
} });
export const base44 = {
  entities,
  functions: { invoke: invokeBackend },
  integrations: { Core: core },
  analytics: publicClient.analytics,
  appLogs: publicClient.appLogs,
  agents: publicClient.agents,
};
