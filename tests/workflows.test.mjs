import { test } from 'node:test';
import assert from 'node:assert/strict';
import { runWorkflowSteps } from '../supabase/functions/_shared/workflows.js';
test('manual CRM workflow applies updates and creates its task', async () => {
  const writes = [];
  const platform = { entities: { Contact: { update: async (id, fields) => writes.push({ id, fields }) }, Task: { create: async fields => { writes.push(fields); return { id: 'task' }; } } } };
  const result = await runWorkflowSteps(platform, { steps: [
    { step_number: 1, step_type: 'update_entity', action_config: { fields: { pipeline_stage: 'Reviewed' } } },
    { step_number: 2, step_type: 'create_task', action_config: { title: 'Prepare quote' } },
  ] }, { entity_name: 'Contact', entity_id: 'contact' });
  assert.equal(writes[0].fields.pipeline_stage, 'Reviewed');
  assert.equal(writes[1].contact_id, 'contact');
  assert.equal(result.length, 2);
});
test('blocked integration steps fail before any preceding step writes', async () => {
  let writes = 0;
  await assert.rejects(() => runWorkflowSteps({ entities: { Contact: { update: async () => writes++ } } }, { steps: [
    { step_type: 'update_entity', action_config: { fields: { stage: 'Done' } } },
    { step_type: 'send_whatsapp' },
  ] }, { entity_name: 'Contact', entity_id: 'contact' }), /pending/);
  assert.equal(writes, 0);
});
