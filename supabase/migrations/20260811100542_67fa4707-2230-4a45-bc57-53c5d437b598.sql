CREATE TABLE public.entity_images (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  entity_type text NOT NULL CHECK (entity_type IN ('room','artist','event')),
  entity_id uuid NOT NULL,
  image_url text NOT NULL,
  caption text,
  position integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE INDEX entity_images_lookup ON public.entity_images (entity_type, entity_id, position);

GRANT SELECT ON public.entity_images TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.entity_images TO authenticated;
GRANT ALL ON public.entity_images TO service_role;

ALTER TABLE public.entity_images ENABLE ROW LEVEL SECURITY;

CREATE POLICY entity_images_read ON public.entity_images FOR SELECT USING (true);
CREATE POLICY entity_images_admin_write ON public.entity_images FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));