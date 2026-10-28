-- Creative Books SA: empty Supabase schema. No live records are imported.
begin;
create schema if not exists cb_private;
revoke all on schema cb_private from public;
grant usage on schema cb_private to anon, authenticated, service_role;
create table cb_private.entity_registry (table_name text primary key);
create table public."user" (
 id text primary key default gen_random_uuid()::text,
 data jsonb not null default '{}'::jsonb check (jsonb_typeof(data) = 'object'),
 created_date timestamptz not null default now(),
 updated_date timestamptz not null default now(),
 created_by text default (auth.jwt()->>'email')
);
alter table public."user" enable row level security;
create index "user_data_gin" on public."user" using gin (data jsonb_path_ops);
create index "user_created_idx" on public."user" (created_date desc, id);
insert into cb_private.entity_registry values ('user');
grant select, insert, update, delete on public."user" to authenticated, service_role;
create table public."invoice" (
 id text primary key default gen_random_uuid()::text,
 data jsonb not null default '{}'::jsonb check (jsonb_typeof(data) = 'object'),
 created_date timestamptz not null default now(),
 updated_date timestamptz not null default now(),
 created_by text default (auth.jwt()->>'email')
);
alter table public."invoice" enable row level security;
create index "invoice_data_gin" on public."invoice" using gin (data jsonb_path_ops);
create index "invoice_created_idx" on public."invoice" (created_date desc, id);
insert into cb_private.entity_registry values ('invoice');
grant select, insert, update, delete on public."invoice" to authenticated, service_role;
create index "invoice_contact_id_idx" on public."invoice" ((data->>'contact_id'));
create index "invoice_quote_id_idx" on public."invoice" ((data->>'quote_id'));
create index "invoice_status_idx" on public."invoice" ((data->>'status'));
create index "invoice_view_token_idx" on public."invoice" ((data->>'view_token'));
create table public."campaign_recipient" (
 id text primary key default gen_random_uuid()::text,
 data jsonb not null default '{}'::jsonb check (jsonb_typeof(data) = 'object'),
 created_date timestamptz not null default now(),
 updated_date timestamptz not null default now(),
 created_by text default (auth.jwt()->>'email')
);
alter table public."campaign_recipient" enable row level security;
create index "campaign_recipient_data_gin" on public."campaign_recipient" using gin (data jsonb_path_ops);
create index "campaign_recipient_created_idx" on public."campaign_recipient" (created_date desc, id);
insert into cb_private.entity_registry values ('campaign_recipient');
grant select, insert, update, delete on public."campaign_recipient" to authenticated, service_role;
create index "campaign_recipient_contact_id_idx" on public."campaign_recipient" ((data->>'contact_id'));
create index "campaign_recipient_email_idx" on public."campaign_recipient" ((data->>'email'));
create index "campaign_recipient_status_idx" on public."campaign_recipient" ((data->>'status'));
create table public."booking_service" (
 id text primary key default gen_random_uuid()::text,
 data jsonb not null default '{}'::jsonb check (jsonb_typeof(data) = 'object'),
 created_date timestamptz not null default now(),
 updated_date timestamptz not null default now(),
 created_by text default (auth.jwt()->>'email')
);
alter table public."booking_service" enable row level security;
create index "booking_service_data_gin" on public."booking_service" using gin (data jsonb_path_ops);
create index "booking_service_created_idx" on public."booking_service" (created_date desc, id);
insert into cb_private.entity_registry values ('booking_service');
grant select, insert, update, delete on public."booking_service" to authenticated, service_role;
create table public."author" (
 id text primary key default gen_random_uuid()::text,
 data jsonb not null default '{}'::jsonb check (jsonb_typeof(data) = 'object'),
 created_date timestamptz not null default now(),
 updated_date timestamptz not null default now(),
 created_by text default (auth.jwt()->>'email')
);
alter table public."author" enable row level security;
create index "author_data_gin" on public."author" using gin (data jsonb_path_ops);
create index "author_created_idx" on public."author" (created_date desc, id);
insert into cb_private.entity_registry values ('author');
grant select, insert, update, delete on public."author" to authenticated, service_role;
create index "author_contact_id_idx" on public."author" ((data->>'contact_id'));
create index "author_email_idx" on public."author" ((data->>'email'));
create table public."note" (
 id text primary key default gen_random_uuid()::text,
 data jsonb not null default '{}'::jsonb check (jsonb_typeof(data) = 'object'),
 created_date timestamptz not null default now(),
 updated_date timestamptz not null default now(),
 created_by text default (auth.jwt()->>'email')
);
alter table public."note" enable row level security;
create index "note_data_gin" on public."note" using gin (data jsonb_path_ops);
create index "note_created_idx" on public."note" (created_date desc, id);
insert into cb_private.entity_registry values ('note');
grant select, insert, update, delete on public."note" to authenticated, service_role;
create table public."appointment" (
 id text primary key default gen_random_uuid()::text,
 data jsonb not null default '{}'::jsonb check (jsonb_typeof(data) = 'object'),
 created_date timestamptz not null default now(),
 updated_date timestamptz not null default now(),
 created_by text default (auth.jwt()->>'email')
);
alter table public."appointment" enable row level security;
create index "appointment_data_gin" on public."appointment" using gin (data jsonb_path_ops);
create index "appointment_created_idx" on public."appointment" (created_date desc, id);
insert into cb_private.entity_registry values ('appointment');
grant select, insert, update, delete on public."appointment" to authenticated, service_role;
create index "appointment_status_idx" on public."appointment" ((data->>'status'));
create table public."workflow_execution" (
 id text primary key default gen_random_uuid()::text,
 data jsonb not null default '{}'::jsonb check (jsonb_typeof(data) = 'object'),
 created_date timestamptz not null default now(),
 updated_date timestamptz not null default now(),
 created_by text default (auth.jwt()->>'email')
);
alter table public."workflow_execution" enable row level security;
create index "workflow_execution_data_gin" on public."workflow_execution" using gin (data jsonb_path_ops);
create index "workflow_execution_created_idx" on public."workflow_execution" (created_date desc, id);
insert into cb_private.entity_registry values ('workflow_execution');
grant select, insert, update, delete on public."workflow_execution" to authenticated, service_role;
create index "workflow_execution_status_idx" on public."workflow_execution" ((data->>'status'));
create table public."document" (
 id text primary key default gen_random_uuid()::text,
 data jsonb not null default '{}'::jsonb check (jsonb_typeof(data) = 'object'),
 created_date timestamptz not null default now(),
 updated_date timestamptz not null default now(),
 created_by text default (auth.jwt()->>'email')
);
alter table public."document" enable row level security;
create index "document_data_gin" on public."document" using gin (data jsonb_path_ops);
create index "document_created_idx" on public."document" (created_date desc, id);
insert into cb_private.entity_registry values ('document');
grant select, insert, update, delete on public."document" to authenticated, service_role;
create index "document_contact_id_idx" on public."document" ((data->>'contact_id'));
create index "document_project_id_idx" on public."document" ((data->>'project_id'));
create index "document_quote_id_idx" on public."document" ((data->>'quote_id'));
create index "document_invoice_id_idx" on public."document" ((data->>'invoice_id'));
create index "document_status_idx" on public."document" ((data->>'status'));
create index "document_secure_token_idx" on public."document" ((data->>'secure_token'));
create table public."availability_rule" (
 id text primary key default gen_random_uuid()::text,
 data jsonb not null default '{}'::jsonb check (jsonb_typeof(data) = 'object'),
 created_date timestamptz not null default now(),
 updated_date timestamptz not null default now(),
 created_by text default (auth.jwt()->>'email')
);
alter table public."availability_rule" enable row level security;
create index "availability_rule_data_gin" on public."availability_rule" using gin (data jsonb_path_ops);
create index "availability_rule_created_idx" on public."availability_rule" (created_date desc, id);
insert into cb_private.entity_registry values ('availability_rule');
grant select, insert, update, delete on public."availability_rule" to authenticated, service_role;
create table public."client_service_project" (
 id text primary key default gen_random_uuid()::text,
 data jsonb not null default '{}'::jsonb check (jsonb_typeof(data) = 'object'),
 created_date timestamptz not null default now(),
 updated_date timestamptz not null default now(),
 created_by text default (auth.jwt()->>'email')
);
alter table public."client_service_project" enable row level security;
create index "client_service_project_data_gin" on public."client_service_project" using gin (data jsonb_path_ops);
create index "client_service_project_created_idx" on public."client_service_project" (created_date desc, id);
insert into cb_private.entity_registry values ('client_service_project');
grant select, insert, update, delete on public."client_service_project" to authenticated, service_role;
create index "client_service_project_status_idx" on public."client_service_project" ((data->>'status'));
create table public."activity_log" (
 id text primary key default gen_random_uuid()::text,
 data jsonb not null default '{}'::jsonb check (jsonb_typeof(data) = 'object'),
 created_date timestamptz not null default now(),
 updated_date timestamptz not null default now(),
 created_by text default (auth.jwt()->>'email')
);
alter table public."activity_log" enable row level security;
create index "activity_log_data_gin" on public."activity_log" using gin (data jsonb_path_ops);
create index "activity_log_created_idx" on public."activity_log" (created_date desc, id);
insert into cb_private.entity_registry values ('activity_log');
grant select, insert, update, delete on public."activity_log" to authenticated, service_role;
create table public."project_update" (
 id text primary key default gen_random_uuid()::text,
 data jsonb not null default '{}'::jsonb check (jsonb_typeof(data) = 'object'),
 created_date timestamptz not null default now(),
 updated_date timestamptz not null default now(),
 created_by text default (auth.jwt()->>'email')
);
alter table public."project_update" enable row level security;
create index "project_update_data_gin" on public."project_update" using gin (data jsonb_path_ops);
create index "project_update_created_idx" on public."project_update" (created_date desc, id);
insert into cb_private.entity_registry values ('project_update');
grant select, insert, update, delete on public."project_update" to authenticated, service_role;
create index "project_update_contact_id_idx" on public."project_update" ((data->>'contact_id'));
create index "project_update_project_id_idx" on public."project_update" ((data->>'project_id'));
create table public."book_record" (
 id text primary key default gen_random_uuid()::text,
 data jsonb not null default '{}'::jsonb check (jsonb_typeof(data) = 'object'),
 created_date timestamptz not null default now(),
 updated_date timestamptz not null default now(),
 created_by text default (auth.jwt()->>'email')
);
alter table public."book_record" enable row level security;
create index "book_record_data_gin" on public."book_record" using gin (data jsonb_path_ops);
create index "book_record_created_idx" on public."book_record" (created_date desc, id);
insert into cb_private.entity_registry values ('book_record');
grant select, insert, update, delete on public."book_record" to authenticated, service_role;
create index "book_record_contact_id_idx" on public."book_record" ((data->>'contact_id'));
create index "book_record_project_id_idx" on public."book_record" ((data->>'project_id'));
create table public."message_queue" (
 id text primary key default gen_random_uuid()::text,
 data jsonb not null default '{}'::jsonb check (jsonb_typeof(data) = 'object'),
 created_date timestamptz not null default now(),
 updated_date timestamptz not null default now(),
 created_by text default (auth.jwt()->>'email')
);
alter table public."message_queue" enable row level security;
create index "message_queue_data_gin" on public."message_queue" using gin (data jsonb_path_ops);
create index "message_queue_created_idx" on public."message_queue" (created_date desc, id);
insert into cb_private.entity_registry values ('message_queue');
grant select, insert, update, delete on public."message_queue" to authenticated, service_role;
create index "message_queue_project_id_idx" on public."message_queue" ((data->>'project_id'));
create index "message_queue_status_idx" on public."message_queue" ((data->>'status'));
create table public."onboarding_checklist" (
 id text primary key default gen_random_uuid()::text,
 data jsonb not null default '{}'::jsonb check (jsonb_typeof(data) = 'object'),
 created_date timestamptz not null default now(),
 updated_date timestamptz not null default now(),
 created_by text default (auth.jwt()->>'email')
);
alter table public."onboarding_checklist" enable row level security;
create index "onboarding_checklist_data_gin" on public."onboarding_checklist" using gin (data jsonb_path_ops);
create index "onboarding_checklist_created_idx" on public."onboarding_checklist" (created_date desc, id);
insert into cb_private.entity_registry values ('onboarding_checklist');
grant select, insert, update, delete on public."onboarding_checklist" to authenticated, service_role;
create index "onboarding_checklist_contact_id_idx" on public."onboarding_checklist" ((data->>'contact_id'));
create index "onboarding_checklist_quote_id_idx" on public."onboarding_checklist" ((data->>'quote_id'));
create index "onboarding_checklist_invoice_id_idx" on public."onboarding_checklist" ((data->>'invoice_id'));
create index "onboarding_checklist_status_idx" on public."onboarding_checklist" ((data->>'status'));
create table public."cover_design_enquiry" (
 id text primary key default gen_random_uuid()::text,
 data jsonb not null default '{}'::jsonb check (jsonb_typeof(data) = 'object'),
 created_date timestamptz not null default now(),
 updated_date timestamptz not null default now(),
 created_by text default (auth.jwt()->>'email')
);
alter table public."cover_design_enquiry" enable row level security;
create index "cover_design_enquiry_data_gin" on public."cover_design_enquiry" using gin (data jsonb_path_ops);
create index "cover_design_enquiry_created_idx" on public."cover_design_enquiry" (created_date desc, id);
insert into cb_private.entity_registry values ('cover_design_enquiry');
grant select, insert, update, delete on public."cover_design_enquiry" to authenticated, service_role;
create index "cover_design_enquiry_email_idx" on public."cover_design_enquiry" ((data->>'email'));
create index "cover_design_enquiry_status_idx" on public."cover_design_enquiry" ((data->>'status'));
create table public."payment" (
 id text primary key default gen_random_uuid()::text,
 data jsonb not null default '{}'::jsonb check (jsonb_typeof(data) = 'object'),
 created_date timestamptz not null default now(),
 updated_date timestamptz not null default now(),
 created_by text default (auth.jwt()->>'email')
);
alter table public."payment" enable row level security;
create index "payment_data_gin" on public."payment" using gin (data jsonb_path_ops);
create index "payment_created_idx" on public."payment" (created_date desc, id);
insert into cb_private.entity_registry values ('payment');
grant select, insert, update, delete on public."payment" to authenticated, service_role;
create index "payment_contact_id_idx" on public."payment" ((data->>'contact_id'));
create index "payment_invoice_id_idx" on public."payment" ((data->>'invoice_id'));
create table public."task" (
 id text primary key default gen_random_uuid()::text,
 data jsonb not null default '{}'::jsonb check (jsonb_typeof(data) = 'object'),
 created_date timestamptz not null default now(),
 updated_date timestamptz not null default now(),
 created_by text default (auth.jwt()->>'email')
);
alter table public."task" enable row level security;
create index "task_data_gin" on public."task" using gin (data jsonb_path_ops);
create index "task_created_idx" on public."task" (created_date desc, id);
insert into cb_private.entity_registry values ('task');
grant select, insert, update, delete on public."task" to authenticated, service_role;
create index "task_contact_id_idx" on public."task" ((data->>'contact_id'));
create index "task_project_id_idx" on public."task" ((data->>'project_id'));
create index "task_status_idx" on public."task" ((data->>'status'));
create table public."workflow_template" (
 id text primary key default gen_random_uuid()::text,
 data jsonb not null default '{}'::jsonb check (jsonb_typeof(data) = 'object'),
 created_date timestamptz not null default now(),
 updated_date timestamptz not null default now(),
 created_by text default (auth.jwt()->>'email')
);
alter table public."workflow_template" enable row level security;
create index "workflow_template_data_gin" on public."workflow_template" using gin (data jsonb_path_ops);
create index "workflow_template_created_idx" on public."workflow_template" (created_date desc, id);
insert into cb_private.entity_registry values ('workflow_template');
grant select, insert, update, delete on public."workflow_template" to authenticated, service_role;
create table public."e_signature_request" (
 id text primary key default gen_random_uuid()::text,
 data jsonb not null default '{}'::jsonb check (jsonb_typeof(data) = 'object'),
 created_date timestamptz not null default now(),
 updated_date timestamptz not null default now(),
 created_by text default (auth.jwt()->>'email')
);
alter table public."e_signature_request" enable row level security;
create index "e_signature_request_data_gin" on public."e_signature_request" using gin (data jsonb_path_ops);
create index "e_signature_request_created_idx" on public."e_signature_request" (created_date desc, id);
insert into cb_private.entity_registry values ('e_signature_request');
grant select, insert, update, delete on public."e_signature_request" to authenticated, service_role;
create index "e_signature_request_contact_id_idx" on public."e_signature_request" ((data->>'contact_id'));
create index "e_signature_request_project_id_idx" on public."e_signature_request" ((data->>'project_id'));
create index "e_signature_request_status_idx" on public."e_signature_request" ((data->>'status'));
create index "e_signature_request_sign_token_idx" on public."e_signature_request" ((data->>'sign_token'));
create table public."lead_score" (
 id text primary key default gen_random_uuid()::text,
 data jsonb not null default '{}'::jsonb check (jsonb_typeof(data) = 'object'),
 created_date timestamptz not null default now(),
 updated_date timestamptz not null default now(),
 created_by text default (auth.jwt()->>'email')
);
alter table public."lead_score" enable row level security;
create index "lead_score_data_gin" on public."lead_score" using gin (data jsonb_path_ops);
create index "lead_score_created_idx" on public."lead_score" (created_date desc, id);
insert into cb_private.entity_registry values ('lead_score');
grant select, insert, update, delete on public."lead_score" to authenticated, service_role;
create index "lead_score_contact_id_idx" on public."lead_score" ((data->>'contact_id'));
create table public."client_delay" (
 id text primary key default gen_random_uuid()::text,
 data jsonb not null default '{}'::jsonb check (jsonb_typeof(data) = 'object'),
 created_date timestamptz not null default now(),
 updated_date timestamptz not null default now(),
 created_by text default (auth.jwt()->>'email')
);
alter table public."client_delay" enable row level security;
create index "client_delay_data_gin" on public."client_delay" using gin (data jsonb_path_ops);
create index "client_delay_created_idx" on public."client_delay" (created_date desc, id);
insert into cb_private.entity_registry values ('client_delay');
grant select, insert, update, delete on public."client_delay" to authenticated, service_role;
create index "client_delay_contact_id_idx" on public."client_delay" ((data->>'contact_id'));
create index "client_delay_project_id_idx" on public."client_delay" ((data->>'project_id'));
create table public."pipeline" (
 id text primary key default gen_random_uuid()::text,
 data jsonb not null default '{}'::jsonb check (jsonb_typeof(data) = 'object'),
 created_date timestamptz not null default now(),
 updated_date timestamptz not null default now(),
 created_by text default (auth.jwt()->>'email')
);
alter table public."pipeline" enable row level security;
create index "pipeline_data_gin" on public."pipeline" using gin (data jsonb_path_ops);
create index "pipeline_created_idx" on public."pipeline" (created_date desc, id);
insert into cb_private.entity_registry values ('pipeline');
grant select, insert, update, delete on public."pipeline" to authenticated, service_role;
create table public."email_campaign" (
 id text primary key default gen_random_uuid()::text,
 data jsonb not null default '{}'::jsonb check (jsonb_typeof(data) = 'object'),
 created_date timestamptz not null default now(),
 updated_date timestamptz not null default now(),
 created_by text default (auth.jwt()->>'email')
);
alter table public."email_campaign" enable row level security;
create index "email_campaign_data_gin" on public."email_campaign" using gin (data jsonb_path_ops);
create index "email_campaign_created_idx" on public."email_campaign" (created_date desc, id);
insert into cb_private.entity_registry values ('email_campaign');
grant select, insert, update, delete on public."email_campaign" to authenticated, service_role;
create index "email_campaign_status_idx" on public."email_campaign" ((data->>'status'));
create table public."purchase_order" (
 id text primary key default gen_random_uuid()::text,
 data jsonb not null default '{}'::jsonb check (jsonb_typeof(data) = 'object'),
 created_date timestamptz not null default now(),
 updated_date timestamptz not null default now(),
 created_by text default (auth.jwt()->>'email')
);
alter table public."purchase_order" enable row level security;
create index "purchase_order_data_gin" on public."purchase_order" using gin (data jsonb_path_ops);
create index "purchase_order_created_idx" on public."purchase_order" (created_date desc, id);
insert into cb_private.entity_registry values ('purchase_order');
grant select, insert, update, delete on public."purchase_order" to authenticated, service_role;
create index "purchase_order_status_idx" on public."purchase_order" ((data->>'status'));
create table public."quote_package" (
 id text primary key default gen_random_uuid()::text,
 data jsonb not null default '{}'::jsonb check (jsonb_typeof(data) = 'object'),
 created_date timestamptz not null default now(),
 updated_date timestamptz not null default now(),
 created_by text default (auth.jwt()->>'email')
);
alter table public."quote_package" enable row level security;
create index "quote_package_data_gin" on public."quote_package" using gin (data jsonb_path_ops);
create index "quote_package_created_idx" on public."quote_package" (created_date desc, id);
insert into cb_private.entity_registry values ('quote_package');
grant select, insert, update, delete on public."quote_package" to authenticated, service_role;
create index "quote_package_quote_id_idx" on public."quote_package" ((data->>'quote_id'));
create table public."notification" (
 id text primary key default gen_random_uuid()::text,
 data jsonb not null default '{}'::jsonb check (jsonb_typeof(data) = 'object'),
 created_date timestamptz not null default now(),
 updated_date timestamptz not null default now(),
 created_by text default (auth.jwt()->>'email')
);
alter table public."notification" enable row level security;
create index "notification_data_gin" on public."notification" using gin (data jsonb_path_ops);
create index "notification_created_idx" on public."notification" (created_date desc, id);
insert into cb_private.entity_registry values ('notification');
grant select, insert, update, delete on public."notification" to authenticated, service_role;
create index "notification_contact_id_idx" on public."notification" ((data->>'contact_id'));
create table public."production_job" (
 id text primary key default gen_random_uuid()::text,
 data jsonb not null default '{}'::jsonb check (jsonb_typeof(data) = 'object'),
 created_date timestamptz not null default now(),
 updated_date timestamptz not null default now(),
 created_by text default (auth.jwt()->>'email')
);
alter table public."production_job" enable row level security;
create index "production_job_data_gin" on public."production_job" using gin (data jsonb_path_ops);
create index "production_job_created_idx" on public."production_job" (created_date desc, id);
insert into cb_private.entity_registry values ('production_job');
grant select, insert, update, delete on public."production_job" to authenticated, service_role;
create index "production_job_contact_id_idx" on public."production_job" ((data->>'contact_id'));
create index "production_job_project_id_idx" on public."production_job" ((data->>'project_id'));
create index "production_job_status_idx" on public."production_job" ((data->>'status'));
create table public."material" (
 id text primary key default gen_random_uuid()::text,
 data jsonb not null default '{}'::jsonb check (jsonb_typeof(data) = 'object'),
 created_date timestamptz not null default now(),
 updated_date timestamptz not null default now(),
 created_by text default (auth.jwt()->>'email')
);
alter table public."material" enable row level security;
create index "material_data_gin" on public."material" using gin (data jsonb_path_ops);
create index "material_created_idx" on public."material" (created_date desc, id);
insert into cb_private.entity_registry values ('material');
grant select, insert, update, delete on public."material" to authenticated, service_role;
create table public."cover_review" (
 id text primary key default gen_random_uuid()::text,
 data jsonb not null default '{}'::jsonb check (jsonb_typeof(data) = 'object'),
 created_date timestamptz not null default now(),
 updated_date timestamptz not null default now(),
 created_by text default (auth.jwt()->>'email')
);
alter table public."cover_review" enable row level security;
create index "cover_review_data_gin" on public."cover_review" using gin (data jsonb_path_ops);
create index "cover_review_created_idx" on public."cover_review" (created_date desc, id);
insert into cb_private.entity_registry values ('cover_review');
grant select, insert, update, delete on public."cover_review" to authenticated, service_role;
create index "cover_review_status_idx" on public."cover_review" ((data->>'status'));
create table public."quote_line_item" (
 id text primary key default gen_random_uuid()::text,
 data jsonb not null default '{}'::jsonb check (jsonb_typeof(data) = 'object'),
 created_date timestamptz not null default now(),
 updated_date timestamptz not null default now(),
 created_by text default (auth.jwt()->>'email')
);
alter table public."quote_line_item" enable row level security;
create index "quote_line_item_data_gin" on public."quote_line_item" using gin (data jsonb_path_ops);
create index "quote_line_item_created_idx" on public."quote_line_item" (created_date desc, id);
insert into cb_private.entity_registry values ('quote_line_item');
grant select, insert, update, delete on public."quote_line_item" to authenticated, service_role;
create index "quote_line_item_quote_id_idx" on public."quote_line_item" ((data->>'quote_id'));
create table public."message_template" (
 id text primary key default gen_random_uuid()::text,
 data jsonb not null default '{}'::jsonb check (jsonb_typeof(data) = 'object'),
 created_date timestamptz not null default now(),
 updated_date timestamptz not null default now(),
 created_by text default (auth.jwt()->>'email')
);
alter table public."message_template" enable row level security;
create index "message_template_data_gin" on public."message_template" using gin (data jsonb_path_ops);
create index "message_template_created_idx" on public."message_template" (created_date desc, id);
insert into cb_private.entity_registry values ('message_template');
grant select, insert, update, delete on public."message_template" to authenticated, service_role;
create table public."client_workflow" (
 id text primary key default gen_random_uuid()::text,
 data jsonb not null default '{}'::jsonb check (jsonb_typeof(data) = 'object'),
 created_date timestamptz not null default now(),
 updated_date timestamptz not null default now(),
 created_by text default (auth.jwt()->>'email')
);
alter table public."client_workflow" enable row level security;
create index "client_workflow_data_gin" on public."client_workflow" using gin (data jsonb_path_ops);
create index "client_workflow_created_idx" on public."client_workflow" (created_date desc, id);
insert into cb_private.entity_registry values ('client_workflow');
grant select, insert, update, delete on public."client_workflow" to authenticated, service_role;
create index "client_workflow_contact_id_idx" on public."client_workflow" ((data->>'contact_id'));
create index "client_workflow_project_id_idx" on public."client_workflow" ((data->>'project_id'));
create index "client_workflow_quote_id_idx" on public."client_workflow" ((data->>'quote_id'));
create index "client_workflow_invoice_id_idx" on public."client_workflow" ((data->>'invoice_id'));
create table public."clause" (
 id text primary key default gen_random_uuid()::text,
 data jsonb not null default '{}'::jsonb check (jsonb_typeof(data) = 'object'),
 created_date timestamptz not null default now(),
 updated_date timestamptz not null default now(),
 created_by text default (auth.jwt()->>'email')
);
alter table public."clause" enable row level security;
create index "clause_data_gin" on public."clause" using gin (data jsonb_path_ops);
create index "clause_created_idx" on public."clause" (created_date desc, id);
insert into cb_private.entity_registry values ('clause');
grant select, insert, update, delete on public."clause" to authenticated, service_role;
create table public."service_email_log" (
 id text primary key default gen_random_uuid()::text,
 data jsonb not null default '{}'::jsonb check (jsonb_typeof(data) = 'object'),
 created_date timestamptz not null default now(),
 updated_date timestamptz not null default now(),
 created_by text default (auth.jwt()->>'email')
);
alter table public."service_email_log" enable row level security;
create index "service_email_log_data_gin" on public."service_email_log" using gin (data jsonb_path_ops);
create index "service_email_log_created_idx" on public."service_email_log" (created_date desc, id);
insert into cb_private.entity_registry values ('service_email_log');
grant select, insert, update, delete on public."service_email_log" to authenticated, service_role;
create index "service_email_log_project_id_idx" on public."service_email_log" ((data->>'project_id'));
create index "service_email_log_status_idx" on public."service_email_log" ((data->>'status'));
create table public."receipt" (
 id text primary key default gen_random_uuid()::text,
 data jsonb not null default '{}'::jsonb check (jsonb_typeof(data) = 'object'),
 created_date timestamptz not null default now(),
 updated_date timestamptz not null default now(),
 created_by text default (auth.jwt()->>'email')
);
alter table public."receipt" enable row level security;
create index "receipt_data_gin" on public."receipt" using gin (data jsonb_path_ops);
create index "receipt_created_idx" on public."receipt" (created_date desc, id);
insert into cb_private.entity_registry values ('receipt');
grant select, insert, update, delete on public."receipt" to authenticated, service_role;
create index "receipt_contact_id_idx" on public."receipt" ((data->>'contact_id'));
create index "receipt_invoice_id_idx" on public."receipt" ((data->>'invoice_id'));
create table public."quote" (
 id text primary key default gen_random_uuid()::text,
 data jsonb not null default '{}'::jsonb check (jsonb_typeof(data) = 'object'),
 created_date timestamptz not null default now(),
 updated_date timestamptz not null default now(),
 created_by text default (auth.jwt()->>'email')
);
alter table public."quote" enable row level security;
create index "quote_data_gin" on public."quote" using gin (data jsonb_path_ops);
create index "quote_created_idx" on public."quote" (created_date desc, id);
insert into cb_private.entity_registry values ('quote');
grant select, insert, update, delete on public."quote" to authenticated, service_role;
create index "quote_contact_id_idx" on public."quote" ((data->>'contact_id'));
create index "quote_status_idx" on public."quote" ((data->>'status'));
create index "quote_view_token_idx" on public."quote" ((data->>'view_token'));
create table public."quote_view_session" (
 id text primary key default gen_random_uuid()::text,
 data jsonb not null default '{}'::jsonb check (jsonb_typeof(data) = 'object'),
 created_date timestamptz not null default now(),
 updated_date timestamptz not null default now(),
 created_by text default (auth.jwt()->>'email')
);
alter table public."quote_view_session" enable row level security;
create index "quote_view_session_data_gin" on public."quote_view_session" using gin (data jsonb_path_ops);
create index "quote_view_session_created_idx" on public."quote_view_session" (created_date desc, id);
insert into cb_private.entity_registry values ('quote_view_session');
grant select, insert, update, delete on public."quote_view_session" to authenticated, service_role;
create index "quote_view_session_quote_id_idx" on public."quote_view_session" ((data->>'quote_id'));
create table public."quote_signature" (
 id text primary key default gen_random_uuid()::text,
 data jsonb not null default '{}'::jsonb check (jsonb_typeof(data) = 'object'),
 created_date timestamptz not null default now(),
 updated_date timestamptz not null default now(),
 created_by text default (auth.jwt()->>'email')
);
alter table public."quote_signature" enable row level security;
create index "quote_signature_data_gin" on public."quote_signature" using gin (data jsonb_path_ops);
create index "quote_signature_created_idx" on public."quote_signature" (created_date desc, id);
insert into cb_private.entity_registry values ('quote_signature');
grant select, insert, update, delete on public."quote_signature" to authenticated, service_role;
create index "quote_signature_quote_id_idx" on public."quote_signature" ((data->>'quote_id'));
create table public."workflow_rule" (
 id text primary key default gen_random_uuid()::text,
 data jsonb not null default '{}'::jsonb check (jsonb_typeof(data) = 'object'),
 created_date timestamptz not null default now(),
 updated_date timestamptz not null default now(),
 created_by text default (auth.jwt()->>'email')
);
alter table public."workflow_rule" enable row level security;
create index "workflow_rule_data_gin" on public."workflow_rule" using gin (data jsonb_path_ops);
create index "workflow_rule_created_idx" on public."workflow_rule" (created_date desc, id);
insert into cb_private.entity_registry values ('workflow_rule');
grant select, insert, update, delete on public."workflow_rule" to authenticated, service_role;
create table public."proof_approval" (
 id text primary key default gen_random_uuid()::text,
 data jsonb not null default '{}'::jsonb check (jsonb_typeof(data) = 'object'),
 created_date timestamptz not null default now(),
 updated_date timestamptz not null default now(),
 created_by text default (auth.jwt()->>'email')
);
alter table public."proof_approval" enable row level security;
create index "proof_approval_data_gin" on public."proof_approval" using gin (data jsonb_path_ops);
create index "proof_approval_created_idx" on public."proof_approval" (created_date desc, id);
insert into cb_private.entity_registry values ('proof_approval');
grant select, insert, update, delete on public."proof_approval" to authenticated, service_role;
create index "proof_approval_contact_id_idx" on public."proof_approval" ((data->>'contact_id'));
create index "proof_approval_project_id_idx" on public."proof_approval" ((data->>'project_id'));
create index "proof_approval_status_idx" on public."proof_approval" ((data->>'status'));
create table public."project" (
 id text primary key default gen_random_uuid()::text,
 data jsonb not null default '{}'::jsonb check (jsonb_typeof(data) = 'object'),
 created_date timestamptz not null default now(),
 updated_date timestamptz not null default now(),
 created_by text default (auth.jwt()->>'email')
);
alter table public."project" enable row level security;
create index "project_data_gin" on public."project" using gin (data jsonb_path_ops);
create index "project_created_idx" on public."project" (created_date desc, id);
insert into cb_private.entity_registry values ('project');
grant select, insert, update, delete on public."project" to authenticated, service_role;
create index "project_contact_id_idx" on public."project" ((data->>'contact_id'));
create index "project_quote_id_idx" on public."project" ((data->>'quote_id'));
create index "project_invoice_id_idx" on public."project" ((data->>'invoice_id'));
create table public."service_workflow" (
 id text primary key default gen_random_uuid()::text,
 data jsonb not null default '{}'::jsonb check (jsonb_typeof(data) = 'object'),
 created_date timestamptz not null default now(),
 updated_date timestamptz not null default now(),
 created_by text default (auth.jwt()->>'email')
);
alter table public."service_workflow" enable row level security;
create index "service_workflow_data_gin" on public."service_workflow" using gin (data jsonb_path_ops);
create index "service_workflow_created_idx" on public."service_workflow" (created_date desc, id);
insert into cb_private.entity_registry values ('service_workflow');
grant select, insert, update, delete on public."service_workflow" to authenticated, service_role;
create table public."document_activity" (
 id text primary key default gen_random_uuid()::text,
 data jsonb not null default '{}'::jsonb check (jsonb_typeof(data) = 'object'),
 created_date timestamptz not null default now(),
 updated_date timestamptz not null default now(),
 created_by text default (auth.jwt()->>'email')
);
alter table public."document_activity" enable row level security;
create index "document_activity_data_gin" on public."document_activity" using gin (data jsonb_path_ops);
create index "document_activity_created_idx" on public."document_activity" (created_date desc, id);
insert into cb_private.entity_registry values ('document_activity');
grant select, insert, update, delete on public."document_activity" to authenticated, service_role;
create index "document_activity_contact_id_idx" on public."document_activity" ((data->>'contact_id'));
create table public."pipeline_stage_history" (
 id text primary key default gen_random_uuid()::text,
 data jsonb not null default '{}'::jsonb check (jsonb_typeof(data) = 'object'),
 created_date timestamptz not null default now(),
 updated_date timestamptz not null default now(),
 created_by text default (auth.jwt()->>'email')
);
alter table public."pipeline_stage_history" enable row level security;
create index "pipeline_stage_history_data_gin" on public."pipeline_stage_history" using gin (data jsonb_path_ops);
create index "pipeline_stage_history_created_idx" on public."pipeline_stage_history" (created_date desc, id);
insert into cb_private.entity_registry values ('pipeline_stage_history');
grant select, insert, update, delete on public."pipeline_stage_history" to authenticated, service_role;
create index "pipeline_stage_history_contact_id_idx" on public."pipeline_stage_history" ((data->>'contact_id'));
create table public."quote_service" (
 id text primary key default gen_random_uuid()::text,
 data jsonb not null default '{}'::jsonb check (jsonb_typeof(data) = 'object'),
 created_date timestamptz not null default now(),
 updated_date timestamptz not null default now(),
 created_by text default (auth.jwt()->>'email')
);
alter table public."quote_service" enable row level security;
create index "quote_service_data_gin" on public."quote_service" using gin (data jsonb_path_ops);
create index "quote_service_created_idx" on public."quote_service" (created_date desc, id);
insert into cb_private.entity_registry values ('quote_service');
grant select, insert, update, delete on public."quote_service" to authenticated, service_role;
create table public."email_message" (
 id text primary key default gen_random_uuid()::text,
 data jsonb not null default '{}'::jsonb check (jsonb_typeof(data) = 'object'),
 created_date timestamptz not null default now(),
 updated_date timestamptz not null default now(),
 created_by text default (auth.jwt()->>'email')
);
alter table public."email_message" enable row level security;
create index "email_message_data_gin" on public."email_message" using gin (data jsonb_path_ops);
create index "email_message_created_idx" on public."email_message" (created_date desc, id);
insert into cb_private.entity_registry values ('email_message');
grant select, insert, update, delete on public."email_message" to authenticated, service_role;
create index "email_message_contact_id_idx" on public."email_message" ((data->>'contact_id'));
create index "email_message_quote_id_idx" on public."email_message" ((data->>'quote_id'));
create index "email_message_status_idx" on public."email_message" ((data->>'status'));
create table public."pipeline_deal" (
 id text primary key default gen_random_uuid()::text,
 data jsonb not null default '{}'::jsonb check (jsonb_typeof(data) = 'object'),
 created_date timestamptz not null default now(),
 updated_date timestamptz not null default now(),
 created_by text default (auth.jwt()->>'email')
);
alter table public."pipeline_deal" enable row level security;
create index "pipeline_deal_data_gin" on public."pipeline_deal" using gin (data jsonb_path_ops);
create index "pipeline_deal_created_idx" on public."pipeline_deal" (created_date desc, id);
insert into cb_private.entity_registry values ('pipeline_deal');
grant select, insert, update, delete on public."pipeline_deal" to authenticated, service_role;
create table public."automation_rule" (
 id text primary key default gen_random_uuid()::text,
 data jsonb not null default '{}'::jsonb check (jsonb_typeof(data) = 'object'),
 created_date timestamptz not null default now(),
 updated_date timestamptz not null default now(),
 created_by text default (auth.jwt()->>'email')
);
alter table public."automation_rule" enable row level security;
create index "automation_rule_data_gin" on public."automation_rule" using gin (data jsonb_path_ops);
create index "automation_rule_created_idx" on public."automation_rule" (created_date desc, id);
insert into cb_private.entity_registry values ('automation_rule');
grant select, insert, update, delete on public."automation_rule" to authenticated, service_role;
create table public."quote_saved_progress" (
 id text primary key default gen_random_uuid()::text,
 data jsonb not null default '{}'::jsonb check (jsonb_typeof(data) = 'object'),
 created_date timestamptz not null default now(),
 updated_date timestamptz not null default now(),
 created_by text default (auth.jwt()->>'email')
);
alter table public."quote_saved_progress" enable row level security;
create index "quote_saved_progress_data_gin" on public."quote_saved_progress" using gin (data jsonb_path_ops);
create index "quote_saved_progress_created_idx" on public."quote_saved_progress" (created_date desc, id);
insert into cb_private.entity_registry values ('quote_saved_progress');
grant select, insert, update, delete on public."quote_saved_progress" to authenticated, service_role;
create index "quote_saved_progress_quote_id_idx" on public."quote_saved_progress" ((data->>'quote_id'));
create table public."file_request" (
 id text primary key default gen_random_uuid()::text,
 data jsonb not null default '{}'::jsonb check (jsonb_typeof(data) = 'object'),
 created_date timestamptz not null default now(),
 updated_date timestamptz not null default now(),
 created_by text default (auth.jwt()->>'email')
);
alter table public."file_request" enable row level security;
create index "file_request_data_gin" on public."file_request" using gin (data jsonb_path_ops);
create index "file_request_created_idx" on public."file_request" (created_date desc, id);
insert into cb_private.entity_registry values ('file_request');
grant select, insert, update, delete on public."file_request" to authenticated, service_role;
create index "file_request_contact_id_idx" on public."file_request" ((data->>'contact_id'));
create index "file_request_project_id_idx" on public."file_request" ((data->>'project_id'));
create index "file_request_status_idx" on public."file_request" ((data->>'status'));
create table public."pipeline_template" (
 id text primary key default gen_random_uuid()::text,
 data jsonb not null default '{}'::jsonb check (jsonb_typeof(data) = 'object'),
 created_date timestamptz not null default now(),
 updated_date timestamptz not null default now(),
 created_by text default (auth.jwt()->>'email')
);
alter table public."pipeline_template" enable row level security;
create index "pipeline_template_data_gin" on public."pipeline_template" using gin (data jsonb_path_ops);
create index "pipeline_template_created_idx" on public."pipeline_template" (created_date desc, id);
insert into cb_private.entity_registry values ('pipeline_template');
grant select, insert, update, delete on public."pipeline_template" to authenticated, service_role;
create table public."client_portal_access" (
 id text primary key default gen_random_uuid()::text,
 data jsonb not null default '{}'::jsonb check (jsonb_typeof(data) = 'object'),
 created_date timestamptz not null default now(),
 updated_date timestamptz not null default now(),
 created_by text default (auth.jwt()->>'email')
);
alter table public."client_portal_access" enable row level security;
create index "client_portal_access_data_gin" on public."client_portal_access" using gin (data jsonb_path_ops);
create index "client_portal_access_created_idx" on public."client_portal_access" (created_date desc, id);
insert into cb_private.entity_registry values ('client_portal_access');
grant select, insert, update, delete on public."client_portal_access" to authenticated, service_role;
create index "client_portal_access_contact_id_idx" on public."client_portal_access" ((data->>'contact_id'));
create index "client_portal_access_project_id_idx" on public."client_portal_access" ((data->>'project_id'));
create index "client_portal_access_email_idx" on public."client_portal_access" ((data->>'email'));
create index "client_portal_access_access_token_idx" on public."client_portal_access" ((data->>'access_token'));
create table public."app_settings" (
 id text primary key default gen_random_uuid()::text,
 data jsonb not null default '{}'::jsonb check (jsonb_typeof(data) = 'object'),
 created_date timestamptz not null default now(),
 updated_date timestamptz not null default now(),
 created_by text default (auth.jwt()->>'email')
);
alter table public."app_settings" enable row level security;
create index "app_settings_data_gin" on public."app_settings" using gin (data jsonb_path_ops);
create index "app_settings_created_idx" on public."app_settings" (created_date desc, id);
insert into cb_private.entity_registry values ('app_settings');
grant select, insert, update, delete on public."app_settings" to authenticated, service_role;
create table public."lead" (
 id text primary key default gen_random_uuid()::text,
 data jsonb not null default '{}'::jsonb check (jsonb_typeof(data) = 'object'),
 created_date timestamptz not null default now(),
 updated_date timestamptz not null default now(),
 created_by text default (auth.jwt()->>'email')
);
alter table public."lead" enable row level security;
create index "lead_data_gin" on public."lead" using gin (data jsonb_path_ops);
create index "lead_created_idx" on public."lead" (created_date desc, id);
insert into cb_private.entity_registry values ('lead');
grant select, insert, update, delete on public."lead" to authenticated, service_role;
create index "lead_contact_id_idx" on public."lead" ((data->>'contact_id'));
create table public."collection_signature" (
 id text primary key default gen_random_uuid()::text,
 data jsonb not null default '{}'::jsonb check (jsonb_typeof(data) = 'object'),
 created_date timestamptz not null default now(),
 updated_date timestamptz not null default now(),
 created_by text default (auth.jwt()->>'email')
);
alter table public."collection_signature" enable row level security;
create index "collection_signature_data_gin" on public."collection_signature" using gin (data jsonb_path_ops);
create index "collection_signature_created_idx" on public."collection_signature" (created_date desc, id);
insert into cb_private.entity_registry values ('collection_signature');
grant select, insert, update, delete on public."collection_signature" to authenticated, service_role;
create index "collection_signature_contact_id_idx" on public."collection_signature" ((data->>'contact_id'));
create index "collection_signature_project_id_idx" on public."collection_signature" ((data->>'project_id'));
create index "collection_signature_invoice_id_idx" on public."collection_signature" ((data->>'invoice_id'));
create table public."email_template" (
 id text primary key default gen_random_uuid()::text,
 data jsonb not null default '{}'::jsonb check (jsonb_typeof(data) = 'object'),
 created_date timestamptz not null default now(),
 updated_date timestamptz not null default now(),
 created_by text default (auth.jwt()->>'email')
);
alter table public."email_template" enable row level security;
create index "email_template_data_gin" on public."email_template" using gin (data jsonb_path_ops);
create index "email_template_created_idx" on public."email_template" (created_date desc, id);
insert into cb_private.entity_registry values ('email_template');
grant select, insert, update, delete on public."email_template" to authenticated, service_role;
create table public."sales_pipeline" (
 id text primary key default gen_random_uuid()::text,
 data jsonb not null default '{}'::jsonb check (jsonb_typeof(data) = 'object'),
 created_date timestamptz not null default now(),
 updated_date timestamptz not null default now(),
 created_by text default (auth.jwt()->>'email')
);
alter table public."sales_pipeline" enable row level security;
create index "sales_pipeline_data_gin" on public."sales_pipeline" using gin (data jsonb_path_ops);
create index "sales_pipeline_created_idx" on public."sales_pipeline" (created_date desc, id);
insert into cb_private.entity_registry values ('sales_pipeline');
grant select, insert, update, delete on public."sales_pipeline" to authenticated, service_role;
create table public."nurture_sequence" (
 id text primary key default gen_random_uuid()::text,
 data jsonb not null default '{}'::jsonb check (jsonb_typeof(data) = 'object'),
 created_date timestamptz not null default now(),
 updated_date timestamptz not null default now(),
 created_by text default (auth.jwt()->>'email')
);
alter table public."nurture_sequence" enable row level security;
create index "nurture_sequence_data_gin" on public."nurture_sequence" using gin (data jsonb_path_ops);
create index "nurture_sequence_created_idx" on public."nurture_sequence" (created_date desc, id);
insert into cb_private.entity_registry values ('nurture_sequence');
grant select, insert, update, delete on public."nurture_sequence" to authenticated, service_role;
create table public."cover_spec" (
 id text primary key default gen_random_uuid()::text,
 data jsonb not null default '{}'::jsonb check (jsonb_typeof(data) = 'object'),
 created_date timestamptz not null default now(),
 updated_date timestamptz not null default now(),
 created_by text default (auth.jwt()->>'email')
);
alter table public."cover_spec" enable row level security;
create index "cover_spec_data_gin" on public."cover_spec" using gin (data jsonb_path_ops);
create index "cover_spec_created_idx" on public."cover_spec" (created_date desc, id);
insert into cb_private.entity_registry values ('cover_spec');
grant select, insert, update, delete on public."cover_spec" to authenticated, service_role;
create table public."message_log" (
 id text primary key default gen_random_uuid()::text,
 data jsonb not null default '{}'::jsonb check (jsonb_typeof(data) = 'object'),
 created_date timestamptz not null default now(),
 updated_date timestamptz not null default now(),
 created_by text default (auth.jwt()->>'email')
);
alter table public."message_log" enable row level security;
create index "message_log_data_gin" on public."message_log" using gin (data jsonb_path_ops);
create index "message_log_created_idx" on public."message_log" (created_date desc, id);
insert into cb_private.entity_registry values ('message_log');
grant select, insert, update, delete on public."message_log" to authenticated, service_role;
create index "message_log_project_id_idx" on public."message_log" ((data->>'project_id'));
create table public."portal_message" (
 id text primary key default gen_random_uuid()::text,
 data jsonb not null default '{}'::jsonb check (jsonb_typeof(data) = 'object'),
 created_date timestamptz not null default now(),
 updated_date timestamptz not null default now(),
 created_by text default (auth.jwt()->>'email')
);
alter table public."portal_message" enable row level security;
create index "portal_message_data_gin" on public."portal_message" using gin (data jsonb_path_ops);
create index "portal_message_created_idx" on public."portal_message" (created_date desc, id);
insert into cb_private.entity_registry values ('portal_message');
grant select, insert, update, delete on public."portal_message" to authenticated, service_role;
create index "portal_message_contact_id_idx" on public."portal_message" ((data->>'contact_id'));
create index "portal_message_project_id_idx" on public."portal_message" ((data->>'project_id'));
create table public."credit_note" (
 id text primary key default gen_random_uuid()::text,
 data jsonb not null default '{}'::jsonb check (jsonb_typeof(data) = 'object'),
 created_date timestamptz not null default now(),
 updated_date timestamptz not null default now(),
 created_by text default (auth.jwt()->>'email')
);
alter table public."credit_note" enable row level security;
create index "credit_note_data_gin" on public."credit_note" using gin (data jsonb_path_ops);
create index "credit_note_created_idx" on public."credit_note" (created_date desc, id);
insert into cb_private.entity_registry values ('credit_note');
grant select, insert, update, delete on public."credit_note" to authenticated, service_role;
create index "credit_note_contact_id_idx" on public."credit_note" ((data->>'contact_id'));
create index "credit_note_invoice_id_idx" on public."credit_note" ((data->>'invoice_id'));
create table public."contract" (
 id text primary key default gen_random_uuid()::text,
 data jsonb not null default '{}'::jsonb check (jsonb_typeof(data) = 'object'),
 created_date timestamptz not null default now(),
 updated_date timestamptz not null default now(),
 created_by text default (auth.jwt()->>'email')
);
alter table public."contract" enable row level security;
create index "contract_data_gin" on public."contract" using gin (data jsonb_path_ops);
create index "contract_created_idx" on public."contract" (created_date desc, id);
insert into cb_private.entity_registry values ('contract');
grant select, insert, update, delete on public."contract" to authenticated, service_role;
create index "contract_contact_id_idx" on public."contract" ((data->>'contact_id'));
create index "contract_project_id_idx" on public."contract" ((data->>'project_id'));
create index "contract_status_idx" on public."contract" ((data->>'status'));
create index "contract_sign_token_idx" on public."contract" ((data->>'sign_token'));
create table public."company_settings" (
 id text primary key default gen_random_uuid()::text,
 data jsonb not null default '{}'::jsonb check (jsonb_typeof(data) = 'object'),
 created_date timestamptz not null default now(),
 updated_date timestamptz not null default now(),
 created_by text default (auth.jwt()->>'email')
);
alter table public."company_settings" enable row level security;
create index "company_settings_data_gin" on public."company_settings" using gin (data jsonb_path_ops);
create index "company_settings_created_idx" on public."company_settings" (created_date desc, id);
insert into cb_private.entity_registry values ('company_settings');
grant select, insert, update, delete on public."company_settings" to authenticated, service_role;
create index "company_settings_email_idx" on public."company_settings" ((data->>'email'));
create table public."resource_document" (
 id text primary key default gen_random_uuid()::text,
 data jsonb not null default '{}'::jsonb check (jsonb_typeof(data) = 'object'),
 created_date timestamptz not null default now(),
 updated_date timestamptz not null default now(),
 created_by text default (auth.jwt()->>'email')
);
alter table public."resource_document" enable row level security;
create index "resource_document_data_gin" on public."resource_document" using gin (data jsonb_path_ops);
create index "resource_document_created_idx" on public."resource_document" (created_date desc, id);
insert into cb_private.entity_registry values ('resource_document');
grant select, insert, update, delete on public."resource_document" to authenticated, service_role;
create table public."service" (
 id text primary key default gen_random_uuid()::text,
 data jsonb not null default '{}'::jsonb check (jsonb_typeof(data) = 'object'),
 created_date timestamptz not null default now(),
 updated_date timestamptz not null default now(),
 created_by text default (auth.jwt()->>'email')
);
alter table public."service" enable row level security;
create index "service_data_gin" on public."service" using gin (data jsonb_path_ops);
create index "service_created_idx" on public."service" (created_date desc, id);
insert into cb_private.entity_registry values ('service');
grant select, insert, update, delete on public."service" to authenticated, service_role;
create table public."submission" (
 id text primary key default gen_random_uuid()::text,
 data jsonb not null default '{}'::jsonb check (jsonb_typeof(data) = 'object'),
 created_date timestamptz not null default now(),
 updated_date timestamptz not null default now(),
 created_by text default (auth.jwt()->>'email')
);
alter table public."submission" enable row level security;
create index "submission_data_gin" on public."submission" using gin (data jsonb_path_ops);
create index "submission_created_idx" on public."submission" (created_date desc, id);
insert into cb_private.entity_registry values ('submission');
grant select, insert, update, delete on public."submission" to authenticated, service_role;
create index "submission_contact_id_idx" on public."submission" ((data->>'contact_id'));
create index "submission_email_idx" on public."submission" ((data->>'email'));
create index "submission_status_idx" on public."submission" ((data->>'status'));
create table public."contact" (
 id text primary key default gen_random_uuid()::text,
 data jsonb not null default '{}'::jsonb check (jsonb_typeof(data) = 'object'),
 created_date timestamptz not null default now(),
 updated_date timestamptz not null default now(),
 created_by text default (auth.jwt()->>'email')
);
alter table public."contact" enable row level security;
create index "contact_data_gin" on public."contact" using gin (data jsonb_path_ops);
create index "contact_created_idx" on public."contact" (created_date desc, id);
insert into cb_private.entity_registry values ('contact');
grant select, insert, update, delete on public."contact" to authenticated, service_role;
create index "contact_email_idx" on public."contact" ((data->>'email'));
create table public."recurring_invoice" (
 id text primary key default gen_random_uuid()::text,
 data jsonb not null default '{}'::jsonb check (jsonb_typeof(data) = 'object'),
 created_date timestamptz not null default now(),
 updated_date timestamptz not null default now(),
 created_by text default (auth.jwt()->>'email')
);
alter table public."recurring_invoice" enable row level security;
create index "recurring_invoice_data_gin" on public."recurring_invoice" using gin (data jsonb_path_ops);
create index "recurring_invoice_created_idx" on public."recurring_invoice" (created_date desc, id);
insert into cb_private.entity_registry values ('recurring_invoice');
grant select, insert, update, delete on public."recurring_invoice" to authenticated, service_role;
create or replace function cb_private.is_staff() returns boolean language sql stable security definer set search_path = '' as $$
 select (select auth.uid()) is not null and exists (select 1 from public."user" u where u.id = (select auth.uid())::text and u.data->>'role' in ('admin','super_user','standard_user'));
$$;
create or replace function cb_private.is_admin() returns boolean language sql stable security definer set search_path = '' as $$
 select (select auth.uid()) is not null and exists (select 1 from public."user" u where u.id = (select auth.uid())::text and u.data->>'role' in ('admin','super_user'));
$$;
revoke all on function cb_private.is_staff() from public;
revoke all on function cb_private.is_admin() from public;
grant execute on function cb_private.is_staff(), cb_private.is_admin() to authenticated, anon, service_role;
create policy staff_access on public."invoice" for all to authenticated using ((select cb_private.is_staff())) with check ((select cb_private.is_staff()));
create policy staff_access on public."campaign_recipient" for all to authenticated using ((select cb_private.is_staff())) with check ((select cb_private.is_staff()));
create policy staff_access on public."booking_service" for all to authenticated using ((select cb_private.is_staff())) with check ((select cb_private.is_staff()));
grant select on public."booking_service" to anon;
create policy published_read on public."booking_service" for select to anon, authenticated using (coalesce(data->>'is_active', 'true') = 'true');
create policy staff_access on public."author" for all to authenticated using ((select cb_private.is_staff())) with check ((select cb_private.is_staff()));
create policy staff_access on public."note" for all to authenticated using ((select cb_private.is_staff())) with check ((select cb_private.is_staff()));
create policy staff_access on public."appointment" for all to authenticated using ((select cb_private.is_staff())) with check ((select cb_private.is_staff()));
create policy staff_access on public."workflow_execution" for all to authenticated using ((select cb_private.is_staff())) with check ((select cb_private.is_staff()));
create policy staff_access on public."document" for all to authenticated using ((select cb_private.is_staff())) with check ((select cb_private.is_staff()));
create policy staff_access on public."availability_rule" for all to authenticated using ((select cb_private.is_staff())) with check ((select cb_private.is_staff()));
grant select on public."availability_rule" to anon;
create policy published_read on public."availability_rule" for select to anon, authenticated using (coalesce(data->>'is_active', 'true') = 'true');
create policy staff_access on public."client_service_project" for all to authenticated using ((select cb_private.is_staff())) with check ((select cb_private.is_staff()));
create policy staff_access on public."activity_log" for all to authenticated using ((select cb_private.is_staff())) with check ((select cb_private.is_staff()));
create policy staff_access on public."project_update" for all to authenticated using ((select cb_private.is_staff())) with check ((select cb_private.is_staff()));
create policy staff_access on public."book_record" for all to authenticated using ((select cb_private.is_staff())) with check ((select cb_private.is_staff()));
create policy staff_access on public."message_queue" for all to authenticated using ((select cb_private.is_staff())) with check ((select cb_private.is_staff()));
create policy staff_access on public."onboarding_checklist" for all to authenticated using ((select cb_private.is_staff())) with check ((select cb_private.is_staff()));
create policy staff_access on public."cover_design_enquiry" for all to authenticated using ((select cb_private.is_staff())) with check ((select cb_private.is_staff()));
create policy staff_access on public."payment" for all to authenticated using ((select cb_private.is_staff())) with check ((select cb_private.is_staff()));
create policy staff_access on public."task" for all to authenticated using ((select cb_private.is_staff())) with check ((select cb_private.is_staff()));
create policy staff_access on public."workflow_template" for all to authenticated using ((select cb_private.is_staff())) with check ((select cb_private.is_staff()));
create policy staff_access on public."e_signature_request" for all to authenticated using ((select cb_private.is_staff())) with check ((select cb_private.is_staff()));
create policy staff_access on public."lead_score" for all to authenticated using ((select cb_private.is_staff())) with check ((select cb_private.is_staff()));
create policy staff_access on public."client_delay" for all to authenticated using ((select cb_private.is_staff())) with check ((select cb_private.is_staff()));
create policy staff_access on public."pipeline" for all to authenticated using ((select cb_private.is_staff())) with check ((select cb_private.is_staff()));
create policy staff_access on public."email_campaign" for all to authenticated using ((select cb_private.is_staff())) with check ((select cb_private.is_staff()));
create policy staff_access on public."purchase_order" for all to authenticated using ((select cb_private.is_staff())) with check ((select cb_private.is_staff()));
create policy staff_access on public."quote_package" for all to authenticated using ((select cb_private.is_staff())) with check ((select cb_private.is_staff()));
grant select on public."quote_package" to anon;
create policy published_read on public."quote_package" for select to anon, authenticated using (coalesce(data->>'is_active', 'true') = 'true');
create policy staff_access on public."notification" for all to authenticated using ((select cb_private.is_staff())) with check ((select cb_private.is_staff()));
create policy staff_access on public."production_job" for all to authenticated using ((select cb_private.is_staff())) with check ((select cb_private.is_staff()));
create policy staff_access on public."material" for all to authenticated using ((select cb_private.is_staff())) with check ((select cb_private.is_staff()));
create policy staff_access on public."cover_review" for all to authenticated using ((select cb_private.is_staff())) with check ((select cb_private.is_staff()));
create policy staff_access on public."quote_line_item" for all to authenticated using ((select cb_private.is_staff())) with check ((select cb_private.is_staff()));
create policy staff_access on public."message_template" for all to authenticated using ((select cb_private.is_staff())) with check ((select cb_private.is_staff()));
create policy staff_access on public."client_workflow" for all to authenticated using ((select cb_private.is_staff())) with check ((select cb_private.is_staff()));
create policy staff_access on public."clause" for all to authenticated using ((select cb_private.is_staff())) with check ((select cb_private.is_staff()));
create policy staff_access on public."service_email_log" for all to authenticated using ((select cb_private.is_staff())) with check ((select cb_private.is_staff()));
create policy staff_access on public."receipt" for all to authenticated using ((select cb_private.is_staff())) with check ((select cb_private.is_staff()));
create policy staff_access on public."quote" for all to authenticated using ((select cb_private.is_staff())) with check ((select cb_private.is_staff()));
create policy staff_access on public."quote_view_session" for all to authenticated using ((select cb_private.is_staff())) with check ((select cb_private.is_staff()));
create policy staff_access on public."user" for all to authenticated using ((select cb_private.is_admin())) with check ((select cb_private.is_admin()));
create policy own_profile on public."user" for select to authenticated using (id = (select auth.uid())::text);
create policy staff_access on public."quote_signature" for all to authenticated using ((select cb_private.is_staff())) with check ((select cb_private.is_staff()));
create policy staff_access on public."workflow_rule" for all to authenticated using ((select cb_private.is_admin())) with check ((select cb_private.is_admin()));
create policy staff_access on public."proof_approval" for all to authenticated using ((select cb_private.is_staff())) with check ((select cb_private.is_staff()));
create policy staff_access on public."project" for all to authenticated using ((select cb_private.is_staff())) with check ((select cb_private.is_staff()));
create policy staff_access on public."service_workflow" for all to authenticated using ((select cb_private.is_staff())) with check ((select cb_private.is_staff()));
create policy staff_access on public."document_activity" for all to authenticated using ((select cb_private.is_staff())) with check ((select cb_private.is_staff()));
create policy staff_access on public."pipeline_stage_history" for all to authenticated using ((select cb_private.is_staff())) with check ((select cb_private.is_staff()));
create policy staff_access on public."quote_service" for all to authenticated using ((select cb_private.is_staff())) with check ((select cb_private.is_staff()));
grant select on public."quote_service" to anon;
create policy published_read on public."quote_service" for select to anon, authenticated using (coalesce(data->>'is_active', 'true') = 'true');
create policy staff_access on public."email_message" for all to authenticated using ((select cb_private.is_staff())) with check ((select cb_private.is_staff()));
create policy staff_access on public."pipeline_deal" for all to authenticated using ((select cb_private.is_staff())) with check ((select cb_private.is_staff()));
create policy staff_access on public."automation_rule" for all to authenticated using ((select cb_private.is_admin())) with check ((select cb_private.is_admin()));
create policy staff_access on public."quote_saved_progress" for all to authenticated using ((select cb_private.is_staff())) with check ((select cb_private.is_staff()));
create policy staff_access on public."file_request" for all to authenticated using ((select cb_private.is_staff())) with check ((select cb_private.is_staff()));
create policy staff_access on public."pipeline_template" for all to authenticated using ((select cb_private.is_staff())) with check ((select cb_private.is_staff()));
create policy staff_access on public."client_portal_access" for all to authenticated using ((select cb_private.is_staff())) with check ((select cb_private.is_staff()));
create policy staff_access on public."app_settings" for all to authenticated using ((select cb_private.is_admin())) with check ((select cb_private.is_admin()));
create policy staff_access on public."lead" for all to authenticated using ((select cb_private.is_staff())) with check ((select cb_private.is_staff()));
create policy staff_access on public."collection_signature" for all to authenticated using ((select cb_private.is_staff())) with check ((select cb_private.is_staff()));
create policy staff_access on public."email_template" for all to authenticated using ((select cb_private.is_staff())) with check ((select cb_private.is_staff()));
create policy staff_access on public."sales_pipeline" for all to authenticated using ((select cb_private.is_staff())) with check ((select cb_private.is_staff()));
create policy staff_access on public."nurture_sequence" for all to authenticated using ((select cb_private.is_staff())) with check ((select cb_private.is_staff()));
create policy staff_access on public."cover_spec" for all to authenticated using ((select cb_private.is_staff())) with check ((select cb_private.is_staff()));
create policy staff_access on public."message_log" for all to authenticated using ((select cb_private.is_staff())) with check ((select cb_private.is_staff()));
create policy staff_access on public."portal_message" for all to authenticated using ((select cb_private.is_staff())) with check ((select cb_private.is_staff()));
create policy staff_access on public."credit_note" for all to authenticated using ((select cb_private.is_staff())) with check ((select cb_private.is_staff()));
create policy staff_access on public."contract" for all to authenticated using ((select cb_private.is_staff())) with check ((select cb_private.is_staff()));
create policy staff_access on public."company_settings" for all to authenticated using ((select cb_private.is_admin())) with check ((select cb_private.is_admin()));
create policy staff_access on public."resource_document" for all to authenticated using ((select cb_private.is_staff())) with check ((select cb_private.is_staff()));
grant select on public."resource_document" to anon;
create policy published_read on public."resource_document" for select to anon, authenticated using (data->>'is_public' = 'true');
create policy staff_access on public."service" for all to authenticated using ((select cb_private.is_staff())) with check ((select cb_private.is_staff()));
grant select on public."service" to anon;
create policy published_read on public."service" for select to anon, authenticated using (coalesce(data->>'is_active', 'true') = 'true');
create policy staff_access on public."submission" for all to authenticated using ((select cb_private.is_staff())) with check ((select cb_private.is_staff()));
create policy staff_access on public."contact" for all to authenticated using ((select cb_private.is_staff())) with check ((select cb_private.is_staff()));
create policy staff_access on public."recurring_invoice" for all to authenticated using ((select cb_private.is_staff())) with check ((select cb_private.is_staff()));

create or replace function cb_private.touch_record() returns trigger language plpgsql set search_path = '' as $$
begin new.updated_date = now(); new.id = old.id; new.created_date = old.created_date; new.created_by = old.created_by; return new; end;
$$;
revoke all on function cb_private.touch_record() from public;
create trigger touch_record before update on public."invoice" for each row execute function cb_private.touch_record();
create trigger touch_record before update on public."campaign_recipient" for each row execute function cb_private.touch_record();
create trigger touch_record before update on public."booking_service" for each row execute function cb_private.touch_record();
create trigger touch_record before update on public."author" for each row execute function cb_private.touch_record();
create trigger touch_record before update on public."note" for each row execute function cb_private.touch_record();
create trigger touch_record before update on public."appointment" for each row execute function cb_private.touch_record();
create trigger touch_record before update on public."workflow_execution" for each row execute function cb_private.touch_record();
create trigger touch_record before update on public."document" for each row execute function cb_private.touch_record();
create trigger touch_record before update on public."availability_rule" for each row execute function cb_private.touch_record();
create trigger touch_record before update on public."client_service_project" for each row execute function cb_private.touch_record();
create trigger touch_record before update on public."activity_log" for each row execute function cb_private.touch_record();
create trigger touch_record before update on public."project_update" for each row execute function cb_private.touch_record();
create trigger touch_record before update on public."book_record" for each row execute function cb_private.touch_record();
create trigger touch_record before update on public."message_queue" for each row execute function cb_private.touch_record();
create trigger touch_record before update on public."onboarding_checklist" for each row execute function cb_private.touch_record();
create trigger touch_record before update on public."cover_design_enquiry" for each row execute function cb_private.touch_record();
create trigger touch_record before update on public."payment" for each row execute function cb_private.touch_record();
create trigger touch_record before update on public."task" for each row execute function cb_private.touch_record();
create trigger touch_record before update on public."workflow_template" for each row execute function cb_private.touch_record();
create trigger touch_record before update on public."e_signature_request" for each row execute function cb_private.touch_record();
create trigger touch_record before update on public."lead_score" for each row execute function cb_private.touch_record();
create trigger touch_record before update on public."client_delay" for each row execute function cb_private.touch_record();
create trigger touch_record before update on public."pipeline" for each row execute function cb_private.touch_record();
create trigger touch_record before update on public."email_campaign" for each row execute function cb_private.touch_record();
create trigger touch_record before update on public."purchase_order" for each row execute function cb_private.touch_record();
create trigger touch_record before update on public."quote_package" for each row execute function cb_private.touch_record();
create trigger touch_record before update on public."notification" for each row execute function cb_private.touch_record();
create trigger touch_record before update on public."production_job" for each row execute function cb_private.touch_record();
create trigger touch_record before update on public."material" for each row execute function cb_private.touch_record();
create trigger touch_record before update on public."cover_review" for each row execute function cb_private.touch_record();
create trigger touch_record before update on public."quote_line_item" for each row execute function cb_private.touch_record();
create trigger touch_record before update on public."message_template" for each row execute function cb_private.touch_record();
create trigger touch_record before update on public."client_workflow" for each row execute function cb_private.touch_record();
create trigger touch_record before update on public."clause" for each row execute function cb_private.touch_record();
create trigger touch_record before update on public."service_email_log" for each row execute function cb_private.touch_record();
create trigger touch_record before update on public."receipt" for each row execute function cb_private.touch_record();
create trigger touch_record before update on public."quote" for each row execute function cb_private.touch_record();
create trigger touch_record before update on public."quote_view_session" for each row execute function cb_private.touch_record();
create trigger touch_record before update on public."user" for each row execute function cb_private.touch_record();
create trigger touch_record before update on public."quote_signature" for each row execute function cb_private.touch_record();
create trigger touch_record before update on public."workflow_rule" for each row execute function cb_private.touch_record();
create trigger touch_record before update on public."proof_approval" for each row execute function cb_private.touch_record();
create trigger touch_record before update on public."project" for each row execute function cb_private.touch_record();
create trigger touch_record before update on public."service_workflow" for each row execute function cb_private.touch_record();
create trigger touch_record before update on public."document_activity" for each row execute function cb_private.touch_record();
create trigger touch_record before update on public."pipeline_stage_history" for each row execute function cb_private.touch_record();
create trigger touch_record before update on public."quote_service" for each row execute function cb_private.touch_record();
create trigger touch_record before update on public."email_message" for each row execute function cb_private.touch_record();
create trigger touch_record before update on public."pipeline_deal" for each row execute function cb_private.touch_record();
create trigger touch_record before update on public."automation_rule" for each row execute function cb_private.touch_record();
create trigger touch_record before update on public."quote_saved_progress" for each row execute function cb_private.touch_record();
create trigger touch_record before update on public."file_request" for each row execute function cb_private.touch_record();
create trigger touch_record before update on public."pipeline_template" for each row execute function cb_private.touch_record();
create trigger touch_record before update on public."client_portal_access" for each row execute function cb_private.touch_record();
create trigger touch_record before update on public."app_settings" for each row execute function cb_private.touch_record();
create trigger touch_record before update on public."lead" for each row execute function cb_private.touch_record();
create trigger touch_record before update on public."collection_signature" for each row execute function cb_private.touch_record();
create trigger touch_record before update on public."email_template" for each row execute function cb_private.touch_record();
create trigger touch_record before update on public."sales_pipeline" for each row execute function cb_private.touch_record();
create trigger touch_record before update on public."nurture_sequence" for each row execute function cb_private.touch_record();
create trigger touch_record before update on public."cover_spec" for each row execute function cb_private.touch_record();
create trigger touch_record before update on public."message_log" for each row execute function cb_private.touch_record();
create trigger touch_record before update on public."portal_message" for each row execute function cb_private.touch_record();
create trigger touch_record before update on public."credit_note" for each row execute function cb_private.touch_record();
create trigger touch_record before update on public."contract" for each row execute function cb_private.touch_record();
create trigger touch_record before update on public."company_settings" for each row execute function cb_private.touch_record();
create trigger touch_record before update on public."resource_document" for each row execute function cb_private.touch_record();
create trigger touch_record before update on public."service" for each row execute function cb_private.touch_record();
create trigger touch_record before update on public."submission" for each row execute function cb_private.touch_record();
create trigger touch_record before update on public."contact" for each row execute function cb_private.touch_record();
create trigger touch_record before update on public."recurring_invoice" for each row execute function cb_private.touch_record();

-- Create an unprivileged profile. Staff roles can only be assigned by an administrator.
create or replace function cb_private.new_auth_user() returns trigger language plpgsql security definer set search_path = '' as $$
begin
 insert into public."user" (id, data, created_by) values (new.id::text, jsonb_build_object('email',new.email,'full_name',coalesce(new.raw_user_meta_data->>'full_name',''),'role','client'),new.email);
 return new;
end;
$$;
revoke all on function cb_private.new_auth_user() from public;
create trigger cb_new_auth_user after insert on auth.users for each row execute function cb_private.new_auth_user();

-- Public settings have an explicit column allowlist. OAuth secrets and private settings never leave this function.
create or replace function cb_private.public_settings(entity_table text) returns setof jsonb language plpgsql stable security definer set search_path = '' as $$
begin
 if entity_table not in ('company_settings','app_settings') then return; end if;
 return query execute format('select jsonb_build_object(''id'', id, ''created_date'', created_date, ''updated_date'', updated_date, ''created_by'', null, ''data'', (select coalesce(jsonb_object_agg(key,value),''{}''::jsonb) from jsonb_each(data) where key = any($1))) from public.%I',entity_table)
 using array['setting_key','company_name','email','phone','physical_address','website','logo_url','brand_color_primary','brand_color_secondary','quote_validity_days','quote_terms','invoice_terms','signature_label','business_hours','whatsapp_number'];
end;
$$;
revoke all on function cb_private.public_settings(text) from public;
grant execute on function cb_private.public_settings(text) to anon,authenticated,service_role;

create or replace function public.cb_matches(doc jsonb, criteria jsonb) returns boolean language plpgsql immutable set search_path = '' as $$
declare k text; expected jsonb; actual jsonb; op text; operand jsonb;
begin
 if criteria is null or criteria = '{}'::jsonb then return true; end if;
 for k, expected in select * from jsonb_each(criteria) loop
  if k = '$or' then
   if not exists(select 1 from jsonb_array_elements(expected) x where public.cb_matches(doc,x)) then return false; end if;
  elsif k = '$and' then
   if exists(select 1 from jsonb_array_elements(expected) x where not public.cb_matches(doc,x)) then return false; end if;
  else
   actual = doc->k;
   if jsonb_typeof(expected) = 'array' then
    if not exists(select 1 from jsonb_array_elements(expected) x where x = actual) then return false; end if;
   elsif jsonb_typeof(expected) = 'object' and exists(select 1 from jsonb_object_keys(expected) x where x like '$%') then
    for op, operand in select * from jsonb_each(expected) loop
     case op
      when '$options' then null;
      when '$exists' then if (doc ? k) <> (operand = 'true'::jsonb) then return false; end if;
      when '$eq' then if actual is distinct from operand then return false; end if;
      when '$ne' then if actual is not distinct from operand then return false; end if;
      when '$gt' then if actual is null or not (actual > operand) then return false; end if;
      when '$gte' then if actual is null or not (actual >= operand) then return false; end if;
      when '$lt' then if actual is null or not (actual < operand) then return false; end if;
      when '$lte' then if actual is null or not (actual <= operand) then return false; end if;
      when '$in' then if not exists(select 1 from jsonb_array_elements(operand) x where x = actual) then return false; end if;
      when '$nin' then if exists(select 1 from jsonb_array_elements(operand) x where x = actual) then return false; end if;
      when '$regex' then
       if length(operand #>> '{}') > 200 then raise exception 'Pattern too long'; end if;
       if expected->>'$options' like '%i%' then
        if actual is null or not ((actual #>> '{}') ~* (operand #>> '{}')) then return false; end if;
       else
        if actual is null or not ((actual #>> '{}') ~ (operand #>> '{}')) then return false; end if;
       end if;
      else raise exception 'Unsupported filter operator: %', op;
     end case;
    end loop;
   elsif expected = 'null'::jsonb then
    if actual is not null and actual <> 'null'::jsonb then return false; end if;
   elsif actual is distinct from expected then return false;
   end if;
  end if;
 end loop;
 return true;
end;
$$;
revoke all on function public.cb_matches(jsonb,jsonb) from public;
grant execute on function public.cb_matches(jsonb,jsonb) to anon,authenticated,service_role;
grant select on cb_private.entity_registry to anon,authenticated,service_role;

-- Security invoker: the caller's table grants and RLS apply to every result.
create or replace function public.cb_list(entity_table text, query_filter jsonb default '{}', sort_field text default '-created_date', page_size integer default 500, page_offset integer default 0) returns setof jsonb language plpgsql stable security invoker set search_path = '' set statement_timeout = '5s' as $$
declare sort_key text; direction text; stmt text;
begin
 if not exists(select 1 from cb_private.entity_registry where table_name=entity_table) then raise exception 'Unknown entity'; end if;
 sort_key = ltrim(sort_field,'-+'); direction = case when left(sort_field,1)='-' then 'desc' else 'asc' end;
 if sort_key !~ '^[A-Za-z_][A-Za-z_0-9]*$' then raise exception 'Invalid sort field'; end if;
 if entity_table in ('company_settings','app_settings') and current_user <> 'service_role' and not (select cb_private.is_staff()) then
  return query select value from cb_private.public_settings(entity_table) value where public.cb_matches(value->'data', query_filter) limit least(greatest(page_size,0),500) offset greatest(page_offset,0);
  return;
 end if;
 stmt = format('select to_jsonb(t) from public.%I t where public.cb_matches(t.data || jsonb_build_object(''id'',t.id,''created_date'',t.created_date,''updated_date'',t.updated_date,''created_by'',t.created_by),$1) order by %s %s nulls last, t.id limit $2 offset $3',entity_table,
 case when sort_key in ('id','created_date','updated_date','created_by') then format('t.%I',sort_key) else format('t.data->%L',sort_key) end,direction);
 return query execute stmt using query_filter,least(greatest(page_size,0),500),greatest(page_offset,0);
end;
$$;
revoke all on function public.cb_list(text,jsonb,text,integer,integer) from public;
grant execute on function public.cb_list(text,jsonb,text,integer,integer) to anon,authenticated,service_role;

-- Atomic JSON merge prevents simultaneous field updates from overwriting each other.
create or replace function public.cb_patch(entity_table text,row_id text,patch jsonb) returns jsonb language plpgsql security invoker set search_path = '' as $$
declare result jsonb;
begin
 if not exists(select 1 from cb_private.entity_registry where table_name=entity_table) then raise exception 'Unknown entity'; end if;
 if jsonb_typeof(patch) <> 'object' then raise exception 'Patch must be an object'; end if;
 execute format('update public.%I t set data=t.data || $1 where id=$2 returning to_jsonb(t)',entity_table) into result using patch - array['id','created_date','updated_date','created_by'],row_id;
 if result is null then raise exception 'Record not found or access denied'; end if;
 return result;
end;
$$;
revoke all on function public.cb_patch(text,text,jsonb) from public;
grant execute on function public.cb_patch(text,text,jsonb) to authenticated,service_role;

insert into storage.buckets(id,name,public,file_size_limit) values ('documents','documents',false,52428800) on conflict(id) do nothing;
create policy cb_document_read on storage.objects for select to authenticated using (bucket_id='documents' and ((select cb_private.is_staff()) or (storage.foldername(name))[1]=(select auth.uid())::text));
create policy cb_document_insert on storage.objects for insert to authenticated with check (bucket_id='documents' and ((select cb_private.is_staff()) or (storage.foldername(name))[1]=(select auth.uid())::text));
create policy cb_document_update on storage.objects for update to authenticated using (bucket_id='documents' and (select cb_private.is_staff())) with check (bucket_id='documents' and (select cb_private.is_staff()));
create policy cb_document_delete on storage.objects for delete to authenticated using (bucket_id='documents' and (select cb_private.is_staff()));
-- Private capability links allow existing document URLs to remain stable while the bucket stays private.
create table cb_private.file_links (capability text primary key, object_path text not null unique, created_at timestamptz not null default now());
create table cb_private.request_limits (fingerprint text not null, window_start timestamptz not null, count integer not null, primary key(fingerprint,window_start));
alter table cb_private.file_links enable row level security;
alter table cb_private.request_limits enable row level security;
alter table cb_private.entity_registry enable row level security;
create policy registry_read on cb_private.entity_registry for select to anon,authenticated,service_role using (true);
create or replace function public.cb_file_register(object_path text, capability text) returns void language plpgsql security definer set search_path = '' as $$
begin insert into cb_private.file_links values (capability,object_path,now()); end;
$$;
create or replace function public.cb_file_lookup(capability text) returns text language sql stable security definer set search_path = '' as $$
 select object_path from cb_private.file_links where capability=$1;
$$;
create or replace function public.cb_rate_limit(fingerprint text, maximum integer) returns boolean language plpgsql security definer set search_path = '' as $$
declare current_count integer;
begin
 insert into cb_private.request_limits as limits values($1,date_trunc('minute',now()),1)
 on conflict on constraint request_limits_pkey do update set count=limits.count+1 returning count into current_count;
 delete from cb_private.request_limits where window_start < now()-interval '1 hour';
 return current_count <= $2;
end;
$$;
revoke all on function public.cb_file_register(text,text),public.cb_file_lookup(text),public.cb_rate_limit(text,integer) from public,anon,authenticated;
grant execute on function public.cb_file_register(text,text),public.cb_file_lookup(text),public.cb_rate_limit(text,integer) to service_role;

do $$ begin
 if exists(select 1 from pg_publication where pubname='supabase_realtime') then
   alter publication supabase_realtime add table public.submission;
 end if;
end $$;
commit;
