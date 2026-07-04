-- Creative Books SA: Project workflow hardening

-- Transitional document actions may still attempt to move a contact to
-- Payment Pending immediately after an accepted quote has created a project.
-- Keep the CRM pipeline anchored at Project Started once project tracking exists.
create or replace function public.preserve_project_started_pipeline_stage()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.pipeline_stage = 'Payment Pending'
     and old.pipeline_stage = 'Project Started'
     and exists (
       select 1
       from public.projects p
       where p.contact_id = new.id
         and p.stage not in ('Delivered', 'Completed')
     ) then
    new.pipeline_stage = 'Project Started';
  end if;

  return new;
end;
$$;

revoke all on function public.preserve_project_started_pipeline_stage() from public;

drop trigger if exists contacts_preserve_project_started_stage on public.contacts;
create trigger contacts_preserve_project_started_stage
before update of pipeline_stage on public.contacts
for each row execute procedure public.preserve_project_started_pipeline_stage();

-- Transitional related modules still store project UUIDs as text until their
-- own tables are fully normalized. Index those links so project lookups remain fast.
create index if not exists invoices_project_text_idx
  on public.invoices(project_id) where project_id is not null;

create index if not exists payments_project_text_idx
  on public.payments(project_id) where project_id is not null;

create index if not exists documents_project_text_idx
  on public.documents(project_id) where project_id is not null;

create index if not exists esignature_project_text_idx
  on public.e_signature_requests(project_id) where project_id is not null;

-- Remove transitional markers generated before the Projects module existed.
delete from public.activity_logs
where action = 'project_workflow_pending';
