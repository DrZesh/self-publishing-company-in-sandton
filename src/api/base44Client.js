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

function parseSort(sort = '-created_date') {
  const descending = sort.startsWith('-');
  return {
    column: descending ? sort.slice(1) : sort,
    ascending: !descending,
  };
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
      return data || [];
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
      return data || [];
    },

    async get(id) {
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    },

    async create(payload) {
      const { data, error } = await supabase
        .from(table)
        .insert(payload)
        .select('*')
        .single();

      if (error) throw error;
      return data;
    },

    async update(id, payload) {
      const { data, error } = await supabase
        .from(table)
        .update(payload)
        .eq('id', id)
        .select('*')
        .single();

      if (error) throw error;
      return data;
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

const supabaseContactEntity = makeSupabaseEntity('contacts');
const supabaseTaskEntity = makeSupabaseEntity('tasks');

function currentPath() {
  return typeof window === 'undefined' ? '' : window.location.pathname;
}

function usesMigratedCrmEntity(entityName) {
  const path = currentPath();
  const migratedRoutes = ['/admin/contacts', '/admin/pipeline', '/admin/tasks'];

  return (
    migratedRoutes.some(route => path.startsWith(route)) &&
    ['Contact', 'Task'].includes(entityName)
  );
}

const entitiesBridge = new Proxy(base44Sdk.entities, {
  get(target, property, receiver) {
    if (usesMigratedCrmEntity(property)) {
      if (property === 'Contact') return supabaseContactEntity;
      if (property === 'Task') return supabaseTaskEntity;
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

const functionsBridge = new Proxy(base44Sdk.functions, {
  get(target, property, receiver) {
    if (property === 'invoke') {
      return async (functionName, payload) => {
        if (functionName === 'captureFormSubmission') {
          const { data, error } = await supabase.functions.invoke('capture-form-submission', {
            body: payload,
          });

          if (error) throw error;
          if (data?.error) throw new Error(data.error);
          return { data };
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

        return target.invoke(functionName, payload);
      };
    }

    return Reflect.get(target, property, receiver);
  },
});

// Transitional client: authentication and selected CRM workflows use Supabase,
// while modules not yet migrated continue to use the existing Base44 backend.
export const base44 = new Proxy(base44Sdk, {
  get(target, property, receiver) {
    if (property === 'auth') return authBridge;
    if (property === 'entities') return entitiesBridge;
    if (property === 'functions') return functionsBridge;
    return Reflect.get(target, property, receiver);
  },
});
