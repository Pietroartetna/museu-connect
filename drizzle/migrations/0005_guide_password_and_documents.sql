CREATE TABLE public.guide_access (
  id boolean PRIMARY KEY DEFAULT true CHECK (id),
  password text,
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.guide_access TO authenticated;
GRANT ALL ON public.guide_access TO service_role;
ALTER TABLE public.guide_access ENABLE ROW LEVEL SECURITY;
CREATE POLICY guide_access_admin ON public.guide_access FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'::public.app_role)) WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));

-- Visitors no longer read stops directly: they go through the password-checking function.
DROP POLICY guide_stops_read ON public.guide_stops;
CREATE POLICY guide_stops_read ON public.guide_stops FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'::public.app_role));
DROP POLICY guide_files_read ON public.guide_files;
CREATE POLICY guide_files_read ON public.guide_files FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE OR REPLACE FUNCTION public.guide_unlock(_password text)
RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
DECLARE pw text;
BEGIN
  SELECT password INTO pw FROM public.guide_access WHERE id;
  IF pw IS NOT NULL AND pw <> '' AND coalesce(_password,'') <> pw THEN
    RETURN jsonb_build_object('ok', false, 'stops', '[]'::jsonb);
  END IF;
  RETURN jsonb_build_object('ok', true, 'stops', coalesce((
    SELECT jsonb_agg(jsonb_build_object('id',s.id,'number',s.number,'title',s.title,'subtitle',s.subtitle,'description',s.description,'room_id',s.room_id,'published',s.published,
      'guide_files', coalesce((SELECT jsonb_agg(jsonb_build_object('id',f.id,'stop_id',f.stop_id,'kind',f.kind,'language',f.language,'label',f.label,'file_url',f.file_url,'position',f.position) ORDER BY f.position) FROM public.guide_files f WHERE f.stop_id = s.id), '[]'::jsonb)) ORDER BY s.number)
    FROM public.guide_stops s WHERE s.published), '[]'::jsonb));
END $$;
REVOKE ALL ON FUNCTION public.guide_unlock(text) FROM public;
GRANT EXECUTE ON FUNCTION public.guide_unlock(text) TO anon, authenticated;

CREATE TABLE public.public_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  category text NOT NULL DEFAULT 'Documenti',
  file_url text,
  position integer NOT NULL DEFAULT 0,
  published boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.public_documents TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.public_documents TO authenticated;
GRANT ALL ON public.public_documents TO service_role;
ALTER TABLE public.public_documents ENABLE ROW LEVEL SECURITY;
CREATE POLICY public_documents_read ON public.public_documents FOR SELECT TO anon, authenticated USING (published OR public.has_role(auth.uid(), 'admin'::public.app_role));
CREATE POLICY public_documents_admin ON public.public_documents FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'::public.app_role)) WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE POLICY public_documents_media_read ON storage.objects FOR SELECT TO anon, authenticated USING (
  bucket_id = 'museo' AND name LIKE 'documenti/%' AND EXISTS (
    SELECT 1 FROM public.public_documents d WHERE d.published AND d.file_url = 'museo/' || storage.objects.name));