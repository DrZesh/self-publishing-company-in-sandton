import { createClientFromRequest, serve } from '../_shared/server.ts';

serve('manageWorkflows', async (req) => {
  try {
    const platform = createClientFromRequest(req);
    const user = await platform.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const { action, workflow_id, execution_id, data } = body;

    // CREATE workflow template
    if (action === 'create_template') {
      const template = await platform.entities.WorkflowTemplate.create({
        template_name: data.template_name,
        description: data.description,
        category: data.category,
        trigger_type: data.trigger_type,
        trigger_entity: data.trigger_entity,
        trigger_conditions: data.trigger_conditions || [],
        steps: data.steps || [],
        error_handling: data.error_handling || {
          retry_count: 3,
          retry_delay_minutes: 5,
          notify_on_error: true,
          error_notification_email: user.email,
        },
        is_active: data.is_active ?? true,
        is_public: data.is_public ?? false,
        created_by: user.full_name,
        version: 1,
      });

      return Response.json({ success: true, template });
    }

    // UPDATE workflow template
    if (action === 'update_template') {
      const updates = {
        ...data,
        version: ((await platform.entities.WorkflowTemplate.filter({ id: workflow_id }))[0]?.version || 1) + 1,
      };

      await platform.entities.WorkflowTemplate.update(workflow_id, updates);
      return Response.json({ success: true });
    }

    // LIST workflow templates
    if (action === 'list_templates') {
      const filters = {};
      if (data.category) filters.category = data.category;
      if (data.is_active !== undefined) filters.is_active = data.is_active;
      if (!user || user.role !== 'admin') {
        filters.$or = [{ is_public: true }, { created_by: user?.full_name }];
      }

      const templates = await platform.entities.WorkflowTemplate.filter(filters, '-created_date', 200);
      return Response.json({ templates });
    }

    // GET single template
    if (action === 'get_template') {
      const templates = await platform.entities.WorkflowTemplate.filter({ id: workflow_id });
      if (!templates.length) {
        return Response.json({ error: 'Template not found' }, { status: 404 });
      }
      return Response.json({ template: templates[0] });
    }

    // DELETE workflow template
    if (action === 'delete_template') {
      if (user.role !== 'admin') {
        return Response.json({ error: 'Forbidden' }, { status: 403 });
      }
      await platform.entities.WorkflowTemplate.delete(workflow_id);
      return Response.json({ success: true });
    }

    // TEST workflow (dry run)
    if (action === 'test_workflow') {
      const template = (await platform.entities.WorkflowTemplate.filter({ id: workflow_id }))[0];
      if (!template) {
        return Response.json({ error: 'Template not found' }, { status: 404 });
      }

      // Simulate execution
      const simulation = {
        template_name: template.template_name,
        total_steps: template.steps?.length || 0,
        estimated_duration: (template.steps?.length || 0) * 2, // 2 minutes per step avg
        steps_preview: template.steps?.map(s => ({
          step: s.step_number,
          name: s.step_name,
          type: s.step_type,
          has_conditions: !!s.conditions?.length,
        })) || [],
        warnings: [],
      };

      // Check for common issues
      if (!template.steps?.length) {
        simulation.warnings.push('Workflow has no steps');
      }

      const hasEndStep = template.steps?.some(s => 
        ['send_email', 'update_entity', 'create_task'].includes(s.step_type)
      );
      if (!hasEndStep) {
        simulation.warnings.push('Workflow may not have a clear ending action');
      }

      return Response.json({ simulation });
    }

    // EXECUTE workflow manually
    if (action === 'execute') {
      const template = (await platform.entities.WorkflowTemplate.filter({ id: workflow_id }))[0];
      if (!template) {
        return Response.json({ error: 'Template not found' }, { status: 404 });
      }

      const executionId = `EXEC-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      const execution = await platform.entities.WorkflowExecution.create({
        execution_id: executionId,
        workflow_template_id: workflow_id,
        workflow_name: template.template_name,
        trigger_type: 'manual',
        trigger_entity_name: data.entity_name,
        trigger_entity_id: data.entity_id,
        status: 'Pending',
        total_steps: template.steps?.length || 0,
        started_at: new Date().toISOString(),
        variables: data.variables || {},
        created_by: user.full_name,
      });

      // Queue for execution (in production, this would trigger a background job)
      // For now, we'll just return the execution ID
      return Response.json({ 
        success: true, 
        execution_id: executionId,
        message: 'Workflow execution started',
      });
    }

    // LIST executions
    if (action === 'list_executions') {
      const filters = {};
      if (data.workflow_template_id) filters.workflow_template_id = data.workflow_template_id;
      if (data.status) filters.status = data.status;
      if (data.trigger_entity_id) filters.trigger_entity_id = data.trigger_entity_id;

      const executions = await platform.entities.WorkflowExecution.filter(filters, '-started_at', data.limit || 100);
      return Response.json({ executions });
    }

    // GET execution details
    if (action === 'get_execution') {
      const executions = await platform.entities.WorkflowExecution.filter({ execution_id: execution_id });
      if (!executions.length) {
        return Response.json({ error: 'Execution not found' }, { status: 404 });
      }
      return Response.json({ execution: executions[0] });
    }

    // CANCEL execution
    if (action === 'cancel_execution') {
      const executions = await platform.entities.WorkflowExecution.filter({ execution_id: execution_id });
      if (!executions.length) {
        return Response.json({ error: 'Execution not found' }, { status: 404 });
      }

      if (executions[0].status === 'Completed') {
        return Response.json({ error: 'Cannot cancel completed execution' }, { status: 400 });
      }

      await platform.entities.WorkflowExecution.update(executions[0].id, {
        status: 'Cancelled',
        completed_at: new Date().toISOString(),
      });

      return Response.json({ success: true });
    }

    // GET workflow statistics
    if (action === 'statistics') {
      const allExecutions = await platform.entities.WorkflowExecution.list('-started_at', 1000);
      
      const stats = {
        total_executions: allExecutions.length,
        successful: allExecutions.filter(e => e.status === 'Completed').length,
        failed: allExecutions.filter(e => e.status === 'Failed').length,
        running: allExecutions.filter(e => e.status === 'Running').length,
        success_rate: allExecutions.length > 0 
          ? (allExecutions.filter(e => e.status === 'Completed').length / allExecutions.length) * 100 
          : 0,
        average_duration: allExecutions.filter(e => e.duration_seconds).length > 0
          ? allExecutions.filter(e => e.duration_seconds).reduce((sum, e) => sum + e.duration_seconds, 0) / allExecutions.filter(e => e.duration_seconds).length
          : 0,
        by_template: {},
        recent_executions: allExecutions.slice(0, 10).map(e => ({
          execution_id: e.execution_id,
          workflow_name: e.workflow_name,
          status: e.status,
          started_at: e.started_at,
          duration: e.duration_seconds,
        })),
      };

      // Group by template
      allExecutions.forEach(e => {
        const name = e.workflow_name || 'Unknown';
        if (!stats.by_template[name]) {
          stats.by_template[name] = { total: 0, success: 0, failed: 0 };
        }
        stats.by_template[name].total++;
        if (e.status === 'Completed') stats.by_template[name].success++;
        if (e.status === 'Failed') stats.by_template[name].failed++;
      });

      return Response.json({ stats });
    }

    // DUPLICATE workflow template
    if (action === 'duplicate_template') {
      const original = (await platform.entities.WorkflowTemplate.filter({ id: workflow_id }))[0];
      if (!original) {
        return Response.json({ error: 'Template not found' }, { status: 404 });
      }

      const duplicate = await platform.entities.WorkflowTemplate.create({
        template_name: `${original.template_name} (Copy)`,
        description: original.description,
        category: original.category,
        trigger_type: original.trigger_type,
        trigger_entity: original.trigger_entity,
        trigger_conditions: original.trigger_conditions || [],
        steps: JSON.parse(JSON.stringify(original.steps || [])), // Deep copy
        error_handling: original.error_handling,
        is_active: false, // Start as inactive
        is_public: false,
        created_by: user.full_name,
        version: 1,
      });

      return Response.json({ success: true, template: duplicate });
    }

    // EXPORT workflow template
    if (action === 'export_template') {
      const template = (await platform.entities.WorkflowTemplate.filter({ id: workflow_id }))[0];
      if (!template) {
        return Response.json({ error: 'Template not found' }, { status: 404 });
      }

      // Remove internal fields
      const exportData = {
        template_name: template.template_name,
        description: template.description,
        category: template.category,
        trigger_type: template.trigger_type,
        trigger_entity: template.trigger_entity,
        trigger_conditions: template.trigger_conditions,
        steps: template.steps,
        error_handling: template.error_handling,
        version: template.version,
        exported_at: new Date().toISOString(),
        exported_by: user.full_name,
      };

      return Response.json({ export: exportData });
    }

    return Response.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});