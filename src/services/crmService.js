import { supabase } from '@/api/supabaseClient';

function unwrap({ data, error }) {
  if (error) throw error;
  return data;
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
        (payload) => {
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

  async listContacts(limit = 500) {
    return unwrap(
      await supabase
        .from('contacts')
        .select('*')
        .order('created_date', { ascending: false })
        .limit(limit)
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
};
