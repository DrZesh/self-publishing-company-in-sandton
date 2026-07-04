import { base44 as transitionalBase44 } from './clientServiceSupabaseBridge.js';
import { supabase } from './supabaseClient.js';

function currentPath() {
  return typeof window === 'undefined' ? '' : window.location.pathname;
}

function isEmailTemplatePath() {
  return currentPath().startsWith('/admin/email-templates');
}

function parseSort(sort = '-created_date') {
  const descending = sort.startsWith('-');
  return {
    column: descending ? sort.slice(1) : sort,
    ascending: !descending,
  };
}

const emailTemplateEntity = {
  async list(sort = '-created_date', limit = 200) {
    const { column, ascending } = parseSort(sort);
    const { data, error } = await supabase
      .from('email_templates')
      .select('*')
      .order(column, { ascending })
      .limit(limit);
    if (error) throw error;
    return data || [];
  },

  async filter(filters = {}, sort = '-created_date', limit = 200) {
    const { column, ascending } = parseSort(sort);
    let query = supabase.from('email_templates').select('*');
    Object.entries(filters).forEach(([key, value]) => {
      if (value === null) query = query.is(key, null);
      else if (value !== undefined) query = query.eq(key, value);
    });
    const { data, error } = await query.order(column, { ascending }).limit(limit);
    if (error) throw error;
    return data || [];
  },

  async get(id) {
    const { data, error } = await supabase
      .from('email_templates')
      .select('*')
      .eq('id', id)
      .single();
    if (error) throw error;
    return data;
  },

  async create(payload) {
    const { data, error } = await supabase
      .from('email_templates')
      .insert(payload)
      .select('*')
      .single();
    if (error) throw error;
    return data;
  },

  async update(id, payload) {
    const { data, error } = await supabase
      .from('email_templates')
      .update(payload)
      .eq('id', id)
      .select('*')
      .single();
    if (error) throw error;
    return data;
  },

  async delete(id) {
    const { data, error } = await supabase
      .from('email_templates')
      .delete()
      .eq('id', id)
      .select('id')
      .single();
    if (error) throw error;
    return data;
  },
};

const entitiesBridge = new Proxy(transitionalBase44.entities, {
  get(target, property, receiver) {
    if (isEmailTemplatePath() && property === 'EmailTemplate') return emailTemplateEntity;
    return Reflect.get(target, property, receiver);
  },
});

export const base44 = new Proxy(transitionalBase44, {
  get(target, property, receiver) {
    if (property === 'entities') return entitiesBridge;
    return Reflect.get(target, property, receiver);
  },
});
