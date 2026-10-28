import { createClientFromRequest, serve } from '../_shared/server.ts';

serve('manageCustomPipeline', async (req) => {
  try {
    const platform = createClientFromRequest(req);
    
    const user = await platform.auth.me();
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { action, pipeline_id, data } = await req.json();

    // CREATE custom pipeline
    if (action === 'create_pipeline') {
      const pipeline = await platform.entities.Pipeline.create({
        name: data.pipeline_name,
        description: data.description || '',
        pipeline_type: 'custom',
        stages: data.stages || [],
        is_active: true,
      });
      return Response.json({ success: true, pipeline_id: pipeline.id, pipeline });
    }

    // UPDATE pipeline
    if (action === 'update_pipeline') {
      await platform.entities.Pipeline.update(pipeline_id, {
        name: data.pipeline_name || data.name,
        stages: data.stages,
        description: data.description,
        is_active: data.is_active
      });
      return Response.json({ success: true });
    }

    // GET pipeline
    if (action === 'get_pipeline') {
      const pipelines = await platform.entities.Pipeline.filter({ id: pipeline_id });
      if (!pipelines || pipelines.length === 0) {
        return Response.json({ error: 'Pipeline not found' }, { status: 404 });
      }
      return Response.json({ pipeline: pipelines[0] });
    }

    // LIST all pipelines
    if (action === 'list_pipelines') {
      const pipelines = await platform.entities.Pipeline.list('-created_date');
      return Response.json({ pipelines });
    }

    // ADD suggested action to stage
    if (action === 'add_suggested_action') {
      const pipeline = await platform.entities.Pipeline.get(pipeline_id);
      const stages = pipeline.stages || [];
      const stageIndex = stages.findIndex(s => s.id === data.stage_id);
      
      if (stageIndex === -1) {
        return Response.json({ error: 'Stage not found' }, { status: 404 });
      }

      if (!stages[stageIndex].suggested_actions) {
        stages[stageIndex].suggested_actions = [];
      }

      stages[stageIndex].suggested_actions.push({
        id: `action_${Date.now()}`,
        action_type: data.action_type, // 'send_email', 'send_whatsapp', 'create_task', 'send_quote'
        action_name: data.action_name,
        template_id: data.template_id,
        delay_days: data.delay_days || 0,
        is_active: true
      });

      await platform.entities.Pipeline.update(pipeline_id, { stages });
      return Response.json({ success: true });
    }

    // REMOVE suggested action
    if (action === 'remove_suggested_action') {
      const pipeline = await platform.entities.Pipeline.get(pipeline_id);
      const stages = pipeline.stages || [];
      const stageIndex = stages.findIndex(s => s.id === data.stage_id);
      
      if (stageIndex !== -1 && stages[stageIndex].suggested_actions) {
        stages[stageIndex].suggested_actions = stages[stageIndex].suggested_actions.filter(
          a => a.id !== data.action_id
        );
        await platform.entities.Pipeline.update(pipeline_id, { stages });
      }
      return Response.json({ success: true });
    }

    return Response.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});