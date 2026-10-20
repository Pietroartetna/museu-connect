CREATE POLICY "museum_published_media_read" ON storage.objects FOR SELECT TO anon USING (
 bucket_id = 'museo' AND name NOT LIKE 'avatars/%' AND (
 EXISTS (SELECT 1 FROM public.rooms WHERE image_url = 'museo/' || storage.objects.name)
 OR EXISTS (SELECT 1 FROM public.artists WHERE image_url = 'museo/' || storage.objects.name)
 OR EXISTS (SELECT 1 FROM public.events WHERE image_url = 'museo/' || storage.objects.name)
 OR EXISTS (SELECT 1 FROM public.galleries WHERE cover_url = 'museo/' || storage.objects.name)
 OR EXISTS (SELECT 1 FROM public.gallery_images WHERE image_url = 'museo/' || storage.objects.name)
 OR EXISTS (SELECT 1 FROM public.entity_images WHERE image_url = 'museo/' || storage.objects.name)
 ));