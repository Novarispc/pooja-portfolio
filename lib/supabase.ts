import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error(
    "Missing Supabase environment variables. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY."
  );
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

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
      .from("portfolio-files")
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
    } = supabase.storage.from("portfolio-files").getPublicUrl(data.path);

    return { url: publicUrl, name: file.name };
  } catch (err) {
    console.error("Upload exception:", err);
    return null;
  }
}

/**
 * Delete a file from Supabase Storage.
 */
export async function deleteFile(filePath: string): Promise<boolean> {
  try {
    const { error } = await supabase.storage
      .from("portfolio-files")
      .remove([filePath]);

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
