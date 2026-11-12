CREATE TABLE public.guide_stops (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  number integer NOT NULL UNIQUE,
  title text NOT NULL,
  subtitle text,
  description text,
  room_id uuid REFERENCES public.rooms(id) ON DELETE SET NULL,
  published boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.guide_stops TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.guide_stops TO authenticated;
GRANT ALL ON public.guide_stops TO service_role;
ALTER TABLE public.guide_stops ENABLE ROW LEVEL SECURITY;
CREATE POLICY guide_stops_read ON public.guide_stops FOR SELECT TO anon, authenticated USING (published OR public.has_role(auth.uid(), 'admin'::public.app_role));
CREATE POLICY guide_stops_admin ON public.guide_stops FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'::public.app_role)) WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));
CREATE TRIGGER guide_stops_updated_at BEFORE UPDATE ON public.guide_stops FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.guide_files (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  stop_id uuid NOT NULL REFERENCES public.guide_stops(id) ON DELETE CASCADE,
  kind text NOT NULL CHECK (kind IN ('audio','pdf','image')),
  language text NOT NULL DEFAULT 'it' CHECK (language IN ('it','en','all')),
  label text,
  file_url text NOT NULL,
  position integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.guide_files TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.guide_files TO authenticated;
GRANT ALL ON public.guide_files TO service_role;
ALTER TABLE public.guide_files ENABLE ROW LEVEL SECURITY;
CREATE POLICY guide_files_read ON public.guide_files FOR SELECT TO anon, authenticated USING (EXISTS (SELECT 1 FROM public.guide_stops s WHERE s.id = stop_id AND (s.published OR public.has_role(auth.uid(), 'admin'::public.app_role))));
CREATE POLICY guide_files_admin ON public.guide_files FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'::public.app_role)) WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE POLICY guide_published_media_read ON storage.objects FOR SELECT TO anon, authenticated USING (
  bucket_id = 'museo' AND name LIKE 'guida/%' AND EXISTS (
    SELECT 1 FROM public.guide_files f JOIN public.guide_stops s ON s.id = f.stop_id
    WHERE s.published AND f.file_url = 'museo/' || storage.objects.name));