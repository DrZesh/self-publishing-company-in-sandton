import { createClientFromRequest, serve } from '../_shared/server.ts';

serve('workflowAutomation', async (req) => {
  try {
    const platform = createClientFromRequest(req);
    const user = await platform.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { action, contact_id, workflow_id, data } = body;

    // Get or create workflow for contact
    const getOrCreateWorkflow = async (cid, serviceType) => {
      const existing = await platform.entities.ClientWorkflow.filter({ contact_id: cid });
      if (existing.length > 0) return existing[0];
      
      // Create new workflow
      const workflow = await platform.entities.ClientWorkflow.create({
        contact_id: cid,
        current_stage: 'New Enquiry',
        service_type: serviceType || 'Not specified',
        automation_enabled: true,
      });
      return workflow;
    };

    // Get workflow rules for service type
    const getWorkflowRules = async (serviceType) => {
      try {
        const rules = await platform.entities.AutomationRule.filter({ is_active: true });
        return rules.filter(r => !r.trigger_stage || r.trigger_stage === 'all' || r.trigger_stage === serviceType);
      } catch (error) {
        console.error('Failed to fetch automation rules:', error.message);
        return [];
      }
    };

    // Update workflow stage and send email notification
    const updateStage = async (workflow, newStage, changedBy) => {
      const now = new Date().toISOString();
      const stageHistory = workflow.stage_history || [];
      
      // Update previous stage exit date
      if (stageHistory.length > 0 && !stageHistory[stageHistory.length - 1].exited_at) {
        stageHistory[stageHistory.length - 1].exited_at = now;
      }
      
      // Add new stage entry
      stageHistory.push({
        stage: newStage,
        entered_at: now,
        changed_by: changedBy || user.email,
      });

      await platform.entities.ClientWorkflow.update(workflow.id, {
        current_stage: newStage,
        stage_history: stageHistory,
      });

      const updatedWorkflow = await platform.entities.ClientWorkflow.get(workflow.id);

      // Get contact for email
      const contact = await platform.entities.Contact.get(workflow.contact_id);
      
      // Send stage update email to client
      const emailTemplates = {
        'Quote Sent': {
          subject: 'Your Quote is Ready - Creative Books SA',
          body: `Dear ${contact.full_name},\n\nGreat news! Your quote for "${contact.book_title || 'your book'}" is ready and has been sent to you.\n\nPlease review the quote at your earliest convenience. If you have any questions or would like to discuss the package further, don't hesitate to contact us.\n\nWarm regards,\nCreative Books SA\n084 230 5393`
        },
        'Quote Accepted': {
          subject: 'Quote Accepted - Next Steps',
          body: `Dear ${contact.full_name},\n\nThank you for accepting our quote for "${contact.book_title || 'your book'}". We're excited to work with you!\n\n${workflow.nda_required ? 'The next step is to sign the NDA (Non-Disclosure Agreement) which will be sent to you separately.\n\n' : ''}Once all preliminary steps are complete, we'll begin working on your project.\n\nWarm regards,\nCreative Books SA`
        },
        'NDA Signed': {
          subject: 'NDA Signed - Invoice Coming Soon',
          body: `Dear ${contact.full_name},\n\nThank you for signing the NDA. Your project confidentiality is now protected.\n\nAn invoice will be sent to you shortly. Once the deposit is received, we'll officially begin work on "${contact.book_title || 'your book'}".\n\nBest regards,\nCreative Books SA`
        },
        'Invoice Sent': {
          subject: 'Invoice for Your Publishing Project',
          body: `Dear ${contact.full_name},\n\nYour invoice for the publishing services for "${contact.book_title || 'your book'}" has been sent.\n\nPayment details and banking information are included in the invoice. Once payment is received, we'll immediately begin work on your project.\n\nThank you for choosing Creative Books SA.\n\nKind regards,\nCreative Books SA`
        },
        'Payment Received': {
          subject: 'Payment Received - Project Starting!',
          body: `Dear ${contact.full_name},\n\nGreat news! Your payment has been received and your project is now starting!\n\nWe're excited to begin working on "${contact.book_title || 'your book'}". You'll receive regular updates as we progress through each stage of the publishing process.\n\nWelcome aboard!\nCreative Books SA`
        },
        'Project Active': {
          subject: 'Your Project is Now Active',
          body: `Dear ${contact.full_name},\n\nYour publishing project for "${contact.book_title || 'your book'}" is now active and in progress.\n\nOur team has begun working on your project. You'll receive updates at each major milestone. Feel free to reach out if you have any questions.\n\nBest regards,\nCreative Books SA`
        },
        'Completed': {
          subject: 'Project Completed - Congratulations!',
          body: `Dear ${contact.full_name},\n\nCongratulations! Your publishing project for "${contact.book_title || 'your book'}" has been completed.\n\nIt's been a pleasure working with you. We hope your book achieves great success.\n\nWarm regards,\nCreative Books SA`
        }
      };

      const template = emailTemplates[newStage];
      if (template && contact.email) {
        try {
          await platform.functions.invoke('sendBrandedEmail', {
            to: contact.email,
            subject: template.subject,
            htmlBody: `<p style="white-space: pre-line; font-size: 16px; line-height: 1.6;">${template.body.replace(/\n\n/g, '</p><p>').replace(/\n/g, '<br/>')}</p>`,
          });
          console.log(`Stage update email sent to ${contact.email} for stage: ${newStage}`);
        } catch (emailError) {
          console.error('Failed to send stage update email:', emailError);
        }
      }
      return updatedWorkflow;
    };

    // Check if stage transition is allowed
    const canTransitionTo = async (workflow, targetStage) => {
      const contact = await platform.entities.Contact.get(workflow.contact_id);

      // Check payment block
      const productionStages = ['Project Active', 'Project In Progress', 'Editing Started', 'Design Started', 'Typesetting Started', 'Printing Started', 'Production Started'];
      if (productionStages.includes(targetStage)) {
        if (workflow.payment_status !== 'paid' && workflow.payment_status !== 'deposit_paid') {
          return {
            allowed: false,
            reason: 'Payment has not been received yet. This project cannot move to production.',
          };
        }
      }

      // Check NDA requirement
      if (workflow.nda_required && workflow.nda_status !== 'signed') {
        const ndaStages = ['NDA Signed', 'Invoice Required', 'Invoice Sent', 'Payment Received'];
        if (ndaStages.includes(targetStage)) {
          return {
            allowed: false,
            reason: 'NDA must be signed before proceeding.',
          };
        }
      }

      // Check quote requirement
      if (workflow.quote_status !== 'accepted') {
        const quoteStages = ['Quote Accepted', 'NDA Required', 'NDA Sent', 'Invoice Required'];
        if (quoteStages.includes(targetStage)) {
          return {
            allowed: false,
            reason: 'Quote must be accepted before proceeding.',
          };
        }
      }

      return { allowed: true };
    };

    // Execute workflow action
    if (action === 'advance_stage') {
      const workflow = workflow_id 
        ? await platform.entities.ClientWorkflow.get(workflow_id)
        : (await getOrCreateWorkflow(contact_id, data?.service_type));
      
      const targetStage = data?.stage;
      if (!targetStage) {
        return Response.json({ error: 'Target stage required' }, { status: 400 });
      }

      // Check if transition is allowed
      const transitionCheck = await canTransitionTo(workflow, targetStage);
      if (!transitionCheck.allowed) {
        return Response.json({
          success: false,
          blocked: true,
          reason: transitionCheck.reason,
        });
      }

      // Update workflow stage (this also sends email notification)
      const result = await updateStage(workflow, targetStage, user.email);
      
      // Update contact pipeline stage to match workflow
      const contactStageMap = {
        'New Enquiry': 'New Enquiry',
        'Reviewed by Admin': 'Information Requested',
        'Quote Required': 'Quote in Progress',
        'Quote Sent': 'Quote Sent',
        'Quote Viewed': 'Quote Sent',
        'Quote Accepted': 'Quote Accepted',
        'NDA Required': 'Payment Pending',
        'NDA Sent': 'Payment Pending',
        'NDA Signed': 'Payment Pending',
        'Invoice Required': 'Payment Pending',
        'Invoice Sent': 'Payment Pending',
        'Payment Pending': 'Payment Pending',
        'Payment Received': 'Project Started',
        'Project Active': 'Project Started',
        'Project In Progress': 'Editing',
        'Client Review': 'Cover Design',
        'Final Approval': 'Typesetting',
        'Ready for Production': 'Mass Production',
        'Completed': 'Completed',
      };
      
      const contactStage = contactStageMap[targetStage] || targetStage;
      const previousStage = workflow.current_stage;
      
      await platform.entities.Contact.update(workflow.contact_id, {
        pipeline_stage: contactStage,
        pipeline_stage_changed_at: new Date().toISOString(),
      });
      
      // Get updated workflow
      const updatedWorkflow = await platform.entities.ClientWorkflow.get(workflow.id);

      // Log the stage change for tracking
      console.log(`Workflow stage changed: ${previousStage} → ${targetStage} | Pipeline updated to: ${contactStage}`);

      // Get contact for email notification
      const contact = await platform.entities.Contact.get(workflow.contact_id);
      
      // Email templates for key stages
      const emailTemplates = {
        'Quote Sent': {
          subject: `Your Quote is Ready - ${contact.book_title || 'Your Book Project'}`,
          body: `Dear ${contact.full_name || 'Author'},\n\nYour quote for "${contact.book_title || 'your book project'}" is now ready and has been sent to you.\n\nPlease review the quote at your earliest convenience. If you have any questions or would like to discuss the package further, please don't hesitate to contact us.\n\nWe look forward to helping you bring your book to life!\n\nWarm regards,\nCreative Books SA\n084 230 5393`
        },
        'Quote Accepted': {
          subject: `Quote Accepted - Next Steps for ${contact.book_title || 'Your Book'}`,
          body: `Dear ${contact.full_name || 'Author'},\n\nThank you for accepting our quote for "${contact.book_title || 'your book project'}".\n\nWe're excited to begin working with you! The next step is ${workflow.nda_required ? 'to prepare and send you an NDA (Non-Disclosure Agreement) for signing.' : 'to prepare and send you an invoice.'}\n\nWe'll be in touch shortly with the necessary documents.\n\nWarm regards,\nCreative Books SA`
        },
        'Payment Received': {
          subject: `Payment Received - Let's Start Your Book!`,
          body: `Dear ${contact.full_name || 'Author'},\n\nWe've received your payment for "${contact.book_title || 'your book project'}".\n\nCongratulations! Your project is now starting. Our team will begin working on your book and we'll keep you updated every step of the way.\n\nYou'll receive regular updates as we progress through each stage of the publishing process.\n\nExciting times ahead!\nCreative Books SA`
        },
        'Project Active': {
          subject: `Your Project Has Started!`,
          body: `Dear ${contact.full_name || 'Author'},\n\nGreat news! Your project "${contact.book_title || 'your book'}" is now active and our team has begun working on it.\n\nWe'll keep you informed of our progress and will be in touch if we need any additional information from you.\n\nThank you for choosing Creative Books SA.\n\nWarm regards,\nThe Creative Books SA Team`
        },
        'Completed': {
          subject: `Congratulations - Your Book Project is Complete!`,
          body: `Dear ${contact.full_name || 'Author'},\n\nCongratulations! Your book project "${contact.book_title || 'your book'}" is now complete.\n\nIt's been a pleasure working with you to bring your book to life. We hope you're thrilled with the final result.\n\nIf you need any additional services or have questions about your next project, please don't hesitate to reach out.\n\nWarmest congratulations on your achievement!\nCreative Books SA`
        }
      };

      // Send email notification for key stages using branded format
      const triggeredActions = [];
      const emailTemplate = emailTemplates[targetStage];
      if (emailTemplate && contact.email && workflow.automation_enabled !== false) {
        try {
          await platform.functions.invoke('sendBrandedEmail', {
            to: contact.email,
            subject: emailTemplate.subject,
            htmlBody: `<p style="white-space: pre-line; font-size: 16px; line-height: 1.6;">${emailTemplate.body}</p>`,
          });
          
          triggeredActions.push({
            action: 'email_sent',
            template: targetStage,
            to: contact.email,
          });
        } catch (emailError) {
          console.error('Failed to send stage update email:', emailError);
        }
      }

      return Response.json({
        success: true,
        workflow: updatedWorkflow || workflow,
        triggered_actions: triggeredActions,
        email_sent: !!emailTemplate,
        pipeline_updated: contactStage,
      });
    }

    // Create quote from workflow
    if (action === 'create_quote') {
      const workflow = await platform.entities.ClientWorkflow.get(workflow_id);
      const contact = await platform.entities.Contact.get(workflow.contact_id);
      
      // Create quote with contact details
      const quote = await platform.entities.Quote.create({
        contact_id: contact.id,
        contact_snapshot: {
          full_name: contact.full_name,
          email: contact.email,
          phone: contact.phone,
          company: contact.company,
        },
        book_title: contact.book_title,
        service_category: workflow.service_type,
        status: 'Draft',
        mode: 'standard',
      });

      // Link quote to workflow
      await platform.entities.ClientWorkflow.update(workflow.id, {
        quote_id: quote.id,
        quote_status: 'draft',
        next_action: 'Send Quote to Client',
      });

      return Response.json({
        success: true,
        quote,
        message: 'Quote created. Ready to send.',
      });
    }

    // Create invoice from accepted quote
    if (action === 'create_invoice') {
      const workflow = await platform.entities.ClientWorkflow.get(workflow_id);
      
      if (!workflow.quote_id) {
        return Response.json({ error: 'No quote linked to workflow' }, { status: 400 });
      }

      const quote = await platform.entities.Quote.get(workflow.quote_id);
      const contact = await platform.entities.Contact.get(workflow.contact_id);

      // Create invoice from quote
      const invoice = await platform.entities.Invoice.create({
        contact_id: contact.id,
        quote_id: quote.id,
        contact_snapshot: {
          full_name: contact.full_name,
          email: contact.email,
          phone: contact.phone,
          company: contact.company,
        },
        book_title: quote.book_title,
        line_items: quote.line_items || [],
        subtotal: quote.subtotal || 0,
        vat_rate: quote.vat_rate || 15,
        vat_amount: quote.vat_amount || 0,
        total: quote.total || 0,
        balance_due: quote.total || 0,
        status: 'Draft',
        issue_date: new Date().toISOString().split('T')[0],
      });

      // Update workflow
      await platform.entities.ClientWorkflow.update(workflow.id, {
        invoice_id: invoice.id,
        invoice_status: 'draft',
        next_action: 'Send Invoice to Client',
      });

      return Response.json({
        success: true,
        invoice,
        message: 'Invoice created from quote. Ready to send.',
      });
    }

    // Record payment
    if (action === 'record_payment') {
      const workflow = await platform.entities.ClientWorkflow.get(workflow_id);
      
      if (!workflow.invoice_id) {
        return Response.json({ error: 'No invoice linked' }, { status: 400 });
      }

      const invoice = await platform.entities.Invoice.get(workflow.invoice_id);
      const paymentAmount = data?.amount || invoice.balance_due;

      // Create payment record
      const payment = await platform.entities.Payment.create({
        invoice_id: invoice.id,
        contact_id: invoice.contact_id,
        amount: paymentAmount,
        payment_date: data?.payment_date || new Date().toISOString().split('T')[0],
        payment_method: data?.payment_method || 'EFT',
        reference: data?.reference,
      });

      // Create receipt
      const receipt = await platform.entities.Receipt.create({
        payment_id: payment.id,
        invoice_id: invoice.id,
        contact_id: invoice.contact_id,
        amount_paid: paymentAmount,
        invoice_total: invoice.total,
        balance_after: invoice.balance_due - paymentAmount,
        payment_date: payment.payment_date,
        payment_method: payment.payment_method,
      });

      // Update invoice
      const newBalance = invoice.balance_due - paymentAmount;
      await platform.entities.Invoice.update(invoice.id, {
        amount_paid: (invoice.amount_paid || 0) + paymentAmount,
        balance_due: newBalance,
        status: newBalance <= 0 ? 'Paid' : 'Partially Paid',
        paid_at: newBalance <= 0 ? new Date().toISOString() : undefined,
      });

      // Update workflow
      const paymentStatus = newBalance <= 0 ? 'paid' : (paymentAmount >= invoice.total * 0.5 ? 'deposit_paid' : 'partially_paid');
      await platform.entities.ClientWorkflow.update(workflow.id, {
        payment_status: paymentStatus,
        payment_received_at: new Date().toISOString(),
        next_action: newBalance <= 0 ? 'Start Project Production' : 'Await Balance Payment',
      });

      // Update contact pipeline
      await platform.entities.Contact.update(workflow.contact_id, {
        pipeline_stage: 'Payment Received',
        pipeline_stage_changed_at: new Date().toISOString(),
      });

      return Response.json({
        success: true,
        payment,
        receipt,
        invoice_balance: newBalance,
        message: paymentStatus === 'paid' ? 'Payment received in full. Project can now start.' : 'Deposit received. Project can now start.',
      });
    }

    // Get workflow status
    if (action === 'get_workflow') {
      const workflows = await platform.entities.ClientWorkflow.filter({ contact_id });
      if (workflows.length === 0) {
        return Response.json({ workflow: null, exists: false });
      }
      
      const workflow = workflows[0];
      const contact = await platform.entities.Contact.get(workflow.contact_id);
      
      // Get linked records
      const quote = workflow.quote_id ? await platform.entities.Quote.get(workflow.quote_id) : null;
      const invoice = workflow.invoice_id ? await platform.entities.Invoice.get(workflow.invoice_id) : null;
      const project = workflow.project_id ? await platform.entities.Project.get(workflow.project_id) : null;
      const ndaDoc = workflow.nda_document_id ? await platform.entities.Document.get(workflow.nda_document_id) : null;

      return Response.json({
        workflow,
        contact,
        quote,
        invoice,
        project,
        nda_document: ndaDoc,
        exists: true,
      });
    }

    // Initialize workflow for contact
    if (action === 'initialize') {
      const serviceType = data?.service_type || 'Full Publishing Package';
      const workflow = await getOrCreateWorkflow(contact_id, serviceType);
      
      // Determine if NDA is required based on service type
      const ndaRequiredServices = ['Ghostwriting', 'Full Publishing Package', 'Manuscript Evaluation'];
      const requiresNDA = ndaRequiredServices.includes(serviceType);

      await platform.entities.ClientWorkflow.update(workflow.id, {
        service_type: serviceType,
        nda_required: requiresNDA,
        next_action: 'Review Enquiry and Prepare Quote',
      });

      return Response.json({
        success: true,
        workflow,
        nda_required: requiresNDA,
        message: `Workflow initialized for ${serviceType}${requiresNDA ? ' (NDA required)' : ''}`,
      });
    }

    return Response.json({ error: 'Unknown action' }, { status: 400 });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});