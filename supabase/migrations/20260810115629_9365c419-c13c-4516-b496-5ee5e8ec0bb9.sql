CREATE POLICY "museo_read_auth" ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'museo');
CREATE POLICY "museo_admin_insert" ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'museo' AND public.has_role(auth.uid(),'admin'));
CREATE POLICY "museo_admin_update" ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'museo' AND public.has_role(auth.uid(),'admin'));
CREATE POLICY "museo_admin_delete" ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'museo' AND public.has_role(auth.uid(),'admin'));

CREATE POLICY "avatar_self_insert" ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'museo' AND name LIKE 'avatars/' || auth.uid()::text || '%');
CREATE POLICY "avatar_self_update" ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'museo' AND name LIKE 'avatars/' || auth.uid()::text || '%');

CREATE POLICY "pagamenti_own_read" ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'pagamenti' AND (name LIKE auth.uid()::text || '%' OR public.has_role(auth.uid(),'admin')));
CREATE POLICY "pagamenti_own_insert" ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'pagamenti' AND name LIKE auth.uid()::text || '%');
CREATE POLICY "pagamenti_own_update" ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'pagamenti' AND name LIKE auth.uid()::text || '%');