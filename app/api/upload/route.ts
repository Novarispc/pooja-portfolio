import { NextRequest, NextResponse } from "next/server";
import { uploadFile } from "@/lib/supabase";

const MAX_BYTES = 15 * 1024 * 1024; // 15MB

/** Admin-only: multipart/form-data upload to Supabase Storage. Field name "file". Returns { url, name, type }. */
export async function POST(req: NextRequest) {
  const form = await req.formData().catch(() => null);
  const file = form?.get("file") as File | null;
  const folder = (form?.get("folder") as string) || "general";

  if (!file || !(file instanceof File)) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: "File exceeds 15MB limit" }, { status: 413 });
  }

  const result = await uploadFile(file, folder);

  if (!result) {
    return NextResponse.json(
      { error: "Upload failed. Check Supabase configuration." },
      { status: 500 }
    );
  }

  return NextResponse.json({
    url: result.url,
    name: result.name,
    type: file.type || "application/octet-stream",
  });
}
