DROP POLICY IF EXISTS avatar_self_insert ON storage.objects;
DROP POLICY IF EXISTS avatar_self_update ON storage.objects;
DROP POLICY IF EXISTS pagamenti_own_insert ON storage.objects;
DROP POLICY IF EXISTS pagamenti_own_update ON storage.objects;
DROP POLICY IF EXISTS pagamenti_own_read ON storage.objects;
DROP POLICY IF EXISTS museo_read_auth ON storage.objects;

CREATE POLICY avatar_self_insert ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'museo' AND (storage.foldername(name))[1] = 'avatars' AND (storage.foldername(name))[2] = (select auth.uid()::text) AND owner_id = (select auth.uid()::text));
CREATE POLICY avatar_self_update ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'museo' AND (storage.foldername(name))[1] = 'avatars' AND (storage.foldername(name))[2] = (select auth.uid()::text) AND owner_id = (select auth.uid()::text))
WITH CHECK (bucket_id = 'museo' AND (storage.foldername(name))[1] = 'avatars' AND (storage.foldername(name))[2] = (select auth.uid()::text) AND owner_id = (select auth.uid()::text));

CREATE POLICY pagamenti_own_insert ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'pagamenti' AND (storage.foldername(name))[1] = (select auth.uid()::text) AND owner_id = (select auth.uid()::text));
CREATE POLICY pagamenti_own_update ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'pagamenti' AND (storage.foldername(name))[1] = (select auth.uid()::text) AND owner_id = (select auth.uid()::text))
WITH CHECK (bucket_id = 'pagamenti' AND (storage.foldername(name))[1] = (select auth.uid()::text) AND owner_id = (select auth.uid()::text));
CREATE POLICY pagamenti_own_read ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'pagamenti' AND (((storage.foldername(name))[1] = (select auth.uid()::text) AND owner_id = (select auth.uid()::text)) OR public.has_role((select auth.uid()), 'admin'::public.app_role)));

CREATE POLICY museo_read_auth ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'museo' AND (public.has_role((select auth.uid()), 'admin'::public.app_role) OR ((storage.foldername(name))[1] = 'avatars' AND (storage.foldername(name))[2] = (select auth.uid()::text) AND owner_id = (select auth.uid()::text))));

ALTER POLICY museum_published_media_read ON storage.objects TO anon, authenticated;
ALTER POLICY published_cms_media ON storage.objects TO anon, authenticated;