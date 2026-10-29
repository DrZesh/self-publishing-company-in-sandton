BEGIN;
ALTER TABLE public.cb_quotes ADD COLUMN attachments jsonb NOT NULL DEFAULT '[]'::jsonb, ADD COLUMN document_version integer NOT NULL DEFAULT 0;
ALTER TABLE public.cb_invoices ADD COLUMN terms text, ADD COLUMN attachments jsonb NOT NULL DEFAULT '[]'::jsonb, ADD COLUMN document_version integer NOT NULL DEFAULT 0;
ALTER TABLE public.cb_quotes ADD CONSTRAINT cb_quote_attachments_array CHECK(jsonb_typeof(attachments)='array' AND jsonb_array_length(attachments)<=10);
ALTER TABLE public.cb_invoices ADD CONSTRAINT cb_invoice_attachments_array CHECK(jsonb_typeof(attachments)='array' AND jsonb_array_length(attachments)<=10), ADD CONSTRAINT cb_invoice_terms_length CHECK(length(terms)<=30000);
CREATE TABLE public.cb_document_emails (
 id uuid PRIMARY KEY, kind text NOT NULL CHECK(kind IN ('quote','invoice')), document_id uuid NOT NULL,
 quote_id uuid NOT NULL REFERENCES public.cb_quotes(id), actor_id uuid NOT NULL,
 payload_hash text NOT NULL, payload jsonb NOT NULL,
 status text NOT NULL DEFAULT 'pending' CHECK(status IN ('pending','sent','failed')),
 provider_id text, error text, created_at timestamptz NOT NULL DEFAULT now(), sent_at timestamptz
);
CREATE INDEX cb_document_emails_quote_idx ON public.cb_document_emails(quote_id);
ALTER TABLE public.cb_document_emails ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.cb_document_emails FROM PUBLIC,anon,authenticated;
GRANT SELECT ON public.cb_document_emails TO authenticated;
GRANT ALL ON public.cb_document_emails TO service_role;
CREATE POLICY cb_document_emails_staff ON public.cb_document_emails FOR SELECT TO authenticated USING((SELECT cb_private.is_staff()));

CREATE FUNCTION cb_billing_private.cb_save_document_settings(p_kind text,p_id uuid,p_terms text,p_attachments jsonb,p_version integer) RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
DECLARE qid uuid; v integer; f jsonb; total_bytes bigint:=0;
BEGIN
 PERFORM cb_billing_private.require_staff();
 IF p_kind='quote' THEN SELECT quote.id,quote.document_version INTO qid,v FROM public.cb_quotes quote WHERE id=p_id FOR UPDATE;
 ELSIF p_kind='invoice' THEN SELECT inv.quote_id,inv.document_version INTO qid,v FROM public.cb_invoices inv WHERE id=p_id FOR UPDATE;
 ELSE RAISE EXCEPTION 'Invalid document kind'; END IF;
 IF qid IS NULL THEN RAISE EXCEPTION 'Document not found'; END IF;
 IF p_version IS DISTINCT FROM v THEN RAISE EXCEPTION 'Document changed. Reload before saving.'; END IF;
 IF length(p_terms)>30000 THEN RAISE EXCEPTION 'Terms must be 30000 characters or less'; END IF;
 IF p_attachments IS NULL OR jsonb_typeof(p_attachments)<>'array' THEN RAISE EXCEPTION 'Invalid attachments'; END IF;
 IF jsonb_array_length(p_attachments)>10 THEN RAISE EXCEPTION 'Maximum 10 attachments'; END IF;
 FOR f IN SELECT * FROM jsonb_array_elements(p_attachments) LOOP
  IF coalesce(f->>'name','')='' OR length(f->>'name')>200 OR (f->>'name')~'[[:cntrl:]]' OR NOT EXISTS(SELECT 1 FROM storage.objects o WHERE o.bucket_id='cb-billing-attachments' AND o.name=f->>'path') THEN RAISE EXCEPTION 'Attachment not found in private billing storage'; END IF;
  IF (f->>'size')::bigint IS NULL OR (f->>'size')::bigint<0 OR (f->>'size')::bigint>5242880 THEN RAISE EXCEPTION 'Maximum file size is 5 MB'; END IF;
  total_bytes:=total_bytes+(f->>'size')::bigint;
 END LOOP;
 IF total_bytes>12582912 THEN RAISE EXCEPTION 'Attachments must total 12 MB or less'; END IF;
 IF p_kind='quote' THEN UPDATE public.cb_quotes SET attachments=p_attachments,document_version=v+1 WHERE id=p_id;
 ELSE UPDATE public.cb_invoices SET terms=p_terms,attachments=p_attachments,document_version=v+1 WHERE id=p_id; END IF;
 INSERT INTO public.cb_activity(quote_id,action,text) VALUES(qid,'document_settings',p_kind||' terms / attachments updated');
 RETURN jsonb_build_object('document_version',v+1);
END $$;
REVOKE ALL ON FUNCTION cb_billing_private.cb_save_document_settings(text,uuid,text,jsonb,integer) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION cb_billing_private.cb_save_document_settings(text,uuid,text,jsonb,integer) TO authenticated;
CREATE FUNCTION public.cb_save_document_settings(p_kind text,p_id uuid,p_terms text,p_attachments jsonb,p_version integer) RETURNS jsonb LANGUAGE sql SECURITY INVOKER SET search_path='' AS $$ SELECT cb_billing_private.cb_save_document_settings(p_kind,p_id,p_terms,p_attachments,p_version) $$;
REVOKE ALL ON FUNCTION public.cb_save_document_settings(text,uuid,text,jsonb,integer) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.cb_save_document_settings(text,uuid,text,jsonb,integer) TO authenticated;

-- Only the authenticated email backend may acknowledge delivery. It cannot overwrite an accepted/viewed quote.
CREATE FUNCTION cb_billing_private.cb_finish_document_email(p_id uuid,p_provider_id text) RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
DECLARE e public.cb_document_emails; q public.cb_quotes;
BEGIN
 SELECT * INTO e FROM public.cb_document_emails WHERE id=p_id FOR UPDATE;
 IF NOT FOUND THEN RAISE EXCEPTION 'Email attempt not found'; END IF;
 IF e.status='sent' THEN RETURN; END IF;
 IF coalesce(p_provider_id,'')='' THEN RAISE EXCEPTION 'Provider acknowledgement required'; END IF;
 SELECT * INTO q FROM public.cb_quotes WHERE id=e.quote_id FOR UPDATE;
 UPDATE public.cb_document_emails SET status='sent',provider_id=p_provider_id,sent_at=now(),error=NULL WHERE id=p_id;
 IF e.kind='quote' THEN UPDATE public.cb_quotes SET status=CASE WHEN status='draft' THEN 'sent' ELSE status END,sent_at=coalesce(sent_at,now()) WHERE id=e.quote_id; END IF;
 INSERT INTO public.cb_activity(quote_id,action,text) VALUES(e.quote_id,'email_sent',initcap(e.kind)||' email accepted by provider with PDF and supporting attachments');
END $$;
REVOKE ALL ON FUNCTION cb_billing_private.cb_finish_document_email(uuid,text) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION cb_billing_private.cb_finish_document_email(uuid,text) TO service_role;
CREATE FUNCTION public.cb_finish_document_email(p_id uuid,p_provider_id text) RETURNS void LANGUAGE sql SECURITY INVOKER SET search_path='' AS $$ SELECT cb_billing_private.cb_finish_document_email(p_id,p_provider_id) $$;
REVOKE ALL ON FUNCTION public.cb_finish_document_email(uuid,text) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.cb_finish_document_email(uuid,text) TO service_role;

INSERT INTO storage.buckets(id,name,public,file_size_limit,allowed_mime_types) VALUES('cb-billing-attachments','cb-billing-attachments',false,5242880,ARRAY['application/pdf','image/png','image/jpeg','text/plain','application/msword','application/vnd.openxmlformats-officedocument.wordprocessingml.document']);
CREATE POLICY cb_billing_attachments_read ON storage.objects FOR SELECT TO authenticated USING(bucket_id='cb-billing-attachments' AND (SELECT cb_private.is_staff()));
CREATE POLICY cb_billing_attachments_upload ON storage.objects FOR INSERT TO authenticated WITH CHECK(bucket_id='cb-billing-attachments' AND (SELECT cb_private.is_staff()));
NOTIFY pgrst,'reload schema';
COMMIT;
