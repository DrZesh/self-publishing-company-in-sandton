import { createClientFromRequest, serve } from '../_shared/server.ts';

serve('proofApprovalActions', async (req) => {
  try {
    const platform = createClientFromRequest(req);
    
    // No auth check needed - this is called from public portal with token
    const body = await req.json();
    const { action, proof_id, client_decision, client_feedback, token } = body;

    if (!proof_id || !token) {
      return Response.json({ error: 'Proof ID and token required' }, { status: 400 });
    }

    // Verify portal access
    const accesses = await platform.entities.ClientPortalAccess.filter({ access_token: token });
    if (!accesses.length) {
      return Response.json({ error: 'Invalid portal access' }, { status: 403 });
    }
    const contactId = accesses[0].contact_id;

    // Get proof
    const proofs = await platform.entities.ProofApproval.filter({ id: proof_id });
    if (!proofs.length) {
      return Response.json({ error: 'Proof not found' }, { status: 404 });
    }
    const proof = proofs[0];

    // Verify contact owns this proof
    if (proof.contact_id !== contactId) {
      return Response.json({ error: 'Unauthorized' }, { status: 403 });
    }

    if (action === 'approve') {
      await platform.entities.ProofApproval.update(proof_id, {
        status: 'approved',
        client_decision: 'approve',
        approved_at: new Date().toISOString(),
      });

      // Create project update
      await platform.entities.ProjectUpdate.create({
        project_id: proof.project_id,
        contact_id: contactId,
        update_type: 'milestone_completed',
        title: `${proof.proof_type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())} Approved`,
        message: `You have approved the ${proof.proof_type.replace('_', ' ')} for ${proof.title}. We'll proceed to the next stage.`,
        milestone_name: 'Proof Approved',
      });

      return Response.json({ success: true, message: 'Proof approved successfully' });
    }

    if (action === 'request_changes') {
      if (!client_feedback) {
        return Response.json({ error: 'Feedback required when requesting changes' }, { status: 400 });
      }

      await platform.entities.ProofApproval.update(proof_id, {
        status: 'changes_requested',
        client_decision: 'request_changes',
        client_feedback,
        changes_requested_at: new Date().toISOString(),
      });

      // Create project update
      await platform.entities.ProjectUpdate.create({
        project_id: proof.project_id,
        contact_id: contactId,
        update_type: 'action_required',
        title: 'Changes Requested',
        message: `You requested changes to the ${proof.proof_type.replace('_', ' ')}. Our team will review your feedback.`,
      });

      return Response.json({ success: true, message: 'Changes requested successfully' });
    }

    return Response.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Proof approval error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});