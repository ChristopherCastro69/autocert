import { SupabaseClient } from "@supabase/supabase-js";

const BUCKET = "autocert";

export async function uploadFile(
  supabase: SupabaseClient,
  bucket: string,
  path: string,
  file: Blob | File,
  options?: { contentType?: string; upsert?: boolean }
): Promise<string> {
  const { error } = await supabase.storage.from(bucket).upload(path, file, {
    contentType: options?.contentType,
    upsert: options?.upsert ?? false,
  });

  if (error) {
    throw new Error(`Upload failed: ${error.message}`);
  }

  return path;
}

export function getPublicUrl(supabase: SupabaseClient, path: string): string {
  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

export async function listFiles(
  supabase: SupabaseClient,
  folder: string
): Promise<string[]> {
  const { data, error } = await supabase.storage.from(BUCKET).list(folder);

  if (error) {
    throw new Error(`Failed to list files: ${error.message}`);
  }

  return (data ?? []).map((file) => `${folder}/${file.name}`);
}

export async function deleteFile(
  supabase: SupabaseClient,
  path: string
): Promise<void> {
  const { error } = await supabase.storage.from(BUCKET).remove([path]);

  if (error) {
    throw new Error(`Failed to delete file: ${error.message}`);
  }
}

export function dataUrlToBlob(dataUrl: string): Blob {
  const [header, base64Data] = dataUrl.split(",");
  const mimeMatch = header.match(/:(.*?);/);
  const mimeType = mimeMatch ? mimeMatch[1] : "application/octet-stream";

  const byteString = atob(base64Data);
  const bytes = new Uint8Array(byteString.length);
  for (let i = 0; i < byteString.length; i++) {
    bytes[i] = byteString.charCodeAt(i);
  }

  return new Blob([bytes], { type: mimeType });
}
