import { isSupabaseConfigured, supabase } from '@/lib/supabaseClient';

const entityTableMap = {
  ActivityLog: 'activity_log',
  Appointment: 'appointment',
  AppointmentSlot: 'appointment_slot',
  Author: 'author',
  Automation: 'automation',
  AutomationRule: 'automation_rule',
  Client: 'client',
  ClientPortalUser: 'client_portal_user',
  ClientService: 'client_service',
  Collection: 'collection',
  Communication: 'communication',
  Contact: 'contact',
  Contract: 'contract',
  Deal: 'deal',
  Document: 'document',
  EmailQueue: 'email_queue',
  EmailTemplate: 'email_template',
  Invoice: 'invoice',
  Lead: 'lead',
  Payment: 'payment',
  Pipeline: 'pipeline',
  PipelineStage: 'pipeline_stage',
  Project: 'project',
  Quote: 'quote',
  Service: 'service',
  Submission: 'submission',
  Task: 'task',
};

const toSnakeCase = (value = '') =>
  value
    .replace(/([a-z0-9])([A-Z])/g, '$1_$2')
    .replace(/[-\s]+/g, '_')
    .toLowerCase();

const getTableName = (entityName) => entityTableMap[entityName] || toSnakeCase(entityName);

const normaliseColumn = (column) => {
  if (!column) return 'created_at';
  if (column === 'created_date') return 'created_at';
  if (column === 'updated_date') return 'updated_at';
  return toSnakeCase(column);
};

const normaliseOrder = (orderBy) => {
  if (!orderBy) return { column: 'created_at', ascending: false };
  const descending = String(orderBy).startsWith('-');
  const rawColumn = descending ? String(orderBy).slice(1) : String(orderBy);
  return { column: normaliseColumn(rawColumn), ascending: !descending };
};

const assertConfigured = () => {
  if (!isSupabaseConfigured) {
    throw new Error('Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.');
  }
};

const throwIfError = ({ data, error }) => {
  if (error) throw error;
  return data;
};

const createEntityClient = (entityName) => {
  const table = getTableName(entityName);

  return {
    async list(orderBy = '-created_at', limit = 100) {
      assertConfigured();
      const { column, ascending } = normaliseOrder(orderBy);
      const response = await supabase
        .from(table)
        .select('*')
        .order(column, { ascending })
        .limit(limit);
      return throwIfError(response) || [];
    },

    async filter(filters = {}, orderBy = '-created_at', limit = 100) {
      assertConfigured();
      const { column, ascending } = normaliseOrder(orderBy);
      let query = supabase.from(table).select('*');

      Object.entries(filters || {}).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          query = query.eq(normaliseColumn(key), value);
        }
      });

      const response = await query.order(column, { ascending }).limit(limit);
      return throwIfError(response) || [];
    },

    async get(id) {
      assertConfigured();
      const response = await supabase.from(table).select('*').eq('id', id).single();
      return throwIfError(response);
    },

    async create(payload) {
      assertConfigured();
      const response = await supabase.from(table).insert(payload).select('*').single();
      return throwIfError(response);
    },

    async update(id, payload) {
      assertConfigured();
      const response = await supabase.from(table).update(payload).eq('id', id).select('*').single();
      return throwIfError(response);
    },

    async delete(id) {
      assertConfigured();
      const response = await supabase.from(table).delete().eq('id', id);
      return throwIfError(response);
    },
  };
};

const entities = new Proxy({}, {
  get(_target, entityName) {
    return createEntityClient(String(entityName));
  },
});

const functions = {
  async invoke(functionName, payload = {}) {
    assertConfigured();
    const { data, error } = await supabase.functions.invoke(functionName, { body: payload });
    if (error) throw error;
    return data;
  },
};

const auth = {
  async isAuthenticated() {
    assertConfigured();
    const { data } = await supabase.auth.getSession();
    return Boolean(data?.session);
  },

  async me() {
    assertConfigured();
    const { data, error } = await supabase.auth.getUser();
    if (error) throw error;
    const user = data?.user;
    if (!user) return null;

    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .maybeSingle();

    return {
      ...user,
      ...(profile || {}),
      email: user.email,
      role: profile?.role || user.user_metadata?.role || 'user',
    };
  },

  async login(email, password) {
    assertConfigured();
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
  },

  async logout() {
    assertConfigured();
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  async redirectToLogin() {
    window.location.href = '/admin/login';
  },
};

export const base44 = {
  auth,
  entities,
  functions,
};

export { supabase };
