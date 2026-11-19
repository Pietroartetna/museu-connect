ALTER TABLE public.guide_access ADD COLUMN access_version uuid NOT NULL DEFAULT gen_random_uuid();
ALTER TABLE public.guide_sessions ADD COLUMN access_version uuid;
COMMENT ON COLUMN public.guide_sessions.password_hash IS 'DEPRECATED: replaced by the password access version; new sessions use an empty value.';
CREATE FUNCTION public.version_guide_password() RETURNS trigger LANGUAGE plpgsql SET search_path = '' AS $$
BEGIN
 IF NEW.password IS DISTINCT FROM OLD.password THEN NEW.access_version := pg_catalog.gen_random_uuid();
 ELSE NEW.access_version := OLD.access_version;
 END IF;
 RETURN NEW;
END $$;
CREATE TRIGGER guide_password_version BEFORE UPDATE ON public.guide_access FOR EACH ROW EXECUTE FUNCTION public.version_guide_password();
CREATE OR REPLACE FUNCTION public.guide_open(_password text)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, extensions AS $$
DECLARE result jsonb; token text; current_pw text; version uuid;
BEGIN
 SELECT NULLIF(password, ''), access_version INTO current_pw, version FROM public.guide_access WHERE id FOR SHARE;
 IF current_pw IS NULL OR _password IS DISTINCT FROM current_pw THEN
   RETURN jsonb_build_object('ok', false, 'stops', '[]'::jsonb);
 END IF;
 result := public.guide_unlock(_password);
 token := encode(extensions.gen_random_bytes(32), 'hex');
 INSERT INTO public.guide_sessions(token_hash,password_hash,access_version)
 VALUES (encode(extensions.digest(token,'sha256'),'hex'), '', version);
 RETURN result || jsonb_build_object('token', token);
END $$;
CREATE OR REPLACE FUNCTION public.guide_file_access(_token text, _file_id uuid)
RETURNS text LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public, extensions AS $$
 SELECT f.file_url FROM public.guide_files f
 JOIN public.guide_stops s ON s.id=f.stop_id AND s.published
 WHERE f.id=_file_id AND EXISTS (
 SELECT 1 FROM public.guide_sessions gs JOIN public.guide_access ga ON ga.id AND ga.access_version=gs.access_version
 WHERE gs.token_hash=encode(extensions.digest(_token,'sha256'),'hex') AND gs.expires_at>now() AND nullif(ga.password,'') IS NOT NULL
 );
$$;