import { base44 as transitionalBase44 } from './clientServiceSupabaseBridge.js';
import { supabase } from './supabaseClient.js';

function currentPath() {
  return typeof window === 'undefined' ? '' : window.location.pathname;
}

function isEmailTemplatePath() {
  return currentPath().startsWith('/admin/email-templates');
}

function isFinanceHubPath() {
  return currentPath().startsWith('/admin/finance');
}

function isSettingsPath() {
  return currentPath().startsWith('/admin/settings');
}

function isCalendarPath() {
  return currentPath().startsWith('/admin/calendar');
}

function isSignatureArchivePath() {
  return currentPath().startsWith('/admin/signatures');
}

function isPipelineBuilderPath() {
  return currentPath().startsWith('/admin/pipeline-builder');
}

function parseSort(sort = '-created_date') {
  const descending = sort.startsWith('-');
  return {
    column: descending ? sort.slice(1) : sort,
    ascending: !descending,
  };
}

function makeReadEntity(table) {
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
      const { data, error } = await query.order(column, { ascending }).limit(limit);
      if (error) throw error;
      return data || [];
    },

    async get(id) {
      const { data, error } = await supabase.from(table).select('*').eq('id', id).single();
      if (error) throw error;
      return data;
    },
  };
}

function makeCrudEntity(table, clean = value => value) {
  return {
    ...makeReadEntity(table),

    async create(payload) {
      const { data, error } = await supabase
        .from(table)
        .insert(clean(payload))
        .select('*')
        .single();
      if (error) throw error;
      return data;
    },

    async update(id, payload) {
      const { data, error } = await supabase
        .from(table)
        .update(clean(payload))
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

const emailTemplateEntity = makeCrudEntity('email_templates');
const workflowPipelineEntity = makeCrudEntity('workflow_pipelines', payload => ({
  ...payload,
  stages: Array.isArray(payload?.stages) ? payload.stages : [],
}));

const financeEntities = {
  Quote: makeReadEntity('quotes'),
  Invoice: makeReadEntity('invoices'),
  Payment: makeReadEntity('payments'),
  Contact: makeReadEntity('contacts'),
};

const settingsEntities = {
  Contact: makeReadEntity('contacts'),
  Lead: makeReadEntity('leads'),
  Quote: makeReadEntity('quotes'),
  Submission: makeReadEntity('submissions'),
};

const calendarEntities = {
  Project: makeReadEntity('projects'),
  Invoice: makeReadEntity('invoices'),
  Task: makeReadEntity('tasks'),
  Contract: makeReadEntity('contracts'),
  Contact: makeReadEntity('contacts'),
};

const signatureArchiveEntities = {
  QuoteSignature: makeReadEntity('quote_signatures'),
  Quote: makeReadEntity('quotes'),
};

const entitiesBridge = new Proxy(transitionalBase44.entities, {
  get(target, property, receiver) {
    if (isEmailTemplatePath() && property === 'EmailTemplate') return emailTemplateEntity;
    if (isFinanceHubPath() && financeEntities[property]) return financeEntities[property];
    if (isSettingsPath() && settingsEntities[property]) return settingsEntities[property];
    if (isCalendarPath() && calendarEntities[property]) return calendarEntities[property];
    if (isSignatureArchivePath() && signatureArchiveEntities[property]) return signatureArchiveEntities[property];
    if (isPipelineBuilderPath() && property === 'Pipeline') return workflowPipelineEntity;
    return Reflect.get(target, property, receiver);
  },
});

export const base44 = new Proxy(transitionalBase44, {
  get(target, property, receiver) {
    if (property === 'entities') return entitiesBridge;
    return Reflect.get(target, property, receiver);
  },
});
