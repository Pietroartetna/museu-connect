DROP POLICY guide_files_require_password_session ON storage.objects;
CREATE POLICY guide_files_require_password_session ON storage.objects AS RESTRICTIVE FOR SELECT TO anon USING (bucket_id <> 'museo' OR name NOT LIKE 'guida/%');
CREATE POLICY guide_files_admin_storage_access ON storage.objects AS RESTRICTIVE FOR SELECT TO authenticated USING (bucket_id <> 'museo' OR name NOT LIKE 'guida/%' OR public.has_role(auth.uid(),'admin'));
