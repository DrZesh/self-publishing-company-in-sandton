import { createClientFromRequest, serve } from '../_shared/server.ts';

serve('manageProductionJobs', async (req) => {
  try {
    const platform = createClientFromRequest(req);
    const user = await platform.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const { action, job_id, data } = body;

    // Get company settings
    const getCompanySettings = async () => {
      const settings = await platform.entities.CompanySettings.filter({ setting_key: 'main' });
      return settings[0] || null;
    };

    // Generate job number
    const generateJobNumber = async () => {
      const year = new Date().getFullYear();
      const allJobs = await platform.entities.ProductionJob.list('-created_date', 1);
      const lastNumber = allJobs[0]?.job_number ? parseInt(allJobs[0].job_number.split('-').pop()) : 0;
      return `CBSA-PRD-${year}-${String(lastNumber + 1).padStart(4, '0')}`;
    };

    // CREATE production job
    if (action === 'create') {
      const jobNumber = await generateJobNumber();
      const job = await platform.entities.ProductionJob.create({
        job_number: jobNumber,
        project_id: data.project_id,
        job_type: data.job_type,
        quantity: data.quantity,
        specifications: data.specifications || {},
        deadline: data.deadline,
        priority: data.priority || 'Medium',
        assigned_to: data.assigned_to,
        checklist: data.checklist || [],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

      // Create activity log
      await platform.entities.ActivityLog.create({
        entity_type: 'ProductionJob',
        entity_id: job.id,
        action: 'created',
        description: `Production job ${jobNumber} created for ${data.job_type}`,
        performed_by: user.full_name,
      });

      return Response.json({ success: true, job });
    }

    // UPDATE production job
    if (action === 'update') {
      const updates = {
        ...data,
        updated_at: new Date().toISOString(),
      };

      // Handle checklist updates
      if (data.checklist_item) {
        const job = (await platform.entities.ProductionJob.filter({ id: job_id }))[0];
        if (!job) {
          return Response.json({ error: 'Job not found' }, { status: 404 });
        }

        const checklist = job.checklist || [];
        const itemIndex = checklist.findIndex(i => i.item === data.checklist_item.item);

        if (itemIndex >= 0) {
          checklist[itemIndex] = {
            ...checklist[itemIndex],
            completed: data.checklist_item.completed,
            completed_by: data.checklist_item.completed ? user.full_name : undefined,
            completed_at: data.checklist_item.completed ? new Date().toISOString() : undefined,
          };
          updates.checklist = checklist;
        }
      }

      await platform.entities.ProductionJob.update(job_id, updates);

      await platform.entities.ActivityLog.create({
        entity_type: 'ProductionJob',
        entity_id: job_id,
        action: 'updated',
        description: `Production job ${job_id} updated`,
        performed_by: user.full_name,
      });

      return Response.json({ success: true });
    }

    // GET production jobs
    if (action === 'list') {
      const filters = {};
      if (data.status) filters.status = data.status;
      if (data.job_type) filters.job_type = data.job_type;
      if (data.assigned_to) filters.assigned_to = data.assigned_to;
      if (data.project_id) filters.project_id = data.project_id;

      const jobs = await platform.entities.ProductionJob.filter(filters, '-created_date', data.limit || 100);
      return Response.json({ jobs });
    }

    // GET single job
    if (action === 'get') {
      const jobs = await platform.entities.ProductionJob.filter({ id: job_id });
      if (!jobs.length) {
        return Response.json({ error: 'Job not found' }, { status: 404 });
      }
      return Response.json({ job: jobs[0] });
    }

    // DELETE production job
    if (action === 'delete') {
      if (user.role !== 'admin') {
        return Response.json({ error: 'Forbidden' }, { status: 403 });
      }
      await platform.entities.ProductionJob.delete(job_id);
      return Response.json({ success: true });
    }

    // UPDATE checklist item
    if (action === 'update_checklist') {
      const job = (await platform.entities.ProductionJob.filter({ id: job_id }))[0];
      if (!job) {
        return Response.json({ error: 'Job not found' }, { status: 404 });
      }

      const checklist = job.checklist || [];
      const itemIndex = checklist.findIndex(i => i.item === data.item);

      if (itemIndex >= 0) {
        checklist[itemIndex] = {
          ...checklist[itemIndex],
          completed: data.completed,
          completed_by: data.completed ? user.full_name : undefined,
          completed_at: data.completed ? new Date().toISOString() : undefined,
        };

        await platform.entities.ProductionJob.update(job_id, {
          checklist,
          updated_at: new Date().toISOString(),
        });

        // Check if all items completed
        const allCompleted = checklist.every(i => i.completed);
        if (allCompleted && job.status !== 'Completed') {
          await platform.entities.ProductionJob.update(job_id, {
            status: 'Completed',
            completed_at: new Date().toISOString(),
          });
        }
      }

      return Response.json({ success: true });
    }

    // GET dashboard metrics
    if (action === 'dashboard') {
      const allJobs = await platform.entities.ProductionJob.list('-created_date', 500);
      
      const metrics = {
        total_jobs: allJobs.length,
        active_jobs: allJobs.filter(j => ['In Progress', 'Queue'].includes(j.status)).length,
        completed_this_month: allJobs.filter(j => {
          if (!j.completed_at) return false;
          const completed = new Date(j.completed_at);
          const now = new Date();
          return completed.getMonth() === now.getMonth() && completed.getFullYear() === now.getFullYear();
        }).length,
        overdue: allJobs.filter(j => {
          if (!j.deadline) return false;
          return new Date(j.deadline) < new Date() && j.status !== 'Completed';
        }).length,
        by_status: {},
        by_type: {},
        queue_summary: {
          sample_print: allJobs.filter(j => j.queue_type === 'Sample Print Queue').length,
          mass_production: allJobs.filter(j => j.queue_type === 'Mass Production Queue').length,
          active: allJobs.filter(j => j.queue_type === 'Active Print Queue').length,
        },
      };

      // Group by status
      allJobs.forEach(j => {
        const status = j.status || 'Unknown';
        metrics.by_status[status] = (metrics.by_status[status] || 0) + 1;
      });

      // Group by type
      allJobs.forEach(j => {
        const type = j.job_type || 'Unknown';
        metrics.by_type[type] = (metrics.by_type[type] || 0) + 1;
      });

      return Response.json({ metrics });
    }

    return Response.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});