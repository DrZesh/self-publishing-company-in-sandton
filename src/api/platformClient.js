import { supabase } from './supabaseClient';
import { pendingFunctions } from '../lib/crmMigrationStatus';
import { safeRedirect } from '../../supabase/functions/_shared/policy.js';
import { createEntities } from '../../supabase/functions/_shared/entities.js';
async function invoke(name, body = {}) {
  if (pendingFunctions[name]) throw new Error(pendingFunctions[name]);
  const token = typeof location !== 'undefined' && location.pathname.match(/^\/portal\/([^/]+)/)?.[1];
  if (token && !(body instanceof FormData) && ['clientPortalData','portalMessages','portalAppointments','fileUploadActions','proofApprovalActions'].includes(name)) body = { ...body, portal_token: decodeURIComponent(token), access_token: decodeURIComponent(token), token: decodeURIComponent(token) };
  const { data, error } = await supabase.functions.invoke(name, { body });
  if (error) {
    let message = error.message;
    try { message = (await error.context.json()).error || message; } catch { /* non-JSON upstream error */ }
    throw Object.assign(new Error(message), { response: { data: { error: message } } });
  }
  if (data?.error) throw Object.assign(new Error(data.error), { response: { data } });
  return { data };
}
async function me() {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) throw Object.assign(new Error('Please sign in'), { status: 401 });
  const { data, error: profileError } = await supabase.from('user').select('*').eq('id', user.id).single();
  if (profileError) throw profileError;
  return { ...data.data, id: user.id, email: user.email };
}
async function decorate(value) {
  async function visit(item) {
    if (typeof item === 'string' && item.startsWith('cb-storage:')) {
      const path = item.slice('cb-storage:'.length);
      const { data, error } = await supabase.storage.from('documents').createSignedUrl(path, 3600);
      if (error) throw error;
      return data.signedUrl;
    }
    if (Array.isArray(item)) return Promise.all(item.map(visit));
    if (item && typeof item === 'object') return Object.fromEntries(await Promise.all(Object.entries(item).map(async ([k, v]) => [k, await visit(v)])));
    return item;
  }
  return visit(value);
}
const core = new Proxy({}, { get(_, operation) { return async args => {
  const { data } = await invoke('platform-integrations', args instanceof FormData ? args : { operation, ...args });
  return data;
}; } });
// Upload through a dedicated multipart endpoint. Public uploads are private and size-limited.
export const platform = {
  entities: createEntities(supabase, { decorate }),
  functions: { invoke },
  auth: {
    me,
    isAuthenticated: async () => { const { data: { user } } = await supabase.auth.getUser(); return Boolean(user); },
    redirectToLogin: (returnTo = '/') => { const safe = safeRedirect(returnTo, location.origin); location.assign(`/admin/login?next=${encodeURIComponent(safe)}`); },
    logout: async returnTo => { const { error } = await supabase.auth.signOut(); if (error) throw error; if (returnTo) location.assign('/admin/login'); },
  },
  integrations: { Core: {
    UploadFile: async ({ file }) => { const form = new FormData(); form.set('file', file); const { data } = await invoke('platform-upload', form); return data; },
    SendEmail: args => core.SendEmail(args), InvokeLLM: args => core.InvokeLLM(args), TranscribeAudio: args => core.TranscribeAudio(args),
  } },
  analytics: { track: async (event, properties = {}) => { if (typeof window.gtag === 'function') window.gtag('event', event, properties); } },
};
