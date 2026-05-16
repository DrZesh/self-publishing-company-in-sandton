import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();

    const { event, data, old_data } = body;

    // Only act on updates where stage changed
    if (event.type !== 'update' || !data || !old_data) {
      return Response.json({ ok: true, skipped: 'not an update' });
    }

    if (data.stage === old_data.stage) {
      return Response.json({ ok: true, skipped: 'stage unchanged' });
    }

    // Log the stage change to ActivityLog
    await base44.asServiceRole.entities.ActivityLog.create({
      entity_type: 'lead',
      entity_id: event.entity_id,
      action: 'stage_changed',
      actor_id: data.owner_id || 'system',
      description: `Lead moved from "${old_data.stage}" to "${data.stage}"`,
      metadata: {
        from_stage: old_data.stage,
        to_stage: data.stage,
        estimated_value: data.estimated_value,
      },
    });

    // If won, also log a special won event
    if (data.stage === 'won') {
      await base44.asServiceRole.entities.ActivityLog.create({
        entity_type: 'lead',
        entity_id: event.entity_id,
        action: 'won',
        actor_id: data.owner_id || 'system',
        description: `🎉 Lead WON — R${(data.estimated_value || 0).toLocaleString()}`,
        metadata: { revenue: data.estimated_value },
      });
    }

    return Response.json({ ok: true });
  } catch (error) {
    console.error('onLeadStageChange error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});