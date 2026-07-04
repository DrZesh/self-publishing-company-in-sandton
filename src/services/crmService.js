import { supabase } from '@/api/supabaseClient';

function unwrap({ data, error }) {
  if (error) throw error;
  return data;
}

function compactObject(input) {
  return Object.fromEntries(
    Object.entries(input).filter(([, value]) => value !== undefined)
  );
}

function normaliseContactPayload(data) {
  return compactObject({
    ...data,
    email: data.email?.trim().toLowerCase(),
    full_name: data.full_name?.trim(),
    pipeline_value:
      data.pipeline_value === '' || data.pipeline_value === null
        ? 0
        : data.pipeline_value !== undefined
          ? Number(data.pipeline_value) || 0
          : undefined,
    probability:
      data.probability === '' || data.probability === null
        ? null
        : data.probability !== undefined
          ? Number(data.probability)
          : undefined,
  });
}

export const crmService = {
  async listSubmissions(limit = 200) {
    return unwrap(
      await supabase
        .from('submissions')
        .select('*')
        .order('created_date', { ascending: false })
        .limit(limit)
    );
  },

  subscribeSubmissions(onEvent) {
    const channel = supabase
      .channel('admin-submissions')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'submissions' },
        payload => {
          const typeMap = {
            INSERT: 'create',
            UPDATE: 'update',
            DELETE: 'delete',
          };

          onEvent({
            type: typeMap[payload.eventType] || payload.eventType.toLowerCase(),
            id: payload.new?.id || payload.old?.id,
            data: payload.new || payload.old,
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  },

  async updateSubmission(id, updates) {
    return unwrap(
      await supabase
        .from('submissions')
        .update(updates)
        .eq('id', id)
        .select('*')
        .single()
    );
  },

  async deleteSubmission(id) {
    return unwrap(
      await supabase
        .from('submissions')
        .delete()
        .eq('id', id)
        .select('id')
        .single()
    );
  },

  async convertSubmissionToLead(id, estimatedValue = 0, probabilityPercent = 50) {
    return unwrap(
      await supabase.rpc('convert_submission_to_lead', {
        p_submission_id: id,
        p_estimated_value: estimatedValue,
        p_probability_percent: probabilityPercent,
      })
    );
  },

  async listContacts(limit = 500, orderBy = 'created_date') {
    return unwrap(
      await supabase
        .from('contacts')
        .select('*')
        .order(orderBy, { ascending: false })
        .limit(limit)
    );
  },

  async getContact(id) {
    return unwrap(
      await supabase
        .from('contacts')
        .select('*')
        .eq('id', id)
        .single()
    );
  },

  async createContact(data) {
    return unwrap(
      await supabase
        .from('contacts')
        .insert(normaliseContactPayload(data))
        .select('*')
        .single()
    );
  },

  async updateContact(id, updates) {
    return unwrap(
      await supabase
        .from('contacts')
        .update(normaliseContactPayload(updates))
        .eq('id', id)
        .select('*')
        .single()
    );
  },

  async deleteContact(id) {
    return unwrap(
      await supabase
        .from('contacts')
        .delete()
        .eq('id', id)
        .select('id')
        .single()
    );
  },

  async listLeads(limit = 200) {
    return unwrap(
      await supabase
        .from('leads')
        .select('*')
        .order('created_date', { ascending: false })
        .limit(limit)
    );
  },

  async createLead(data) {
    const payload = {
      ...data,
      estimated_value: Number(data.estimated_value) || 0,
      probability_percent: Number(data.probability_percent) || 0,
    };

    delete payload.weighted_value;

    return unwrap(
      await supabase
        .from('leads')
        .insert(payload)
        .select('*')
        .single()
    );
  },

  async updateLead(id, updates) {
    const payload = { ...updates };
    delete payload.weighted_value;

    return unwrap(
      await supabase
        .from('leads')
        .update(payload)
        .eq('id', id)
        .select('*')
        .single()
    );
  },

  async deleteLead(id) {
    return unwrap(
      await supabase
        .from('leads')
        .delete()
        .eq('id', id)
        .select('id')
        .single()
    );
  },

  async listTasks(limit = 500) {
    return unwrap(
      await supabase
        .from('tasks')
        .select('*')
        .order('due_date', { ascending: true })
        .limit(limit)
    );
  },

  async createTask(data) {
    const payload = compactObject({
      ...data,
      contact_id: data.contact_id || null,
      lead_id: data.lead_id || null,
      assigned_to: data.assigned_to || null,
    });

    return unwrap(
      await supabase
        .from('tasks')
        .insert(payload)
        .select('*')
        .single()
    );
  },

  async updateTask(id, updates) {
    return unwrap(
      await supabase
        .from('tasks')
        .update(compactObject(updates))
        .eq('id', id)
        .select('*')
        .single()
    );
  },

  async deleteTask(id) {
    return unwrap(
      await supabase
        .from('tasks')
        .delete()
        .eq('id', id)
        .select('id')
        .single()
    );
  },

  async getFollowUpReminders() {
    return unwrap(await supabase.rpc('get_follow_up_reminders'));
  },

  async getContactActivity(contactId) {
    return unwrap(
      await supabase.rpc('get_contact_activity', {
        p_contact_id: contactId,
      })
    );
  },
};
