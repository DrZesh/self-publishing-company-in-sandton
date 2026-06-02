import { supabase } from '@/lib/supabaseClient';

const toSnakeCase = (value = '') =>
  value
    .replace(/([a-z0-9])([A-Z])/g, '$1_$2')
    .replace(/[-\s]+/g, '_')
    .toLowerCase();

const normaliseOrder = (orderBy) => {
  if (!orderBy) return { column: 'created_at', ascending: false };
  const descending = String(orderBy).startsWith('-');
  const rawColumn = descending ? String(orderBy).slice(1) : String(orderBy);
  const column = rawColumn === 'created_date' ? 'created_at' : toSnakeCase(rawColumn);
  return { column, ascending: !descending };
};

const throwIfError = ({ data, error }) => {
  if (error) throw error;
  return data;
};

const createEntityClient = (entityName) => {
  const table = toSnakeCase(entityName);

  return {
    async list(orderBy = '-created_at', limit = 100) {
      const { column, ascending } = normaliseOrder(orderBy);
      const response = await supabase
        .from(table)
        .select('*')
        .order(column, { ascending })
        .limit(limit);
      return throwIfError(response) || [];
    },

    async filter(filters = {}, orderBy = '-created_at', limit = 100) {
      const { column, ascending } = normaliseOrder(orderBy);
      let query = supabase.from(table).select('*');

      Object.entries(filters || {}).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          query = query.eq(toSnakeCase(key), value);
        }
      });

      const response = await query.order(column, { ascending }).limit(limit);
      return throwIfError(response) || [];
    },

    async get(id) {
      const response = await supabase.from(table).select('*').eq('id', id).single();
      return throwIfError(response);
    },

    async create(payload) {
      const response = await supabase.from(table).insert(payload).select('*').single();
      return throwIfError(response);
    },

    async update(id, payload) {
      const response = await supabase.from(table).update(payload).eq('id', id).select('*').single();
      return throwIfError(response);
    },

    async delete(id) {
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
    const { data, error } = await supabase.functions.invoke(functionName, { body: payload });
    if (error) throw error;
    return data;
  },
};

const auth = {
  async isAuthenticated() {
    const { data } = await supabase.auth.getSession();
    return Boolean(data?.session);
  },

  async me() {
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
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
  },

  async logout() {
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
