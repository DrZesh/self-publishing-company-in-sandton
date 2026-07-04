import { base44 as transitionalBase44 } from './base44ClientSupabaseBridge.js';
import { supabase } from './supabaseClient.js';

const STORAGE_FIELDS = ['payment_receipt_url', 'invoice_url'];

function currentPath() {
  return typeof window === 'undefined' ? '' : window.location.pathname;
}

function isClientServicePath() {
  return currentPath().startsWith('/admin/client-service');
}

function parseSort(sort = '-created_date') {
  const descending = sort.startsWith('-');
  return {
    column: descending ? sort.slice(1) : sort,
    ascending: !descending,
  };
}

function storageUri(bucket, path) {
  return `supabase://${bucket}/${path}`;
}

function parseStorageUri(value) {
  const match = typeof value === 'string' ? value.match(/^supabase:\/\/([^/]+)\/(.+)$/) : null;
  return match ? { bucket: match[1], path: match[2] } : null;
}

function normalizeStorageValue(value) {
  if (typeof value !== 'string' || value.startsWith('supabase://')) return value;
  try {
    const url = new URL(value);
    const marker = '/storage/v1/object/sign/';
    const markerIndex = url.pathname.indexOf(marker);
    if (markerIndex === -1) return value;
    const remainder = url.pathname.slice(markerIndex + marker.length);
    const slashIndex = remainder.indexOf('/');
    if (slashIndex === -1) return value;
    return storageUri(
      decodeURIComponent(remainder.slice(0, slashIndex)),
      decodeURIComponent(remainder.slice(slashIndex + 1)),
    );
  } catch {
    return value;
  }
}

async function hydrateStorageRows(rows) {
  const list = Array.isArray(rows) ? rows : [rows];
  if (!list.length) return Array.isArray(rows) ? [] : rows;

  const refs = [];
  const byBucket = new Map();
  list.forEach((row, rowIndex) => {
    STORAGE_FIELDS.forEach(field => {
      const parsed = parseStorageUri(row?.[field]);
      if (!parsed) return;
      refs.push({ rowIndex, field, ...parsed });
      if (!byBucket.has(parsed.bucket)) byBucket.set(parsed.bucket, new Set());
      byBucket.get(parsed.bucket).add(parsed.path);
    });
  });

  if (!refs.length) return rows;

  const signed = new Map();
  await Promise.all([...byBucket.entries()].map(async ([bucket, pathSet]) => {
    const { data, error } = await supabase.storage.from(bucket).createSignedUrls([...pathSet], 3600);
    if (error) throw error;
    (data || []).forEach(item => {
      if (item?.signedUrl) signed.set(`${bucket}/${item.path}`, item.signedUrl);
    });
  }));

  const hydrated = list.map(row => ({ ...row }));
  refs.forEach(ref => {
    const value = signed.get(`${ref.bucket}/${ref.path}`);
    if (value) hydrated[ref.rowIndex][ref.field] = value;
  });
  return Array.isArray(rows) ? hydrated : hydrated[0];
}

function cleanClientServiceProject(payload) {
  const cleaned = { ...payload };
  STORAGE_FIELDS.forEach(field => {
    if (field in cleaned) cleaned[field] = normalizeStorageValue(cleaned[field]);
  });
  if (cleaned.contact_id === '') cleaned.contact_id = null;
  if (cleaned.start_date === '') cleaned.start_date = null;
  if ('stage_history' in cleaned && !Array.isArray(cleaned.stage_history)) cleaned.stage_history = [];
  if ('total_emails_sent' in cleaned) cleaned.total_emails_sent = Math.max(0, Number(cleaned.total_emails_sent) || 0);
  return cleaned;
}

function cleanServiceEmailLog(payload) {
  const cleaned = { ...payload };
  if ('attachments_included' in cleaned && !Array.isArray(cleaned.attachments_included)) cleaned.attachments_included = [];
  return cleaned;
}

function cleanWorkflow(payload) {
  const cleaned = { ...payload };
  if ('stages' in cleaned && !Array.isArray(cleaned.stages)) cleaned.stages = [];
  return cleaned;
}

function cleanPipeline(payload) {
  const cleaned = { ...payload };
  if ('stages' in cleaned && !Array.isArray(cleaned.stages)) cleaned.stages = [];
  if (cleaned.template_id === '') cleaned.template_id = null;
  return cleaned;
}

function cleanPipelineDeal(payload) {
  const cleaned = { ...payload };
  if ('deal_value' in cleaned) cleaned.deal_value = Math.max(0, Number(cleaned.deal_value) || 0);
  if (cleaned.linked_project_id === '') cleaned.linked_project_id = null;
  ['project_created_at', 'won_at', 'lost_at'].forEach(field => {
    if (cleaned[field] === '') cleaned[field] = null;
  });
  return cleaned;
}

function makeEntity(table, { clean = value => value, hydrate = value => value } = {}) {
  return {
    async list(sort = '-created_date', limit = 200) {
      const { column, ascending } = parseSort(sort);
      const { data, error } = await supabase.from(table).select('*').order(column, { ascending }).limit(limit);
      if (error) throw error;
      return hydrate(data || []);
    },

    async filter(filters = {}, sort = '-created_date', limit = 200) {
      const { column, ascending } = parseSort(sort);
      let query = supabase.from(table).select('*');
      Object.entries(filters).forEach(([key, value]) => {
        if (value === null) query = query.is(key, null);
        else if (value !== undefined) query = query.eq(key, value);
      });
      const { data, error } = await query.order(column, { ascending }).limit(limit);
      if (error) throw error;
      return hydrate(data || []);
    },

    async get(id) {
      const { data, error } = await supabase.from(table).select('*').eq('id', id).single();
      if (error) throw error;
      return hydrate(data);
    },

    async create(payload) {
      const { data, error } = await supabase.from(table).insert(clean(payload)).select('*').single();
      if (error) throw error;
      return hydrate(data);
    },

    async update(id, payload) {
      const { data, error } = await supabase.from(table).update(clean(payload)).eq('id', id).select('*').single();
      if (error) throw error;
      return hydrate(data);
    },

    async delete(id) {
      const { data, error } = await supabase.from(table).delete().eq('id', id).select('id').single();
      if (error) throw error;
      return data;
    },
  };
}

const migratedEntities = {
  ClientServiceProject: makeEntity('client_service_projects', {
    clean: cleanClientServiceProject,
    hydrate: hydrateStorageRows,
  }),
  ServiceEmailLog: makeEntity('service_email_logs', { clean: cleanServiceEmailLog }),
  ClientServiceWorkflow: makeEntity('client_service_workflows', { clean: cleanWorkflow }),
  SalesPipeline: makeEntity('sales_pipelines', { clean: cleanPipeline }),
  PipelineTemplate: makeEntity('pipeline_templates', { clean: cleanPipeline }),
  PipelineDeal: makeEntity('pipeline_deals', { clean: cleanPipelineDeal }),
};

async function invokeSupabaseFunction(functionName, payload) {
  const { data, error } = await supabase.functions.invoke(functionName, { body: payload || {} });
  if (error) throw error;
  if (data?.error) throw new Error(data.error);
  return { data };
}

async function uploadClientServiceFile({ file }) {
  if (!file) throw new Error('A file is required');
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError) throw userError;
  if (!user) throw new Error('Authentication is required to upload files');

  const safeName = (file.name || 'file').replace(/[^a-zA-Z0-9._-]/g, '_').slice(-140);
  const path = `client-service/${user.id}/${Date.now()}-${crypto.randomUUID()}-${safeName}`;
  const { error } = await supabase.storage.from('document-files').upload(path, file, {
    contentType: file.type || 'application/octet-stream',
    upsert: false,
  });
  if (error) throw error;

  const { data: signed, error: signedError } = await supabase.storage.from('document-files').createSignedUrl(path, 7200);
  if (signedError) throw signedError;
  return {
    file_url: signed.signedUrl,
    storage_uri: storageUri('document-files', path),
  };
}

const entitiesBridge = new Proxy(transitionalBase44.entities, {
  get(target, property, receiver) {
    if (isClientServicePath() && migratedEntities[property]) return migratedEntities[property];
    return Reflect.get(target, property, receiver);
  },
});

const functionsBridge = new Proxy(transitionalBase44.functions, {
  get(target, property, receiver) {
    if (property !== 'invoke') return Reflect.get(target, property, receiver);
    return async (functionName, payload = {}) => {
      if (isClientServicePath() && functionName === 'clientServiceActions') {
        return invokeSupabaseFunction('client-service-actions', payload);
      }
      return target.invoke(functionName, payload);
    };
  },
});

const coreBridge = new Proxy(transitionalBase44.integrations.Core, {
  get(target, property, receiver) {
    if (isClientServicePath() && property === 'UploadFile') return uploadClientServiceFile;
    return Reflect.get(target, property, receiver);
  },
});

const integrationsBridge = new Proxy(transitionalBase44.integrations, {
  get(target, property, receiver) {
    if (property === 'Core') return coreBridge;
    return Reflect.get(target, property, receiver);
  },
});

export const base44 = new Proxy(transitionalBase44, {
  get(target, property, receiver) {
    if (property === 'entities') return entitiesBridge;
    if (property === 'functions') return functionsBridge;
    if (property === 'integrations') return integrationsBridge;
    return Reflect.get(target, property, receiver);
  },
});
