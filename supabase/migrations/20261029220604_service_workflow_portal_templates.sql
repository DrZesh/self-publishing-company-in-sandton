BEGIN;
-- Archive the old state before mapping it. Migration changes never enqueue client mail.
DROP TRIGGER cb_project_update_notification ON public.cb_projects;
ALTER TABLE public.cb_projects ADD COLUMN legacy_production jsonb,ADD COLUMN portal_token uuid NOT NULL DEFAULT gen_random_uuid(),ADD COLUMN book_title text,ADD COLUMN assigned_user_id uuid;
CREATE UNIQUE INDEX cb_projects_portal_token_idx ON public.cb_projects(portal_token);
UPDATE public.cb_projects SET legacy_production=jsonb_build_object('checklist',checklist,'current_stage',current_stage,'production_version',production_version),book_title=coalesce((SELECT nullif(ct.data->>'book_title','') FROM public.cb_clients c JOIN public.contact ct ON ct.id=c.crm_client_id WHERE c.id=client_id),nullif(title,(SELECT number FROM public.cb_quotes WHERE id=quote_id))),production_version=production_version+1;
CREATE TABLE public.cb_service_email_templates(id uuid PRIMARY KEY DEFAULT gen_random_uuid(),service text NOT NULL REFERENCES public.cb_production_services(key),stage_index integer NOT NULL,subject text NOT NULL,body text NOT NULL,requires_review boolean NOT NULL DEFAULT false,version integer NOT NULL DEFAULT 0,updated_at timestamptz NOT NULL DEFAULT now(),UNIQUE(service,stage_index),CHECK(length(subject) BETWEEN 1 AND 200),CHECK(length(body) BETWEEN 1 AND 16000));
CREATE TABLE public.cb_project_service_progress(id uuid PRIMARY KEY DEFAULT gen_random_uuid(),project_id uuid NOT NULL REFERENCES public.cb_projects(id),service text NOT NULL REFERENCES public.cb_production_services(key),current_index integer,completed integer[] NOT NULL DEFAULT '{}',skipped integer[] NOT NULL DEFAULT '{}',version integer NOT NULL DEFAULT 0,review_instructions text NOT NULL DEFAULT '',review_resource_ids uuid[] NOT NULL DEFAULT '{}',track_changes boolean NOT NULL DEFAULT false,editor_name text NOT NULL DEFAULT 'Mac',review_open boolean NOT NULL DEFAULT false,review_submitted_at timestamptz,client_approved_at timestamptz,UNIQUE(project_id,service));
CREATE TABLE public.cb_service_resources(id uuid PRIMARY KEY DEFAULT gen_random_uuid(),project_id uuid NOT NULL REFERENCES public.cb_projects(id),service text NOT NULL,purpose text NOT NULL CHECK(purpose IN ('review','delivery')),name text NOT NULL,object_path text,secure_url text,link_verified_at timestamptz,released_at timestamptz,download_requested_at timestamptz,created_at timestamptz NOT NULL DEFAULT now(),CHECK((object_path IS NULL)<>(secure_url IS NULL)),CHECK(length(name) BETWEEN 1 AND 200));
CREATE INDEX cb_service_resources_project_idx ON public.cb_service_resources(project_id,service,purpose);
CREATE TABLE public.cb_service_deliveries(id uuid PRIMARY KEY,project_id uuid NOT NULL REFERENCES public.cb_projects(id),service text NOT NULL,resource_ids uuid[] NOT NULL,instructions text NOT NULL,recipient text NOT NULL,status text NOT NULL DEFAULT 'queued' CHECK(status IN ('queued','sent')),sent_at timestamptz,created_at timestamptz NOT NULL DEFAULT now());
CREATE INDEX cb_service_deliveries_project_idx ON public.cb_service_deliveries(project_id,service);
CREATE TABLE public.cb_service_feedback(id uuid PRIMARY KEY DEFAULT gen_random_uuid(),project_id uuid NOT NULL REFERENCES public.cb_projects(id),service text NOT NULL,message text NOT NULL,document_link text,created_at timestamptz NOT NULL DEFAULT now(),CHECK(length(message) BETWEEN 1 AND 8000));
CREATE INDEX cb_service_feedback_project_idx ON public.cb_service_feedback(project_id,created_at DESC);
CREATE TABLE public.cb_production_tasks(id uuid PRIMARY KEY DEFAULT gen_random_uuid(),project_id uuid NOT NULL REFERENCES public.cb_projects(id),service text NOT NULL,kind text NOT NULL CHECK(kind IN ('delivery','balance_invoice')),legacy_task_id text NOT NULL UNIQUE,status text NOT NULL DEFAULT 'pending',UNIQUE(project_id,service,kind));
DO $$ DECLARE t text; BEGIN FOREACH t IN ARRAY ARRAY['cb_service_email_templates','cb_project_service_progress','cb_service_resources','cb_service_deliveries','cb_service_feedback','cb_production_tasks'] LOOP EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY',t);EXECUTE format('REVOKE ALL ON public.%I FROM PUBLIC,anon,authenticated',t);EXECUTE format('GRANT SELECT ON public.%I TO authenticated',t);EXECUTE format('GRANT ALL ON public.%I TO service_role',t);EXECUTE format('CREATE POLICY %I ON public.%I FOR SELECT TO authenticated USING ((SELECT cb_private.is_staff()))',t||'_staff',t);END LOOP;END $$;
ALTER TABLE public.cb_workflow_notifications DROP CONSTRAINT cb_workflow_notifications_kind_check,ADD CONSTRAINT cb_workflow_notifications_kind_check CHECK(kind IN ('acceptance_admin','stage_client','editor_feedback','delivery_client'));
ALTER TABLE public.cb_workflow_notifications DROP CONSTRAINT cb_workflow_notifications_status_check,ADD CONSTRAINT cb_workflow_notifications_status_check CHECK(status IN ('pending','processing','sent','failed','blocked'));
UPDATE public.cb_production_services SET stages='["Setting Up Files for Print", "Printing Inners", "Printing The Covers", "Book Binding", "Book Trimming", "Quality Check", "Packaging", "Ready for Delivery/Collection"]'::jsonb WHERE key='printing';
INSERT INTO public.cb_service_email_templates(service,stage_index,subject,body,requires_review) VALUES('printing',0,'Your book is moving into print preparation','Hi {{client_first_name}},

Exciting news! We are now setting up the files for {{book_title}} for print. We are checking the page size, margins, layout and cover alignment to make sure everything is correctly prepared before printing begins.

Kind regards,
Creative Books SA',false);
INSERT INTO public.cb_service_email_templates(service,stage_index,subject,body,requires_review) VALUES('printing',1,'The inside pages of your book are being printed','Hi {{client_first_name}},

Exciting news! We are now printing the inside pages of {{book_title}}. Your words are coming to life on paper as we check print clarity, page order and consistency throughout the run.

Kind regards,
Creative Books SA',false);
INSERT INTO public.cb_service_email_templates(service,stage_index,subject,body,requires_review) VALUES('printing',2,'Your book covers are being printed','Hi {{client_first_name}},

Great news! We are now printing the covers for {{book_title}}. This stage brings your cover design to life, with attention to colour, clarity and alignment before the covers move on to finishing and binding.

Kind regards,
Creative Books SA',false);
INSERT INTO public.cb_service_email_templates(service,stage_index,subject,body,requires_review) VALUES('printing',3,'Your book is taking shape','Hi {{client_first_name}},

Exciting news! {{book_title}} has reached the binding stage. We are bringing the printed pages and covers together, checking that the pages are secure and the covers sit correctly.

Kind regards,
Creative Books SA',false);
INSERT INTO public.cb_service_email_templates(service,stage_index,subject,body,requires_review) VALUES('printing',4,'Your books are getting their final shape','Hi {{client_first_name}},

Great news! We are now trimming the copies of {{book_title}} to their final size. This gives each book clean, even edges and a neat finish before quality checks.

Kind regards,
Creative Books SA',false);
INSERT INTO public.cb_service_email_templates(service,stage_index,subject,body,requires_review) VALUES('printing',5,'Your books have reached quality check','Hi {{client_first_name}},

Exciting news! {{book_title}} is now at quality check. We are inspecting print clarity, page order, binding, trimming and the overall finish to check that your books meet our production standards before packaging.

Kind regards,
Creative Books SA',false);
INSERT INTO public.cb_service_email_templates(service,stage_index,subject,body,requires_review) VALUES('printing',6,'Your books are being packed','Hi {{client_first_name}},

Great news! We are now packaging {{book_title}}. We are counting and securely packing your books to help protect them during handling and prepare your order for delivery or collection.

Kind regards,
Creative Books SA',false);
INSERT INTO public.cb_service_email_templates(service,stage_index,subject,body,requires_review) VALUES('printing',7,'Your books are ready for delivery or collection','Hi {{client_first_name}},

Exciting news! Your copies of {{book_title}} are packed and ready for delivery or collection.

{{printing_balance_paragraph}}

Kind regards,
Creative Books SA',false);
UPDATE public.cb_production_services SET stages='["First Concept in Progress", "Finalising First Concept", "First Concept Complete", "Second Concept in Progress", "Finalising Cover Concepts", "Cover Designs Ready for Delivery"]'::jsonb WHERE key='cover';
INSERT INTO public.cb_service_email_templates(service,stage_index,subject,body,requires_review) VALUES('cover',0,'Your first book cover concept is underway','Hi {{client_first_name}},

Exciting news! We have started the first cover concept for {{book_title}}. We are exploring imagery, typography and colour to create a visual direction that reflects your book and its intended readers.

Kind regards,
Creative Books SA',false);
INSERT INTO public.cb_service_email_templates(service,stage_index,subject,body,requires_review) VALUES('cover',1,'Your first cover concept is taking shape','Hi {{client_first_name}},

Great news! We are putting the finishing touches on the first cover concept for {{book_title}}. We are refining the layout, title placement and visual details so the design comes together clearly.

Kind regards,
Creative Books SA',false);
INSERT INTO public.cb_service_email_templates(service,stage_index,subject,body,requires_review) VALUES('cover',2,'Your first cover concept is complete','Hi {{client_first_name}},

Exciting news! The first cover concept for {{book_title}} is complete. We will now move on to the second concept, giving you another creative option to consider.

We will send the concepts together once they are ready for your review.

Kind regards,
Creative Books SA',false);
INSERT INTO public.cb_service_email_templates(service,stage_index,subject,body,requires_review) VALUES('cover',3,'Your second book cover concept is underway','Hi {{client_first_name}},

Great news! We have started the second cover concept for {{book_title}}. We are developing a different visual approach so you can compare two distinct interpretations of your book.

Kind regards,
Creative Books SA',false);
INSERT INTO public.cb_service_email_templates(service,stage_index,subject,body,requires_review) VALUES('cover',4,'We are finalising your book cover concepts','Hi {{client_first_name}},

Exciting news! We are finalising the cover concepts for {{book_title}}. We are reviewing the typography, spacing, imagery and overall presentation before preparing both designs for your review.

Kind regards,
Creative Books SA',false);
INSERT INTO public.cb_service_email_templates(service,stage_index,subject,body,requires_review) VALUES('cover',5,'Your book cover concepts are ready','Hi {{client_first_name}},

Exciting news! Your cover concepts for {{book_title}} are ready for you to see.

Look out for our next email, which will include your designs and instructions for sharing your feedback and choosing your preferred direction. We look forward to hearing what you think!

Kind regards,
Creative Books SA',false);
UPDATE public.cb_production_services SET stages='["Typesetting Started", "Typesetting Halfway Complete", "Typesetting Complete, Ready for Delivery"]'::jsonb WHERE key='typesetting';
INSERT INTO public.cb_service_email_templates(service,stage_index,subject,body,requires_review) VALUES('typesetting',0,'Typesetting has started on your book','Hi {{client_first_name}},

Exciting news! We have started typesetting {{book_title}}. We are arranging your manuscript into its book layout, setting up the fonts, chapter headings, spacing and page structure for a clear, comfortable reading experience.

Kind regards,
Creative Books SA',false);
INSERT INTO public.cb_service_email_templates(service,stage_index,subject,body,requires_review) VALUES('typesetting',1,'Your book’s typesetting is halfway complete','Hi {{client_first_name}},

Great news! We are halfway through typesetting {{book_title}}. Your book’s layout is taking shape as we work through the remaining pages and maintain consistent formatting throughout.

Kind regards,
Creative Books SA',false);
INSERT INTO public.cb_service_email_templates(service,stage_index,subject,body,requires_review) VALUES('typesetting',2,'Your typeset book is ready for review','Hi {{client_first_name}},

Exciting news! We have completed the typesetting of {{book_title}} and checked the layout for consistency, spacing and page flow.

Look out for our next email, which will include your typeset file and instructions for reviewing it and sharing any corrections.

Kind regards,
Creative Books SA',false);
UPDATE public.cb_production_services SET stages='["Manuscript Review and Preparation", "First Editorial Pass Started", "First Editorial Pass Halfway Complete", "First Editorial Pass Complete", "Awaiting Author Review", "Author Feedback Received", "Second Editorial Pass", "Final Editorial Checks", "Editing Complete, Ready for Delivery"]'::jsonb WHERE key='editing';
INSERT INTO public.cb_service_email_templates(service,stage_index,subject,body,requires_review) VALUES('editing',0,'Your manuscript is entering the editing process','Hi {{client_first_name}},

Exciting news! We are preparing {{book_title}} for editing. We are reviewing the manuscript and your instructions so we can approach the work with a clear understanding of your writing and the agreed editing requirements.

Kind regards,
Creative Books SA',false);
INSERT INTO public.cb_service_email_templates(service,stage_index,subject,body,requires_review) VALUES('editing',1,'Editing has started on your book','Hi {{client_first_name}},

Exciting news! The first editorial pass on {{book_title}} is underway. We are working through the manuscript to improve clarity, grammar, punctuation and consistency while preserving your voice and meaning.

Kind regards,
Creative Books SA',false);
INSERT INTO public.cb_service_email_templates(service,stage_index,subject,body,requires_review) VALUES('editing',2,'We are halfway through your first editorial pass','Hi {{client_first_name}},

Great news! We are halfway through the first editorial pass on {{book_title}}. We are continuing through the remaining chapters, refining the writing and noting any points that may need your input.

Kind regards,
Creative Books SA',false);
INSERT INTO public.cb_service_email_templates(service,stage_index,subject,body,requires_review) VALUES('editing',3,'Your first editorial pass is complete','Hi {{client_first_name}},

Exciting news! We have completed the first editorial pass on {{book_title}}. We are now preparing the edited manuscript and any editorial notes for your review.

Look out for our next email with your file and guidance on the next step.

Kind regards,
Creative Books SA',false);
INSERT INTO public.cb_service_email_templates(service,stage_index,subject,body,requires_review) VALUES('editing',4,'Your edited manuscript is ready for your input','Hi {{client_first_name}},

Exciting news! The first edited version of {{book_title}} is now ready for your review.

Please use the secure review link below to review the edits and respond to any comments or questions. Keep your feedback in one document where possible, then return it to us so we can continue with the next agreed stage.

{{review_instructions}}

{{review_link}}

Kind regards,
Creative Books SA',true);
INSERT INTO public.cb_service_email_templates(service,stage_index,subject,body,requires_review) VALUES('editing',5,'We have received your manuscript feedback','Hi {{client_first_name}},

Great news! We have received your feedback on {{book_title}}. We are reviewing your responses and requested adjustments before continuing with the next agreed editorial pass.

We will contact you if anything needs clarification.

Kind regards,
Creative Books SA',false);
INSERT INTO public.cb_service_email_templates(service,stage_index,subject,body,requires_review) VALUES('editing',6,'Your book’s second editorial pass is underway','Hi {{client_first_name}},

Exciting news! We have started the second editorial pass on {{book_title}}. We are working through your feedback, refining the agreed changes and checking that revisions remain consistent with the rest of the manuscript.

Kind regards,
Creative Books SA',false);
INSERT INTO public.cb_service_email_templates(service,stage_index,subject,body,requires_review) VALUES('editing',7,'Your manuscript has reached final editorial checks','Hi {{client_first_name}},

Great news! {{book_title}} has reached the final editorial checks. We are reviewing spelling, punctuation, consistency and any outstanding editorial queries before preparing your files for delivery.

Kind regards,
Creative Books SA',false);
INSERT INTO public.cb_service_email_templates(service,stage_index,subject,body,requires_review) VALUES('editing',8,'Editing is complete on your book','Hi {{client_first_name}},

Exciting news! We have completed the agreed editing work on {{book_title}} and are preparing your files for delivery.

Look out for our next email, which will include your edited manuscript and any accompanying notes, along with guidance on the next step.

Kind regards,
Creative Books SA',false);
-- Old labels are mapped by meaning, never by a coincidentally matching numeric index.
CREATE TABLE cb_billing_private.stage_mapping(service text,old_label text,stage_index integer,PRIMARY KEY(service,old_label));
REVOKE ALL ON cb_billing_private.stage_mapping FROM PUBLIC,anon,authenticated;
INSERT INTO cb_billing_private.stage_mapping VALUES
('printing','Print files approved',0),('printing','Printing',1),('printing','Binding',3),('printing','Quality check',5),('printing','Delivery',7),
('editing','Manuscript received',0),('editing','Editorial assessment',0),('editing','First editorial pass',1),('editing','Author revisions',4),('editing','Second editorial pass',6),('editing','Proofreading and final checks',7),('editing','Edited manuscript approved',8),
('typesetting','Manuscript and design brief received',0),('typesetting','Page design and sample layout',0),('typesetting','Interior typesetting',0),('typesetting','First proof sent to author',2),('typesetting','Author corrections',2),('typesetting','Final layout checks',2),('typesetting','Print-ready interior approved',2),
('cover','Cover brief and references received',0),('cover','Cover concepts in progress',0),('cover','Concepts sent to author',5),('cover','Selected concept refined',5),('cover','Spine and back cover prepared',5),('cover','Final cover proof approved',5),('cover','Print-ready cover exported',5);
UPDATE public.cb_projects p SET checklist=(SELECT jsonb_agg(jsonb_build_object('key',s.key||':'||(st.ordinality-1)::text,'service',s.key,'label',st.value,'done',coalesce((SELECT bool_and((o->>'done')::boolean) FROM jsonb_array_elements(p.legacy_production->'checklist') o JOIN cb_billing_private.stage_mapping m ON m.service=s.key AND m.old_label=o->>'label' WHERE m.stage_index=st.ordinality-1),false)) ORDER BY s.sort_order,st.ordinality) FROM public.cb_production_services s CROSS JOIN LATERAL jsonb_array_elements_text(s.stages) WITH ORDINALITY st WHERE p.services?s.key),current_stage=(SELECT m.service||':'||m.stage_index::text FROM jsonb_array_elements(p.legacy_production->'checklist') o JOIN cb_billing_private.stage_mapping m ON m.service=o->>'service' AND m.old_label=o->>'label' WHERE o->>'key'=p.legacy_production->>'current_stage' LIMIT 1);
INSERT INTO public.cb_project_service_progress(project_id,service,current_index,completed) SELECT p.id,s.key,(SELECT split_part(p.current_stage,':',2)::integer WHERE split_part(p.current_stage,':',1)=s.key),coalesce((SELECT array_agg(split_part(c->>'key',':',2)::integer ORDER BY split_part(c->>'key',':',2)::integer) FROM jsonb_array_elements(p.checklist) c WHERE c->>'service'=s.key AND (c->>'done')::boolean),'{}'::integer[]) FROM public.cb_projects p JOIN public.cb_production_services s ON p.services?s.key;
UPDATE public.cb_projects p SET assigned_user_id=(SELECT e.actor_id FROM public.cb_document_emails e WHERE e.quote_id=p.quote_id ORDER BY e.created_at LIMIT 1);

CREATE FUNCTION cb_billing_private.cb_sync_project_services() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$ BEGIN
 INSERT INTO public.cb_project_service_progress(project_id,service) SELECT NEW.id,key FROM public.cb_production_services WHERE NEW.services?key ON CONFLICT(project_id,service) DO NOTHING;RETURN NEW;END $$;
REVOKE ALL ON FUNCTION cb_billing_private.cb_sync_project_services() FROM PUBLIC,anon,authenticated;
CREATE TRIGGER cb_sync_project_services AFTER INSERT OR UPDATE OF services ON public.cb_projects FOR EACH ROW EXECUTE FUNCTION cb_billing_private.cb_sync_project_services();

CREATE FUNCTION cb_billing_private.cb_resource_ids(p_id uuid,p_service text,p_purpose text) RETURNS uuid[] LANGUAGE sql STABLE SET search_path='' AS $$ SELECT coalesce(array_agg(id ORDER BY created_at),'{}'::uuid[]) FROM public.cb_service_resources WHERE project_id=p_id AND service=p_service AND purpose=p_purpose $$;
REVOKE ALL ON FUNCTION cb_billing_private.cb_resource_ids(uuid,text,text) FROM PUBLIC,anon,authenticated;
CREATE FUNCTION cb_billing_private.cb_resources_valid(p_ids uuid[]) RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path='' AS $$
 SELECT cardinality(p_ids)>0 AND NOT EXISTS(SELECT 1 FROM unnest(p_ids) id WHERE NOT EXISTS(SELECT 1 FROM public.cb_service_resources r WHERE r.id=id AND (r.secure_url IS NOT NULL OR EXISTS(SELECT 1 FROM storage.objects o WHERE o.bucket_id='cb-project-deliverables' AND o.name=r.object_path))))
$$;
REVOKE ALL ON FUNCTION cb_billing_private.cb_resources_valid(uuid[]) FROM PUBLIC,anon,authenticated;

CREATE FUNCTION cb_billing_private.cb_service_payload(p_id uuid,p_service text,p_stage integer) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
DECLARE p public.cb_projects;c public.cb_clients;q public.cb_quotes;t public.cb_service_email_templates;g public.cb_project_service_progress;body text;subject text;balance numeric;balance_copy text;link text;ids uuid[];instructions text;
BEGIN
 SELECT * INTO p FROM public.cb_projects WHERE id=p_id;IF p.id IS NULL THEN RAISE EXCEPTION 'Project not found';END IF;SELECT * INTO c FROM public.cb_clients WHERE id=p.client_id;SELECT * INTO q FROM public.cb_quotes WHERE id=p.quote_id;SELECT * INTO t FROM public.cb_service_email_templates WHERE service=p_service AND stage_index=p_stage;SELECT * INTO g FROM public.cb_project_service_progress WHERE project_id=p_id AND service=p_service;
 IF t.id IS NULL THEN RAISE EXCEPTION 'Stage template not found';END IF;
 SELECT greatest(q.total-coalesce(sum(pm.amount) FILTER(WHERE pm.funds_cleared),0),0) INTO balance FROM public.cb_invoices i LEFT JOIN public.cb_payments pm ON pm.invoice_id=i.id WHERE i.quote_id=q.id;
 balance_copy:=CASE WHEN balance>0 THEN 'We will now send you the remaining balance for payment so that you can settle it before collecting your books or having them dispatched by courier. If you require courier delivery, we can now confirm the cost based on the packed order.' ELSE 'Please contact us to arrange collection or courier delivery. If you require courier delivery, we can now confirm the cost based on the packed order.' END;
 link:='https://creativebooks.co.za/portal/p/'||p.portal_token::text;
 ids:=CASE WHEN t.requires_review THEN g.review_resource_ids ELSE '{}'::uuid[] END;
 instructions:=g.review_instructions||CASE WHEN g.track_changes THEN E'\nPlease review the Word Track Changes and comments. The editor name is Mac.' ELSE '' END;
 body:=replace(replace(replace(replace(replace(t.body,'{{client_first_name}}',coalesce(nullif(btrim(c.first_name),''),'there')),'{{book_title}}',coalesce(nullif(btrim(p.book_title),''),'your book')),'{{printing_balance_paragraph}}',balance_copy),'{{review_instructions}}',instructions),'{{review_link}}',link);
 subject:=replace(replace(t.subject,'{{client_first_name}}',coalesce(nullif(btrim(c.first_name),''),'there')),'{{book_title}}',coalesce(nullif(btrim(p.book_title),''),'your book'));
 RETURN jsonb_build_object('client_name',c.display_name,'client_email',c.email,'project_title',coalesce(nullif(p.book_title,''),'your book'),'quote_number',q.number,'service',p_service,'stage_index',p_stage,'stage',(SELECT stages->>p_stage FROM public.cb_production_services WHERE key=p_service),'template_subject',subject,'template_body',body,'template_version',t.version,'resource_ids',to_jsonb(ids),'requires_review',t.requires_review,'review_instructions',instructions,'portal_url',link,'outstanding_balance',balance,'changed_at',now());
END $$;
REVOKE ALL ON FUNCTION cb_billing_private.cb_service_payload(uuid,text,integer) FROM PUBLIC,anon,authenticated;

CREATE FUNCTION cb_billing_private.cb_production_task(p_id uuid,p_service text,p_kind text) RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
DECLARE p public.cb_projects;tid text;owner_email text;title text;
BEGIN
 SELECT * INTO p FROM public.cb_projects WHERE id=p_id;
 IF EXISTS(SELECT 1 FROM public.cb_production_tasks WHERE project_id=p_id AND service=p_service AND kind=p_kind) THEN RETURN; END IF;
 SELECT a.email INTO owner_email FROM auth.users a JOIN public."user" u ON u.id=a.id::text WHERE a.id=p.assigned_user_id AND u.data->>'role' IN ('admin','super_user','standard_user');
 title:=CASE WHEN p_kind='balance_invoice' THEN 'Send remaining-balance invoice' ELSE 'Send '||p_service||' delivery email with agreed files and review instructions' END||': '||coalesce(nullif(p.book_title,''),p.title);
 INSERT INTO public.task(data) VALUES(jsonb_build_object('title',title,'description','Production is ready. Verify the agreed deliverables and send the appropriate email. Progress updates do not deliver files.','status','Pending','priority','High','assigned_to',coalesce(owner_email,'info@creativebooks.co.za'),'related_entity_type','Project','related_entity_id',p.id::text,'action_url','/admin/billing/projects/'||p.id::text)) RETURNING id INTO tid;
 INSERT INTO public.cb_production_tasks(project_id,service,kind,legacy_task_id) VALUES(p_id,p_service,p_kind,tid);
END $$;
REVOKE ALL ON FUNCTION cb_billing_private.cb_production_task(uuid,text,text) FROM PUBLIC,anon,authenticated;

CREATE FUNCTION cb_billing_private.cb_queue_service_stage(p_id uuid,p_service text,p_stage integer,p_event text,p_job uuid DEFAULT gen_random_uuid()) RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
DECLARE p public.cb_projects;payload jsonb;blocked boolean;last_stage integer;
BEGIN
 SELECT * INTO p FROM public.cb_projects WHERE id=p_id;payload:=cb_billing_private.cb_service_payload(p_id,p_service,p_stage);
 blocked:=(payload->>'requires_review')::boolean AND (NOT cb_billing_private.cb_resources_valid(ARRAY(SELECT jsonb_array_elements_text(payload->'resource_ids')::uuid)) OR btrim(payload->>'review_instructions')='');
 INSERT INTO public.cb_workflow_notifications(id,event_key,kind,quote_id,project_id,payload,status,last_error) VALUES(p_job,p_event,'stage_client',p.quote_id,p.id,payload,CASE WHEN blocked THEN 'blocked' ELSE 'pending' END,CASE WHEN blocked THEN 'Pending: add the correct review file or secure link and review instructions.' END) ON CONFLICT(event_key) DO NOTHING;
 IF NOT blocked AND (payload->>'requires_review')::boolean THEN UPDATE public.cb_service_resources SET released_at=coalesce(released_at,now()) WHERE id IN (SELECT jsonb_array_elements_text(payload->'resource_ids')::uuid);UPDATE public.cb_project_service_progress SET review_open=true WHERE project_id=p_id AND service=p_service;END IF;
 SELECT jsonb_array_length(stages)-1 INTO last_stage FROM public.cb_production_services WHERE key=p_service;
 IF p_stage=last_stage AND p_service IN ('editing','cover','typesetting') THEN PERFORM cb_billing_private.cb_production_task(p_id,p_service,'delivery');END IF;
 IF p_service='printing' AND p_stage=last_stage AND (payload->>'outstanding_balance')::numeric>0 THEN PERFORM cb_billing_private.cb_production_task(p_id,p_service,'balance_invoice');END IF;
 PERFORM cb_billing_private.cb_log(p.quote_id,'service_stage',p_service||': '||(payload->>'stage')||CASE WHEN blocked THEN '. Notification pending review materials.' ELSE '. Client notification queued.' END);
 RETURN p_job;
END $$;
REVOKE ALL ON FUNCTION cb_billing_private.cb_queue_service_stage(uuid,text,integer,text,uuid) FROM PUBLIC,anon,authenticated;

CREATE FUNCTION cb_billing_private.cb_service_stage(p_id uuid,p_service text,p_index integer,p_action text,p_version integer) RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
DECLARE p public.cb_projects;g public.cb_project_service_progress;size integer;next_index integer;changed boolean:=false;list jsonb;
BEGIN
 PERFORM cb_billing_private.require_staff();SELECT * INTO p FROM public.cb_projects WHERE id=p_id FOR UPDATE;
 IF NOT FOUND OR NOT p.services?p_service OR p.status='closed' THEN RAISE EXCEPTION 'Open project and selected service required';END IF;
 SELECT * INTO g FROM public.cb_project_service_progress WHERE project_id=p_id AND service=p_service FOR UPDATE;SELECT jsonb_array_length(stages) INTO size FROM public.cb_production_services WHERE key=p_service;
 IF g.id IS NULL THEN RAISE EXCEPTION 'Service progress not found';END IF;
 IF g.version<>p_version THEN RAISE EXCEPTION 'Service progress changed. Reload before updating.';END IF;
 IF p_index<0 OR p_index>=size OR p_action NOT IN ('stage','complete','reopen','skip','unskip') THEN RAISE EXCEPTION 'Invalid stage action';END IF;
 IF p_action IN ('stage','complete','reopen') AND p.status='on_hold' THEN RAISE EXCEPTION 'The deposit must clear before production starts';END IF;
 next_index:=g.current_index;
 IF p_action='stage' THEN
  IF p_index=ANY(g.skipped) THEN RAISE EXCEPTION 'Unskip the stage before starting it';END IF;
  IF g.current_index=p_index THEN RETURN;END IF;next_index:=p_index;changed:=true;
 ELSIF p_action='complete' THEN
  IF p_index=ANY(g.skipped) THEN RAISE EXCEPTION 'Unskip this stage before completing it';END IF;
  IF p_index=ANY(g.completed) THEN RETURN;END IF;g.completed:=array_append(g.completed,p_index);
  IF g.current_index=p_index THEN SELECT n INTO next_index FROM generate_series(p_index+1,size-1) n WHERE NOT n=ANY(g.skipped) LIMIT 1;changed:=next_index IS NOT NULL;IF next_index IS NULL THEN next_index:=p_index;END IF;END IF;
 ELSIF p_action='reopen' THEN
  IF NOT p_index=ANY(g.completed) THEN RETURN;END IF;g.completed:=array_remove(g.completed,p_index);next_index:=p_index;changed:=g.current_index IS DISTINCT FROM next_index;
 ELSIF p_action='skip' THEN
  IF p_index=ANY(g.completed) THEN RAISE EXCEPTION 'Completed stages cannot be skipped';END IF;
  IF p_index=ANY(g.skipped) THEN RETURN;END IF;g.skipped:=array_append(g.skipped,p_index);IF next_index=p_index THEN next_index:=NULL;END IF;
 ELSE
  IF NOT p_index=ANY(g.skipped) THEN RETURN;END IF;g.skipped:=array_remove(g.skipped,p_index);
 END IF;
 UPDATE public.cb_project_service_progress SET completed=g.completed,skipped=g.skipped,current_index=next_index,version=version+1 WHERE id=g.id;
 SELECT jsonb_agg(CASE WHEN c->>'service'=p_service THEN c||jsonb_build_object('done',split_part(c->>'key',':',2)::integer=ANY(g.completed),'skipped',split_part(c->>'key',':',2)::integer=ANY(g.skipped)) ELSE c END ORDER BY ordinality) INTO list FROM jsonb_array_elements(p.checklist) WITH ORDINALITY a(c,ordinality);
 UPDATE public.cb_projects SET checklist=list,current_stage=CASE WHEN changed THEN p_service||':'||next_index::text ELSE current_stage END,production_version=production_version+1 WHERE id=p_id;
 IF changed THEN PERFORM cb_billing_private.cb_queue_service_stage(p_id,p_service,next_index,'service:'||g.id::text||':'||(g.version+1)::text);ELSE PERFORM cb_billing_private.cb_log(p.quote_id,'service_checklist',p_service||': '||(SELECT stages->>p_index FROM public.cb_production_services WHERE key=p_service)||': '||p_action);END IF;
END $$;

CREATE OR REPLACE FUNCTION cb_billing_private.cb_set_production_stage(p_id uuid,p_key text,p_complete boolean,p_version integer) RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
DECLARE version integer;v integer;BEGIN
 PERFORM cb_billing_private.require_staff();SELECT production_version INTO version FROM public.cb_projects WHERE id=p_id FOR UPDATE;IF version<>p_version THEN RAISE EXCEPTION 'Project changed. Reload before updating.';END IF;
 SELECT g.version INTO v FROM public.cb_project_service_progress g WHERE project_id=p_id AND service=split_part(p_key,':',1);
 PERFORM cb_billing_private.cb_service_stage(p_id,split_part(p_key,':',1),split_part(p_key,':',2)::integer,CASE WHEN p_complete IS NULL THEN 'stage' WHEN p_complete THEN 'complete' ELSE 'reopen' END,v);
END $$;
-- Only lifecycle changes retain the earlier general project update. Service changes use their exact templates.
CREATE FUNCTION cb_billing_private.cb_lifecycle_update() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
DECLARE c public.cb_clients;q public.cb_quotes;message text;stage text;
BEGIN
 IF NEW.status IS NOT DISTINCT FROM OLD.status THEN RETURN NEW;END IF;
 SELECT * INTO c FROM public.cb_clients WHERE id=NEW.client_id;SELECT * INTO q FROM public.cb_quotes WHERE id=NEW.quote_id;
 IF NEW.status='in_production' THEN stage:='Deposit cleared';message:='Your deposit has cleared. The team will keep you updated as each agreed service progresses.';
 ELSIF NEW.status='closed' THEN stage:='Account settled';message:='Thank you. Your account is settled. Any delivery or collection arrangements will be confirmed separately.';
 ELSE RETURN NEW;END IF;
 INSERT INTO public.cb_workflow_notifications(event_key,kind,quote_id,project_id,payload) VALUES('lifecycle:'||NEW.id::text||':'||NEW.status,'stage_client',NEW.quote_id,NEW.id,jsonb_build_object('client_name',c.display_name,'client_email',c.email,'project_title',coalesce(nullif(NEW.book_title,''),'your book'),'quote_number',q.number,'stage',stage,'message',message,'portal_url','https://creativebooks.co.za/portal/p/'||NEW.portal_token::text,'changed_at',now())) ON CONFLICT(event_key) DO NOTHING;RETURN NEW;
END $$;
REVOKE ALL ON FUNCTION cb_billing_private.cb_lifecycle_update() FROM PUBLIC,anon,authenticated;
CREATE TRIGGER cb_project_lifecycle_notification AFTER UPDATE ON public.cb_projects FOR EACH ROW EXECUTE FUNCTION cb_billing_private.cb_lifecycle_update();

CREATE FUNCTION cb_billing_private.cb_preview_service_email(p_id uuid,p_service text,p_index integer) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$ BEGIN PERFORM cb_billing_private.require_staff();RETURN cb_billing_private.cb_service_payload(p_id,p_service,p_index);END $$;
CREATE FUNCTION cb_billing_private.cb_resend_service_email(p_id uuid,p_service text,p_request uuid) RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
DECLARE g public.cb_project_service_progress;BEGIN
 PERFORM cb_billing_private.require_staff();IF EXISTS(SELECT 1 FROM public.cb_workflow_notifications WHERE id=p_request AND project_id=p_id) THEN RETURN p_request;END IF;
 SELECT * INTO g FROM public.cb_project_service_progress WHERE project_id=p_id AND service=p_service;IF g.current_index IS NULL THEN RAISE EXCEPTION 'Select a current stage before resending';END IF;
 RETURN cb_billing_private.cb_queue_service_stage(p_id,p_service,g.current_index,'resend:'||p_request::text,p_request);
END $$;
CREATE FUNCTION cb_billing_private.cb_save_service_template(p_id uuid,p_subject text,p_body text,p_version integer) RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$ BEGIN
 PERFORM cb_billing_private.require_staff();IF length(btrim(p_subject)) NOT BETWEEN 1 AND 200 OR p_subject~E'[\r\n]' OR length(btrim(p_body)) NOT BETWEEN 1 AND 16000 THEN RAISE EXCEPTION 'Enter a subject and message within the stated limits';END IF;
 IF EXISTS(SELECT 1 FROM regexp_matches(p_subject||p_body,'\{\{([^}]+)\}\}','g') m WHERE m[1] NOT IN ('client_first_name','book_title','printing_balance_paragraph','review_instructions','review_link')) THEN RAISE EXCEPTION 'Unknown template placeholder';END IF;
 UPDATE public.cb_service_email_templates SET subject=p_subject,body=p_body,version=version+1,updated_at=now() WHERE id=p_id AND version=p_version;IF NOT FOUND THEN RAISE EXCEPTION 'Template changed. Reload before saving.';END IF;
END $$;
CREATE FUNCTION cb_billing_private.cb_production_team() RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$ DECLARE result jsonb;BEGIN PERFORM cb_billing_private.require_staff();SELECT coalesce(jsonb_agg(jsonb_build_object('id',a.id,'email',a.email,'name',coalesce(u.data->>'full_name',a.email))),'[]') INTO result FROM public."user" u JOIN auth.users a ON a.id::text=u.id WHERE u.data->>'role' IN ('admin','super_user','standard_user');RETURN result;END $$;
CREATE FUNCTION cb_billing_private.cb_project_details(p_id uuid,p_title text,p_owner uuid) RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$ BEGIN
 PERFORM cb_billing_private.require_staff();IF length(p_title)>500 THEN RAISE EXCEPTION 'Book title is too long';END IF;
 IF p_owner IS NOT NULL AND NOT EXISTS(SELECT 1 FROM public."user" WHERE id=p_owner::text AND data->>'role' IN ('admin','super_user','standard_user')) THEN RAISE EXCEPTION 'Choose a staff member';END IF;
 UPDATE public.cb_projects SET book_title=nullif(btrim(p_title),''),assigned_user_id=p_owner WHERE id=p_id;
 UPDATE public.task SET data=data||jsonb_build_object('assigned_to',coalesce((SELECT email FROM auth.users WHERE id=p_owner),'info@creativebooks.co.za')),updated_date=now() WHERE id IN (SELECT legacy_task_id FROM public.cb_production_tasks WHERE project_id=p_id AND status='pending');
END $$;

CREATE FUNCTION cb_billing_private.cb_add_service_resource(p_id uuid,p_service text,p_purpose text,p_file jsonb) RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$ DECLARE rid uuid;BEGIN
 PERFORM cb_billing_private.require_staff();IF NOT EXISTS(SELECT 1 FROM public.cb_projects WHERE id=p_id AND services?p_service) OR p_purpose NOT IN ('review','delivery') THEN RAISE EXCEPTION 'Select the correct project service and file purpose';END IF;
 IF length(coalesce(p_file->>'name','')) NOT BETWEEN 1 AND 200 OR (p_file->>'name')~'[[:cntrl:]]' THEN RAISE EXCEPTION 'Add a file name';END IF;
 IF p_file->>'path' IS NOT NULL THEN IF NOT EXISTS(SELECT 1 FROM storage.objects WHERE bucket_id='cb-project-deliverables' AND name=p_file->>'path') THEN RAISE EXCEPTION 'Upload the file to private project storage first';END IF;
 ELSE IF coalesce((p_file->>'verified')::boolean,false) IS NOT TRUE THEN RAISE EXCEPTION 'Confirm that the secure link is accessible to the client';END IF;IF coalesce(p_file->>'url','')!~'^https://[^[:space:]<>]+$' OR length(p_file->>'url')>2000 THEN RAISE EXCEPTION 'Enter a valid HTTPS secure link';END IF;END IF;
 INSERT INTO public.cb_service_resources(project_id,service,purpose,name,object_path,secure_url,link_verified_at) VALUES(p_id,p_service,p_purpose,p_file->>'name',p_file->>'path',CASE WHEN p_file->>'path' IS NULL THEN p_file->>'url' END,CASE WHEN p_file->>'url' IS NOT NULL THEN now() END) RETURNING id INTO rid;RETURN rid;
END $$;
CREATE FUNCTION cb_billing_private.cb_save_review_settings(p_id uuid,p_service text,p_instructions text,p_track boolean,p_resources uuid[]) RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$ DECLARE j public.cb_workflow_notifications;v_payload jsonb;BEGIN
 PERFORM cb_billing_private.require_staff();IF length(p_instructions)>8000 THEN RAISE EXCEPTION 'Review instructions are too long';END IF;
 IF p_resources IS NULL OR EXISTS(SELECT 1 FROM unnest(p_resources) rid WHERE NOT EXISTS(SELECT 1 FROM public.cb_service_resources WHERE id=rid AND project_id=p_id AND service=p_service AND purpose='review')) THEN RAISE EXCEPTION 'Select review files for this project and service';END IF;
 UPDATE public.cb_project_service_progress SET review_instructions=p_instructions,review_resource_ids=p_resources,track_changes=p_track,editor_name='Mac' WHERE project_id=p_id AND service=p_service;
 FOR j IN SELECT * FROM public.cb_workflow_notifications WHERE project_id=p_id AND payload->>'service'=p_service AND status='blocked' AND email_message IS NULL AND (payload->>'requires_review')::boolean LOOP
  v_payload:=cb_billing_private.cb_service_payload(p_id,p_service,(j.payload->>'stage_index')::integer);
  IF cb_billing_private.cb_resources_valid(ARRAY(SELECT jsonb_array_elements_text(v_payload->'resource_ids')::uuid)) AND btrim(v_payload->>'review_instructions')<>'' THEN
   UPDATE public.cb_workflow_notifications SET payload=v_payload,status='pending',last_error=NULL,available_at=now(),first_attempt_at=NULL,attempts=0 WHERE id=j.id;
   UPDATE public.cb_service_resources SET released_at=coalesce(released_at,now()) WHERE id IN (SELECT jsonb_array_elements_text(v_payload->'resource_ids')::uuid);
   UPDATE public.cb_project_service_progress SET review_open=true WHERE project_id=p_id AND service=p_service;
  END IF;
 END LOOP;
END $$;

CREATE FUNCTION cb_billing_private.cb_send_service_delivery(p_id uuid,p_service text,p_instructions text,p_request uuid,p_resources uuid[],p_subject text) RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
DECLARE p public.cb_projects;c public.cb_clients;g public.cb_project_service_progress;ids uuid[];last_stage integer;body text;
BEGIN
 PERFORM cb_billing_private.require_staff();IF EXISTS(SELECT 1 FROM public.cb_service_deliveries WHERE id=p_request AND project_id=p_id) THEN RETURN p_request;END IF;
 SELECT * INTO p FROM public.cb_projects WHERE id=p_id FOR UPDATE;SELECT * INTO g FROM public.cb_project_service_progress WHERE project_id=p_id AND service=p_service;SELECT * INTO c FROM public.cb_clients WHERE id=p.client_id;
 SELECT jsonb_array_length(stages)-1 INTO last_stage FROM public.cb_production_services WHERE key=p_service;
 IF p_service NOT IN ('cover','editing','typesetting') OR g.current_index IS DISTINCT FROM last_stage OR p.status='on_hold' THEN RAISE EXCEPTION 'Move the service to its ready-for-delivery stage first';END IF;
 IF length(btrim(p_subject)) NOT BETWEEN 1 AND 200 OR p_subject~E'[\r\n]' THEN RAISE EXCEPTION 'Enter a valid delivery subject';END IF;
 ids:=p_resources;IF ids IS NULL OR EXISTS(SELECT 1 FROM unnest(ids) rid WHERE NOT EXISTS(SELECT 1 FROM public.cb_service_resources WHERE id=rid AND project_id=p_id AND service=p_service AND purpose='delivery')) THEN RAISE EXCEPTION 'Select the agreed files for this delivery';END IF;IF NOT cb_billing_private.cb_resources_valid(ids) OR length(btrim(p_instructions)) NOT BETWEEN 1 AND 8000 THEN RAISE EXCEPTION 'Delivery requires the correct agreed files or secure links and review instructions';END IF;
 INSERT INTO public.cb_service_deliveries(id,project_id,service,resource_ids,instructions,recipient) VALUES(p_request,p_id,p_service,ids,p_instructions,c.email);
 UPDATE public.cb_service_resources SET released_at=coalesce(released_at,now()) WHERE id=ANY(ids);
 body:='Hi '||coalesce(nullif(btrim(c.first_name),''),'there')||E',\n\nYour agreed '||p_service||' files for '||coalesce(nullif(p.book_title,''),'your book')||E' are ready.\n\n'||p_instructions||E'\n\nView your files securely: https://creativebooks.co.za/portal/p/'||p.portal_token::text||E'\n\nKind regards,\nCreative Books SA';
 INSERT INTO public.cb_workflow_notifications(id,event_key,kind,quote_id,project_id,payload) VALUES(p_request,'delivery:'||p_request::text,'delivery_client',p.quote_id,p.id,jsonb_build_object('client_name',c.display_name,'client_email',c.email,'service',p_service,'stage','Delivery email','template_subject',p_subject,'template_body',body,'resource_ids',to_jsonb(ids),'delivery_id',p_request,'portal_url','https://creativebooks.co.za/portal/p/'||p.portal_token::text));
 RETURN p_request;
END $$;
CREATE FUNCTION cb_billing_private.cb_delivery_ack() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$ BEGIN
 IF NEW.kind='delivery_client' AND NEW.status='sent' AND OLD.status<>'sent' THEN
  UPDATE public.cb_service_deliveries SET status='sent',sent_at=NEW.sent_at WHERE id=(NEW.payload->>'delivery_id')::uuid;
  UPDATE public.task SET data=data||jsonb_build_object('status','Done'),updated_date=now() WHERE id IN (SELECT legacy_task_id FROM public.cb_production_tasks WHERE project_id=NEW.project_id AND service=NEW.payload->>'service' AND kind='delivery');
  UPDATE public.cb_production_tasks SET status='completed' WHERE project_id=NEW.project_id AND service=NEW.payload->>'service' AND kind='delivery';
  PERFORM cb_billing_private.cb_log(NEW.quote_id,'delivery','Intentional '||(NEW.payload->>'service')||' delivery email accepted by provider. Client approval remains separate.');
 END IF;RETURN NEW;END $$;
REVOKE ALL ON FUNCTION cb_billing_private.cb_delivery_ack() FROM PUBLIC,anon,authenticated;
CREATE TRIGGER cb_service_delivery_ack AFTER UPDATE ON public.cb_workflow_notifications FOR EACH ROW EXECUTE FUNCTION cb_billing_private.cb_delivery_ack();

CREATE FUNCTION cb_billing_private.cb_project_portal(p_token uuid) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
DECLARE p public.cb_projects;result jsonb;BEGIN
 SELECT * INTO p FROM public.cb_projects WHERE portal_token=p_token;IF NOT FOUND THEN RAISE EXCEPTION 'Invalid project link';END IF;
 SELECT jsonb_build_object('book_title',coalesce(nullif(p.book_title,''),'Your book'),'status',p.status,'services',coalesce((SELECT jsonb_agg(jsonb_build_object('key',s.key,'label',s.label,'stages',s.stages,'current_index',g.current_index,'completed',g.completed,'skipped',g.skipped,'review_open',g.review_open,'client_approved_at',g.client_approved_at,'deliveries',(SELECT coalesce(jsonb_agg(jsonb_build_object('id',d.id,'status',d.status,'sent_at',d.sent_at,'instructions',d.instructions)),'[]') FROM public.cb_service_deliveries d WHERE d.project_id=p.id AND d.service=s.key),'files',(SELECT coalesce(jsonb_agg(jsonb_build_object('id',r.id,'name',r.name,'purpose',r.purpose)),'[]') FROM public.cb_service_resources r WHERE r.project_id=p.id AND r.service=s.key AND r.released_at IS NOT NULL),'feedback',(SELECT coalesce(jsonb_agg(jsonb_build_object('id',f.id,'message',f.message,'created_at',f.created_at)),'[]') FROM public.cb_service_feedback f WHERE f.project_id=p.id AND f.service=s.key)) ORDER BY s.sort_order) FROM public.cb_project_service_progress g JOIN public.cb_production_services s ON s.key=g.service WHERE g.project_id=p.id AND p.services?s.key),'[]')) INTO result;RETURN result;
END $$;
CREATE FUNCTION cb_billing_private.cb_portal_resource(p_token uuid,p_resource uuid) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
DECLARE r public.cb_service_resources;BEGIN
 SELECT r.* INTO r FROM public.cb_service_resources r JOIN public.cb_projects p ON p.id=r.project_id WHERE r.id=p_resource AND p.portal_token=p_token AND r.released_at IS NOT NULL;
 IF NOT FOUND THEN RAISE EXCEPTION 'File is not available for this project';END IF;
 UPDATE public.cb_service_resources SET download_requested_at=now() WHERE id=r.id;
 RETURN jsonb_build_object('name',r.name,'path',r.object_path,'url',r.secure_url);
END $$;
CREATE FUNCTION cb_billing_private.cb_portal_feedback(p_token uuid,p_service text,p_message text,p_link text DEFAULT NULL) RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
DECLARE p public.cb_projects;g public.cb_project_service_progress;fid uuid;recipient text;BEGIN
 SELECT * INTO p FROM public.cb_projects WHERE portal_token=p_token;IF NOT FOUND THEN RAISE EXCEPTION 'Invalid project link';END IF;
 SELECT * INTO g FROM public.cb_project_service_progress WHERE project_id=p.id AND service=p_service FOR UPDATE;
 IF g.id IS NULL OR (NOT g.review_open AND NOT EXISTS(SELECT 1 FROM public.cb_service_deliveries WHERE project_id=p.id AND service=p_service AND status='sent')) THEN RAISE EXCEPTION 'No files have been released for review';END IF;
 IF length(btrim(p_message)) NOT BETWEEN 1 AND 8000 OR (p_link IS NOT NULL AND (p_link!~'^https://[^[:space:]<>]+$' OR length(p_link)>2000)) THEN RAISE EXCEPTION 'Enter your feedback and a valid optional HTTPS document link';END IF;
 IF (SELECT count(*) FROM public.cb_service_feedback WHERE project_id=p.id AND created_at>now()-interval '1 day')>=10 THEN RAISE EXCEPTION 'Please contact our team before submitting more feedback';END IF;
 INSERT INTO public.cb_service_feedback(project_id,service,message,document_link) VALUES(p.id,p_service,p_message,p_link) RETURNING id INTO fid;
 UPDATE public.cb_project_service_progress SET review_submitted_at=now() WHERE id=g.id;
 SELECT a.email INTO recipient FROM auth.users a JOIN public."user" u ON u.id=a.id::text WHERE a.id=p.assigned_user_id AND u.data->>'role' IN ('admin','super_user','standard_user');
 INSERT INTO public.notification(data) VALUES(jsonb_build_object('title','Author feedback received','message',p_service||' feedback has been submitted for '||coalesce(p.book_title,p.title),'type','action_required','priority','high','category','production','is_read',false,'action_url','/admin/billing/projects/'||p.id::text,'assigned_to',recipient));
 INSERT INTO public.cb_workflow_notifications(event_key,kind,quote_id,project_id,payload) VALUES('feedback:'||fid::text,'editor_feedback',p.quote_id,p.id,jsonb_build_object('recipient',coalesce(recipient,'info@creativebooks.co.za'),'project_title',coalesce(p.book_title,p.title),'service',p_service,'feedback_id',fid,'message','Author feedback is available in the CRM. Please review it against the agreed editing scope.','project_id',p.id));
 PERFORM cb_billing_private.cb_log(p.quote_id,'author_feedback',p_service||' author feedback received. Assigned team member notification queued.');RETURN fid;
END $$;
CREATE FUNCTION cb_billing_private.cb_portal_approve(p_token uuid,p_service text) RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
DECLARE p public.cb_projects;BEGIN
 SELECT * INTO p FROM public.cb_projects WHERE portal_token=p_token;IF NOT FOUND OR NOT EXISTS(SELECT 1 FROM public.cb_service_deliveries WHERE project_id=p.id AND service=p_service AND status='sent') THEN RAISE EXCEPTION 'Review delivery is required before recording approval';END IF;
 UPDATE public.cb_project_service_progress SET client_approved_at=now() WHERE project_id=p.id AND service=p_service AND client_approved_at IS NULL;
 IF FOUND THEN PERFORM cb_billing_private.cb_log(p.quote_id,'client_approval',p_service||' review approved by client. Print approval and final artwork release remain separate.');END IF;
END $$;
CREATE FUNCTION cb_billing_private.cb_workflow_resources_ready(p_job uuid) RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$ DECLARE j public.cb_workflow_notifications;ids uuid[];BEGIN
 SELECT * INTO j FROM public.cb_workflow_notifications WHERE id=p_job;IF NOT FOUND THEN RETURN false;END IF;
 IF NOT j.payload?'resource_ids' OR jsonb_array_length(j.payload->'resource_ids')=0 THEN RETURN NOT coalesce((j.payload->>'requires_review')::boolean,false);END IF;
 ids:=ARRAY(SELECT jsonb_array_elements_text(j.payload->'resource_ids')::uuid);RETURN cb_billing_private.cb_resources_valid(ids);
END $$;
-- All new staff RPCs use the same server-side role predicate as the rest of billing.
REVOKE ALL ON FUNCTION cb_billing_private.cb_service_stage(uuid,text,integer,text,integer) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION cb_billing_private.cb_service_stage(uuid,text,integer,text,integer) TO authenticated;
CREATE FUNCTION public.cb_service_stage(p_id uuid,p_service text,p_index integer,p_action text,p_version integer) RETURNS void LANGUAGE sql SECURITY INVOKER SET search_path='' AS $$ SELECT cb_billing_private.cb_service_stage(p_id,p_service,p_index,p_action,p_version) $$;
REVOKE ALL ON FUNCTION public.cb_service_stage(uuid,text,integer,text,integer) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.cb_service_stage(uuid,text,integer,text,integer) TO authenticated;
REVOKE ALL ON FUNCTION cb_billing_private.cb_preview_service_email(uuid,text,integer) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION cb_billing_private.cb_preview_service_email(uuid,text,integer) TO authenticated;
CREATE FUNCTION public.cb_preview_service_email(p_id uuid,p_service text,p_index integer) RETURNS jsonb LANGUAGE sql SECURITY INVOKER SET search_path='' AS $$ SELECT cb_billing_private.cb_preview_service_email(p_id,p_service,p_index) $$;
REVOKE ALL ON FUNCTION public.cb_preview_service_email(uuid,text,integer) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.cb_preview_service_email(uuid,text,integer) TO authenticated;
REVOKE ALL ON FUNCTION cb_billing_private.cb_resend_service_email(uuid,text,uuid) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION cb_billing_private.cb_resend_service_email(uuid,text,uuid) TO authenticated;
CREATE FUNCTION public.cb_resend_service_email(p_id uuid,p_service text,p_request uuid) RETURNS uuid LANGUAGE sql SECURITY INVOKER SET search_path='' AS $$ SELECT cb_billing_private.cb_resend_service_email(p_id,p_service,p_request) $$;
REVOKE ALL ON FUNCTION public.cb_resend_service_email(uuid,text,uuid) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.cb_resend_service_email(uuid,text,uuid) TO authenticated;
REVOKE ALL ON FUNCTION cb_billing_private.cb_save_service_template(uuid,text,text,integer) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION cb_billing_private.cb_save_service_template(uuid,text,text,integer) TO authenticated;
CREATE FUNCTION public.cb_save_service_template(p_id uuid,p_subject text,p_body text,p_version integer) RETURNS void LANGUAGE sql SECURITY INVOKER SET search_path='' AS $$ SELECT cb_billing_private.cb_save_service_template(p_id,p_subject,p_body,p_version) $$;
REVOKE ALL ON FUNCTION public.cb_save_service_template(uuid,text,text,integer) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.cb_save_service_template(uuid,text,text,integer) TO authenticated;
REVOKE ALL ON FUNCTION cb_billing_private.cb_production_team() FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION cb_billing_private.cb_production_team() TO authenticated;
CREATE FUNCTION public.cb_production_team() RETURNS jsonb LANGUAGE sql SECURITY INVOKER SET search_path='' AS $$ SELECT cb_billing_private.cb_production_team() $$;
REVOKE ALL ON FUNCTION public.cb_production_team() FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.cb_production_team() TO authenticated;
REVOKE ALL ON FUNCTION cb_billing_private.cb_project_details(uuid,text,uuid) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION cb_billing_private.cb_project_details(uuid,text,uuid) TO authenticated;
CREATE FUNCTION public.cb_project_details(p_id uuid,p_title text,p_owner uuid) RETURNS void LANGUAGE sql SECURITY INVOKER SET search_path='' AS $$ SELECT cb_billing_private.cb_project_details(p_id,p_title,p_owner) $$;
REVOKE ALL ON FUNCTION public.cb_project_details(uuid,text,uuid) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.cb_project_details(uuid,text,uuid) TO authenticated;
REVOKE ALL ON FUNCTION cb_billing_private.cb_add_service_resource(uuid,text,text,jsonb) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION cb_billing_private.cb_add_service_resource(uuid,text,text,jsonb) TO authenticated;
CREATE FUNCTION public.cb_add_service_resource(p_id uuid,p_service text,p_purpose text,p_file jsonb) RETURNS uuid LANGUAGE sql SECURITY INVOKER SET search_path='' AS $$ SELECT cb_billing_private.cb_add_service_resource(p_id,p_service,p_purpose,p_file) $$;
REVOKE ALL ON FUNCTION public.cb_add_service_resource(uuid,text,text,jsonb) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.cb_add_service_resource(uuid,text,text,jsonb) TO authenticated;
REVOKE ALL ON FUNCTION cb_billing_private.cb_save_review_settings(uuid,text,text,boolean,uuid[]) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION cb_billing_private.cb_save_review_settings(uuid,text,text,boolean,uuid[]) TO authenticated;
CREATE FUNCTION public.cb_save_review_settings(p_id uuid,p_service text,p_instructions text,p_track boolean,p_resources uuid[]) RETURNS void LANGUAGE sql SECURITY INVOKER SET search_path='' AS $$ SELECT cb_billing_private.cb_save_review_settings(p_id,p_service,p_instructions,p_track,p_resources) $$;
REVOKE ALL ON FUNCTION public.cb_save_review_settings(uuid,text,text,boolean,uuid[]) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.cb_save_review_settings(uuid,text,text,boolean,uuid[]) TO authenticated;
REVOKE ALL ON FUNCTION cb_billing_private.cb_send_service_delivery(uuid,text,text,uuid,uuid[],text) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION cb_billing_private.cb_send_service_delivery(uuid,text,text,uuid,uuid[],text) TO authenticated;
CREATE FUNCTION public.cb_send_service_delivery(p_id uuid,p_service text,p_instructions text,p_request uuid,p_resources uuid[],p_subject text) RETURNS uuid LANGUAGE sql SECURITY INVOKER SET search_path='' AS $$ SELECT cb_billing_private.cb_send_service_delivery(p_id,p_service,p_instructions,p_request,p_resources,p_subject) $$;
REVOKE ALL ON FUNCTION public.cb_send_service_delivery(uuid,text,text,uuid,uuid[],text) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.cb_send_service_delivery(uuid,text,text,uuid,uuid[],text) TO authenticated;
REVOKE ALL ON FUNCTION cb_billing_private.cb_project_portal(uuid) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION cb_billing_private.cb_project_portal(uuid) TO anon,authenticated,service_role;
CREATE FUNCTION public.cb_project_portal(p_token uuid) RETURNS jsonb LANGUAGE sql SECURITY INVOKER SET search_path='' AS $$ SELECT cb_billing_private.cb_project_portal(p_token) $$;
REVOKE ALL ON FUNCTION public.cb_project_portal(uuid) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.cb_project_portal(uuid) TO anon,authenticated,service_role;
REVOKE ALL ON FUNCTION cb_billing_private.cb_portal_resource(uuid,uuid) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION cb_billing_private.cb_portal_resource(uuid,uuid) TO anon,authenticated,service_role;
CREATE FUNCTION public.cb_portal_resource(p_token uuid,p_resource uuid) RETURNS jsonb LANGUAGE sql SECURITY INVOKER SET search_path='' AS $$ SELECT cb_billing_private.cb_portal_resource(p_token,p_resource) $$;
REVOKE ALL ON FUNCTION public.cb_portal_resource(uuid,uuid) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.cb_portal_resource(uuid,uuid) TO anon,authenticated,service_role;
REVOKE ALL ON FUNCTION cb_billing_private.cb_portal_feedback(uuid,text,text,text) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION cb_billing_private.cb_portal_feedback(uuid,text,text,text) TO anon,authenticated,service_role;
CREATE FUNCTION public.cb_portal_feedback(p_token uuid,p_service text,p_message text,p_link text) RETURNS uuid LANGUAGE sql SECURITY INVOKER SET search_path='' AS $$ SELECT cb_billing_private.cb_portal_feedback(p_token,p_service,p_message,p_link) $$;
REVOKE ALL ON FUNCTION public.cb_portal_feedback(uuid,text,text,text) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.cb_portal_feedback(uuid,text,text,text) TO anon,authenticated,service_role;
REVOKE ALL ON FUNCTION cb_billing_private.cb_portal_approve(uuid,text) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION cb_billing_private.cb_portal_approve(uuid,text) TO anon,authenticated,service_role;
CREATE FUNCTION public.cb_portal_approve(p_token uuid,p_service text) RETURNS void LANGUAGE sql SECURITY INVOKER SET search_path='' AS $$ SELECT cb_billing_private.cb_portal_approve(p_token,p_service) $$;
REVOKE ALL ON FUNCTION public.cb_portal_approve(uuid,text) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.cb_portal_approve(uuid,text) TO anon,authenticated,service_role;
REVOKE ALL ON FUNCTION cb_billing_private.cb_workflow_resources_ready(uuid) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION cb_billing_private.cb_workflow_resources_ready(uuid) TO service_role;
CREATE FUNCTION public.cb_workflow_resources_ready(p_job uuid) RETURNS boolean LANGUAGE sql SECURITY INVOKER SET search_path='' AS $$ SELECT cb_billing_private.cb_workflow_resources_ready(p_job) $$;
REVOKE ALL ON FUNCTION public.cb_workflow_resources_ready(uuid) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.cb_workflow_resources_ready(uuid) TO service_role;

CREATE FUNCTION cb_billing_private.cb_notification_history() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$ BEGIN
 IF NEW.status IS DISTINCT FROM OLD.status AND NEW.status IN ('sent','failed','blocked') THEN
 PERFORM cb_billing_private.cb_log(NEW.quote_id,'notification_status',coalesce(NEW.payload->>'service',NEW.kind)||' | '||coalesce(NEW.payload->>'stage','Notification')||' | Recipient: '||coalesce(NEW.payload->>'client_email',NEW.payload->>'recipient','Admin team')||' | '||NEW.status||' | '||coalesce(NEW.sent_at,now())::text);END IF;RETURN NEW;
END $$;
REVOKE ALL ON FUNCTION cb_billing_private.cb_notification_history() FROM PUBLIC,anon,authenticated;
CREATE TRIGGER cb_notification_status_history AFTER UPDATE ON public.cb_workflow_notifications FOR EACH ROW EXECUTE FUNCTION cb_billing_private.cb_notification_history();

CREATE FUNCTION cb_billing_private.cb_quote_project_link(p_token uuid) RETURNS text LANGUAGE sql SECURITY DEFINER SET search_path='' AS $$ SELECT 'https://creativebooks.co.za/portal/p/'||p.portal_token::text FROM public.cb_projects p JOIN public.cb_quotes q ON q.id=p.quote_id WHERE q.public_token=p_token AND q.status='accepted' $$;
REVOKE ALL ON FUNCTION cb_billing_private.cb_quote_project_link(uuid) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION cb_billing_private.cb_quote_project_link(uuid) TO anon,authenticated,service_role;
CREATE FUNCTION public.cb_quote_project_link(p_token uuid) RETURNS text LANGUAGE sql SECURITY INVOKER SET search_path='' AS $$ SELECT cb_billing_private.cb_quote_project_link(p_token) $$;
REVOKE ALL ON FUNCTION public.cb_quote_project_link(uuid) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.cb_quote_project_link(uuid) TO anon,authenticated,service_role;
CREATE FUNCTION cb_billing_private.cb_legacy_project_links(p_token text) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$ DECLARE access jsonb;BEGIN
 IF length(coalesce(p_token,'')) NOT BETWEEN 16 AND 256 THEN RAISE EXCEPTION 'Invalid portal access';END IF;
 SELECT data INTO access FROM public.client_portal_access WHERE data->>'access_token'=p_token AND coalesce((data->>'is_active')::boolean,false) AND (data->>'expires_at' IS NULL OR (data->>'expires_at')::timestamptz>now()) LIMIT 1;IF access IS NULL THEN RAISE EXCEPTION 'Invalid portal access';END IF;
 RETURN (SELECT coalesce(jsonb_agg(jsonb_build_object('title',coalesce(nullif(p.book_title,''),'Your book'),'url','https://creativebooks.co.za/portal/p/'||p.portal_token::text)),'[]') FROM public.cb_projects p JOIN public.cb_clients c ON c.id=p.client_id WHERE c.crm_client_id=access->>'contact_id' AND (access->>'project_id' IS NULL OR access->>'project_id'='' OR access->>'project_id'=p.id::text));
END $$;
REVOKE ALL ON FUNCTION cb_billing_private.cb_legacy_project_links(text) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION cb_billing_private.cb_legacy_project_links(text) TO anon,authenticated,service_role;
CREATE FUNCTION public.cb_legacy_project_links(p_token text) RETURNS jsonb LANGUAGE sql SECURITY INVOKER SET search_path='' AS $$ SELECT cb_billing_private.cb_legacy_project_links(p_token) $$;
REVOKE ALL ON FUNCTION public.cb_legacy_project_links(text) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.cb_legacy_project_links(text) TO anon,authenticated,service_role;

INSERT INTO storage.buckets(id,name,public,file_size_limit,allowed_mime_types) VALUES('cb-project-deliverables','cb-project-deliverables',false,52428800,ARRAY['application/pdf','image/png','image/jpeg','application/msword','application/vnd.openxmlformats-officedocument.wordprocessingml.document','text/plain']);
CREATE POLICY cb_project_deliverables_read ON storage.objects FOR SELECT TO authenticated USING(bucket_id='cb-project-deliverables' AND (SELECT cb_private.is_staff()));
CREATE POLICY cb_project_deliverables_upload ON storage.objects FOR INSERT TO authenticated WITH CHECK(bucket_id='cb-project-deliverables' AND (SELECT cb_private.is_staff()));
CREATE OR REPLACE FUNCTION cb_billing_private.cb_initial_project_services() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
DECLARE names text; selected jsonb:='[]';
BEGIN
 SELECT lower(string_agg(name||' '||coalesce(description,''),' ')) INTO names FROM public.cb_quote_items WHERE quote_id=NEW.quote_id;
 IF names~'(edit|proofread)' THEN selected:=selected||'"editing"'::jsonb; END IF;
 IF names~'(typeset|layout|formatting)' THEN selected:=selected||'"typesetting"'::jsonb; END IF;
 IF names~'(cover|artwork)' THEN selected:=selected||'"cover"'::jsonb; END IF;
 IF names~'(print|binding|copies)' OR selected='[]'::jsonb THEN selected:=selected||'"printing"'::jsonb; END IF;
 NEW.book_title:=coalesce((SELECT nullif(ct.data->>'book_title','') FROM public.cb_clients c JOIN public.contact ct ON ct.id=c.crm_client_id WHERE c.id=NEW.client_id),nullif(NEW.title,(SELECT number FROM public.cb_quotes WHERE id=NEW.quote_id)));NEW.assigned_user_id:=coalesce((SELECT actor_id FROM public.cb_document_emails WHERE quote_id=NEW.quote_id ORDER BY created_at LIMIT 1),auth.uid());
 NEW.services:=selected;NEW.checklist:=cb_billing_private.cb_project_checklist(selected);
 NEW.current_stage:=NEW.checklist->0->>'key';RETURN NEW;
END $$;

NOTIFY pgrst,'reload schema';
COMMIT;
