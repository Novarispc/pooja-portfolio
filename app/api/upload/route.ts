import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import crypto from "crypto";
import { PERSISTENCE_UNAVAILABLE_MESSAGE } from "@/lib/content";

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");
const MAX_BYTES = 15 * 1024 * 1024; // 15MB

/** Admin-only: multipart/form-data upload. Field name "file". Returns { url, name, type }. */
export async function POST(req: NextRequest) {
  if (process.env.VERCEL) {
    return NextResponse.json(
      { error: PERSISTENCE_UNAVAILABLE_MESSAGE },
      { status: 503 }
    );
  }

  const form = await req.formData().catch(() => null);
  const file = form?.get("file");

  if (!file || !(file instanceof File)) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: "File exceeds 15MB limit" }, { status: 413 });
  }

  await fs.mkdir(UPLOAD_DIR, { recursive: true });

  const ext = path.extname(file.name) || "";
  const safeName = crypto.randomBytes(8).toString("hex") + ext;
  const buf = Buffer.from(await file.arrayBuffer());
  await fs.writeFile(path.join(UPLOAD_DIR, safeName), buf);

  return NextResponse.json({
    url: `/uploads/${safeName}`,
    name: file.name,
    type: file.type || "application/octet-stream",
  });
}
