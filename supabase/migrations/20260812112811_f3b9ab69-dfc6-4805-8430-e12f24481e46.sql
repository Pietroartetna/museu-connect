ALTER TABLE public.galleries ADD COLUMN IF NOT EXISTS category text NOT NULL DEFAULT 'Generale';
ALTER TABLE public.gallery_images ADD COLUMN IF NOT EXISTS media_type text NOT NULL DEFAULT 'image';
CREATE INDEX IF NOT EXISTS galleries_category_idx ON public.galleries (category);