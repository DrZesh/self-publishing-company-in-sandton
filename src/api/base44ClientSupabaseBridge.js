import { base44 as transitionalBase44 } from './base44Client.js';
import { supabase } from './supabaseClient.js';

const CONTRACT_STORAGE_FIELDS = [
  'contract_file_url',
  'signed_file_url',
  'admin_signature_url',
  'signature_image_url',
];

let lastSignedContract = null;

function currentPath() {
  return typeof window === 'undefined' ? '' : window.location.pathname;
}

function isContractAdminPath() {
  return currentPath().startsWith('/admin/contracts');
}

function isContractPublicPath() {
  return currentPath().startsWith('/sign/contract/');
}

function currentContractToken() {
  const match = currentPath().match(/^\/sign\/contract\/([^/]+)/);
  return match?.[1] || null;
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
  const match = typeof value === 'string'
    ? value.match(/^supabase:\/\/([^/]+)\/(.+)$/)
    : null;
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

    const bucket = decodeURIComponent(remainder.slice(0, slashIndex));
    const path = decodeURIComponent(remainder.slice(slashIndex + 1));
    return storageUri(bucket, path);
  } catch {
    return value;
  }
}

async function hydrateContractRows(rows) {
  const list = Array.isArray(rows) ? rows : [rows];
  if (!list.length) return Array.isArray(rows) ? [] : rows;

  const refs = [];
  const pathsByBucket = new Map();
  list.forEach((row, rowIndex) => {
    if (!row) return;
    CONTRACT_STORAGE_FIELDS.forEach(field => {
      const parsed = parseStorageUri(row[field]);
      if (!parsed) return;
      refs.push({ rowIndex, field, ...parsed });
      if (!pathsByBucket.has(parsed.bucket)) pathsByBucket.set(parsed.bucket, new Set());
      pathsByBucket.get(parsed.bucket).add(parsed.path);
    });
  });

  if (!refs.length) return rows;

  const signedByKey = new Map();
  await Promise.all([...pathsByBucket.entries()].map(async ([bucket, pathSet]) => {
    const paths = [...pathSet];
    const { data, error } = await supabase.storage.from(bucket).createSignedUrls(paths, 3600);
    if (error) throw error;
    (data || []).forEach(item => {
      if (item?.signedUrl) signedByKey.set(`${bucket}/${item.path}`, item.signedUrl);
    });
  }));

  const hydrated = list.map(row => ({ ...row }));
  refs.forEach(ref => {
    const signedUrl = signedByKey.get(`${ref.bucket}/${ref.path}`);
    if (signedUrl) hydrated[ref.rowIndex][ref.field] = signedUrl;
  });

  return Array.isArray(rows) ? hydrated : hydrated[0];
}

function cleanContractPayload(payload) {
  const cleaned = { ...payload };
  CONTRACT_STORAGE_FIELDS.forEach(field => {
    if (field in cleaned) cleaned[field] = normalizeStorageValue(cleaned[field]);
  });
  if (cleaned.project_id === '') cleaned.project_id = null;
  if (cleaned.expiry_date === '') cleaned.expiry_date = null;
  if ('reminder_count' in cleaned) cleaned.reminder_count = Number(cleaned.reminder_count) || 0;
  if ('contract_field_values' in cleaned && (!cleaned.contract_field_values || Array.isArray(cleaned.contract_field_values))) {
    cleaned.contract_field_values = {};
  }
  if ('audit_trail' in cleaned && !Array.isArray(cleaned.audit_trail)) cleaned.audit_trail = [];
  delete cleaned.signer_ip;
  return cleaned;
}

function makeSupabaseEntity(table, options = {}) {
  const hydrate = options.hydrate || (async value => value);
  const clean = options.clean || (value => value);

  return {
    async list(sort = '-created_date', limit = 200) {
      const { column, ascending } = parseSort(sort);
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .order(column, { ascending })
        .limit(limit);
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
      const { data, error } = await supabase
        .from(table)
        .update(clean(payload))
        .eq('id', id)
        .select('*')
        .single();
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

const contractEntity = makeSupabaseEntity('contracts', {
  hydrate: hydrateContractRows,
  clean: cleanContractPayload,
});
const contactEntity = makeSupabaseEntity('contacts');

async function invokeSupabaseFunction(functionName, payload) {
  const { data, error } = await supabase.functions.invoke(functionName, { body: payload || {} });
  if (error) throw error;
  if (data?.error) throw new Error(data.error);
  return { data };
}

async function uploadAdminContractFile({ file }) {
  if (!file) throw new Error('A file is required');
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError) throw userError;
  if (!user) throw new Error('Authentication is required to upload files');

  const bucket = file.type?.startsWith('image/') ? 'signature-artifacts' : 'document-files';
  const safeName = (file.name || 'file').replace(/[^a-zA-Z0-9._-]/g, '_').slice(-140);
  const path = `contracts/admin/${user.id}/${Date.now()}-${crypto.randomUUID()}-${safeName}`;
  const { error } = await supabase.storage.from(bucket).upload(path, file, {
    contentType: file.type || 'application/octet-stream',
    upsert: false,
  });
  if (error) throw error;

  const { data: signed, error: signedError } = await supabase.storage.from(bucket).createSignedUrl(path, 7200);
  if (signedError) throw signedError;
  return { file_url: signed.signedUrl, storage_uri: storageUri(bucket, path) };
}

async function uploadPublicContractFile({ file }) {
  if (!file) throw new Error('A file is required');
  const token = currentContractToken();
  if (!token) throw new Error('Invalid signing link');

  const { data: grant } = await invokeSupabaseFunction('contract-file-actions', {
    action: 'create_upload_url',
    token,
    file_name: file.name,
    content_type: file.type || 'application/octet-stream',
  });

  const { error: uploadError } = await supabase.storage
    .from(grant.bucket)
    .uploadToSignedUrl(grant.path, grant.token, file, {
      contentType: file.type || 'application/octet-stream',
    });
  if (uploadError) throw uploadError;

  if (grant.mode === 'signed_pdf') {
    const { data: attached } = await invokeSupabaseFunction('contract-file-actions', {
      action: 'attach_signed_pdf',
      token,
      file_url: grant.file_url,
    });
    return { file_url: attached.signed_url || attached.file_url };
  }

  const { data: signed, error: signedError } = await supabase.storage
    .from(grant.bucket)
    .createSignedUrl(grant.path, 7200);
  if (signedError) throw signedError;
  return { file_url: signed.signedUrl, storage_uri: grant.file_url };
}

const entitiesBridge = new Proxy(transitionalBase44.entities, {
  get(target, property, receiver) {
    if (isContractAdminPath()) {
      if (property === 'Contract') return contractEntity;
      if (property === 'Contact') return contactEntity;
    }
    return Reflect.get(target, property, receiver);
  },
});

const functionsBridge = new Proxy(transitionalBase44.functions, {
  get(target, property, receiver) {
    if (property !== 'invoke') return Reflect.get(target, property, receiver);

    return async (functionName, payload = {}) => {
      if (functionName === 'searchConsoleData') {
        return invokeSupabaseFunction('search-console-data', payload);
      }

      if (functionName === 'getAnalyticsData') {
        return invokeSupabaseFunction('analytics-data', payload);
      }

      if (functionName === 'contractSignature' && (isContractAdminPath() || isContractPublicPath())) {
        const translated = { ...payload };
        if (translated.admin_signature_url) translated.admin_signature_url = normalizeStorageValue(translated.admin_signature_url);
        if (translated.signature_image_url) translated.signature_image_url = normalizeStorageValue(translated.signature_image_url);

        const result = await invokeSupabaseFunction('contract-actions', translated);
        if (translated.action === 'sign' && result.data?.success && !translated.declined) {
          lastSignedContract = {
            id: result.data.contract_id,
            email: translated.signer_email,
          };
        }
        return result;
      }

      if (functionName === 'adobeSignActions' && isContractAdminPath()) {
        return invokeSupabaseFunction('adobe-sign-actions', payload);
      }

      return target.invoke(functionName, payload);
    };
  },
});

const coreBridge = new Proxy(transitionalBase44.integrations.Core, {
  get(target, property, receiver) {
    if (property === 'UploadFile' && isContractAdminPath()) return uploadAdminContractFile;
    if (property === 'UploadFile' && isContractPublicPath()) return uploadPublicContractFile;

    if (property === 'SendEmail' && isContractPublicPath()) {
      return async payload => {
        if (!lastSignedContract?.id) return { success: true, skipped: true };
        return invokeSupabaseFunction('contract-actions', {
          action: 'resend_signed_copy',
          contract_id: lastSignedContract.id,
          signer_email: payload?.to || lastSignedContract.email,
        }).then(result => result.data);
      };
    }

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
