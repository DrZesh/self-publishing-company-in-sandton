-- Legacy default pipeline template IDs use string keys such as tpl_standard.
-- Keep compatibility while custom templates continue to use UUID primary keys.

alter table public.sales_pipelines
  alter column template_id type text
  using template_id::text;
