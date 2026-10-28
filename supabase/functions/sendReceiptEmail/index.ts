import { createClientFromRequest, serve } from '../_shared/server.ts';
import { Resend } from 'npm:resend@3.2.0';
import { jsPDF } from 'npm:jspdf@4.0.0';

// Redirect all receipt sending to paymentActions for consistency
serve('sendReceiptEmail', async (req) => {
  try {
    const platform = createClientFromRequest(req);
    const user = await platform.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { receipt_id } = body;
    if (!receipt_id) return Response.json({ error: 'Receipt ID required' }, { status: 400 });

    // Delegate to paymentActions send_acknowledgement for consistent template
    const result = await platform.asServiceRole.functions.invoke('paymentActions', {
      action: 'send_acknowledgement',
      receipt_id,
    });

    return Response.json(result);
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});