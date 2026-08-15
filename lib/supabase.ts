import { createClient } from "@supabase/supabase-js";
import { supabaseAdmin } from "./supabaseAdmin";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error(
    "Missing Supabase environment variables. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY."
  );
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const BUCKET = "portfolio-files";

/**
 * Upload a file to Supabase Storage (portfolio-files bucket).
 * Returns public URL if successful, null if error.
 */
export async function uploadFile(
  file: File,
  folder: string
): Promise<{ url: string; name: string } | null> {
  try {
    const timestamp = Date.now();
    const safeName = `${timestamp}-${file.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`;
    const filePath = `${folder}/${safeName}`;

    const { data, error } = await supabase.storage
      .from(BUCKET)
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (error) {
      console.error("Supabase upload error:", error);
      return null;
    }

    // Get public URL
    const {
      data: { publicUrl },
    } = supabase.storage.from(BUCKET).getPublicUrl(data.path);

    return { url: publicUrl, name: file.name };
  } catch (err) {
    console.error("Upload exception:", err);
    return null;
  }
}

/**
 * Extracts the storage path from a public URL previously returned by
 * uploadFile, e.g. ".../object/public/portfolio-files/general/123-x.pdf"
 * -> "general/123-x.pdf". Returns null if the URL isn't from this bucket
 * (nothing to delete).
 */
export function pathFromPublicUrl(url: string): string | null {
  const marker = `/object/public/${BUCKET}/`;
  const idx = url.indexOf(marker);
  if (idx === -1) return null;
  const path = url.slice(idx + marker.length).split("?")[0];
  return path ? decodeURIComponent(path) : null;
}

/**
 * Delete a file from Supabase Storage. Uses the service-role client (not
 * the anon key) so this works regardless of bucket RLS policies — deletion
 * only ever happens from admin-gated server routes.
 */
export async function deleteFile(path: string): Promise<boolean> {
  try {
    const { error } = await supabaseAdmin.storage.from(BUCKET).remove([path]);
    if (error) {
      console.error("Supabase delete error:", error);
      return false;
    }
    return true;
  } catch (err) {
    console.error("Delete exception:", err);
    return false;
  }
}
