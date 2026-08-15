import { NextRequest, NextResponse } from "next/server";
import { uploadFile, deleteFile, pathFromPublicUrl } from "@/lib/supabase";

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

/** Admin-only: deletes a previously uploaded file. Body: { url: string }. Safe to call even if the file is already gone. */
export async function DELETE(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const url = body?.url as string | undefined;
  if (!url) {
    return NextResponse.json({ error: "No url provided" }, { status: 400 });
  }

  const path = pathFromPublicUrl(url);
  if (!path) {
    // Not a file from our bucket — nothing to clean up, not an error.
    return NextResponse.json({ ok: true, skipped: true });
  }

  const ok = await deleteFile(path);
  return NextResponse.json({ ok });
}
