CREATE TABLE public.guide_sessions (
 token_hash text PRIMARY KEY,
 password_hash text NOT NULL,
 expires_at timestamptz NOT NULL DEFAULT (now() + interval '12 hours')
);
GRANT ALL ON public.guide_sessions TO service_role;
ALTER TABLE public.guide_sessions ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.guide_open(_password text)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, extensions AS $$
DECLARE result jsonb; token text; current_pw text;
BEGIN
 result := public.guide_unlock(_password);
 IF NOT coalesce((result->>'ok')::boolean, false) THEN RETURN result; END IF;
 SELECT coalesce(password, '') INTO current_pw FROM public.guide_access WHERE id;
 token := encode(extensions.gen_random_bytes(32), 'hex');
 DELETE FROM public.guide_sessions WHERE expires_at <= now();
 INSERT INTO public.guide_sessions(token_hash,password_hash)
 VALUES (encode(extensions.digest(token,'sha256'),'hex'), encode(extensions.digest(coalesce(current_pw,''),'sha256'),'hex'));
 RETURN result || jsonb_build_object('token', token);
END $$;
REVOKE ALL ON FUNCTION public.guide_open(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.guide_open(text) TO anon, authenticated, service_role;

CREATE OR REPLACE FUNCTION public.guide_file_access(_token text, _file_id uuid)
RETURNS text LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public, extensions AS $$
 SELECT f.file_url FROM public.guide_files f
 JOIN public.guide_stops s ON s.id=f.stop_id AND s.published
 WHERE f.id=_file_id AND EXISTS (
 SELECT 1 FROM public.guide_sessions gs
 WHERE gs.token_hash=encode(extensions.digest(_token,'sha256'),'hex')
 AND gs.expires_at>now()
 AND gs.password_hash=encode(extensions.digest(coalesce((SELECT password FROM public.guide_access WHERE id),''),'sha256'),'hex')
 );
$$;
REVOKE ALL ON FUNCTION public.guide_file_access(text,uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.guide_file_access(text,uuid) TO anon, authenticated, service_role;
DROP POLICY IF EXISTS guide_published_media_read ON storage.objects;
CREATE POLICY guide_files_require_password_session ON storage.objects AS RESTRICTIVE
FOR SELECT TO anon, authenticated
USING (bucket_id <> 'museo' OR name NOT LIKE 'guida/%' OR
 CASE WHEN auth.uid() IS NOT NULL THEN public.has_role(auth.uid(),'admin') ELSE false END);
