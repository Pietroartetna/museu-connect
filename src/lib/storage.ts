import { supabase } from "@/integrations/supabase/client";

export type BucketName = "museo" | "pagamenti";

export async function uploadFile(
  bucket: BucketName,
  path: string,
  file: File,
): Promise<string> {
  const ext = file.name.split(".").pop() ?? "jpg";
  const fullPath = `${path}-${Date.now()}.${ext}`;
  const { error } = await supabase.storage.from(bucket).upload(fullPath, file, {
    upsert: true,
    contentType: file.type,
  });
  if (error) throw error;
  return `${bucket}/${fullPath}`;
}

/** Turns a stored "bucket/path" reference into a temporary readable URL. */
export async function resolveUrl(reference: string | null): Promise<string | null> {
  if (!reference) return null;
  if (reference.startsWith("http")) return reference;
  const [bucket, ...rest] = reference.split("/");
  const path = rest.join("/");
  if (!bucket || !path) return null;
  const { data, error } = await supabase.storage.from(bucket).createSignedUrl(path, 60 * 60);
  if (error) return null;
  return data.signedUrl;
}
