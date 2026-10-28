export const models = {
  "Invoice": {
    "table": "invoice",
    "defaults": {
      "status": "Draft",
      "subtotal": 0,
      "vat_rate": 15,
      "vat_amount": 0,
      "include_vat": true,
      "total": 0,
      "amount_paid": 0,
      "balance_due": 0,
      "payment_terms": "Payment due within 7 days of invoice date.",
      "invoice_email_sent": false,
      "invoice_confirmed_by_admin": false,
      "automation_state": "Invoice Generated",
      "nda_sent": false,
      "portal_login_sent": false,
      "acceptance_email_sent": false
    }
  },
  "CampaignRecipient": {
    "table": "campaign_recipient",
    "defaults": {
      "status": "pending"
    }
  },
  "BookingService": {
    "table": "booking_service",
    "defaults": {
      "duration_minutes": 30,
      "buffer_minutes": 15,
      "is_active": true,
      "sort_order": 0
    }
  },
  "Author": {
    "table": "author",
    "defaults": {
      "marketing_permissions": false,
      "testimonial_approved": false,
      "is_vip": false,
      "total_books_printed": 0
    }
  },
  "Note": {
    "table": "note",
    "defaults": {}
  },
  "Appointment": {
    "table": "appointment",
    "defaults": {
      "status": "pending",
      "reminder_24h_sent": false,
      "reminder_5h_sent": false,
      "reminder_1h_sent": false
    }
  },
  "WorkflowExecution": {
    "table": "workflow_execution",
    "defaults": {
      "status": "Pending",
      "current_step": 0
    }
  },
  "Document": {
    "table": "document",
    "defaults": {
      "is_template": false,
      "is_favourite": false,
      "template_status": "Draft Template",
      "requires_signature": false,
      "access_revoked": false,
      "category": "Client Supplied",
      "status": "Draft",
      "version": 1,
      "is_latest_version": true,
      "download_count": 0,
      "open_count": 0,
      "reminder_sent_count": 0,
      "nda_signed": false,
      "nda_signed_admin_notification_sent": false,
      "nda_signed_client_confirmation_sent": false,
      "nda_signed_whatsapp_notification_sent": false
    }
  },
  "AvailabilityRule": {
    "table": "availability_rule",
    "defaults": {
      "is_open": true,
      "min_notice_hours": 24
    }
  },
  "ClientServiceProject": {
    "table": "client_service_project",
    "defaults": {
      "status": "active",
      "total_emails_sent": 0,
      "welcome_email_sent": false
    }
  },
  "ActivityLog": {
    "table": "activity_log",
    "defaults": {}
  },
  "ProjectUpdate": {
    "table": "project_update",
    "defaults": {
      "email_sent": false
    }
  },
  "BookRecord": {
    "table": "book_record",
    "defaults": {
      "reprint_count": 0,
      "project_status": "In Progress"
    }
  },
  "MessageQueue": {
    "table": "message_queue",
    "defaults": {
      "channel": "email",
      "status": "pending_approval",
      "triggered_by": "automation",
      "retry_count": 0
    }
  },
  "OnboardingChecklist": {
    "table": "onboarding_checklist",
    "defaults": {
      "status": "Active",
      "steps": [
        {
          "key": "quote_accepted",
          "label": "Quote Accepted",
          "status": "pending"
        },
        {
          "key": "invoice_sent",
          "label": "Invoice Sent",
          "status": "pending"
        },
        {
          "key": "payment_received",
          "label": "Payment Received",
          "status": "pending"
        },
        {
          "key": "nda_sent",
          "label": "NDA Sent",
          "status": "pending"
        },
        {
          "key": "nda_signed",
          "label": "NDA Signed",
          "status": "pending"
        },
        {
          "key": "portal_access_sent",
          "label": "Portal Access Sent",
          "status": "pending"
        },
        {
          "key": "project_kickoff",
          "label": "Project Kicked Off",
          "status": "pending"
        },
        {
          "key": "first_update_sent",
          "label": "First Update Sent to Client",
          "status": "pending"
        }
      ],
      "progress_percent": 0
    }
  },
  "CoverDesignEnquiry": {
    "table": "cover_design_enquiry",
    "defaults": {
      "status": "new"
    }
  },
  "Payment": {
    "table": "payment",
    "defaults": {
      "amount": 0,
      "payment_method": "EFT"
    }
  },
  "Task": {
    "table": "task",
    "defaults": {
      "task_type": "General",
      "priority": "Medium",
      "status": "Pending"
    }
  },
  "WorkflowTemplate": {
    "table": "workflow_template",
    "defaults": {
      "is_active": true,
      "is_public": false,
      "version": 1
    }
  },
  "ESignatureRequest": {
    "table": "e_signature_request",
    "defaults": {
      "signing_order": "admin_first",
      "status": "Draft",
      "allow_download_before_sign": true,
      "allow_download_after_sign": true,
      "send_whatsapp": false,
      "reminder_sent_count": 0,
      "consent_read": false,
      "consent_identity": false,
      "consent_authorised": false,
      "consent_electronic": false,
      "consent_submit": false,
      "open_count": 0
    }
  },
  "LeadScore": {
    "table": "lead_score",
    "defaults": {
      "score": 0,
      "grade": "Cold"
    }
  },
  "ClientDelay": {
    "table": "client_delay",
    "defaults": {
      "days_delayed": 0,
      "resolved": false,
      "notified_client": false
    }
  },
  "Pipeline": {
    "table": "pipeline",
    "defaults": {
      "pipeline_type": "sales",
      "is_active": true,
      "is_default": false,
      "entity_type": "contact"
    }
  },
  "EmailCampaign": {
    "table": "email_campaign",
    "defaults": {
      "status": "Draft",
      "campaign_type": "Newsletter",
      "total_recipients": 0,
      "total_sent": 0,
      "total_delivered": 0,
      "total_opened": 0,
      "total_clicked": 0,
      "total_bounced": 0,
      "total_unsubscribed": 0,
      "open_rate": 0,
      "click_rate": 0
    }
  },
  "PurchaseOrder": {
    "table": "purchase_order",
    "defaults": {
      "status": "Draft",
      "subtotal": 0,
      "vat_rate": 15,
      "vat_amount": 0,
      "total": 0,
      "payment_terms": "Payment due within 30 days",
      "payment_status": "Unpaid"
    }
  },
  "QuotePackage": {
    "table": "quote_package",
    "defaults": {
      "total_price": 0,
      "is_recommended": false,
      "sort_order": 0
    }
  },
  "Notification": {
    "table": "notification",
    "defaults": {
      "type": "info",
      "category": "system",
      "priority": "medium",
      "is_read": false,
      "is_snoozed": false
    }
  },
  "ProductionJob": {
    "table": "production_job",
    "defaults": {
      "status": "Queued",
      "priority": "Normal",
      "colour_type": "Black & White",
      "quality_check_passed": false,
      "total_material_cost": 0,
      "labor_hours": 0,
      "labor_cost": 0,
      "total_production_cost": 0
    }
  },
  "Material": {
    "table": "material",
    "defaults": {
      "unit_of_measure": "sheets",
      "cost_per_unit": 0,
      "current_stock": 0,
      "is_active": true
    }
  },
  "CoverReview": {
    "table": "cover_review",
    "defaults": {}
  },
  "QuoteLineItem": {
    "table": "quote_line_item",
    "defaults": {
      "quantity": 1,
      "unit_price": 0,
      "line_total": 0,
      "sort_order": 0,
      "is_optional": false,
      "is_selected": true
    }
  },
  "MessageTemplate": {
    "table": "message_template",
    "defaults": {
      "channel": "email",
      "category": "general",
      "is_active": true,
      "is_default": false,
      "sort_order": 0
    }
  },
  "ClientWorkflow": {
    "table": "client_workflow",
    "defaults": {
      "nda_required": false,
      "nda_signed": false,
      "automation_enabled": true
    }
  },
  "Clause": {
    "table": "clause",
    "defaults": {
      "category": "General",
      "is_active": true,
      "sort_order": 0
    }
  },
  "ServiceEmailLog": {
    "table": "service_email_log",
    "defaults": {
      "status": "sent",
      "is_welcome_email": false
    }
  },
  "Receipt": {
    "table": "receipt",
    "defaults": {
      "amount_paid": 0,
      "balance_after": 0,
      "invoice_total": 0
    }
  },
  "Quote": {
    "table": "quote",
    "defaults": {
      "mode": "standard",
      "status": "Draft",
      "subtotal": 0,
      "discount_amount": 0,
      "vat_rate": 15,
      "vat_amount": 0,
      "total": 0,
      "include_vat": true,
      "deposit_required": false,
      "follow_up_sent": false
    }
  },
  "QuoteViewSession": {
    "table": "quote_view_session",
    "defaults": {
      "time_on_page_seconds": 0,
      "came_from_email": false
    }
  },
  "User": {
    "table": "user",
    "defaults": {
      "role": "standard_user"
    }
  },
  "QuoteSignature": {
    "table": "quote_signature",
    "defaults": {
      "legal_acknowledgment_checked": false
    }
  },
  "WorkflowRule": {
    "table": "workflow_rule",
    "defaults": {
      "requires_quote": true,
      "requires_nda": false,
      "requires_invoice": true,
      "requires_deposit": false,
      "deposit_percentage": 50,
      "block_production_until_paid": true,
      "auto_send_email": false,
      "is_active": true
    }
  },
  "ProofApproval": {
    "table": "proof_approval",
    "defaults": {
      "status": "pending",
      "reminder_sent": false
    }
  },
  "Project": {
    "table": "project",
    "defaults": {
      "service_type": "Full Publishing Package",
      "stage": "Enquiry Received",
      "waiting_on": "None",
      "project_value": 0,
      "payment_status": "Unpaid",
      "contract_status": "Not Sent",
      "is_vip": false,
      "is_at_risk": false,
      "automation_enabled": false,
      "updates_paused": false
    }
  },
  "ServiceWorkflow": {
    "table": "service_workflow",
    "defaults": {
      "requires_quote": true,
      "requires_nda": false,
      "requires_invoice": true,
      "requires_deposit": false,
      "deposit_percentage": 50,
      "block_production_until_paid": true,
      "is_active": true
    }
  },
  "DocumentActivity": {
    "table": "document_activity",
    "defaults": {
      "actor_type": "client"
    }
  },
  "PipelineStageHistory": {
    "table": "pipeline_stage_history",
    "defaults": {}
  },
  "QuoteService": {
    "table": "quote_service",
    "defaults": {
      "is_active": true,
      "category": "other",
      "sort_order": 0
    }
  },
  "EmailMessage": {
    "table": "email_message",
    "defaults": {
      "opened": false,
      "clicked": false
    }
  },
  "PipelineDeal": {
    "table": "pipeline_deal",
    "defaults": {
      "project_creation_failed": false
    }
  },
  "AutomationRule": {
    "table": "automation_rule",
    "defaults": {
      "requires_approval": false,
      "delay_minutes": 0,
      "is_active": true,
      "run_count": 0,
      "sort_order": 0
    }
  },
  "QuoteSavedProgress": {
    "table": "quote_saved_progress",
    "defaults": {}
  },
  "FileRequest": {
    "table": "file_request",
    "defaults": {
      "status": "requested"
    }
  },
  "PipelineTemplate": {
    "table": "pipeline_template",
    "defaults": {
      "is_default": false
    }
  },
  "ClientPortalAccess": {
    "table": "client_portal_access",
    "defaults": {
      "is_active": true,
      "access_count": 0
    }
  },
  "AppSettings": {
    "table": "app_settings",
    "defaults": {
      "email_provider": "resend",
      "sender_name": "Creative Books SA",
      "sender_email": "info@creativebooks.co.za",
      "reply_to": "info@creativebooks.co.za",
      "is_configured": false
    }
  },
  "Lead": {
    "table": "lead",
    "defaults": {
      "stage": "new"
    }
  },
  "CollectionSignature": {
    "table": "collection_signature",
    "defaults": {
      "fully_paid_at_collection": false
    }
  },
  "EmailTemplate": {
    "table": "email_template",
    "defaults": {
      "category": "general",
      "is_active": true,
      "sort_order": 0
    }
  },
  "SalesPipeline": {
    "table": "sales_pipeline",
    "defaults": {
      "is_active": true
    }
  },
  "NurtureSequence": {
    "table": "nurture_sequence",
    "defaults": {
      "trigger": "manual",
      "is_active": true,
      "total_enrolled": 0,
      "total_completed": 0
    }
  },
  "CoverSpec": {
    "table": "cover_spec",
    "defaults": {}
  },
  "MessageLog": {
    "table": "message_log",
    "defaults": {
      "channel": "email",
      "success": true,
      "triggered_by": "automation"
    }
  },
  "PortalMessage": {
    "table": "portal_message",
    "defaults": {
      "is_read": false,
      "internal_note": false
    }
  },
  "CreditNote": {
    "table": "credit_note",
    "defaults": {
      "subtotal": 0,
      "vat_rate": 15,
      "vat_amount": 0,
      "total": 0
    }
  },
  "Contract": {
    "table": "contract",
    "defaults": {
      "document_type": "Contract",
      "status": "Draft",
      "reminder_count": 0,
      "legal_consent_checked": false
    }
  },
  "CompanySettings": {
    "table": "company_settings",
    "defaults": {
      "setting_key": "main",
      "company_name": "Creative Books SA",
      "email": "info@creativebooks.co.za",
      "currency": "ZAR",
      "currency_symbol": "R",
      "default_vat_rate": 15,
      "quote_validity_days": 30,
      "signature_label": "Authorized Signature",
      "brand_color_primary": "#B87333",
      "brand_color_secondary": "#D4A574",
      "enable_whatsapp_notifications": true,
      "enable_email_notifications": true
    }
  },
  "ResourceDocument": {
    "table": "resource_document",
    "defaults": {
      "category": "Other",
      "file_type": "PDF",
      "is_featured": false,
      "download_count": 0,
      "sort_order": 0,
      "is_active": true
    }
  },
  "Service": {
    "table": "service",
    "defaults": {
      "active": true
    }
  },
  "Submission": {
    "table": "submission",
    "defaults": {
      "status": "new"
    }
  },
  "Contact": {
    "table": "contact",
    "defaults": {
      "is_disabled": false,
      "country": "South Africa",
      "lifecycle_stage": "lead",
      "pipeline_stage": "New Enquiry",
      "do_not_contact": false,
      "unsubscribed": false,
      "followup_response_received": false
    }
  },
  "RecurringInvoice": {
    "table": "recurring_invoice",
    "defaults": {}
  }
};
