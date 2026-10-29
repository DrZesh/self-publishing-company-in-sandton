const writable = new Set(['Contact', 'Lead', 'Project', 'PipelineDeal', 'Task', 'Document', 'ProductionJob']);
export function validateWorkflow(template, data = {}) {
  if (!template.steps?.length) throw new Error('Add at least one workflow step before running it.');
  for (const step of template.steps) {
    const config = step.action_config || {};
    if (!['update_entity', 'create_task', 'move_stage', 'assign_user'].includes(step.step_type)) {
      throw new Error(`Workflow step ${step.step_name || step.step_type} needs an integration that is still pending.`);
    }
    if (step.conditions?.length || step.is_parallel) throw new Error('Conditional and parallel workflow steps are still pending.');
    if (step.step_type === 'create_task') {
      if (!(config.title || config.task?.title)) throw new Error('Create Task needs a task title.');
    } else {
      const entity = config.entity_name || data.entity_name || template.trigger_entity;
      if (!writable.has(entity)) throw new Error('Choose a supported CRM record type for this step.');
      if (!(config.entity_id || data.entity_id)) throw new Error('Choose a CRM record before running this workflow.');
      if (step.step_type === 'update_entity' && !Object.keys(config.fields || config.updates || {}).length) throw new Error('Update Entity needs at least one field to update.');
      if (step.step_type === 'move_stage' && !config.stage) throw new Error('Move Stage needs a target stage.');
      if (step.step_type === 'assign_user' && !config.assigned_to) throw new Error('Assign User needs an assignee.');
    }
  }
}
export async function runWorkflowSteps(platform, template, data = {}) {
  validateWorkflow(template, data);
  const results = [];
  for (const step of template.steps) {
    const config = step.action_config || {};
    if (step.step_type === 'create_task') {
      const task = await platform.entities.Task.create({ ...(config.task || config), contact_id: config.contact_id || (data.entity_name === 'Contact' ? data.entity_id : undefined), status: config.task?.status || config.status || 'Pending' });
      results.push({ step_number: step.step_number, status: 'Completed', entity_id: task.id });
    } else {
      const entity = config.entity_name || data.entity_name || template.trigger_entity;
      const id = config.entity_id || data.entity_id;
      const patch = step.step_type === 'move_stage' ? { [entity === 'Contact' ? 'pipeline_stage' : 'stage']: config.stage } : step.step_type === 'assign_user' ? { assigned_to: config.assigned_to } : (config.fields || config.updates);
      await platform.entities[entity].update(id, patch);
      results.push({ step_number: step.step_number, status: 'Completed', entity_id: id });
    }
  }
  return results;
}
