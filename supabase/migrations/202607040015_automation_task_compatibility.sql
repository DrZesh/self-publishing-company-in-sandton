-- Creative Books SA: Automation and task compatibility

create or replace function public.normalize_automation_task_status()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.status = 'Open' then
    new.status = 'Pending';
  end if;
  return new;
end;
$$;

revoke all on function public.normalize_automation_task_status() from public;

drop trigger if exists tasks_normalize_automation_status on public.tasks;
create trigger tasks_normalize_automation_status
before insert or update of status on public.tasks
for each row execute procedure public.normalize_automation_task_status();
