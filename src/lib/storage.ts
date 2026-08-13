import { supabase } from "@/integrations/supabase/client";

export type BucketName = "museo" | "pagamenti";

const MAX_DIMENSION = 2000;
const WEBP_QUALITY = 0.86;

/**
 * Converts an image to WebP (resized to a max of 2000px) directly in the browser,
 * so uploads are much lighter without a visible loss of quality.
 * Falls back to the original file when conversion isn't possible.
 */
export async function optimizeImage(file: File): Promise<File> {
  if (typeof document === "undefined") return file;
  if (!file.type.startsWith("image/")) return file;
  if (file.type === "image/gif" || file.type === "image/webp") return file;

  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, MAX_DIMENSION / Math.max(bitmap.width, bitmap.height));
    const width = Math.round(bitmap.width * scale);
    const height = Math.round(bitmap.height * scale);

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return file;
    ctx.drawImage(bitmap, 0, 0, width, height);
    bitmap.close?.();

    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, "image/webp", WEBP_QUALITY),
    );
    if (!blob || blob.size >= file.size) return file;

    const name = file.name.replace(/\.[^.]+$/, "") + ".webp";
    return new File([blob], name, { type: "image/webp" });
  } catch {
    return file;
  }
}

export async function uploadFile(
  bucket: BucketName,
  path: string,
  file: File,
  options?: { optimize?: boolean },
): Promise<string> {
  const finalFile = options?.optimize === false ? file : await optimizeImage(file);
  const ext = finalFile.name.split(".").pop() ?? "jpg";
  const fullPath = `${path}-${Date.now()}.${ext}`;
  const { error } = await supabase.storage.from(bucket).upload(fullPath, finalFile, {
    upsert: true,
    contentType: finalFile.type,
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
