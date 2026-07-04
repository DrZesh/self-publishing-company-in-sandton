import { createClient } from '@base44/sdk';
import { appParams } from '@/lib/app-params';
import { supabase } from '@/api/supabaseClient';

const { appId, token, functionsVersion, appBaseUrl } = appParams;

const base44Sdk = createClient({
  appId,
  token,
  functionsVersion,
  serverUrl: '',
  requiresAuth: false,
  appBaseUrl,
});

const STORAGE_FIELDS = [
  'file_url',
  'proof_url',
  'signature_url',
  'signed_document_url',
  'admin_signature_url',
  'signature_image_url',
];

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

async function hydrateStorageRows(rows) {
  const list = Array.isArray(rows) ? rows : [rows];
  if (!list.length) return Array.isArray(rows) ? [] : rows;

  const references = [];
  const pathsByBucket = new Map();

  list.forEach((row, rowIndex) => {
    if (!row) return;
    STORAGE_FIELDS.forEach(field => {
      const parsed = parseStorageUri(row[field]);
      if (!parsed) return;
      references.push({ rowIndex, field, ...parsed });
      if (!pathsByBucket.has(parsed.bucket)) pathsByBucket.set(parsed.bucket, new Set());
      pathsByBucket.get(parsed.bucket).add(parsed.path);
    });
  });

  if (!references.length) return rows;

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
  references.forEach(ref => {
    const signed = signedByKey.get(`${ref.bucket}/${ref.path}`);
    if (signed) hydrated[ref.rowIndex][ref.field] = signed;
  });

  return Array.isArray(rows) ? hydrated : hydrated[0];
}

function cleanEntityPayload(table, payload) {
  const cleaned = { ...payload };

  STORAGE_FIELDS.forEach(field => {
    if (field in cleaned) cleaned[field] = normalizeStorageValue(cleaned[field]);
  });

  if (table === 'invoices') {
    if (cleaned.due_date === '') cleaned.due_date = null;
    if (cleaned.quote_id === '') cleaned.quote_id = null;
    if ('line_items' in cleaned && !Array.isArray(cleaned.line_items)) cleaned.line_items = [];
  }

  if (table === 'quotes') {
    if (cleaned.valid_until === '') cleaned.valid_until = null;
  }

  if (table === 'payments' && 'amount' in cleaned) {
    cleaned.amount = Number(cleaned.amount) || 0;
  }

  if (table === 'documents') {
    ['contact_id', 'quote_id', 'invoice_id', 'parent_doc_id'].forEach(field => {
      if (cleaned[field] === '') cleaned[field] = null;
    });
    if (cleaned.project_id === '') cleaned.project_id = null;
    if ('labels' in cleaned && !Array.isArray(cleaned.labels)) cleaned.labels = [];
    if ('file_size_kb' in cleaned) cleaned.file_size_kb = Number(cleaned.file_size_kb) || 0;
    if ('version' in cleaned) cleaned.version = Number(cleaned.version) || 1;
    if ('default_expiry_days' in cleaned) cleaned.default_expiry_days = Number(cleaned.default_expiry_days) || 14;
  }

  if (table === 'clauses') {
    if ('tags' in cleaned && !Array.isArray(cleaned.tags)) cleaned.tags = [];
    if ('sort_order' in cleaned) cleaned.sort_order = Number(cleaned.sort_order) || 0;
  }

  if (table === 'e_signature_requests') {
    delete cleaned.expires_days;
    ['document_id', 'contact_id'].forEach(field => {
      if (cleaned[field] === '') cleaned[field] = null;
    });
    if (cleaned.project_id === '') cleaned.project_id = null;
    if ('contract_fields' in cleaned && !Array.isArray(cleaned.contract_fields)) cleaned.contract_fields = [];
    if ('reminder_days' in cleaned && !Array.isArray(cleaned.reminder_days)) cleaned.reminder_days = [];
    if ('admin_field_values' in cleaned && (!cleaned.admin_field_values || Array.isArray(cleaned.admin_field_values))) cleaned.admin_field_values = {};
    if ('client_field_values' in cleaned && (!cleaned.client_field_values || Array.isArray(cleaned.client_field_values))) cleaned.client_field_values = {};
    if ('audit_trail' in cleaned && !Array.isArray(cleaned.audit_trail)) cleaned.audit_trail = [];
  }

  if (table === 'projects') {
    ['quote_id', 'invoice_id'].forEach(field => {
      if (cleaned[field] === '') cleaned[field] = null;
    });
    if (cleaned.deadline === '') cleaned.deadline = null;
    if ('project_value' in cleaned) cleaned.project_value = Number(cleaned.project_value) || 0;
    if (cleaned.queue_number === '') cleaned.queue_number = null;
    else if (cleaned.queue_number !== undefined && cleaned.queue_number !== null) {
      cleaned.queue_number = Number(cleaned.queue_number) || null;
    }
    if ('revision_counts' in cleaned && (!cleaned.revision_counts || Array.isArray(cleaned.revision_counts))) {
      cleaned.revision_counts = { cover_design: 0, editing: 0, layout: 0, proofreading: 0 };
    }
    if ('revision_limits' in cleaned && (!cleaned.revision_limits || Array.isArray(cleaned.revision_limits))) {
      cleaned.revision_limits = { cover_design: 2, editing: 1, layout: 2, proofreading: 1 };
    }
    if ('book_spec' in cleaned && (!cleaned.book_spec || Array.isArray(cleaned.book_spec))) cleaned.book_spec = {};
  }

  if (table === 'client_delays') {
    if ('days_delayed' in cleaned) cleaned.days_delayed = Number(cleaned.days_delayed) || 0;
    if (cleaned.contact_id === '') cleaned.contact_id = null;
  }

  return cleaned;
}

function makeSupabaseEntity(table) {
  return {
    async list(sort = '-created_date', limit = 200) {
      const { column, ascending } = parseSort(sort);
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .order(column, { ascending })
        .limit(limit);

      if (error) throw error;
      return hydrateStorageRows(data || []);
    },

    async filter(filters = {}, sort = '-created_date', limit = 200) {
      const { column, ascending } = parseSort(sort);
      let query = supabase.from(table).select('*');

      Object.entries(filters).forEach(([key, value]) => {
        if (value === null) query = query.is(key, null);
        else if (value !== undefined) query = query.eq(key, value);
      });

      const { data, error } = await query
        .order(column, { ascending })
        .limit(limit);

      if (error) throw error;
      return hydrateStorageRows(data || []);
    },

    async get(id) {
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return hydrateStorageRows(data);
    },

    async create(payload) {
      const { data, error } = await supabase
        .from(table)
        .insert(cleanEntityPayload(table, payload))
        .select('*')
        .single();

      if (error) throw error;
      return hydrateStorageRows(data);
    },

    async update(id, payload) {
      const { data, error } = await supabase
        .from(table)
        .update(cleanEntityPayload(table, payload))
        .eq('id', id)
        .select('*')
        .single();

      if (error) throw error;
      return hydrateStorageRows(data);
    },

    async delete(id) {
      const { data, error } = await supabase
        .from(table)
        .delete()
        .eq('id', id)
        .select('id')
        .single();

      if (error) throw error;
      return data;
    },
  };
}

const supabaseEntities = {
  Contact: makeSupabaseEntity('contacts'),
  Task: makeSupabaseEntity('tasks'),
  Quote: makeSupabaseEntity('quotes'),
  QuoteLineItem: makeSupabaseEntity('quote_line_items'),
  Invoice: makeSupabaseEntity('invoices'),
  Payment: makeSupabaseEntity('payments'),
  Document: makeSupabaseEntity('documents'),
  DocumentActivity: makeSupabaseEntity('document_activities'),
  Clause: makeSupabaseEntity('clauses'),
  ESignatureRequest: makeSupabaseEntity('e_signature_requests'),
  Project: makeSupabaseEntity('projects'),
  ClientDelay: makeSupabaseEntity('client_delays'),
};

function currentPath() {
  return typeof window === 'undefined' ? '' : window.location.pathname;
}

function isDocumentAdminPath(path = currentPath()) {
  return [
    '/admin/documents',
    '/admin/document-dashboard',
    '/admin/document-builder',
    '/admin/clause-library',
    '/admin/esignatures',
  ].some(route => path.startsWith(route));
}

function isProjectAdminPath(path = currentPath()) {
  return [
    '/admin/projects',
    '/admin/production-board',
  ].some(route => path.startsWith(route));
}

function isDocumentPublicPath(path = currentPath()) {
  return path.startsWith('/doc/view/');
}

function isESignaturePublicPath(path = currentPath()) {
  return path.startsWith('/sign/esig/');
}

function usesMigratedEntity(entityName) {
  const path = currentPath();

  const crmRoutes = ['/admin/contacts', '/admin/pipeline', '/admin/tasks'];
  if (
    crmRoutes.some(route => path.startsWith(route)) &&
    ['Contact', 'Task'].includes(entityName)
  ) {
    return true;
  }

  const financeRoutes = ['/admin/quotes', '/admin/invoices', '/admin/payments'];
  if (
    financeRoutes.some(route => path.startsWith(route)) &&
    ['Contact', 'Quote', 'QuoteLineItem', 'Invoice', 'Payment'].includes(entityName)
  ) {
    return true;
  }

  if (
    isDocumentAdminPath(path) &&
    ['Contact', 'Document', 'DocumentActivity', 'Clause', 'ESignatureRequest'].includes(entityName)
  ) {
    return true;
  }

  if (
    isProjectAdminPath(path) &&
    ['Contact', 'Project', 'ClientDelay', 'Quote', 'Invoice', 'Document'].includes(entityName)
  ) {
    return true;
  }

  return false;
}

function publicQuoteToken() {
  const match = currentPath().match(/^\/quote\/view\/[^/]+\/([^/]+)/);
  return match?.[1] || null;
}

const quoteSignatureBridge = {
  async create(payload) {
    const { data, error } = await supabase.functions.invoke('quote-actions', {
      body: {
        action: 'sign',
        token: publicQuoteToken(),
        ...payload,
      },
    });

    if (error) throw error;
    if (data?.error) throw new Error(data.error);
    return data.signature;
  },
};

const entitiesBridge = new Proxy(base44Sdk.entities, {
  get(target, property, receiver) {
    if (usesMigratedEntity(property)) {
      return supabaseEntities[property];
    }

    if (property === 'QuoteSignature' && currentPath().startsWith('/quote/view/')) {
      return quoteSignatureBridge;
    }

    return Reflect.get(target, property, receiver);
  },
});

const authBridge = {
  async me() {
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError) throw userError;
    if (!user) return null;

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, email, full_name, role')
      .eq('id', user.id)
      .single();

    if (profileError) throw profileError;

    return {
      ...user,
      ...profile,
      email: profile?.email || user.email,
    };
  },

  async isAuthenticated() {
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession();

    if (error) throw error;
    return Boolean(session?.user);
  },

  async logout(redirectUrl) {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;

    if (redirectUrl && typeof window !== 'undefined') {
      window.location.assign('/admin/login');
    }
  },

  redirectToLogin() {
    if (typeof window !== 'undefined') {
      window.location.assign('/admin/login');
    }
  },
};

async function invokeSupabaseFunction(functionName, payload) {
  const { data, error } = await supabase.functions.invoke(functionName, {
    body: payload,
  });
  if (error) throw error;
  if (data?.error) throw new Error(data.error);
  return { data };
}

const functionsBridge = new Proxy(base44Sdk.functions, {
  get(target, property, receiver) {
    if (property === 'invoke') {
      return async (functionName, payload) => {
        if (functionName === 'captureFormSubmission') {
          return invokeSupabaseFunction('capture-form-submission', payload);
        }

        if (functionName === 'getFollowUpReminders') {
          const { data, error } = await supabase.rpc('get_follow_up_reminders');
          if (error) throw error;
          return { data };
        }

        if (functionName === 'getSubmissionDetail' && currentPath().startsWith('/admin/pipeline')) {
          const { data, error } = await supabase.rpc('get_contact_activity', {
            p_contact_id: payload?.submission_id,
          });

          if (error) throw error;
          return { data: { activities: data || [] } };
        }

        if (functionName === 'quoteActions') {
          return invokeSupabaseFunction('quote-actions', payload);
        }

        if (functionName === 'sendInvoiceEmail') {
          return invokeSupabaseFunction('send-invoice-email', payload);
        }

        if (
          functionName === 'documentActions' &&
          (isDocumentAdminPath() || isDocumentPublicPath())
        ) {
          return invokeSupabaseFunction('document-actions', payload);
        }

        if (
          functionName === 'eSignatureActions' &&
          (currentPath().startsWith('/admin/esignatures') || isESignaturePublicPath())
        ) {
          return invokeSupabaseFunction('e-signature-actions', payload);
        }

        return target.invoke(functionName, payload);
      };
    }

    return Reflect.get(target, property, receiver);
  },
});

function migratedStorageRoute() {
  return isDocumentAdminPath() || isDocumentPublicPath() || isESignaturePublicPath();
}

function storageBucketForCurrentRoute() {
  return currentPath().startsWith('/admin/esignatures') || isESignaturePublicPath()
    ? 'signature-artifacts'
    : 'document-files';
}

async function requestPublicUploadGrant(file) {
  const path = currentPath();
  const docMatch = path.match(/^\/doc\/view\/([^/]+)\/([^/]+)/);
  if (docMatch) {
    const { data } = await invokeSupabaseFunction('document-actions', {
      action: 'create_upload_url',
      document_id: docMatch[1],
      token: docMatch[2],
      file_name: file.name,
      content_type: file.type,
    });
    return data;
  }

  const signatureMatch = path.match(/^\/sign\/esig\/([^/]+)\/([^/]+)/);
  if (signatureMatch) {
    const { data } = await invokeSupabaseFunction('e-signature-actions', {
      action: 'create_upload_url',
      request_id: signatureMatch[1],
      token: signatureMatch[2],
      file_name: file.name,
      content_type: file.type,
    });
    return data;
  }

  return null;
}

async function uploadMigratedFile({ file }) {
  if (!file) throw new Error('A file is required');

  const publicGrant = await requestPublicUploadGrant(file);
  if (publicGrant) {
    const { error } = await supabase.storage
      .from(publicGrant.bucket)
      .uploadToSignedUrl(publicGrant.path, publicGrant.token, file, {
        contentType: file.type || 'application/octet-stream',
      });
    if (error) throw error;
    return { file_url: publicGrant.file_url };
  }

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  if (userError) throw userError;
  if (!user) throw new Error('Authentication is required to upload files');

  const bucket = storageBucketForCurrentRoute();
  const safeName = (file.name || 'file').replace(/[^a-zA-Z0-9._-]/g, '_').slice(-140);
  const path = `${user.id}/${Date.now()}-${crypto.randomUUID()}-${safeName}`;
  const { error } = await supabase.storage.from(bucket).upload(path, file, {
    contentType: file.type || 'application/octet-stream',
    upsert: false,
  });
  if (error) throw error;

  return { file_url: storageUri(bucket, path) };
}

const coreIntegrationsBridge = new Proxy(base44Sdk.integrations.Core, {
  get(target, property, receiver) {
    if (property === 'UploadFile' && migratedStorageRoute()) {
      return uploadMigratedFile;
    }
    return Reflect.get(target, property, receiver);
  },
});

const integrationsBridge = new Proxy(base44Sdk.integrations, {
  get(target, property, receiver) {
    if (property === 'Core' && migratedStorageRoute()) return coreIntegrationsBridge;
    return Reflect.get(target, property, receiver);
  },
});

// Transitional client: authentication plus selected CRM, finance, document,
// e-signature, project and production workflows use Supabase. Unmigrated modules
// continue on Base44 until their dependencies are migrated.
export const base44 = new Proxy(base44Sdk, {
  get(target, property, receiver) {
    if (property === 'auth') return authBridge;
    if (property === 'entities') return entitiesBridge;
    if (property === 'functions') return functionsBridge;
    if (property === 'integrations') return integrationsBridge;
    return Reflect.get(target, property, receiver);
  },
});
